import api from './axios';

export const getVenueRequests = async (venueId, status = 'PENDING') => {
  const response = await api.get(`/bookings/venue/${venueId}?status=${status}`);
  return response.data;
};

export const acceptRequest = async (requestId, userId) => {
  const response = await api.patch(`/bookings/${requestId}/accept`, {}, {
    headers: { 'X-User-Id': userId }
  });
  return response.data;
};

export const rejectRequest = async (requestId, userId) => {
  const response = await api.patch(`/bookings/${requestId}/reject`, {}, {
    headers: { 'X-User-Id': userId }
  });
  return response.data;
};

export const inviteArtist = async (venueId, artistId, slotId) => {
  const response = await api.post(`/bookings/invite?artistId=${artistId}&slotId=${slotId}`, {}, {
    headers: { 'X-User-Id': venueId }
  });
  return response.data;
};

export const getUserBookings = async (userId) => {
  const response = await api.get(`/bookings/user/${userId}`);
  return response.data;
};

export const createPromoterBooking = async (data) => {
  const response = await api.post('/bookings/promoter', data);
  return response.data;
};

export const assignBandToSlot = async (bookingId, data) => {
  const response = await api.patch(`/bookings/${bookingId}/assign-band`, data);
  return response.data;
};

/**
 * Cancellazione booking da parte dell'artista.
 * Può ricevere uno strike se la cancellazione avviene a meno di 48h dall'evento (Late Cancellation).
 * Backend endpoint: PATCH /bookings/{bookingId}/cancel-user
 */
export const cancelBookingByUser = async (userId, bookingId, reason) => {
  const response = await api.patch(
    `/bookings/${bookingId}/cancel-user`,
    { reason },
    { headers: { 'X-User-Id': userId } }
  );
  return response.data;
};

/**
 * Cancellazione booking da parte del direttore del locale.
 * Se il booking era già ACCEPTED, il locale riceve uno strike.
 */
export const cancelBookingByVenue = async (userId, bookingId, reason) => {
  const response = await api.patch(
    `/bookings/${bookingId}/cancel-venue`,
    { reason },
    { headers: { 'X-User-Id': userId } }
  );
  return response.data;
};

export const createRequest = async (data) => {
  const response = await api.post('/bookings', {
    slotId: data.slotId
  }, {
    headers: { 'X-User-Id': data.userId }
  });
  return response.data;
};

export const getSlotsByVenue = async (venueId) => {
  const response = await api.get(`/slots/venue/${venueId}`);
  return response.data;
};
