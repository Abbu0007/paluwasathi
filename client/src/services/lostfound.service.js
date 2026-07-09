import api from './api';

export const lostFoundService = {
  getStats: () => api.get('/lostfound/stats'),
  getAll: (params) => api.get('/lostfound', { params }),
  getById: (id) => api.get('/lostfound/' + id),
  getMatches: (id) => api.get('/lostfound/' + id + '/matches'),
  getMine: () => api.get('/lostfound/my'),
  create: (formData) => api.post('/lostfound', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
  markReunited: (id, matchedWithId) =>
    api.patch('/lostfound/' + id + '/reunited', { matchedWithId }),
  close: (id) => api.patch('/lostfound/' + id + '/close'),
};