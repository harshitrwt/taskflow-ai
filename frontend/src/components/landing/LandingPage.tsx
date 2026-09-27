import React from 'react';
import {
  Layers,
  ArrowRight,
  ShieldCheck,
  Cpu,
  Building2,
  Play,
  Activity,
  GitFork,
} from 'lucide-react';

interface LandingPageProps {
  onEnterApp: () => void;
  onOpenAuth: (mode: 'signin' | 'signup') => void;
  onOpenAiArchitect?: () => void;
  activeOrgName?: string | null;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  onEnterApp,
  onOpenAuth,
  onOpenAiArchitect,
  activeOrgName,
}) => {
  return (
    <div
      style={{
        minHeight: '100vh',
        background: '#ffffff',
        color: '#0f172a',
        display: 'flex',
        flexDirection: 'column',
        fontFamily: 'var(--font-main, sans-serif)',
        overflowX: 'hidden',
      }}
    >
      {/* Floating Glassmorphic Top Navbar */}
      <div
        style={{
          position: 'sticky',
          top: '1rem',
          zIndex: 100,
          padding: '0 1rem',
          width: '100%',
        }}
      >
        <header
          style={{
            maxWidth: '1120px',
            margin: '0 auto',
            padding: '0.65rem 1.25rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: 'rgba(255, 255, 255, 0.88)',
            backdropFilter: 'blur(16px)',
            WebkitBackdropFilter: 'blur(16px)',
            border: '1px solid rgba(226, 232, 240, 0.85)',
            borderRadius: '9999px',
            boxShadow:
              '0 10px 25px -5px rgba(15, 23, 42, 0.06), 0 4px 6px -4px rgba(15, 23, 42, 0.02)',
            transition: 'all 0.2s ease',
            flexWrap: 'wrap',
            gap: '0.5rem',
          }}
        >
          {/* Brand Logo & Name */}
          <div
            onClick={onEnterApp}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.65rem',
              cursor: 'pointer',
              userSelect: 'none',
            }}
            title="Launch TaskFlow AI Dashboard"
          >
            <div
              style={{
                width: '34px',
                height: '34px',
                borderRadius: '0.5rem',
                background: '#0f172a',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#ffffff',
                boxShadow: '0 2px 4px rgba(15, 23, 42, 0.15)',
              }}
            >
              <Layers size={18} />
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
              <span
                style={{
                  fontSize: '1.05rem',
                  fontWeight: 800,
                  letterSpacing: '-0.025em',
                  color: '#0f172a',
                }}
              >
                TaskFlow AI
              </span>
              <span
                style={{
                  fontSize: '0.65rem',
                  fontWeight: 700,
                  color: '#475569',
                  background: '#f1f5f9',
                  padding: '0.15rem 0.45rem',
                  borderRadius: '9999px',
                  border: '1px solid #e2e8f0',
                }}
              >
                DAG Engine
              </span>
            </div>
          </div>

          {/* Action CTAs: Login opens Auth modal, everything else goes to Dashboard */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.55rem', flexWrap: 'wrap' }}>
            {activeOrgName && (
              <div
                onClick={onEnterApp}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  color: '#15803d',
                  background: '#ecfdf5',
                  padding: '0.25rem 0.65rem',
                  borderRadius: '9999px',
                  border: '1px solid #bbf7d0',
                  cursor: 'pointer',
                }}
                title="Active workspace - Click to open dashboard"
              >
                <Building2 size={12} />
                <span>{activeOrgName}</span>
              </div>
            )}

            {/* ONLY this button opens the login modal */}
            <button
              type="button"
              onClick={() => onOpenAuth('signin')}
              style={{
                fontSize: '0.775rem',
                fontWeight: 600,
                color: '#334155',
                background: 'transparent',
                border: '1px solid #cbd5e1',
                borderRadius: '9999px',
                padding: '0.35rem 0.85rem',
                cursor: 'pointer',
                transition: 'all 0.15s',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = '#f8fafc';
                e.currentTarget.style.borderColor = '#94a3b8';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'transparent';
                e.currentTarget.style.borderColor = '#cbd5e1';
              }}
            >
              Company Sign In
            </button>

            {/* Any other action button takes directly to /dashboard */}
            <button
              type="button"
              onClick={onEnterApp}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
                fontSize: '0.775rem',
                fontWeight: 700,
                color: '#ffffff',
                background: '#0f172a',
                border: '1px solid #0f172a',
                borderRadius: '9999px',
                padding: '0.38rem 1rem',
                cursor: 'pointer',
                boxShadow: '0 2px 4px rgba(15, 23, 42, 0.12)',
                transition: 'all 0.15s',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = '#1e293b';
                e.currentTarget.style.transform = 'translateY(-1px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = '#0f172a';
                e.currentTarget.style.transform = 'translateY(0)';
              }}
            >
              <span>Launch Board</span>
              <ArrowRight size={13} />
            </button>
          </div>
        </header>
      </div>

      {/* Hero Section with Light Gradient Background */}
      <section
        style={{
          position: 'relative',
          padding: '4.5rem 1.5rem 3.5rem',
          maxWidth: '1200px',
          margin: '0 auto',
          textAlign: 'center',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '1.4rem',
          width: '100%',
        }}
      >
        {/* Soft Ambient Light Gradient Glow behind Hero */}
        <div
          style={{
            position: 'absolute',
            top: '-20%',
            left: '50%',
            transform: 'translateX(-50%)',
            width: 'min(90vw, 850px)',
            height: '480px',
            background:
              'radial-gradient(ellipse at 50% 30%, rgba(226, 232, 240, 0.75) 0%, rgba(241, 245, 249, 0.45) 45%, rgba(255, 255, 255, 0) 75%)',
            filter: 'blur(35px)',
            pointerEvents: 'none',
            zIndex: 0,
          }}
        />

        {/* Shimmer Pill Badge (Clickable -> routes to /dashboard) */}
        <div
          onClick={onEnterApp}
          style={{
            position: 'relative',
            zIndex: 1,
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.35rem 0.95rem',
            borderRadius: '9999px',
            background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
            border: '1px solid #cbd5e1',
            boxShadow: '0 2px 6px rgba(15, 23, 42, 0.04)',
            fontSize: '0.75rem',
            fontWeight: 700,
            color: '#0f172a',
            cursor: 'pointer',
            transition: 'all 0.15s ease',
            maxWidth: '100%',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = '#0f172a';
            e.currentTarget.style.transform = 'translateY(-1px)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = '#cbd5e1';
            e.currentTarget.style.transform = 'translateY(0)';
          }}
          title="Click to view interactive DAG & Critical Path dashboard"
        >
          <span
            style={{
              width: '7px',
              height: '7px',
              borderRadius: '50%',
              background: '#15803d',
              display: 'inline-block',
              flexShrink: 0,
            }}
          />
          <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            Deterministic DAG Scheduling • Zero-Slack Critical Path • AI Precedence
          </span>
          <ArrowRight size={12} color="#64748b" style={{ flexShrink: 0 }} />
        </div>

        {/* Upgraded High-Impact Headline */}
        <h1
          style={{
            position: 'relative',
            zIndex: 1,
            fontSize: 'clamp(2.1rem, 4.8vw, 3.5rem)',
            fontWeight: 900,
            letterSpacing: '-0.035em',
            lineHeight: 1.15,
            color: '#0f172a',
            maxWidth: '920px',
            margin: '0 auto',
          }}
        >
          Autonomous DAG Scheduling & Critical Path Intelligence.
        </h1>

        {/* Hero Subtitle */}
        <p
          style={{
            position: 'relative',
            zIndex: 1,
            fontSize: 'clamp(0.95rem, 1.8vw, 1.125rem)',
            color: '#475569',
            lineHeight: 1.65,
            maxWidth: '740px',
            margin: '0 auto',
          }}
        >
          Eliminate delivery guesswork. TaskFlow AI models software prerequisites as a deterministic Directed Acyclic Graph—instantly isolating zero-slack bottlenecks, preventing circular deadlocks, and keeping sprint deadlines mathematically sound.
        </p>

        {/* Primary CTA Buttons (All route to dashboard) */}
        <div
          style={{
            position: 'relative',
            zIndex: 1,
            display: 'flex',
            alignItems: 'center',
            gap: '0.85rem',
            marginTop: '0.5rem',
            flexWrap: 'wrap',
            justifyContent: 'center',
            width: '100%',
          }}
        >
          <button
            type="button"
            onClick={onEnterApp}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.55rem',
              fontSize: '0.925rem',
              fontWeight: 700,
              color: '#ffffff',
              background: '#0f172a',
              border: '1px solid #0f172a',
              borderRadius: '0.5rem',
              padding: '0.75rem 1.6rem',
              cursor: 'pointer',
              boxShadow: '0 4px 14px rgba(15, 23, 42, 0.16)',
              transition: 'all 0.15s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = '#1e293b';
              e.currentTarget.style.transform = 'translateY(-1px)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = '#0f172a';
              e.currentTarget.style.transform = 'translateY(0)';
            }}
          >
            <Play size={15} fill="#ffffff" />
            <span>Try Interactive Demo (Free)</span>
          </button>

          <button
            type="button"
            onClick={onEnterApp}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.55rem',
              fontSize: '0.925rem',
              fontWeight: 700,
              color: '#0f172a',
              background: '#ffffff',
              border: '1px solid #cbd5e1',
              borderRadius: '0.5rem',
              padding: '0.75rem 1.5rem',
              cursor: 'pointer',
              boxShadow: '0 2px 5px rgba(0,0,0,0.04)',
              transition: 'all 0.15s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = '#0f172a';
              e.currentTarget.style.background = '#f8fafc';
              e.currentTarget.style.transform = 'translateY(-1px)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = '#cbd5e1';
              e.currentTarget.style.background = '#ffffff';
              e.currentTarget.style.transform = 'translateY(0)';
            }}
          >
            <GitFork size={16} />
            <span>View Kanban & DAG Board</span>
          </button>

          {onOpenAiArchitect && (
            <button
              type="button"
              onClick={onOpenAiArchitect}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
                fontSize: '0.925rem',
                fontWeight: 700,
                color: '#0f172a',
                background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
                border: '1px solid #94a3b8',
                borderRadius: '0.5rem',
                padding: '0.75rem 1.4rem',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = '#0f172a';
                e.currentTarget.style.transform = 'translateY(-1px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = '#94a3b8';
                e.currentTarget.style.transform = 'translateY(0)';
              }}
            >
              <Cpu size={16} />
              <span>Generate with AI</span>
            </button>
          )}
        </div>

        {/* Live Interactive Board Preview Card (Click anywhere to jump to /dashboard) */}
        <div
          onClick={onEnterApp}
          style={{
            position: 'relative',
            zIndex: 1,
            marginTop: '2rem',
            width: '100%',
            maxWidth: '1020px',
            background: '#ffffff',
            borderRadius: '0.875rem',
            border: '1px solid #e2e8f0',
            boxShadow:
              '0 20px 40px -15px rgba(15, 23, 42, 0.08), 0 0 0 1px rgba(15, 23, 42, 0.04)',
            overflow: 'hidden',
            cursor: 'pointer',
            textAlign: 'left',
            transition: 'transform 0.2s ease, box-shadow 0.2s ease',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-3px)';
            e.currentTarget.style.boxShadow =
              '0 25px 50px -12px rgba(15, 23, 42, 0.12), 0 0 0 1px rgba(15, 23, 42, 0.08)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow =
              '0 20px 40px -15px rgba(15, 23, 42, 0.08), 0 0 0 1px rgba(15, 23, 42, 0.04)';
          }}
          title="Click to launch live interactive board"
        >
          {/* Mock Window Titlebar */}
          <div
            style={{
              padding: '0.75rem 1.25rem',
              background: '#f8fafc',
              borderBottom: '1px solid #e2e8f0',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '0.5rem',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#cbd5e1' }} />
              <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#cbd5e1' }} />
              <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#cbd5e1' }} />
              <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600, marginLeft: '0.5rem' }}>
                TaskFlow AI • DAG Kanban View (Live Simulation)
              </span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.75rem', color: '#0f172a', fontWeight: 700 }}>
              <span>Click to open live board</span>
              <ArrowRight size={13} />
            </div>
          </div>

          {/* Critical Path Header Strip */}
          <div
            style={{
              padding: '0.75rem 1.25rem',
              background: '#ffffff',
              borderBottom: '1px solid #f1f5f9',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '0.5rem',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
              <Activity size={15} color="#0f172a" />
              <strong style={{ fontSize: '0.8rem', color: '#0f172a' }}>Critical Path:</strong>
              <span style={{ fontSize: '0.75rem', color: '#475569' }}>
                Zero-Slack Sequence (7 tasks) • Project Finish: 2026-10-07
              </span>
            </div>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <span style={{ fontSize: '0.7rem', fontWeight: 700, color: '#15803d', background: '#ecfdf5', padding: '0.2rem 0.5rem', borderRadius: '0.25rem', border: '1px solid #bbf7d0' }}>
                3 Active
              </span>
              <span style={{ fontSize: '0.7rem', fontWeight: 700, color: '#b91c1c', background: '#fef2f2', padding: '0.2rem 0.5rem', borderRadius: '0.25rem', border: '1px solid #fecaca' }}>
                5 Blocked
              </span>
            </div>
          </div>

          {/* Kanban Columns Teaser (horizontal scroll on narrow screens) */}
          <div
            style={{
              padding: '1.25rem',
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '1rem',
              background: '#f8fafc',
              overflowX: 'auto',
            }}
          >
            {/* Col 1 */}
            <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '0.5rem', padding: '0.85rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.65rem', fontSize: '0.75rem', fontWeight: 700, color: '#0f172a' }}>
                <span>• BACKLOG</span>
                <span style={{ color: '#64748b' }}>6</span>
              </div>
              <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '0.375rem', padding: '0.65rem', marginBottom: '0.5rem' }}>
                <span style={{ fontSize: '0.65rem', fontWeight: 700, color: '#b91c1c', background: '#fef2f2', padding: '0.15rem 0.4rem', borderRadius: '0.2rem' }}>
                  BLOCKED
                </span>
                <h4 style={{ fontSize: '0.775rem', fontWeight: 700, color: '#0f172a', margin: '0.35rem 0 0.2rem' }}>
                  Integrate frontend with API
                </h4>
                <p style={{ fontSize: '0.7rem', color: '#64748b' }}>Waiting: Build backend API</p>
              </div>
            </div>

            {/* Col 2 */}
            <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '0.5rem', padding: '0.85rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.65rem', fontSize: '0.75rem', fontWeight: 700, color: '#0f172a' }}>
                <span>• IN PROGRESS</span>
                <span style={{ color: '#64748b' }}>2</span>
              </div>
              <div style={{ background: '#ffffff', border: '1px solid #0f172a', borderRadius: '0.375rem', padding: '0.65rem', marginBottom: '0.5rem' }}>
                <span style={{ fontSize: '0.65rem', fontWeight: 700, color: '#15803d', background: '#ecfdf5', padding: '0.15rem 0.4rem', borderRadius: '0.2rem' }}>
                  ACTIVE • ZERO SLACK
                </span>
                <h4 style={{ fontSize: '0.775rem', fontWeight: 700, color: '#0f172a', margin: '0.35rem 0 0.2rem' }}>
                  Build backend API
                </h4>
                <p style={{ fontSize: '0.7rem', color: '#64748b' }}>All prerequisites met • 4d duration</p>
              </div>
            </div>

            {/* Col 3 */}
            <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '0.5rem', padding: '0.85rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.65rem', fontSize: '0.75rem', fontWeight: 700, color: '#0f172a' }}>
                <span>• REVIEW</span>
                <span style={{ color: '#64748b' }}>0</span>
              </div>
              <div style={{ border: '1px dashed #cbd5e1', borderRadius: '0.375rem', padding: '1rem', textAlign: 'center', color: '#94a3b8', fontSize: '0.7rem' }}>
                Ready for verification
              </div>
            </div>

            {/* Col 4 */}
            <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '0.5rem', padding: '0.85rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.65rem', fontSize: '0.75rem', fontWeight: 700, color: '#0f172a' }}>
                <span>• DONE</span>
                <span style={{ color: '#64748b' }}>2</span>
              </div>
              <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '0.375rem', padding: '0.65rem', marginBottom: '0.5rem' }}>
                <span style={{ fontSize: '0.65rem', fontWeight: 700, color: '#15803d', background: '#ecfdf5', padding: '0.15rem 0.4rem', borderRadius: '0.2rem' }}>
                  ACTIVE
                </span>
                <h4 style={{ fontSize: '0.775rem', fontWeight: 700, color: '#0f172a', margin: '0.35rem 0 0.2rem' }}>
                  Set up project repository
                </h4>
                <p style={{ fontSize: '0.7rem', color: '#64748b' }}>Repository initialized with CI</p>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Row */}
        <div
          onClick={onEnterApp}
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
            gap: '1.25rem',
            width: '100%',
            marginTop: '2rem',
            borderTop: '1px solid var(--border-subtle)',
            paddingTop: '2rem',
            cursor: 'pointer',
          }}
          title="Click to open dashboard"
        >
          <div>
            <strong style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0f172a', display: 'block' }}>100%</strong>
            <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600 }}>Deterministic Scheduling</span>
          </div>
          <div>
            <strong style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0f172a', display: 'block' }}>O(V + E)</strong>
            <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600 }}>Topological Cycle Check</span>
          </div>
          <div>
            <strong style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0f172a', display: 'block' }}>Zero Slack</strong>
            <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600 }}>CPM Backward-Pass Analysis</span>
          </div>
          <div>
            <strong style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0f172a', display: 'block' }}>&lt; 200ms</strong>
            <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600 }}>Groq AI Precedence Inference</span>
          </div>
        </div>
      </section>

      {/* Feature Showcase Grid (All cards route to /dashboard on click) */}
      <section
        style={{
          background: 'linear-gradient(180deg, #f8fafc 0%, #ffffff 100%)',
          borderTop: '1px solid var(--border-subtle)',
          borderBottom: '1px solid var(--border-subtle)',
          padding: '4.5rem 1.5rem',
          width: '100%',
        }}
      >
        <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
            <span
              style={{
                fontSize: '0.75rem',
                fontWeight: 700,
                color: '#64748b',
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
              }}
            >
              Enterprise Architecture
            </span>
            <h2
              style={{
                fontSize: 'clamp(1.5rem, 3.5vw, 2.1rem)',
                fontWeight: 800,
                color: '#0f172a',
                letterSpacing: '-0.025em',
                marginTop: '0.35rem',
              }}
            >
              Engineered for High-Velocity Engineering Teams
            </h2>
            <p style={{ fontSize: '0.875rem', color: '#64748b', marginTop: '0.45rem', maxWidth: '650px', margin: '0.45rem auto 0' }}>
              No messy cross-project pollution. Separate workspaces, strict topological guardrails, and deterministic date arithmetic.
            </p>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
              gap: '1.5rem',
            }}
          >
            {/* Card 1 */}
            <div
              onClick={onEnterApp}
              style={{
                background: '#ffffff',
                border: '1px solid var(--border-subtle)',
                borderRadius: '0.75rem',
                padding: '1.75rem',
                boxShadow: 'var(--shadow-sm)',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.borderColor = '#0f172a';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.borderColor = 'var(--border-subtle)';
              }}
            >
              <div
                style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '0.5rem',
                  background: '#f1f5f9',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '1.25rem',
                }}
              >
                <Cpu size={20} color="#0f172a" />
              </div>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#0f172a', marginBottom: '0.6rem' }}>
                Cycle Rejection & The max() Law
              </h3>
              <p style={{ fontSize: '0.825rem', color: '#475569', lineHeight: 1.6 }}>
                Circular dependencies are rejected at the engine level with <code>409 Conflict</code>. Converging branches strictly follow <code>max(prerequisite_ends) + 1</code> so delays along parallel tracks are never mistakenly summed.
              </p>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', marginTop: '1rem', fontSize: '0.75rem', fontWeight: 700, color: '#0f172a' }}>
                <span>Test in board</span>
                <ArrowRight size={13} />
              </div>
            </div>

            {/* Card 2 */}
            <div
              onClick={onEnterApp}
              style={{
                background: '#ffffff',
                border: '1px solid var(--border-subtle)',
                borderRadius: '0.75rem',
                padding: '1.75rem',
                boxShadow: 'var(--shadow-sm)',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.borderColor = '#0f172a';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.borderColor = 'var(--border-subtle)';
              }}
            >
              <div
                style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '0.5rem',
                  background: '#f1f5f9',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '1.25rem',
                }}
              >
                <Activity size={20} color="#0f172a" />
              </div>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#0f172a', marginBottom: '0.6rem' }}>
                Critical Path Method (CPM)
              </h3>
              <p style={{ fontSize: '0.825rem', color: '#475569', lineHeight: 1.6 }}>
                One-click Critical Path identification computes early start, early finish, late start, and late finish for every task. Identifies zero-slack activities whose postponement directly slips project launch.
              </p>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', marginTop: '1rem', fontSize: '0.75rem', fontWeight: 700, color: '#0f172a' }}>
                <span>Highlight path</span>
                <ArrowRight size={13} />
              </div>
            </div>

            {/* Card 3 */}
            <div
              onClick={onEnterApp}
              style={{
                background: '#ffffff',
                border: '1px solid var(--border-subtle)',
                borderRadius: '0.75rem',
                padding: '1.75rem',
                boxShadow: 'var(--shadow-sm)',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.borderColor = '#0f172a';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.borderColor = 'var(--border-subtle)';
              }}
            >
              <div
                style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '0.5rem',
                  background: '#f1f5f9',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '1.25rem',
                }}
              >
                <Building2 size={20} color="#0f172a" />
              </div>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#0f172a', marginBottom: '0.6rem' }}>
                Company Workspace Isolation
              </h3>
              <p style={{ fontSize: '0.825rem', color: '#475569', lineHeight: 1.6 }}>
                Set up dedicated organizational workspaces. Deploy production templates (Fintech Payment Gateway, AI RAG Platform) or build your team's custom DAG tasks with progress saved to your account.
              </p>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', marginTop: '1rem', fontSize: '0.75rem', fontWeight: 700, color: '#0f172a' }}>
                <span>Launch workspace</span>
                <ArrowRight size={13} />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Deep Rich Black Footer with Left-Aligned Content and Bold taskflowAI. Display */}
      <footer
        style={{
          marginTop: 'auto',
          background: '#070a10',
          color: '#94a3b8',
          padding: '4.5rem 2rem 2rem',
          position: 'relative',
          overflow: 'hidden',
          width: '100%',
          borderTop: '1px solid rgba(255, 255, 255, 0.06)',
        }}
      >
        <div style={{ maxWidth: '1120px', margin: '0 auto', position: 'relative', zIndex: 1 }}>
          {/* Main Content Row: Left-Aligned Brand & Right-Aligned Action */}
          <div
            style={{
              display: 'flex',
              alignItems: 'flex-start',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '2.5rem',
            }}
          >
            {/* Left-Aligned Main Content */}
            <div style={{ maxWidth: '560px', textAlign: 'left' }}>
              <div
                onClick={onEnterApp}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.65rem',
                  cursor: 'pointer',
                  marginBottom: '1rem',
                }}
              >
                <div
                  style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '0.5rem',
                    background: '#ffffff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#070a10',
                    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.3)',
                  }}
                >
                  <Layers size={19} />
                </div>
                <span
                  style={{
                    fontSize: '1.25rem',
                    fontWeight: 800,
                    letterSpacing: '-0.025em',
                    color: '#ffffff',
                  }}
                >
                  TaskFlow AI
                </span>
              </div>

              <p
                style={{
                  fontSize: '0.875rem',
                  color: '#94a3b8',
                  lineHeight: 1.65,
                  marginBottom: '1.25rem',
                }}
              >
                Directed Acyclic Graph Precedence Engine & Critical Path Zero-Slack Scheduler for High-Performing Engineering Teams. Eliminates delivery guesswork through topological validation.
              </p>

              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  fontSize: '0.75rem',
                  color: '#64748b',
                }}
              >
                <ShieldCheck size={14} color="#22c55e" />
                <span style={{ color: '#94a3b8' }}>Built for Contata NCR Hackathon 2026</span>
                <span style={{ color: '#475569' }}>•</span>
                <span style={{ color: '#64748b' }}>MIT Open Source</span>
              </div>
            </div>

            {/* Right-Aligned Quick Controls */}
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'flex-start',
                gap: '0.75rem',
                textAlign: 'left',
              }}
            >
              <span
                style={{
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  color: '#e2e8f0',
                  textTransform: 'uppercase',
                  letterSpacing: '0.08em',
                }}
              >
                Quick Access
              </span>
              <button
                type="button"
                onClick={onEnterApp}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.45rem',
                  fontSize: '0.8rem',
                  fontWeight: 700,
                  color: '#ffffff',
                  background: 'rgba(255, 255, 255, 0.08)',
                  border: '1px solid rgba(255, 255, 255, 0.15)',
                  borderRadius: '0.5rem',
                  padding: '0.5rem 1rem',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.14)';
                  e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.3)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)';
                  e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.15)';
                }}
              >
                <span>Launch Board</span>
                <ArrowRight size={13} />
              </button>

              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.85rem',
                  fontSize: '0.775rem',
                  color: '#64748b',
                  marginTop: '0.25rem',
                }}
              >
                <span
                  onClick={onEnterApp}
                  style={{ cursor: 'pointer', color: '#94a3b8', transition: 'color 0.15s' }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = '#ffffff')}
                  onMouseLeave={(e) => (e.currentTarget.style.color = '#94a3b8')}
                >
                  Kanban Board
                </span>
                <span>•</span>
                <span
                  onClick={onEnterApp}
                  style={{ cursor: 'pointer', color: '#94a3b8', transition: 'color 0.15s' }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = '#ffffff')}
                  onMouseLeave={(e) => (e.currentTarget.style.color = '#94a3b8')}
                >
                  DAG Flow
                </span>
                <span>•</span>
                <span
                  onClick={onEnterApp}
                  style={{ cursor: 'pointer', color: '#94a3b8', transition: 'color 0.15s' }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = '#ffffff')}
                  onMouseLeave={(e) => (e.currentTarget.style.color = '#94a3b8')}
                >
                  Critical Path
                </span>
              </div>
            </div>
          </div>

          {/* Large Bold taskflowAI. Typography Watermark */}
          <div
            style={{
              width: '100%',
              overflow: 'hidden',
              marginTop: '4rem',
              marginBottom: '0.5rem',
              userSelect: 'none',
              pointerEvents: 'none',
              textAlign: 'left',
            }}
          >
            <span
              style={{
                fontSize: 'clamp(3.5rem, 11.5vw, 8.5rem)',
                fontWeight: 900,
                letterSpacing: '-0.04em',
                color: '#ffffff',
                opacity: 0.1,
                lineHeight: 0.85,
                display: 'block',
                whiteSpace: 'nowrap',
              }}
            >
              taskflowAI.
            </span>
          </div>

          {/* Bottom Copyright Strip */}
          <div
            style={{
              paddingTop: '1.25rem',
              borderTop: '1px solid rgba(255, 255, 255, 0.05)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '0.75rem',
              fontSize: '0.75rem',
              color: '#475569',
            }}
          >
            <span>© 2026 TaskFlow AI. All rights reserved.</span>
            <span>Deterministic Directed Acyclic Graph Engine</span>
          </div>
        </div>
      </footer>
    </div>
  );
};
