import React, { useState, useMemo, useEffect } from 'react';
import {
  Layers,
  Plus,
  RotateCw,
  Cpu,
  CheckCircle2,
  AlertCircle,
  GitFork,
  Kanban,
  Search,
  Database,
  HelpCircle,
  Briefcase,
  X,
  Award,
  Building2,
} from 'lucide-react';
import { useTasks } from './hooks/useTasks';
import { Task } from './types';
import { KanbanBoard } from './components/board/KanbanBoard';
import { CriticalPathView } from './components/critical-path/CriticalPathView';
import { TaskDetailPanel } from './components/task/TaskDetailPanel';
import { CreateTaskModal } from './components/task/CreateTaskModal';
import { DagFlowView } from './components/graph/DagFlowView';
import { SystemGuideModal } from './components/guide/SystemGuideModal';
import { WorkspaceTemplatesModal } from './components/workspace/WorkspaceTemplatesModal';
import { LandingPage } from './components/landing/LandingPage';
import { CompanyAuthModal, CompanyAuthData } from './components/auth/CompanyAuthModal';
import { ConfirmDeleteModal } from './components/common/ConfirmDeleteModal';
import { api } from './api/client';

interface ToastItem {
  id: number;
  message: string;
  type: 'error' | 'success';
}

type ViewMode = 'kanban' | 'dag';
type FilterStatus = 'all' | 'ready' | 'blocked' | 'critical';

