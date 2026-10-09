import React, { useEffect, useState } from 'react';
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

  const fetchTasks = async () => {
    try {
      const data = await api.listTasks();
      setTasks(data);
      if (data.length > 0 && !selectedTask) {
        loadTaskDetails(data[0].id);
      }
    } catch (err) {
      console.error('Failed to fetch tasks', err);
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
    fetchTasks();
    api.getHealth().then(setHealth).catch(console.error);

    // Polling interval for live execution updates
    const interval = setInterval(() => {
      fetchTasks();
      if (selectedTask && selectedTask.status === 'running') {
        loadTaskDetails(selectedTask.id);
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [selectedTask?.id, selectedTask?.status]);

  const handleStartTask = async () => {
    if (!selectedTask) return;
    await api.startTask(selectedTask.id);
    loadTaskDetails(selectedTask.id);
  };

  const handleCancelTask = async () => {
    if (!selectedTask) return;
    await api.cancelTask(selectedTask.id);
    loadTaskDetails(selectedTask.id);
  };

  return (
    <div>
      <Navbar
        onNewTaskClick={() => setIsModalOpen(true)}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      />

      <main className="container" style={{ paddingBottom: '60px' }}>
        <AwayModeBanner />

        <div style={{ display: 'grid', gridTemplateColumns: '320px 1fr', gap: '24px' }}>
          {/* Sidebar / Task Library */}
          <div>
            <div className="card" style={{ padding: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
                <h3 style={{ fontSize: '14px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  Research Tasks
                </h3>
                <span className="badge" style={{ backgroundColor: '#e9ecef' }}>{tasks.length}</span>
              </div>

              <input
                type="text"
                placeholder="🔍 Search tasks..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  width: '100%',
                  padding: '6px 10px',
                  fontSize: '12px',
                  border: '1px solid var(--border-color)',
                  borderRadius: '4px',
                  marginBottom: '12px'
                }}
              />

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {tasks
                  .filter((t) => t.title.toLowerCase().includes(searchQuery.toLowerCase()) || t.description.toLowerCase().includes(searchQuery.toLowerCase()))
                  .map((t) => (
                  <div
                    key={t.id}
                    onClick={() => loadTaskDetails(t.id)}
                    style={{
                      padding: '12px',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      border: selectedTask?.id === t.id ? '2px solid var(--accent-green)' : '1px solid var(--border-color)',
                      backgroundColor: selectedTask?.id === t.id ? '#f7fbf8' : 'white',
                      transition: 'all 0.15s ease',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
                      <span className={`badge badge-${t.status}`} style={{ fontSize: '10px' }}>
                        {t.status}
                      </span>
                      <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>
                        {new Date(t.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)' }}>
                      {t.title}
                    </div>
                  </div>
                ))}

                {tasks.length === 0 && (
                  <p style={{ fontSize: '13px', color: 'var(--text-secondary)', textAlign: 'center', padding: '24px 0' }}>
                    No research tasks yet. Click "+ New Research Task" to get started.
                  </p>
                )}
              </div>
            </div>

            {/* System Status Widget */}
            {health && (
              <div className="card" style={{ marginTop: '16px', padding: '14px', fontSize: '12px' }}>
                <h4 style={{ fontWeight: 600, marginBottom: '8px' }}>Engine Health</h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', color: 'var(--text-secondary)' }}>
                  <div>● LLM: <strong style={{ color: health.ollama_connected ? 'var(--accent-green)' : 'var(--status-error)' }}>{health.ollama_connected ? 'Ollama Online' : 'Ollama Offline'}</strong></div>
                  <div>● Search: <strong style={{ color: 'var(--accent-green)' }}>SerpApi Live</strong></div>
                  <div>● Voice: <strong style={{ color: health.elevenlabs_enabled ? 'var(--accent-green)' : 'var(--text-secondary)' }}>{health.elevenlabs_enabled ? 'ElevenLabs Active' : 'Offline'}</strong></div>
                  <div>● Tracing: <strong style={{ color: health.sentry_enabled ? 'var(--accent-green)' : 'var(--text-secondary)' }}>{health.sentry_enabled ? 'Sentry Active' : 'Offline'}</strong></div>
                  <div>● Vector RAG: <strong style={{ color: 'var(--accent-green)' }}>{health.qdrant_status}</strong></div>
                </div>
              </div>
            )}
          </div>

          {/* Main Content Area */}
          <div>
            {selectedTask ? (
              <>
                <TaskMonitor
                  task={selectedTask}
                  onStartClick={handleStartTask}
                  onCancelClick={handleCancelTask}
                />

                {selectedTask.status === 'completed' && (
                  <AudioDigestPlayer taskId={selectedTask.id} />
                )}

                <ResultsViewer task={selectedTask} />
              </>
            ) : (
              <div className="card" style={{ textAlign: 'center', padding: '60px 20px' }}>
                <h3 style={{ fontSize: '16px', fontWeight: 600 }}>Select a Task to View Execution State</h3>
                <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '8px' }}>
                  Or launch a new autonomous research job to run in Away Mode.
                </p>
              </div>
            )}
          </div>
        </div>
      </main>

      <NewTaskModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onTaskCreated={(t) => {
          fetchTasks();
          loadTaskDetails(t.id);
        }}
      />
    </div>
  );
};
