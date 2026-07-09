import api from './api';

export const rescueService = {
  getStats: () => api.get('/rescues/stats'),
  getAll: (params) => api.get('/rescues', { params }),
  getById: (id) => api.get(`/rescues/${id}`),
  getMine: () => api.get('/rescues/my'),

  // Volunteer only
  getAvailable: () => api.get('/rescues/available'),
  getAssigned: () => api.get('/rescues/assigned'),
  accept: (id) => api.post(`/rescues/${id}/accept`),
  updateStatus: (id, status) => api.patch(`/rescues/${id}/status`, { status }),
};