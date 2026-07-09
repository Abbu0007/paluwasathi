import api from './api';

export const petService = {
  getStats: () => api.get('/pets/stats'),
  getAll: (params) => api.get('/pets', { params }),
  getById: (id) => api.get(`/pets/${id}`),
  getSaved: () => api.get('/pets/saved'),
  getListed: () => api.get('/pets/listed'),
  save: (petId) => api.post(`/pets/${petId}/save`),
  unsave: (petId) => api.delete(`/pets/${petId}/save`),
  update: (id, payload) => api.patch(`/pets/${id}`, payload),
};

export const adoptionService = {
  create: (payload) => api.post('/adoptions', payload),
  getMine: () => api.get('/adoptions/my'),
  getById: (id) => api.get(`/adoptions/${id}`),
  getNgoApplications: (params) => api.get('/adoptions/ngo/applications', { params }),
  getNgoStats: () => api.get('/adoptions/ngo/stats'),
  updateStatus: (id, status, reviewNote) =>
    api.patch(`/adoptions/${id}/status`, { status, reviewNote }),
};