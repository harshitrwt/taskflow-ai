import React, { useState } from 'react';
import { Building2, X, ArrowRight, ShieldCheck, Sparkles, Check } from 'lucide-react';

export interface CompanyAuthData {
  orgName: string;
  workspaceName: string;
  email: string;
  plan: 'free' | 'pro' | 'enterprise';
}

interface CompanyAuthModalProps {
  onClose: () => void;
  onSuccess: (data: CompanyAuthData) => void;
  initialMode?: 'signin' | 'signup';
}

export const CompanyAuthModal: React.FC<CompanyAuthModalProps> = ({
  onClose,
  onSuccess,
  initialMode = 'signup',
}) => {
  const [mode, setMode] = useState<'signin' | 'signup'>(initialMode);
  const [orgName, setOrgName] = useState('');
  const [workspaceName, setWorkspaceName] = useState('Core Engineering');
  const [email, setEmail] = useState('');
  const [plan, setPlan] = useState<'free' | 'pro' | 'enterprise'>('free');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!orgName.trim() || !email.trim()) return;

    setIsSubmitting(true);
    setTimeout(() => {
      const data: CompanyAuthData = {
        orgName: orgName.trim(),
        workspaceName: workspaceName.trim() || 'Default Workspace',
        email: email.trim(),
        plan,
      };
      // Persist in localStorage so progress stays across refreshes
      localStorage.setItem('taskflow_company_session', JSON.stringify(data));
      onSuccess(data);
      setIsSubmitting(false);
      onClose();
    }, 400);
  };

  return (
    <div className="modal-backdrop" onClick={onClose} style={{ zIndex: 1200 }}>
      <div
        className="modal-content"
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: '520px', padding: 0 }}
      >
        {/* Header */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '1.25rem 1.5rem',
            borderBottom: '1px solid var(--border-subtle)',
            background: '#ffffff',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <div
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '0.375rem',
                background: '#0f172a',
                color: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Building2 size={17} />
            </div>
            <div>
              <h3 style={{ fontSize: '1rem', fontWeight: 800, color: '#0f172a' }}>
                {mode === 'signup' ? 'Create Organization Workspace' : 'Sign In to Company Workspace'}
              </h3>
              <p style={{ fontSize: '0.725rem', color: 'var(--text-muted)' }}>
                {mode === 'signup'
                  ? 'Set up isolated DAG task scheduling for your engineering team.'
                  : 'Access your team\'s private projects, critical paths, and saved progress.'}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
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

        {/* Tab switcher */}
        <div
          style={{
            display: 'flex',
            borderBottom: '1px solid var(--border-subtle)',
            background: '#f8fafc',
            padding: '0.4rem 1.5rem',
            gap: '0.5rem',
          }}
        >
          <button
            type="button"
            onClick={() => setMode('signup')}
            style={{
              padding: '0.35rem 0.75rem',
              borderRadius: '0.35rem',
              border: 'none',
              background: mode === 'signup' ? '#ffffff' : 'transparent',
              color: mode === 'signup' ? '#0f172a' : '#64748b',
              fontWeight: 600,
              fontSize: '0.75rem',
              cursor: 'pointer',
              boxShadow: mode === 'signup' ? '0 1px 2px rgba(0,0,0,0.06)' : 'none',
            }}
          >
            New Company / Workspace
          </button>
          <button
            type="button"
            onClick={() => setMode('signin')}
            style={{
              padding: '0.35rem 0.75rem',
              borderRadius: '0.35rem',
              border: 'none',
              background: mode === 'signin' ? '#ffffff' : 'transparent',
              color: mode === 'signin' ? '#0f172a' : '#64748b',
              fontWeight: 600,
              fontSize: '0.75rem',
              cursor: 'pointer',
              boxShadow: mode === 'signin' ? '0 1px 2px rgba(0,0,0,0.06)' : 'none',
            }}
          >
            Sign In to Existing
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} style={{ padding: '1.25rem 1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#334155', marginBottom: '0.35rem' }}>
              Company / Organization Name *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Acme Corp, Stripe, Contata"
              value={orgName}
              onChange={(e) => setOrgName(e.target.value)}
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
              Primary Workspace / Project Name
            </label>
            <input
              type="text"
              placeholder="e.g. Payment Gateway v2, Mobile App MVP"
              value={workspaceName}
              onChange={(e) => setWorkspaceName(e.target.value)}
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
              Work Email Address *
            </label>
            <input
              type="email"
              required
              placeholder="lead.engineer@company.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
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

          {/* Tier Selection */}
          {mode === 'signup' && (
            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#475569', marginBottom: '0.35rem', textTransform: 'uppercase' }}>
                Select Workspace Tier:
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.65rem' }}>
                <div
                  onClick={() => setPlan('free')}
                  style={{
                    border: plan === 'free' ? '2px solid #0f172a' : '1px solid var(--border-subtle)',
                    background: plan === 'free' ? '#f8fafc' : '#ffffff',
                    borderRadius: '0.45rem',
                    padding: '0.65rem 0.75rem',
                    cursor: 'pointer',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.2rem' }}>
                    <strong style={{ fontSize: '0.825rem', color: '#0f172a' }}>Free Tier</strong>
                    {plan === 'free' && <Check size={14} color="#0f172a" />}
                  </div>
                  <p style={{ fontSize: '0.7rem', color: '#64748b' }}>
                    Full DAG CPM engine, save progress, unlimited custom tasks.
                  </p>
                </div>

                <div
                  onClick={() => setPlan('pro')}
                  style={{
                    border: plan === 'pro' ? '2px solid #0f172a' : '1px solid var(--border-subtle)',
                    background: plan === 'pro' ? '#f8fafc' : '#ffffff',
                    borderRadius: '0.45rem',
                    padding: '0.65rem 0.75rem',
                    cursor: 'pointer',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.2rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                      <strong style={{ fontSize: '0.825rem', color: '#0f172a' }}>Enterprise Pro</strong>
                      <Sparkles size={11} color="#15803d" />
                    </div>
                    {plan === 'pro' && <Check size={14} color="#0f172a" />}
                  </div>
                  <p style={{ fontSize: '0.7rem', color: '#64748b' }}>
                    Multi-team isolation, Groq AI Precedence, audit exports.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Security footnote */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.7rem', color: '#64748b' }}>
            <ShieldCheck size={14} style={{ color: '#15803d', flexShrink: 0 }} />
            <span>Workspace progress is saved automatically with cycle-rejection integrity.</span>
          </div>

          {/* Submit Button */}
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
              style={{ fontSize: '0.8rem', padding: '0.45rem 1rem' }}
            >
              {isSubmitting ? 'Authenticating...' : mode === 'signup' ? 'Create & Launch Workspace' : 'Sign In & Open'}
              <ArrowRight size={13} />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
