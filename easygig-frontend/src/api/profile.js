import api from './axios';

export const createBandProfile = async (bandData) => {
  const response = await api.post('/bands/', bandData);
  return response.data;
};

export const createVenueProfile = async (venueData) => {
  const response = await api.post('/venues/', venueData);
  return response.data;
};

export const createOrganizationProfile = async (orgData) => {
  const response = await api.post('/organizations/', orgData);
  return response.data;
};

export const searchCities = async (name) => {
  const response = await api.get(`/cities/search?name=${name}`);
  return response.data;
};

export const searchBands = async (params) => {
  const query = new URLSearchParams(params).toString();
  const response = await api.get(`/bands/search?${query}`);
  return response.data;
};

export const getBandById = async (id) => {
  const response = await api.get(`/bands/${id}`);
  return response.data;
};

export const getVenueById = async (id) => {
  const response = await api.get(`/venues/${id}`);
  return response.data;
};

export const getOrganizationById = async (id) => {
  const response = await api.get(`/organizations/${id}`);
  return response.data;
};

export const getOrganizationsByUser = async (userId) => {
  const response = await api.get(`/organizations/user/${userId}`);
  return response.data;
};

export const searchVenues = async (params) => {
  const query = new URLSearchParams(params).toString();
  const response = await api.get(`/venues/search?${query}`);
  return response.data;
};

export const searchOrganizations = async (params) => {
  const query = new URLSearchParams(params).toString();
  const response = await api.get(`/organizations/search?${query}`);
  return response.data;
};

export const getGenres = async () => {
  const response = await api.get('/genres');
  return response.data;
};

export const createGenre = async (name) => {
  const response = await api.post('/genres', name, {
    headers: { 'Content-Type': 'text/plain' }
  });
  return response.data;
};

export const getUser = async (id) => {
  const response = await api.get(`/users/${id}`);
  return response.data;
};

export const updateUser = async (id, userData) => {
  const response = await api.put(`/users/${id}`, userData);
  return response.data;
};
