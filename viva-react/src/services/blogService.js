import api from './api';

export const blogService = {
  getAdminPosts: async (params = {}) => {
    const response = await api.get('/admin/blog-posts', { params });
    return response.data?.data;
  },

  createPost: async (payload) => {
    const response = await api.post('/admin/blog-posts', payload);
    return response.data;
  },

  updatePost: async (id, payload) => {
    const response = await api.put(`/admin/blog-posts/${id}`, payload);
    return response.data;
  },

  deletePost: async (id) => {
    const response = await api.delete(`/admin/blog-posts/${id}`);
    return response.data;
  },

  getPublicNews: async (params = {}) => {
    const response = await api.get('/news', { params });
    return response.data?.data;
  },
};

export default blogService;
