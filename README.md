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
- [ ] **Phase 1: Backend Foundation & Storage Layer** (FastAPI app, SQLite database models, schemas, task CRUD)
- [ ] **Phase 2: Document Processing & Local Vector RAG** (PDF/TXT/MD parsers, chunking, Qdrant local vector store)
- [ ] **Phase 3: Autonomous Agent Workflow (LangGraph)** (Modular nodes: Planner, Researcher, Extractor, Analyst, Reporter)
- [ ] **Phase 4: Durable Execution & Observability** (Temporal worker + Sentry tracing)
- [ ] **Phase 5: Audio Digest & Report Generation** (ElevenLabs synthesis & Markdown report export)
- [ ] **Phase 6: Frontend UI (React + Vite + Away Mode)** (Modern light-theme dashboard, task monitor, player)
- [ ] **Phase 7: End-to-End Verification & Production Readiness** (Full multi-source research run, docs, deployment configs)

---

## 🛠️ Quick Start

### 1. Verify Setup
```bash
python scripts/verify_setup.py
```

### 2. Configure Environment
```bash
cp .env.example .env
```
Update your `.env` with API keys (SerpApi, ElevenLabs, Sentry) as needed.
