from datetime import date, timedelta
from app.engine.graph import TaskNode, build_graph
from app.engine.scheduler import recompute_schedule, compute_critical_path, topological_order


def test_diamond_convergence_no_double_count():
    """
    Canonical diamond from SDD Section 8.6:
          ┌──► B ──┐
       A ───┤        ├──► D
          └──► C ──┘
    A: 2 days (Jan 1 - Jan 2)
    B: 2 days (Jan 3 - Jan 4) depends on A
    C: 3 days (Jan 3 - Jan 5) depends on A
    D: 2 days (Jan 6 - Jan 7) depends on B and C

    When A is extended by 3 days (duration 2 -> 5, end_date Jan 5):
    - B earliest start becomes Jan 6, end Jan 7
    - C earliest start becomes Jan 6, end Jan 8
    - D earliest start becomes max(B.end, C.end) + 1 = Jan 8 + 1 = Jan 9, end Jan 10.
    D shifted by exactly 3 days (Jan 7 -> Jan 10), NEVER 6 days!
    """
    node_a = TaskNode(id="A", duration_days=2, start_date=date(2026, 1, 1), end_date=date(2026, 1, 2), column_status="backlog")
    node_b = TaskNode(id="B", duration_days=2, start_date=date(2026, 1, 3), end_date=date(2026, 1, 4), column_status="backlog")
    node_c = TaskNode(id="C", duration_days=3, start_date=date(2026, 1, 3), end_date=date(2026, 1, 5), column_status="backlog")
    node_d = TaskNode(id="D", duration_days=2, start_date=date(2026, 1, 6), end_date=date(2026, 1, 7), column_status="backlog")

    # Dependency pairs: (task_id, depends_on_id)
    # B depends on A, C depends on A, D depends on B, D depends on C
    deps = [("B", "A"), ("C", "A"), ("D", "B"), ("D", "C")]
    graph = build_graph([node_a, node_b, node_c, node_d], deps)

    recompute_schedule(graph)
    assert graph.nodes["A"].end_date == date(2026, 1, 2)
    assert graph.nodes["B"].start_date == date(2026, 1, 3)
    assert graph.nodes["C"].start_date == date(2026, 1, 3)
    assert graph.nodes["D"].start_date == date(2026, 1, 6)
    assert graph.nodes["D"].end_date == date(2026, 1, 7)

    # Now extend A's duration by 3 days (2 -> 5)
    graph.nodes["A"].duration_days = 5
    recompute_schedule(graph)

    # A ends on Jan 5
    assert graph.nodes["A"].end_date == date(2026, 1, 5)
    # B starts Jan 6, ends Jan 7
    assert graph.nodes["B"].start_date == date(2026, 1, 6)
    assert graph.nodes["B"].end_date == date(2026, 1, 7)
    # C starts Jan 6, ends Jan 8
    assert graph.nodes["C"].start_date == date(2026, 1, 6)
    assert graph.nodes["C"].end_date == date(2026, 1, 8)
    # D must start on Jan 9 (max(Jan 7, Jan 8) + 1), ending Jan 10
    assert graph.nodes["D"].start_date == date(2026, 1, 9)
    assert graph.nodes["D"].end_date == date(2026, 1, 10)

    # Shift is exactly 3 days (from Jan 7 to Jan 10), proving NO compounding
    assert (graph.nodes["D"].end_date - date(2026, 1, 7)).days == 3


def test_deep_chain_propagation():
    """
    Chain: T1 -> T2 -> T3 -> T4 -> T5
    Each 2 days duration.
    Delay at T1 must propagate correctly through every level.
    """
    nodes = [
        TaskNode(id=f"T{i}", duration_days=2, start_date=date(2026, 1, 1), end_date=date(2026, 1, 2), column_status="backlog")
        for i in range(1, 6)
    ]
    deps = [(f"T{i}", f"T{i-1}") for i in range(2, 6)]
    graph = build_graph(nodes, deps)

    recompute_schedule(graph)
    # T1: 1-2, T2: 3-4, T3: 5-6, T4: 7-8, T5: 9-10
    assert graph.nodes["T5"].start_date == date(2026, 1, 9)
    assert graph.nodes["T5"].end_date == date(2026, 1, 10)

    # Delay T1 by 4 days (start_date Jan 5)
    graph.nodes["T1"].start_date = date(2026, 1, 5)
    recompute_schedule(graph)

    # T1: 5-6, T2: 7-8, T3: 9-10, T4: 11-12, T5: 13-14
    assert graph.nodes["T1"].end_date == date(2026, 1, 6)
    assert graph.nodes["T5"].start_date == date(2026, 1, 13)
    assert graph.nodes["T5"].end_date == date(2026, 1, 14)


def test_critical_path_detection():
    """
    Diamond where C is longer than B:
    A (2d) -> B (1d) -> D (2d)
    A (2d) -> C (4d) -> D (2d)
    Critical path is [A, C, D] because C has 0 slack while B has slack.
    """
    node_a = TaskNode(id="A", duration_days=2, start_date=date(2026, 1, 1), end_date=date(2026, 1, 2), column_status="backlog")
    node_b = TaskNode(id="B", duration_days=1, start_date=date(2026, 1, 3), end_date=date(2026, 1, 3), column_status="backlog")
    node_c = TaskNode(id="C", duration_days=4, start_date=date(2026, 1, 3), end_date=date(2026, 1, 6), column_status="backlog")
    node_d = TaskNode(id="D", duration_days=2, start_date=date(2026, 1, 7), end_date=date(2026, 1, 8), column_status="backlog")

    deps = [("B", "A"), ("C", "A"), ("D", "B"), ("D", "C")]
    graph = build_graph([node_a, node_b, node_c, node_d], deps)
    recompute_schedule(graph)

    crit_path = compute_critical_path(graph)
    assert "A" in crit_path
    assert "C" in crit_path
    assert "D" in crit_path
    assert "B" not in crit_path
