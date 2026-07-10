import api from './api';

export const eventService = {
  getStats: () => api.get('/events/stats'),
  getAll: (params) => api.get('/events', { params }),
  getById: (id) => api.get('/events/' + id),
  getMine: () => api.get('/events/mine'),
  getNgoStats: () => api.get('/events/ngo/stats'),
  getAttendees: (id) => api.get('/events/' + id + '/attendees'),
  create: (formData) => api.post('/events', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
  update: (id, payload) => api.patch('/events/' + id, payload),
};

export const rsvpService = {
  create: (payload) => api.post('/rsvps', payload),
  getMine: () => api.get('/rsvps/my'),
  getById: (id) => api.get('/rsvps/' + id),
  cancel: (id) => api.patch('/rsvps/' + id + '/cancel'),
  markAttended: (id) => api.patch('/rsvps/' + id + '/attended'),
};