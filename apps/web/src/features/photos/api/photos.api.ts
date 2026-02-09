import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '../../../lib/api-client';
import { queryKeys } from '../../../lib/query-keys';
import type { Photo, PhotoUploadData } from '../../../types';

// ============================================
// API FUNCTIONS
// ============================================

interface ListPhotosParams {
  buildingId?: string;
  assessmentElementId?: string;
  deficiencyId?: string;
}

export const photosApi = {
  list: async (params: ListPhotosParams): Promise<Photo[]> => {
    const { data } = await apiClient.get('/photos', { params });
    return data;
  },

  upload: async (uploadData: PhotoUploadData): Promise<Photo> => {
    const formData = new FormData();
    formData.append('photo', uploadData.photo);
    if (uploadData.buildingId) formData.append('buildingId', uploadData.buildingId);
    if (uploadData.assessmentElementId) formData.append('assessmentElementId', uploadData.assessmentElementId);
    if (uploadData.deficiencyId) formData.append('deficiencyId', uploadData.deficiencyId);
    if (uploadData.caption) formData.append('caption', uploadData.caption);
    if (uploadData.sortOrder != null) formData.append('sortOrder', String(uploadData.sortOrder));

    const { data } = await apiClient.post('/photos', formData);
    return data;
  },

  update: async (id: string, body: { caption?: string; sortOrder?: number }): Promise<Photo> => {
    const { data } = await apiClient.patch(`/photos/${id}`, body);
    return data;
  },

  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/photos/${id}`);
  },
};

// ============================================
// REACT QUERY HOOKS
// ============================================

export const useBuildingPhotos = (buildingId: string) => {
  return useQuery({
    queryKey: queryKeys.photos.byBuilding(buildingId),
    queryFn: () => photosApi.list({ buildingId }),
    enabled: !!buildingId,
  });
};

export const useElementPhotos = (elementId: string) => {
  return useQuery({
    queryKey: queryKeys.photos.byElement(elementId),
    queryFn: () => photosApi.list({ assessmentElementId: elementId }),
    enabled: !!elementId,
  });
};

export const useDeficiencyPhotos = (deficiencyId: string) => {
  return useQuery({
    queryKey: queryKeys.photos.byDeficiency(deficiencyId),
    queryFn: () => photosApi.list({ deficiencyId }),
    enabled: !!deficiencyId,
  });
};

export const useUploadPhoto = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: PhotoUploadData) => photosApi.upload(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.photos.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.buildings.all });
    },
  });
};

export const useUpdatePhoto = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: { caption?: string; sortOrder?: number } }) =>
      photosApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.photos.all });
    },
  });
};

export const useDeletePhoto = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => photosApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.photos.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.buildings.all });
    },
  });
};
