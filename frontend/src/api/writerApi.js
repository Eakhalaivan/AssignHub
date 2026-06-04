import api from './axios';
export const getWriterProfile   = ()        => api.get('/writer/profile').then(r => r.data.data);
export const updateWriterProfile = (data)   => api.put('/writer/profile', data);
export const getAssignments     = ()        => api.get('/writer/assignments').then(r => r.data.data);
export const acceptAssignment   = (id)      => api.put(`/writer/assignments/${id}/accept`);
export const rejectAssignment   = (id)      => api.put(`/writer/assignments/${id}/reject`);
export const updateWorkStatus   = (id, s)   => api.put(`/writer/assignments/${id}/status`, { status: s });
export const uploadCompletedWork = (id, fd) => api.post(`/writer/assignments/${id}/upload`, fd, { headers: { 'Content-Type': 'multipart/form-data' } });
export const getEarnings        = ()        => api.get('/writer/earnings').then(r => r.data.data);
export const toggleAvailability = ()        => api.put('/writer/availability');

const writerApi = {
  getWriterProfile,
  updateWriterProfile,
  getAssignments,
  acceptAssignment,
  rejectAssignment,
  updateWorkStatus,
  uploadCompletedWork,
  uploadSubmission: uploadCompletedWork, // alias for my code
  getEarnings,
  toggleAvailability,
  updateAvailability: toggleAvailability, // alias
};

export default writerApi;