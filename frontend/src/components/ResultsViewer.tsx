import React, { useState } from 'react';
import {
  Globe,
  ExternalLink,
  ChevronDown,
  ChevronRight,
  FileDown,
  Download,
  Copy,
  Check,
  Headphones,
  FileText,
  Loader2
} from 'lucide-react';
import { Task, Source, Artifact } from '../types';
import { api } from '../api';
import { generateResearchReportPDF } from '../utils/pdfGenerator';

interface ResultsViewerProps {
  task: Task;
}

export const ResultsViewer: React.FC<ResultsViewerProps> = ({ task }) => {
  const [copied, setCopied] = useState(false);
  const [pdfGenerating, setPdfGenerating] = useState(false);
  const [expandedSources, setExpandedSources] = useState<Record<string, boolean>>({});

  const sources = task.sources || [];
  const artifacts = task.artifacts || [];

  const toggleSource = (id: string) => {
    setExpandedSources((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleCopySummary = () => {
    const textToCopy = `Autonomiq Research Report: ${task.title}\nObjective: ${task.description}\nStatus: ${task.status}\nModel: ${task.model_name}\nSources: ${sources.length} sources processed.`;
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const exportJSON = () => {
    const exportData = {
      task_id: task.id,
      title: task.title,
      description: task.description,
      model_name: task.model_name,
      status: task.status,
      created_at: task.created_at,
      sources: sources,
      artifacts: artifacts,
      steps: task.steps,
    };
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(exportData, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `autonomiq_research_${task.id.slice(0, 8)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handleExportPDF = async () => {
    setPdfGenerating(true);
    try {
      await generateResearchReportPDF(task);
    } catch (err) {
      console.error('Failed to generate research PDF:', err);
      alert('Could not export PDF. Please check report data and try again.');
    } finally {
      setPdfGenerating(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Evidence & Sources Section */}
      <section className="card">
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '14px',
            flexWrap: 'wrap',
            gap: '8px',
          }}
        >
          <div>
            <h3 style={{ fontSize: '15px', fontWeight: 600, color: 'var(--text-main)' }}>
              Grounding Sources & Attributions
            </h3>
            <p style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
              {sources.length} verified web sources indexed for local RAG synthesis
            </p>
          </div>

          <button
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={exportJSON}
            title="Download full sources and citations JSON"
          >
            <FileDown size={14} />
            Export JSON
          </button>
        </div>

        {sources.length === 0 ? (
          <div
            style={{
              padding: '24px 16px',
              textAlign: 'center',
              backgroundColor: 'var(--bg-subtle)',
              borderRadius: 'var(--radius-md)',
              color: 'var(--text-secondary)',
              fontSize: '13px',
            }}
          >
            {task.status === 'running'
              ? 'Searching web sources in background via SerpApi...'
              : 'No external sources recorded for this task.'}
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {sources.map((src: Source, idx: number) => {
              let domain = '';
              try {
                if (src.url) domain = new URL(src.url).hostname.replace('www.', '');
              } catch (_) {}

              const isExpanded = !!expandedSources[src.id];
              const snippet = src.snippet || 'No excerpt available.';
              const isLong = snippet.length > 180;

              return (
                <div
                  key={src.id}
                  style={{
                    padding: '12px 14px',
                    borderRadius: 'var(--radius-md)',
                    backgroundColor: 'var(--bg-card)',
                    border: '1px solid var(--border-subtle)',
                    transition: 'border-color 0.15s ease',
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: '8px',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1, minWidth: 0 }}>
                      <span
                        style={{
                          fontSize: '11px',
                          fontWeight: 600,
                          color: 'var(--text-muted)',
                          width: '18px',
                        }}
                      >
                        {idx + 1}.
                      </span>
                      <span
                        style={{
                          fontSize: '13.5px',
                          fontWeight: 600,
                          color: 'var(--text-main)',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {src.title || src.url || 'Untitled Evidence'}
                      </span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
                      {domain && (
                        <span
                          style={{
                            fontSize: '11.5px',
                            color: 'var(--text-secondary)',
                            backgroundColor: 'var(--bg-subtle)',
                            padding: '2px 6px',
                            borderRadius: 'var(--radius-sm)',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px',
                          }}
                        >
                          <Globe size={11} />
                          {domain}
                        </span>
                      )}

                      {src.url && (
                        <a
                          href={src.url}
                          target="_blank"
                          rel="noreferrer"
                          title="Open external source link"
                          style={{
                            color: 'var(--primary-green)',
                            display: 'inline-flex',
                            alignItems: 'center',
                            padding: '4px',
                          }}
                        >
                          <ExternalLink size={14} />
                        </a>
                      )}
                    </div>
                  </div>

                  {/* Excerpt with Expand/Collapse */}
                  <div style={{ marginTop: '6px', paddingLeft: '26px' }}>
                    <p
                      style={{
                        fontSize: '12.5px',
                        color: 'var(--text-secondary)',
                        lineHeight: 1.45,
                      }}
                    >
                      {isExpanded || !isLong ? snippet : `${snippet.slice(0, 180)}...`}
                    </p>

                    {isLong && (
                      <button
                        type="button"
                        onClick={() => toggleSource(src.id)}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: 'var(--primary-green)',
                          fontSize: '11.5px',
                          fontWeight: 600,
                          cursor: 'pointer',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '2px',
                          marginTop: '4px',
                          padding: 0,
                        }}
                      >
                        {isExpanded ? (
                          <>
                            <ChevronDown size={13} /> Show less
                          </>
                        ) : (
                          <>
                            <ChevronRight size={13} /> Show more excerpt
                          </>
                        )}
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Generated Artifacts Section with Real PDF Export */}
      <section className="card">
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '14px',
            flexWrap: 'wrap',
            gap: '8px',
          }}
        >
          <div>
            <h3 style={{ fontSize: '15px', fontWeight: 600, color: 'var(--text-main)' }}>
              Generated Artifacts & Publications
            </h3>
            <p style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
              Downloadable research reports, audio digests, and verified deliverables
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={handleCopySummary}
              title="Copy executive summary to clipboard"
            >
              {copied ? <Check size={14} /> : <Copy size={14} />}
              {copied ? 'Copied' : 'Copy Summary'}
            </button>

            {/* Publication PDF Download Button */}
            <button
              type="button"
              className="btn btn-primary btn-sm"
              onClick={handleExportPDF}
              disabled={pdfGenerating || task.status === 'running' || task.status === 'planned'}
              title="Export formatted research publication PDF"
              id="btn-export-pdf"
            >
              {pdfGenerating ? (
                <>
                  <Loader2 size={14} className="pulse-active" />
                  Generating PDF...
                </>
              ) : (
                <>
                  <FileDown size={14} />
                  Download PDF
                </>
              )}
            </button>
          </div>
        </div>

        {artifacts.length === 0 ? (
          <div
            style={{
              padding: '24px 16px',
              textAlign: 'center',
              backgroundColor: 'var(--bg-subtle)',
              borderRadius: 'var(--radius-md)',
              color: 'var(--text-secondary)',
              fontSize: '13px',
            }}
          >
            {task.status === 'running'
              ? 'Synthesizing report & generating audio in background...'
              : 'No artifacts produced yet.'}
          </div>
        ) : (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
              gap: '10px',
            }}
          >
            {artifacts.map((art: Artifact) => {
              const isAudio = art.file_type === 'audio_mp3';
              const downloadUrl = isAudio 
                ? api.getAudioUrl(task.id) 
                : api.getArtifactDownloadUrl(task.id, art.id);

              return (
                <div
                  key={art.id}
                  style={{
                    padding: '12px 14px',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: 'var(--radius-md)',
                    backgroundColor: 'var(--bg-card)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '12px',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0 }}>
                    <div
                      style={{
                        width: '32px',
                        height: '32px',
                        borderRadius: 'var(--radius-sm)',
                        backgroundColor: isAudio ? '#FEF3C7' : 'var(--bg-pale-green)',
                        color: isAudio ? '#B45309' : 'var(--primary-green)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                      }}
                    >
                      {isAudio ? <Headphones size={16} /> : <FileText size={16} />}
                    </div>

                    <div style={{ minWidth: 0 }}>
                      <div
                        style={{
                          fontSize: '13px',
                          fontWeight: 600,
                          color: 'var(--text-main)',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {art.file_name}
                      </div>
                      <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                        {(art.size_bytes / 1024).toFixed(1)} KB • {art.file_type}
                      </div>
                    </div>
                  </div>

                  <a
                    href={downloadUrl}
                    download={art.file_name}
                    className="btn btn-secondary btn-sm"
                    style={{ padding: '0 8px', height: '28px' }}
                    title={`Download ${art.file_name}`}
                  >
                    <Download size={13} />
                  </a>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
};
