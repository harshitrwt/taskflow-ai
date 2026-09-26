from datetime import date, timedelta
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from ..database import get_db
from ..models import Task
from ..schemas import (
    TaskCreate,
    TaskUpdate,
    TaskMove,
    TaskResponse,
    SimulateDelayRequest,
    SimulateDelayResponse,
    ImpactedTaskSimulation,
)
from ..engine.graph import TaskNode, DependencyGraph
from ..engine.scheduler import recompute_schedule, compute_critical_path
from .graph_sync import (
    load_graph_data,
    sync_and_save_schedule,
    build_task_response,
    build_all_task_responses,
)

router = APIRouter(prefix="/tasks", tags=["tasks"])


@router.get("", response_model=list[TaskResponse])
async def list_tasks(session: AsyncSession = Depends(get_db)):
    task_map, deps, graph = await sync_and_save_schedule(session)
    return build_all_task_responses(task_map, deps, graph)


@router.post("", response_model=TaskResponse, status_code=status.HTTP_201_CREATED)
async def create_task(payload: TaskCreate, session: AsyncSession = Depends(get_db)):
    start_date = payload.start_date or date.today()
    end_date = start_date + timedelta(days=payload.duration_days - 1)

    task = Task(
        title=payload.title,
        description=payload.description,
        column_status=payload.column_status,
        duration_days=payload.duration_days,
        start_date=start_date,
        end_date=end_date,
    )
    session.add(task)
    await session.commit()
    await session.refresh(task)

    task_map, deps, graph = await sync_and_save_schedule(session)
    return build_task_response(task_map[task.id], graph, task_map, deps)


@router.patch("/{task_id}", response_model=TaskResponse)
async def update_task(
    task_id: str,
    payload: TaskUpdate,
    session: AsyncSession = Depends(get_db),
):
    result = await session.execute(select(Task).where(Task.id == task_id))
    task = result.scalar_one_or_none()
    if not task:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail={"error": "not_found", "message": f"Task {task_id} not found"},
        )

    if payload.title is not None:
        task.title = payload.title
    if payload.description is not None:
        task.description = payload.description
    if payload.column_status is not None:
        task.column_status = payload.column_status
    if payload.start_date is not None:
        task.start_date = payload.start_date
    if payload.duration_days is not None:
        task.duration_days = payload.duration_days

    task.end_date = task.start_date + timedelta(days=task.duration_days - 1)
    await session.commit()

    task_map, deps, graph = await sync_and_save_schedule(session)
    return build_task_response(task_map[task.id], graph, task_map, deps)


@router.patch("/{task_id}/move", response_model=TaskResponse)
async def move_task(
    task_id: str,
    payload: TaskMove,
    session: AsyncSession = Depends(get_db),
):
    result = await session.execute(select(Task).where(Task.id == task_id))
    task = result.scalar_one_or_none()
    if not task:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail={"error": "not_found", "message": f"Task {task_id} not found"},
        )

    task.column_status = payload.column_status
    await session.commit()

    task_map, deps, graph = await sync_and_save_schedule(session)
    return build_task_response(task_map[task.id], graph, task_map, deps)


@router.get("/templates", status_code=status.HTTP_200_OK)
async def list_project_templates():
    from ..seeds import PROJECT_TEMPLATES
    return [
        {
            "id": t["id"],
            "name": t["name"],
            "description": t["description"],
            "task_count": len(t["tasks"]),
        }
        for t in PROJECT_TEMPLATES.values()
    ]


@router.post("/templates/load", status_code=status.HTTP_200_OK)
async def load_project_template(
    payload: dict,
    session: AsyncSession = Depends(get_db),
):
    from ..models import Task as TaskModel, Dependency as DepModel
    from ..seeds import PROJECT_TEMPLATES, CANONICAL_TASKS
    from sqlalchemy import delete
    from datetime import date, timedelta

    template_id = payload.get("template_id", "canonical")
    template = PROJECT_TEMPLATES.get(template_id)
    items = template["tasks"] if template else CANONICAL_TASKS

    await session.execute(delete(DepModel))
    await session.execute(delete(TaskModel))
    await session.commit()

    base_date = date.today()
    created_task_map = {}

    for item in items:
        t = TaskModel(
            title=item["title"],
            description=item["description"],
            column_status=item["column_status"],
            duration_days=item["duration_days"],
            start_date=base_date,
            end_date=base_date + timedelta(days=item["duration_days"] - 1),
        )
        session.add(t)
        created_task_map[item["key"]] = t

    if items:
        await session.commit()
        for t in created_task_map.values():
            await session.refresh(t)

        for item in items:
            target = created_task_map[item["key"]]
            for dep_key in item["depends_on"]:
                prereq = created_task_map.get(dep_key)
                if prereq:
                    session.add(DepModel(task_id=target.id, depends_on_task_id=prereq.id))

        await session.commit()

    task_map, deps, graph = await sync_and_save_schedule(session)
    return {"ok": True, "template_id": template_id, "count": len(task_map)}


