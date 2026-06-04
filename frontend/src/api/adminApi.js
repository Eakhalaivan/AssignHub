import api from './axios';
export const getAllUsers        = ()           => api.get('/admin/users').then(r => r.data.data);
export const updateUserStatus  = (id, status) => api.put(`/admin/users/${id}/status`, { status });
export const getPendingWriters = ()            => api.get('/admin/writers/pending').then(r => r.data.data);
export const verifyWriter      = (id)          => api.put(`/admin/writers/${id}/verify`);
export const getAllOrders       = ()            => api.get('/admin/orders').then(r => r.data.data);
export const assignWriter      = (oid, wid)    => api.put(`/admin/orders/${oid}/assign`, { writerId: wid });
export const getAnalytics      = ()            => api.get('/admin/analytics/summary').then(r => r.data.data);
export const getRevenue        = ()            => api.get('/admin/analytics/revenue').then(r => r.data.data);

const adminApi = {
  getAllUsers,
  updateUserStatus,
  getPendingWriters,
  verifyWriter,
  approveWriter: verifyWriter, // alias
  getAllOrders,
  assignWriter,
  assignWriterToOrder: assignWriter, // alias
  getAnalytics,
  getDashboardStats: getAnalytics, // alias
  getRevenue,
};

export default adminApi;