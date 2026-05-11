import api from './axios';

export const getNotifications = async (userId) => {
  const response = await api.get(`/api/v1/notifications/user/${userId}`);
  return response.data;
};

export const getUnreadCount = async (userId) => {
  const response = await api.get(`/api/v1/notifications/user/${userId}/unread-count`);
  return response.data;
};

export const markAsRead = async (notificationId) => {
  await api.put(`/api/v1/notifications/${notificationId}/read`);
};

export const markAllAsRead = async (userId) => {
  await api.put(`/api/v1/notifications/user/${userId}/read-all`);
};
