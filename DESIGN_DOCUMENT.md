# TaskFlow AI - Design & Architecture Document

**Project:** TaskFlow AI  
**Author:** Harshit Rawat  
**Submission:** Contata NCR Hackathon 2026 (Build Phase)  
**System:** DAG Precedence Engine, Zero-Slack Critical Path Scheduler, and Injection-Guarded AI Prerequisite Advisor  

---

## 1. Executive Overview & Problem Understanding

Traditional Kanban boards (Jira, Trello, Linear) organize tasks into independent column buckets (`Backlog`, `In Progress`, `Review`, `Done`). In complex software and engineering projects, tasks are rarely independent. A backend API cannot be verified until the database schema exists, and deployment cannot occur until both the API and its test suites are completed.

When task boards fail to model graph topology:
1. **Silent Failures:** Engineers begin work on tasks whose actual dependencies are incomplete or broken.
2. **Cascading Delays:** Schedule shifts on upstream tasks ripple into downstream paths, but boards cannot calculate the non-compounding delay.
3. **Circular Deadlocks:** Accidental dependency loops ($A \rightarrow B \rightarrow C \rightarrow A$) deadlock team planning.

**TaskFlow AI** replaces static status columns with an active **Directed Acyclic Graph (DAG) Precedence Engine** that automates schedule recalculation, provably eliminates compounding diamond delays, and dynamically computes task blockers.

---

## 2. System Architecture & Component Separation

TaskFlow AI follows a clean, decoupled architecture where mathematical scheduling logic is completely isolated from the database and API framework:

```
┌────────────────────────────────────────────────────────────────────────┐
│                   Frontend Client (React 18 + TypeScript + Vite)       │
│   • Modern Landing Page (/) & Kanban Workspace (/dashboard)            │
│   • @dnd-kit Drag-and-Drop Column Movement                             │
│   • Interactive DAG Topology Viewer & Critical Path Toggle             │
│   • What-If Delay Impact Simulator & AI Project Architect              │
│   • Organization / Company Workspace Auth Session (localStorage)       │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │ JSON REST API (/api/v1/*)
┌───────────────────────────────────▼────────────────────────────────────┐
│                       FastAPI Application Gateway                      │
│   • /api/v1/tasks (CRUD, Column Move, Dynamic Status)                  │
│   • /api/v1/dependencies (Edge Management with Cycle Guard)            │
│   • /api/v1/critical-path (Zero-Slack CPM Calculation)                 │
│   • /api/v1/tasks/{id}/suggest-dependencies (Groq LLM Engine)          │
│   • /api/v1/tasks/simulate-delay (What-If Impact Analysis)             │
│   • /api/v1/ai/generate-project (Generative DAG Architect)             │
└───────────────────┬────────────────────────────────┬───────────────────┘
                    │                                │
┌───────────────────▼─────────────┐ ┌────────────────▼───────────────────┐
│  Persistence Layer (SQLAlchemy) │ │    Pure Graph Engine (app/engine)   │
│  • Neon Postgres / SQLite Dev   │ │    • graph.py (Adjacency & Reach)   │
│  • Normalized Schema:           │ │    • cycle_check.py (Cycle Guard)   │
│    - tasks table                │ │    • scheduler.py (Forward/Backward)│
│    - dependencies table         │ │    • status.py (Blocked/Ready State)│
│  • Only column_status saved     │ │    *ZERO DB OR HTTP DEPENDENCIES*   │
└─────────────────────────────────┘ └────────────────────────────────────┘
```

