# SOFTWARE REQUIREMENTS SPECIFICATION (SRS)

## Autonomiq
### A Local-First Autonomous AI Workspace

**Document Version:** 3.0 (Final)
**Project Name:** Autonomiq
**Project Type:** Open-Source AI / Desktop Productivity / Autonomous Agents
**Purpose:** Hacktoberfest 2026 Open-Source AI Challenge — Week 1
**Theme:** Touch Grass
**Status:** Final MVP Specification
**Build Window:** October 05 – October 11, 2026 (6 days)

---

## 1. Introduction

### 1.1 Purpose

Autonomiq is a local-first autonomous AI workspace that executes digital research tasks on a user's computer while minimizing continuous human supervision. Users submit tasks in natural language, review a proposed execution plan, and let the system perform web research, data extraction, document processing, RAG, and report generation in the background.

The system runs long-running tasks through a durable background worker. Users can close the browser, leave the desk, go outside, and return to completed results.

This version of the SRS is scoped to a **6-day build** targeting the Hacktoberfest 2026 Open-Source AI Challenge. It includes only partner integrations that are feasible, high-value, and quick to implement.

### 1.2 Problem Statement

Most AI tools demand continuous attention. Research workflows — collecting sources, extracting information, organizing documents, analyzing findings, and writing reports — keep users glued to a screen. Cloud AI adds recurring costs, privacy risks, rate limits, and vendor lock-in.

Autonomiq solves this by running locally, working in the background, and delivering structured results without requiring the user to watch.

### 1.3 Project Objectives

1. Accept natural-language research tasks.
2. Generate a reviewable execution plan.
3. Execute multi-step workflows with minimal supervision.
4. Run inference locally through open-weight models.
5. Automate web search, extraction, chunking, embedding, and RAG.
6. Produce source-backed reports.
7. Continue execution after the browser closes.
8. Provide transparent progress, tracing, and error handling.
9. Deploy to the cloud for judge accessibility.
10. Deliver an audio digest so the user can listen while away from the screen.

### 1.4 Scope

**Included in the MVP:**

- Task creation and plan approval.
- Web search via SerpApi.
- Webpage extraction via BeautifulSoup.
- Document upload and parsing (PDF, TXT, Markdown).
- Local embeddings and vector storage (Qdrant).
- Local LLM inference via Ollama (Gemma).
- Durable workflow execution via Temporal.
- Agent tracing via Sentry.
- Audio digest generation via ElevenLabs.
- Report generation with citations.
- Deployment via Render.
- Away Mode UX.
- Optional long-term memory via MongoDB Atlas.
- Optional GitHub Copilot-assisted development and CI.

**Excluded from the MVP:**

- Fine-tuning (Tinker).
- Hardware agents (Arduino UNO Q).
- Cloud GPU inference (DigitalOcean).
- Tabular ML (TabPFN).
- Alternative orchestration frameworks (Mastra).
- Terminal coding agents (Backboard R-CLI).
- Agent session capture platforms (Entire).
- Fully general-purpose computer-use automation.
- Autonomous shell command execution.
- Multi-user collaboration.
- Mobile applications.

### 1.5 Definitions and Abbreviations

| Term | Definition |
|---|---|
| AI Agent | Software component that selects and executes tools to accomplish a task. |
| LLM | Large Language Model used for reasoning and generation. |
| RAG | Retrieval-Augmented Generation. |
| Embedding | Vector representation of text for semantic retrieval. |
| Local-first | Architecture prioritizing local processing and storage. |
| Background Worker | Process that executes tasks independently of the browser. |
| LangGraph | Framework for stateful, multi-step AI workflows. |
| Ollama | Runtime for local open-weight models. |
| Away Mode | UX pattern that encourages leaving the screen while tasks run. |
| Durable Execution | Workflow pattern that survives crashes and resumes from last completed step. |

---

## 2. Overall Description

### 2.1 Product Perspective

