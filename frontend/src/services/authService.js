import api from './api';

const authService = {
  async signup(payload) {
    const { data } = await api.post('/auth/signup', payload);
    return data;
  },

  async verifyOtp(email, otp) {
    const { data } = await api.post('/auth/verify-otp', { email, otp });
    return data.data; // { token, user }
  },

  async resendOtp(email) {
    const { data } = await api.post('/auth/resend-otp', { email });
    return data;
  },

  async login(email, password, role) {
    const { data } = await api.post('/auth/login', { email, password, role });
    return data.data; // { token, user }
  },

  async forgotPassword(email) {
    const { data } = await api.post('/auth/forgot-password', { email });
    return data;
  },

  async verifyResetOtp(email, otp) {
    const { data } = await api.post('/auth/verify-reset-otp', { email, otp });
    return data.data; // { resetToken }
  },

  async resetPassword(payload) {
    const { data } = await api.post('/auth/reset-password', payload);
    return data;
  },

  async me() {
    const { data } = await api.get('/auth/me');
    return data.data.user;
  },
};

export default authService;
