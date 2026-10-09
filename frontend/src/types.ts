export interface Task {
  id: string;
  title: string;
  description: string;
  task_type: string;
  status: 'created' | 'planned' | 'running' | 'completed' | 'failed' | 'cancelled';
  model_name: string;
  plan_approved: boolean;
  created_at: string;
  updated_at: string;
  plan_json?: string;
  error_summary?: string;
  steps?: Step[];
  sources?: Source[];
  artifacts?: Artifact[];
}

export interface Step {
  id: string;
  task_id: string;
  name: string;
  status: 'pending' | 'running' | 'completed' | 'failed' | 'skipped';
  attempt_count: number;
  output_data?: string;
  error_info?: string;
  started_at?: string;
  completed_at?: string;
  created_at: string;
}

export interface Source {
  id: string;
  task_id: string;
  url?: string;
  title?: string;
  source_type: string;
  extraction_status: string;
  snippet?: string;
  created_at: string;
}

export interface Artifact {
  id: string;
  task_id: string;
  file_name: string;
  file_type: string;
  file_path: string;
  size_bytes: number;
  checksum?: string;
  created_at: string;
}

export interface HealthStatus {
  status: string;
  app: string;
  environment: string;
  ollama_connected: boolean;
  qdrant_status: string;
  temporal_status: string;
  sentry_enabled: boolean;
  elevenlabs_enabled: boolean;
}

export interface ModelInfo {
  id: string;
  name: string;
  size_mb?: number | null;
  is_default: boolean;
  family: string;
}

export interface ModelsResponse {
  default_model: string;
  models: ModelInfo[];
}

