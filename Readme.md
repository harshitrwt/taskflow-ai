# TaskFlow AI : DAG-Powered Critical Path Kanban

TaskFlow Pro is an enterprise Kanban board engineered around a mathematically rigorous Directed Acyclic Graph (DAG) scheduling engine and a secure AI dependency advisor. Designed for Contata NCR Hackathon 2026, it models complex task prerequisites, computes dynamic real-time Blocked and Ready states, and automatically propagates schedule delays without the classic diamond-convergence compounding bug. The system features a Critical Path Method (CPM) zero-slack analyzer and a Groq-powered Llama 3.3 dependency recommendation pipeline with multi-layered defenses against prompt injection and hallucination.

---

## Architecture Diagram

```
┌────────────────────────────────────────────────────────────────────────┐
│                          Frontend (React 18 + TS + Vite)               │
│   Kanban Board (4 cols) │ Task Detail Panel │ Critical Path CPM View   │
│   @dnd-kit Drag & Drop  │ Dependency Picker │ Human-in-the-Loop Chips  │
│   TanStack Query Cache  │ Tooltip Reasoning │ Toast Notifications      │
└────────────────────────────────────┬───────────────────────────────────┘
                                     │ JSON REST API (/api/v1/*)
┌────────────────────────────────────▼───────────────────────────────────┐
│                          Backend API (FastAPI)                         │
│   • /tasks (CRUD + Drag/Drop Move)                                     │
│   • /dependencies (Cycle Prevention + CPM Trigger)                     │
│   • /critical-path (Zero-Slack Chain Detection)                        │
│   • /tasks/{id}/suggest-dependencies (Groq LLM Service)                │
└───────────────────┬─────────────────────────────────┬──────────────────┘
                    │                                 │
┌───────────────────▼─────────────┐ ┌─────────────────▼──────────────────┐
│  Persistence Layer (SQLAlchemy) │ │   Pure Graph Engine (app/engine)   │
│  Postgres (Neon) / SQLite dev   │ │   • graph.py (Adjacency & Reach)   │
│  Async engine + sessions        │ │   • cycle_check.py (Cycle Guard)   │
│  tasks & dependencies tables    │ │   • scheduler.py (Forward/Backward)│
│  Only column_status persisted   │ │   • status.py (Blocked/Ready State)│
│                                 │ │   *ZERO DB OR HTTP COUPLING*       │
└─────────────────────────────────┘ └────────────────────────────────────┘
```


## Security & AI Hallucination Defense

Task descriptions entered by users represent an untrusted input surface fed directly into LLM prompts. TaskFlow Pro implements defense-in-depth:
1. **Instruction / Data Isolation:** Prompts explicitly order the model to treat all task descriptions purely as inert data to analyze.
2. **Candidate ID Allow-Listing:** The backend discards any `task_id` returned by the LLM that does not strictly exist in the candidate pool. The LLM cannot hallucinate or inject phantom nodes.
3. **Engine Authority & Cycle Filter:** Candidate suggestions are evaluated against `would_create_cycle()` before ever reaching the UI.
4. **Human-in-the-Loop:** Suggestions appear as interactive review chips. AI has generative proposal power, but **zero write authority**. A user must click "Accept Prerequisite" to persist an edge.
5. **Fail-Open Reliability:** If Groq API quota expires or network times out, the endpoint safely returns HTTP 200 with an empty list `[]`, ensuring the board is never impaired.
6. **Model Selection:** Powered by Groq's premier `llama-3.3-70b-versatile` model.

---

## Quickstart Setup

### Prerequisites
- Python 3.11+
- Node.js 18+ and npm

### 1. Backend Setup
```bash
cd backend

# Copy environment template
cp .env.example .env

# Install dependencies
pip install -r requirements.txt

# Run the idempotent database seed (creates 10 tasks with dual diamond convergences)
python scripts/seed.py

# Run unit and integration tests (15/15 passing)
pytest

# Start the FastAPI server
uvicorn app.main:app --reload --port 8000
```
Backend API will be accessible at `http://localhost:8000` (interactive Swagger docs at `http://localhost:8000/docs`).

### 2. Frontend Setup
```bash
cd frontend

# Copy environment template
cp .env.example .env

# Install dependencies (already installed if cloned)
npm install

# Start Vite dev server
npm run dev
```
Frontend will be running at `http://localhost:5173`.

---

## Key Assumptions and Limitations

As required by the specification, the following engineering boundaries are explicitly documented:
1. **Discrete Day Granularity:** Task durations are tracked in whole integer days ($\ge 1$). Sub-day hourly shifts and partial shifts are out of scope.
2. **Finish-to-Start Dependency Relationship:** A prerequisite implies the complete finish of the upstream task gates the earliest start date of the downstream task ($S_B \ge E_A + 1$). Lead times or fractional overlaps are not modeled.
3. **Single Board Scope:** The graph engine models dependencies within a single project board. Cross-board inter-project dependencies are not supported.
4. **Prospective Dependency Application:** Adding a prerequisite to an already active task enforces constraint dates going forward; it does not retroactively rewrite historical timesheets.
5. **Full Topological Recomputation:** On write mutations, the schedule is recalculated across the graph. At hackathon and enterprise sprint board scale ($V < 1,000$), $O(V+E)$ recomputation completes in under 2ms, avoiding the synchronization bugs of incremental graph patching.
6. **Concurrent Multi-User Locking:** Assumes single-user or sequential updates. Distributed operational transformation/CRDTs are not included.

---

## Seed Data Walkthrough & Demonstration

The seeded project graph demonstrates every requirement:
- **Diamond 1:** Task 3 ("Build backend API") and Task 5 ("Build frontend UI shell") converge at Task 6 ("Integrate frontend with API").
- **Diamond 2:** Task 3 ("Build backend API") and Task 4 ("Build auth service") converge at Task 7 ("Integration tests").
- **Double Convergence:** Tasks 6 and 7 re-converge at Task 9 ("Deploy to staging").
- **Critical Path:** Activating the Critical Path toggle highlights the zero-slack chain (`[T1 -> T2 -> T3 -> T6 -> T9 -> T10]`).
- **Rollback Demonstration:** Moving Task 1 or Task 2 backwards from `Done` immediately re-evaluates all downstream tasks to `Blocked`, displaying the exact blocking task in the card tooltip.