export const App: React.FC = () => {
  const {
    tasks,
    criticalPath,
    projectEndDate,
    isLoading,
    isError,
    createTask,
    updateTask,
    moveTask,
    deleteTask,
    invalidate,
  } = useTasks();

  const [currentPage, setCurrentPage] = useState<'app' | 'landing'>('landing');
  const [viewMode, setViewMode] = useState<ViewMode>('kanban');
  const [filterStatus, setFilterStatus] = useState<FilterStatus>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isGuideOpen, setIsGuideOpen] = useState(false);
  const [isWorkspaceOpen, setIsWorkspaceOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signup');
  const [isCriticalPathActive, setIsCriticalPathActive] = useState(false);
  const [isSeeding, setIsSeeding] = useState(false);
  const [hideDone, setHideDone] = useState(false);
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  // Task deletion confirmation state
  const [taskToDelete, setTaskToDelete] = useState<Task | null>(null);
  const [isDeletingTask, setIsDeletingTask] = useState(false);

  // Company / Organization session state
  const [companySession, setCompanySession] = useState<CompanyAuthData | null>(null);

  useEffect(() => {
    try {
      const saved = localStorage.getItem('taskflow_company_session');
      if (saved) {
        setCompanySession(JSON.parse(saved));
      }
    } catch {
      // Ignore parse errors
    }
  }, []);

  // Deduplicating toast notification dispatch with clean auto-dismiss
  const addToast = (message: string, type: 'error' | 'success') => {
    setToasts((prev) => {
      if (prev.some((t) => t.message === message)) return prev;
      const id = Date.now();
      setTimeout(() => {
        setToasts((curr) => curr.filter((t) => t.id !== id));
      }, 3500);
      return [...prev, { id, message, type }];
    });
  };

  const handleResetSeed = async () => {
    if (!window.confirm('Reset database to canonical 10-task diamond graph demo state?')) return;
    setIsSeeding(true);
    try {
      await api.seedDemo();
      invalidate();
      addToast('Reset completed: Canonical 10-task diamond graph restored.', 'success');
    } catch {
      addToast('Failed to reset seed data.', 'error');
    } finally {
      setIsSeeding(false);
    }
  };

  const handleDeleteConfirmed = async () => {
    if (!taskToDelete) return;
    setIsDeletingTask(true);
    try {
      await deleteTask(taskToDelete.id);
      addToast(`Cleared completed task "${taskToDelete.title}"`, 'success');
      setTaskToDelete(null);
    } catch {
      addToast('Failed to delete task.', 'error');
    } finally {
      setIsDeletingTask(false);
    }
  };

  const filteredTasks = useMemo(() => {
    const critSet = new Set(criticalPath);
    return tasks.filter((t) => {
      if (hideDone && t.column_status === 'done') return false;

      const matchesSearch =
        t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.description.toLowerCase().includes(searchQuery.toLowerCase());
      if (!matchesSearch) return false;

      if (filterStatus === 'ready') return t.computed_status === 'ready';
      if (filterStatus === 'blocked') return t.computed_status === 'blocked';
      if (filterStatus === 'critical') return critSet.has(t.id);
      return true;
    });
  }, [tasks, searchQuery, filterStatus, criticalPath, hideDone]);

  const activeSelectedTask = selectedTask
    ? tasks.find((t) => t.id === selectedTask.id) || null
    : null;

  const totalCount = tasks.length;
  const doneCount = tasks.filter((t) => t.column_status === 'done').length;
  const readyCount = tasks.filter((t) => t.computed_status === 'ready' && t.column_status !== 'done').length;
  const blockedCount = tasks.filter((t) => t.computed_status === 'blocked').length;
  const progressPercent = totalCount > 0 ? Math.round((doneCount / totalCount) * 100) : 0;
  const isProjectComplete = totalCount > 0 && doneCount === totalCount;

  // Render Landing Page if active
  if (currentPage === 'landing') {
    return (
      <>
        <LandingPage
          onEnterApp={() => setCurrentPage('app')}
          onOpenAuth={(mode) => {
            setAuthMode(mode);
            setIsAuthOpen(true);
          }}
          activeOrgName={companySession ? `${companySession.orgName} (${companySession.workspaceName})` : null}
        />

        {isAuthOpen && (
          <CompanyAuthModal
            initialMode={authMode}
            onClose={() => setIsAuthOpen(false)}
            onSuccess={(data) => {
              setCompanySession(data);
              setCurrentPage('app');
              addToast(`Connected to ${data.orgName} (${data.workspaceName})`, 'success');
            }}
          />
        )}
      </>
    );
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: 'var(--bg-app)' }}>
      {/* Top Navbar */}
      <header
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 100,
          padding: '0.75rem 1.5rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: '#ffffff',
          borderBottom: '1px solid var(--border-subtle)',
          flexWrap: 'wrap',
          gap: '0.75rem',
        }}
      >
        {/* Brand Logo & Clean Title */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
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
              }}
            >
              <Layers size={17} color="#ffffff" />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                <h1 style={{ fontSize: '1.05rem', fontWeight: 800, letterSpacing: '-0.02em', color: '#0f172a' }}>
                  TaskFlow Pro
                </h1>
              </div>
              <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                Directed Acyclic Graph Scheduling & Precedence Engine
              </p>
            </div>
          </div>

          {/* Active Company / Workspace Selector Pill */}
          <div
            onClick={() => {
              setAuthMode('signup');
              setIsAuthOpen(true);
            }}
            title="Click to switch or rename organization workspace"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              padding: '0.25rem 0.65rem',
              background: '#f8fafc',
              border: '1px solid var(--border-subtle)',
              borderRadius: '0.35rem',
              fontSize: '0.725rem',
              fontWeight: 600,
              color: '#0f172a',
              cursor: 'pointer',
              transition: 'background 0.15s',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = '#f1f5f9')}
            onMouseLeave={(e) => (e.currentTarget.style.background = '#f8fafc')}
          >
            <Building2 size={13} style={{ color: '#64748b' }} />
            <span>
              {companySession
                ? `${companySession.orgName} • ${companySession.workspaceName}`
                : 'Demo Organization'}
            </span>
          </div>

          {/* Quick Metrics: Green for Ready / Active, Red for Blocked */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              borderLeft: '1px solid var(--border-subtle)',
              paddingLeft: '0.85rem',
            }}
          >
            <div
              onClick={() => setFilterStatus(filterStatus === 'ready' ? 'all' : 'ready')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.35rem',
                fontSize: '0.75rem',
                background: filterStatus === 'ready' ? '#dcfce7' : '#ecfdf5',
                color: '#15803d',
                padding: '0.2rem 0.55rem',
                borderRadius: '0.35rem',
                border: '1px solid #bbf7d0',
                cursor: 'pointer',
                fontWeight: 600,
              }}
            >
              <CheckCircle2 size={12} />
              <span>{readyCount} Active</span>
            </div>

            <div
              onClick={() => setFilterStatus(filterStatus === 'blocked' ? 'all' : 'blocked')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.35rem',
                fontSize: '0.75rem',
                background: filterStatus === 'blocked' ? '#fee2e2' : '#fef2f2',
                color: '#b91c1c',
                padding: '0.2rem 0.55rem',
                borderRadius: '0.35rem',
                border: '1px solid #fecaca',
                cursor: 'pointer',
                fontWeight: 600,
              }}
            >
              <AlertCircle size={12} />
              <span>{blockedCount} Blocked</span>
            </div>
          </div>
        </div>

        {/* Action Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.55rem', flexWrap: 'wrap' }}>
          {/* Workspaces / Templates button */}
          <button
            type="button"
            onClick={() => setIsWorkspaceOpen(true)}
            className="btn btn-secondary"
            title="Deploy real organizational workflows (Fintech, AI Pipeline, Blank)"
            style={{ fontSize: '0.75rem', padding: '0.35rem 0.75rem' }}
          >
            <Briefcase size={13} />
            Workspaces
          </button>

          {/* Guide button */}
          <button
            type="button"
            onClick={() => setIsGuideOpen(true)}
            className="btn btn-secondary"
            title="Read system architecture and interactive demo guide"
            style={{ fontSize: '0.75rem', padding: '0.35rem 0.75rem' }}
          >
            <HelpCircle size={14} />
            Guide
          </button>

          {/* View switcher tabs */}
          <div
            style={{
              display: 'flex',
              background: '#f1f5f9',
              padding: '0.2rem',
              borderRadius: '0.375rem',
              border: '1px solid var(--border-subtle)',
            }}
          >
            <button
              type="button"
              onClick={() => setViewMode('kanban')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.35rem',
                padding: '0.25rem 0.65rem',
                borderRadius: '0.25rem',
                border: 'none',
                background: viewMode === 'kanban' ? '#ffffff' : 'transparent',
                color: viewMode === 'kanban' ? '#0f172a' : 'var(--text-muted)',
                fontWeight: 600,
                fontSize: '0.75rem',
                cursor: 'pointer',
                boxShadow: viewMode === 'kanban' ? '0 1px 2px rgba(0,0,0,0.06)' : 'none',
                transition: 'all 0.15s',
              }}
            >
              <Kanban size={13} />
              Board
            </button>
            <button
              type="button"
              onClick={() => setViewMode('dag')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.35rem',
                padding: '0.25rem 0.65rem',
                borderRadius: '0.25rem',
                border: 'none',
                background: viewMode === 'dag' ? '#ffffff' : 'transparent',
                color: viewMode === 'dag' ? '#0f172a' : 'var(--text-muted)',
                fontWeight: 600,
                fontSize: '0.75rem',
                cursor: 'pointer',
                boxShadow: viewMode === 'dag' ? '0 1px 2px rgba(0,0,0,0.06)' : 'none',
                transition: 'all 0.15s',
              }}
            >
              <GitFork size={13} />
              DAG Flow
            </button>
          </div>

          <button
            type="button"
            onClick={handleResetSeed}
            disabled={isSeeding}
            className="btn btn-secondary"
            title="Reset to canonical 10-task diamond test scenario"
            style={{ fontSize: '0.75rem', padding: '0.35rem 0.7rem' }}
          >
            <Database size={13} />
            {isSeeding ? 'Seeding...' : 'Reset'}
          </button>

          {/* Clean Critical Path button - No Flame Emoji */}
          <button
            type="button"
            onClick={() => setIsCriticalPathActive((prev) => !prev)}
            className={`btn btn-critical ${isCriticalPathActive ? 'active' : ''}`}
            style={{ fontSize: '0.75rem', padding: '0.35rem 0.75rem' }}
          >
            Critical Path
          </button>

          <button
            type="button"
            onClick={() => invalidate()}
            className="btn btn-secondary"
            title="Refresh schedule graph from engine"
            style={{ fontSize: '0.75rem', padding: '0.35rem 0.55rem' }}
          >
            <RotateCw size={13} />
          </button>

          <button
            type="button"
            onClick={() => setIsCreateOpen(true)}
            className="btn btn-primary"
            style={{ fontSize: '0.75rem', padding: '0.35rem 0.85rem' }}
          >
            <Plus size={14} />
            New Task
          </button>
        </div>
      </header>

      {/* Filter, Search & Real-time Velocity Sub-Bar */}
      <div
        style={{
          padding: '0.6rem 1.5rem',
          background: '#ffffff',
          borderBottom: '1px solid var(--border-subtle)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '1rem',
          flexWrap: 'wrap',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flex: '1 0 320px' }}>
          <div style={{ position: 'relative', width: '280px' }}>
            <Search
              size={13}
              style={{
                position: 'absolute',
                left: '0.65rem',
                top: '50%',
                transform: 'translateY(-50%)',
                color: 'var(--text-dim)',
              }}
            />
            <input
              type="text"
              placeholder="Search tasks, descriptions, blockers..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: '100%',
                padding: '0.35rem 0.65rem 0.35rem 2rem',
                background: '#f8fafc',
                border: '1px solid var(--border-subtle)',
                borderRadius: '0.35rem',
                color: '#0f172a',
                fontSize: '0.8rem',
                fontFamily: 'inherit',
                outline: 'none',
              }}
            />
          </div>

          {/* Project Completion Velocity Tracker */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', fontSize: '0.75rem' }}>
            <span style={{ color: '#475569', fontWeight: 600 }}>
              Velocity: {doneCount}/{totalCount} Completed ({progressPercent}%)
            </span>
            <div style={{ width: '80px', height: '6px', background: '#e2e8f0', borderRadius: '999px', overflow: 'hidden' }}>
              <div
                style={{
                  width: `${progressPercent}%`,
                  height: '100%',
                  background: progressPercent === 100 ? '#15803d' : '#0f172a',
                  transition: 'width 0.3s ease',
                }}
              />
            </div>
          </div>
        </div>

        {/* Quick Filter Buttons & Hide Done Toggle */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.75rem' }}>
          <span style={{ color: 'var(--text-dim)', marginRight: '0.1rem' }}>Filter:</span>
          {(['all', 'ready', 'blocked', 'critical'] as FilterStatus[]).map((f) => (
            <button
              key={f}
              type="button"
              onClick={() => setFilterStatus(f)}
              style={{
                background: filterStatus === f ? '#0f172a' : '#ffffff',
                color: filterStatus === f ? '#ffffff' : 'var(--text-muted)',
                border: filterStatus === f ? '1px solid #0f172a' : '1px solid var(--border-subtle)',
                borderRadius: '0.3rem',
                padding: '0.2rem 0.55rem',
                fontSize: '0.725rem',
                fontWeight: 600,
                cursor: 'pointer',
                textTransform: 'capitalize',
                transition: 'all 0.15s',
              }}
            >
              {f === 'ready' ? 'Active' : f === 'critical' ? 'Critical Chain' : f}
            </button>
          ))}

          <label
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.3rem',
              color: '#475569',
              fontSize: '0.725rem',
              marginLeft: '0.5rem',
              cursor: 'pointer',
              userSelect: 'none',
            }}
          >
            <input
              type="checkbox"
              checked={hideDone}
              onChange={(e) => setHideDone(e.target.checked)}
              style={{ cursor: 'pointer' }}
            />
            Hide Completed
          </label>
        </div>
      </div>

      {/* Main Workspace Area */}
      <main style={{ flex: 1, padding: '1rem 1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {/* Project Completion Milestone Banner (What After Done) */}
        {isProjectComplete && (
          <div
            style={{
              background: '#ecfdf5',
              border: '1px solid #bbf7d0',
              borderRadius: '0.5rem',
              padding: '0.85rem 1.25rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              boxShadow: 'var(--shadow-sm)',
              animation: 'toastSlide 0.25s ease-out',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
              <div
                style={{
                  width: '28px',
                  height: '28px',
                  borderRadius: '999px',
                  background: '#15803d',
                  color: '#ffffff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Award size={16} />
              </div>
              <div>
                <h4 style={{ color: '#15803d', fontWeight: 800, fontSize: '0.875rem' }}>
                  Project Successfully Completed!
                </h4>
                <p style={{ color: '#166534', fontSize: '0.75rem' }}>
                  All {totalCount} topological tasks and zero-slack Critical Path milestones have been executed with zero cycle violations.
                </p>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <button
                type="button"
                onClick={() => setIsWorkspaceOpen(true)}
                className="btn btn-secondary"
                style={{ fontSize: '0.75rem', padding: '0.35rem 0.75rem', background: '#ffffff' }}
              >
                Export Report / Switch Workspace
              </button>
            </div>
          </div>
        )}

        {/* Critical Path Banner */}
        <CriticalPathView
          isActive={isCriticalPathActive}
          onToggle={() => setIsCriticalPathActive((prev) => !prev)}
          criticalPathTaskIds={criticalPath}
          tasks={tasks}
          projectEndDate={projectEndDate}
        />

        {/* Loading / Error States */}
        {isLoading && (
          <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
            <Cpu size={28} style={{ animation: 'spin 2s linear infinite', margin: '0 auto 0.75rem', color: '#0f172a' }} />
            <p style={{ fontSize: '0.875rem' }}>Syncing schedule DAG with database...</p>
          </div>
        )}

        {isError && (
          <div
            style={{
              padding: '1.25rem',
              background: '#fef2f2',
              border: '1px solid #fecaca',
              borderRadius: '0.5rem',
              color: '#b91c1c',
              textAlign: 'center',
            }}
          >
            <p>Could not connect to TaskFlow backend API at http://localhost:8000.</p>
            <p style={{ fontSize: '0.8rem', marginTop: '0.4rem', color: 'var(--text-muted)' }}>
              Check that the backend is running via: <code>uvicorn app.main:app --reload</code>
            </p>
          </div>
        )}

        {/* View Mode Rendering: Kanban vs DAG Flow */}
        {!isLoading && !isError && (
          viewMode === 'kanban' ? (
            <KanbanBoard
              tasks={filteredTasks}
              criticalPathTaskIds={criticalPath}
              isCriticalPathActive={isCriticalPathActive}
              onMoveTask={moveTask}
              onSelectTask={(task) => setSelectedTask(task)}
              onNotify={addToast}
              onDeleteTask={(task) => setTaskToDelete(task)}
            />
          ) : (
            <DagFlowView
              tasks={filteredTasks}
              criticalPathIds={criticalPath}
              onSelectTask={(task) => setSelectedTask(task)}
            />
          )
        )}
      </main>

      {/* Task Detail Modal */}
      {activeSelectedTask && (
        <TaskDetailPanel
          task={activeSelectedTask}
          allTasks={tasks}
          onClose={() => setSelectedTask(null)}
          onUpdate={(id, updates) => updateTask({ id, payload: updates })}
          onDelete={(id) => deleteTask(id)}
          onTaskRefreshed={() => invalidate()}
        />
      )}

      {/* Create Task Modal */}
      {isCreateOpen && (
        <CreateTaskModal
          onClose={() => setIsCreateOpen(false)}
          onCreate={async (payload) => {
            await createTask(payload);
            addToast(`Created task "${payload.title}"`, 'success');
          }}
        />
      )}

      {/* Confirm Delete Task Modal (For completed tasks / card action) */}
      {taskToDelete && (
        <ConfirmDeleteModal
          task={taskToDelete}
          isDeleting={isDeletingTask}
          onCancel={() => setTaskToDelete(null)}
          onConfirm={handleDeleteConfirmed}
        />
      )}

      {/* System Guide Modal */}
      {isGuideOpen && (
        <SystemGuideModal onClose={() => setIsGuideOpen(false)} />
      )}

      {/* Workspaces & Templates Modal */}
      {isWorkspaceOpen && (
        <WorkspaceTemplatesModal
          onClose={() => setIsWorkspaceOpen(false)}
          onTemplateLoaded={(templateName) => {
            invalidate();
            addToast(`Workspace deployed: ${templateName}`, 'success');
          }}
          tasks={tasks}
          criticalPathTaskIds={criticalPath}
        />
      )}

      {/* Company Auth & Workspace Modal */}
      {isAuthOpen && (
        <CompanyAuthModal
          initialMode={authMode}
          onClose={() => setIsAuthOpen(false)}
          onSuccess={(data) => {
            setCompanySession(data);
            addToast(`Workspace active: ${data.orgName} (${data.workspaceName})`, 'success');
          }}
        />
      )}

      {/* Modern Floating Toast Stack */}
      <div className="toast-container">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`toast ${toast.type === 'error' ? 'toast-error' : 'toast-success'}`}
          >
            <div className="toast-icon-wrap">
              {toast.type === 'error' ? (
                <AlertCircle size={13} />
              ) : (
                <CheckCircle2 size={13} />
              )}
            </div>
            <div className="toast-content">
              <span className="toast-title">{toast.message}</span>
            </div>
            <button
              type="button"
              onClick={() => setToasts((prev) => prev.filter((t) => t.id !== toast.id))}
              className="toast-close-btn"
              title="Dismiss"
            >
              <X size={13} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};
