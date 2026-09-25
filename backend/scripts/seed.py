import asyncio
import os
import sys
from datetime import date, timedelta

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from sqlalchemy import select, delete
from app.database import async_session_maker, init_db

from app.models import Task, Dependency
from app.api.graph_sync import sync_and_save_schedule

SEED_TASKS = [
    {
        "key": "T1",
        "title": "Set up project repository",
        "description": "Initialize Git repository, configure .gitignore, branch protection and CI workflow.",
        "column_status": "done",
        "duration_days": 1,
        "depends_on": [],
    },
    {
        "key": "T2",
        "title": "Design database schema",
        "description": "Draft relational models for tasks and dependencies. Prepare migrations and indices.",
        "column_status": "done",
        "duration_days": 2,
        "depends_on": ["T1"],
    },
    {
        "key": "T3",
        "title": "Build backend API",
        "description": "Implement FastAPI routes, graph recomputation, cycle check, and CPM scheduler.",
        "column_status": "in_progress",
        "duration_days": 4,
        "depends_on": ["T2"],
    },
    {
        "key": "T4",
        "title": "Build authentication service",
        "description": "Set up token validation, user credentials, and session handlers.",
        "column_status": "backlog",
        "duration_days": 3,
        "depends_on": ["T2"],
    },
    {
        "key": "T5",
        "title": "Build frontend UI shell",
        "description": "Create React + Vite application, configure Tailwind styling, themes and columns.",
        "column_status": "in_progress",
        "duration_days": 3,
        "depends_on": ["T1"],
    },
    {
        "key": "T6",
        "title": "Integrate frontend with API",
        "description": "Connect Kanban drag-and-drop to PATCH endpoints and TanStack Query state cache.",
        "column_status": "backlog",
        "duration_days": 2,
        "depends_on": ["T3", "T5"],
    },
    {
        "key": "T7",
        "title": "Integration tests",
        "description": "End-to-end integration tests for cycle rejection, diamond convergence, and rollback.",
        "column_status": "backlog",
        "duration_days": 2,
        "depends_on": ["T3", "T4"],
    },
    {
        "key": "T8",
        "title": "Write API documentation",
        "description": "Document OpenAPI schema, explain max() vs sum() algorithm and deployment steps.",
        "column_status": "backlog",
        "duration_days": 1,
        "depends_on": ["T3"],
    },
    {
        "key": "T9",
        "title": "Deploy to staging",
        "description": "Containerize backend, configure Render/Neon Postgres, deploy frontend to Vercel.",
        "column_status": "backlog",
        "duration_days": 1,
        "depends_on": ["T6", "T7"],
    },
    {
        "key": "T10",
        "title": "Demo preparation",
        "description": "Prepare walkthrough scenario showcasing cycle detection, delay propagation, and AI suggestions.",
        "column_status": "backlog",
        "duration_days": 1,
        "depends_on": ["T9"],
    },
]


async def seed():
    await init_db()
    async with async_session_maker() as session:
        # Clear existing data to make seeding strictly idempotent
        await session.execute(delete(Dependency))
        await session.execute(delete(Task))
        await session.commit()

        base_date = date.today()
        created_task_map = {}

        # 1. Create all tasks
        for item in SEED_TASKS:
            task = Task(
                title=item["title"],
                description=item["description"],
                column_status=item["column_status"],
                duration_days=item["duration_days"],
                start_date=base_date,
                end_date=base_date + timedelta(days=item["duration_days"] - 1),
            )
            session.add(task)
            created_task_map[item["key"]] = task

        await session.commit()

        # Refresh tasks to get their generated IDs
        for task in created_task_map.values():
            await session.refresh(task)

        # 2. Create all dependencies
        for item in SEED_TASKS:
            target_task = created_task_map[item["key"]]
            for dep_key in item["depends_on"]:
                prereq_task = created_task_map[dep_key]
                dep = Dependency(
                    task_id=target_task.id,
                    depends_on_task_id=prereq_task.id,
                )
                session.add(dep)

        await session.commit()

        # 3. Recompute and persist schedule propagation across the full graph
        await sync_and_save_schedule(session)
        print(f"Successfully seeded {len(SEED_TASKS)} tasks and their dependency graph!")
    from app.database import engine
    await engine.dispose()


if __name__ == "__main__":
    asyncio.run(seed())
