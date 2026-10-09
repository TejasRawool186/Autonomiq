import React from 'react';

export const AwayModeBanner: React.FC = () => {
  return (
    <div style={{
      backgroundColor: '#e8f5e9',
      border: '1px solid #c8e6c9',
      borderRadius: 'var(--radius)',
      padding: '16px 20px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: '24px'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <div style={{ fontSize: '24px' }}>🌿</div>
        <div>
          <h4 style={{ fontSize: '15px', fontWeight: 600, color: '#1b4332' }}>Away Mode Active</h4>
          <p style={{ fontSize: '13px', color: '#2d6a4f' }}>
            Autonomiq runs independently in the background. You can safely close your browser or leave your desk.
            Return anytime to review completed reports and listen to your audio digest.
          </p>
        </div>
      </div>
      <div style={{
        fontSize: '11px',
        fontWeight: 600,
        backgroundColor: '#2d6a4f',
        color: 'white',
        padding: '6px 12px',
        borderRadius: '20px',
        letterSpacing: '0.5px'
      }}>
        TOUCH GRASS
      </div>
    </div>
  );
};
