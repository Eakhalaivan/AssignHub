import axios from 'axios';
import { useAuthStore } from '../store/authStore';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  headers: { 'Content-Type': 'application/json' },
});

let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

api.interceptors.request.use(config => {
  const token = localStorage.getItem('accessToken');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  res => res,
  async err => {
    const originalConfig = err.config;

    // Safety check for undefined config or URL
    if (!originalConfig || !originalConfig.url) {
      return Promise.reject(err);
    }

    const url = originalConfig.url;

    // Avoid retry loop or handling refresh logic for auth endpoints
    if (
      url.includes('/auth/login') ||
      url.includes('/auth/refresh') ||
      url.includes('/auth/register') ||
      url.includes('/auth/signup')
    ) {
      return Promise.reject(err);
    }

    if (err.response?.status === 401 && !originalConfig._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then(token => {
            originalConfig.headers.Authorization = `Bearer ${token}`;
            return api(originalConfig);
          })
          .catch(queueError => {
            return Promise.reject(queueError);
          });
      }

      originalConfig._retry = true;
      isRefreshing = true;

      try {
        const refresh = localStorage.getItem('refreshToken');
        if (!refresh) {
          throw new Error('No refresh token available');
        }
        
        const { data } = await api.post('/auth/refresh', { refreshToken: refresh });
        
        const newAccessToken = data.data.accessToken;
        const newRefreshToken = data.data.refreshToken;
        
        localStorage.setItem('accessToken', newAccessToken);
        localStorage.setItem('refreshToken', newRefreshToken);
        
        originalConfig.headers.Authorization = `Bearer ${newAccessToken}`;
        
        processQueue(null, newAccessToken);
        
        return api(originalConfig);
      } catch (refreshError) {
        processQueue(refreshError, null);
        useAuthStore.getState().logout();
        window.location.href = '/login';
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }
    return Promise.reject(err);
  }
);

export default api;