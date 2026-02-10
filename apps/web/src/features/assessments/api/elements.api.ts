import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '../../../lib/api-client';
import { queryKeys } from '../../../lib/query-keys';
import { useOfflineMutation } from '../../../hooks/useOfflineMutation';
import type { AssessmentElement, BulkAddResult, ElementAssessmentFormData, PaginatedResponse } from '../../../types';

// ============================================
// API FUNCTIONS
// ============================================

export interface ListElementsParams {
  page?: number;
  limit?: number;
}

export const elementsApi = {
  list: async (
    assessmentId: string,
    params: ListElementsParams = {},
  ): Promise<PaginatedResponse<AssessmentElement>> => {
    const { data } = await apiClient.get(`/assessments/${assessmentId}/elements`, { params });
    return data;
  },

  bulkAdd: async (
    assessmentId: string,
    uniformatCodes: string[],
  ): Promise<BulkAddResult> => {
    const { data } = await apiClient.post(`/assessments/${assessmentId}/elements`, { uniformatCodes });
    return data;
  },

  update: async (
    assessmentId: string,
    elementId: string,
    body: Partial<ElementAssessmentFormData>,
  ): Promise<AssessmentElement> => {
    const { data } = await apiClient.patch(
      `/assessments/${assessmentId}/elements/${elementId}`,
      body,
    );
    return data;
  },
};

// ============================================
// QUERY HOOKS
// ============================================

export const useAssessmentElements = (assessmentId: string, params: ListElementsParams = {}) => {
  return useQuery({
    queryKey: queryKeys.assessments.elements(assessmentId),
    queryFn: () => elementsApi.list(assessmentId, params),
    enabled: !!assessmentId,
  });
};

// ============================================
// MUTATION HOOKS
// ============================================

export const useBulkAddElements = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ assessmentId, uniformatCodes }: { assessmentId: string; uniformatCodes: string[] }) =>
      elementsApi.bulkAdd(assessmentId, uniformatCodes),
    onSuccess: (_, { assessmentId }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.assessments.elements(assessmentId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.assessments.detail(assessmentId) });
    },
  });
};

export const useUpdateElement = () => {
  return useOfflineMutation<
    AssessmentElement,
    { assessmentId: string; elementId: string; data: Partial<ElementAssessmentFormData> }
  >({
    mutationFn: ({ assessmentId, elementId, data }) =>
      elementsApi.update(assessmentId, elementId, data),
    entityType: 'element',
    getEndpoint: ({ assessmentId, elementId }) =>
      `/assessments/${assessmentId}/elements/${elementId}`,
    getMethod: () => 'PATCH',
    getEntityId: ({ elementId }) => elementId,
    getPayload: ({ data }) => data as Record<string, unknown>,
    invalidateKeys: [],
    onSuccess: (_, { assessmentId }) => {
      // These are handled by the mutation's built-in cache invalidation
      // but we also need to trigger them on online success
      import('../../../lib/query-client').then(({ queryClient }) => {
        queryClient.invalidateQueries({ queryKey: queryKeys.assessments.elements(assessmentId) });
        queryClient.invalidateQueries({ queryKey: queryKeys.assessments.detail(assessmentId) });
      });
    },
  });
};
