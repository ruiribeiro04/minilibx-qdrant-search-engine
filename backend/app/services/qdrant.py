from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from qdrant_client import models

from ..main import (
    QDRANT_URL,
    QDRANT_API_KEY,
    QDRANT_COLLECTION,
    DATA_DIR,
    DENSE_MODEL,
    SPARSE_MODEL,
    COLBERT_MODEL,
)


class SearchResult(BaseModel):
    title: str
    module: str
    content: str
    score: float
    url: str


class QdrantService:
    def __init__(self):
        self._client = None

    def _get_client(self):
        if self._client is not None:
            return self._client
        from qdrant_client import QdrantClient

        self._client = QdrantClient(
            url=QDRANT_URL,
            api_key=QDRANT_API_KEY,
        )
        return self._client

    def is_connected(self) -> bool:
        try:
            client = self._get_client()
            client.get_collection(QDRANT_COLLECTION)
            return True
        except Exception:
            return False

    def search(self, query: str, limit: int = 10) -> list[SearchResult]:
        client = self._get_client()
        hits = client.query_points(
            collection_name=QDRANT_COLLECTION,
            query=models.Document(text=query, model=COLBERT_MODEL),
            using="colbert",
            prefetch=[
                models.Prefetch(
                    query=models.Document(text=query, model=DENSE_MODEL),
                    using="dense",
                    limit=100,
                ),
                models.Prefetch(
                    query=models.Document(text=query, model=SPARSE_MODEL),
                    using="sparse",
                    limit=100,
                ),
            ],
            limit=limit,
            with_payload=True,
        )
        results = []
        seen = set()
        for point in hits.points:
            payload = point.payload or {}
            module = payload.get("module", "")
            page_title = payload.get("page_title", "")
            section_title = payload.get("section_title", "")
            chunk_text = payload.get("chunk_text", "")
            section_url = payload.get("section_url", "")
            key = (module, section_title, chunk_text[:100])
            if key in seen:
                continue
            seen.add(key)
            results.append(
                SearchResult(
                    title=section_title or page_title or module,
                    module=module,
                    content=chunk_text,
                    score=point.score,
                    url=section_url or f"/api/docs/{module}",
                )
            )
        return results

    def get_document(self, module: str) -> str | None:
        path = DATA_DIR / f"{module}.md"
        if not path.exists():
            return None
        return path.read_text()


qdrant_service = QdrantService()

router = APIRouter()


@router.get("/api/search")
async def search_endpoint(q: str = ""):
    if not q.strip():
        raise HTTPException(status_code=400, detail="Query parameter 'q' is required")
    results = qdrant_service.search(q)
    return [r.model_dump() for r in results]


@router.get("/api/docs/{module}")
async def docs_endpoint(module: str):
    content = qdrant_service.get_document(module)
    if content is None:
        raise HTTPException(status_code=404, detail=f"Module '{module}' not found")
    return {"module": module, "content": content}
