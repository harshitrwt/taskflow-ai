import React from 'react';
import { GitFork, AlertCircle, CheckCircle2 } from 'lucide-react';
import { Task } from '../../types';

interface DagFlowViewProps {
  tasks: Task[];
  criticalPathIds: string[];
  onSelectTask: (task: Task) => void;
}

export const DagFlowView: React.FC<DagFlowViewProps> = ({
  tasks,
  criticalPathIds,
  onSelectTask,
}) => {
  const criticalSet = new Set(criticalPathIds);
  const taskMap = new Map(tasks.map((t) => [t.id, t]));

  // Organize tasks into topological stages/tiers based on dependency depth
  const depthMap = new Map<string, number>();

  const computeDepth = (taskId: string, visited: Set<string> = new Set()): number => {
    if (depthMap.has(taskId)) return depthMap.get(taskId)!;
    if (visited.has(taskId)) return 0; // Guard
    visited.add(taskId);

    const task = taskMap.get(taskId);
    if (!task || task.dependencies.length === 0) {
      depthMap.set(taskId, 0);
      return 0;
    }

    const maxPrereqDepth = Math.max(
      ...task.dependencies.map((depId) => computeDepth(depId, new Set(visited)))
    );
    const d = maxPrereqDepth + 1;
    depthMap.set(taskId, d);
    return d;
  };

  tasks.forEach((t) => computeDepth(t.id));

  // Group by depth
  const maxDepth = Math.max(0, ...Array.from(depthMap.values()));
  const tiers: Task[][] = Array.from({ length: maxDepth + 1 }, () => []);
  tasks.forEach((t) => {
    const d = depthMap.get(t.id) || 0;
    tiers[d].push(t);
  });

  const tierLabels = [
    'Stage 1: Foundation & Setup',
    'Stage 2: Core Architecture',
    'Stage 3: Services & UI Components',
    'Stage 4: Integration & Testing (Diamond Convergences)',
    'Stage 5: Staging & Deployment',
    'Stage 6: Demonstration & Launch',
  ];

  return (
    <div
      style={{
        background: '#ffffff',
        border: '1px solid var(--border-subtle)',
        borderRadius: '0.625rem',
        padding: '1.25rem',
        overflowX: 'auto',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.75rem' }}>
        <div>
          <h3 style={{ fontSize: '1rem', fontWeight: 800, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <GitFork size={18} />
            Interactive DAG Topological Pipeline
          </h3>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            Strict Directed Acyclic Graph topology showing prerequisite flow, diamond convergences, and zero-slack chain.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', fontSize: '0.75rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            <span style={{ width: '10px', height: '10px', borderRadius: '2px', background: '#0f172a' }} />
            <span style={{ color: '#0f172a', fontWeight: 600 }}>Critical Path Node</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            <span style={{ width: '10px', height: '10px', borderRadius: '2px', background: '#15803d' }} />
            <span style={{ color: '#15803d', fontWeight: 600 }}>Active / Ready</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            <span style={{ width: '10px', height: '10px', borderRadius: '2px', background: '#b91c1c' }} />
            <span style={{ color: '#b91c1c', fontWeight: 600 }}>Blocked Task</span>
          </div>
        </div>
      </div>

      {/* Pipeline Tiers */}
      <div style={{ display: 'flex', gap: '1.25rem', alignItems: 'flex-start', minWidth: '920px' }}>
        {tiers.map((tierTasks, tierIdx) => (
          <div
            key={tierIdx}
            style={{
              flex: '1 0 250px',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.85rem',
            }}
          >
            {/* Tier Header */}
            <div
              style={{
                fontSize: '0.725rem',
                fontWeight: 700,
                color: '#0f172a',
                background: '#f1f5f9',
                border: '1px solid var(--border-subtle)',
                borderRadius: '0.375rem',
                padding: '0.4rem 0.65rem',
                textAlign: 'center',
                textTransform: 'uppercase',
                letterSpacing: '0.03em',
              }}
            >
              {tierLabels[tierIdx] || `Stage ${tierIdx + 1}`}
            </div>

            {/* Nodes in this tier */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {tierTasks.map((task) => {
                const isCrit = criticalSet.has(task.id);
                const isBlocked = task.computed_status === 'blocked';

                return (
                  <div
                    key={task.id}
                    onClick={() => onSelectTask(task)}
                    style={{
                      background: '#ffffff',
                      border: isCrit
                        ? '2px solid #0f172a'
                        : isBlocked
                        ? '1px solid #fecaca'
                        : '1px solid var(--border-subtle)',
                      boxShadow: isCrit ? '0 2px 4px rgba(15, 23, 42, 0.12)' : 'var(--shadow-sm)',
                      borderRadius: '0.5rem',
                      padding: '0.85rem',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease',
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.transform = 'translateY(-1px)')}
                    onMouseLeave={(e) => (e.currentTarget.style.transform = 'translateY(0)')}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
                      <span
                        style={{
                          fontSize: '0.65rem',
                          fontFamily: 'var(--font-mono)',
                          color: '#475569',
                          fontWeight: 700,
                          background: '#f1f5f9',
                          padding: '0.1rem 0.4rem',
                          borderRadius: '0.25rem',
                        }}
                      >
                        {task.column_status.replace('_', ' ').toUpperCase()}
                      </span>

                      {isCrit && (
                        <span
                          style={{
                            color: '#0f172a',
                            background: '#f1f5f9',
                            border: '1px solid #cbd5e1',
                            borderRadius: '999px',
                            padding: '0.1rem 0.45rem',
                            fontSize: '0.65rem',
                            fontWeight: 700,
                            letterSpacing: '0.02em',
                          }}
                        >
                          CPM
                        </span>
                      )}
                    </div>

                    <h5 style={{ fontSize: '0.85rem', fontWeight: 700, color: '#0f172a', marginBottom: '0.35rem', lineHeight: 1.3 }}>
                      {task.title}
                    </h5>

                    {/* Precedence info */}
                    <div style={{ fontSize: '0.725rem', color: 'var(--text-muted)', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                        <span>Duration:</span>
                        <strong style={{ color: '#0f172a' }}>{task.duration_days}d</strong>
                        <span style={{ margin: '0 0.2rem' }}>•</span>
                        <span>Dates:</span>
                        <strong style={{ color: '#0f172a' }}>{task.start_date.slice(5)} → {task.end_date.slice(5)}</strong>
                      </div>

                      {task.dependencies.length > 0 && (
                        <div
                          style={{
                            marginTop: '0.25rem',
                            color: isBlocked ? '#b91c1c' : '#15803d',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.3rem',
                            fontWeight: 600,
                          }}
                        >
                          {isBlocked ? <AlertCircle size={12} /> : <CheckCircle2 size={12} />}
                          <span>{task.dependencies.length} prerequisite(s)</span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
