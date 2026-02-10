import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../lib/offline/db';
import * as syncQueue from '../lib/offline/sync-queue';

export function useSyncStatus() {
  const allItems = useLiveQuery(
    () => db.syncQueue.orderBy('createdAt').reverse().limit(50).toArray(),
    [],
    [],
  );

  const pendingCount = useLiveQuery(
    () => db.syncQueue.where('status').anyOf('pending', 'processing').count(),
    [],
    0,
  );

  const failedCount = useLiveQuery(
    () => db.syncQueue.where('status').equals('failed').count(),
    [],
    0,
  );

  const isSyncing = useLiveQuery(
    () => db.syncQueue.where('status').equals('processing').count().then((c) => c > 0),
    [],
    false,
  );

  return {
    pendingCount,
    failedCount,
    isSyncing,
    recentItems: allItems,
    retryFailed: syncQueue.retryFailed,
    clearCompleted: syncQueue.clearCompleted,
  };
}
