import axios from 'axios';

// In dev, API is same-origin via the Vite proxy. In production, point to the
// deployed backend with VITE_API_URL (e.g. https://your-api.onrender.com).
export const API_ROOT = import.meta.env.VITE_API_URL || '';

const api = axios.create({ baseURL: `${API_ROOT}/api` });

// Store tokens in memory + localStorage fallback (MVP-friendly)
const store = {
  get access() {
    return localStorage.getItem('rt_access');
  },
  get refresh() {
    return localStorage.getItem('rt_refresh');
  },
  setTokens(access, refresh) {
    localStorage.setItem('rt_access', access);
    localStorage.setItem('rt_refresh', refresh);
  },
  clear() {
    localStorage.removeItem('rt_access');
    localStorage.removeItem('rt_refresh');
  },
};
export const tokenStore = store;

let isRefreshing = false;
let queue = [];

const onRefreshed = (token) => {
  queue.forEach((cb) => cb(token));
  queue = [];
};

api.interceptors.request.use((config) => {
  const token = store.access;
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config;
    const status = error.response?.status;

    if (status === 401 && !original._retry && store.refresh) {
      if (isRefreshing) {
        return new Promise((resolve) => queue.push((token) => {
          original.headers.Authorization = `Bearer ${token}`;
          resolve(api(original));
        }));
      }

      original._retry = true;
      isRefreshing = true;

      try {
        const { data } = await axios.post(`${API_ROOT}/api/auth/refresh`, {
          refreshToken: store.refresh,
        });
        store.setTokens(data.tokens.accessToken, data.tokens.refreshToken);
        onRefreshed(data.tokens.accessToken);
        original.headers.Authorization = `Bearer ${data.tokens.accessToken}`;
        return api(original);
      } catch (refreshError) {
        store.clear();
        window.location.href = '/login';
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default api;