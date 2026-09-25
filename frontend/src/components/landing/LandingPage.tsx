import React from 'react';
import {
  Layers,
  ArrowRight,
  ShieldCheck,
  Cpu,
  Sparkles,
  Building2,
  Play,
  Activity,
} from 'lucide-react';

interface LandingPageProps {
  onEnterApp: () => void;
  onOpenAuth: (mode: 'signin' | 'signup') => void;
  activeOrgName?: string | null;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  onEnterApp,
  onOpenAuth,
  activeOrgName,
}) => {
  return (
    <div style={{ minHeight: '100vh', background: '#ffffff', color: '#0f172a', display: 'flex', flexDirection: 'column' }}>
      {/* Top Navigation */}
      <header
        style={{
          borderBottom: '1px solid var(--border-subtle)',
          padding: '1rem 2rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: '#ffffff',
          position: 'sticky',
          top: 0,
          zIndex: 100,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
          <div
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '0.375rem',
              background: '#0f172a',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ffffff',
            }}
          >
            <Layers size={18} />
          </div>
          <span style={{ fontSize: '1.1rem', fontWeight: 800, letterSpacing: '-0.02em', color: '#0f172a' }}>
            TaskFlow Pro
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          {activeOrgName ? (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
                fontSize: '0.8rem',
                fontWeight: 600,
                color: '#15803d',
                background: '#ecfdf5',
                padding: '0.3rem 0.75rem',
                borderRadius: '999px',
                border: '1px solid #bbf7d0',
              }}
            >
              <Building2 size={13} />
              <span>{activeOrgName}</span>
            </div>
          ) : null}

          <button
            type="button"
            onClick={() => onOpenAuth('signin')}
            className="btn btn-secondary"
            style={{ fontSize: '0.8rem', padding: '0.4rem 0.85rem' }}
          >
            Company Sign In
          </button>

          <button
            type="button"
            onClick={onEnterApp}
            className="btn btn-primary"
            style={{ fontSize: '0.8rem', padding: '0.4rem 1rem' }}
          >
            Launch Board
            <ArrowRight size={13} />
          </button>
        </div>
      </header>

      {/* Hero Section */}
      <section
        style={{
          padding: '4.5rem 1.5rem 3.5rem',
          maxWidth: '1000px',
          margin: '0 auto',
          textAlign: 'center',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '1.25rem',
        }}
      >
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.45rem',
            padding: '0.25rem 0.8rem',
            borderRadius: '999px',
            background: '#f1f5f9',
            border: '1px solid #cbd5e1',
            fontSize: '0.75rem',
            fontWeight: 700,
            color: '#0f172a',
          }}
        >
          <Sparkles size={12} style={{ color: '#0f172a' }} />
          <span>Deterministic DAG Scheduling • Zero-Slack Critical Path • AI Precedence</span>
        </div>

        <h1
          style={{
            fontSize: '2.8rem',
            fontWeight: 900,
            letterSpacing: '-0.03em',
            lineHeight: 1.15,
            color: '#0f172a',
            maxWidth: '850px',
          }}
        >
          Project Scheduling That Never Lies.
        </h1>

        <p
          style={{
            fontSize: '1.05rem',
            color: '#475569',
            lineHeight: 1.6,
            maxWidth: '700px',
          }}
        >
          Traditional Kanban boards let teams guess deadlines. TaskFlow Pro uses strict Directed Acyclic Graph topology and Critical Path backward-pass math to isolate zero-slack bottlenecks, prevent circular deadlocks, and keep your delivery dates mathematically accurate.
        </p>

        {/* Primary CTA Buttons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', marginTop: '0.5rem', flexWrap: 'wrap', justifyContent: 'center' }}>
          <button
            type="button"
            onClick={onEnterApp}
            className="btn btn-primary"
            style={{ fontSize: '0.9rem', padding: '0.65rem 1.4rem' }}
          >
            <Play size={14} />
            Try Interactive Demo (Free)
          </button>

          <button
            type="button"
            onClick={() => onOpenAuth('signup')}
            className="btn btn-secondary"
            style={{ fontSize: '0.9rem', padding: '0.65rem 1.3rem' }}
          >
            <Building2 size={15} />
            Create Company Workspace
          </button>
        </div>

        {/* Stats Row */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
            gap: '1.25rem',
            width: '100%',
            marginTop: '2.5rem',
            borderTop: '1px solid var(--border-subtle)',
            paddingTop: '2rem',
          }}
        >
          <div>
            <strong style={{ fontSize: '1.4rem', fontWeight: 800, color: '#0f172a', display: 'block' }}>100%</strong>
            <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Deterministic Scheduling</span>
          </div>
          <div>
            <strong style={{ fontSize: '1.4rem', fontWeight: 800, color: '#0f172a', display: 'block' }}>O(V + E)</strong>
            <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Topological Cycle Check</span>
          </div>
          <div>
            <strong style={{ fontSize: '1.4rem', fontWeight: 800, color: '#0f172a', display: 'block' }}>Zero Slack</strong>
            <span style={{ fontSize: '0.75rem', color: '#64748b' }}>CPM Backward-Pass Analysis</span>
          </div>
          <div>
            <strong style={{ fontSize: '1.4rem', fontWeight: 800, color: '#0f172a', display: 'block' }}>&lt; 200ms</strong>
            <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Groq AI Precedence Inference</span>
          </div>
        </div>
      </section>

      {/* Feature Showcase Grid */}
      <section
        style={{
          background: '#f8fafc',
          borderTop: '1px solid var(--border-subtle)',
          borderBottom: '1px solid var(--border-subtle)',
          padding: '4rem 1.5rem',
        }}
      >
        <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
            <h2 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#0f172a', letterSpacing: '-0.02em' }}>
              Engineered for Enterprise Tech Organizations
            </h2>
            <p style={{ fontSize: '0.85rem', color: '#64748b', marginTop: '0.35rem' }}>
              No messy cross-project pollution. Separate workspaces, strict guardrails, and deterministic date arithmetic.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem' }}>
            {/* Card 1 */}
            <div
              style={{
                background: '#ffffff',
                border: '1px solid var(--border-subtle)',
                borderRadius: '0.625rem',
                padding: '1.5rem',
                boxShadow: 'var(--shadow-sm)',
              }}
            >
              <div style={{ width: '36px', height: '36px', borderRadius: '0.375rem', background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem' }}>
                <Cpu size={18} color="#0f172a" />
              </div>
              <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#0f172a', marginBottom: '0.5rem' }}>
                Cycle Rejection & The max() Law
              </h3>
              <p style={{ fontSize: '0.8rem', color: '#475569', lineHeight: 1.5 }}>
                Circular dependencies (A depends on B, B depends on A) are rejected at the engine level with <code>409 Conflict</code>. Converging branches strictly follow <code>max(prerequisite_ends) + 1</code> so delays along parallel tracks are never mistakenly summed.
              </p>
            </div>

            {/* Card 2 */}
            <div
              style={{
                background: '#ffffff',
                border: '1px solid var(--border-subtle)',
                borderRadius: '0.625rem',
                padding: '1.5rem',
                boxShadow: 'var(--shadow-sm)',
              }}
            >
              <div style={{ width: '36px', height: '36px', borderRadius: '0.375rem', background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem' }}>
                <Activity size={18} color="#0f172a" />
              </div>
              <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#0f172a', marginBottom: '0.5rem' }}>
                Critical Path Method (CPM)
              </h3>
              <p style={{ fontSize: '0.8rem', color: '#475569', lineHeight: 1.5 }}>
                One-click Critical Path identification computes early start, early finish, late start, and late finish for every task. Identifies zero-slack activities whose postponement directly slips project launch.
              </p>
            </div>

            {/* Card 3 */}
            <div
              style={{
                background: '#ffffff',
                border: '1px solid var(--border-subtle)',
                borderRadius: '0.625rem',
                padding: '1.5rem',
                boxShadow: 'var(--shadow-sm)',
              }}
            >
              <div style={{ width: '36px', height: '36px', borderRadius: '0.375rem', background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem' }}>
                <Building2 size={18} color="#0f172a" />
              </div>
              <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#0f172a', marginBottom: '0.5rem' }}>
                Company Workspace Isolation
              </h3>
              <p style={{ fontSize: '0.8rem', color: '#475569', lineHeight: 1.5 }}>
                Set up dedicated organizational workspaces. Deploy production templates (Fintech Payment Gateway, AI RAG Platform) or build your team's custom DAG tasks with progress saved to your account.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Interactive Board Callout */}
      <section style={{ padding: '3.5rem 1.5rem', textAlign: 'center', maxWidth: '750px', margin: '0 auto' }}>
        <h3 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#0f172a', marginBottom: '0.5rem' }}>
          Ready to experience deterministic scheduling?
        </h3>
        <p style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: '1.25rem' }}>
          Explore the interactive board, drag tasks across columns, simulate blockers, or generate prerequisite dependencies via AI.
        </p>
        <button
          type="button"
          onClick={onEnterApp}
          className="btn btn-primary"
          style={{ fontSize: '0.9rem', padding: '0.65rem 1.5rem' }}
        >
          Open TaskFlow Pro Board
          <ArrowRight size={14} />
        </button>
      </section>

      {/* Footer */}
      <footer
        style={{
          marginTop: 'auto',
          borderTop: '1px solid var(--border-subtle)',
          padding: '1.25rem 2rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          fontSize: '0.75rem',
          color: '#64748b',
          flexWrap: 'wrap',
          gap: '0.5rem',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <ShieldCheck size={14} color="#15803d" />
          <span>TaskFlow Pro • Built for Contata Hackathon 2026</span>
        </div>
        <span>Directed Acyclic Graph Scheduling & AI Precedence Engine</span>
      </footer>
    </div>
  );
};
