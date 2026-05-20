import json
from langchain_core.messages import SystemMessage
from langchain_core.tools import tool
from langchain_openai import ChatOpenAI
from langgraph.graph import StateGraph, MessagesState, START, END
from langgraph.prebuilt import ToolNode, tools_condition
from langgraph.checkpoint.memory import MemorySaver

from ag_ui_langgraph import LangGraphAgent

from ..main import LLM_BASE_URL, LLM_API_KEY, LLM_MODEL, LLM_TEMPERATURE, DOC_MODULES
from ..services.qdrant import qdrant_service

FULL_SYSTEM_PROMPT = (
    "You are an expert MiniLibX documentation assistant for 42 school students. "
    "MiniLibX is a C graphics library for X11 used in the 42 school curriculum. "
    "You help students understand MiniLibX functions, write C graphics code, and debug issues.\n\n"
    f"Available documentation modules: {', '.join(DOC_MODULES)}\n\n"
    "When answering:\n"
    "- Use search_docs to find relevant documentation first\n"
    "- Use get_doc_section for detailed module info\n"
    "- Use show_api_reference to display structured function references\n"
    "- Use show_code_example to show C code examples\n"
    "- Use show_docs_card to highlight specific doc excerpts\n"
    "- Always cite sources with numbered references\n"
    "- Be concise but thorough. Include C code when helpful."
)


@tool
def search_docs(query: str) -> str:
    """Search MiniLibX documentation. Returns top results with content and scores."""
    results = qdrant_service.search(query, limit=8)
    if not results:
        return json.dumps({"results": [], "message": "No results found."})
    return json.dumps(
        {
            "results": [
                {
                    "title": r.title,
                    "module": r.module,
                    "content": r.content[:300],
                    "score": r.score,
                    "url": r.url,
                }
                for r in results
            ]
        }
    )


@tool
def get_doc_section(module: str, section: str = "") -> str:
    """Retrieve full or specific section of a MiniLibX doc module."""
    content = qdrant_service.get_document(module)
    if not content:
        return json.dumps({"error": f"Module '{module}' not found."})
    if section:
        lines = content.split("\n")
        capturing = False
        section_lines = []
        for line in lines:
            if line.strip().lower().startswith(
                f"## {section.lower()}"
            ) or line.strip().lower().startswith(f"### {section.lower()}"):
                capturing = True
            elif (
                capturing
                and line.startswith("## ")
                and not line.strip().lower().startswith(f"## {section.lower()}")
            ):
                break
            if capturing:
                section_lines.append(line)
        content = (
            "\n".join(section_lines)
            if section_lines
            else f"Section '{section}' not found in {module}."
        )
    return json.dumps({"module": module, "content": content})


@tool
def show_api_reference(function_name: str) -> str:
    """Search docs for a MiniLibX function and return structured API reference data."""
    results = qdrant_service.search(function_name, limit=3)
    if not results:
        return json.dumps({"error": f"Function '{function_name}' not found."})
    best = results[0]
    return json.dumps(
        {
            "function_name": function_name,
            "module": best.module,
            "content": best.content[:800],
            "url": best.url,
        }
    )


@tool
def show_docs_card(url: str, begin: str = "", end: str = "") -> str:
    """Retrieve a doc excerpt from a module URL between optional begin/end markers."""
    module = url.replace("/api/docs/", "")
    content = qdrant_service.get_document(module)
    if not content:
        return json.dumps({"error": f"Module '{module}' not found."})
    excerpt = content
    if begin:
        idx = content.find(begin)
        if idx >= 0:
            excerpt = content[idx:]
    if end:
        idx = excerpt.find(end)
        if idx >= 0:
            excerpt = excerpt[: idx + len(end)]
    return json.dumps({"module": module, "excerpt": excerpt[:2000], "url": url})


@tool
def show_code_example(code: str, language: str = "c", description: str = "") -> str:
    """Return code with language tag for frontend rendering."""
    return json.dumps({"code": code, "language": language, "description": description})


all_tools = [
    search_docs,
    get_doc_section,
    show_api_reference,
    show_docs_card,
    show_code_example,
]


def _agent_node(state: MessagesState) -> dict:
    llm = ChatOpenAI(
        model=LLM_MODEL,
        base_url=LLM_BASE_URL,
        api_key=LLM_API_KEY,
        temperature=LLM_TEMPERATURE,
        streaming=True,
    ).bind_tools(all_tools)

    messages = state["messages"]
    if not messages or not isinstance(messages[0], SystemMessage):
        messages = [SystemMessage(content=FULL_SYSTEM_PROMPT)] + list(messages)

    response = llm.invoke(messages)
    return {"messages": [response]}


tool_node = ToolNode(all_tools)

full_graph = StateGraph(MessagesState)
full_graph.add_node("agent", _agent_node)
full_graph.add_node("tools", tool_node)
full_graph.add_edge(START, "agent")
full_graph.add_conditional_edges("agent", tools_condition, {"tools": "tools", END: END})
full_graph.add_edge("tools", "agent")
full_compiled = full_graph.compile(checkpointer=MemorySaver())

full_agent = LangGraphAgent(
    name="full-agent",
    graph=full_compiled,
    description="Full ReAct agent for MiniLibX documentation",
)


def register_full_agent(app):
    from ag_ui_langgraph import add_langgraph_fastapi_endpoint

    add_langgraph_fastapi_endpoint(app, full_agent, "/api/agent")
