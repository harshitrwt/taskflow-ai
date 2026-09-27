import React, { useState } from 'react';
import {
  X,
  ArrowRight,
  ShieldCheck,
  Cpu,
} from 'lucide-react';
import { api } from '../../api/client';
import { AiGenerateProjectResponse } from '../../types';

interface AiProjectArchitectModalProps {
  onClose: () => void;
  onDeploySuccess: () => void;
  onToast: (message: string, type: 'success' | 'error') => void;
}

export const AiProjectArchitectModal: React.FC<AiProjectArchitectModalProps> = ({
  onClose,
  onDeploySuccess,
  onToast,
}) => {
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isDeploying, setIsDeploying] = useState(false);
  const [generatedProject, setGeneratedProject] = useState<AiGenerateProjectResponse | null>(null);

  const presets = [
    { label: 'Drone Fleet Delivery', prompt: 'Autonomous Drone Fleet Delivery Network with geofencing, real-time telemetry, and emergency return-to-base fail-safe.' },
    { label: 'Multi-Agent RAG Pipeline', prompt: 'Enterprise Multi-Agent RAG System with OCR ingestion, vector embedding cluster, ReAct reasoning, and human-in-the-loop review.' },
    { label: 'Fintech Settlement Gateway', prompt: 'Global Multi-Currency Payment Gateway with PCI-DSS tokenization, idempotency keys, fraud scoring, and ISO20022 wire settlement.' },
    { label: 'Cloud Monolith Migration', prompt: 'Zero-Downtime AWS Kubernetes Cloud Migration with database replication, canary traffic routing, and rollback monitoring.' },
  ];

  const handleGenerate = async (customPrompt?: string) => {
    const textToUse = customPrompt || prompt;
    if (!textToUse.trim()) {
      onToast('Please enter a project objective prompt.', 'error');
      return;
    }

    setIsGenerating(true);
    setGeneratedProject(null);

    try {
      const data = await api.generateProject(textToUse, false);
      setGeneratedProject(data);
      onToast(`Generated ${data.task_count} tasks with verified DAG dependencies!`, 'success');
    } catch {
      onToast('Failed to generate project. Please try again.', 'error');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDeploy = async () => {
    if (!generatedProject) return;
    setIsDeploying(true);

    try {
      await api.generateProject(prompt || generatedProject.project_title, true);
      onToast(`Deployed "${generatedProject.project_title}" to your workspace!`, 'success');
      onDeploySuccess();
      onClose();
    } catch {
      onToast('Failed to deploy generated project to workspace.', 'error');
    } finally {
      setIsDeploying(false);
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(15, 23, 42, 0.45)',
        backdropFilter: 'blur(3px)',
        zIndex: 200,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1rem',
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        style={{
          background: '#ffffff',
          borderRadius: '0.75rem',
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
          border: '1px solid var(--border-subtle)',
          width: '100%',
          maxWidth: '780px',
          maxHeight: '90vh',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          animation: 'fadeIn 0.15s ease-out',
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: '1.25rem 1.5rem',
            borderBottom: '1px solid var(--border-subtle)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: '#ffffff',
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.2rem' }}>
              <div
                style={{
                  width: '24px',
                  height: '24px',
                  borderRadius: '0.25rem',
                  background: '#0f172a',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#ffffff',
                }}
              >
                <Cpu size={14} />
              </div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0f172a' }}>
                Generative AI Project Architect
              </h3>
              <span
                style={{
                  background: '#f1f5f9',
                  border: '1px solid #cbd5e1',
                  color: '#0f172a',
                  fontSize: '0.65rem',
                  fontWeight: 700,
                  padding: '0.15rem 0.45rem',
                  borderRadius: '999px',
                }}
              >
                Groq LLM Engine
              </span>
            </div>
            <p style={{ fontSize: '0.775rem', color: 'var(--text-muted)' }}>
              Transform a one-sentence high-level objective into a complete, mathematically verified acyclic DAG.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="btn btn-secondary"
            style={{ padding: '0.35rem', borderRadius: '0.375rem' }}
          >
            <X size={16} />
          </button>
        </div>

        {/* Body */}
        <div style={{ padding: '1.5rem', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {/* Prompt Box */}
          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#0f172a', marginBottom: '0.4rem' }}>
              Project Objective or Domain Goal:
            </label>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <input
                type="text"
                placeholder="e.g. Autonomous Drone Delivery Fleet with geofencing and battery telemetry..."
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleGenerate();
                }}
                style={{
                  flex: 1,
                  padding: '0.6rem 0.85rem',
                  borderRadius: '0.375rem',
                  border: '1px solid var(--border-subtle)',
                  fontSize: '0.85rem',
                  color: '#0f172a',
                  outline: 'none',
                }}
              />
              <button
                type="button"
                onClick={() => handleGenerate()}
                disabled={isGenerating || !prompt.trim()}
                className="btn btn-primary"
                style={{ fontSize: '0.825rem', padding: '0.6rem 1.25rem', whiteSpace: 'nowrap' }}
              >
                {isGenerating ? 'Synthesizing DAG...' : 'Generate Project'}
              </button>
            </div>
          </div>

          {/* Preset Buttons */}
          <div>
            <span style={{ fontSize: '0.725rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.03em' }}>
              Quick-Start Presets:
            </span>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.45rem', marginTop: '0.4rem' }}>
              {presets.map((p, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => {
                    setPrompt(p.prompt);
                    handleGenerate(p.prompt);
                  }}
                  style={{
                    background: '#f8fafc',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: '0.375rem',
                    padding: '0.3rem 0.65rem',
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    color: '#0f172a',
                    cursor: 'pointer',
                    transition: 'all 0.15s',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = '#f1f5f9';
                    e.currentTarget.style.borderColor = '#94a3b8';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = '#f8fafc';
                    e.currentTarget.style.borderColor = 'var(--border-subtle)';
                  }}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          {/* Loading Indicator */}
          {isGenerating && (
            <div
              style={{
                padding: '2.5rem 1rem',
                textAlign: 'center',
                background: '#f8fafc',
                borderRadius: '0.5rem',
                border: '1px dashed #cbd5e1',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '0.75rem',
              }}
            >
              <div
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  border: '3px solid #e2e8f0',
                  borderTopColor: '#0f172a',
                  animation: 'spin 0.8s linear infinite',
                }}
              />
              <div>
                <p style={{ fontSize: '0.85rem', fontWeight: 700, color: '#0f172a' }}>
                  Decomposing Goal & Validating Graph Acyclicity...
                </p>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  Running DFS cycle checks and forward topological CPM pass
                </p>
              </div>
            </div>
          )}

          {/* Generated DAG Preview */}
          {generatedProject && !isGenerating && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {/* Project Card */}
              <div
                style={{
                  background: '#f8fafc',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: '0.5rem',
                  padding: '1.25rem',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.4rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                  <h4 style={{ fontSize: '1rem', fontWeight: 800, color: '#0f172a' }}>
                    {generatedProject.project_title}
                  </h4>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span
                      style={{
                        background: '#ecfdf5',
                        border: '1px solid #bbf7d0',
                        color: '#15803d',
                        fontSize: '0.7rem',
                        fontWeight: 700,
                        padding: '0.2rem 0.55rem',
                        borderRadius: '999px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.3rem',
                      }}
                    >
                      <ShieldCheck size={12} />
                      Zero Cycles • Acyclic DAG Verified
                    </span>
                    <span
                      style={{
                        background: '#e2e8f0',
                        color: '#0f172a',
                        fontSize: '0.7rem',
                        fontWeight: 700,
                        padding: '0.2rem 0.5rem',
                        borderRadius: '0.25rem',
                      }}
                    >
                      {generatedProject.task_count} Tasks
                    </span>
                  </div>
                </div>
                <p style={{ fontSize: '0.8rem', color: '#475569', lineHeight: 1.45 }}>
                  {generatedProject.summary}
                </p>
              </div>

              {/* Tasks List */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#0f172a' }}>
                  Generated Execution Tasks & Prerequisite Topology:
                </span>

                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
                    gap: '0.65rem',
                    maxHeight: '340px',
                    overflowY: 'auto',
                    paddingRight: '0.25rem',
                  }}
                >
                  {generatedProject.tasks.map((task, idx) => (
                    <div
                      key={task.key}
                      style={{
                        background: '#ffffff',
                        border: '1px solid var(--border-subtle)',
                        borderRadius: '0.375rem',
                        padding: '0.75rem',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between',
                        gap: '0.4rem',
                      }}
                    >
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                          <span style={{ fontSize: '0.7rem', fontWeight: 700, color: '#64748b' }}>
                            Step {idx + 1}
                          </span>
                          <span
                            style={{
                              fontSize: '0.65rem',
                              fontWeight: 700,
                              color: '#0f172a',
                              background: '#f1f5f9',
                              padding: '0.1rem 0.4rem',
                              borderRadius: '0.2rem',
                            }}
                          >
                            {task.duration_days} day(s)
                          </span>
                        </div>
                        <h5 style={{ fontSize: '0.825rem', fontWeight: 700, color: '#0f172a', marginBottom: '0.2rem' }}>
                          {task.title}
                        </h5>
                        <p style={{ fontSize: '0.725rem', color: 'var(--text-muted)', lineHeight: 1.35 }}>
                          {task.description}
                        </p>
                      </div>

                      {task.depends_on_keys.length > 0 && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', flexWrap: 'wrap', marginTop: '0.25rem' }}>
                          <span style={{ fontSize: '0.65rem', color: '#64748b', fontWeight: 600 }}>Depends on:</span>
                          {task.depends_on_keys.map((depKey) => {
                            const prereqTask = generatedProject.tasks.find((t) => t.key === depKey);
                            return (
                              <span
                                key={depKey}
                                style={{
                                  fontSize: '0.65rem',
                                  background: '#f1f5f9',
                                  border: '1px solid #cbd5e1',
                                  borderRadius: '0.2rem',
                                  padding: '0.05rem 0.35rem',
                                  color: '#0f172a',
                                  fontWeight: 600,
                                }}
                              >
                                {prereqTask ? prereqTask.title.slice(0, 18) + '...' : depKey}
                              </span>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div
          style={{
            padding: '1rem 1.5rem',
            borderTop: '1px solid var(--border-subtle)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: '#ffffff',
            gap: '0.75rem',
            flexWrap: 'wrap',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.725rem', color: 'var(--text-muted)' }}>
            <Cpu size={14} />
            <span>Human-in-the-loop: Review and approve before importing to workspace.</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <button
              type="button"
              onClick={onClose}
              className="btn btn-secondary"
              style={{ fontSize: '0.8rem', padding: '0.45rem 1rem' }}
            >
              Cancel
            </button>

            <button
              type="button"
              onClick={handleDeploy}
              disabled={isDeploying || !generatedProject}
              className="btn btn-primary"
              style={{ fontSize: '0.8rem', padding: '0.45rem 1.25rem' }}
            >
              {isDeploying ? 'Deploying to Board...' : 'Deploy to Workspace'}
              <ArrowRight size={13} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
