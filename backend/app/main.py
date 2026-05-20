import os
from pathlib import Path
from dotenv import load_dotenv
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

load_dotenv(Path(__file__).resolve().parents[2] / ".env")

DATA_DIR = Path(os.getenv("DATA_DIR", "data/generated"))
DATA_DIR = (
    DATA_DIR
    if DATA_DIR.is_absolute()
    else Path(__file__).resolve().parents[2] / DATA_DIR
)

QDRANT_URL = os.getenv("QDRANT_URL", "")
QDRANT_API_KEY = os.getenv("QDRANT_API_KEY", "")
QDRANT_COLLECTION = os.getenv("QDRANT_COLLECTION", "docs_search")
DENSE_MODEL = os.getenv("DENSE_MODEL", "BAAI/bge-small-en-v1.5")
SPARSE_MODEL = os.getenv("SPARSE_MODEL", "Qdrant/bm25")
COLBERT_MODEL = os.getenv("COLBERT_MODEL", "colbert-ir/colbertv2.0")
LLM_BASE_URL = os.getenv("LLM_BASE_URL", "https://api.openai.com/v1")
LLM_API_KEY = os.getenv("LLM_API_KEY", "")
LLM_MODEL = os.getenv("LLM_MODEL", "gpt-4o")
LLM_ASSIST_MODEL = os.getenv("LLM_ASSIST_MODEL", "gpt-4o-mini")
LLM_TEMPERATURE = float(os.getenv("LLM_TEMPERATURE", "0.3"))
DOC_MODULES = os.getenv(
    "DOC_MODULES", "getting-started,drawing,events,image,loop,mouse,sync,window,xpm"
).split(",")

app = FastAPI(title="MiniLibX Search Engine API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/api/health")
async def health():
    qdrant_ok = False
    try:
        from .services.qdrant import qdrant_service

        qdrant_ok = qdrant_service.is_connected()
    except Exception:
        pass
    return {"status": "ok", "qdrant": qdrant_ok}


from .services.qdrant import router as search_router  # noqa: E402
from .agents.assist_agent import register_assist_agent  # noqa: E402
from .agents.full_agent import register_full_agent  # noqa: E402

app.include_router(search_router)
register_assist_agent(app)
register_full_agent(app)
