import React from 'react';

interface NavbarProps {
  onNewTaskClick: () => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onNewTaskClick, activeTab, setActiveTab }) => {
  return (
    <header style={{
      backgroundColor: 'white',
      borderBottom: '1px solid var(--border-color)',
      padding: '16px 0',
      marginBottom: '24px'
    }}>
      <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            width: '32px',
            height: '32px',
            borderRadius: '6px',
            backgroundColor: 'var(--accent-green)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            fontWeight: 'bold',
            fontSize: '18px'
          }}>
            A
          </div>
          <div>
            <h1 style={{ fontSize: '18px', fontWeight: 700, letterSpacing: '-0.5px' }}>Autonomiq</h1>
            <p style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Local-First Autonomous AI Workspace</p>
          </div>
        </div>

        <nav style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button
            className={`btn ${activeTab === 'dashboard' ? 'btn-secondary' : ''}`}
            onClick={() => setActiveTab('dashboard')}
            style={{ border: activeTab === 'dashboard' ? '1px solid var(--accent-green)' : 'none' }}
          >
            Dashboard
          </button>
          <button
            className={`btn ${activeTab === 'library' ? 'btn-secondary' : ''}`}
            onClick={() => setActiveTab('library')}
            style={{ border: activeTab === 'library' ? '1px solid var(--accent-green)' : 'none' }}
          >
            Task Library
          </button>
          <button className="btn btn-primary" onClick={onNewTaskClick}>
            + New Research Task
          </button>
        </nav>
      </div>
    </header>
  );
};
