import React from 'react';
import { Calendar } from 'lucide-react';
import { Task } from '../../types';

interface CriticalPathViewProps {
  isActive: boolean;
  onToggle: () => void;
  criticalPathTaskIds: string[];
  tasks: Task[];
  projectEndDate: string | null;
}

export const CriticalPathView: React.FC<CriticalPathViewProps> = ({
  isActive,
  onToggle,
  criticalPathTaskIds,
  tasks,
  projectEndDate,
}) => {
  const taskMap = new Map(tasks.map((t) => [t.id, t]));
  const criticalTasks = criticalPathTaskIds
    .map((id) => taskMap.get(id))
    .filter((t): t is Task => t !== undefined);

  return (
    <div
      style={{
        background: '#ffffff',
        border: isActive ? '1px solid #0f172a' : '1px solid var(--border-subtle)',
        borderRadius: '0.5rem',
        padding: '0.75rem 1.25rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '0.85rem',
        boxShadow: isActive ? '0 1px 3px rgba(15, 23, 42, 0.12)' : 'var(--shadow-sm)',
        transition: 'all 0.15s ease',
      }}
    >
      {/* Left: Info & metrics */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
        <div>
          <h4 style={{ fontSize: '0.875rem', fontWeight: 700, color: '#0f172a' }}>
            Critical Path Method (CPM)
          </h4>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            Zero-slack sequence: delaying any of these tasks directly postpones the project completion date.
          </span>
        </div>

        {/* Project completion target */}
        {projectEndDate && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              background: '#f8fafc',
              padding: '0.25rem 0.55rem',
              borderRadius: '0.35rem',
              border: '1px solid var(--border-subtle)',
              fontSize: '0.75rem',
              fontFamily: 'var(--font-mono)',
            }}
          >
            <Calendar size={12} style={{ color: '#475569' }} />
            <span style={{ color: 'var(--text-muted)' }}>Project Finish:</span>
            <strong style={{ color: '#0f172a' }}>{projectEndDate}</strong>
          </div>
        )}

        {/* Critical Chain Length */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem',
            background: '#f8fafc',
            padding: '0.25rem 0.55rem',
            borderRadius: '0.35rem',
            border: '1px solid var(--border-subtle)',
            fontSize: '0.75rem',
          }}
        >
          <span style={{ color: 'var(--text-muted)' }}>Zero-Slack Chain:</span>
          <strong style={{ color: '#0f172a' }}>
            {criticalTasks.length} {criticalTasks.length === 1 ? 'task' : 'tasks'}
          </strong>
        </div>
      </div>

      {/* Right: Toggle Button */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        <button
          type="button"
          onClick={onToggle}
          className={`btn btn-critical ${isActive ? 'active' : ''}`}
          style={{ fontSize: '0.75rem', padding: '0.35rem 0.75rem' }}
        >
          {isActive ? 'Hide Critical Highlights' : 'Highlight Critical Path'}
        </button>
      </div>

      {/* If active, show visual chain sequence */}
      {isActive && criticalTasks.length > 0 && (
        <div
          style={{
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem',
            overflowX: 'auto',
            paddingTop: '0.4rem',
            borderTop: '1px solid var(--border-subtle)',
            fontSize: '0.75rem',
          }}
        >
          <span style={{ fontWeight: 700, color: '#0f172a', whiteSpace: 'nowrap' }}>
            Chain Sequence:
          </span>
          {criticalTasks.map((t, idx) => (
            <React.Fragment key={t.id}>
              <span
                style={{
                  background: '#f1f5f9',
                  color: '#0f172a',
                  padding: '0.15rem 0.45rem',
                  borderRadius: '0.25rem',
                  whiteSpace: 'nowrap',
                  border: '1px solid #cbd5e1',
                  fontSize: '0.725rem',
                  fontWeight: 600,
                }}
              >
                {t.title}
              </span>
              {idx < criticalTasks.length - 1 && (
                <span style={{ color: '#94a3b8', fontWeight: 700 }}>→</span>
              )}
            </React.Fragment>
          ))}
        </div>
      )}
    </div>
  );
};
