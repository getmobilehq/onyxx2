import { useQuery } from '@tanstack/react-query';
import apiClient from '../../../lib/api-client';
import { queryKeys } from '../../../lib/query-keys';
import type { DashboardStats } from '../../../types';

export const dashboardApi = {
  getStats: async (): Promise<DashboardStats> => {
    const { data } = await apiClient.get('/reports/dashboard');
    return data;
  },
};

export const useDashboardStats = () => {
  return useQuery({
    queryKey: queryKeys.dashboard,
    queryFn: dashboardApi.getStats,
  });
};
