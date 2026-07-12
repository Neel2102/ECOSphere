// EcoSphere - Social module API calls
import api from './api';

const socialService = {
  // CSR Activities
  listActivities: (params) =>
    api.get('/social/activities', { params }).then((r) => r.data.data),
  createActivity: (data) =>
    api.post('/social/activities', data).then((r) => r.data),
  updateActivity: (id, data) =>
    api.put(`/social/activities/${id}`, data).then((r) => r.data),
  deleteActivity: (id) =>
    api.delete(`/social/activities/${id}`).then((r) => r.data),
  joinActivity: (id) =>
    api.post(`/social/activities/${id}/join`).then((r) => r.data),

  // Participations
  listParticipations: (params) =>
    api.get('/social/participations', { params }).then((r) => r.data.data),
  approveParticipation: (id, data) =>
    api.patch(`/social/participations/${id}/approve`, data).then((r) => r.data),
  rejectParticipation: (id) =>
    api.patch(`/social/participations/${id}/reject`).then((r) => r.data),
  uploadProof: (id, formData) =>
    api.post(`/social/participations/${id}/proof`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }).then((r) => r.data),

  // Diversity
  getDiversity: () =>
    api.get('/social/diversity').then((r) => r.data.data),
};

export default socialService;
