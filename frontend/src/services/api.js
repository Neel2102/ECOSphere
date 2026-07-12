import axios from 'axios';

const baseURL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

const api = axios.create({ baseURL });

// Origin without the /api suffix, used to resolve uploaded file paths.
export const API_ORIGIN = baseURL.replace(/\/api\/?$/, '');

export const fileUrl = (relativePath) =>
  relativePath ? `${API_ORIGIN}/${relativePath}` : null;

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Normalize every failure into an Error with a user-facing message,
// plus the backend `code` (e.g. NOT_VERIFIED) and HTTP status when present.
api.interceptors.response.use(
  (response) => response,
  (err) => {
    const error = new Error(
      err.response?.data?.message || 'Cannot reach the server. Please try again.'
    );
    error.code = err.response?.data?.code;
    error.status = err.response?.status;
    return Promise.reject(error);
  }
);

export default api;
