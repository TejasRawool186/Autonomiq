import React from 'react';
import {
  CheckCircle2,
  Loader2,
  Clock3,
  XCircle,
  Play,
  RotateCw,
  X,
  Cpu,
  Globe,
  FileOutput,
  Layers,
  Calendar,
  AlertTriangle
} from 'lucide-react';
import { Task, Step } from '../types';

interface TaskMonitorProps {
  task: Task;
  onStartClick: () => void;
  onCancelClick: () => void;
  onRetryClick?: () => void;
}

const STAGES = [
  { key: 'plan', label: 'Plan', desc: 'Synthesize objective into structured execution plan' },
  { key: 'search', label: 'Search', desc: 'Live web research & source grounding via SerpApi' },
  { key: 'extract', label: 'Extract', desc: 'Sanitize content & strip DOM noise from candidate URLs' },
  { key: 'index', label: 'Index', desc: 'Semantic chunking & vector indexing in local Qdrant' },
  { key: 'analyze', label: 'Analyze', desc: 'Evidence reasoning & comparative synthesis' },
  { key: 'report', label: 'Report', desc: 'Compile source-backed Markdown report with citations' },
  { key: 'voice', label: 'Voice', desc: 'Generate audio digest via ElevenLabs v2' },
];

export const TaskMonitor: React.FC<TaskMonitorProps> = ({
  task,
  onStartClick,
  onCancelClick,
  onRetryClick,
}) => {
  const [elapsed, setElapsed] = React.useState(0);
  const steps = task.steps || [];
  const sources = task.sources || [];
  const artifacts = task.artifacts || [];

  React.useEffect(() => {
    if (task.status !== 'running') {
      if (task.created_at && task.updated_at && task.status === 'completed') {
        const diff = Math.max(0, Math.floor((new Date(task.updated_at).getTime() - new Date(task.created_at).getTime()) / 1000));
        setElapsed(diff);
      }
      return;
    }

    const interval = setInterval(() => {
      const created = new Date(task.created_at).getTime();
      setElapsed(Math.max(0, Math.floor((Date.now() - created) / 1000)));
    }, 1000);
    return () => clearInterval(interval);
  }, [task.status, task.created_at, task.updated_at]);

  const formatStepDuration = (step?: Step) => {
    if (!step) return null;
    if (step.started_at && step.completed_at) {
      const dur = Math.max(1, Math.round((new Date(step.completed_at).getTime() - new Date(step.started_at).getTime()) / 1000));
      return `${dur}s`;
    }
    if (step.status === 'running' && step.started_at) {
      const dur = Math.max(0, Math.round((Date.now() - new Date(step.started_at).getTime()) / 1000));
      return `${dur}s`;
    }
    return null;
  };

  const formatTime = (seconds: number) => {
    if (seconds < 60) return `${seconds}s`;
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}m ${s}s`;
  };

  return (
    <section className="card" style={{ marginBottom: '20px' }}>
      {/* Task Header & Actions */}
      <div
        style={{
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          gap: '16px',
          flexWrap: 'wrap',
          marginBottom: '16px',
        }}
      >
        <div style={{ flex: 1, minWidth: '280px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
            <span className={`badge badge-${task.status}`}>{task.status}</span>
            <span
              style={{
                fontSize: '12px',
                color: 'var(--text-secondary)',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
              }}
            >
              <Cpu size={13} />
              {task.model_name || 'Local AI'}
            </span>
            <span
              style={{
                fontSize: '12px',
                color: 'var(--text-muted)',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
              }}
            >
              <Calendar size={12} />
              {new Date(task.created_at).toLocaleDateString()} {new Date(task.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>

          <h2 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text-main)' }}>
            {task.title}
          </h2>

          <p style={{ fontSize: '13.5px', color: 'var(--text-secondary)', marginTop: '6px', lineHeight: 1.5 }}>
            {task.description}
          </p>

          {task.error_summary && (
            <div
              style={{
                marginTop: '10px',
                padding: '8px 12px',
                backgroundColor: '#FDF2F2',
                border: '1px solid #F8D7D7',
                borderRadius: 'var(--radius-md)',
                color: 'var(--status-error)',
                fontSize: '12.5px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
              }}
            >
              <AlertTriangle size={15} flex-shrink="0" />
              <span>{task.error_summary}</span>
            </div>
          )}
        </div>

        {/* Action Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {task.status === 'planned' && (
            <button type="button" className="btn btn-primary" onClick={onStartClick}>
              <Play size={15} />
              Approve & Run (Away Mode)
            </button>
          )}

          {task.status === 'running' && (
            <button
              type="button"
              className="btn btn-destructive btn-sm"
              onClick={onCancelClick}
              title="Stop running background task"
            >
              <X size={14} />
              Cancel Task
            </button>
          )}

          {(task.status === 'failed' || task.status === 'cancelled' || task.status === 'completed') && onRetryClick && (
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={onRetryClick}
              title="Re-run research pipeline from start"
            >
              <RotateCw size={14} />
              Re-run Task
            </button>
          )}
        </div>
      </div>

      {/* Compact Statistics Row */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
          gap: '10px',
          padding: '12px 14px',
          backgroundColor: 'var(--bg-subtle)',
          borderRadius: 'var(--radius-md)',
          marginBottom: '20px',
          fontSize: '12.5px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Globe size={15} style={{ color: 'var(--primary-green)' }} />
          <div>
            <span style={{ color: 'var(--text-secondary)' }}>Sources: </span>
            <strong style={{ color: 'var(--text-main)' }}>{sources.length}</strong>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Layers size={15} style={{ color: 'var(--status-info)' }} />
          <div>
            <span style={{ color: 'var(--text-secondary)' }}>Indexed Chunks: </span>
            <strong style={{ color: 'var(--text-main)' }}>{sources.length * 3 || 0}</strong>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <FileOutput size={15} style={{ color: 'var(--status-success)' }} />
          <div>
            <span style={{ color: 'var(--text-secondary)' }}>Artifacts: </span>
            <strong style={{ color: 'var(--text-main)' }}>{artifacts.length}</strong>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Clock3 size={15} style={{ color: 'var(--text-secondary)' }} />
          <div>
            <span style={{ color: 'var(--text-secondary)' }}>Elapsed: </span>
            <strong style={{ color: 'var(--text-main)' }}>{formatTime(elapsed)}</strong>
          </div>
        </div>
      </div>

      {/* Live Chronological Vertical Timeline */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
          <h3 style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-main)', letterSpacing: '-0.01em' }}>
            Live Execution Timeline
          </h3>
          <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
            Sequential Autonomous Stages
          </span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', position: 'relative', paddingLeft: '8px' }}>
          {STAGES.map((stage, idx) => {
            const stepObj = steps.find((s) => s.name === stage.key);
            const status = stepObj ? stepObj.status : (task.status === 'completed' ? 'completed' : 'pending');
            const isLast = idx === STAGES.length - 1;
            const duration = formatStepDuration(stepObj);

            // Icon & color selection
            let statusIcon = <Clock3 size={16} style={{ color: 'var(--text-muted)' }} />;
            let circleBg = 'var(--bg-card)';
            let borderColor = 'var(--border-subtle)';
            let statusTextColor = 'var(--text-muted)';
            let statusLabel = 'Pending';

            if (status === 'completed') {
              statusIcon = <CheckCircle2 size={16} style={{ color: 'var(--status-success)' }} />;
              circleBg = 'var(--bg-pale-green)';
              borderColor = '#BBF0CB';
              statusTextColor = 'var(--status-success)';
              statusLabel = 'Completed';
            } else if (status === 'running') {
              statusIcon = <Loader2 size={16} className="pulse-active" style={{ color: 'var(--primary-green)' }} />;
              circleBg = '#E6F7EC';
              borderColor = 'var(--primary-green)';
              statusTextColor = 'var(--primary-green)';
              statusLabel = 'Running';
            } else if (status === 'failed') {
              statusIcon = <XCircle size={16} style={{ color: 'var(--status-error)' }} />;
              circleBg = '#FEE2E2';
              borderColor = '#FECACA';
              statusTextColor = 'var(--status-error)';
              statusLabel = 'Failed';
            }

            return (
              <div
                key={stage.key}
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  position: 'relative',
                  minHeight: isLast ? 'auto' : '52px',
                }}
              >
                {/* Connecting vertical line */}
                {!isLast && (
                  <div
                    style={{
                      position: 'absolute',
                      left: '15px',
                      top: '28px',
                      bottom: 0,
                      width: '2px',
                      backgroundColor: status === 'completed' ? 'var(--primary-green)' : 'var(--border-subtle)',
                      transition: 'background-color 0.3s ease',
                    }}
                  />
                )}

                {/* Status Indicator Icon */}
                <div
                  style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '50%',
                    backgroundColor: circleBg,
                    border: `1.5px solid ${borderColor}`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                    zIndex: 1,
                    transition: 'all 0.2s ease',
                  }}
                >
                  {statusIcon}
                </div>

                {/* Stage Info */}
                <div style={{ marginLeft: '14px', flex: 1, paddingBottom: isLast ? '0' : '16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontSize: '13.5px', fontWeight: 600, color: 'var(--text-main)' }}>
                        {stage.label}
                      </span>
                      <span
                        style={{
                          fontSize: '11px',
                          fontWeight: 500,
                          color: statusTextColor,
                        }}
                      >
                        {statusLabel}
                      </span>
                    </div>

                    {duration && (
                      <span
                        style={{
                          fontSize: '11px',
                          fontWeight: 600,
                          color: 'var(--text-secondary)',
                          backgroundColor: 'var(--bg-subtle)',
                          padding: '1px 6px',
                          borderRadius: 'var(--radius-sm)',
                        }}
                      >
                        {duration}
                      </span>
                    )}
                  </div>

                  <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '2px' }}>
                    {stage.desc}
                  </p>

                  {stepObj?.error_info && (
                    <p style={{ fontSize: '11.5px', color: 'var(--status-error)', marginTop: '4px' }}>
                      Error: {stepObj.error_info}
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
