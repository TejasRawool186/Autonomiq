import React, { useState, useEffect } from 'react';
import { api } from '../api';
import { Task, ModelInfo } from '../types';

interface NewTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onTaskCreated: (task: Task) => void;
}

export const NewTaskModal: React.FC<NewTaskModalProps> = ({ isOpen, onClose, onTaskCreated }) => {
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
      api.getModels()
        .then((res) => {
          if (res?.models && res.models.length > 0) {
            setModelsList(res.models);
            const defaultM = res.models.find((m) => m.is_default)?.name || res.models[0].name;
            setModel(defaultM);
          } else {
            setModelsList([]);
          }
        })
        .catch((err) => {
          console.error("Failed to fetch live Ollama models", err);
          setModelsList([]);
        })
        .finally(() => {
          setModelsLoading(false);
        });
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !description || !model) return;

    setLoading(true);
    try {
      const task = await api.createTask({
        title,
        description,
        model_name: model,
        auto_approve_plan: autoApprove,
      });
      onTaskCreated(task);
      onClose();
      setTitle('');
      setDescription('');
    } catch (err) {
      alert('Failed to create research task');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.4)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      padding: '16px'
    }}>
      <div className="card" style={{ width: '100%', maxWidth: '580px', padding: '24px' }}>
        <h2 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '16px' }}>New Autonomous Research Task</h2>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '6px' }}>
              Task Title
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Compare 10 open-weight AI models for local inference"
              style={{
                width: '100%',
                padding: '10px 12px',
                border: '1px solid var(--border-color)',
                borderRadius: '6px',
                fontSize: '14px'
              }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '6px' }}>
              Research Objective & Instructions
            </label>
            <textarea
              required
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe your research question. Autonomiq will search the web via SerpApi, extract live sources, index into local Qdrant, and synthesize with your Ollama model."
              style={{
                width: '100%',
                padding: '10px 12px',
                border: '1px solid var(--border-color)',
                borderRadius: '6px',
                fontSize: '14px',
                resize: 'vertical'
              }}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '6px' }}>
                Local Model ({modelsList.length} detected)
              </label>
              {modelsLoading ? (
                <div style={{ fontSize: '12px', color: 'var(--text-secondary)', padding: '8px 0' }}>Detecting Ollama models...</div>
              ) : modelsList.length === 0 ? (
                <div style={{ fontSize: '12px', color: 'var(--status-error)', padding: '8px 0' }}>No models found in Ollama.</div>
              ) : (
                <select
                  value={model}
                  onChange={(e) => setModel(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    border: '1px solid var(--border-color)',
                    borderRadius: '6px',
                    fontSize: '14px'
                  }}
                >
                  {modelsList.map((m) => (
                    <option key={m.id} value={m.name}>
                      {m.name} {m.size_mb ? `(${m.size_mb >= 1024 ? (m.size_mb / 1024).toFixed(1) + ' GB' : m.size_mb + ' MB'})` : ''} {m.name.includes('gemma') ? '⭐ Recommended' : ''}
                    </option>
                  ))}
                </select>
              )}
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', paddingTop: '24px' }}>
              <input
                type="checkbox"
                id="autoApprove"
                checked={autoApprove}
                onChange={(e) => setAutoApprove(e.target.checked)}
              />
              <label htmlFor="autoApprove" style={{ fontSize: '13px', cursor: 'pointer' }}>
                Auto-approve plan & run
              </label>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '12px' }}>
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={loading || modelsList.length === 0}>
              {loading ? 'Creating...' : 'Launch Task'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
