export type ColumnStatus = 'backlog' | 'in_progress' | 'review' | 'done';
export type ComputedStatus = 'ready' | 'blocked';

export interface BlockedReason {
  id: string;
  title: string;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  column_status: ColumnStatus;
  duration_days: number;
  start_date: string; // ISO date string (YYYY-MM-DD)
  end_date: string;   // ISO date string (YYYY-MM-DD)
  computed_status: ComputedStatus;
  blocked_by: BlockedReason[];
  dependencies: string[]; // List of task IDs this task depends on
  created_at: string;
  updated_at: string;
}

export interface TaskCreatePayload {
  title: string;
  description?: string;
  duration_days?: number;
  start_date?: string;
  column_status?: ColumnStatus;
}

export interface TaskUpdatePayload {
  title?: string;
  description?: string;
  duration_days?: number;
  start_date?: string;
  column_status?: ColumnStatus;
}

export interface DependencyCreatePayload {
  task_id: string;
  depends_on_task_id: string;
}

export interface DependencyResponse {
  id: string;
  task_id: string;
  depends_on_task_id: string;
  created_at: string;
}

export interface CriticalPathResponse {
  critical_path: string[];
  project_end_date: string | null;
  slacks: Record<string, number>;
}

export interface AiSuggestion {
  task_id: string;
  task_title: string;
  confidence: number;
  rationale: string;
}

export interface AiSuggestionResponse {
  suggestions: AiSuggestion[];
}

export interface ApiError {
  error: string;
  message: string;
  detail?: unknown;
}


export interface ImpactedTaskSimulation {
  id: string;
  title: string;
  original_start_date: string;
  original_end_date: string;
  simulated_start_date: string;
  simulated_end_date: string;
  shift_days: number;
  is_critical: boolean;
  is_target: boolean;
}

export interface SimulateDelayResponse {
  target_task_id: string;
  target_task_title: string;
  delay_days: number;
  baseline_project_end: string | null;
  simulated_project_end: string | null;
  project_delay_days: number;
  critical_path: string[];
  impacted_tasks: ImpactedTaskSimulation[];
  max_precedence_rule_proven: boolean;
  explanation: string;
  applied: boolean;
}

export interface AiGeneratedTask {
  key: string;
  title: string;
  description: string;
  duration_days: number;
  depends_on_keys: string[];
}

export interface AiGenerateProjectResponse {
  project_title: string;
  summary: string;
  tasks: AiGeneratedTask[];
  is_acyclic: boolean;
  applied: boolean;
  task_count: number;
}

