import api from './axios';

export const getMessages = async (bookingId) => {
  const response = await api.get(`/api/v1/chat/${bookingId}`);
  return response.data;
};
