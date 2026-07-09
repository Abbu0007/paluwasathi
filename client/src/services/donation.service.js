import api from './api';

export const campaignService = {
  getStats: () => api.get('/campaigns/stats'),
  getAll: (params) => api.get('/campaigns', { params }),
  getById: (id) => api.get('/campaigns/' + id),
  getNgos: () => api.get('/campaigns/ngos'),
  getNgoProfile: (id) => api.get('/campaigns/ngos/' + id),
  getMine: () => api.get('/campaigns/mine'),
  create: (formData) => api.post('/campaigns', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
  update: (id, payload) => api.patch('/campaigns/' + id, payload),
};

export const donationService = {
  initiate: (payload) => api.post('/donations/initiate', payload),
  confirm: (transactionId, success) =>
    api.post('/donations/confirm', { transactionId, success }),
  getById: (id) => api.get('/donations/' + id),
  getMine: () => api.get('/donations/my'),
  getNgoReceived: (params) => api.get('/donations/ngo/received', { params }),
  getNgoStats: () => api.get('/donations/ngo/stats'),
};