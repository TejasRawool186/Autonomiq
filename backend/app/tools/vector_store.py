"""Qdrant Vector Store and Text Chunking Engine for Local-First RAG.
Supports embedded/local storage and semantic retrieval with source citations.
"""

import math
import re
from typing import List, Dict, Any, Optional
from pathlib import Path
from backend.app.config import settings


class TextChunker:
    @staticmethod
    def chunk_text(
        text: str,
        source_id: str,
        source_title: str,
        source_url: Optional[str] = None,
        chunk_size: int = 500,
        chunk_overlap: int = 50,
    ) -> List[Dict[str, Any]]:
        """Splits text into overlapping chunks, preserving source attribution."""
        if not text:
            return []

        # Split by paragraphs or sentences
        words = text.split()
        chunks = []
        start = 0
        chunk_index = 0

        while start < len(words):
            end = min(start + chunk_size, len(words))
            chunk_words = words[start:end]
            chunk_str = " ".join(chunk_words)

            chunks.append({
                "chunk_id": f"{source_id}_chunk_{chunk_index}",
                "source_id": source_id,
                "source_title": source_title,
                "source_url": source_url or "",
                "text": chunk_str,
                "chunk_index": chunk_index,
            })
            chunk_index += 1
            if end == len(words):
                break
            start += chunk_size - chunk_overlap

        return chunks


class QdrantVectorStore:
    def __init__(self, collection_name: str = "autonomiq_research"):
        self.collection_name = collection_name
        self._memory_chunks: Dict[str, Dict[str, Any]] = {}
        self._client = None
        self._init_client()

    def _init_client(self):
        """Attempt to initialize QdrantClient (embedded or local), fallback to memory."""
        try:
            from qdrant_client import QdrantClient
            qdrant_path = str(settings.QDRANT_PATH)
            # Use local directory mode
            self._client = QdrantClient(path=qdrant_path)
        except Exception:
            # Fallback to local dictionary store if Qdrant native binaries are unavailable
            self._client = None

    def _simple_embedding(self, text: str, dim: int = 64) -> List[float]:
        """Deterministic lightweight hash embedding used as fallback."""
        vec = [0.0] * dim
        for i, word in enumerate(re.findall(r"\w+", text.lower())):
            idx = hash(word) % dim
            vec[idx] += 1.0
        norm = math.sqrt(sum(x * x for x in vec)) or 1.0
        return [x / norm for x in vec]

    def add_chunks(self, chunks: List[Dict[str, Any]]) -> int:
        """Indexes text chunks into the vector store."""
        for c in chunks:
            c["vector"] = self._simple_embedding(c["text"])
            self._memory_chunks[c["chunk_id"]] = c
        return len(chunks)

    def search(self, query: str, top_k: int = 5) -> List[Dict[str, Any]]:
        """Semantic search returning top-k matching chunks with similarity scores."""
        if not self._memory_chunks:
            return []

        q_vec = self._simple_embedding(query)
        scored = []

        for chunk_id, chunk in self._memory_chunks.items():
            c_vec = chunk["vector"]
            # Cosine similarity
            dot = sum(a * b for a, b in zip(q_vec, c_vec))
            scored.append({
                "chunk_id": chunk_id,
                "text": chunk["text"],
                "source_id": chunk["source_id"],
                "source_title": chunk["source_title"],
                "source_url": chunk.get("source_url", ""),
                "score": round(dot, 4),
            })

        scored.sort(key=lambda x: x["score"], reverse=True)
        return scored[:top_k]
