"""Indexer Agent Node for Autonomiq.
Chunks documents/sources and indexes them into Qdrant for semantic RAG retrieval.
"""

from typing import Dict, Any
from backend.app.agent.state import AgentState
from backend.app.tools.vector_store import TextChunker, QdrantVectorStore


async def indexer_node(state: AgentState) -> Dict[str, Any]:
    """Chunks sources, stores vectors, and retrieves most relevant passages."""
    vector_store = QdrantVectorStore(collection_name=f"task_{state['task_id']}")
    sources = state.get("raw_sources", [])

    all_chunks = []
    for idx, src in enumerate(sources):
        src_id = f"src_{idx}"
        content = src.get("content") or src.get("snippet") or ""
        chunks = TextChunker.chunk_text(
            text=content,
            source_id=src_id,
            source_title=src.get("title", f"Source {idx}"),
            source_url=src.get("url"),
            chunk_size=250,
            chunk_overlap=30,
        )
        all_chunks.extend(chunks)

    if all_chunks:
        vector_store.add_chunks(all_chunks)

    # Retrieve top evidence for the objective
    top_evidence = vector_store.search(state["objective"], top_k=5)

    return {
        "retrieved_chunks": top_evidence,
        "current_step": "indexing_completed",
    }
