import api from './axios';

export const inviteMember = async (email, groupId, type, senderId) => {
  const response = await api.post(`/invitations/invite?email=${email}&groupId=${groupId}&type=${type}`, {}, {
    headers: { 'X-User-Id': senderId }
  });
  return response.data;
};

export const acceptInvitation = async (token, userId) => {
  const response = await api.post(`/invitations/accept?token=${token}&userId=${userId}`);
  return response.data;
};
