import React from 'react';
import { Leaf, CheckCircle2, Loader2 } from 'lucide-react';

interface AwayModeBannerProps {
  runningCount?: number;
}

export const AwayModeBanner: React.FC<AwayModeBannerProps> = ({ runningCount = 0 }) => {
  const isRunning = runningCount > 0;

  return (
    <section
      aria-label="Away Mode Status"
      style={{
        backgroundColor: isRunning ? 'var(--bg-pale-green)' : '#FBFDFB',
        border: `1px solid ${isRunning ? '#C3E5CE' : 'var(--border-subtle)'}`,
        borderRadius: 'var(--radius-lg)',
        padding: '12px 18px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '20px',
        boxShadow: 'var(--shadow-xs)',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
        <div
          style={{
            width: '32px',
            height: '32px',
            borderRadius: 'var(--radius-md)',
            backgroundColor: isRunning ? 'var(--primary-green)' : 'var(--bg-subtle)',
            color: isRunning ? '#FFFFFF' : 'var(--text-secondary)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          <Leaf size={18} />
        </div>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <h3 style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-main)' }}>
              {isRunning ? 'Away Mode Active' : 'Away Mode Ready'}
            </h3>
            <span
              style={{
                fontSize: '11px',
                fontWeight: 600,
                color: isRunning ? 'var(--primary-green)' : 'var(--text-secondary)',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
              }}
            >
              {isRunning ? (
                <>
                  <Loader2 size={12} className="pulse-active" />
                  {runningCount} {runningCount === 1 ? 'task running' : 'tasks running'}
                </>
              ) : (
                <>
                  <CheckCircle2 size={12} />
                  Background worker standby
                </>
              )}
            </span>
          </div>
          <p style={{ fontSize: '12.5px', color: 'var(--text-secondary)', marginTop: '2px' }}>
            {isRunning
              ? 'Your research pipeline runs independently in the background. You can safely close your browser tab or step away.'
              : 'Tasks execute durably in the background. Submit a research task, approve the plan, and return anytime to finished reports.'}
          </p>
        </div>
      </div>

      <div
        style={{
          fontSize: '11px',
          fontWeight: 600,
          color: isRunning ? 'var(--primary-green)' : 'var(--text-secondary)',
          backgroundColor: isRunning ? '#FFFFFF' : 'transparent',
          border: `1px solid ${isRunning ? '#C3E5CE' : 'transparent'}`,
          padding: '4px 10px',
          borderRadius: 'var(--radius-sm)',
          whiteSpace: 'nowrap',
          letterSpacing: '0.02em',
        }}
      >
        {isRunning ? 'AUTONOMOUS RUNTIME' : 'LOCAL-FIRST'}
      </div>
    </section>
  );
};
