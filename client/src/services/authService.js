import api, { tokenStore } from './api.js';

export const register = (payload) => api.post('/auth/register', payload);

export const login = (payload) => api.post('/auth/login', payload);

export const getMe = () => api.get('/auth/me');

export const logout = () => {
  tokenStore.clear();
  window.location.href = '/login';
};

export default { register, login, getMe, logout };