import { useQuery } from '@tanstack/react-query';
import apiClient from '../../../lib/api-client';
import { queryKeys } from '../../../lib/query-keys';
import type { Branch, PaginatedResponse } from '../../../types';

export const branchesApi = {
  list: async (): Promise<PaginatedResponse<Branch>> => {
    const { data } = await apiClient.get('/branches', { params: { limit: 100 } });
    return data;
  },
};

export const useBranches = () => {
  return useQuery({
    queryKey: queryKeys.branches.list(),
    queryFn: branchesApi.list,
    staleTime: 1000 * 60 * 10, // 10 minutes - branches rarely change
  });
};
