import type { PersistedClient, Persister } from '@tanstack/react-query-persist-client';
import { db } from './db';

const CACHE_KEY = 'reactQueryState';
const MAX_AGE = 1000 * 60 * 60 * 24; // 24 hours

export const dexiePersister: Persister = {
  persistClient: async (client: PersistedClient) => {
    try {
      await db.queryCache.put({
        key: CACHE_KEY,
        state: JSON.stringify(client),
        timestamp: Date.now(),
      });
    } catch {
      // Silently fail — persistence is best-effort
    }
  },

  restoreClient: async (): Promise<PersistedClient | undefined> => {
    try {
      const entry = await db.queryCache.get(CACHE_KEY);
      if (!entry) return undefined;

      // Check max age
      if (Date.now() - entry.timestamp > MAX_AGE) {
        await db.queryCache.delete(CACHE_KEY);
        return undefined;
      }

      return JSON.parse(entry.state) as PersistedClient;
    } catch {
      return undefined;
    }
  },

  removeClient: async () => {
    try {
      await db.queryCache.delete(CACHE_KEY);
    } catch {
      // Silently fail
    }
  },
};
