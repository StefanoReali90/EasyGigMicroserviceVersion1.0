import api from './axios';

export const getUserById = async (userId) => {
  const response = await api.get(`/users/${userId}`);
  return response.data;
};

export const getBandById = async (bandId) => {
  const response = await api.get(`/bands/${bandId}`);
  return response.data;
};
