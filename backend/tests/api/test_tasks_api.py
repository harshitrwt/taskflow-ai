import pytest
from httpx import AsyncClient


@pytest.mark.asyncio
async def test_add_dependency_persists_and_recomputes(client: AsyncClient):
    # 1. Create Task A (duration 2 days)
    res_a = await client.post("/api/v1/tasks", json={
        "title": "Task A",
        "description": "Base task",
        "duration_days": 2,
        "column_status": "backlog",
    })
    assert res_a.status_code == 201
    task_a = res_a.json()

    # 2. Create Task B (duration 3 days)
    res_b = await client.post("/api/v1/tasks", json={
        "title": "Task B",
        "description": "Dependent task",
        "duration_days": 3,
        "column_status": "backlog",
    })
    assert res_b.status_code == 201
    task_b = res_b.json()

    # Before dependency, Task B is ready and has initial dates
    assert task_b["computed_status"] == "ready"

    # 3. Add dependency: Task B depends on Task A
    res_dep = await client.post("/api/v1/dependencies", json={
        "task_id": task_b["id"],
        "depends_on_task_id": task_a["id"],
    })
    assert res_dep.status_code == 201

    # 4. Fetch tasks and verify downstream dates and status updated
    res_tasks = await client.get("/api/v1/tasks")
    tasks = {t["id"]: t for t in res_tasks.json()}

    # Task B should now be blocked because Task A is in backlog
    assert tasks[task_b["id"]]["computed_status"] == "blocked"
    assert len(tasks[task_b["id"]]["blocked_by"]) == 1
    assert tasks[task_b["id"]]["blocked_by"][0]["id"] == task_a["id"]

    # Verify schedule propagation: B's start date is >= A's end date + 1 day
    a_end = tasks[task_a["id"]]["end_date"]
    b_start = tasks[task_b["id"]]["start_date"]
    assert b_start > a_end


@pytest.mark.asyncio
async def test_add_cycle_returns_409_and_no_write(client: AsyncClient):
    # Create Task 1 and Task 2
    res1 = await client.post("/api/v1/tasks", json={"title": "T1", "duration_days": 1})
    t1 = res1.json()
    res2 = await client.post("/api/v1/tasks", json={"title": "T2", "duration_days": 1})
    t2 = res2.json()

    # Add T2 depends on T1
    res_dep1 = await client.post("/api/v1/dependencies", json={
        "task_id": t2["id"],
        "depends_on_task_id": t1["id"],
    })
    assert res_dep1.status_code == 201

    # Attempt cycle: T1 depends on T2
    res_cycle = await client.post("/api/v1/dependencies", json={
        "task_id": t1["id"],
        "depends_on_task_id": t2["id"],
    })
    # Must return 409 Conflict
    assert res_cycle.status_code == 409
    cycle_body = res_cycle.json()
    assert cycle_body["error"] == "cycle_detected"

    # Verify no write occurred: T1 still has no dependencies
    res_tasks = await client.get("/api/v1/tasks")
    tasks = {t["id"]: t for t in res_tasks.json()}
    assert len(tasks[t1["id"]]["dependencies"]) == 0


@pytest.mark.asyncio
async def test_simulate_delay_diamond_non_compounding(client: AsyncClient):
    # Construct diamond A -> B, A -> C, B -> D, C -> D
    res_a = await client.post("/api/v1/tasks", json={"title": "Sim A", "duration_days": 2})
    a = res_a.json()
    res_b = await client.post("/api/v1/tasks", json={"title": "Sim B", "duration_days": 3})
    b = res_b.json()
    res_c = await client.post("/api/v1/tasks", json={"title": "Sim C", "duration_days": 3})
    c = res_c.json()
    res_d = await client.post("/api/v1/tasks", json={"title": "Sim D", "duration_days": 2})
    d = res_d.json()

    await client.post("/api/v1/dependencies", json={"task_id": b["id"], "depends_on_task_id": a["id"]})
    await client.post("/api/v1/dependencies", json={"task_id": c["id"], "depends_on_task_id": a["id"]})
    await client.post("/api/v1/dependencies", json={"task_id": d["id"], "depends_on_task_id": b["id"]})
    await client.post("/api/v1/dependencies", json={"task_id": d["id"], "depends_on_task_id": c["id"]})

    # Simulate +3 days delay on A
    res_sim = await client.post("/api/v1/tasks/simulate-delay", json={"task_id": a["id"], "delay_days": 3, "apply_to_db": False})
    assert res_sim.status_code == 200
    data = res_sim.json()

    assert data["target_task_id"] == a["id"]
    assert data["delay_days"] == 3
    assert data["project_delay_days"] == 3
    assert data["max_precedence_rule_proven"] is True

    # Assert downstream task D shifted by exactly 3 days (not 3+3=6)
    impacted = {t["id"]: t for t in data["impacted_tasks"]}
    assert d["id"] in impacted
    assert impacted[d["id"]]["shift_days"] == 3

