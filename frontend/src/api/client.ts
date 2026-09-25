import {
  Task,
  TaskCreatePayload,
  TaskUpdatePayload,
  ColumnStatus,
  DependencyResponse,
  CriticalPathResponse,
  AiSuggestionResponse,
  ApiError,
} from '../types';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/v1';

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const url = `${API_BASE}${path}`;
  const response = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
    ...options,
  });

  if (!response.ok) {
    let errorData: ApiError;
    try {
      errorData = await response.json();
    } catch {
      errorData = {
        error: 'network_error',
        message: `HTTP error ${response.status}: ${response.statusText}`,
      };
    }
    throw errorData;
  }

  return response.json();
}

export const api = {
  getTasks: (): Promise<Task[]> => request<Task[]>('/tasks'),

  createTask: (payload: TaskCreatePayload): Promise<Task> =>
    request<Task>('/tasks', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  updateTask: (id: string, payload: TaskUpdatePayload): Promise<Task> =>
    request<Task>(`/tasks/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
    }),

  moveTask: (id: string, column_status: ColumnStatus): Promise<Task> =>
    request<Task>(`/tasks/${id}/move`, {
      method: 'PATCH',
      body: JSON.stringify({ column_status }),
    }),

  deleteTask: (id: string): Promise<{ ok: boolean }> =>
    request<{ ok: boolean }>(`/tasks/${id}`, {
      method: 'DELETE',
    }),

  addDependency: (task_id: string, depends_on_task_id: string): Promise<DependencyResponse> =>
    request<DependencyResponse>('/dependencies', {
      method: 'POST',
      body: JSON.stringify({ task_id, depends_on_task_id }),
    }),

  deleteDependency: (id: string): Promise<{ ok: boolean }> =>
    request<{ ok: boolean }>(`/dependencies/${id}`, {
      method: 'DELETE',
    }),

  getCriticalPath: (): Promise<CriticalPathResponse> =>
    request<CriticalPathResponse>('/critical-path'),

  suggestDependencies: (id: string): Promise<AiSuggestionResponse> =>
    request<AiSuggestionResponse>(`/tasks/${id}/suggest-dependencies`, {
      method: 'POST',
    }),

  seedDemo: (): Promise<{ ok: boolean; count: number }> =>
    request<{ ok: boolean; count: number }>('/tasks/seed', {
      method: 'POST',
    }),

  getTemplates: (): Promise<{ id: string; name: string; description: string; task_count: number }[]> =>
    request<{ id: string; name: string; description: string; task_count: number }[]>('/tasks/templates'),

  loadTemplate: (template_id: string): Promise<{ ok: boolean; template_id: string; count: number }> =>
    request<{ ok: boolean; template_id: string; count: number }>('/tasks/templates/load', {
      method: 'POST',
      body: JSON.stringify({ template_id }),
    }),
};

