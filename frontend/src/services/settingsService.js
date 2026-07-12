// EcoSphere - Settings module API calls
import api from './api';

const settingsService = {
  // Departments
  listDepartments: () =>
    api.get('/settings/departments').then((r) => r.data.data),
  createDepartment: (data) =>
    api.post('/settings/departments', data).then((r) => r.data),
  updateDepartment: (id, data) =>
    api.put(`/settings/departments/${id}`, data).then((r) => r.data),
  deleteDepartment: (id) =>
    api.delete(`/settings/departments/${id}`).then((r) => r.data),

  // Categories
  listCategories: (params) =>
    api.get('/settings/categories', { params }).then((r) => r.data.data),
  createCategory: (data) =>
    api.post('/settings/categories', data).then((r) => r.data),
  updateCategory: (id, data) =>
    api.put(`/settings/categories/${id}`, data).then((r) => r.data),
  deleteCategory: (id) =>
    api.delete(`/settings/categories/${id}`).then((r) => r.data),

  // ESG Config
  getEsgConfig: () =>
    api.get('/settings/esg-config').then((r) => r.data.data),
  updateEsgConfig: (data) =>
    api.put('/settings/esg-config', data).then((r) => r.data),
};

export default settingsService;