Autonomiq is a web-based frontend paired with a local backend service. The frontend submits tasks and displays progress. The backend manages state, orchestrates the agent, calls local models, executes tools, stores data, and generates outputs.

**Critical constraint:** Closing the browser must not stop a running task. The backend worker is independent of the frontend.

### 2.2 Intended Users

- General users automating repetitive research.
- Students and researchers collecting and comparing sources.
- Developers processing technical documents and repositories.
- Privacy-conscious users who prefer local inference.

### 2.3 Operating Environment

- OS: Windows, Linux, macOS.
- Frontend: Modern Chromium-based browsers.
- Backend: Python 3.10+.
- Local AI: Ollama with Gemma.
- Storage: SQLite + Qdrant (local).
- Network: Internet required only for live web search; local inference works offline.
- Hardware: 8 GB RAM minimum; 16 GB recommended.

### 2.4 Design Principles

1. Local-first.
2. Task-oriented, not chat-oriented.
3. Transparent.
4. Human-controlled for consequential actions.
5. Resilient through durable execution.
6. Minimal distraction — the screen is the shortest part of the experience.
7. Evidence-based outputs.
8. Prize-aligned but never gimmicky.

---

## 3. System Architecture

### 3.1 High-Level Architecture

1. **Frontend** — React + Vite + TypeScript.
2. **API Layer** — FastAPI.
3. **Task Manager** — SQLite-backed state.
4. **Durable Worker** — Temporal workflow.
5. **Agent Orchestrator** — LangGraph.
6. **Tool Layer** — SerpApi, BeautifulSoup, document parsers.
7. **Local AI Runtime** — Ollama serving Gemma.
8. **RAG Pipeline** — Chunking, embeddings, Qdrant retrieval.
9. **Tracing Layer** — Sentry.
10. **Voice Layer** — ElevenLabs.
11. **Deployment** — Render for frontend + backend.

### 3.2 Technology Stack

| Layer | Technology | Prize Category |
|---|---|---|
| Frontend | React + Vite + TypeScript | — |
| Backend | Python + FastAPI | — |
| Agent | LangGraph | — |
| LLM | Gemma via Ollama | Best Use of Gemma ($200) |
| Search | SerpApi | Best Use of SerpApi ($100) |
| Tracing | Sentry | Best Use of Sentry ($100) |
| Voice | ElevenLabs | Best Use of ElevenLabs ($100) |
| Durability | Temporal | Best Use of Temporal ($100) |
| Deploy | Render | Best Use of Render ($200) |
| Memory (optional) | MongoDB Atlas | Best Use of MongoDB Atlas ($100) |
| Dev (optional) | GitHub Copilot | Best Use of GitHub Copilot ($100) |

### 3.3 Workflow Stages

1. Accept research objective.
2. Validate task and identify inputs.
3. Generate execution plan (LangGraph).
4. Request user approval.
5. Search for sources (SerpApi).
6. Extract and normalize content.
7. Deduplicate and filter.
8. Chunk documents.
9. Generate embeddings.
10. Index in Qdrant.
11. Retrieve relevant evidence.
12. Analyze with Gemma.
13. Generate report with citations.
14. Generate audio digest (ElevenLabs).
15. Save artifacts.
16. Update task status.
17. Notify user.
18. Emit Sentry trace summary.

If a stage fails, Temporal retries with exponential backoff, or the task is marked failed with a clear reason.

---

## 4. Functional Requirements

### FR-01: Task Creation

The system shall allow users to create a research task using natural-language input.

- Title/objective input.
- Optional file attachment.
- Optional source URLs.
- Output format selection.
- Save or start immediately.

**Acceptance:** A valid task is saved with a unique ID.

### FR-02: Task Planning (LangGraph)

The system shall generate a structured plan before execution.

- Objective, steps, tools, expected outputs, safety constraints.
- User reviews and approves before work begins.

**Acceptance:** Plan is displayed and can be approved or cancelled.

### FR-03: Web Research (SerpApi)

The system shall use SerpApi for live web search grounding.

