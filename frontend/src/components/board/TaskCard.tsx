import React, { useState } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import {
  Clock,
  AlertCircle,
  CheckCircle2,
  Calendar,
  ChevronRight,
  Trash2,
} from 'lucide-react';
import { Task, ColumnStatus } from '../../types';

interface TaskCardProps {
  task: Task;
  isCritical: boolean;
  onClick: () => void;
  onQuickAdvance?: (e: React.MouseEvent, task: Task) => void;
  onDeleteTask?: (task: Task) => void;
}

const NEXT_COLUMN: Record<ColumnStatus, ColumnStatus | null> = {
  backlog: 'in_progress',
  in_progress: 'review',
  review: 'done',
  done: null,
};

export const TaskCard: React.FC<TaskCardProps> = ({
  task,
  isCritical,
  onClick,
  onQuickAdvance,
  onDeleteTask,
}) => {
  const [showTooltip, setShowTooltip] = useState(false);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: task.id,
    data: { task },
  });

  const style: React.CSSProperties = {
    transform: CSS.Translate.toString(transform),
    transition,
    touchAction: 'none',
  };

  const isBlocked = task.computed_status === 'blocked';
  const blockerNames = task.blocked_by.map((b) => b.title).join(', ');
  const nextCol = NEXT_COLUMN[task.column_status];

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onClick={onClick}
      className={`task-card ${isDragging ? 'is-dragging' : ''} ${
        isCritical ? 'critical-path-highlight' : ''
      }`}
    >
      {/* Top Header: Status Badges */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', flexWrap: 'wrap' }}>
          {/* Blocked (Red) or Ready / Active (Green) Badge */}
          <div
            style={{ position: 'relative' }}
            onMouseEnter={() => setShowTooltip(true)}
            onMouseLeave={() => setShowTooltip(false)}
          >
            <span className={`badge ${isBlocked ? 'badge-blocked' : 'badge-ready'}`}>
              {isBlocked ? (
                <>
                  <AlertCircle size={11} /> Blocked
                </>
              ) : (
                <>
                  <CheckCircle2 size={11} /> Active
                </>
              )}
            </span>

            {/* Explainability Tooltip for Blocked State */}
            {isBlocked && showTooltip && (
              <div
                style={{
                  position: 'absolute',
                  top: '120%',
                  left: 0,
                  zIndex: 200,
                  background: '#0f172a',
                  border: '1px solid #334155',
                  padding: '0.45rem 0.7rem',
                  borderRadius: '0.375rem',
                  fontSize: '0.725rem',
                  color: '#f8fafc',
                  boxShadow: 'var(--shadow-md)',
                  whiteSpace: 'nowrap',
                  pointerEvents: 'none',
                }}
              >
                Waiting on: <strong>{blockerNames || 'Uncompleted prerequisites'}</strong>
              </div>
            )}
          </div>

          {/* Clean Critical Path Badge (No Flame Emoji) */}
          {isCritical && (
            <span
              className="badge"
              style={{
                background: '#0f172a',
                color: '#ffffff',
                border: '1px solid #0f172a',
              }}
              title="Zero slack — delaying this delays the whole project"
            >
              Critical
            </span>
          )}
        </div>

        {/* Duration badge */}
        <span
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.25rem',
            fontSize: '0.725rem',
            color: 'var(--text-muted)',
            fontFamily: 'var(--font-mono)',
          }}
        >
          <Clock size={11} />
          {task.duration_days}d
        </span>
      </div>

      {/* Task Title */}
      <h4
        style={{
          fontSize: '0.875rem',
          fontWeight: 700,
          color: '#0f172a',
          marginBottom: '0.3rem',
          lineHeight: 1.35,
        }}
      >
        {task.title}
      </h4>

      {/* Description Snippet */}
      {task.description && (
        <p
          style={{
            fontSize: '0.775rem',
            color: '#64748b',
            marginBottom: '0.65rem',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
          }}
        >
          {task.description}
        </p>
      )}

      {/* Explicit Dependency Breakdown */}
      {task.dependencies.length > 0 && (
        <div
          style={{
            background: isBlocked ? '#fff1f2' : '#f0fdf4',
            border: isBlocked ? '1px solid #ffe4e6' : '1px solid #dcfce7',
            borderRadius: '0.35rem',
            padding: '0.35rem 0.55rem',
            marginBottom: '0.6rem',
            fontSize: '0.725rem',
          }}
        >
          {isBlocked ? (
            <div style={{ color: '#b91c1c', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <AlertCircle size={12} style={{ flexShrink: 0 }} />
              <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                Waiting: {task.blocked_by.map((b) => b.title).join(', ')}
              </span>
            </div>
          ) : (
            <div style={{ color: '#15803d', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <CheckCircle2 size={12} style={{ flexShrink: 0 }} />
              <span>All {task.dependencies.length} prerequisites met</span>
            </div>
          )}
        </div>
      )}

      {/* Footer Details: Dates and Quick Advance */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          fontSize: '0.725rem',
          color: 'var(--text-muted)',
          borderTop: '1px solid var(--border-subtle)',
          paddingTop: '0.45rem',
        }}
      >
        {/* Schedule dates */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontFamily: 'var(--font-mono)' }}>
          <Calendar size={11} style={{ color: '#64748b' }} />
          <span>
            {task.start_date.slice(5)} → {task.end_date.slice(5)}
          </span>
        </div>

        {/* Quick advance button if not in done */}
        {nextCol && onQuickAdvance && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onQuickAdvance(e, task);
            }}
            title={`Advance to ${nextCol.replace('_', ' ')}`}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.15rem',
              background: '#f1f5f9',
              border: '1px solid #cbd5e1',
              color: '#0f172a',
              borderRadius: '0.25rem',
              padding: '0.15rem 0.45rem',
              fontSize: '0.675rem',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.15s',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = '#e2e8f0')}
            onMouseLeave={(e) => (e.currentTarget.style.background = '#f1f5f9')}
          >
            <span>Advance</span>
            <ChevronRight size={11} />
          </button>
        )}

        {/* Delete completed task button */}
        {task.column_status === 'done' && onDeleteTask && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onDeleteTask(task);
            }}
            title="Delete completed task"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.25rem',
              background: '#fef2f2',
              border: '1px solid #fecaca',
              color: '#b91c1c',
              borderRadius: '0.25rem',
              padding: '0.15rem 0.45rem',
              fontSize: '0.675rem',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.15s',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = '#fee2e2')}
            onMouseLeave={(e) => (e.currentTarget.style.background = '#fef2f2')}
          >
            <Trash2 size={11} />
            <span>Delete</span>
          </button>
        )}
      </div>
    </div>
  );
};
