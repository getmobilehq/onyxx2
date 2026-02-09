import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '../../../lib/api-client';
import { queryKeys } from '../../../lib/query-keys';
import type { Deficiency, DeficiencyFormData, PaginatedResponse } from '../../../types';

// ============================================
// API FUNCTIONS
// ============================================

export interface ListDeficienciesParams {
  page?: number;
  limit?: number;
  priority?: string;
  severity?: string;
  buildingId?: string;
  search?: string;
}

export const deficienciesApi = {
  listAll: async (params: ListDeficienciesParams = {}): Promise<PaginatedResponse<Deficiency>> => {
    const { data } = await apiClient.get('/deficiencies', { params });
    return data;
  },

  listByElement: async (elementId: string): Promise<Deficiency[]> => {
    const { data } = await apiClient.get(`/assessment-elements/${elementId}/deficiencies`);
    return data;
  },

  getById: async (id: string): Promise<Deficiency> => {
    const { data } = await apiClient.get(`/deficiencies/${id}`);
    return data;
  },

  create: async (elementId: string, body: DeficiencyFormData): Promise<Deficiency> => {
    const { data } = await apiClient.post(`/assessment-elements/${elementId}/deficiencies`, body);
    return data;
  },

  update: async (id: string, body: Partial<DeficiencyFormData>): Promise<Deficiency> => {
    const { data } = await apiClient.patch(`/deficiencies/${id}`, body);
    return data;
  },

  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/deficiencies/${id}`);
  },
};

// ============================================
// QUERY HOOKS
// ============================================

export const useDeficiencies = (filters: ListDeficienciesParams = {}) => {
  return useQuery({
    queryKey: queryKeys.deficiencies.list(filters),
    queryFn: () => deficienciesApi.listAll(filters),
  });
};

export const useElementDeficiencies = (elementId: string) => {
  return useQuery({
    queryKey: queryKeys.elements.deficiencies(elementId),
    queryFn: () => deficienciesApi.listByElement(elementId),
    enabled: !!elementId,
  });
};

export const useDeficiency = (id: string) => {
  return useQuery({
    queryKey: queryKeys.deficiencies.detail(id),
    queryFn: () => deficienciesApi.getById(id),
    enabled: !!id,
  });
};

// ============================================
// MUTATION HOOKS
// ============================================

export const useCreateDeficiency = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ elementId, data }: { elementId: string; data: DeficiencyFormData }) =>
      deficienciesApi.create(elementId, data),
    onSuccess: (_, { elementId }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.elements.deficiencies(elementId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.assessments.all });
    },
  });
};

export const useUpdateDeficiency = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<DeficiencyFormData> }) =>
      deficienciesApi.update(id, data),
    onSuccess: (updated) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.elements.deficiencies(updated.assessmentElementId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.deficiencies.detail(updated.id) });
      queryClient.invalidateQueries({ queryKey: queryKeys.assessments.all });
    },
  });
};

export const useDeleteDeficiency = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deficienciesApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.elements.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.assessments.all });
    },
  });
};
