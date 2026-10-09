import React from 'react';
import { Task } from '../types';

interface TaskMonitorProps {
  task: Task;
  onStartClick: () => void;
  onCancelClick: () => void;
}

export const TaskMonitor: React.FC<TaskMonitorProps> = ({ task, onStartClick, onCancelClick }) => {
  const [elapsed, setElapsed] = React.useState(0);
  const steps = task.steps || [];
  const sources = task.sources || [];

  React.useEffect(() => {
    if (task.status !== 'running') return;
    const interval = setInterval(() => {
      const created = new Date(task.created_at).getTime();
      setElapsed(Math.max(0, Math.floor((Date.now() - created) / 1000)));
    }, 1000);
    return () => clearInterval(interval);
  }, [task.status, task.created_at]);

  return (
    <div className="card" style={{ marginBottom: '24px' }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '16px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
            <span className={`badge badge-${task.status}`}>{task.status}</span>
            <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Model: {task.model_name}</span>
            {task.status === 'running' && (
              <span style={{ fontSize: '12px', color: 'var(--status-running)', fontWeight: 600 }}>
                ⏱️ Elapsed: {elapsed}s
              </span>
            )}
          </div>
          <h3 style={{ fontSize: '18px', fontWeight: 700 }}>{task.title}</h3>
          <p style={{ fontSize: '14px', color: 'var(--text-secondary)', marginTop: '4px' }}>{task.description}</p>
        </div>

        <div style={{ display: 'flex', gap: '8px' }}>
          {task.status === 'planned' && (
            <button className="btn btn-primary" onClick={onStartClick}>
              Approve & Run (Away Mode)
            </button>
          )}
          {task.status === 'running' && (
            <button className="btn btn-secondary" onClick={onCancelClick} style={{ color: 'var(--status-error)' }}>
              Cancel Task
            </button>
          )}
        </div>
      </div>

      {/* Step Timeline */}
      <div style={{ marginTop: '20px' }}>
        <h4 style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
          Execution Pipeline Stages
        </h4>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '8px' }}>
          {['plan', 'search', 'extract', 'index', 'analyze', 'report', 'voice'].map((stageName) => {
            const stepObj = steps.find((s) => s.name === stageName);
            const status = stepObj ? stepObj.status : 'pending';
            
            return (
              <div
                key={stageName}
                style={{
                  padding: '10px 12px',
                  borderRadius: '6px',
                  border: '1px solid var(--border-color)',
                  backgroundColor: status === 'completed' ? '#f0fdf4' : status === 'running' ? '#fefce8' : 'white',
                  borderColor: status === 'completed' ? '#bbf7d0' : status === 'running' ? '#fef08a' : 'var(--border-color)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
                  <span style={{ fontSize: '12px', fontWeight: 600, textTransform: 'capitalize' }}>{stageName}</span>
                  <span style={{ fontSize: '10px' }}>
                    {status === 'completed' ? '✓' : status === 'running' ? '●' : '○'}
                  </span>
                </div>
                <div style={{ fontSize: '11px', color: 'var(--text-secondary)', textTransform: 'capitalize' }}>
                  {status}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Stats summary */}
      <div style={{ display: 'flex', gap: '24px', marginTop: '16px', paddingTop: '16px', borderTop: '1px solid var(--border-color)', fontSize: '13px' }}>
        <div>
          <span style={{ color: 'var(--text-secondary)' }}>Sources Processed: </span>
          <strong>{sources.length}</strong>
        </div>
        <div>
          <span style={{ color: 'var(--text-secondary)' }}>Artifacts Created: </span>
          <strong>{(task.artifacts || []).length}</strong>
        </div>
      </div>
    </div>
  );
};
