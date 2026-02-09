import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '../../../lib/api-client';
import { queryKeys } from '../../../lib/query-keys';
import type { Organization, OrganizationStats } from '../../../types';

// ============================================
// API FUNCTIONS
// ============================================

export const organizationsApi = {
  getById: async (id: string): Promise<Organization> => {
    const { data } = await apiClient.get(`/organizations/${id}`);
    return data;
  },

  update: async (id: string, body: { name?: string }): Promise<Organization> => {
    const { data } = await apiClient.patch(`/organizations/${id}`, body);
    return data;
  },

  getStats: async (id: string): Promise<OrganizationStats> => {
    const { data } = await apiClient.get(`/organizations/${id}/stats`);
    return data;
  },
};

// ============================================
// REACT QUERY HOOKS
// ============================================

export const useOrganization = (id: string) => {
  return useQuery({
    queryKey: queryKeys.organizations.detail(id),
    queryFn: () => organizationsApi.getById(id),
    enabled: !!id,
  });
};

export const useOrganizationStats = (id: string) => {
  return useQuery({
    queryKey: queryKeys.organizations.stats(id),
    queryFn: () => organizationsApi.getStats(id),
    enabled: !!id,
  });
};

export const useUpdateOrganization = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: { name?: string } }) =>
      organizationsApi.update(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.organizations.detail(id) });
    },
  });
};
