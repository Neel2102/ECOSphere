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
};

export default userService;
