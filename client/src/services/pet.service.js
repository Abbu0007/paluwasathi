import api from './api';

export const petService = {
  getStats: () => api.get('/pets/stats'),
  getAll: (params) => api.get('/pets', { params }),
  getById: (id) => api.get(`/pets/${id}`),
  getSaved: () => api.get('/pets/saved'),
  save: (petId) => api.post(`/pets/${petId}/save`),
  unsave: (petId) => api.delete(`/pets/${petId}/save`),
};

export const adoptionService = {
  create: (payload) => api.post('/adoptions', payload),
  getMine: () => api.get('/adoptions/my'),
  getById: (id) => api.get(`/adoptions/${id}`),
  getPending: () => api.get('/adoptions/pending'),
  updateStatus: (id, status, reviewNote) =>
    api.patch(`/adoptions/${id}/status`, { status, reviewNote }),
};