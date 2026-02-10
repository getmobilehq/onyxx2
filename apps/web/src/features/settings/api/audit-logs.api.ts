import { useQuery } from '@tanstack/react-query';
import apiClient from '../../../lib/api-client';
import { queryKeys } from '../../../lib/query-keys';
import type { AuditLog } from '../../../types';

export interface AuditLogFilters {
  action?: string;
  entityType?: string;
  entityId?: string;
  userId?: string;
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
}

interface AuditLogListResponse {
  data: AuditLog[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export const auditLogsApi = {
  list: async (params: AuditLogFilters = {}): Promise<AuditLogListResponse> => {
    const { data } = await apiClient.get('/audit-logs', { params });
    return data;
  },
};

export const useAuditLogs = (filters: AuditLogFilters = {}) => {
  return useQuery({
    queryKey: queryKeys.auditLogs.list(filters),
    queryFn: () => auditLogsApi.list(filters),
  });
};
