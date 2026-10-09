# Autonomiq — Findings & Architecture Discoveries

## 1. System Requirements Analysis (from srs.md v3.0)
- **Local-first priority**: Local models (Gemma via Ollama) and local embeddings (Sentence-Transformers / Ollama embeddings / FastEmbed) must work without mandatory cloud dependencies.
- **Graceful degradation**:
  - If Ollama is offline: alert with clear actionable setup guidance (`ollama run gemma2:9b` or `gemma:2b`).
  - If SerpApi key is missing: provide simulated/duckduckgo/fallback search or mock results during tests.
  - If Temporal server is offline: agent engine must support both direct in-process execution AND durable Temporal worker mode.
  - If ElevenLabs key is missing: allow local TTS (or graceful skip / mock audio generation).
- **Decoupled browser lifecycle ("Away Mode")**:
  - The browser is merely a client.
  - Backend task state persists in SQLite (`tasks.db`) and events are loggable/queryable by step.
  - Users can submit a task, close their browser, and query completed results upon returning.

## 2. Key Technology Stack
- **Backend**: Python 3.12, FastAPI, Uvicorn, SQLAlchemy, SQLite, Pydantic v2.
- **Agent Orchestrator**: LangGraph / stateful graph pipeline.
- **Vector DB**: Qdrant (supports local embedded mode without requiring external Docker container!).
- **LLM**: Ollama client calling Gemma.
- **Frontend**: React + TypeScript + Vite.
- **Observability**: Sentry SDK.
- **Voice**: ElevenLabs API.
- **Durability**: Temporal Python SDK.
