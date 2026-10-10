import React from 'react';
import { LayoutDashboard, Library, Plus, ShieldCheck } from 'lucide-react';

interface NavbarProps {
  onNewTaskClick: () => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  runningCount?: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  onNewTaskClick,
  activeTab,
  setActiveTab,
  runningCount = 0,
}) => {
  return (
    <header
      style={{
        backgroundColor: 'var(--bg-card)',
        borderBottom: '1px solid var(--border-subtle)',
        position: 'sticky',
        top: 0,
        zIndex: 100,
        backdropFilter: 'blur(8px)',
      }}
    >
      <div
        className="container"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          height: '64px',
        }}
      >
        {/* Brand identity */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div
            style={{
              width: '34px',
              height: '34px',
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'var(--primary-green)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#FFFFFF',
              fontWeight: 700,
              fontSize: '18px',
              boxShadow: 'var(--shadow-xs)',
            }}
          >
            A
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <h1 style={{ fontSize: '17px', fontWeight: 700, letterSpacing: '-0.02em' }}>
                Autonomiq
              </h1>
              <span
                style={{
                  fontSize: '10px',
                  fontWeight: 600,
                  backgroundColor: 'var(--bg-pale-green)',
                  color: 'var(--primary-green)',
                  padding: '2px 6px',
                  borderRadius: 'var(--radius-sm)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '3px',
                }}
              >
                <ShieldCheck size={11} /> Local-First
              </span>
            </div>
            <p style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>
              Autonomous Research & Analysis Workspace
            </p>
          </div>
        </div>

        {/* Navigation & Actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <nav style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <button
              type="button"
              className={`btn btn-sm ${activeTab === 'dashboard' ? 'btn-secondary' : 'btn-tertiary'}`}
              onClick={() => setActiveTab('dashboard')}
              style={{
                color: activeTab === 'dashboard' ? 'var(--primary-green)' : 'var(--text-secondary)',
                fontWeight: activeTab === 'dashboard' ? 600 : 500,
                borderColor: activeTab === 'dashboard' ? 'var(--border-strong)' : 'transparent',
              }}
            >
              <LayoutDashboard size={15} />
              Dashboard
            </button>

            <button
              type="button"
              className={`btn btn-sm ${activeTab === 'library' ? 'btn-secondary' : 'btn-tertiary'}`}
              onClick={() => setActiveTab('library')}
              style={{
                color: activeTab === 'library' ? 'var(--primary-green)' : 'var(--text-secondary)',
                fontWeight: activeTab === 'library' ? 600 : 500,
                borderColor: activeTab === 'library' ? 'var(--border-strong)' : 'transparent',
              }}
            >
              <Library size={15} />
              Task Library
              {runningCount > 0 && (
                <span
                  style={{
                    backgroundColor: 'var(--primary-green)',
                    color: '#FFFFFF',
                    fontSize: '10px',
                    borderRadius: '10px',
                    padding: '0 5px',
                    height: '16px',
                    display: 'inline-flex',
                    alignItems: 'center',
                  }}
                >
                  {runningCount}
                </span>
              )}
            </button>
          </nav>

          <button
            type="button"
            className="btn btn-primary"
            onClick={onNewTaskClick}
            id="btn-new-task"
          >
            <Plus size={16} strokeWidth={2.2} />
            New Research Task
          </button>
        </div>
      </div>
    </header>
  );
};
