import React, { useState } from 'react';
import { X, Briefcase, Check, Shield, Cpu, FileSpreadsheet, Download } from 'lucide-react';
import { api } from '../../api/client';
import { Task } from '../../types';

interface WorkspaceTemplatesModalProps {
  onClose: () => void;
  onTemplateLoaded: (templateName: string) => void;
  tasks: Task[];
  criticalPathTaskIds: string[];
}

interface TemplateOption {
  id: string;
  name: string;
  category: string;
  badge: string;
  description: string;
  taskCount: number;
  icon: React.ReactNode;
}

const TEMPLATE_OPTIONS: TemplateOption[] = [
  {
    id: 'canonical',
    name: 'Canonical Hackathon Benchmark',
    category: 'System Benchmark',
    badge: '10 Tasks',
    description: 'Dual diamond convergence DAG testing Critical Path (zero-slack), dynamic blockers, and cyclic rejection.',
    taskCount: 10,
    icon: <Cpu size={18} color="#0f172a" />,
  },
  {
    id: 'fintech',
    name: 'Fintech Payment Gateway & PCI Compliance',
    category: 'Enterprise Finance',
    badge: '8 Tasks',
    description: 'Real-world financial engineering: KMS token vault, payment API, KYC fraud filter, pen-testing, and banking certification.',
    taskCount: 8,
    icon: <Shield size={18} color="#0f172a" />,
  },
  {
    id: 'ai_pipeline',
    name: 'Enterprise Multi-Agent RAG Platform',
    category: 'AI Infrastructure',
    badge: '8 Tasks',
    description: 'Production AI pipeline: pgvector cluster, chunking, hybrid re-ranking, LangGraph supervisor, and Llama Guard safety.',
    taskCount: 8,
    icon: <Briefcase size={18} color="#0f172a" />,
  },
  {
    id: 'blank',
    name: 'Blank Organization Workspace',
    category: 'Custom Organization',
    badge: 'Clean Slate',
    description: 'Empty workspace with 0 tasks. Ready for your organization to input real custom engineering tasks and calculate timelines.',
    taskCount: 0,
    icon: <FileSpreadsheet size={18} color="#0f172a" />,
  },
];

