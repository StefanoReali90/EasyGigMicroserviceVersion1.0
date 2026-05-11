import api from './axios';

export const getBandTracks = async (bandId) => {
  const response = await api.get(`/tracks/bands/${bandId}`);
  return response.data;
};

export const getArtistTracks = async (userId) => {
  const response = await api.get(`/tracks/artists/${userId}`);
  return response.data;
};

export const uploadBandTrack = async (bandId, title, file) => {
  const formData = new FormData();
  formData.append('title', title);
  formData.append('file', file);
  const response = await api.post(`/tracks/bands/${bandId}/upload`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
  return response.data;
};

export const uploadArtistTrack = async (userId, title, file) => {
  const formData = new FormData();
  formData.append('title', title);
  formData.append('file', file);
  const response = await api.post(`/tracks/artists/${userId}/upload`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
  return response.data;
};

export const addExternalBandTrack = async (bandId, title, url) => {
  const response = await api.post(`/tracks/bands/${bandId}/external`, { title, url });
  return response.data;
};

export const addExternalArtistTrack = async (userId, title, url) => {
  const response = await api.post(`/tracks/artists/${userId}/external`, { title, url });
  return response.data;
};
