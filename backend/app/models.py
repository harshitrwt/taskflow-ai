import uuid
from datetime import datetime, timezone
from sqlalchemy import (
    Column,
    String,
    Text,
    Integer,
    Date,
    DateTime,
    ForeignKey,
    UniqueConstraint,
    CheckConstraint,
    Index,
)
from sqlalchemy.orm import declarative_base, relationship

Base = declarative_base()


def utc_now() -> datetime:
    return datetime.now(timezone.utc)


class Task(Base):
    __tablename__ = "tasks"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=False, default="")
    column_status = Column(
        String(50),
        nullable=False,
        default="backlog",
    )  # 'backlog' | 'in_progress' | 'review' | 'done'
    duration_days = Column(Integer, nullable=False, default=1)
    start_date = Column(Date, nullable=False)
    end_date = Column(Date, nullable=False)
    created_at = Column(DateTime(timezone=True), default=utc_now, nullable=False)
    updated_at = Column(DateTime(timezone=True), default=utc_now, onupdate=utc_now, nullable=False)

    __table_args__ = (
        CheckConstraint(
            "column_status IN ('backlog', 'in_progress', 'review', 'done')",
            name="ck_task_column_status",
        ),
        CheckConstraint("duration_days >= 1", name="ck_task_duration_positive"),
    )


class Dependency(Base):
    __tablename__ = "dependencies"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    task_id = Column(
        String(36),
        ForeignKey("tasks.id", ondelete="CASCADE"),
        nullable=False,
    )
    depends_on_task_id = Column(
        String(36),
        ForeignKey("tasks.id", ondelete="CASCADE"),
        nullable=False,
    )
    created_at = Column(DateTime(timezone=True), default=utc_now, nullable=False)

    __table_args__ = (
        UniqueConstraint("task_id", "depends_on_task_id", name="uq_task_dependency"),
        CheckConstraint("task_id <> depends_on_task_id", name="ck_no_self_dependency"),
        Index("idx_dependencies_task_id", "task_id"),
        Index("idx_dependencies_depends_on", "depends_on_task_id"),
    )
