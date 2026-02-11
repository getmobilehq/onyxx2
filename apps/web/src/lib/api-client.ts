import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import { getAccessToken, setAccessToken } from '../stores/auth.store';

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api/v1';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Send httpOnly cookies (refresh token)
  timeout: 30000,
});

// Track in-flight refresh to avoid duplicate refresh calls
let refreshPromise: Promise<string | null> | null = null;

/**
 * Attempt to refresh the access token using the httpOnly refresh cookie.
 * Returns the new access token or null on failure.
 */
async function refreshAccessToken(): Promise<string | null> {
  try {
    const { data } = await axios.post(
      `${API_BASE_URL}/auth/refresh`,
      {},
      { withCredentials: true },
    );
    // The response may be envelope-wrapped or raw depending on the interceptor chain
    const token = data?.data?.token ?? data?.token;
    if (token) {
      setAccessToken(token);
      return token;
    }
    return null;
  } catch {
    return null;
  }
}

// Request interceptor — attach in-memory access token
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = getAccessToken();
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

// Response interceptor — unwrap envelope, handle 401 with silent refresh
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

    // Handle 401 — attempt silent refresh before giving up
    if (error.response?.status === 401 && originalRequest && !originalRequest._retry) {
      originalRequest._retry = true;

      // Deduplicate concurrent refresh attempts
      if (!refreshPromise) {
        refreshPromise = refreshAccessToken().finally(() => {
          refreshPromise = null;
        });
      }

      const newToken = await refreshPromise;

      if (newToken) {
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        return apiClient(originalRequest);
      }

      // Refresh failed — clear auth and redirect to login
      setAccessToken(null);
      // Clear persisted auth store
      const authStorage = localStorage.getItem('auth-storage');
      if (authStorage) {
        localStorage.removeItem('auth-storage');
      }
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
