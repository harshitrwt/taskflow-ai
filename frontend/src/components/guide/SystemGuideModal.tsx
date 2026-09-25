import React from 'react';
import {
  X,
  HelpCircle,
  Cpu,
  Sparkles,
  Activity,
  Play,
} from 'lucide-react';

interface SystemGuideModalProps {
  onClose: () => void;
  onTryDemoAction?: (actionName: string) => void;
}

export const SystemGuideModal: React.FC<SystemGuideModalProps> = ({ onClose }) => {
  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div
        className="modal-content"
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: '780px', padding: 0 }}
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
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
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
              <HelpCircle size={18} />
            </div>
            <div>
              <h3 style={{ fontSize: '1rem', fontWeight: 800, color: '#0f172a' }}>
                System Architecture & Interactive Demo Guide
              </h3>
              <p style={{ fontSize: '0.725rem', color: 'var(--text-muted)' }}>
                How TaskFlow Pro's DAG Engine, CPM Scheduler, and AI Precedence work under the hood.
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
              padding: '0.25rem',
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Content Body */}
        <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {/* Section 1: The Core Scheduling & Dependency Engine */}
          <div
            style={{
              background: '#f8fafc',
              border: '1px solid var(--border-subtle)',
              borderRadius: '0.5rem',
              padding: '1rem 1.2rem',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.6rem' }}>
              <Cpu size={16} style={{ color: '#0f172a' }} />
              <h4 style={{ fontSize: '0.9rem', fontWeight: 700, color: '#0f172a' }}>
                1. How the DAG Engine Works
              </h4>
            </div>

            <ul style={{ fontSize: '0.8rem', color: '#334155', display: 'flex', flexDirection: 'column', gap: '0.55rem', paddingLeft: '1.25rem' }}>
              <li>
                <strong>Dynamic Ready vs Blocked:</strong> A task is <span style={{ color: '#15803d', fontWeight: 700 }}>Ready</span> only if <em>all</em> of its upstream prerequisites are in the <code>Done</code> column. If any prerequisite is incomplete, it dynamically evaluates to <span style={{ color: '#b91c1c', fontWeight: 700 }}>Blocked</span>.
              </li>
              <li>
                <strong>Explainable Blockers:</strong> Hover over the "Blocked" badge on any card to see exactly which task is holding it back (e.g. <em>Waiting on: Build backend API</em>).
              </li>
              <li>
                <strong>Rollback on Regression:</strong> If an upstream task is moved back out of <code>Done</code>, all downstream tasks immediately recalculate and re-block. Try dragging Task 1 or 2 backward to see downstream cards automatically lock up!
              </li>
              <li>
                <strong>The <code>max()</code> Law (No Double-Counting):</strong> When multiple branches converge on a task (like Tasks 3 & 5 converging on Task 6), the earliest start date is:
                <br />
                <code style={{ color: '#0f172a', background: '#e2e8f0', padding: '0.2rem 0.4rem', borderRadius: '0.25rem', display: 'inline-block', marginTop: '0.25rem' }}>
                  start_date = max(prerequisite_end_dates) + 1 day
                </code>
                <br />
                Delays along parallel tracks are <em>never summed</em>. This guarantees mathematical correctness without schedule inflation.
              </li>
              <li>
                <strong>Cycle Rejection:</strong> The engine will never let you create a circular dependency (e.g. Task A depends on Task B, while Task B depends on Task A). Any attempt returns a <code>409 Conflict</code> and leaves the graph untouched.
              </li>
            </ul>
          </div>

          {/* Section 2: Critical Path Method (CPM) */}
          <div
            style={{
              background: '#f8fafc',
              border: '1px solid var(--border-subtle)',
              borderRadius: '0.5rem',
              padding: '1rem 1.2rem',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.6rem' }}>
              <Activity size={16} style={{ color: '#0f172a' }} />
              <h4 style={{ fontSize: '0.9rem', fontWeight: 700, color: '#0f172a' }}>
                2. What is the Critical Path?
              </h4>
            </div>

            <p style={{ fontSize: '0.8rem', color: '#334155', lineHeight: 1.55 }}>
              Clicking <strong>Critical Path</strong> executes a backward pass calculation across the topological order to find tasks with <strong>zero schedule slack</strong>.
              Delaying any task in this chain directly postpones the entire project's completion date. Tasks not on this path have buffer time (slack) and can flex without hurting the deadline.
            </p>
          </div>

          {/* Section 3: How the AI Works */}
          <div
            style={{
              background: '#f8fafc',
              border: '1px solid var(--border-subtle)',
              borderRadius: '0.5rem',
              padding: '1rem 1.2rem',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.6rem' }}>
              <Sparkles size={16} style={{ color: '#0f172a' }} />
              <h4 style={{ fontSize: '0.9rem', fontWeight: 700, color: '#0f172a' }}>
                3. How the AI Precedence Advisor Works
              </h4>
            </div>

            <ul style={{ fontSize: '0.8rem', color: '#334155', display: 'flex', flexDirection: 'column', gap: '0.55rem', paddingLeft: '1.25rem' }}>
              <li>
                <strong>Semantic Understanding:</strong> When you open a task and click <em>Suggest Prerequisites</em>, the LLM reads the target task and all unconnected tasks to infer logical technical relationships.
              </li>
              <li>
                <strong>Prompt-Injection Shield:</strong> User task descriptions are treated strictly as data to analyze, never executable instructions.
              </li>
              <li>
                <strong>Anti-Hallucination Defense:</strong> The server checks that any returned task ID matches an actual candidate. Made-up IDs are discarded immediately.
              </li>
              <li>
                <strong>Cycle Filter:</strong> Even if the AI suggests a dependency, the backend runs <code>would_create_cycle()</code> first. If it would cause a loop, it is silently dropped.
              </li>
              <li>
                <strong>Human-in-the-Loop:</strong> The AI can propose relationships, but has <strong>zero write authority</strong>. You must explicitly click <em>Accept Prerequisite</em> for it to modify the schedule.
              </li>
            </ul>
          </div>

          {/* Section 4: 5-Step Demo Script to Try Right Now */}
          <div
            style={{
              background: '#f1f5f9',
              border: '1px solid var(--border-subtle)',
              borderRadius: '0.5rem',
              padding: '1rem 1.2rem',
            }}
          >
            <h4 style={{ fontSize: '0.9rem', fontWeight: 800, color: '#0f172a', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <Play size={14} /> Quick Demo Scenario Walkthrough
            </h4>

            <ol style={{ fontSize: '0.8rem', color: '#334155', display: 'flex', flexDirection: 'column', gap: '0.45rem', paddingLeft: '1.25rem' }}>
              <li>
                <strong>Step 1:</strong> Look at <strong>Task 6 ("Integrate frontend with API")</strong>. Notice it is in <code>Backlog</code> and marked <span style={{ color: '#b91c1c', fontWeight: 600 }}>Blocked</span> because Task 3 is only <code>In Progress</code>.
              </li>
              <li>
                <strong>Step 2:</strong> In the <code>In Progress</code> column, find <strong>Task 3 ("Build backend API")</strong> and click <strong>Advance →</strong> (or drag it into <code>Done</code>).
              </li>
              <li>
                <strong>Step 3:</strong> Watch <strong>Task 6 and Task 7</strong> instantly flip from <span style={{ color: '#b91c1c', fontWeight: 600 }}>Blocked</span> to <span style={{ color: '#15803d', fontWeight: 600 }}>Active</span>!
              </li>
              <li>
                <strong>Step 4:</strong> Click <strong>Critical Path</strong> at the top. Notice the project-defining zero-slack chain highlighted in bold contrast!
              </li>
              <li>
                <strong>Step 5:</strong> Click on any task, scroll down to <strong>AI Precedence Advisor</strong>, click <em>Suggest Prerequisites</em>, and review the structured AI rationale chips.
              </li>
            </ol>
          </div>

          {/* Close button */}
          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <button
              type="button"
              onClick={onClose}
              className="btn btn-primary"
              style={{ padding: '0.45rem 1.25rem' }}
            >
              Got it, let's explore!
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
