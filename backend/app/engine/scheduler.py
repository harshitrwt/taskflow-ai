from datetime import timedelta, date
from .graph import DependencyGraph


def topological_order(graph: DependencyGraph) -> list[str]:
    in_degree = {node_id: len(deps) for node_id, deps in graph.edges.items()}
    queue = [node_id for node_id, degree in in_degree.items() if degree == 0]
    ordered: list[str] = []

    while queue:
        current = queue.pop(0)
        ordered.append(current)
        for dependent in graph.reverse_edges.get(current, ()):
            in_degree[dependent] -= 1
            if in_degree[dependent] == 0:
                queue.append(dependent)

    if len(ordered) != len(graph.nodes):
        raise ValueError("graph contains a cycle; this should never happen if cycle_check ran first")
    return ordered


def recompute_schedule(graph: DependencyGraph) -> DependencyGraph:
    order = topological_order(graph)
    for task_id in order:
        node = graph.nodes[task_id]
        prerequisite_ids = graph.edges[task_id]
        if prerequisite_ids:
            latest_prerequisite_end = max(graph.nodes[dep_id].end_date for dep_id in prerequisite_ids)
            earliest_possible_start = latest_prerequisite_end + timedelta(days=1)
            # max() not sum() solves diamond convergence without compounding
            node.start_date = max(node.start_date, earliest_possible_start)
        node.end_date = node.start_date + timedelta(days=node.duration_days - 1)
    return graph


def compute_critical_path(graph: DependencyGraph, order: list[str] | None = None) -> list[str]:
    if not graph.nodes:
        return []
    if order is None:
        order = topological_order(graph)

    project_end = max(node.end_date for node in graph.nodes.values())
    latest_finish: dict[str, date] = {}

    for task_id in reversed(order):
        node = graph.nodes[task_id]
        dependents = graph.reverse_edges.get(task_id, set())
        if not dependents:
            latest_finish[task_id] = project_end
        else:
            latest_finish[task_id] = min(
                latest_finish[dep_id] - timedelta(days=graph.nodes[dep_id].duration_days)
                for dep_id in dependents
            )

    slack = {
        task_id: (latest_finish[task_id] - graph.nodes[task_id].end_date).days
        for task_id in graph.nodes
    }
    return [task_id for task_id, s in slack.items() if s == 0]
