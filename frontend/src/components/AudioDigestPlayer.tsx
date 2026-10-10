import React, { useRef, useState } from 'react';
import { Headphones, Download, Volume2 } from 'lucide-react';
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
    <section
      className="card"
      style={{
        backgroundColor: '#FCFAF6',
        borderColor: '#EFE6D7',
        marginBottom: '20px',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '12px',
          flexWrap: 'wrap',
          gap: '12px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div
            style={{
              width: '32px',
              height: '32px',
              borderRadius: 'var(--radius-sm)',
              backgroundColor: '#FDE68A',
              color: '#92400E',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <Headphones size={17} />
          </div>
          <div>
            <h3 style={{ fontSize: '14.5px', fontWeight: 600, color: 'var(--text-main)' }}>
              ElevenLabs Voice Audio Digest
            </h3>
            <p style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
              Voice-synthesized executive digest for listening while away from your desk.
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {/* Speed selector */}
          <div
            style={{
              display: 'flex',
              gap: '2px',
              backgroundColor: 'var(--bg-card)',
              padding: '2px',
              borderRadius: 'var(--radius-sm)',
              border: '1px solid var(--border-subtle)',
            }}
          >
            {[1.0, 1.25, 1.5, 2.0].map((rate) => (
              <button
                key={rate}
                type="button"
                onClick={() => changeSpeed(rate)}
                style={{
                  border: 'none',
                  background: playbackSpeed === rate ? 'var(--primary-green)' : 'transparent',
                  color: playbackSpeed === rate ? '#FFFFFF' : 'var(--text-secondary)',
                  padding: '3px 7px',
                  borderRadius: '3px',
                  fontSize: '11px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'all 0.1s ease',
                }}
              >
                {rate}x
              </button>
            ))}
          </div>

          <a
            href={audioUrl}
            download="digest.mp3"
            className="btn btn-secondary btn-sm"
            title="Download synthesized MP3 audio"
          >
            <Download size={13} />
            Download MP3
          </a>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <Volume2 size={16} style={{ color: 'var(--text-muted)' }} />
        <audio
          ref={audioRef}
          controls
          style={{ width: '100%', height: '36px', outline: 'none' }}
          src={audioUrl}
        >
          Your browser does not support the audio player.
        </audio>
      </div>
    </section>
  );
};