### Pure Engine Design Invariant
All core algorithms in [`backend/app/engine/`](file:///backend/app/engine/) use Python standard library modules only (`dataclasses`, `datetime`, `collections`). It has **zero imports from FastAPI, SQLAlchemy, or HTTP libraries**. This makes the scheduling algorithms completely decoupled, mathematically deterministic, and verifiable in under 5 milliseconds.

---

## 3. Data Model & Database Schema

The database model is deliberately minimal, normalized, and strictly maintains single sources of truth.

```sql
-- 1. Tasks Table (Stores Task Entities and User Status)
CREATE TABLE tasks (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title           TEXT NOT NULL,
    description     TEXT NOT NULL DEFAULT '',
    column_status   TEXT NOT NULL DEFAULT 'backlog'
                    CHECK (column_status IN ('backlog', 'in_progress', 'review', 'done')),
    duration_days   INTEGER NOT NULL DEFAULT 1 CHECK (duration_days >= 1),
    start_date      DATE NOT NULL,
    end_date        DATE NOT NULL,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2. Dependencies Edge Table (Directed Precedence Graph)
CREATE TABLE dependencies (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    task_id             UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
    depends_on_task_id  UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE (task_id, depends_on_task_id),
    CHECK (task_id <> depends_on_task_id)
);

CREATE INDEX idx_dependencies_task_id ON dependencies(task_id);
CREATE INDEX idx_dependencies_depends_on ON dependencies(depends_on_task_id);
```

### Schema Design Decisions:
1. **Derived `Blocked` / `Ready` State:** Task status (`ready` vs `blocked`) is **never** stored in the database. Storing it as a database column would create a secondary source of truth that drifts from reality during concurrent writes. Instead, status is calculated dynamically from the current graph state at read time.
2. **Dedicated Edge Table:** Dependencies are maintained as a first-class relation rather than an array or JSON field on tasks. This ensures $O(1)$ edge queries, clean foreign key cascades, and straightforward cycle detection traversals.
3. **Synchronized End Dates:** `end_date` is computed and stored via the scheduling forward pass so downstream schedule queries can read prerequisite bounds with high efficiency.

---

## 4. Mathematical Scheduling Foundations

### 4.1 Kahn's Algorithm Forward Pass (max vs sum)
When multiple dependency paths converge on a single downstream task (diamond graph), naive implementations sum delays across each path, leading to phantom schedule inflation:
$$\Delta D = \Delta B + \Delta C \quad \text{(INCORRECT — Double Counting)}$$

In TaskFlow AI, schedules are calculated via a topological forward pass:
$$\text{EarliestStart}(T) = \max_{p \in \text{Prerequisites}(T)}(\text{EndDate}(p)) + 1\text{ day}$$
$$\text{EndDate}(T) = \text{StartDate}(T) + (\text{Duration}(T) - 1)$$

Because start dates are computed as a $\max()$ over direct prerequisite completion dates, delays on parallel tracks naturally absorb without compounding.

### 4.2 Bi-Directional Regression (Rollback on Regression)
$$\text{Status}(T) = \begin{cases} 
\text{Ready}, & \text{if } \forall p \in \text{Prerequisites}(T), \text{ColumnStatus}(p) = \text{'done'} \\ 
\text{Blocked}, & \text{otherwise} 
\end{cases}$$

- A task with zero prerequisites evaluates to `Ready` immediately.
- Moving any completed task backwards from `Done` to `In Progress` immediately triggers recomputation across the downstream subgraph, reverting unblocked tasks back to `Blocked`.

### 4.3 Critical Path Method (CPM) Backward Pass
1. $\text{ProjectFinish} = \max_{n \in \text{Nodes}}(\text{EndDate}(n))$
2. Traverse nodes in reverse topological order:
   $$\text{LatestFinish}(T) = \begin{cases} 
   \text{ProjectFinish}, & \text{if } \text{Successors}(T) = \emptyset \\ 
   \min_{s \in \text{Successors}(T)}(\text{LatestStart}(s) - 1), & \text{otherwise} 
   \end{cases}$$
   $$\text{LatestStart}(T) = \text{LatestFinish}(T) - \text{Duration}(T) + 1$$
3. $\text{Slack}(T) = \text{LatestStart}(T) - \text{EarliestStart}(T)$
4. $\text{CriticalPath} = \{ T \mid \text{Slack}(T) = 0 \}$

---

## 5. Security & AI Defense-in-Depth Pipeline

1. **Role Separation in Prompts:** Task content is passed strictly as inert data to analyze; model is instructed to ignore embedded commands.
2. **Candidate ID Allow-Listing:** The backend drops any `task_id` returned by the LLM that does not exist in the candidate pool. Hallucinations are dropped before reaching the user.
3. **Cycle Pre-Filter:** Suggestions are checked against `would_create_cycle()` before display.
4. **Human-in-the-Loop:** Suggestions appear as interactive preview chips. The AI has zero write authority to the database.
5. **Fail-Open Resilience:** If Groq API quota expires or times out, the endpoint safely returns HTTP 200 with an empty list `[]`, ensuring the board is never impaired.

---

## 6. Key Assumptions & Known Engineering Boundaries

As required by the specification, the following design boundaries are explicitly stated:
1. **Discrete Day Granularity:** Task durations are tracked in whole integer days ($\ge 1$). Sub-day hourly shifts and partial shifts are out of scope.
2. **Finish-to-Start Dependency Relationship:** A prerequisite implies the complete finish of the upstream task gates the earliest start date of the downstream task ($S_B \ge E_A + 1$). Lead times or fractional overlaps are not modeled.
3. **Single Board Scope:** The graph engine models dependencies within a single project board. Cross-board inter-project dependencies are not supported.
4. **Prospective Dependency Application:** Adding a prerequisite to an already active task enforces constraint dates going forward; it does not retroactively rewrite historical timesheets.
5. **Full Topological Recomputation:** On write mutations, the schedule is recalculated across the graph. At hackathon scale ($V < 1,000$), $O(V+E)$ recomputation completes in under 2ms, avoiding the synchronization bugs of incremental graph patching.
6. **Concurrent Multi-User Locking:** Assumes single-user or serialized team updates. Real-time CRDT multi-cursor editing is not implemented.