- Query planning by the agent.
- Top-N result extraction.
- Source attribution preserved.
- Rate limits respected.

**Acceptance:** Sources are logged with URLs and extraction status.

### FR-04: Document Processing

The system shall accept PDF, TXT, and Markdown.

- Extract text and metadata.
- Report unsupported files.

**Acceptance:** A supported file can be processed and searched.

### FR-05: RAG Pipeline

The system shall support chunking, local embeddings, Qdrant indexing, and semantic retrieval.

- Chunks linked back to source documents.

**Acceptance:** A user question returns an answer with citations.

### FR-06: Local Inference (Gemma via Ollama)

The system shall run Gemma locally for all summarization and analysis.

- Model availability checked before execution.
- No silent cloud LLM fallback.

**Acceptance:** A full task completes with zero cloud LLM calls.

### FR-07: Durable Execution (Temporal)

The system shall wrap the workflow in a Temporal workflow.

- Automatic retries with exponential backoff.
- Resume from last completed step after crash.
- State persisted per step.

**Acceptance:** Killing the worker mid-task and restarting resumes the task without duplicating completed work.

### FR-08: Agent Tracing (Sentry)

The system shall trace every LLM call and tool call.

- Capture prompt, response, tokens, latency, cost, model.
- Provide a per-task trace summary.

**Acceptance:** Sentry dashboard shows a complete trace for a finished task.

### FR-09: Audio Digest (ElevenLabs)

The system shall generate a spoken summary of the report.

- Convert final summary to MP3.
- Store locally.
- Playable in the frontend.

**Acceptance:** A user can listen to the report while away from the screen.

### FR-10: Report Generation

The system shall produce a Markdown report containing:

- Executive summary.
- Methodology.
- Key findings.
- Comparison tables.
- Evidence.
- Source references.
- Limitations.
- Conclusion.

**Acceptance:** A completed task produces a locally stored, downloadable report.

### FR-11: Task Monitoring

The system shall display:

- Status, current step, elapsed time.
- Sources processed.
- Errors and warnings.

**Acceptance:** UI reflects real backend state via polling.

### FR-12: Away Mode

The system shall confirm a task is running in the background and inform the user they can close the browser.

- Clearly state whether internet is required.

**Acceptance:** User closes the browser, task completes, result is available on return.

### FR-13: Cloud Deployment (Render)

The system shall deploy:

- React frontend as a Render Static Site.
- FastAPI backend as a Render Web Service.

**Acceptance:** A live URL is accessible and shows completed tasks.

### FR-14: Optional — Long-Term Memory (MongoDB Atlas)

The system may store past research summaries and recall them in new tasks via Atlas Vector Search.

**Acceptance:** A new task references prior research context.

### FR-15: Optional — GitHub Copilot

Development may use GitHub Copilot, with GitHub Actions for lint/test CI.

**Acceptance:** Repo shows Copilot-assisted commits and passing CI.

---

## 5. Non-Functional Requirements

| ID | Requirement |
|---|---|
| NFR-1 | Core workflow runs offline after models are installed (search step excepted). |
| NFR-2 | Documents and reports stored locally by default. |
| NFR-3 | Partner integrations are optional toggles in config. |
| NFR-4 | Sentry traces every agent step without leaking secrets. |
| NFR-5 | Temporal prevents silent task failures. |
| NFR-6 | Frontend usable on desktop browsers. |
| NFR-7 | All dependencies open-source or free-tier. |
| NFR-8 | README documents setup for judges to reproduce. |
| NFR-9 | UI uses a clean light theme: off-white background, white cards, charcoal text, restrained green accents. |
| NFR-10 | Model licenses and third-party terms are documented. |

---

## 6. User Interface Requirements

### 6.1 Main Navigation

1. New Task
2. Dashboard
3. Task Library
4. Settings

### 6.2 New Task Screen

- Description input.
- Task type selector.
- File attachment.
- Output format selector.
- Plan review area.
- Start Task button.

### 6.3 Dashboard

- Active tasks.
- Recent completed tasks.
- Sentry trace summary widget.

