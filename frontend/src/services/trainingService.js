// EcoSphere - Training module API calls
import api from './api';

const trainingService = {
  // Courses
  listCourses: (params) =>
    api.get('/social/training/courses', { params }).then((r) => r.data.data),
  getCourse: (id) =>
    api.get(`/social/training/courses/${id}`).then((r) => r.data.data),
  createCourse: (data) =>
    api.post('/social/training/courses', data).then((r) => r.data),
  updateCourse: (id, data) =>
    api.put(`/social/training/courses/${id}`, data).then((r) => r.data),
  deleteCourse: (id) =>
    api.delete(`/social/training/courses/${id}`).then((r) => r.data),

  // Records
  listRecords: (params) =>
    api.get('/social/training/records', { params }).then((r) => r.data.data),
  getRecord: (id) =>
    api.get(`/social/training/records/${id}`).then((r) => r.data.data),
  createRecord: (data) =>
    api.post('/social/training/records', data).then((r) => r.data),
  updateRecord: (id, data) =>
    api.put(`/social/training/records/${id}`, data).then((r) => r.data),
  deleteRecord: (id) =>
    api.delete(`/social/training/records/${id}`).then((r) => r.data),

  // Stats
  getStats: () =>
    api.get('/social/training/stats').then((r) => r.data.data),
};

export default trainingService;
