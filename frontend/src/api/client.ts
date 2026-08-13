import axios from 'axios';

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api/v1',
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('access_token');
      localStorage.removeItem('user');
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// High-performance client-side in-memory cache for instant section navigation
const memoryCache = new Map<string, { data: any; timestamp: number }>();
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes

export const cachedGet = async (url: string, forceFresh = false) => {
  const now = Date.now();
  const cached = memoryCache.get(url);

  if (!forceFresh && cached && now - cached.timestamp < CACHE_TTL_MS) {
    // Return cached data instantly (0ms) and silently revalidate in background
    api.get(url).then((res) => {
      memoryCache.set(url, { data: res.data, timestamp: Date.now() });
    }).catch(() => {});

    return { data: cached.data };
  }

  const response = await api.get(url);
  memoryCache.set(url, { data: response.data, timestamp: now });
  return response;
};

export const clearApiCache = () => {
  memoryCache.clear();
};
