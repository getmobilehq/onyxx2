import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '../../../lib/api-client';
import { queryKeys } from '../../../lib/query-keys';
import type {
  Assessment,
  AssessmentFormData,
  AssessmentStatus,
  AssessmentAssignee,
  PaginatedResponse,
} from '../../../types';

// ============================================
// API FUNCTIONS
// ============================================

export interface ListAssessmentsParams {
  page?: number;
  limit?: number;
  buildingId?: string;
  branchId?: string;
  status?: AssessmentStatus;
}

export const assessmentsApi = {
  list: async (params: ListAssessmentsParams = {}): Promise<PaginatedResponse<Assessment>> => {
    const { data } = await apiClient.get('/assessments', { params });
    return data;
  },

  getById: async (id: string): Promise<Assessment> => {
    const { data } = await apiClient.get(`/assessments/${id}`);
    return data;
  },

  create: async (body: AssessmentFormData): Promise<Assessment> => {
    const { data } = await apiClient.post('/assessments', body);
    return data;
  },

  update: async (id: string, body: Partial<AssessmentFormData>): Promise<Assessment> => {
    const { data } = await apiClient.patch(`/assessments/${id}`, body);
    return data;
  },

  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/assessments/${id}`);
  },

  // Workflow actions
  start: async (id: string): Promise<Assessment> => {
    const { data } = await apiClient.post(`/assessments/${id}/start`);
    return data;
  },

  submit: async (id: string): Promise<Assessment> => {
    const { data } = await apiClient.post(`/assessments/${id}/submit`);
    return data;
  },

  approve: async (id: string): Promise<Assessment> => {
    const { data } = await apiClient.post(`/assessments/${id}/approve`);
    return data;
  },

  reject: async (id: string, reason: string): Promise<Assessment> => {
    const { data } = await apiClient.post(`/assessments/${id}/reject`, { reason });
    return data;
  },

  // Assignees
  listAssignees: async (id: string): Promise<AssessmentAssignee[]> => {
    const { data } = await apiClient.get(`/assessments/${id}/assignees`);
    return data;
  },

  addAssignee: async (id: string, userId: string): Promise<AssessmentAssignee> => {
    const { data } = await apiClient.post(`/assessments/${id}/assignees`, { userId });
    return data;
  },

  removeAssignee: async (id: string, userId: string): Promise<void> => {
    await apiClient.delete(`/assessments/${id}/assignees/${userId}`);
  },
};

// ============================================
// QUERY HOOKS
// ============================================

export const useAssessments = (filters: ListAssessmentsParams = {}) => {
  return useQuery({
    queryKey: queryKeys.assessments.list(filters),
    queryFn: () => assessmentsApi.list(filters),
  });
};

export const useAssessment = (id: string) => {
  return useQuery({
    queryKey: queryKeys.assessments.detail(id),
    queryFn: () => assessmentsApi.getById(id),
    enabled: !!id,
  });
};

export const useAssessmentAssignees = (id: string) => {
  return useQuery({
    queryKey: queryKeys.assessments.assignees(id),
    queryFn: () => assessmentsApi.listAssignees(id),
    enabled: !!id,
  });
};

// ============================================
// MUTATION HOOKS
// ============================================

export const useCreateAssessment = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: AssessmentFormData) => assessmentsApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.assessments.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard });
    },
  });
};

export const useUpdateAssessment = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<AssessmentFormData> }) =>
      assessmentsApi.update(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.assessments.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.assessments.detail(id) });
    },
  });
};

export const useDeleteAssessment = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => assessmentsApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.assessments.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard });
    },
  });
};

// Workflow mutations
export const useStartAssessment = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => assessmentsApi.start(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.assessments.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.assessments.detail(id) });
    },
  });
};

export const useSubmitAssessment = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => assessmentsApi.submit(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.assessments.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.assessments.detail(id) });
    },
  });
};

export const useApproveAssessment = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => assessmentsApi.approve(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.assessments.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.assessments.detail(id) });
      queryClient.invalidateQueries({ queryKey: queryKeys.buildings.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard });
    },
  });
};

export const useRejectAssessment = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) =>
      assessmentsApi.reject(id, reason),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.assessments.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.assessments.detail(id) });
    },
  });
};

// Assignee mutations
export const useAddAssignee = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ assessmentId, userId }: { assessmentId: string; userId: string }) =>
      assessmentsApi.addAssignee(assessmentId, userId),
    onSuccess: (_, { assessmentId }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.assessments.assignees(assessmentId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.assessments.detail(assessmentId) });
    },
  });
};

export const useRemoveAssignee = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ assessmentId, userId }: { assessmentId: string; userId: string }) =>
      assessmentsApi.removeAssignee(assessmentId, userId),
    onSuccess: (_, { assessmentId }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.assessments.assignees(assessmentId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.assessments.detail(assessmentId) });
    },
  });
};
