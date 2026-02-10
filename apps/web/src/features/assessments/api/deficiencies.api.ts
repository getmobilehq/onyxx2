import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '../../../lib/api-client';
import { queryKeys } from '../../../lib/query-keys';
import { useOfflineMutation } from '../../../hooks/useOfflineMutation';
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
  return useOfflineMutation<
    Deficiency,
    { elementId: string; data: DeficiencyFormData }
  >({
    mutationFn: ({ elementId, data }) => deficienciesApi.create(elementId, data),
    entityType: 'deficiency',
    getEndpoint: ({ elementId }) => `/assessment-elements/${elementId}/deficiencies`,
    getMethod: () => 'POST',
    getEntityId: ({ elementId }) => elementId,
    getPayload: ({ data }) => data as unknown as Record<string, unknown>,
    onSuccess: (_, { elementId }) => {
      import('../../../lib/query-client').then(({ queryClient }) => {
        queryClient.invalidateQueries({ queryKey: queryKeys.elements.deficiencies(elementId) });
        queryClient.invalidateQueries({ queryKey: queryKeys.assessments.all });
      });
    },
  });
};

export const useUpdateDeficiency = () => {
  return useOfflineMutation<
    Deficiency,
    { id: string; data: Partial<DeficiencyFormData> }
  >({
    mutationFn: ({ id, data }) => deficienciesApi.update(id, data),
    entityType: 'deficiency',
    getEndpoint: ({ id }) => `/deficiencies/${id}`,
    getMethod: () => 'PATCH',
    getEntityId: ({ id }) => id,
    getPayload: ({ data }) => data as unknown as Record<string, unknown>,
    onSuccess: (updated) => {
      import('../../../lib/query-client').then(({ queryClient }) => {
        if (updated && updated.assessmentElementId) {
          queryClient.invalidateQueries({ queryKey: queryKeys.elements.deficiencies(updated.assessmentElementId) });
          queryClient.invalidateQueries({ queryKey: queryKeys.deficiencies.detail(updated.id) });
        }
        queryClient.invalidateQueries({ queryKey: queryKeys.assessments.all });
      });
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
