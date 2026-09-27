from datetime import date
from app.engine.graph import TaskNode, build_graph
from app.engine.status import compute_status, compute_status_details


def test_zero_prerequisites_is_ready():
    tasks = [
        TaskNode(id="A", duration_days=1, start_date=date(2026, 1, 1), end_date=date(2026, 1, 1), column_status="backlog")
    ]
    graph = build_graph(tasks, [])
    status = compute_status(graph)
    assert status["A"] == "ready"


def test_partial_prerequisites_still_blocked():
    tasks = [
        TaskNode(id="P1", duration_days=1, start_date=date(2026, 1, 1), end_date=date(2026, 1, 1), column_status="done"),
        TaskNode(id="P2", duration_days=1, start_date=date(2026, 1, 1), end_date=date(2026, 1, 1), column_status="done"),
        TaskNode(id="P3", duration_days=1, start_date=date(2026, 1, 1), end_date=date(2026, 1, 1), column_status="in_progress"),
        TaskNode(id="T", duration_days=1, start_date=date(2026, 1, 2), end_date=date(2026, 1, 2), column_status="backlog"),
    ]
    # T depends on P1, P2, P3
    deps = [("T", "P1"), ("T", "P2"), ("T", "P3")]
    graph = build_graph(tasks, deps)
    status = compute_status(graph)
    assert status["T"] == "blocked"

    details = compute_status_details(graph)
    assert details["T"]["status"] == "blocked"
    assert details["T"]["blocked_by"] == ["P3"]


def test_rollback_reblocks_dependents():
    tasks = [
        TaskNode(id="T1", duration_days=1, start_date=date(2026, 1, 1), end_date=date(2026, 1, 1), column_status="done"),
        TaskNode(id="T2", duration_days=1, start_date=date(2026, 1, 2), end_date=date(2026, 1, 2), column_status="done"),
        TaskNode(id="T3", duration_days=1, start_date=date(2026, 1, 3), end_date=date(2026, 1, 3), column_status="backlog"),
    ]
    deps = [("T2", "T1"), ("T3", "T2")]
    graph = build_graph(tasks, deps)

    # When T1 and T2 are done, T3 is ready
    status = compute_status(graph)
    assert status["T3"] == "ready"

    # Regression: T1 is moved back from done to in_progress
    graph.nodes["T1"].column_status = "in_progress"
    status_after_rollback = compute_status(graph)

    # T2 now has an unmet prerequisite (T1), so T2 is blocked
    assert status_after_rollback["T2"] == "blocked"
    # T3 still has prerequisite T2 which is done in column_status, but let's check:
    # If T2 is moved back to in_progress as well:
    graph.nodes["T2"].column_status = "in_progress"
    status_both_rolled = compute_status(graph)
    assert status_both_rolled["T3"] == "blocked"


def test_status_unaffected_by_unrelated_branch():
    """
    Branch 1: A -> B
    Branch 2: C -> D
    A changes from done to in_progress.
    D's status must remain unaffected by what happened to A.
    """
    tasks = [
        TaskNode(id="A", duration_days=1, start_date=date(2026, 1, 1), end_date=date(2026, 1, 1), column_status="done"),
        TaskNode(id="B", duration_days=1, start_date=date(2026, 1, 2), end_date=date(2026, 1, 2), column_status="backlog"),
        TaskNode(id="C", duration_days=1, start_date=date(2026, 1, 1), end_date=date(2026, 1, 1), column_status="done"),
        TaskNode(id="D", duration_days=1, start_date=date(2026, 1, 2), end_date=date(2026, 1, 2), column_status="backlog"),
    ]
    deps = [("B", "A"), ("D", "C")]
    graph = build_graph(tasks, deps)

    status_before = compute_status(graph)
    assert status_before["B"] == "ready"
    assert status_before["D"] == "ready"

    # Rollback branch 1: A becomes in_progress
    graph.nodes["A"].column_status = "in_progress"
    status_after = compute_status(graph)

    assert status_after["B"] == "blocked"
    # Unrelated branch 2 remains completely ready
    assert status_after["D"] == "ready"
