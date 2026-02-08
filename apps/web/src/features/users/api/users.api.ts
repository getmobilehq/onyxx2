import { useQuery } from '@tanstack/react-query';
import apiClient from '../../../lib/api-client';
import { queryKeys } from '../../../lib/query-keys';
import type { User, PaginatedResponse } from '../../../types';

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
};

export const useUsers = (filters: ListUsersParams = {}) => {
  return useQuery({
    queryKey: queryKeys.users.list(filters),
    queryFn: () => usersApi.list(filters),
    staleTime: 1000 * 60 * 5,
  });
};
