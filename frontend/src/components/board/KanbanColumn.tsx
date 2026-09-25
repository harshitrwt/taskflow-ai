import React from 'react';
import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { ColumnStatus, Task } from '../../types';
import { TaskCard } from './TaskCard';

interface KanbanColumnProps {
  id: ColumnStatus;
  title: string;
  tasks: Task[];
  criticalPathIds: Set<string>;
  color: string;
  onTaskClick: (task: Task) => void;
  onQuickAdvance?: (e: React.MouseEvent, task: Task) => void;
  onDeleteTask?: (task: Task) => void;
}

export const KanbanColumn: React.FC<KanbanColumnProps> = ({
  id,
  title,
  tasks,
  criticalPathIds,
  color,
  onTaskClick,
  onQuickAdvance,
  onDeleteTask,
}) => {
  const { setNodeRef, isOver } = useDroppable({
    id,
    data: { column: id },
  });

  return (
    <div
      ref={setNodeRef}
      className="kanban-column"
      style={{
        borderColor: isOver ? '#0f172a' : 'var(--border-subtle)',
        boxShadow: isOver ? '0 0 0 2px #0f172a' : 'var(--shadow-sm)',
      }}
    >
      {/* Column Header */}
      <div className="column-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <span
            style={{
              width: '8px',
              height: '8px',
              borderRadius: '999px',
              backgroundColor: color,
            }}
          />
          <h3 style={{ fontSize: '0.825rem', fontWeight: 800, letterSpacing: '0.04em', textTransform: 'uppercase', color: '#0f172a' }}>
            {title}
          </h3>
        </div>

        <span
          style={{
            background: '#f1f5f9',
            color: '#0f172a',
            border: '1px solid var(--border-subtle)',
            padding: '0.1rem 0.5rem',
            borderRadius: '999px',
            fontSize: '0.725rem',
            fontWeight: 700,
            fontFamily: 'var(--font-mono)',
          }}
        >
          {tasks.length}
        </span>
      </div>

      {/* Cards List */}
      <div className="column-cards-list">
        <SortableContext items={tasks.map((t) => t.id)} strategy={verticalListSortingStrategy}>
          {tasks.length > 0 ? (
            tasks.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                isCritical={criticalPathIds.has(task.id)}
                onClick={() => onTaskClick(task)}
                onQuickAdvance={onQuickAdvance}
                onDeleteTask={onDeleteTask}
              />
            ))
          ) : (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                height: '90px',
                border: '1px dashed #cbd5e1',
                borderRadius: '0.45rem',
                color: 'var(--text-dim)',
                fontSize: '0.775rem',
                background: '#ffffff',
              }}
            >
              No tasks in this stage
            </div>
          )}
        </SortableContext>
      </div>
    </div>
  );
};
