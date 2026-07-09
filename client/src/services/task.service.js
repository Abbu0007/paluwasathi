import api from './api';

export const taskService = {
  getStats: () => api.get('/tasks/stats'),
  getAll: (params) => api.get('/tasks', { params }),
  getById: (id) => api.get('/tasks/' + id),
  getMine: () => api.get('/tasks/mine'),
  getNgoStats: () => api.get('/tasks/ngo/stats'),
  getSignups: (id) => api.get('/tasks/' + id + '/signups'),
  create: (formData) => api.post('/tasks', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
  update: (id, payload) => api.patch('/tasks/' + id, payload),
};

export const signupService = {
  create: (payload) => api.post('/signups', payload),
  getMine: () => api.get('/signups/my'),
  getById: (id) => api.get('/signups/' + id),
  cancel: (id) => api.patch('/signups/' + id + '/cancel'),
  markAttendance: (id, status, hoursLogged) =>
    api.patch('/signups/' + id + '/attendance', { status, hoursLogged }),
};