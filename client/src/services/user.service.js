import api from './api';

export const userService = {
  updateProfile: (formData) => api.patch('/users/profile', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
  removePhoto: () => api.delete('/users/profile/photo'),
  changePassword: (currentPassword, newPassword) =>
    api.patch('/users/password', { currentPassword, newPassword }),
  deleteAccount: (password, confirmation) =>
    api.delete('/users/account', { data: { password, confirmation } }),
  getPublicProfile: (id) => api.get('/users/' + id),
};