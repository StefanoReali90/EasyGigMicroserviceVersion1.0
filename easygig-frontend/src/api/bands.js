import api from './axios';

export const getBandsByUser = async (userId) => {
  const response = await api.get(`/bands/user/${userId}`);
  return response.data;
};

export const getBandMembers = async (bandId) => {
  const response = await api.get(`/bands/${bandId}/members`);
  return response.data;
};

export const addBand = async (bandData) => {
  const response = await api.post('/bands/', bandData);
  return response.data;
};

export const updateBand = async (bandId, bandData) => {
  const response = await api.put(`/bands/${bandId}`, bandData);
  return response.data;
};

export const removeBandMember = async (bandId, memberId, userId) => {
  const response = await api.delete(`/bands/${userId}/${bandId}/${memberId}`);
  return response.data;
};

