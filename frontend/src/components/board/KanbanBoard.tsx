import React, { useState } from 'react';
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
  pointerWithin,
  closestCorners,
  CollisionDetection,
} from '@dnd-kit/core';
import { ColumnStatus, Task } from '../../types';
import { KanbanColumn } from './KanbanColumn';
import { TaskCard } from './TaskCard';

interface KanbanBoardProps {
  tasks: Task[];
  criticalPathTaskIds: string[];
  isCriticalPathActive: boolean;
  onMoveTask: (id: string, column: ColumnStatus) => Promise<any>;
  onSelectTask: (task: Task) => void;
  onNotify: (message: string, type: 'error' | 'success') => void;
  onDeleteTask?: (task: Task) => void;
}

const NEXT_COLUMN: Record<ColumnStatus, ColumnStatus | null> = {
  backlog: 'in_progress',
  in_progress: 'review',
  review: 'done',
  done: null,
};

const COLUMNS: { id: ColumnStatus; title: string; color: string }[] = [
  { id: 'backlog', title: 'Backlog', color: '#10b981' },
  { id: 'in_progress', title: 'In Progress', color: '#0f172a' },
  { id: 'review', title: 'Review', color: '#475569' },
  { id: 'done', title: 'Done', color: '#15803d' },
];

export const KanbanBoard: React.FC<KanbanBoardProps> = ({
  tasks,
  criticalPathTaskIds,
  isCriticalPathActive,
  onMoveTask,
  onSelectTask,
  onNotify,
  onDeleteTask,
}) => {
  const [activeTask, setActiveTask] = useState<Task | null>(null);

  // Snappy activation: starts dragging on minimal 3px movement without lag
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 3,
      },
    })
  );

  const criticalSet = isCriticalPathActive ? new Set(criticalPathTaskIds) : new Set<string>();

  // Custom collision strategy: pointerWithin takes absolute priority for Kanban columns
  const collisionDetectionStrategy: CollisionDetection = (args) => {
    const pointerCollisions = pointerWithin(args);
    if (pointerCollisions.length > 0) {
      return pointerCollisions;
    }
    return closestCorners(args);
  };

  const handleDragStart = (event: DragStartEvent) => {
    const task = tasks.find((t) => t.id === event.active.id);
    if (task) {
      setActiveTask(task);
    }
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveTask(null);

    if (!over) return;

    const taskId = active.id as string;
    const task = tasks.find((t) => t.id === taskId);
    if (!task) return;

    // Detect target column whether dropped directly over column, on its list, or on another card
    let targetColumn: ColumnStatus | null = null;
    if (COLUMNS.some((col) => col.id === over.id)) {
      targetColumn = over.id as ColumnStatus;
    } else if (over.data?.current?.column) {
      targetColumn = over.data.current.column as ColumnStatus;
    } else {
      const overTask = tasks.find((t) => t.id === over.id) || over.data?.current?.task;
      if (overTask) {
        targetColumn = overTask.column_status;
      }
    }

    if (!targetColumn || targetColumn === task.column_status) {
      return;
    }

    // Client-side UX validation: dragging a blocked task into 'done'
    if (task.computed_status === 'blocked' && targetColumn === 'done') {
      const unmet = task.blocked_by.map((b) => b.title).join(', ');
      onNotify(`Blocked — waiting on: ${unmet || 'unmet prerequisites'}`, 'error');
      return;
    }

    try {
      await onMoveTask(taskId, targetColumn);
      onNotify(`Moved "${task.title}" to ${targetColumn.replace('_', ' ')}`, 'success');
    } catch {
      onNotify('Failed to move task.', 'error');
    }
  };

  const handleQuickAdvance = async (e: React.MouseEvent, task: Task) => {
    e.stopPropagation();
    const next = NEXT_COLUMN[task.column_status];
    if (!next) return;

    if (task.computed_status === 'blocked' && next === 'done') {
      const unmet = task.blocked_by.map((b) => b.title).join(', ');
      onNotify(`Cannot advance to Done: waiting on ${unmet}`, 'error');
      return;
    }

    try {
      await onMoveTask(task.id, next);
      onNotify(`Advanced "${task.title}" to ${next.replace('_', ' ')}`, 'success');
    } catch {
      onNotify('Failed to advance task.', 'error');
    }
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={collisionDetectionStrategy}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="board-container">
        {COLUMNS.map((column) => {
          const columnTasks = tasks.filter((t) => t.column_status === column.id);
          return (
            <KanbanColumn
              key={column.id}
              id={column.id}
              title={column.title}
              color={column.color}
              tasks={columnTasks}
              criticalPathIds={criticalSet}
              onTaskClick={onSelectTask}
              onQuickAdvance={handleQuickAdvance}
              onDeleteTask={onDeleteTask}
            />
          );
        })}
      </div>

      <DragOverlay dropAnimation={{ duration: 150, easing: 'cubic-bezier(0.18, 0.67, 0.6, 1.22)' }}>
        {activeTask ? (
          <div style={{ transform: 'rotate(1.5deg)', opacity: 0.95, pointerEvents: 'none', width: '310px' }}>
            <TaskCard
              task={activeTask}
              isCritical={criticalSet.has(activeTask.id)}
              onClick={() => {}}
            />
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
};
