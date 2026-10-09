import React, { useState } from 'react';
import { Task } from '../types';

interface ResultsViewerProps {
  task: Task;
}

export const ResultsViewer: React.FC<ResultsViewerProps> = ({ task }) => {
  const [copied, setCopied] = useState(false);
  const sources = task.sources || [];
  const artifacts = task.artifacts || [];

  const handleCopyReport = () => {
    const reportArtifact = artifacts.find((a) => a.file_type === 'report_markdown');
    if (task.description) {
      navigator.clipboard.writeText(`# ${task.title}\n\n${task.description}`);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const exportJSON = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(task, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `task_${task.id}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Evidence & Sources Section */}
      <div className="card">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
          <h4 style={{ fontSize: '15px', fontWeight: 600 }}>
            Grounding Sources & Attributions ({sources.length})
          </h4>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={exportJSON}
            style={{ fontSize: '12px', padding: '4px 10px' }}
          >
            Export JSON
          </button>
        </div>

        {sources.length === 0 ? (
          <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>No sources recorded yet.</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {sources.map((src, idx) => {
              let domain = '';
              try {
                if (src.url) domain = new URL(src.url).hostname.replace('www.', '');
              } catch (_) {}

              return (
                <div
                  key={src.id}
                  style={{
                    padding: '10px 14px',
                    borderRadius: '6px',
                    backgroundColor: '#f8f9fa',
                    border: '1px solid var(--border-color)',
                    fontSize: '13px'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <a
                      href={src.url || '#'}
                      target="_blank"
                      rel="noreferrer"
                      style={{ fontWeight: 600, color: 'var(--accent-green)', textDecoration: 'none' }}
                    >
                      {idx + 1}. {src.title || src.url || 'Untitled Source'}
                    </a>
                    <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                      {domain && (
                        <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                          🌐 {domain}
                        </span>
                      )}
                      <span className="badge" style={{ backgroundColor: '#e9ecef', fontSize: '10px' }}>
                        {src.source_type}
                      </span>
                    </div>
                  </div>
                  {src.snippet && (
                    <p style={{ color: 'var(--text-secondary)', marginTop: '4px', fontSize: '12px' }}>
                      {src.snippet}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Artifacts Download Section */}
      <div className="card">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
          <h4 style={{ fontSize: '15px', fontWeight: 600 }}>Generated Artifacts</h4>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={handleCopyReport}
            style={{ fontSize: '12px', padding: '4px 10px' }}
          >
            {copied ? '✓ Copied!' : '📋 Copy Summary'}
          </button>
        </div>

        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          {artifacts.map((art) => (
            <div
              key={art.id}
              style={{
                padding: '12px 16px',
                border: '1px solid var(--border-color)',
                borderRadius: '6px',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                backgroundColor: 'white'
              }}
            >
              <span style={{ fontSize: '20px' }}>
                {art.file_type === 'audio_mp3' ? '🎵' : '📄'}
              </span>
              <div>
                <div style={{ fontSize: '13px', fontWeight: 600 }}>{art.file_name}</div>
                <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>
                  {(art.size_bytes / 1024).toFixed(1)} KB
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
