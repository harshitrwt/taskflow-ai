import React, { useState } from 'react';
import { X, Plus, Calendar, Clock, Columns } from 'lucide-react';
import { ColumnStatus, TaskCreatePayload } from '../../types';

interface CreateTaskModalProps {
  onClose: () => void;
  onCreate: (payload: TaskCreatePayload) => Promise<any>;
}

export const CreateTaskModal: React.FC<CreateTaskModalProps> = ({ onClose, onCreate }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [durationDays, setDurationDays] = useState(2);
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [columnStatus, setColumnStatus] = useState<ColumnStatus>('backlog');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    setIsSubmitting(true);
    try {
      await onCreate({
        title: title.trim(),
        description: description.trim(),
        duration_days: Number(durationDays),
        start_date: startDate,
        column_status: columnStatus,
      });
      setIsSubmitting(false);
      onClose();
    } catch (err: any) {
      alert(err?.message || 'Failed to create task. Please ensure backend is running.');
      setIsSubmitting(false);
    }
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
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Plus size={18} style={{ color: '#0f172a' }} />
            <h3 style={{ fontSize: '0.95rem', fontWeight: 800, color: '#0f172a' }}>
              Create New Task
            </h3>
          </div>

          <button
            type="button"
            onClick={onClose}
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--text-muted)',
              cursor: 'pointer',
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} style={{ padding: '1.25rem 1.4rem', display: 'flex', flexDirection: 'column', gap: '1.15rem' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#334155', marginBottom: '0.35rem' }}>
              Task Title *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Implement OAuth provider"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              style={{
                width: '100%',
                padding: '0.55rem 0.75rem',
                background: '#ffffff',
                border: '1px solid #cbd5e1',
                borderRadius: '0.4rem',
                color: '#0f172a',
                fontSize: '0.875rem',
                fontFamily: 'inherit',
              }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#334155', marginBottom: '0.35rem' }}>
              Description
            </label>
            <textarea
              rows={3}
              placeholder="Details, scope, or requirements..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
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

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '0.85rem' }}>
            <div>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.75rem', fontWeight: 700, color: '#334155', marginBottom: '0.35rem' }}>
                <Columns size={12} /> Initial Stage
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
          </div>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'flex-end',
              gap: '0.75rem',
              paddingTop: '0.75rem',
              borderTop: '1px solid var(--border-subtle)',
            }}
          >
            <button
              type="button"
              onClick={onClose}
              className="btn btn-secondary"
              style={{ fontSize: '0.8rem' }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="btn btn-primary"
              style={{ fontSize: '0.8rem' }}
            >
              <Plus size={13} />
              {isSubmitting ? 'Creating...' : 'Create Task'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
