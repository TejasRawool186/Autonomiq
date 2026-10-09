import { Task, HealthStatus } from './types';

const API_BASE = '/api';

export const api = {
  async getHealth(): Promise<HealthStatus> {
    const res = await fetch(`${API_BASE}/health`);
    return res.json();
  },

  async listTasks(): Promise<Task[]> {
    const res = await fetch(`${API_BASE}/tasks`);
    return res.json();
  },

  async getTask(id: string): Promise<Task> {
    const res = await fetch(`${API_BASE}/tasks/${id}`);
    return res.json();
  },

  async createTask(data: {
    title: string;
    description: string;
    task_type?: string;
    model_name?: string;
    auto_approve_plan?: boolean;
  }): Promise<Task> {
    const res = await fetch(`${API_BASE}/tasks`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return res.json();
  },

  async startTask(id: string): Promise<{ status: string; message: string }> {
    const res = await fetch(`${API_BASE}/tasks/${id}/start`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ approved: true }),
    });
    return res.json();
  },

  async cancelTask(id: string): Promise<{ status: string }> {
    const res = await fetch(`${API_BASE}/tasks/${id}/cancel`, {
      method: 'POST',
    });
    return res.json();
  },

  async deleteTask(id: string): Promise<{ status: string }> {
    const res = await fetch(`${API_BASE}/tasks/${id}`, {
      method: 'DELETE',
    });
    return res.json();
  },

  async retryTask(id: string): Promise<{ status: string; message: string }> {
    const res = await fetch(`${API_BASE}/tasks/${id}/retry`, {
      method: 'POST',
    });
    return res.json();
  },

  async getTrace(id: string): Promise<any> {
    const res = await fetch(`${API_BASE}/tasks/${id}/trace`);
    return res.json();
  },

  getAudioUrl(id: string): string {
    return `${API_BASE}/tasks/${id}/audio`;
  },

  async getModels(): Promise<import('./types').ModelsResponse> {
    const res = await fetch(`${API_BASE}/models`);
    return res.json();
  },
};
