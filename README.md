# MiniLibX Documentation Search Engine

AI-powered documentation search for **MiniLibX**, the C graphics library used by thousands of 42 school students. Built as a capstone project for the **Qdrant Essential Course**.

Dual-mode web interface: a Google-style search engine with an optional AI summary (Search Assist), plus a full conversational AI agent (AI Mode) — both backed by Qdrant hybrid search and LangGraph agents.

## Architecture

```
┌─────────────────────────────────────────────────┐
│  Frontend (Next.js 16 · React 19 · assistant-ui) │
│                                                   │
│  ┌─────────────┐  ┌──────────────┐  ┌──────────┐ │
│  │ Search Mode │  │   AI Mode    │  │ Side     │ │
│  │ (React)     │  │ (Thread/AGUI)│  │ Panel    │ │
│  └──────┬──────┘  └──────┬───────┘  └────┬─────┘ │
└─────────┼────────────────┼───────────────┼───────┘
          │                │               │
          ▼                ▼               ▼
┌─────────────────────────────────────────────────┐
│  Backend (FastAPI · LangGraph · ag-ui-langgraph) │
│                                                   │
│  GET /api/search     ──▶ Qdrant hybrid search    │
│  GET /api/docs/:mod  ──▶ Static markdown docs    │
│  POST /api/assist-agent ─▶ Lightweight LLM agent │
│  POST /api/agent     ──▶ Full ReAct agent (5 tools) │
└──────────────────────┬──────────────────────────┘
                       ▼
         ┌──────────────────────────┐
         │  Qdrant (dense + sparse) │
         └──────────────────────────┘
```

**Two separate agents:**

| Agent | Endpoint | Model | Purpose |
|---|---|---|---|
| Assist Agent | `/api/assist-agent` | `gpt-4o-mini` | 50–60 word summary with citations |
| Full Agent | `/api/agent` | `gpt-4o` | ReAct agent with 5 RAG tools |

## Features

- **Search Mode** — hierarchy-grouped results by documentation module, query term highlighting, `⌘K` shortcut
- **Search Assist** — collapsible AI summary above results (always / on-demand / never)
- **AI Mode** — conversational agent with generative UI cards (API references, code examples, doc excerpts)
- **Side Panel** — view full documentation alongside search or chat
- **Seamless transition** — click "Chat" on Search Assist to continue in AI Mode with context carried over
- **9 documentation modules** — drawing, events, getting-started, image, loop, mouse, sync, window, xpm

## Tech Stack

| Layer | Technologies |
|---|---|
| Backend | Python 3.13, FastAPI, LangGraph, ag-ui-langgraph, langchain-openai, qdrant-client |
| Frontend | Next.js 16, React 19, assistant-ui ^0.14.5, @ag-ui/client, zustand, tailwindcss 4, shadcn/ui |
| Search | Qdrant (dense + sparse hybrid search) |

## Quick Start

### Prerequisites

- Python 3.13+
- Node.js 18+
- A Qdrant Cloud cluster (or local Docker instance)
- An OpenAI-compatible LLM API key

### Configure

```bash
# Root environment (Qdrant + LLM)
cp .env.example .env
# Edit .env with your QDRANT_URL, QDRANT_API_KEY, LLM_API_KEY, etc.

# Frontend environment
cp frontend/.env.example frontend/.env.local
# Defaults work for local development — edit if backend runs elsewhere
```

### Install & Run

```bash
make install   # Install Python + Node dependencies
make dev       # Start backend (port 8000) and frontend (port 3000)
```

Open [http://localhost:3000](http://localhost:3000).

## Project Structure

```
backend/app/
├── main.py                 # FastAPI entry point, CORS, health check
├── services/
│   └── qdrant.py           # Qdrant service + REST endpoints
└── agents/
    ├── assist_agent.py     # Lightweight summary agent
    └── full_agent.py       # Full ReAct agent with 5 tools

frontend/
├── app/
│   ├── page.tsx            # Dual-mode layout (Search / AI)
│   ├── layout.tsx          # Root layout with runtime provider
│   └── MyRuntimeProvider.tsx  # AG-UI runtime with HttpAgent
├── components/
│   ├── layout/             # AppLayout, ModeTabs
│   ├── search/             # WelcomeScreen, SearchBar, ResultCard, ResultsPage, SearchAssist, SuggestionChips
│   ├── ai/                 # AiModeView, CitationLink, FollowUpChips
│   │   └── generative-ui/  # ApiReferenceCard, DocsCard, CodeExample
│   ├── panel/              # SidePanel, DocViewer
│   ├── assistant-ui/       # thread, markdown-text, tool-fallback (from boilerplate)
│   └── ui/                 # shadcn/ui components
└── lib/
    ├── store.ts            # Zustand global state
    ├── search-api.ts       # Backend API client
    └── utils.ts            # cn() utility

data/generated/             # 9 markdown documentation modules
capstone.ipynb              # Original data pipeline notebook
```

## API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/health` | Service status + Qdrant connectivity |
| `GET` | `/api/search?q=query` | Hybrid search against Qdrant collection |
| `GET` | `/api/docs/:module` | Full markdown content for a doc module |
| `POST` | `/api/assist-agent` | AG-UI streaming endpoint for Search Assist |
| `POST` | `/api/agent` | AG-UI streaming endpoint for full ReAct agent |

## Environment Variables

### Root `.env`

| Variable | Default | Description |
|---|---|---|
| `QDRANT_URL` | — | Qdrant cluster URL |
| `QDRANT_API_KEY` | — | Qdrant API key |
| `QDRANT_COLLECTION` | `minilibx_docs` | Collection name |
| `LLM_BASE_URL` | `https://api.openai.com/v1` | OpenAI-compatible API base URL |
| `LLM_API_KEY` | — | LLM API key |
| `LLM_MODEL` | `gpt-4o` | Model for full agent |
| `LLM_ASSIST_MODEL` | `gpt-4o-mini` | Model for assist agent |
| `GITHUB_TOKEN` | — | GitHub PAT for source fetching |

### Frontend `frontend/.env.local`

| Variable | Default | Description |
|---|---|---|
| `NEXT_PUBLIC_API_URL` | `http://localhost:8000` | Backend REST API URL |
| `NEXT_PUBLIC_AGUI_AGENT_URL` | `http://localhost:8000/api/agent` | Full agent AG-UI endpoint |
| `NEXT_PUBLIC_AGUI_ASSIST_URL` | `http://localhost:8000/api/assist-agent` | Assist agent AG-UI endpoint |

## Makefile Commands

| Command | Description |
|---|---|
| `make install` | Install all Python and Node dependencies |
| `make dev` | Start backend + frontend concurrently |
| `make backend` | Start backend only (port 8000) |
| `make frontend` | Start frontend only (port 3000) |
| `make build` | Build frontend for production |
| `make clean` | Remove build artifacts |

## Notebook

The original data pipeline lives in `capstone.ipynb`. It fetches MiniLibX source from GitHub, generates structured documentation via LLM, and ingests into Qdrant with hybrid search. The web app queries the same collection created by the notebook.

## License

MIT
