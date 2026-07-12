// EcoSphere - Governance module API calls
import api from './api';

const governanceService = {
  // Policies
  listPolicies: (params) =>
    api.get('/governance/policies', { params }).then((r) => r.data.data),
  createPolicy: (data) =>
    api.post('/governance/policies', data).then((r) => r.data),
  updatePolicy: (id, data) =>
    api.put(`/governance/policies/${id}`, data).then((r) => r.data),
  deletePolicy: (id) =>
    api.delete(`/governance/policies/${id}`).then((r) => r.data),
  acknowledgePolicy: (id) =>
    api.post(`/governance/policies/${id}/acknowledge`).then((r) => r.data),

  // Acknowledgements
  listAcknowledgements: (params) =>
    api.get('/governance/acknowledgements', { params }).then((r) => r.data.data),
  sendReminder: () =>
    api.post('/governance/acknowledgements/remind').then((r) => r.data),

  // Audits
  listAudits: (params) =>
    api.get('/governance/audits', { params }).then((r) => r.data.data),
  createAudit: (data) =>
    api.post('/governance/audits', data).then((r) => r.data),
  updateAudit: (id, data) =>
    api.put(`/governance/audits/${id}`, data).then((r) => r.data),
  deleteAudit: (id) =>
    api.delete(`/governance/audits/${id}`).then((r) => r.data),

  // Compliance Issues
  listIssues: (params) =>
    api.get('/governance/issues', { params }).then((r) => r.data.data),
  createIssue: (data) =>
    api.post('/governance/issues', data).then((r) => r.data),
  updateIssue: (id, data) =>
    api.put(`/governance/issues/${id}`, data).then((r) => r.data),
  deleteIssue: (id) =>
    api.delete(`/governance/issues/${id}`).then((r) => r.data),
  flagOverdue: () =>
    api.post('/governance/issues/flag-overdue').then((r) => r.data),
};

export default governanceService;