### 6.4 Task Monitor

- Step timeline.
- Source count.
- Elapsed time.
- Errors.
- Cancel control.

### 6.5 Results Screen

- Report preview.
- Source references.
- Audio digest player.
- Download links.
- Trace summary.

### 6.6 Settings

- Model selection.
- Storage location.
- Integration toggles (SerpApi, Temporal, Sentry, ElevenLabs, Render, MongoDB Atlas).
- Retention controls.

---

## 7. Data Requirements

### 7.1 Task Entity

Task ID, title, description, type, status, timestamps, model, config, output refs, error summary.

### 7.2 Execution Step Entity

Step ID, task ID, name, status, timestamps, attempt count, output metadata, error info, Temporal workflow/run IDs.

### 7.3 Source Entity

Source ID, task ID, URL, title, content hash, extraction status, timestamp, metadata, SerpApi query.

### 7.4 Chunk Entity

Chunk ID, document ID, text, embedding ref, order, source metadata.

### 7.5 Artifact Entity

Artifact ID, task ID, file name, format, path, timestamp, size, checksum.

### 7.6 Storage Rules

- SQLite for task metadata and state.
- Qdrant for embeddings.
- MongoDB Atlas (optional) for long-term memory.
- Local filesystem for documents and artifacts.
- Temporary files follow a cleanup policy.

---

## 8. External Interface Requirements

### 8.1 API Endpoints

| Method | Endpoint | Purpose |
|---|---|---|
| POST | /api/tasks | Create a task |
| GET | /api/tasks | List tasks |
| GET | /api/tasks/{id} | Task details |
| POST | /api/tasks/{id}/start | Start approved task |
| POST | /api/tasks/{id}/cancel | Cancel task |
| GET | /api/tasks/{id}/events | Execution events |
| GET | /api/tasks/{id}/artifacts | List outputs |
| GET | /api/tasks/{id}/trace | Sentry trace summary |
| GET | /api/tasks/{id}/audio | Audio digest |
| POST | /api/documents | Upload document |
| GET | /api/health | Backend health |

### 8.2 AI Runtime Interface

- Ollama serves Gemma locally.
- Temporal wraps all agent activities.
- If Ollama is unavailable, the task pauses and reports an actionable error.

### 8.3 Web Interface

- React frontend communicates over documented REST.
- Long-running jobs do not depend on an active browser session.

### 8.4 File Interface

- Accepts PDF, TXT, Markdown uploads.
- Serves generated artifacts for download.

---

## 9. Use Cases

### UC-01: Conduct Web Research

1. User creates a research task.
2. LangGraph generates a plan.
3. User approves.
4. SerpApi provides live search.
5. System extracts and normalizes sources.
6. Qdrant indexes content.
7. Temporal durably executes each step.
8. Gemma analyzes evidence.
9. Sentry traces every step.
10. Report generated with citations.
11. ElevenLabs generates audio digest.
12. System stores results and notifies user.

**Postcondition:** Report, audio digest, and trace are available.

### UC-02: Process Documents with RAG

1. User uploads documents.
2. System extracts text.
3. System chunks and embeds.
4. Qdrant indexes.
5. User asks a question.
6. Retrieval returns relevant chunks.
7. Gemma generates a grounded answer.

**Postcondition:** Answer with citations.

### UC-03: Run a Task While Away

1. User starts task.
2. User activates Away Mode.
3. User closes browser.
4. Temporal keeps workflow running.
5. Task completes.
6. Sentry captures trace.
7. Notification issued.
8. Audio digest ready.
9. User returns and reviews.

**Postcondition:** Task independent of browser session.

### UC-04: Handle a Failed Task

1. A step fails.
2. Temporal records and retries with backoff.
3. If unrecoverable, task marked failed.
4. Sentry logs error with context.
5. User inspects and retries.

**Postcondition:** Failure visible; no silent success.

---

## 10. Error Handling and Recovery

The system shall handle:

