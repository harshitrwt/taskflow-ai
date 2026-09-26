from .graph import DependencyGraph


def compute_status(graph: DependencyGraph) -> dict[str, str]:
    status: dict[str, str] = {}
    for task_id in graph.nodes:
        prerequisite_ids = graph.edges.get(task_id, set())
        all_done = all(graph.nodes[dep_id].column_status == 'done' for dep_id in prerequisite_ids)
        status[task_id] = 'ready' if all_done else 'blocked'
    return status


def compute_status_details(graph: DependencyGraph) -> dict[str, dict]:
    details: dict[str, dict] = {}
    for task_id in graph.nodes:
        prerequisite_ids = graph.edges.get(task_id, set())
        unmet = [dep_id for dep_id in prerequisite_ids if graph.nodes[dep_id].column_status != 'done']
        details[task_id] = {
            "status": "ready" if len(unmet) == 0 else "blocked",
            "blocked_by": unmet,
        }
    return details
