import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../api/client';
import { TASKS_QUERY_KEY, CRITICAL_PATH_KEY } from './useTasks';

export function useDependencies() {
  const queryClient = useQueryClient();

  const addDependencyMutation = useMutation({
    mutationFn: ({ taskId, dependsOnTaskId }: { taskId: string; dependsOnTaskId: string }) =>
      api.addDependency(taskId, dependsOnTaskId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: TASKS_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: CRITICAL_PATH_KEY });
    },
  });

  const removeDependencyMutation = useMutation({
    mutationFn: (dependencyId: string) => api.deleteDependency(dependencyId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: TASKS_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: CRITICAL_PATH_KEY });
    },
  });

  return {
    addDependency: addDependencyMutation.mutateAsync,
    removeDependency: removeDependencyMutation.mutateAsync,
    isAdding: addDependencyMutation.isPending,
  };
}
