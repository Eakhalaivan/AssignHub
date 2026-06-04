import api from './axios';
export const getMyOrders   = ()       => api.get('/orders').then(r => r.data.data);
export const getOrderById  = (id)     => api.get(`/orders/${id}`).then(r => r.data.data);
export const createOrder   = (data)   => api.post('/orders', data);
export const cancelOrder   = (id)     => api.post(`/orders/${id}/cancel`);
export const getPricing    = (params) => api.get('/orders/pricing', { params }).then(r => r.data.data);
export const initiatePayment = (id, amount) => api.post('/payment/initiate', null, { params: { orderId: id, amount } }).then(r => r.data.data);
export const verifyPayment = (data)   => api.post('/payment/verify', data);
export const rateOrder     = (id, d)  => api.post(`/orders/${id}/rate`, d);
export const downloadInvoice = (id)   => api.get(`/orders/${id}/invoice`, { responseType: 'blob' });
export const updateOrderStatus = (id, status, details) => api.post(`/orders/${id}/paid`, details);

const orderApi = {
  getMyOrders,
  getOrders: getMyOrders, // alias to support my components
  getOrderById,
  createOrder,
  cancelOrder,
  getPricing,
  initiatePayment,
  verifyPayment,
  rateOrder,
  submitRating: rateOrder, // alias
  downloadInvoice,
  updateOrderStatus,
};

export default orderApi;