- Ollama unavailable.
- Model inference timeout.
- SerpApi rate limit.
- Network failure during search.
- Inaccessible source page.
- Corrupt or unsupported document.
- Qdrant failure.
- Worker interruption.
- Insufficient disk space.
- Report generation failure.
- User cancellation.
- Sentry export failure.

For each, the system records the error, preserves recoverable state, and communicates the next action. Temporal guarantees no silent failure.

---

## 11. Testing and Acceptance Criteria

1. Task created from natural language.
2. Reviewable plan generated.
3. Sources collected via SerpApi.
4. Documents processed.
5. RAG retrieval returns relevant passages.
6. Gemma performs inference locally.
7. Task continues after browser closes (Temporal).
8. Progress and errors persisted.
9. Report generated with citations.
10. Audio digest generated (ElevenLabs).
11. Notification issued on completion.
12. App reopened shows completed results.
13. Failed model or worker never marks task successful.
14. Task can be cancelled safely.
15. User can delete task data per retention policy.
16. Core workflow runs without cloud LLM calls.
17. Deployment on Render is accessible.

### Demonstration Scenario

Task: *"Research ten useful open-weight AI models, compare capabilities and hardware requirements, and generate a report."*

The demo shows:

- Task creation and plan approval.
- Background execution.
- SerpApi search and extraction.
- Local Gemma analysis.
- Report with citations.
- ElevenLabs audio digest.
- Sentry trace summary.
- Browser closed during execution.
- Completion notification.
- Render-hosted dashboard showing the finished report.

---

## 12. Development Plan (6 Days)

| Day | Focus | Deliverable |
|---|---|---|
| 1 | Foundations | Repo scaffold, Ollama + Gemma, task creation endpoint + UI |
| 2 | Agent Core | LangGraph plan → search → extract → summarize |
| 3 | Durability + Tracing | Temporal wrapper, Sentry SDK integration |
| 4 | Voice + Report | ElevenLabs digest, Markdown report, results screen |
| 5 | Deploy + Polish | Render deploy, Away Mode, optional MongoDB Atlas |
| 6 | Demo + DEV Post | Outdoor demo, screenshots, DEV post, submission |

---

## 13. Prize Alignment

| Prize | Value | How |
|---|---|---|
| Overall | $250 + DEV++ | Strong narrative + working demo + writing |
| Best Use of Gemma | $200 | Gemma runs all inference locally |
| Best Use of Render | $200 | Frontend + backend deployed on Render |
| Best Use of Sentry | $100 | Full agent trace in DEV post |
| Best Use of ElevenLabs | $100 | Audio digest for the walk |
| Best Use of SerpApi | $100 | Live search grounding |
| Best Use of Temporal | $100 | Durable workflow survives crash |
| Best Use of MongoDB Atlas | $100 | Optional memory layer |
| Best Use of GitHub Copilot | $100 | Optional dev + CI |

**Realistic target: $1,150 – $1,350.**

---

## 14. Constraints and Assumptions

1. Local inference performance depends on hardware.
2. Live search requires internet.
3. Background jobs require the computer and worker to remain on.
4. Closing the browser is supported; shutting down the computer is not guaranteed to preserve execution (Temporal mitigates where possible).
5. Local-first does not automatically make every external connection private.
6. Scraped webpages may contain incorrect or malicious content and must not be treated as trusted agent instructions.
7. Generated reports may contain errors and must preserve source evidence.
8. Partner integrations are optional; the core works without them.
9. Prize eligibility depends heavily on the DEV post, not just code.

---

## 15. Conclusion

Autonomiq turns AI from a tool that demands attention into a system that executes useful work independently. By combining open-weight models (Gemma), durable execution (Temporal), live search (SerpApi), observability (Sentry), voice output (ElevenLabs), and cloud deployment (Render), Autonomiq lets users assign work, leave the screen, and return to a transparent, verifiable result.

The defining principle: **the screen should be the shortest part of the experience.**

**Autonomiq: Your AI works. You live.**

---

*End of SRS v3.0*