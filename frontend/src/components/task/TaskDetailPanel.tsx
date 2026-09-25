import React, { useState } from 'react';
import {
  X,
  Sparkles,
  Save,
  Trash2,
  Calendar,
  Clock,
  Columns,
  AlertCircle,
  CheckCircle2,
  Loader2,
} from 'lucide-react';
import { Task, ColumnStatus, AiSuggestion } from '../../types';
import { DependencyPicker } from './DependencyPicker';
import { AiSuggestionChip } from './AiSuggestionChip';
import { api } from '../../api/client';
import { useDependencies } from '../../hooks/useDependencies';

interface TaskDetailPanelProps {
  task: Task;
  allTasks: Task[];
  onClose: () => void;
  onUpdate: (id: string, updates: any) => Promise<any>;
  onDelete: (id: string) => Promise<any>;
  onTaskRefreshed: () => void;
}

export const TaskDetailPanel: React.FC<TaskDetailPanelProps> = ({
  task,
  allTasks,
  onClose,
  onUpdate,
  onDelete,
  onTaskRefreshed,
}) => {
  const { addDependency } = useDependencies();

  const [title, setTitle] = useState(task.title);
  const [description, setDescription] = useState(task.description);
  const [durationDays, setDurationDays] = useState(task.duration_days);
  const [startDate, setStartDate] = useState(task.start_date);
  const [columnStatus, setColumnStatus] = useState<ColumnStatus>(task.column_status);

  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);

  // AI suggestions state
  const [suggestions, setSuggestions] = useState<AiSuggestion[]>([]);
  const [isLoadingAi, setIsLoadingAi] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);
  const [acceptingId, setAcceptingId] = useState<string | null>(null);

  const isBlocked = task.computed_status === 'blocked';

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setSaveMessage(null);
    try {
      await onUpdate(task.id, {
        title,
        description,
        duration_days: Number(durationDays),
        start_date: startDate,
        column_status: columnStatus,
      });
      setSaveMessage('Saved successfully!');
      setTimeout(() => setSaveMessage(null), 2500);
      onTaskRefreshed();
    } catch {
      setSaveMessage('Error saving task.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm(`Are you sure you want to delete "${task.title}"?`)) return;
    setIsDeleting(true);
    try {
      await onDelete(task.id);
      onClose();
    } catch {
      alert('Failed to delete task.');
      setIsDeleting(false);
    }
  };

  const handleFetchAiSuggestions = async () => {
    setIsLoadingAi(true);
    setAiError(null);
    try {
      const resp = await api.suggestDependencies(task.id);
      if (resp.suggestions.length === 0) {
        setAiError('No suitable prerequisites found or all connected.');
      } else {
        setSuggestions(resp.suggestions);
      }
    } catch {
      setAiError('Failed to fetch AI suggestions.');
    } finally {
      setIsLoadingAi(false);
    }
  };

  const handleAcceptSuggestion = async (suggestion: AiSuggestion) => {
    setAcceptingId(suggestion.task_id);
    try {
      await addDependency({
        taskId: task.id,
        dependsOnTaskId: suggestion.task_id,
      });
      setSuggestions((prev) => prev.filter((s) => s.task_id !== suggestion.task_id));
      onTaskRefreshed();
    } catch (err: any) {
      alert(err?.message || 'Could not add suggested dependency.');
    } finally {
      setAcceptingId(null);
    }
  };

  const handleRejectSuggestion = (suggestion: AiSuggestion) => {
    setSuggestions((prev) => prev.filter((s) => s.task_id !== suggestion.task_id));
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '1.15rem 1.4rem',
            borderBottom: '1px solid var(--border-subtle)',
            background: '#ffffff',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <span className={`badge ${isBlocked ? 'badge-blocked' : 'badge-ready'}`}>
              {isBlocked ? (
                <>
                  <AlertCircle size={12} /> Blocked
                </>
              ) : (
                <>
                  <CheckCircle2 size={12} /> Active
                </>
              )}
            </span>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
              ID: {task.id.slice(0, 8)}...
            </span>
          </div>

          <button
            type="button"
            onClick={onClose}
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--text-muted)',
              cursor: 'pointer',
              padding: '0.25rem',
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSave} style={{ padding: '1.25rem 1.4rem', display: 'flex', flexDirection: 'column', gap: '1.15rem' }}>
          {/* Title */}
          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#334155', marginBottom: '0.35rem' }}>
              Task Title
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              style={{
                width: '100%',
                padding: '0.55rem 0.75rem',
                background: '#ffffff',
                border: '1px solid #cbd5e1',
                borderRadius: '0.4rem',
                color: '#0f172a',
                fontSize: '0.9rem',
                fontFamily: 'inherit',
              }}
            />
          </div>

          {/* Description */}
          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#334155', marginBottom: '0.35rem' }}>
              Description
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What needs to be accomplished in this task?"
              style={{
                width: '100%',
                padding: '0.55rem 0.75rem',
                background: '#ffffff',
                border: '1px solid #cbd5e1',
                borderRadius: '0.4rem',
                color: '#0f172a',
                fontSize: '0.825rem',
                fontFamily: 'inherit',
                resize: 'vertical',
              }}
            />
          </div>

          {/* Grid row: Stage, Duration, Start Date, End Date */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '0.85rem' }}>
            <div>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.75rem', fontWeight: 700, color: '#334155', marginBottom: '0.35rem' }}>
                <Columns size={12} /> Stage
              </label>
              <select
                value={columnStatus}
                onChange={(e) => setColumnStatus(e.target.value as ColumnStatus)}
                style={{
                  width: '100%',
                  padding: '0.5rem 0.6rem',
                  background: '#ffffff',
                  border: '1px solid #cbd5e1',
                  borderRadius: '0.4rem',
                  color: '#0f172a',
                  fontSize: '0.8rem',
                  fontWeight: 600,
                }}
              >
                <option value="backlog">Backlog</option>
                <option value="in_progress">In Progress</option>
                <option value="review">Review</option>
                <option value="done">Done</option>
              </select>
            </div>

            <div>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.75rem', fontWeight: 700, color: '#334155', marginBottom: '0.35rem' }}>
                <Clock size={12} /> Duration (days)
              </label>
              <input
                type="number"
                min={1}
                required
                value={durationDays}
                onChange={(e) => setDurationDays(Number(e.target.value))}
                style={{
                  width: '100%',
                  padding: '0.5rem 0.6rem',
                  background: '#ffffff',
                  border: '1px solid #cbd5e1',
                  borderRadius: '0.4rem',
                  color: '#0f172a',
                  fontSize: '0.8rem',
                  fontFamily: 'var(--font-mono)',
                }}
              />
            </div>

            <div>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.75rem', fontWeight: 700, color: '#334155', marginBottom: '0.35rem' }}>
                <Calendar size={12} /> Start Date
              </label>
              <input
                type="date"
                required
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.5rem 0.6rem',
                  background: '#ffffff',
                  border: '1px solid #cbd5e1',
                  borderRadius: '0.4rem',
                  color: '#0f172a',
                  fontSize: '0.8rem',
                  fontFamily: 'var(--font-mono)',
                }}
              />
            </div>

            <div>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.75rem', fontWeight: 700, color: '#334155', marginBottom: '0.35rem' }}>
                <Calendar size={12} /> Computed End Date
              </label>
              <div
                style={{
                  padding: '0.5rem 0.6rem',
                  background: '#f8fafc',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: '0.4rem',
                  color: '#0f172a',
                  fontSize: '0.8rem',
                  fontFamily: 'var(--font-mono)',
                  fontWeight: 600,
                }}
              >
                {task.end_date}
              </div>
            </div>
          </div>

          <hr style={{ borderColor: 'var(--border-subtle)', margin: '0.2rem 0' }} />

          {/* AI Dependency Suggestion Section */}
          <div
            style={{
              background: '#f8fafc',
              border: '1px solid var(--border-subtle)',
              borderRadius: '0.5rem',
              padding: '0.85rem',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <Sparkles size={16} style={{ color: '#0f172a' }} />
                <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#0f172a' }}>
                  AI Precedence Advisor
                </span>
              </div>

              <button
                type="button"
                onClick={handleFetchAiSuggestions}
                disabled={isLoadingAi}
                className="btn btn-primary"
                style={{ padding: '0.25rem 0.75rem', fontSize: '0.75rem' }}
              >
                {isLoadingAi ? (
                  <>
                    <Loader2 size={12} className="animate-spin" /> Analyzing...
                  </>
                ) : (
                  <>
                    <Sparkles size={12} /> Suggest Prerequisites
                  </>
                )}
              </button>
            </div>

            {aiError && (
              <p style={{ fontSize: '0.725rem', color: '#b91c1c', marginTop: '0.25rem' }}>
                {aiError}
              </p>
            )}

            {/* AI Suggestion Chips */}
            {suggestions.length > 0 && (
              <div style={{ marginTop: '0.65rem' }}>
                <span style={{ fontSize: '0.725rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.4rem' }}>
                  Select suggestions to integrate into schedule graph:
                </span>
                {suggestions.map((suggestion) => (
                  <AiSuggestionChip
                    key={suggestion.task_id}
                    suggestion={suggestion}
                    isAccepting={acceptingId === suggestion.task_id}
                    onAccept={handleAcceptSuggestion}
                    onReject={handleRejectSuggestion}
                  />
                ))}
              </div>
            )}
          </div>

          <hr style={{ borderColor: 'var(--border-subtle)', margin: '0.2rem 0' }} />

          {/* Dependency Picker */}
          <DependencyPicker
            currentTask={task}
            allTasks={allTasks}
            onDependencyChanged={onTaskRefreshed}
          />

          {/* Action buttons footer */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              paddingTop: '0.75rem',
              borderTop: '1px solid var(--border-subtle)',
            }}
          >
            <button
              type="button"
              onClick={handleDelete}
              disabled={isDeleting}
              className="btn btn-danger"
              style={{ fontSize: '0.8rem' }}
            >
              <Trash2 size={13} />
              {isDeleting ? 'Deleting...' : 'Delete Task'}
            </button>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              {saveMessage && (
                <span style={{ fontSize: '0.8rem', color: '#15803d', fontWeight: 600 }}>{saveMessage}</span>
              )}

              <button
                type="button"
                onClick={onClose}
                className="btn btn-secondary"
                style={{ fontSize: '0.8rem' }}
              >
                Close
              </button>

              <button
                type="submit"
                disabled={isSaving}
                className="btn btn-primary"
                style={{ fontSize: '0.8rem' }}
              >
                <Save size={13} />
                {isSaving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