export const WorkspaceTemplatesModal: React.FC<WorkspaceTemplatesModalProps> = ({
  onClose,
  onTemplateLoaded,
  tasks,
  criticalPathTaskIds,
}) => {
  const [selectedId, setSelectedId] = useState<string>('canonical');
  const [isLoading, setIsLoading] = useState(false);

  const handleApply = async () => {
    setIsLoading(true);
    try {
      await api.loadTemplate(selectedId);
      const chosen = TEMPLATE_OPTIONS.find((t) => t.id === selectedId);
      onTemplateLoaded(chosen?.name || 'Workspace Template');
      onClose();
    } catch {
      alert('Failed to load workspace template.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleExportReport = () => {
    const total = tasks.length;
    const done = tasks.filter((t) => t.column_status === 'done').length;
    const active = tasks.filter((t) => t.computed_status === 'ready' && t.column_status !== 'done').length;
    const blocked = tasks.filter((t) => t.computed_status === 'blocked').length;

    let markdown = `# TaskFlow Pro — Project Schedule & Critical Path Report\n`;
    markdown += `Generated: ${new Date().toISOString()}\n\n`;
    markdown += `## Executive Summary\n`;
    markdown += `- **Total Tasks:** ${total}\n`;
    markdown += `- **Completed Tasks:** ${done} (${total > 0 ? Math.round((done / total) * 100) : 0}%)\n`;
    markdown += `- **Active / Ready Tasks:** ${active}\n`;
    markdown += `- **Blocked Tasks:** ${blocked}\n`;
    markdown += `- **Zero-Slack Critical Path Tasks:** ${criticalPathTaskIds.length}\n\n`;

    markdown += `## Task Inventory & Topological Status\n`;
    markdown += `| ID | Title | Stage | Computed Status | Duration | Slack Status | Prerequisites |\n`;
    markdown += `|---|---|---|---|---|---|---|\n`;
    tasks.forEach((t) => {
      const isCrit = criticalPathTaskIds.includes(t.id);
      markdown += `| ${t.id.slice(0, 8)} | ${t.title} | ${t.column_status} | ${t.computed_status} | ${t.duration_days}d | ${isCrit ? '0d (Critical)' : 'Buffer Available'} | ${t.dependencies.length} upstream |\n`;
    });

    const blob = new Blob([markdown], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `taskflow-project-report-${new Date().toISOString().split('T')[0]}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div
        className="modal-content"
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: '680px', padding: 0 }}
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
              <Briefcase size={17} />
            </div>
            <div>
              <h3 style={{ fontSize: '1rem', fontWeight: 800, color: '#0f172a' }}>
                Organization Setup & Project Workspaces
              </h3>
              <p style={{ fontSize: '0.725rem', color: 'var(--text-muted)' }}>
                Deploy real organizational project workflows or start fresh with your custom tasks.
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

        {/* Template List */}
        <div style={{ padding: '1.25rem 1.5rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            Choose a Production Workspace:
          </span>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
            {TEMPLATE_OPTIONS.map((tmpl) => {
              const isSelected = selectedId === tmpl.id;
              return (
                <div
                  key={tmpl.id}
                  onClick={() => setSelectedId(tmpl.id)}
                  style={{
                    background: isSelected ? '#f8fafc' : '#ffffff',
                    border: isSelected ? '2px solid #0f172a' : '1px solid var(--border-subtle)',
                    borderRadius: '0.5rem',
                    padding: '0.85rem 1rem',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'flex-start',
                    justifyContent: 'space-between',
                    gap: '1rem',
                    boxShadow: isSelected ? '0 2px 4px rgba(15, 23, 42, 0.08)' : 'var(--shadow-sm)',
                    transition: 'all 0.15s ease',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
                    <div
                      style={{
                        padding: '0.4rem',
                        background: '#f1f5f9',
                        borderRadius: '0.375rem',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      {tmpl.icon}
                    </div>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                        <h4 style={{ fontSize: '0.875rem', fontWeight: 700, color: '#0f172a' }}>
                          {tmpl.name}
                        </h4>
                        <span
                          style={{
                            fontSize: '0.6875rem',
                            padding: '0.1rem 0.45rem',
                            borderRadius: '999px',
                            background: '#f1f5f9',
                            color: '#475569',
                            border: '1px solid #cbd5e1',
                            fontWeight: 600,
                          }}
                        >
                          {tmpl.badge}
                        </span>
                      </div>
                      <p style={{ fontSize: '0.75rem', color: '#475569', lineHeight: 1.4 }}>
                        {tmpl.description}
                      </p>
                    </div>
                  </div>

                  <div
                    style={{
                      width: '20px',
                      height: '20px',
                      borderRadius: '999px',
                      border: isSelected ? '6px solid #0f172a' : '2px solid #cbd5e1',
                      background: '#ffffff',
                      flexShrink: 0,
                      marginTop: '0.25rem',
                    }}
                  />
                </div>
              );
            })}
          </div>

          {/* Export Report Utility */}
          <div
            style={{
              marginTop: '0.5rem',
              padding: '0.75rem 1rem',
              background: '#f8fafc',
              border: '1px solid var(--border-subtle)',
              borderRadius: '0.5rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <div>
              <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#0f172a', display: 'block' }}>
                Export Project Schedule Report
              </span>
              <span style={{ fontSize: '0.725rem', color: 'var(--text-muted)' }}>
                Download comprehensive topological status, critical path chains, and completion metrics.
              </span>
            </div>
            <button
              type="button"
              onClick={handleExportReport}
              className="btn btn-secondary"
              style={{ fontSize: '0.75rem', padding: '0.35rem 0.75rem' }}
            >
              <Download size={13} />
              Export .MD
            </button>
          </div>

          {/* Footer Actions */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'flex-end',
              gap: '0.75rem',
              paddingTop: '0.75rem',
              borderTop: '1px solid var(--border-subtle)',
              marginTop: '0.5rem',
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
              type="button"
              onClick={handleApply}
              disabled={isLoading}
              className="btn btn-primary"
              style={{ fontSize: '0.8rem' }}
            >
              <Check size={13} />
              {isLoading ? 'Deploying Workspace...' : 'Deploy Selected Workspace'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
