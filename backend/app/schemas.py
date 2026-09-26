from datetime import date, datetime
from typing import Literal
from pydantic import BaseModel, Field, ConfigDict

ColumnStatusType = Literal["backlog", "in_progress", "review", "done"]
ComputedStatusType = Literal["ready", "blocked"]


class BlockedReason(BaseModel):
    id: str
    title: str


class TaskBase(BaseModel):
    title: str = Field(..., min_length=1, max_length=255)
    description: str = Field(default="")
    duration_days: int = Field(default=1, ge=1)
    start_date: date | None = None
    column_status: ColumnStatusType = "backlog"


class TaskCreate(TaskBase):
    pass


class TaskUpdate(BaseModel):
    title: str | None = Field(default=None, min_length=1, max_length=255)
    description: str | None = None
    duration_days: int | None = Field(default=None, ge=1)
    start_date: date | None = None
    column_status: ColumnStatusType | None = None


class TaskMove(BaseModel):
    column_status: ColumnStatusType


class TaskResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    title: str
    description: str
    column_status: ColumnStatusType
    duration_days: int
    start_date: date
    end_date: date
    computed_status: ComputedStatusType
    blocked_by: list[BlockedReason] = []
    dependencies: list[str] = []
    created_at: datetime
    updated_at: datetime


class DependencyCreate(BaseModel):
    task_id: str
    depends_on_task_id: str


class DependencyResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    task_id: str
    depends_on_task_id: str
    created_at: datetime


class CriticalPathResponse(BaseModel):
    critical_path: list[str]
    project_end_date: date | None = None
    slacks: dict[str, int] = {}


class AiSuggestionItem(BaseModel):
    task_id: str
    task_title: str
    confidence: float
    rationale: str


class AiSuggestionResponse(BaseModel):
    suggestions: list[AiSuggestionItem]


class ErrorResponse(BaseModel):
    error: str
    message: str
    detail: dict | None = None


class SimulateDelayRequest(BaseModel):
    task_id: str
    delay_days: int = Field(default=3, ge=0, le=60)
    apply_to_db: bool = False


class ImpactedTaskSimulation(BaseModel):
    id: str
    title: str
    original_start_date: date
    original_end_date: date
    simulated_start_date: date
    simulated_end_date: date
    shift_days: int
    is_critical: bool
    is_target: bool = False


class SimulateDelayResponse(BaseModel):
    target_task_id: str
    target_task_title: str
    delay_days: int
    baseline_project_end: date | None = None
    simulated_project_end: date | None = None
    project_delay_days: int
    critical_path: list[str]
    impacted_tasks: list[ImpactedTaskSimulation]
    max_precedence_rule_proven: bool
    explanation: str
    applied: bool = False


class AiGeneratedTask(BaseModel):
    key: str
    title: str
    description: str
    duration_days: int
    depends_on_keys: list[str] = []


class AiGenerateProjectRequest(BaseModel):
    prompt: str = Field(..., min_length=2, max_length=500)
    apply_to_db: bool = False


class AiGenerateProjectResponse(BaseModel):
    project_title: str
    summary: str
    tasks: list[AiGeneratedTask]
    is_acyclic: bool
    applied: bool = False
    task_count: int = 0

