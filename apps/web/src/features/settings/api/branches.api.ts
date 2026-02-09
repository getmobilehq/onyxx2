import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '../../../lib/api-client';
import { queryKeys } from '../../../lib/query-keys';
import type { Branch, BranchFormData } from '../../../types';

// ============================================
// API FUNCTIONS
// ============================================

export const branchesCrudApi = {
  getById: async (id: string): Promise<Branch> => {
    const { data } = await apiClient.get(`/branches/${id}`);
    return data;
  },

  create: async (body: BranchFormData): Promise<Branch> => {
    const { data } = await apiClient.post('/branches', body);
    return data;
  },

  update: async (id: string, body: Partial<BranchFormData>): Promise<Branch> => {
    const { data } = await apiClient.patch(`/branches/${id}`, body);
    return data;
  },

  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/branches/${id}`);
  },
};

// ============================================
// REACT QUERY HOOKS
// ============================================

export const useBranch = (id: string) => {
  return useQuery({
    queryKey: queryKeys.branches.detail(id),
    queryFn: () => branchesCrudApi.getById(id),
    enabled: !!id,
  });
};

export const useCreateBranch = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: BranchFormData) => branchesCrudApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.branches.all });
    },
  });
};

export const useUpdateBranch = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<BranchFormData> }) =>
      branchesCrudApi.update(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.branches.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.branches.detail(id) });
    },
  });
};

export const useDeleteBranch = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => branchesCrudApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.branches.all });
    },
  });
};
