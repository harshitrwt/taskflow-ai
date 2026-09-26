from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from ..database import get_db
from ..models import Task, Dependency
from ..schemas import DependencyCreate, DependencyResponse, CriticalPathResponse
from ..engine.cycle_check import would_create_cycle
from ..engine.scheduler import compute_critical_path
from .graph_sync import load_graph_data, sync_and_save_schedule

router = APIRouter(tags=["dependencies"])


@router.post("/dependencies", response_model=DependencyResponse, status_code=status.HTTP_201_CREATED)
async def create_dependency(
    payload: DependencyCreate,
    session: AsyncSession = Depends(get_db),
):
    if payload.task_id == payload.depends_on_task_id:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail={"error": "cycle_detected", "message": "A task cannot depend on itself."},
        )

    task_map, deps, graph = await load_graph_data(session)

    if payload.task_id not in task_map:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail={"error": "not_found", "message": f"Task {payload.task_id} not found"},
        )
    if payload.depends_on_task_id not in task_map:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail={"error": "not_found", "message": f"Prerequisite task {payload.depends_on_task_id} not found"},
        )

    # Check for existing dependency
    existing = any(
        d.task_id == payload.task_id and d.depends_on_task_id == payload.depends_on_task_id
        for d in deps
    )
    if existing:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail={"error": "dependency_exists", "message": "This dependency relationship already exists."},
        )

    # Cycle check via pure engine
    if would_create_cycle(graph, payload.task_id, payload.depends_on_task_id):
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail={
                "error": "cycle_detected",
                "message": f"Adding dependency from {task_map[payload.task_id].title} to {task_map[payload.depends_on_task_id].title} would create a circular dependency cycle.",
            },
        )

    dep = Dependency(
        task_id=payload.task_id,
        depends_on_task_id=payload.depends_on_task_id,
    )
    session.add(dep)
    await session.commit()
    await session.refresh(dep)

    # Recompute schedule with new dependency
    await sync_and_save_schedule(session)

    return DependencyResponse(
        id=dep.id,
        task_id=dep.task_id,
        depends_on_task_id=dep.depends_on_task_id,
        created_at=dep.created_at,
    )


@router.delete("/dependencies/{dep_id}", status_code=status.HTTP_200_OK)
async def delete_dependency(
    dep_id: str,
    task_id: str | None = None,
    session: AsyncSession = Depends(get_db),
):
    if task_id:
        result = await session.execute(
            select(Dependency).where(
                Dependency.task_id == task_id,
                Dependency.depends_on_task_id == dep_id,
            )
        )
    else:
        result = await session.execute(select(Dependency).where(Dependency.id == dep_id))

    dep = result.scalar_one_or_none()
    if not dep:
        # Also try matching where depends_on_task_id == dep_id if single dependency exists
        fallback = await session.execute(
            select(Dependency).where(
                (Dependency.id == dep_id) | (Dependency.depends_on_task_id == dep_id)
            )
        )
        dep = fallback.scalars().first()

    if not dep:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail={"error": "not_found", "message": f"Dependency {dep_id} not found"},
        )

    await session.delete(dep)
    await session.commit()

    await sync_and_save_schedule(session)
    return {"ok": True, "deleted_id": dep_id}



@router.get("/critical-path", response_model=CriticalPathResponse)
async def get_critical_path(session: AsyncSession = Depends(get_db)):
    task_map, deps, graph = await sync_and_save_schedule(session)
    if not graph.nodes:
        return CriticalPathResponse(critical_path=[], project_end_date=None, slacks={})

    crit_path = compute_critical_path(graph)
    project_end = max(n.end_date for n in graph.nodes.values())

    return CriticalPathResponse(
        critical_path=crit_path,
        project_end_date=project_end,
        slacks={},
    )
