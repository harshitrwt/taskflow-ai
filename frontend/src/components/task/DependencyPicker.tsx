import React, { useState } from 'react';
import { Plus, Trash2, Search, AlertTriangle, ShieldCheck } from 'lucide-react';
import { Task } from '../../types';
import { useDependencies } from '../../hooks/useDependencies';

interface DependencyPickerProps {
  currentTask: Task;
  allTasks: Task[];
  onDependencyChanged: () => void;
}

export const DependencyPicker: React.FC<DependencyPickerProps> = ({
  currentTask,
  allTasks,
  onDependencyChanged,
}) => {
  const { addDependency, removeDependency } = useDependencies();
  const [searchTerm, setSearchTerm] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  // Existing prerequisites
  const currentPrereqIds = new Set(currentTask.dependencies);
  const currentPrereqs = allTasks.filter((t) => currentPrereqIds.has(t.id));

  // Candidates to add as prerequisites: cannot be self, and not already a prerequisite
  const availableCandidates = allTasks
    .filter((t) => t.id !== currentTask.id && !currentPrereqIds.has(t.id))
    .filter((t) =>
      t.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.description.toLowerCase().includes(searchTerm.toLowerCase())
    );

  const handleAdd = async (candidateId: string) => {
    setErrorMessage(null);
    setIsProcessing(true);
    try {
      await addDependency({
        taskId: currentTask.id,
        dependsOnTaskId: candidateId,
      });
      onDependencyChanged();
    } catch (err: any) {
      if (err?.error === 'cycle_detected') {
        setErrorMessage(
          err.message || 'Cannot add this dependency: it would cause a circular dependency cycle!'
        );
      } else {
        setErrorMessage(err?.message || 'Failed to add dependency.');
      }
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRemove = async (prereqId: string) => {
    setErrorMessage(null);
    setIsProcessing(true);
    try {
      await removeDependency(prereqId);
      onDependencyChanged();
    } catch (err: any) {
      setErrorMessage(err?.message || 'Failed to remove dependency.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
      <h4 style={{ fontSize: '0.85rem', fontWeight: 700, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
        <ShieldCheck size={16} style={{ color: '#0f172a' }} />
        Prerequisite Dependencies ({currentPrereqs.length})
      </h4>

      {/* Cycle Detection / Inline Error alert */}
      {errorMessage && (
        <div
          style={{
            background: '#fef2f2',
            border: '1px solid #fecaca',
            borderRadius: '0.45rem',
            padding: '0.65rem 0.85rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            color: '#b91c1c',
            fontSize: '0.8rem',
            fontWeight: 500,
          }}
        >
          <AlertTriangle size={16} style={{ flexShrink: 0 }} />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Current Prerequisites List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
        {currentPrereqs.length > 0 ? (
          currentPrereqs.map((prereq) => (
            <div
              key={prereq.id}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '0.5rem 0.75rem',
                background: '#ffffff',
                border: '1px solid var(--border-subtle)',
                borderRadius: '0.375rem',
                boxShadow: 'var(--shadow-sm)',
              }}
            >
              <div>
                <span style={{ fontSize: '0.825rem', fontWeight: 600, color: '#0f172a' }}>
                  {prereq.title}
                </span>
                <span
                  style={{
                    marginLeft: '0.5rem',
                    fontSize: '0.7rem',
                    fontWeight: 600,
                    color: prereq.column_status === 'done' ? '#15803d' : '#b91c1c',
                  }}
                >
                  ({prereq.column_status.replace('_', ' ')})
                </span>
              </div>

              <button
                type="button"
                onClick={() => handleRemove(prereq.id)}
                disabled={isProcessing}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: 'var(--text-muted)',
                  cursor: 'pointer',
                  padding: '0.2rem',
                }}
                title="Remove dependency"
              >
                <Trash2 size={14} />
              </button>
            </div>
          ))
        ) : (
          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>
            No prerequisite tasks. This task can start independently.
          </p>
        )}
      </div>

      {/* Add Prerequisite Search & Selection */}
      <div style={{ marginTop: '0.4rem' }}>
        <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#0f172a' }}>
          Add Prerequisite Task
        </span>
        <div style={{ position: 'relative', marginTop: '0.35rem', marginBottom: '0.5rem' }}>
          <Search
            size={14}
            style={{
              position: 'absolute',
              left: '0.65rem',
              top: '50%',
              transform: 'translateY(-50%)',
              color: 'var(--text-dim)',
            }}
          />
          <input
            type="text"
            placeholder="Search tasks to add as prerequisite..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              width: '100%',
              padding: '0.45rem 0.65rem 0.45rem 2rem',
              background: '#ffffff',
              border: '1px solid #cbd5e1',
              borderRadius: '0.375rem',
              color: '#0f172a',
              fontSize: '0.8rem',
              fontFamily: 'inherit',
            }}
          />
        </div>

        {/* Candidate List dropdown */}
        <div
          style={{
            maxHeight: '130px',
            overflowY: 'auto',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.25rem',
            border: '1px solid var(--border-subtle)',
            borderRadius: '0.375rem',
            padding: '0.35rem',
            background: '#ffffff',
          }}
        >
          {availableCandidates.length > 0 ? (
            availableCandidates.map((candidate) => (
              <button
                key={candidate.id}
                type="button"
                onClick={() => handleAdd(candidate.id)}
                disabled={isProcessing}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '0.4rem 0.6rem',
                  background: 'transparent',
                  border: 'none',
                  borderRadius: '0.25rem',
                  color: '#0f172a',
                  textAlign: 'left',
                  cursor: 'pointer',
                  fontSize: '0.8rem',
                  transition: 'background 0.15s',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = '#f1f5f9')}
                onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
              >
                <span>{candidate.title}</span>
                <Plus size={14} style={{ color: '#0f172a' }} />
              </button>
            ))
          ) : (
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', padding: '0.4rem', textAlign: 'center' }}>
              {searchTerm ? 'No matching tasks found' : 'All available tasks already connected'}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
