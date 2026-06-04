import api from './axios';

export const login = async (credentials) => {
  const response = await api.post('/auth/login', credentials);
  return response; // User code does const { data } = await login(form), which means it expects axios response itself or axios response object
};

export const register = async (userData) => {
  const response = await api.post('/auth/register', userData);
  return response;
};

export const getCurrentUser = async () => {
  const response = await api.get('/auth/me');
  return response;
};

export const logout = async () => {
  const response = await api.post('/auth/logout');
  return response;
};

export const authApi = {
  login,
  register,
  getCurrentUser,
  logout,
};

export default authApi;

