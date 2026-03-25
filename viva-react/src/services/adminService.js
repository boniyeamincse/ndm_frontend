import api from './api';

export const adminService = {
  getDashboardStats: async () => {
    const response = await api.get('/admin/stats');
    return response.data;
  },
  
  getMembers: async (params) => {
    const response = await api.get('/admin/members', { params });
    return response.data;
  },
  
  approveMember: async (id) => {
    const response = await api.post(`/admin/members/\${id}/approve`);
    return response.data;
  }
};
