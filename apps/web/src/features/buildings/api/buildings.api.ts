import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '../../../lib/api-client';
import { queryKeys } from '../../../lib/query-keys';
import type {
  Building,
  BuildingFormData,
  BuildingStats,
  Assessment,
  PaginatedResponse,
} from '../../../types';

// ============================================
// API FUNCTIONS
// ============================================

export interface ListBuildingsParams {
  page?: number;
  limit?: number;
  branchId?: string;
  search?: string;
  fciMin?: number;
  fciMax?: number;
}

export const buildingsApi = {
  list: async (params: ListBuildingsParams = {}): Promise<PaginatedResponse<Building>> => {
    const { data } = await apiClient.get('/buildings', { params });
    return data;
  },

  getById: async (id: string): Promise<Building> => {
    const { data } = await apiClient.get(`/buildings/${id}`);
    return data;
  },

  create: async (body: BuildingFormData): Promise<Building> => {
    const { data } = await apiClient.post('/buildings', body);
    return data;
  },

  update: async (id: string, body: Partial<BuildingFormData>): Promise<Building> => {
    const { data } = await apiClient.patch(`/buildings/${id}`, body);
    return data;
  },

  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/buildings/${id}`);
  },

  getStats: async (id: string): Promise<BuildingStats> => {
    const { data } = await apiClient.get(`/buildings/${id}/stats`);
    return data;
  },

  getAssessments: async (id: string, page = 1, limit = 20): Promise<PaginatedResponse<Assessment>> => {
    const { data } = await apiClient.get(`/buildings/${id}/assessments`, { params: { page, limit } });
    return data;
  },
};

// ============================================
// REACT QUERY HOOKS
// ============================================

export const useBuildings = (filters: ListBuildingsParams = {}) => {
  return useQuery({
    queryKey: queryKeys.buildings.list(filters),
    queryFn: () => buildingsApi.list(filters),
  });
};

export const useBuilding = (id: string) => {
  return useQuery({
    queryKey: queryKeys.buildings.detail(id),
    queryFn: () => buildingsApi.getById(id),
    enabled: !!id,
  });
};

export const useBuildingStats = (id: string) => {
  return useQuery({
    queryKey: queryKeys.buildings.stats(id),
    queryFn: () => buildingsApi.getStats(id),
    enabled: !!id,
  });
};

export const useBuildingAssessments = (id: string) => {
  return useQuery({
    queryKey: queryKeys.buildings.assessments(id),
    queryFn: () => buildingsApi.getAssessments(id),
    enabled: !!id,
  });
};

export const useCreateBuilding = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: BuildingFormData) => buildingsApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.buildings.all });
    },
  });
};

export const useUpdateBuilding = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<BuildingFormData> }) =>
      buildingsApi.update(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.buildings.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.buildings.detail(id) });
    },
  });
};

export const useDeleteBuilding = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => buildingsApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.buildings.all });
    },
  });
};
