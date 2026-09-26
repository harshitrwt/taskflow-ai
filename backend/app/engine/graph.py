from dataclasses import dataclass
from datetime import date


@dataclass
class TaskNode:
    id: str
    duration_days: int
    start_date: date
    end_date: date
    column_status: str  # 'backlog' | 'in_progress' | 'review' | 'done'


@dataclass
class DependencyGraph:
    nodes: dict[str, TaskNode]
    edges: dict[str, set[str]]  # task_id -> set of depends_on_task_id
    reverse_edges: dict[str, set[str]]  # task_id -> set of task_ids that depend on it


def build_graph(tasks: list[TaskNode], dependency_pairs: list[tuple[str, str]]) -> DependencyGraph:
    edges: dict[str, set[str]] = {t.id: set() for t in tasks}
    reverse_edges: dict[str, set[str]] = {t.id: set() for t in tasks}

    for task_id, depends_on_id in dependency_pairs:
        if task_id in edges and depends_on_id in reverse_edges:
            edges[task_id].add(depends_on_id)
            reverse_edges[depends_on_id].add(task_id)

    return DependencyGraph(
        nodes={t.id: t for t in tasks},
        edges=edges,
        reverse_edges=reverse_edges,
    )


def is_reachable(graph: DependencyGraph, start: str, target: str) -> bool:
    visited: set[str] = set()
    stack = [start]
    while stack:
        current = stack.pop()
        if current == target:
            return True
        if current in visited:
            continue
        visited.add(current)
        stack.extend(graph.edges.get(current, ()))
    return False
