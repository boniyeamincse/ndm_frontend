import api from './api';

export const memberService = {
  getProfile: async (id) => {
    const response = await api.get(`/members/\${id}`);
    return response.data;
  },
  
  updateProfile: async (data) => {
    const response = await api.put('/member/profile', data);
    return response.data;
  },
  
  uploadPhoto: async (file) => {
    const formData = new FormData();
    formData.append('photo', file);
    const response = await api.post('/member/photo', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data;
  }
};
