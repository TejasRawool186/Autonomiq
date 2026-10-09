import React from 'react';
import { api } from '../api';

interface AudioDigestPlayerProps {
  taskId: string;
}

export const AudioDigestPlayer: React.FC<AudioDigestPlayerProps> = ({ taskId }) => {
  const audioUrl = api.getAudioUrl(taskId);

  return (
    <div className="card" style={{ backgroundColor: '#fdfbf7', borderColor: '#f3ead8', marginBottom: '24px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '20px' }}>🎧</span>
          <div>
            <h4 style={{ fontSize: '15px', fontWeight: 600 }}>ElevenLabs Audio Digest</h4>
            <p style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
              Listen to your synthesized executive summary while away from your desk.
            </p>
          </div>
        </div>
        <a
          href={audioUrl}
          download="digest.mp3"
          className="btn btn-secondary"
          style={{ fontSize: '12px', padding: '6px 12px' }}
        >
          Download MP3
        </a>
      </div>

      <audio controls style={{ width: '100%', height: '36px' }} src={audioUrl}>
        Your browser does not support the audio tag.
      </audio>
    </div>
  );
};
