import api from './axios';

export const createReview = async (reviewData, userId) => {
  const response = await api.post('/reviews', reviewData, {
    headers: { 'X-User-Id': userId }
  });
  return response.data;
};
