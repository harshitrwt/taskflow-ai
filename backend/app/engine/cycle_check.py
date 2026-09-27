from .graph import DependencyGraph, is_reachable

def would_create_cycle(graph: DependencyGraph, task_id: str, depends_on_id: str) -> bool:
    if task_id == depends_on_id:
        return True
    return is_reachable(graph, depends_on_id, task_id)
