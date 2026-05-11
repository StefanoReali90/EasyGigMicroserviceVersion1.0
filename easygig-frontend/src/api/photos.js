import api from './axios';

export const getBandPhotos = async (bandId) => {
  const response = await api.get(`/photos/bands/${bandId}`);
  return response.data;
};

export const getVenuePhotos = async (venueId) => {
  const response = await api.get(`/photos/venues/${venueId}`);
  return response.data;
};

export const getOrgPhotos = async (orgId) => {
  const response = await api.get(`/photos/organizations/${orgId}`);
  return response.data;
};

export const uploadPhoto = async (type, id, file, isPrimary = false) => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('isPrimary', isPrimary);
  
  let endpoint = '';
  if (type === 'BAND') endpoint = `/photos/bands/${id}`;
  else if (type === 'VENUE') endpoint = `/photos/venues/${id}`;
  else if (type === 'ORG') endpoint = `/photos/organizations/${id}`;

  const response = await api.post(endpoint, formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
  return response.data;
};

export const deletePhoto = async (photoId) => {
  await api.delete(`/photos/${photoId}`);
};

export const setPrimaryPhoto = async (photoId) => {
  const response = await api.patch(`/photos/${photoId}/primary`);
  return response.data;
};
