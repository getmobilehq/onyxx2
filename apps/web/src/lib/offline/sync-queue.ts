import { db, type SyncQueueItem } from './db';

type NewSyncItem = Omit<SyncQueueItem, 'id' | 'status' | 'attempts' | 'lastError'>;

export async function enqueue(item: NewSyncItem): Promise<number> {
  return db.syncQueue.add({
    ...item,
    status: 'pending',
    attempts: 0,
    lastError: null,
  });
}

export async function getPending(): Promise<SyncQueueItem[]> {
  return db.syncQueue.where('status').equals('pending').sortBy('createdAt');
}

export async function markProcessing(id: number): Promise<void> {
  await db.syncQueue.update(id, { status: 'processing' });
}

export async function markCompleted(id: number): Promise<void> {
  await db.syncQueue.update(id, { status: 'completed' });
}

export async function markFailed(id: number, error: string): Promise<void> {
  const item = await db.syncQueue.get(id);
  if (!item) return;

  const attempts = item.attempts + 1;
  await db.syncQueue.update(id, {
    status: attempts >= 3 ? 'failed' : 'pending',
    attempts,
    lastError: error,
  });
}

export async function getPendingCount(): Promise<number> {
  return db.syncQueue.where('status').anyOf('pending', 'processing').count();
}

export async function clearCompleted(): Promise<void> {
  await db.syncQueue.where('status').equals('completed').delete();
}

export async function getAll(): Promise<SyncQueueItem[]> {
  return db.syncQueue.orderBy('createdAt').reverse().limit(50).toArray();
}

export async function retryFailed(): Promise<void> {
  await db.syncQueue.where('status').equals('failed').modify({ status: 'pending', attempts: 0 });
}
