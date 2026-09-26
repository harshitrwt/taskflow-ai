from .graph import DependencyGraph, is_reachable


def would_create_cycle(graph: DependencyGraph, task_id: str, depends_on_id: str) -> bool:
    if task_id == depends_on_id:
        return True
    # Adding "task_id depends_on depends_on_id" creates a cycle exactly when
    # depends_on_id can already reach task_id (i.e. task_id is upstream of it).
    return is_reachable(graph, depends_on_id, task_id)
