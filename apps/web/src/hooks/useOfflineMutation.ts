import { useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { useNetworkStore } from '../stores/network.store';
import * as syncQueue from '../lib/offline/sync-queue';

interface OfflineMutationOptions<TData, TVariables> {
  mutationFn: (vars: TVariables) => Promise<TData>;
  entityType: string;
  getEndpoint: (vars: TVariables) => string;
  getMethod: (vars: TVariables) => 'POST' | 'PATCH' | 'PUT' | 'DELETE';
  getEntityId: (vars: TVariables) => string;
  getPayload: (vars: TVariables) => Record<string, unknown> | null;
  /** Query keys to invalidate after sync queue enqueue (for optimistic updates) */
  invalidateKeys?: unknown[][];
  onSuccess?: (data: TData, vars: TVariables) => void;
}

export function useOfflineMutation<TData = unknown, TVariables = unknown>(
  options: OfflineMutationOptions<TData, TVariables>,
) {
  const queryClient = useQueryClient();
  const { isOnline } = useNetworkStore();

  return useMutation<TData, unknown, TVariables>({
    mutationFn: async (vars: TVariables) => {
      if (isOnline) {
        return options.mutationFn(vars);
      }

      // Offline: enqueue the mutation
      await syncQueue.enqueue({
        entityType: options.entityType,
        entityId: options.getEntityId(vars),
        operation: options.getMethod(vars) === 'POST' ? 'create'
          : options.getMethod(vars) === 'DELETE' ? 'delete'
          : 'update',
        endpoint: options.getEndpoint(vars),
        method: options.getMethod(vars),
        payload: options.getPayload(vars),
        createdAt: Date.now(),
      });

      // Update pending count
      const count = await syncQueue.getPendingCount();
      useNetworkStore.getState().setPendingSyncCount(count);

      toast('Saved offline — will sync when connected', { icon: '📡' });

      // Return a synthetic response so the caller proceeds normally
      return {} as TData;
    },
    onSuccess: (data, vars) => {
      // Invalidate specified keys
      if (options.invalidateKeys) {
        for (const key of options.invalidateKeys) {
          queryClient.invalidateQueries({ queryKey: key });
        }
      }
      options.onSuccess?.(data, vars);
    },
  });
}
