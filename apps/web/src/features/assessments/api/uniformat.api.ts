import { useQuery } from '@tanstack/react-query';
import apiClient from '../../../lib/api-client';
import { queryKeys } from '../../../lib/query-keys';
import type { UniformatElement, UniformatGroup } from '../../../types';

// ============================================
// API FUNCTIONS
// ============================================

export interface ListUniformatParams {
  systemGroup?: string;
}

export const uniformatApi = {
  list: async (params: ListUniformatParams = {}): Promise<UniformatElement[]> => {
    const { data } = await apiClient.get('/uniformat', { params });
    return data;
  },

  getGroups: async (): Promise<UniformatGroup[]> => {
    const { data } = await apiClient.get('/uniformat/groups');
    return data;
  },
};

// ============================================
// QUERY HOOKS
// ============================================

export const useUniformatElements = (params: ListUniformatParams = {}) => {
  return useQuery({
    queryKey: queryKeys.uniformat.list(params),
    queryFn: () => uniformatApi.list(params),
    staleTime: 1000 * 60 * 10,
  });
};

export const useUniformatGroups = () => {
  return useQuery({
    queryKey: queryKeys.uniformat.groups,
    queryFn: () => uniformatApi.getGroups(),
    staleTime: 1000 * 60 * 10,
  });
};
