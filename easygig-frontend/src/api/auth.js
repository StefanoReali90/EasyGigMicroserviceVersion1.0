import api from './axios';

export const registerUser = async (userData) => {
  const response = await api.post('/users/', userData);
  return response.data;
};

export const login = async (credentials) => {
  const response = await api.post('/auth/login', credentials);
  return response.data;
};
