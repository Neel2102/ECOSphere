import api from './api';

const userService = {
  async getProfile() {
    const { data } = await api.get('/profile');
    return data.data.user;
  },

  async updateProfile({ fullName, phone }) {
    const { data } = await api.put('/profile', { fullName, phone });
    return data.data.user;
  },

  async uploadProfileImage(file) {
    const formData = new FormData();
    formData.append('image', file);
    const { data } = await api.post('/profile/image', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return data.data.user;
  },

  // Admin / manager only.
  async listUsers() {
    const { data } = await api.get('/users');
    return data.data.users;
  },

  // Admin only: onboard a manager/employee (created verified, ready to log in).
  async createUser(payload) {
    const { data } = await api.post('/users', payload);
    return data.data.user;
  },

  // Admin only: change role / department / gender.
  async updateUser(id, payload) {
    const { data } = await api.patch(`/users/${id}`, payload);
    return data.data.user;
  },
};

export default userService;
