import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '../../../lib/api-client';
import { queryKeys } from '../../../lib/query-keys';
import type {
  User,
  Branch,
  PaginatedResponse,
  InviteUserFormData,
  UpdateUserFormData,
} from '../../../types';

// ============================================
// API FUNCTIONS
// ============================================

export interface ListUsersParams {
  page?: number;
  limit?: number;
  role?: string;
  isActive?: boolean;
  branchId?: string;
}

export const usersApi = {
  list: async (params: ListUsersParams = {}): Promise<PaginatedResponse<User>> => {
    const { data } = await apiClient.get('/users', { params });
    return data;
  },

  getById: async (id: string): Promise<User> => {
    const { data } = await apiClient.get(`/users/${id}`);
    return data;
  },

  invite: async (body: InviteUserFormData): Promise<User> => {
    const { data } = await apiClient.post('/users/invite', body);
    return data;
  },

  update: async (id: string, body: UpdateUserFormData): Promise<User> => {
    const { data } = await apiClient.patch(`/users/${id}`, body);
    return data;
  },

  deactivate: async (id: string): Promise<void> => {
    await apiClient.delete(`/users/${id}`);
  },

  resendInvite: async (id: string): Promise<void> => {
    await apiClient.post(`/users/${id}/resend-invite`);
  },

  getBranches: async (id: string): Promise<Branch[]> => {
    const { data } = await apiClient.get(`/users/${id}/branches`);
    return data;
  },

  assignBranch: async (id: string, branchId: string): Promise<void> => {
    await apiClient.post(`/users/${id}/branches`, { branchId });
  },

  removeBranch: async (id: string, branchId: string): Promise<void> => {
    await apiClient.delete(`/users/${id}/branches/${branchId}`);
  },
};

// ============================================
// REACT QUERY HOOKS
// ============================================

export const useUsers = (filters: ListUsersParams = {}) => {
  return useQuery({
    queryKey: queryKeys.users.list(filters),
    queryFn: () => usersApi.list(filters),
    staleTime: 1000 * 60 * 5,
  });
};

export const useUser = (id: string) => {
  return useQuery({
    queryKey: queryKeys.users.detail(id),
    queryFn: () => usersApi.getById(id),
    enabled: !!id,
  });
};

export const useUserBranches = (id: string) => {
  return useQuery({
    queryKey: queryKeys.users.branches(id),
    queryFn: () => usersApi.getBranches(id),
    enabled: !!id,
  });
};

export const useInviteUser = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: InviteUserFormData) => usersApi.invite(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.users.all });
    },
  });
};

export const useUpdateUser = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateUserFormData }) =>
      usersApi.update(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.users.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.users.detail(id) });
    },
  });
};

export const useDeactivateUser = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => usersApi.deactivate(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.users.all });
    },
  });
};

export const useResendInvite = () => {
  return useMutation({
    mutationFn: (id: string) => usersApi.resendInvite(id),
  });
};

export const useAssignUserBranch = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ userId, branchId }: { userId: string; branchId: string }) =>
      usersApi.assignBranch(userId, branchId),
    onSuccess: (_, { userId }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.users.branches(userId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.users.detail(userId) });
    },
  });
};

export const useRemoveUserBranch = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ userId, branchId }: { userId: string; branchId: string }) =>
      usersApi.removeBranch(userId, branchId),
    onSuccess: (_, { userId }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.users.branches(userId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.users.detail(userId) });
    },
  });
};
