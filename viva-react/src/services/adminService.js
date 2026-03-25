import api from './api';

export const adminService = {
  // ── Dashboard ─────────────────────────────────────────────────────
  getDashboardStats: () => api.get('/admin/dashboard/stats').then(r => r.data),
  getRecentActivity: () => api.get('/admin/dashboard/activity').then(r => r.data),

  // ── Members ───────────────────────────────────────────────────────
  getMembers:   (params)  => api.get('/admin/members',          { params }).then(r => r.data),
  getPending:   (params)  => api.get('/admin/members/pending',  { params }).then(r => r.data),
  getMember:    (id)      => api.get(`/admin/members/${id}`).then(r => r.data),
  approveMember:(id)      => api.post(`/admin/members/${id}/approve`).then(r => r.data),
  rejectMember: (id, reason) => api.post(`/admin/members/${id}/reject`, { reason }).then(r => r.data),
  suspendMember:(id, reason) => api.post(`/admin/members/${id}/suspend`, { reason }).then(r => r.data),
  expelMember:  (id, reason) => api.post(`/admin/members/${id}/expel`, { reason }).then(r => r.data),
  updateMember: (id, data)   => api.put(`/admin/members/${id}`, data).then(r => r.data),
  deleteMember: (id)      => api.delete(`/admin/members/${id}`).then(r => r.data),
  promoteRole:  (data)    => api.post('/admin/members/promote-role', data).then(r => r.data),
  getMemberDocuments: (id) => api.get(`/admin/members/${id}/documents`).then(r => r.data),

  // ── Tasks ─────────────────────────────────────────────────────────
  getTasks:     (params) => api.get('/admin/tasks',      { params }).then(r => r.data),
  createTask:   (data)   => api.post('/admin/tasks',      data).then(r => r.data),
  updateTask:   (id, d)  => api.put(`/admin/tasks/${id}`, d).then(r => r.data),
  deleteTask:   (id)     => api.delete(`/admin/tasks/${id}`).then(r => r.data),

  // ── Roles & Permissions ───────────────────────────────────────────
  getRoles:           ()      => api.get('/admin/roles').then(r => r.data),
  createRole:         (data)  => api.post('/admin/roles', data).then(r => r.data),
  updateRole:         (id, d) => api.put(`/admin/roles/${id}`, d).then(r => r.data),
  deleteRole:         (id)    => api.delete(`/admin/roles/${id}`).then(r => r.data),
  syncRolePermissions:(id, pids) => api.post(`/admin/roles/${id}/permissions`, { permission_ids: pids }).then(r => r.data),
  getPermissions:     ()      => api.get('/admin/permissions').then(r => r.data),
};

