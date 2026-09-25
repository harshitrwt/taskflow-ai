import React from 'react';
import { AlertTriangle, Trash2, X } from 'lucide-react';
import { Task } from '../../types';

interface ConfirmDeleteModalProps {
  task: Task;
  onConfirm: () => Promise<void> | void;
  onCancel: () => void;
  isDeleting?: boolean;
}

export const ConfirmDeleteModal: React.FC<ConfirmDeleteModalProps> = ({
  task,
  onConfirm,
  onCancel,
  isDeleting,
}) => {
  return (
    <div className="modal-backdrop" onClick={onCancel} style={{ zIndex: 1100 }}>
      <div
        className="modal-content"
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: '440px', padding: 0 }}
      >
        {/* Header */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '1.15rem 1.35rem',
            borderBottom: '1px solid var(--border-subtle)',
            background: '#ffffff',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <div
              style={{
                width: '30px',
                height: '30px',
                borderRadius: '0.375rem',
                background: '#fef2f2',
                color: '#b91c1c',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: '1px solid #fecaca',
              }}
            >
              <AlertTriangle size={16} />
            </div>
            <h3 style={{ fontSize: '0.95rem', fontWeight: 800, color: '#0f172a' }}>
              Confirm Delete Task
            </h3>
          </div>

          <button
            type="button"
            onClick={onCancel}
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--text-muted)',
              cursor: 'pointer',
              padding: '0.2rem',
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div style={{ padding: '1.25rem 1.35rem', display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
          <p style={{ fontSize: '0.85rem', color: '#334155', lineHeight: 1.5 }}>
            Are you sure you want to delete <strong>"{task.title}"</strong>?
          </p>
          <p style={{ fontSize: '0.775rem', color: '#64748b', lineHeight: 1.45 }}>
            This will permanently clear this completed task from the schedule and update your project velocity metrics.
          </p>

          {/* Action Buttons */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'flex-end',
              gap: '0.65rem',
              paddingTop: '0.75rem',
              borderTop: '1px solid var(--border-subtle)',
              marginTop: '0.25rem',
            }}
          >
            <button
              type="button"
              onClick={onCancel}
              disabled={isDeleting}
              className="btn btn-secondary"
              style={{ fontSize: '0.8rem' }}
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={onConfirm}
              disabled={isDeleting}
              className="btn btn-danger"
              style={{ fontSize: '0.8rem' }}
            >
              <Trash2 size={13} />
              {isDeleting ? 'Deleting...' : 'Delete Task'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
