import api from './api';

export const memberService = {
  getPublicProfile: async (memberId) => {
    const response = await api.get(`/members/${memberId}`);
    return response.data;
  },

  getMyProfile: async () => {
    const response = await api.get('/profile');
    return response.data;
  },

  updateProfile: async (data) => {
    const response = await api.put('/profile', data);
    return response.data;
  },

  uploadPhoto: async (file) => {
    const formData = new FormData();
    formData.append('photo', file);
    const response = await api.post('/profile/photo', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data;

  },

  getMyTasks: async (params) => {
    const response = await api.get('/tasks/my', { params });
    return response.data;
  }
};
