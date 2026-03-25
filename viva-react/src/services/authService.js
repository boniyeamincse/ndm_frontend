import api from './api';

export const authService = {
  login: async (credentials) => {
    const response = await api.post('/auth/login', credentials);
    if (response.data.access_token) {
      localStorage.setItem('token', response.data.access_token);
    }
    return response.data;
  },
  
  register: async (formData) => {
    const response = await api.post('/auth/register', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data;
  },
  
  logout: async () => {
    await api.post('/auth/logout');
    localStorage.removeItem('token');
  },
  
  me: async () => {
    const response = await api.get('/auth/me');
    return response.data.data;
  }
};
