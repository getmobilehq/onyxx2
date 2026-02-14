import { useMutation, useQuery } from '@tanstack/react-query';
import { supabase } from '../../../lib/supabase';
import apiClient from '../../../lib/api-client';
import { useAuthStore } from '../../../stores/auth.store';
import type {
  User,
  LoginCredentials,
  ChangePasswordData,
  ForgotPasswordData,
} from '../../../types';

// ============================================
// API FUNCTIONS
// ============================================

export const authApi = {
  /**
   * Login via Supabase Auth, then call our API to get internal user data
   */
  login: async (credentials: LoginCredentials): Promise<User> => {
    const { error } = await supabase.auth.signInWithPassword({
      email: credentials.email,
      password: credentials.password,
    });

    if (error) throw new Error(error.message);

    // Call our API to sync login state and get internal user
    const { data } = await apiClient.post<User>('/auth/callback');
    return data;
  },

  me: async (): Promise<User> => {
    const { data } = await apiClient.get<User>('/auth/me');
    return data;
  },

  changePassword: async (data: ChangePasswordData): Promise<{ message: string }> => {
    const { data: result } = await apiClient.post<{ message: string }>('/auth/change-password', data);
    return result;
  },

  /**
   * Forgot password — calls Supabase directly
   */
  forgotPassword: async (data: ForgotPasswordData): Promise<{ message: string }> => {
    const { error } = await supabase.auth.resetPasswordForEmail(data.email, {
      redirectTo: `${window.location.origin}/auth/callback`,
    });
    if (error) throw new Error(error.message);
    return { message: 'Password reset email sent' };
  },

  /**
   * Reset password — called after user arrives via reset link with active Supabase session
   */
  resetPassword: async (password: string): Promise<{ message: string }> => {
    const { error } = await supabase.auth.updateUser({ password });
    if (error) throw new Error(error.message);
    return { message: 'Password reset successfully' };
  },

  /**
   * Logout — calls the backend for audit logging, then signs out of Supabase
   */
  logout: async (): Promise<void> => {
    try {
      await apiClient.post('/auth/logout');
    } catch {
      // Proceed with client-side cleanup even if the server call fails
    }
    await supabase.auth.signOut();
  },
};

// ============================================
// REACT QUERY HOOKS
// ============================================

export const useLogin = () => {
  const { setAuth } = useAuthStore();

  return useMutation({
    mutationFn: authApi.login,
    onSuccess: (user) => {
      setAuth(user);
    },
  });
};

export const useLogout = () => {
  const { clearAuth } = useAuthStore();

  return useMutation({
    mutationFn: authApi.logout,
    onSuccess: () => {
      clearAuth();
    },
  });
};

export const useChangePassword = () => {
  return useMutation({
    mutationFn: authApi.changePassword,
  });
};

export const useForgotPassword = () => {
  return useMutation({
    mutationFn: authApi.forgotPassword,
  });
};

export const useResetPassword = () => {
  return useMutation({
    mutationFn: authApi.resetPassword,
  });
};

export const useMe = () => {
  const { user } = useAuthStore();

  return useQuery({
    queryKey: ['auth', 'me'],
    queryFn: authApi.me,
    enabled: !!user,
    staleTime: 1000 * 60 * 5,
  });
};
