import api from './axios';

export const getCalendar = async (venueId, month, year) => {
  const response = await api.get(`/slots/calendar/${venueId}?month=${month}&year=${year}`);
  return response.data;
};

export const createSlot = async (slotData) => {
  const response = await api.post('/slots', slotData);
  return response.data;
};

export const deleteSlot = async (slotId) => {
  const response = await api.delete(`/slots/${slotId}`);
  return response.data;
};
export const getSlotsByVenueAndDate = async (venueId, date) => {
  const response = await api.get(`/slots/venue/${venueId}/date/${date}`);
  return response.data;
};

export const getSlotsByVenue = async (venueId) => {
  const response = await api.get(`/slots/venue/${venueId}`);
  return response.data;
};
