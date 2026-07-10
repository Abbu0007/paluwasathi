import api from './api';

export const adminService = {
  getOverview: () => api.get('/admin/overview'),
  getActivity: () => api.get('/admin/activity'),

  getUsers: (params) => api.get('/admin/users', { params }),
  getUserDetail: (id) => api.get('/admin/users/' + id),
  updateUserRole: (id, role) => api.patch('/admin/users/' + id + '/role', { role }),
  toggleVerified: (id) => api.patch('/admin/users/' + id + '/verify'),
  deleteUser: (id) => api.delete('/admin/users/' + id),

  getCollection: (collection, params) =>
    api.get('/admin/collections/' + collection, { params }),
  updateStatus: (collection, id, status) =>
    api.patch('/admin/collections/' + collection + '/' + id + '/status', { status }),
  deleteDocument: (collection, id) =>
    api.delete('/admin/collections/' + collection + '/' + id),

  exportCsv: (collection) =>
    api.get('/admin/export/' + collection, { responseType: 'blob' }),
};

export const downloadCsv = async (collection) => {
  const res = await adminService.exportCsv(collection);
  const url = window.URL.createObjectURL(new Blob([res.data]));
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', 'paluwasathi-' + collection + '.csv');
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
};