import React from 'react';
import { Sparkles, Check, X } from 'lucide-react';
import { AiSuggestion } from '../../types';

interface AiSuggestionChipProps {
  suggestion: AiSuggestion;
  onAccept: (suggestion: AiSuggestion) => void;
  onReject: (suggestion: AiSuggestion) => void;
  isAccepting?: boolean;
}

export const AiSuggestionChip: React.FC<AiSuggestionChipProps> = ({
  suggestion,
  onAccept,
  onReject,
  isAccepting,
}) => {
  return (
    <div
      style={{
        background: '#ffffff',
        border: '1px solid var(--border-subtle)',
        borderRadius: '0.45rem',
        padding: '0.65rem 0.85rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '0.4rem',
        marginBottom: '0.5rem',
        boxShadow: 'var(--shadow-sm)',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <Sparkles size={14} style={{ color: '#0f172a' }} />
          <span style={{ fontSize: '0.825rem', fontWeight: 700, color: '#0f172a' }}>
            {suggestion.task_title}
          </span>
        </div>

        <span
          style={{
            fontSize: '0.7rem',
            fontFamily: 'var(--font-mono)',
            color: '#0f172a',
            background: '#f1f5f9',
            border: '1px solid var(--border-subtle)',
            padding: '0.1rem 0.45rem',
            borderRadius: '999px',
            fontWeight: 700,
          }}
        >
          {Math.round(suggestion.confidence * 100)}% match
        </span>
      </div>

      {suggestion.rationale && (
        <p style={{ fontSize: '0.75rem', color: '#475569', fontStyle: 'italic', lineHeight: 1.4 }}>
          "{suggestion.rationale}"
        </p>
      )}

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '0.2rem' }}>
        <button
          type="button"
          onClick={() => onReject(suggestion)}
          className="btn btn-secondary"
          style={{ padding: '0.2rem 0.6rem', fontSize: '0.725rem', height: '26px' }}
        >
          <X size={12} />
          Dismiss
        </button>
        <button
          type="button"
          onClick={() => onAccept(suggestion)}
          disabled={isAccepting}
          className="btn btn-primary"
          style={{ padding: '0.2rem 0.75rem', fontSize: '0.725rem', height: '26px' }}
        >
          <Check size={12} />
          {isAccepting ? 'Adding...' : 'Accept Prerequisite'}
        </button>
      </div>
    </div>
  );
};
