// EcoSphere - Reports module API calls
import api, { API_ORIGIN } from './api';

const reportService = {
  // Fetch report data as JSON
  getReportJson: (type, params) =>
    api.get(`/reports/${type}`, { params }).then((r) => r.data.data?.report || r.data.data),

  // Get download URL directly for file attachments (CSV, XLSX, PDF)
  getReportDownloadUrl: (type, format, params = {}) => {
    const token = localStorage.getItem('token');
    const query = new URLSearchParams({ ...params, format, token }).toString();
    return `${API_ORIGIN}/api/reports/${type}?${query}`;
  },
};

export default reportService;
