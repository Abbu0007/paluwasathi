import api from './api';

export const authService = {
  register: (payload) => api.post('/auth/register', payload),
  verifyOtp: (userId, otp) => api.post('/auth/verify-otp', { userId, otp }),
  resendOtp: (userId) => api.post('/auth/resend-otp', { userId }),
  login: (emailOrPhone, password) => api.post('/auth/login', { emailOrPhone, password }),
  forgotPassword: (email) => api.post('/auth/forgot-password', { email }),
  verifyResetToken: (token) => api.get('/auth/reset-password/' + token),
  resetPassword: (token, password) => api.post('/auth/reset-password/' + token, { password }),
  getMe: () => api.get('/auth/me'),
};