import api from './api';

export const communityService = {
  getStats: () => api.get('/community/stats'),
  getTags: () => api.get('/community/tags'),
  getAll: (params) => api.get('/community', { params }),
  getById: (id) => api.get('/community/' + id),
  getMine: () => api.get('/community/my'),
  create: (formData) => api.post('/community', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
  toggleLike: (id) => api.post('/community/' + id + '/like'),
  addComment: (id, text) => api.post('/community/' + id + '/comments', { text }),
  deleteComment: (id, commentId) => api.delete('/community/' + id + '/comments/' + commentId),
  deletePost: (id) => api.delete('/community/' + id),
};