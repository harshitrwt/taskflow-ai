from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from ..models import Task, Dependency
from ..engine.graph import TaskNode, DependencyGraph, build_graph
from ..engine.scheduler import recompute_schedule, compute_critical_path
from ..engine.status import compute_status_details
from ..schemas import TaskResponse, BlockedReason


async def load_graph_data(session: AsyncSession) -> tuple[dict[str, Task], list[Dependency], DependencyGraph]:
    tasks_result = await session.execute(select(Task))
    tasks = list(tasks_result.scalars().all())
    task_map = {t.id: t for t in tasks}

    deps_result = await session.execute(select(Dependency))
    deps = list(deps_result.scalars().all())
    dep_pairs = [(d.task_id, d.depends_on_task_id) for d in deps]

    nodes = [
        TaskNode(
            id=t.id,
            duration_days=t.duration_days,
            start_date=t.start_date,
            end_date=t.end_date,
            column_status=t.column_status,
        )
        for t in tasks
    ]
    graph = build_graph(nodes, dep_pairs)
    return task_map, deps, graph


async def sync_and_save_schedule(session: AsyncSession) -> tuple[dict[str, Task], list[Dependency], DependencyGraph]:
    task_map, deps, graph = await load_graph_data(session)
    if not graph.nodes:
        return task_map, deps, graph

    recompute_schedule(graph)
    dirty = False
    for task_id, node in graph.nodes.items():
        task = task_map.get(task_id)
        if task and (task.start_date != node.start_date or task.end_date != node.end_date):
            task.start_date = node.start_date
            task.end_date = node.end_date
            dirty = True

    if dirty:
        await session.commit()

    return task_map, deps, graph


def build_task_response(
    task: Task,
    graph: DependencyGraph,
    task_map: dict[str, Task],
    deps: list[Dependency],
) -> TaskResponse:
    details = compute_status_details(graph)
    task_detail = details.get(task.id, {"status": "ready", "blocked_by": []})
    
    blocked_reasons = [
        BlockedReason(id=dep_id, title=task_map[dep_id].title)
        for dep_id in task_detail["blocked_by"]
        if dep_id in task_map
    ]

    task_dependencies = [
        d.depends_on_task_id for d in deps if d.task_id == task.id
    ]

    return TaskResponse(
        id=task.id,
        title=task.title,
        description=task.description,
        column_status=task.column_status,
        duration_days=task.duration_days,
        start_date=task.start_date,
        end_date=task.end_date,
        computed_status=task_detail["status"],
        blocked_by=blocked_reasons,
        dependencies=task_dependencies,
        created_at=task.created_at,
        updated_at=task.updated_at,
    )


def build_all_task_responses(
    task_map: dict[str, Task],
    deps: list[Dependency],
    graph: DependencyGraph,
) -> list[TaskResponse]:
    return [
        build_task_response(t, graph, task_map, deps)
        for t in task_map.values()
    ]