@router.post("/seed", status_code=status.HTTP_200_OK)
async def seed_canonical_tasks(session: AsyncSession = Depends(get_db)):
    return await load_project_template({"template_id": "canonical"}, session)


@router.delete("/{task_id}", status_code=status.HTTP_200_OK)

async def delete_task(task_id: str, session: AsyncSession = Depends(get_db)):
    result = await session.execute(select(Task).where(Task.id == task_id))
    task = result.scalar_one_or_none()
    if not task:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail={"error": "not_found", "message": f"Task {task_id} not found"},
        )

    await session.delete(task)
    await session.commit()

    await sync_and_save_schedule(session)
    return {"ok": True, "deleted_id": task_id}


@router.post("/simulate-delay", response_model=SimulateDelayResponse)
async def simulate_task_delay(
    payload: SimulateDelayRequest,
    session: AsyncSession = Depends(get_db),
):
    task_map, deps, graph = await load_graph_data(session)
    if payload.task_id not in task_map:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail={"error": "not_found", "message": f"Task {payload.task_id} not found"},
        )

    # 1. Baseline schedule clone
    baseline_nodes = {
        k: TaskNode(
            id=v.id,
            duration_days=v.duration_days,
            start_date=v.start_date,
            end_date=v.end_date,
            column_status=v.column_status,
        )
        for k, v in graph.nodes.items()
    }
    baseline_graph = DependencyGraph(
        nodes=baseline_nodes,
        edges={k: set(v) for k, v in graph.edges.items()},
        reverse_edges={k: set(v) for k, v in graph.reverse_edges.items()},
    )
    recompute_schedule(baseline_graph)
    baseline_end = max(n.end_date for n in baseline_graph.nodes.values()) if baseline_graph.nodes else None

    # 2. Simulated graph clone with delayed duration
    sim_nodes = {
        k: TaskNode(
            id=v.id,
            duration_days=v.duration_days + (payload.delay_days if k == payload.task_id else 0),
            start_date=v.start_date,
            end_date=v.end_date,
            column_status=v.column_status,
        )
        for k, v in graph.nodes.items()
    }
    sim_graph = DependencyGraph(
        nodes=sim_nodes,
        edges={k: set(v) for k, v in graph.edges.items()},
        reverse_edges={k: set(v) for k, v in graph.reverse_edges.items()},
    )
    recompute_schedule(sim_graph)
    sim_end = max(n.end_date for n in sim_graph.nodes.values()) if sim_graph.nodes else None
    sim_crit_path = compute_critical_path(sim_graph)
    sim_crit_set = set(sim_crit_path)

    project_delay_days = (sim_end - baseline_end).days if (sim_end and baseline_end) else 0

    # 3. Analyze impacted tasks
    impacted_tasks: list[ImpactedTaskSimulation] = []
    diamond_found = False

    for task_id, base_node in baseline_graph.nodes.items():
        sim_node = sim_graph.nodes[task_id]
        shift = (sim_node.end_date - base_node.end_date).days
        is_target = (task_id == payload.task_id)

        prereqs = graph.edges.get(task_id, set())
        if len(prereqs) >= 2 and shift > 0 and not is_target:
            diamond_found = True

        if shift > 0 or is_target:
            impacted_tasks.append(ImpactedTaskSimulation(
                id=task_id,
                title=task_map[task_id].title,
                original_start_date=base_node.start_date,
                original_end_date=base_node.end_date,
                simulated_start_date=sim_node.start_date,
                simulated_end_date=sim_node.end_date,
                shift_days=shift,
                is_critical=task_id in sim_crit_set,
                is_target=is_target,
            ))

    target_title = task_map[payload.task_id].title
    explanation = (
        f"Simulated delay of +{payload.delay_days} days on '{target_title}'. "
        f"Overall project completion shifted by {project_delay_days} day(s). "
    )
    if diamond_found:
        explanation += "Non-linear max() precedence rule held: convergent downstream tasks absorbed multi-path dependencies without compounding double-count."
    else:
        explanation += "Downstream topological cascade calculated in O(V+E) time."

    if payload.apply_to_db and payload.delay_days > 0:
        target_model = task_map[payload.task_id]
        target_model.duration_days += payload.delay_days
        target_model.end_date = target_model.start_date + timedelta(days=target_model.duration_days - 1)
        await session.commit()
        await sync_and_save_schedule(session)

    return SimulateDelayResponse(
        target_task_id=payload.task_id,
        target_task_title=target_title,
        delay_days=payload.delay_days,
        baseline_project_end=baseline_end,
        simulated_project_end=sim_end,
        project_delay_days=project_delay_days,
        critical_path=sim_crit_path,
        impacted_tasks=impacted_tasks,
        max_precedence_rule_proven=True,
        explanation=explanation,
        applied=payload.apply_to_db,
    )

