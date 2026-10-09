# Autonomiq

> **A Local-First Autonomous AI Workspace**  
> *"Your AI works. You live."*

Built for Hacktoberfest 2026 Open-Source AI Challenge.

---

## 🌟 Overview

Autonomiq executes long-running digital research tasks on your computer while minimizing continuous screen time. Users submit tasks in natural language, review an execution plan, and the system autonomously conducts web research, document parsing, RAG embeddings, analysis, and report generation in the background.

With **Away Mode** and durable execution (via Temporal), you can submit a task, close your browser, leave your desk, and return to completed source-backed reports and an audio digest.

---

## 🏗️ Architecture & Modules

```
Autonomiq/
├── backend/                       # FastAPI Server & AI Execution Engine
│   ├── app/
│   │   ├── api/                   # REST Endpoints (Tasks, Documents, Health)
│   │   ├── models/                # SQLite State & Entity Models
│   │   ├── schemas/               # Request/Response Data Contracts
│   │   ├── agent/                 # LangGraph Multi-Node Workflow
│   │   │   └── nodes/             # Planner, Researcher, Extractor, Analyst, Reporter
│   │   ├── tools/                 # SerpApi, BeautifulSoup, DocParser, Qdrant, ElevenLabs
│   │   ├── workflows/             # Temporal Workflows & Activities
│   │   ├── storage/               # Filesystem & Artifact Manager
│   │   ├── config.py              # Settings & Environment Configuration
│   │   └── main.py                # FastAPI Application Entrypoint
│   └── tests/                     # Unit & Integration Tests
│
├── frontend/                      # React + Vite + TypeScript (Dashboard & Away Mode)
├── data/                          # Persistent Local Storage (SQLite, Qdrant, Artifacts)
└── scripts/                       # Orchestration & Startup Scripts
```

---

## 🤖 Autonomous Agents & Roles

1. **@pm (Product Manager)**: Manages requirements, technical specification alignment (`srs.md`), and phase tracking (`task_plan.md`).
2. **@engineer (Full-Stack Engineer)**: Develops the modular backend APIs, LangGraph nodes, tools, and React frontend.
3. **@qa (QA Engineer)**: Audits code, conducts systematic debugging, and enforces verification with evidence before completion.
4. **@devops (DevOps Master)**: Manages local environments, background workers, and Render cloud deployments.

---

## 🚀 Phased Implementation Roadmap

- [x] **Phase 0: Architecture Analysis & Project Scaffolding** (Folder structure, configs, verification scripts)
- [x] **Phase 1: Backend Foundation & Storage Layer** (FastAPI app, SQLite database models, schemas, task CRUD)
- [x] **Phase 2: Document Processing & Local Vector RAG** (PDF/TXT/MD parsers, chunking, Qdrant local vector store)
- [x] **Phase 3: Autonomous Agent Workflow (LangGraph)** (Modular nodes: Planner, Researcher, Extractor, Analyst, Reporter)
- [x] **Phase 4: Durable Execution & Observability** (Temporal worker + Sentry tracing)
- [x] **Phase 5: Audio Digest & Report Generation** (ElevenLabs synthesis & Markdown report export)
- [x] **Phase 6: Frontend UI (React + Vite + Away Mode)** (Modern light-theme dashboard, task monitor, player)
- [x] **Phase 7: End-to-End Verification & Production Readiness** (Full multi-source research run, docs, deployment configs)
- [x] **Phase 8: Live Partner Integrations & Mock Elimination** (Grounded SerpApi, ElevenLabs v2 voice, Sentry spans, dynamic Ollama models)

---

## 🛠️ Quick Start & Running

### 1. Configure Environment (`.env`)
```bash
cp .env.example .env
```
Populate your live API keys:
- `SERPAPI_API_KEY`: Real-time Google search indexing.
- `ELEVENLABS_API_KEY`: Multilingual v2 audio synthesis.
- `SENTRY_DSN`: Real-time distributed tracing and telemetry.
- `OLLAMA_MODEL`: Target model (e.g. `gemma3:1b`, `qwen2.5:1.5b`, `qwen3:4b`).

### 2. Start Backend
```bash
python scripts/run_backend.py
```
FastAPI runs on `http://localhost:8000` (Docs: `http://localhost:8000/docs`).

### 3. Start Frontend
```bash
cd frontend
npm install
npm run dev
```
Open `http://localhost:5173` in your browser.

### 4. Shortcuts & Features
- **Ctrl+N / Ctrl+K**: Open New Research Task modal.
- **Away Mode**: Submit any task, approve the plan, and safely close the tab or browser.
- **Audio Digest**: Listen with custom playback speeds (1x, 1.25x, 1.5x) or download the MP3.
- **Task Retry**: Re-run any past research task with fresh background execution.

