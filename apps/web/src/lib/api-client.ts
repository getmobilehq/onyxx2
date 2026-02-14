import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import { supabase } from './supabase';

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api/v1';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000,
});

// Request interceptor — get current Supabase session token
apiClient.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.access_token && config.headers) {
      config.headers.Authorization = `Bearer ${session.access_token}`;
    }
    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

// Response interceptor — unwrap envelope, handle 401 with Supabase refresh
apiClient.interceptors.response.use(
  (response) => {
    // API wraps responses in { success, data, meta? }
    // Unwrap so callers get the inner data directly
    if (response.data && typeof response.data === 'object' && 'success' in response.data) {
      const { data, meta } = response.data;
      response.data = meta ? { data, meta } : data;
    }
    return response;
  },
  async (error: AxiosError) => {
    // If offline and no response (network error), don't clear auth or redirect
    if (!error.response && !navigator.onLine) {
      return Promise.reject({
        message: 'You are offline',
        status: 0,
        data: null,
        isOffline: true,
      });
    }

    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    // Handle 401 — attempt Supabase session refresh before giving up
    if (error.response?.status === 401 && originalRequest && !originalRequest._retry) {
      originalRequest._retry = true;

      const { error: refreshError } = await supabase.auth.refreshSession();
      if (!refreshError) {
        // Retry the original request with new token
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.access_token) {
          originalRequest.headers.Authorization = `Bearer ${session.access_token}`;
          return apiClient(originalRequest);
        }
      }

      // Refresh failed — sign out and redirect to login
      await supabase.auth.signOut();
      localStorage.removeItem('auth-storage');
      window.location.href = '/login';
      return Promise.reject(error);
    }

    // Handle 403 Forbidden — Show permission error
    if (error.response?.status === 403) {
      console.error('Permission denied:', error.response.data);
    }

    // Return formatted error
    return Promise.reject({
      message: (error.response?.data as any)?.error || error.message || 'An error occurred',
      status: error.response?.status,
      data: error.response?.data,
    });
  }
);

export default apiClient;
