import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../api/client';
import { ColumnStatus, TaskCreatePayload, TaskUpdatePayload } from '../types';

export const TASKS_QUERY_KEY = ['tasks'];
export const CRITICAL_PATH_KEY = ['critical-path'];

export function useTasks() {
  const queryClient = useQueryClient();

  const tasksQuery = useQuery({
    queryKey: TASKS_QUERY_KEY,
    queryFn: api.getTasks,
  });

  const criticalPathQuery = useQuery({
    queryKey: CRITICAL_PATH_KEY,
    queryFn: api.getCriticalPath,
  });

  const invalidateAll = () => {
    queryClient.invalidateQueries({ queryKey: TASKS_QUERY_KEY });
    queryClient.invalidateQueries({ queryKey: CRITICAL_PATH_KEY });
  };

  const createTaskMutation = useMutation({
    mutationFn: (payload: TaskCreatePayload) => api.createTask(payload),
    onSuccess: invalidateAll,
  });

  const updateTaskMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: TaskUpdatePayload }) =>
      api.updateTask(id, payload),
    onSuccess: invalidateAll,
  });

  const moveTaskMutation = useMutation({
    mutationFn: ({ id, column }: { id: string; column: ColumnStatus }) =>
      api.moveTask(id, column),
    onSuccess: invalidateAll,
  });

  const deleteTaskMutation = useMutation({
    mutationFn: (id: string) => api.deleteTask(id),
    onSuccess: invalidateAll,
  });

  return {
    tasks: tasksQuery.data ?? [],
    isLoading: tasksQuery.isLoading,
    isError: tasksQuery.isError,
    error: tasksQuery.error,
    criticalPath: criticalPathQuery.data?.critical_path ?? [],
    projectEndDate: criticalPathQuery.data?.project_end_date ?? null,
    createTask: createTaskMutation.mutateAsync,
    updateTask: updateTaskMutation.mutateAsync,
    moveTask: (id: string, column: ColumnStatus) => moveTaskMutation.mutateAsync({ id, column }),
    deleteTask: deleteTaskMutation.mutateAsync,
    invalidate: invalidateAll,

  };
}
