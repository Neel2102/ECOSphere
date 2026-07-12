// EcoSphere - Dashboard KPI API calls
import api from './api';

const dashboardService = {
  getOverview: () => api.get('/dashboard/').then((r) => r.data.data),
  getScores: () => api.get('/dashboard/scores').then((r) => r.data.data),
  getScoreHistory: () => api.get('/dashboard/scores/history').then((r) => r.data.data),
};

export default dashboardService;
