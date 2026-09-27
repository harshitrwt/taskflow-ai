import React, { useState, useRef, useEffect, useLayoutEffect, useMemo } from 'react';
import { GitFork, AlertCircle, CheckCircle2, Eye, EyeOff } from 'lucide-react';
import { Task } from '../../types';

interface DagFlowViewProps {
  tasks: Task[];
  criticalPathIds: string[];
  onSelectTask: (task: Task) => void;
}

interface EdgeCoord {
  id: string;
  sourceId: string;
  targetId: string;
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  isCritical: boolean;
}

export const DagFlowView: React.FC<DagFlowViewProps> = ({
  tasks,
  criticalPathIds,
  onSelectTask,
}) => {
  const [showLines, setShowLines] = useState(true);
  const [criticalOnly, setCriticalOnly] = useState(false);
  const [hoveredTaskId, setHoveredTaskId] = useState<string | null>(null);
  const [edgeCoords, setEdgeCoords] = useState<EdgeCoord[]>([]);
  const [svgDimensions, setSvgDimensions] = useState({ width: 1200, height: 600 });

  const containerRef = useRef<HTMLDivElement>(null);
  const scrollWrapperRef = useRef<HTMLDivElement>(null);
  const nodeRefs = useRef<Map<string, HTMLDivElement>>(new Map());

  const criticalSet = useMemo(() => new Set(criticalPathIds), [criticalPathIds]);
  const taskMap = useMemo(() => new Map(tasks.map((t) => [t.id, t])), [tasks]);

  // Organize tasks into topological stages/tiers based on dependency depth
  const depthMap = useMemo(() => {
    const map = new Map<string, number>();
    const computeDepth = (taskId: string, visited: Set<string> = new Set()): number => {
      if (map.has(taskId)) return map.get(taskId)!;
      if (visited.has(taskId)) return 0;
      visited.add(taskId);

      const task = taskMap.get(taskId);
      if (!task || task.dependencies.length === 0) {
        map.set(taskId, 0);
        return 0;
      }

      const maxPrereqDepth = Math.max(
        ...task.dependencies.map((depId) => computeDepth(depId, new Set(visited)))
      );
      const d = maxPrereqDepth + 1;
      map.set(taskId, d);
      return d;
    };

    tasks.forEach((t) => computeDepth(t.id));
    return map;
  }, [tasks, taskMap]);

  // Group by depth
  const maxDepth = Math.max(0, ...Array.from(depthMap.values()));
  const tiers: Task[][] = Array.from({ length: maxDepth + 1 }, () => []);
  tasks.forEach((t) => {
    const d = depthMap.get(t.id) || 0;
    tiers[d].push(t);
  });

  const tierLabels = [
    'Stage 1: Foundation & Setup',
    'Stage 2: Core Architecture',
    'Stage 3: Services & Components',
    'Stage 4: Integration (Convergences)',
    'Stage 5: Staging & Deploy',
    'Stage 6: Launch & Verification',
  ];

  // Measure and compute SVG coordinates for every prerequisite edge
  const updateEdgePositions = () => {
    if (!scrollWrapperRef.current) return;
    const wrapper = scrollWrapperRef.current;
    const wrapperRect = wrapper.getBoundingClientRect();
    const scrollLeft = wrapper.scrollLeft;
    const scrollTop = wrapper.scrollTop;

    setSvgDimensions({
      width: Math.max(wrapper.scrollWidth, wrapperRect.width),
      height: Math.max(wrapper.scrollHeight, wrapperRect.height),
    });

    const newEdges: EdgeCoord[] = [];

    tasks.forEach((task) => {
      const targetEl = nodeRefs.current.get(task.id);
      if (!targetEl) return;
      const targetRect = targetEl.getBoundingClientRect();

      task.dependencies.forEach((prereqId) => {
        const sourceEl = nodeRefs.current.get(prereqId);
        if (!sourceEl) return;
        const sourceRect = sourceEl.getBoundingClientRect();

        const x1 = sourceRect.right - wrapperRect.left + scrollLeft;
        const y1 = sourceRect.top + sourceRect.height / 2 - wrapperRect.top + scrollTop;
        const x2 = targetRect.left - wrapperRect.left + scrollLeft;
        const y2 = targetRect.top + targetRect.height / 2 - wrapperRect.top + scrollTop;

        const isCritical = criticalSet.has(prereqId) && criticalSet.has(task.id);

        newEdges.push({
          id: `${prereqId}->${task.id}`,
          sourceId: prereqId,
          targetId: task.id,
          x1,
          y1,
          x2,
          y2,
          isCritical,
        });
      });
    });

    setEdgeCoords(newEdges);
  };

  useLayoutEffect(() => {
    const timer = setTimeout(updateEdgePositions, 50);
    return () => clearTimeout(timer);
  }, [tasks, depthMap]);

  useEffect(() => {
    const handleResize = () => updateEdgePositions();
    window.addEventListener('resize', handleResize);
    const wrapper = scrollWrapperRef.current;
    if (wrapper) {
      wrapper.addEventListener('scroll', handleResize);
    }
    return () => {
      window.removeEventListener('resize', handleResize);
      if (wrapper) {
        wrapper.removeEventListener('scroll', handleResize);
      }
    };
  }, []);

  return (
    <div
      ref={containerRef}
      style={{
        background: '#ffffff',
        border: '1px solid var(--border-subtle)',
        borderRadius: '0.625rem',
        padding: '1.25rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '1rem',
      }}
    >
      {/* Header & Controls */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem' }}>
        <div>
          <h3 style={{ fontSize: '1rem', fontWeight: 800, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <GitFork size={18} />
            Interactive DAG Topological Pipeline
          </h3>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            Strict Directed Acyclic Graph topology with dynamic SVG Bézier vector connections and diamond convergence tracking.
          </p>
        </div>

        {/* View toggles & Legend */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <button
              type="button"
              onClick={() => setShowLines(!showLines)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.35rem',
                fontSize: '0.75rem',
                fontWeight: 600,
                padding: '0.25rem 0.65rem',
                borderRadius: '0.35rem',
                border: '1px solid var(--border-subtle)',
                background: showLines ? '#f1f5f9' : '#ffffff',
                color: '#0f172a',
                cursor: 'pointer',
              }}
            >
              {showLines ? <Eye size={13} /> : <EyeOff size={13} />}
              <span>{showLines ? 'Lines Active' : 'Show Lines'}</span>
            </button>

            <button
              type="button"
              onClick={() => setCriticalOnly(!criticalOnly)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.35rem',
                fontSize: '0.75rem',
                fontWeight: 600,
                padding: '0.25rem 0.65rem',
                borderRadius: '0.35rem',
                border: criticalOnly ? '1px solid #0f172a' : '1px solid var(--border-subtle)',
                background: criticalOnly ? '#0f172a' : '#ffffff',
                color: criticalOnly ? '#ffffff' : '#0f172a',
                cursor: 'pointer',
              }}
            >
              <span>Critical Chain Only</span>
            </button>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', fontSize: '0.75rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <span style={{ width: '16px', height: '3px', background: '#0f172a', borderRadius: '1px' }} />
              <span style={{ color: '#0f172a', fontWeight: 700 }}>Critical Edge</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <span style={{ width: '16px', height: '2px', background: '#94a3b8', borderRadius: '1px' }} />
              <span style={{ color: '#64748b', fontWeight: 600 }}>Prerequisite Edge</span>
            </div>
          </div>
        </div>
      </div>

      {/* Scrollable Canvas Container */}
      <div
        ref={scrollWrapperRef}
        style={{
          position: 'relative',
          overflowX: 'auto',
          overflowY: 'hidden',
          paddingBottom: '1rem',
          minHeight: '380px',
        }}
      >
        {/* Dynamic SVG Vector Overlay */}
        {showLines && (
          <svg
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: svgDimensions.width,
              height: svgDimensions.height,
              pointerEvents: 'none',
              zIndex: 1,
            }}
          >
            <defs>
              {/* Normal Arrow Marker */}
              <marker
                id="dag-arrow-normal"
                viewBox="0 0 10 10"
                refX="8"
                refY="5"
                markerWidth="6"
                markerHeight="6"
                orient="auto-start-reverse"
              >
                <path d="M 0 1 L 9 5 L 0 9 z" fill="#94a3b8" />
              </marker>

             
              <marker
                id="dag-arrow-critical"
                viewBox="0 0 10 10"
                refX="8"
                refY="5"
                markerWidth="7"
                markerHeight="7"
                orient="auto-start-reverse"
              >
                <path d="M 0 1 L 9 5 L 0 9 z" fill="#0f172a" />
              </marker>

              
              <marker
                id="dag-arrow-hover"
                viewBox="0 0 10 10"
                refX="8"
                refY="5"
                markerWidth="7"
                markerHeight="7"
                orient="auto-start-reverse"
              >
                <path d="M 0 1 L 9 5 L 0 9 z" fill="#15803d" />
              </marker>
            </defs>

            {edgeCoords
              .filter((edge) => !criticalOnly || edge.isCritical)
              .map((edge) => {
                const isHoverConnected =
                  hoveredTaskId &&
                  (edge.sourceId === hoveredTaskId || edge.targetId === hoveredTaskId);
                const isDimmed = hoveredTaskId && !isHoverConnected;

                const dx = Math.max(30, (edge.x2 - edge.x1) * 0.45);
                const pathData = `M ${edge.x1} ${edge.y1} C ${edge.x1 + dx} ${edge.y1}, ${edge.x2 - dx} ${edge.y2}, ${edge.x2} ${edge.y2}`;

                let strokeColor = edge.isCritical ? '#0f172a' : '#94a3b8';
                let strokeWidth = edge.isCritical ? 2.5 : 1.5;
                let markerEnd = edge.isCritical ? 'url(#dag-arrow-critical)' : 'url(#dag-arrow-normal)';

                if (isHoverConnected) {
                  strokeColor = '#15803d';
                  strokeWidth = 3;
                  markerEnd = 'url(#dag-arrow-hover)';
                }

                return (
                  <path
                    key={edge.id}
                    d={pathData}
                    fill="none"
                    stroke={strokeColor}
                    strokeWidth={strokeWidth}
                    strokeOpacity={isDimmed ? 0.15 : 0.85}
                    markerEnd={markerEnd}
                    style={{
                      transition: 'stroke 0.2s, stroke-width 0.2s, stroke-opacity 0.2s',
                    }}
                  />
                );
              })}
          </svg>
        )}

        {/* Pipeline Stage Columns */}
        <div
          style={{
            position: 'relative',
            zIndex: 2,
            display: 'flex',
            gap: '1.75rem',
            alignItems: 'flex-start',
            minWidth: `${Math.max(920, tiers.length * 270)}px`,
            padding: '0.5rem 0',
          }}
        >
          {tiers.map((tierTasks, tierIdx) => (
            <div
              key={tierIdx}
              style={{
                flex: '1 0 250px',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.85rem',
              }}
            >
              {/* Tier Header */}
              <div
                style={{
                  fontSize: '0.725rem',
                  fontWeight: 700,
                  color: '#0f172a',
                  background: '#f8fafc',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: '0.375rem',
                  padding: '0.45rem 0.65rem',
                  textAlign: 'center',
                  textTransform: 'uppercase',
                  letterSpacing: '0.03em',
                  boxShadow: 'var(--shadow-sm)',
                }}
              >
                {tierLabels[tierIdx] || `Stage ${tierIdx + 1}`}
              </div>

              {/* Nodes in this tier */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                {tierTasks.map((task) => {
                  const isCrit = criticalSet.has(task.id);
                  const isBlocked = task.computed_status === 'blocked';
                  const isHovered = hoveredTaskId === task.id;

                  return (
                    <div
                      key={task.id}
                      ref={(el) => {
                        if (el) nodeRefs.current.set(task.id, el);
                        else nodeRefs.current.delete(task.id);
                      }}
                      onClick={() => onSelectTask(task)}
                      onMouseEnter={() => setHoveredTaskId(task.id)}
                      onMouseLeave={() => setHoveredTaskId(null)}
                      style={{
                        background: '#ffffff',
                        border: isHovered
                          ? '2px solid #15803d'
                          : isCrit
                          ? '2px solid #0f172a'
                          : isBlocked
                          ? '1px solid #fecaca'
                          : '1px solid var(--border-subtle)',
                        boxShadow: isCrit
                          ? '0 4px 6px -1px rgba(15, 23, 42, 0.15)'
                          : 'var(--shadow-sm)',
                        borderRadius: '0.5rem',
                        padding: '0.85rem',
                        cursor: 'pointer',
                        transition: 'all 0.15s ease',
                        position: 'relative',
                      }}
                    >
                      {/* Socket handles for visual anchor */}
                      <span
                        style={{
                          position: 'absolute',
                          left: '-4px',
                          top: '50%',
                          transform: 'translateY(-50%)',
                          width: '8px',
                          height: '8px',
                          borderRadius: '50%',
                          background: isCrit ? '#0f172a' : '#cbd5e1',
                          border: '2px solid #ffffff',
                        }}
                      />
                      <span
                        style={{
                          position: 'absolute',
                          right: '-4px',
                          top: '50%',
                          transform: 'translateY(-50%)',
                          width: '8px',
                          height: '8px',
                          borderRadius: '50%',
                          background: isCrit ? '#0f172a' : '#cbd5e1',
                          border: '2px solid #ffffff',
                        }}
                      />

                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
                        <span
                          style={{
                            fontSize: '0.65rem',
                            fontFamily: 'var(--font-mono)',
                            color: '#475569',
                            fontWeight: 700,
                            background: '#f1f5f9',
                            padding: '0.1rem 0.4rem',
                            borderRadius: '0.25rem',
                          }}
                        >
                          {task.column_status.replace('_', ' ').toUpperCase()}
                        </span>

                        {isCrit && (
                          <span
                            style={{
                              color: '#0f172a',
                              background: '#f1f5f9',
                              border: '1px solid #cbd5e1',
                              borderRadius: '999px',
                              padding: '0.1rem 0.45rem',
                              fontSize: '0.65rem',
                              fontWeight: 800,
                              letterSpacing: '0.02em',
                            }}
                          >
                            CPM ZERO-SLACK
                          </span>
                        )}
                      </div>

                      <h5 style={{ fontSize: '0.85rem', fontWeight: 700, color: '#0f172a', marginBottom: '0.35rem', lineHeight: 1.3 }}>
                        {task.title}
                      </h5>

                      {/* Precedence info */}
                      <div style={{ fontSize: '0.725rem', color: 'var(--text-muted)', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                          <span>Duration:</span>
                          <strong style={{ color: '#0f172a' }}>{task.duration_days}d</strong>
                          <span style={{ margin: '0 0.2rem' }}>•</span>
                          <span>Dates:</span>
                          <strong style={{ color: '#0f172a' }}>{task.start_date.slice(5)} → {task.end_date.slice(5)}</strong>
                        </div>

                        {task.dependencies.length > 0 && (
                          <div
                            style={{
                              marginTop: '0.25rem',
                              color: isBlocked ? '#b91c1c' : '#15803d',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '0.3rem',
                              fontWeight: 600,
                            }}
                          >
                            {isBlocked ? <AlertCircle size={12} /> : <CheckCircle2 size={12} />}
                            <span>{task.dependencies.length} prerequisite(s)</span>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
