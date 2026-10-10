import React, { useState, useEffect } from 'react';
import { Plus, X, Sparkles, Loader2 } from 'lucide-react';
import { api } from '../api';
import { Task, ModelInfo } from '../types';

interface NewTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onTaskCreated: (task: Task) => void;
}

export const NewTaskModal: React.FC<NewTaskModalProps> = ({
  isOpen,
  onClose,
  onTaskCreated,
}) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [model, setModel] = useState('');
  const [modelsList, setModelsList] = useState<ModelInfo[]>([]);
  const [autoApprove, setAutoApprove] = useState(true);
  const [loading, setLoading] = useState(false);
  const [modelsLoading, setModelsLoading] = useState(true);

  useEffect(() => {
    if (isOpen) {
      setModelsLoading(true);
      api
        .getModels()
        .then((res) => {
          const fallbackDefault = res?.default_model || 'gemma3:1b';
          if (res?.models && res.models.length > 0) {
            setModelsList(res.models);
            const defaultM = res.models.find((m) => m.is_default)?.name || res.models[0].name;
            setModel(defaultM);
          } else {
            setModelsList([{ id: fallbackDefault, name: fallbackDefault, is_default: true, family: 'gemma' }]);
            setModel(fallbackDefault);
          }
        })
        .catch((err) => {
          console.error('Failed to fetch live Ollama models', err);
          setModelsList([{ id: 'gemma3:1b', name: 'gemma3:1b (default)', is_default: true, family: 'gemma' }]);
          setModel('gemma3:1b');
        })
        .finally(() => {
          setModelsLoading(false);
        });
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim() || loading) return;

    setLoading(true);
    try {
      const task = await api.createTask({
        title: title.trim(),
        description: description.trim(),
        model_name: model || 'gemma3:1b',
        auto_approve_plan: autoApprove,
      });
      onTaskCreated(task);
      onClose();
      setTitle('');
      setDescription('');
    } catch (err) {
      console.error('Task creation failed', err);
      alert('Failed to launch task. Please check server logs.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(23, 35, 28, 0.45)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
        padding: '16px',
        backdropFilter: 'blur(3px)',
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className="card"
        style={{
          width: '100%',
          maxWidth: '560px',
          padding: '24px',
          boxShadow: 'var(--shadow-lg)',
          border: '1px solid var(--border-strong)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div
              style={{
                width: '28px',
                height: '28px',
                borderRadius: 'var(--radius-sm)',
                backgroundColor: 'var(--bg-pale-green)',
                color: 'var(--primary-green)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Sparkles size={16} />
            </div>
            <h2 style={{ fontSize: '17px', fontWeight: 700, color: 'var(--text-main)' }}>
              New Autonomous Research Task
            </h2>
          </div>

          <button
            type="button"
            className="btn btn-tertiary btn-sm"
            onClick={onClose}
            aria-label="Close dialog"
            style={{ padding: '4px', height: 'auto' }}
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '6px', color: 'var(--text-main)' }}>
              Task Title
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Compare Top 5 Open-Source AI Coding Models in 2026"
              style={{ width: '100%' }}
              autoFocus
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '6px', color: 'var(--text-main)' }}>
              Research Objective & Instructions
            </label>
            <textarea
              required
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe your research question. Autonomiq will search the web via SerpApi, extract live sources, index into local Qdrant, and synthesize with your Ollama model."
              style={{ width: '100%', resize: 'vertical' }}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', alignItems: 'end' }}>
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '6px', color: 'var(--text-main)' }}>
                Local Model
              </label>
              {modelsLoading ? (
                <div style={{ fontSize: '12px', color: 'var(--text-muted)', padding: '8px 0' }}>
                  Detecting Ollama models...
                </div>
              ) : (
                <select
                  value={model}
                  onChange={(e) => setModel(e.target.value)}
                  style={{ width: '100%' }}
                >
                  {modelsList.map((m) => (
                    <option key={m.id} value={m.name}>
                      {m.name} {m.size_mb ? `(${m.size_mb >= 1024 ? (m.size_mb / 1024).toFixed(1) + ' GB' : m.size_mb + ' MB'})` : ''}
                    </option>
                  ))}
                </select>
              )}
            </div>

            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                height: '38px',
                backgroundColor: 'var(--bg-subtle)',
                padding: '0 12px',
                borderRadius: 'var(--radius-md)',
              }}
            >
              <input
                type="checkbox"
                id="autoApprove"
                checked={autoApprove}
                onChange={(e) => setAutoApprove(e.target.checked)}
                style={{ cursor: 'pointer', accentColor: 'var(--primary-green)' }}
              />
              <label htmlFor="autoApprove" style={{ fontSize: '12.5px', cursor: 'pointer', userSelect: 'none', fontWeight: 500 }}>
                Auto-approve plan & run
              </label>
            </div>
          </div>

          <div
            style={{
              display: 'flex',
              justifyContent: 'flex-end',
              gap: '8px',
              marginTop: '8px',
              paddingTop: '16px',
              borderTop: '1px solid var(--border-subtle)',
            }}
          >
            <button type="button" className="btn btn-secondary" onClick={onClose} disabled={loading}>
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading || !title.trim() || !description.trim()}
              id="btn-launch-task"
            >
              {loading ? (
                <>
                  <Loader2 size={15} className="pulse-active" />
                  Launching...
                </>
              ) : (
                <>
                  <Plus size={15} />
                  Launch Task
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
