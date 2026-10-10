import React, { useEffect, useState } from 'react';
import {
  Search,
  Trash2,
  Cpu,
  Globe,
  Headphones,
  ShieldCheck,
  HardDrive,
  Activity,
  Layers,
  Sparkles,
  Inbox
} from 'lucide-react';
import { api } from './api';
import { Task, HealthStatus } from './types';
import { Navbar } from './components/Navbar';
import { AwayModeBanner } from './components/AwayModeBanner';
import { TaskMonitor } from './components/TaskMonitor';
import { AudioDigestPlayer } from './components/AudioDigestPlayer';
import { ResultsViewer } from './components/ResultsViewer';
import { NewTaskModal } from './components/NewTaskModal';

export const App: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [health, setHealth] = useState<HealthStatus | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [searchQuery, setSearchQuery] = useState('');
  const [systemStats, setSystemStats] = useState<any>(null);
  const [loadingTasks, setLoadingTasks] = useState(true);

  const fetchTasks = async (selectFirstIfNone = false) => {
    try {
      const data = await api.listTasks();
      setTasks(data);
      if (selectFirstIfNone && data.length > 0 && !selectedTask) {
        loadTaskDetails(data[0].id);
      }
    } catch (err) {
      console.error('Failed to fetch tasks', err);
    } finally {
      setLoadingTasks(false);
    }
  };

  const loadTaskDetails = async (id: string) => {
    try {
      const task = await api.getTask(id);
      setSelectedTask(task);
    } catch (err) {
      console.error('Failed to get task details', err);
    }
  };

  useEffect(() => {
    fetchTasks(true);
    api.getHealth().then(setHealth).catch(console.error);
    api.getSystem().then(setSystemStats).catch(console.error);

    // Keyboard shortcut (Ctrl+N or Ctrl+K)
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && (e.key === 'n' || e.key === 'k')) {
        e.preventDefault();
        setIsModalOpen(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);

    // Polling interval for live execution updates
    const interval = setInterval(() => {
      fetchTasks(false);
      if (selectedTask && selectedTask.status === 'running') {
        loadTaskDetails(selectedTask.id);
      }
    }, 2500);

    return () => {
      clearInterval(interval);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [selectedTask?.id, selectedTask?.status]);

  const handleStartTask = async () => {
    if (!selectedTask) return;
    await api.startTask(selectedTask.id);
    loadTaskDetails(selectedTask.id);
    fetchTasks(false);
  };

  const handleCancelTask = async () => {
    if (!selectedTask) return;
    await api.cancelTask(selectedTask.id);
    loadTaskDetails(selectedTask.id);
    fetchTasks(false);
  };

  const handleRetryTask = async () => {
    if (!selectedTask) return;
    await api.retryTask(selectedTask.id);
    loadTaskDetails(selectedTask.id);
    fetchTasks(false);
  };

  const runningTasks = tasks.filter((t) => t.status === 'running');
  const filteredTasks = tasks.filter(
    (t) =>
      t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div style={{ minHeight: '100vh', backgroundColor: 'var(--bg-app)' }}>
      <Navbar
        onNewTaskClick={() => setIsModalOpen(true)}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        runningCount={runningTasks.length}
      />

      <main className="container" style={{ paddingTop: '20px', paddingBottom: '60px' }}>
        <AwayModeBanner runningCount={runningTasks.length} />

        <div
          className="app-layout-grid"
          style={{
            display: 'grid',
            gridTemplateColumns: '320px 1fr',
            gap: '20px',
            alignItems: 'start',
          }}
        >
          {/* Left Column: Task Library & System Status */}
          <aside style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div className="card" style={{ padding: '16px' }}>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: '12px',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <h3 style={{ fontSize: '13.5px', fontWeight: 700, color: 'var(--text-main)' }}>
                    Task Library
                  </h3>
                  <span
                    style={{
                      fontSize: '11px',
                      fontWeight: 600,
                      backgroundColor: 'var(--bg-subtle)',
                      color: 'var(--text-secondary)',
                      padding: '1px 6px',
                      borderRadius: 'var(--radius-sm)',
                    }}
                  >
                    {tasks.length}
                  </span>
                </div>

                <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                  Ctrl+N
                </span>
              </div>

              {/* Task search filter */}
              <div style={{ position: 'relative', marginBottom: '12px' }}>
                <Search
                  size={14}
                  style={{
                    position: 'absolute',
                    left: '10px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: 'var(--text-muted)',
                  }}
                />
                <input
                  type="text"
                  placeholder="Filter tasks..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  style={{
                    width: '100%',
                    paddingLeft: '32px',
                    height: '34px',
                    fontSize: '12.5px',
                  }}
                />
              </div>

              {/* Task List */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', maxHeight: '540px', overflowY: 'auto' }}>
                {loadingTasks ? (
                  <div style={{ padding: '24px 0', textAlign: 'center', color: 'var(--text-muted)', fontSize: '12px' }}>
                    Loading tasks...
                  </div>
                ) : filteredTasks.length === 0 ? (
                  <div
                    style={{
                      padding: '30px 12px',
                      textAlign: 'center',
                      backgroundColor: 'var(--bg-subtle)',
                      borderRadius: 'var(--radius-md)',
                      color: 'var(--text-secondary)',
                    }}
                  >
                    <Inbox size={24} style={{ margin: '0 auto 8px', color: 'var(--text-muted)' }} />
                    <p style={{ fontSize: '12.5px', fontWeight: 500 }}>No tasks found</p>
                    <p style={{ fontSize: '11.5px', color: 'var(--text-muted)', marginTop: '2px' }}>
                      {searchQuery ? 'Try a different keyword' : 'Create your first research task'}
                    </p>
                  </div>
                ) : (
                  filteredTasks.map((t) => {
                    const isSelected = selectedTask?.id === t.id;
                    return (
                      <div
                        key={t.id}
                        onClick={() => loadTaskDetails(t.id)}
                        style={{
                          padding: '10px 12px',
                          borderRadius: 'var(--radius-md)',
                          cursor: 'pointer',
                          border: `1px solid ${isSelected ? 'var(--primary-green)' : 'var(--border-subtle)'}`,
                          backgroundColor: isSelected ? 'var(--bg-pale-green)' : 'var(--bg-card)',
                          boxShadow: isSelected ? 'var(--shadow-xs)' : 'none',
                          transition: 'all 0.15s ease',
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
                          <span className={`badge badge-${t.status}`} style={{ fontSize: '10px' }}>
                            {t.status}
                          </span>

                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                              {new Date(t.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>

                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                if (window.confirm(`Delete task "${t.title}"?`)) {
                                  api.deleteTask(t.id).then(() => {
                                    if (selectedTask?.id === t.id) setSelectedTask(null);
                                    fetchTasks(false);
                                  });
                                }
                              }}
                              style={{
                                background: 'none',
                                border: 'none',
                                cursor: 'pointer',
                                color: 'var(--text-muted)',
                                padding: '2px',
                                display: 'flex',
                                alignItems: 'center',
                              }}
                              title="Delete task"
                              aria-label={`Delete task ${t.title}`}
                            >
                              <Trash2 size={12} />
                            </button>
                          </div>
                        </div>

                        <div
                          style={{
                            fontSize: '13px',
                            fontWeight: isSelected ? 600 : 500,
                            color: 'var(--text-main)',
                            lineHeight: 1.35,
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            display: '-webkit-box',
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: 'vertical',
                          }}
                        >
                          {t.title}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {/* Verified Engine Health Widget */}
            {health && (
              <div className="card" style={{ padding: '14px', fontSize: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '10px' }}>
                  <Activity size={14} style={{ color: 'var(--primary-green)' }} />
                  <h4 style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-main)' }}>
                    Engine Status
                  </h4>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', color: 'var(--text-secondary)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Cpu size={12} /> Local LLM
                    </span>
                    <strong style={{ color: health.ollama_connected ? 'var(--status-success)' : 'var(--status-warning)' }}>
                      {health.ollama_connected ? 'Ollama Online' : 'Fallback Ready'}
                    </strong>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Globe size={12} /> Web Search
                    </span>
                    <strong style={{ color: 'var(--status-success)' }}>SerpApi Grounded</strong>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Headphones size={12} /> Voice Engine
                    </span>
                    <strong style={{ color: health.elevenlabs_enabled ? 'var(--status-success)' : 'var(--text-muted)' }}>
                      {health.elevenlabs_enabled ? 'ElevenLabs Active' : 'Standby'}
                    </strong>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Layers size={12} /> Vector RAG
                    </span>
                    <strong style={{ color: 'var(--status-success)' }}>Qdrant Embedded</strong>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <ShieldCheck size={12} /> Telemetry
                    </span>
                    <strong style={{ color: health.sentry_enabled ? 'var(--status-success)' : 'var(--text-muted)' }}>
                      {health.sentry_enabled ? 'Sentry Active' : 'Local Tracing'}
                    </strong>
                  </div>

                  {systemStats && (
                    <div
                      style={{
                        marginTop: '6px',
                        paddingTop: '8px',
                        borderTop: '1px solid var(--border-subtle)',
                        fontSize: '11px',
                        color: 'var(--text-muted)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                      }}
                    >
                      <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <HardDrive size={11} /> Storage
                      </span>
                      <span>
                        <strong>{systemStats.storage?.free_gb} GB</strong> free / {systemStats.storage?.total_gb} GB
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </aside>

          {/* Right Column: Selected Task Details */}
          <section>
            {selectedTask ? (
              <>
                <TaskMonitor
                  task={selectedTask}
                  onStartClick={handleStartTask}
                  onCancelClick={handleCancelTask}
                  onRetryClick={handleRetryTask}
                />

                {/* Show Audio Digest Player when completed or audio artifact exists */}
                {selectedTask.artifacts?.some((a) => a.file_type === 'audio_mp3') && (
                  <AudioDigestPlayer taskId={selectedTask.id} />
                )}

                <ResultsViewer task={selectedTask} />
              </>
            ) : (
              <div
                className="card"
                style={{
                  textAlign: 'center',
                  padding: '60px 24px',
                  backgroundColor: 'var(--bg-card)',
                }}
              >
                <div
                  style={{
                    width: '44px',
                    height: '44px',
                    borderRadius: 'var(--radius-lg)',
                    backgroundColor: 'var(--bg-pale-green)',
                    color: 'var(--primary-green)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 12px',
                  }}
                >
                  <Sparkles size={22} />
                </div>
                <h3 style={{ fontSize: '16px', fontWeight: 600, color: 'var(--text-main)' }}>
                  Select a Task to View Execution State
                </h3>
                <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '4px', maxWidth: '400px', margin: '4px auto 16px' }}>
                  Choose a past research project from the task library or launch a new autonomous job to run in Away Mode.
                </p>
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={() => setIsModalOpen(true)}
                >
                  Launch New Research Task
                </button>
              </div>
            )}
          </section>
        </div>
      </main>

      <NewTaskModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onTaskCreated={(t) => {
          fetchTasks(false);
          loadTaskDetails(t.id);
        }}
      />
    </div>
  );
};
