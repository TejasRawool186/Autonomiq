# Autonomiq — Master Implementation Plan (Manus-Style)

## Project Overview
**Autonomiq** is a local-first autonomous AI workspace that executes digital research tasks in the background while minimizing continuous human supervision.
Targeting a resilient, 6-day Hacktoberfest MVP architecture with local LLM inference (Gemma via Ollama), durable execution (Temporal), web search (SerpApi), document RAG (Qdrant), audio digest (ElevenLabs), and tracing (Sentry).

---

## Phases & Milestones

| Phase | Description | Status | Target Deliverables |
|---|---|---|---|
| **Phase 0** | **Architecture Analysis & Project Scaffolding** | `complete` | Complete directory structure, config, `.env.example`, `requirements.txt`, planning files |
| **Phase 1** | **Backend Foundation & Storage Layer** | `in_progress` | FastAPI skeleton, SQLite database models, schemas, `/api/health`, `/api/tasks` CRUD |
| **Phase 2** | **Document Processing & Local Vector RAG** | `pending` | PDF/TXT/MD parser, chunker, Qdrant vector indexer, local embedding retrieval |
| **Phase 3** | **Autonomous Agent Workflow (LangGraph)** | `pending` | Modular agent nodes (Planner, Researcher, Extractor, Analyst, Reporter), Ollama/Gemma integration |
| **Phase 4** | **Durable Execution & Observability** | `pending` | Temporal background worker workflow & activities, Sentry tracing integration |
| **Phase 5** | **Audio Digest & Report Generation** | `pending` | ElevenLabs text-to-speech audio digest generator, Markdown report exporter |
| **Phase 6** | **Frontend UI (React + Vite + Away Mode)** | `pending` | Dashboard, New Task wizard, Step Timeline monitor, Results viewer, Audio player |
| **Phase 7** | **End-to-End Verification & Production Readiness**| `pending` | Full simulation test ("10 useful open-weight models"), docs, Docker/Render deploy configs |

---

## Errors & Decisions Log

| Date / Phase | Event / Error | Attempt | Resolution |
|---|---|---|---|
| Phase 0 | Initialized repository layout | 1 | Created modular `backend/`, `frontend/`, `data/`, and `scripts/` directories |

---

## Agent Roles Assigned
- **@pm (Product Manager)**: Architecture alignment, SRS compliance, phase tracking (`task_plan.md`).
- **@engineer (Full-Stack Engineer)**: Modular clean code in `backend/app/` and `frontend/`.
- **@qa (QA Engineer)**: Strict validation, unit tests, mock fallbacks for cloud APIs, verification evidence.
- **@devops (DevOps)**: Local servers, worker daemons, Render configurations.
