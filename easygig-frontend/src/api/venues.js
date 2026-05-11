import api from './axios';

export const getVenuesByDirector = async (directorId) => {
  const response = await api.get(`/venues/director/${directorId}`);
  return response.data;
};

export const updateVenue = async (venueId, venueData) => {
  const response = await api.put(`/venues/${venueId}`, venueData);
  return response.data;
};

export const uploadVenuePhoto = async (venueId, file, isPrimary = false) => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('isPrimary', isPrimary);
  
  const response = await api.post(`/venues/${venueId}/photos`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

