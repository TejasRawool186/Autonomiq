"""Tests for TextChunker and QdrantVectorStore.
"""

import sys
from pathlib import Path

# Add project root to sys.path
sys.path.insert(0, str(Path(__file__).resolve().parent.parent.parent))

from backend.app.tools.vector_store import TextChunker, QdrantVectorStore


def test_text_chunking():
    raw_text = "Word " * 600
    chunks = TextChunker.chunk_text(
        text=raw_text,
        source_id="src_1",
        source_title="Open Weight AI Models",
        source_url="https://example.com/models",
        chunk_size=200,
        chunk_overlap=20,
    )

    assert len(chunks) > 1
    assert chunks[0]["source_id"] == "src_1"
    assert chunks[0]["source_title"] == "Open Weight AI Models"
    assert "chunk_index" in chunks[0]


def test_vector_search():
    store = QdrantVectorStore()
    sample_text = "Gemma 2 is an open-weight model created by Google DeepMind with high reasoning capability."
    chunks = TextChunker.chunk_text(sample_text, "doc_gemma", "Gemma 2 Overview")
    store.add_chunks(chunks)

    results = store.search("Gemma DeepMind", top_k=1)
    assert len(results) == 1
    assert "Gemma" in results[0]["text"]
    assert results[0]["score"] > 0


if __name__ == "__main__":
    test_text_chunking()
    test_vector_search()
    print("All vector store tests passed!")
