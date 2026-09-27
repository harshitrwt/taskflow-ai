import json
import pytest
from unittest.mock import patch
from httpx import AsyncClient, Response
from app.services.llm_service import validate_suggestions
from app.engine.graph import TaskNode, build_graph
from datetime import date


def test_hallucinated_task_id_is_dropped():
    candidate_map = {"real-task-1": "Real Task 1"}
    tasks = [
        TaskNode(id="target-task", duration_days=1, start_date=date(2026, 1, 1), end_date=date(2026, 1, 1), column_status="backlog"),
        TaskNode(id="real-task-1", duration_days=1, start_date=date(2026, 1, 1), end_date=date(2026, 1, 1), column_status="backlog"),
    ]
    graph = build_graph(tasks, [])

    mock_llm_payload = json.dumps({
        "suggestions": [
            {"task_id": "hallucinated-id-999", "confidence": 0.95, "rationale": "Made up task"},
            {"task_id": "real-task-1", "confidence": 0.85, "rationale": "Actual prerequisite"},
        ]
    })

    result = validate_suggestions(mock_llm_payload, "target-task", candidate_map, graph)
    assert len(result) == 1
    assert result[0]["task_id"] == "real-task-1"
    assert result[0]["task_title"] == "Real Task 1"


def test_low_confidence_suggestion_filtered():
    candidate_map = {"task-1": "Task 1", "task-2": "Task 2"}
    tasks = [
        TaskNode(id="target", duration_days=1, start_date=date(2026, 1, 1), end_date=date(2026, 1, 1), column_status="backlog"),
        TaskNode(id="task-1", duration_days=1, start_date=date(2026, 1, 1), end_date=date(2026, 1, 1), column_status="backlog"),
        TaskNode(id="task-2", duration_days=1, start_date=date(2026, 1, 1), end_date=date(2026, 1, 1), column_status="backlog"),
    ]
    graph = build_graph(tasks, [])

    mock_llm_payload = json.dumps({
        "suggestions": [
            {"task_id": "task-1", "confidence": 0.20, "rationale": "Weak connection"},
            {"task_id": "task-2", "confidence": 0.88, "rationale": "Strong connection"},
        ]
    })

    result = validate_suggestions(mock_llm_payload, "target", candidate_map, graph, min_confidence=0.5)
    assert len(result) == 1
    assert result[0]["task_id"] == "task-2"


@pytest.mark.asyncio
async def test_llm_failure_returns_empty_list_not_500(client: AsyncClient):
    # Create target task and candidate task first
    res = await client.post("/api/v1/tasks", json={"title": "Target Task", "duration_days": 1})
    task = res.json()
    await client.post("/api/v1/tasks", json={"title": "Candidate Task", "duration_days": 1})

    # Mock query_groq_suggestions to simulate network failure or exception
    with patch("app.api.ai_suggestions.query_groq_suggestions", side_effect=Exception("Groq network connection timeout")):
        resp = await client.post(f"/api/v1/tasks/{task['id']}/suggest-dependencies")
        # Must return 200 OK with empty suggestions list, NEVER 500
        assert resp.status_code == 200
        data = resp.json()
        assert "suggestions" in data
        assert data["suggestions"] == []


@pytest.mark.asyncio
async def test_ai_generate_project_acyclic(client: AsyncClient):
    resp = await client.post("/api/v1/ai/generate-project", json={
        "prompt": "Autonomous Drone Fleet Delivery Network",
        "apply_to_db": True,
    })
    assert resp.status_code == 200
    data = resp.json()
    assert data["is_acyclic"] is True
    assert data["applied"] is True
    assert len(data["tasks"]) >= 6

    # Verify that tasks were saved to DB and can be queried
    tasks_res = await client.get("/api/v1/tasks")
    assert tasks_res.status_code == 200
    tasks = tasks_res.json()
    assert len(tasks) == len(data["tasks"])




