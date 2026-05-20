from langchain_core.messages import SystemMessage, HumanMessage
from langchain_openai import ChatOpenAI
from langgraph.graph import StateGraph, MessagesState, START, END
from langgraph.checkpoint.memory import MemorySaver

from ag_ui_langgraph import LangGraphAgent

from ..main import LLM_BASE_URL, LLM_API_KEY, LLM_ASSIST_MODEL, LLM_TEMPERATURE
from ..services.qdrant import qdrant_service

ASSIST_SYSTEM_PROMPT = (
    "You are a concise documentation assistant for MiniLibX, a C graphics library. "
    "Generate a concise 50-60 word summary answering the user's query based ONLY on "
    "the provided documentation search results. Include inline numbered citations like [1], [2] "
    "referring to the search results in order. Be factual and precise. "
    "If the search results don't contain relevant information, say so briefly."
)


def _assist_node(state: MessagesState) -> dict:
    query = ""
    for msg in reversed(state["messages"]):
        if hasattr(msg, "content") and msg.content:
            query = msg.content if isinstance(msg.content, str) else str(msg.content)
            break
    if not query:
        return {"messages": []}

    search_results = qdrant_service.search(query, limit=5)
    context_parts = []
    for i, r in enumerate(search_results, 1):
        context_parts.append(f"[{i}] ({r.module}) {r.title}: {r.content[:500]}")
    context = (
        "\n\n".join(context_parts) if context_parts else "No search results found."
    )

    llm = ChatOpenAI(
        model=LLM_ASSIST_MODEL,
        base_url=LLM_BASE_URL,
        api_key=LLM_API_KEY,
        temperature=LLM_TEMPERATURE,
        streaming=True,
    )

    response = llm.invoke(
        [
            SystemMessage(
                content=ASSIST_SYSTEM_PROMPT + "\n\nSearch results:\n" + context
            ),
            HumanMessage(content=query),
        ]
    )

    return {"messages": [response]}


assist_graph = StateGraph(MessagesState)
assist_graph.add_node("assist", _assist_node)
assist_graph.add_edge(START, "assist")
assist_graph.add_edge("assist", END)
assist_compiled = assist_graph.compile(checkpointer=MemorySaver())

assist_agent = LangGraphAgent(
    name="assist-agent",
    graph=assist_compiled,
    description="Lightweight summary agent for Search Assist",
)


def register_assist_agent(app):
    from ag_ui_langgraph import add_langgraph_fastapi_endpoint

    add_langgraph_fastapi_endpoint(app, assist_agent, "/api/assist-agent")
