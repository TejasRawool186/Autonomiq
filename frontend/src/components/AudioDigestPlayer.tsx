import React, { useRef, useState } from 'react';
import { api } from '../api';

interface AudioDigestPlayerProps {
  taskId: string;
}

export const AudioDigestPlayer: React.FC<AudioDigestPlayerProps> = ({ taskId }) => {
  const audioUrl = api.getAudioUrl(taskId);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1.0);

  const changeSpeed = (speed: number) => {
    setPlaybackSpeed(speed);
    if (audioRef.current) {
      audioRef.current.playbackRate = speed;
    }
  };

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
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{ display: 'flex', gap: '4px', backgroundColor: 'white', padding: '2px 4px', borderRadius: '4px', border: '1px solid var(--border-color)' }}>
            {[1.0, 1.25, 1.5, 2.0].map((rate) => (
              <button
                key={rate}
                type="button"
                onClick={() => changeSpeed(rate)}
                style={{
                  border: 'none',
                  background: playbackSpeed === rate ? 'var(--accent-green)' : 'transparent',
                  color: playbackSpeed === rate ? 'white' : 'var(--text-secondary)',
                  padding: '2px 6px',
                  borderRadius: '3px',
                  fontSize: '11px',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                {rate}x
              </button>
            ))}
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
      </div>

      <audio ref={audioRef} controls style={{ width: '100%', height: '36px' }} src={audioUrl}>
        Your browser does not support the audio tag.
      </audio>
    </div>
  );
};
