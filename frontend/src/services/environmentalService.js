// EcoSphere - Environmental module API calls
import api from './api';

const environmentalService = {
  // Emission Factors
  listEmissionFactors: (params) =>
    api.get('/environmental/emission-factors', { params }).then((r) => r.data.data),
  createEmissionFactor: (data) =>
    api.post('/environmental/emission-factors', data).then((r) => r.data),
  updateEmissionFactor: (id, data) =>
    api.put(`/environmental/emission-factors/${id}`, data).then((r) => r.data),
  deleteEmissionFactor: (id) =>
    api.delete(`/environmental/emission-factors/${id}`).then((r) => r.data),

  // Product ESG Profiles
  listProductProfiles: (params) =>
    api.get('/environmental/product-profiles', { params }).then((r) => r.data.data),
  createProductProfile: (data) =>
    api.post('/environmental/product-profiles', data).then((r) => r.data),
  updateProductProfile: (id, data) =>
    api.put(`/environmental/product-profiles/${id}`, data).then((r) => r.data),
  deleteProductProfile: (id) =>
    api.delete(`/environmental/product-profiles/${id}`).then((r) => r.data),

  // Environmental Goals
  listGoals: (params) =>
    api.get('/environmental/goals', { params }).then((r) => r.data.data),
  createGoal: (data) =>
    api.post('/environmental/goals', data).then((r) => r.data),
  updateGoal: (id, data) =>
    api.put(`/environmental/goals/${id}`, data).then((r) => r.data),
  deleteGoal: (id) =>
    api.delete(`/environmental/goals/${id}`).then((r) => r.data),

  // Carbon Transactions
  listCarbonTransactions: (params) =>
    api.get('/environmental/carbon-transactions', { params }).then((r) => r.data.data),
  getCarbonSummary: () =>
    api.get('/environmental/carbon-transactions/summary').then((r) => r.data.data),
  createCarbonTransaction: (data) =>
    api.post('/environmental/carbon-transactions', data).then((r) => r.data),
  updateCarbonTransaction: (id, data) =>
    api.put(`/environmental/carbon-transactions/${id}`, data).then((r) => r.data),
  deleteCarbonTransaction: (id) =>
    api.delete(`/environmental/carbon-transactions/${id}`).then((r) => r.data),

  // Dashboard Data
  getEnvironmentalDashboard: (params) =>
    api.get('/environmental/dashboard-data', { params }).then((r) => r.data.data),
};

export default environmentalService;
