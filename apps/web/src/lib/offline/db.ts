import Dexie, { type Table } from 'dexie';

export interface QueryCacheEntry {
  key: string;
  state: string;
  timestamp: number;
}

export interface SyncQueueItem {
  id?: number;
  entityType: string;
  entityId: string;
  operation: 'create' | 'update' | 'delete';
  endpoint: string;
  method: 'POST' | 'PATCH' | 'PUT' | 'DELETE';
  payload: Record<string, unknown> | null;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  attempts: number;
  lastError: string | null;
  createdAt: number;
}

class OnyxOfflineDB extends Dexie {
  queryCache!: Table<QueryCacheEntry, string>;
  syncQueue!: Table<SyncQueueItem, number>;

  constructor() {
    super('onyx-offline');
    this.version(1).stores({
      queryCache: 'key',
      syncQueue: '++id, entityType, entityId, status, createdAt',
    });
  }
}

export const db = new OnyxOfflineDB();
