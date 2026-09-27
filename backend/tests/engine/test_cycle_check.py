from datetime import date
from app.engine.graph import TaskNode, build_graph
from app.engine.cycle_check import would_create_cycle


def test_cycle_rejected_direct():
    tasks = [
        TaskNode(id="A", duration_days=2, start_date=date(2026, 1, 1), end_date=date(2026, 1, 2), column_status="backlog"),
        TaskNode(id="B", duration_days=2, start_date=date(2026, 1, 3), end_date=date(2026, 1, 4), column_status="backlog"),
    ]
    # A depends on B
    graph = build_graph(tasks, [("A", "B")])

    # Attempting B depends on A creates a cycle
    assert would_create_cycle(graph, "B", "A") is True

    # Self-dependency creates a cycle
    assert would_create_cycle(graph, "A", "A") is True


def test_cycle_rejected_transitive():
    tasks = [
        TaskNode(id="A", duration_days=1, start_date=date(2026, 1, 1), end_date=date(2026, 1, 1), column_status="backlog"),
        TaskNode(id="B", duration_days=1, start_date=date(2026, 1, 2), end_date=date(2026, 1, 2), column_status="backlog"),
        TaskNode(id="C", duration_days=1, start_date=date(2026, 1, 3), end_date=date(2026, 1, 3), column_status="backlog"),
    ]
    # Chain: C depends on B, B depends on A (A -> B -> C)
    graph = build_graph(tasks, [("C", "B"), ("B", "A")])

    # Attempting A depends on C creates a transitive cycle
    assert would_create_cycle(graph, "A", "C") is True

    # Valid non-cyclic dependency: new node D depends on C
    d_node = TaskNode(id="D", duration_days=1, start_date=date(2026, 1, 4), end_date=date(2026, 1, 4), column_status="backlog")
    graph_with_d = build_graph(tasks + [d_node], [("C", "B"), ("B", "A")])
    assert would_create_cycle(graph_with_d, "D", "C") is False


def test_cycle_rejection_does_not_mutate_graph():
    tasks = [
        TaskNode(id="A", duration_days=1, start_date=date(2026, 1, 1), end_date=date(2026, 1, 1), column_status="backlog"),
        TaskNode(id="B", duration_days=1, start_date=date(2026, 1, 2), end_date=date(2026, 1, 2), column_status="backlog"),
    ]
    graph = build_graph(tasks, [("A", "B")])

    initial_edges = {k: set(v) for k, v in graph.edges.items()}
    initial_reverse = {k: set(v) for k, v in graph.reverse_edges.items()}

    # Check cycle
    cycle_detected = would_create_cycle(graph, "B", "A")
    assert cycle_detected is True

    # Assert graph was not mutated
    assert graph.edges == initial_edges
    assert graph.reverse_edges == initial_reverse
