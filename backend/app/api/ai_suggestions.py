from datetime import date, timedelta
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import delete
from sqlalchemy.ext.asyncio import AsyncSession
from ..database import get_db
from ..models import Task as TaskModel, Dependency as DepModel
from ..schemas import (
    AiSuggestionResponse,
    AiGenerateProjectRequest,
    AiGenerateProjectResponse,
    AiGeneratedTask,
)
from ..services.llm_service import query_groq_suggestions, generate_project_dag
from .graph_sync import load_graph_data, sync_and_save_schedule

router = APIRouter(tags=["ai"])


@router.post("/tasks/{task_id}/suggest-dependencies", response_model=AiSuggestionResponse)
async def suggest_dependencies(
    task_id: str,
    session: AsyncSession = Depends(get_db),
):
    task_map, deps, graph = await load_graph_data(session)

    if task_id not in task_map:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail={"error": "not_found", "message": f"Task {task_id} not found"},
        )

    target_task = task_map[task_id]
    existing_deps = graph.edges.get(task_id, set())

    # Candidates: all other tasks except self and existing prerequisites
    candidate_tasks = [
        {"id": t.id, "title": t.title, "description": t.description}
        for t in task_map.values()
        if t.id != task_id and t.id not in existing_deps
    ]

    target_dict = {
        "id": target_task.id,
        "title": target_task.title,
        "description": target_task.description,
    }

    try:
        suggestions = await query_groq_suggestions(target_dict, candidate_tasks, graph)
    except Exception:
        suggestions = []

    return AiSuggestionResponse(suggestions=suggestions)


@router.post("/ai/generate-project", response_model=AiGenerateProjectResponse)
async def generate_project(
    payload: AiGenerateProjectRequest,
    session: AsyncSession = Depends(get_db),
):
    generated = await generate_project_dag(payload.prompt)
    tasks_data = generated.get("tasks", [])

    if payload.apply_to_db and tasks_data:
        # 1. Clear current workspace
        await session.execute(delete(DepModel))
        await session.execute(delete(TaskModel))
        await session.commit()

        base_date = date.today()
        created_task_map: dict[str, TaskModel] = {}

        # 2. Add tasks
        for item in tasks_data:
            t = TaskModel(
                title=item["title"],
                description=item["description"],
                column_status="backlog",
                duration_days=item["duration_days"],
                start_date=base_date,
                end_date=base_date + timedelta(days=item["duration_days"] - 1),
            )
            session.add(t)
            created_task_map[item["key"]] = t

        await session.commit()

        # 3. Refresh to get assigned IDs
        for t in created_task_map.values():
            await session.refresh(t)

        # 4. Add dependencies
        for item in tasks_data:
            target_model = created_task_map.get(item["key"])
            if not target_model:
                continue
            for dep_key in item["depends_on_keys"]:
                prereq_model = created_task_map.get(dep_key)
                if prereq_model and prereq_model.id != target_model.id:
                    session.add(DepModel(
                        task_id=target_model.id,
                        depends_on_task_id=prereq_model.id,
                    ))

        await session.commit()

        # 5. Run full pure engine topological recompute and save
        await sync_and_save_schedule(session)

    return AiGenerateProjectResponse(
        project_title=generated["project_title"],
        summary=generated["summary"],
        tasks=[
            AiGeneratedTask(
                key=t["key"],
                title=t["title"],
                description=t["description"],
                duration_days=t["duration_days"],
                depends_on_keys=t["depends_on_keys"],
            )
            for t in tasks_data
        ],
        is_acyclic=generated["is_acyclic"],
        applied=payload.apply_to_db,
        task_count=len(tasks_data),
    )


