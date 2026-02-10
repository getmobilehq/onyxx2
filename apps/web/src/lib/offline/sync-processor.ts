import apiClient from '../api-client';
import { queryClient } from '../query-client';
import { useNetworkStore } from '../../stores/network.store';
import * as syncQueue from './sync-queue';

let isSyncing = false;

export async function processSyncQueue(): Promise<{ succeeded: number; failed: number }> {
  if (isSyncing) return { succeeded: 0, failed: 0 };
  isSyncing = true;

  let succeeded = 0;
  let failed = 0;

  try {
    const pending = await syncQueue.getPending();

    for (const item of pending) {
      if (!navigator.onLine) break; // Stop if went offline mid-batch

      try {
        await syncQueue.markProcessing(item.id!);

        const method = item.method.toLowerCase() as 'post' | 'patch' | 'put' | 'delete';
        if (method === 'delete') {
          await apiClient.delete(item.endpoint);
        } else {
          await apiClient[method](item.endpoint, item.payload);
        }

        await syncQueue.markCompleted(item.id!);
        succeeded++;
      } catch (err: any) {
        // Network error — stop processing
        if (!err.status && !navigator.onLine) {
          await syncQueue.markFailed(item.id!, 'Network unavailable');
          break;
        }

        const errorMsg = err.message || err.data?.error || 'Unknown error';
        await syncQueue.markFailed(item.id!, errorMsg);
        failed++;
      }
    }

    // Invalidate all queries to refresh data after sync
    if (succeeded > 0) {
      queryClient.invalidateQueries();
    }

    // Clean up completed items
    await syncQueue.clearCompleted();
  } finally {
    isSyncing = false;
    // Update pending count in store
    const count = await syncQueue.getPendingCount();
    useNetworkStore.getState().setPendingSyncCount(count);
  }

  return { succeeded, failed };
}

export function startSyncWatcher(): void {
  // Process on reconnect
  window.addEventListener('online', () => {
    useNetworkStore.getState().setOnline(true);
    processSyncQueue();
  });

  window.addEventListener('offline', () => {
    useNetworkStore.getState().setOnline(false);
  });

  // Process any pending items on startup (if online)
  if (navigator.onLine) {
    syncQueue.getPendingCount().then((count) => {
      useNetworkStore.getState().setPendingSyncCount(count);
      if (count > 0) {
        processSyncQueue();
      }
    });
  }
}
