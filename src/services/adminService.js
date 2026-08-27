import api from '@/utils/api';

export default {
  async getMe() {
    const res = await api.get('/api/admin/me');
    return res.data;
  },

  async updatePassword(payload) {
    const res = await api.put('/api/admin/me/password', payload);
    return res.data;
  },

  async getAdminUsers() {
    const res = await api.get('/api/admin/users');
    return res.data;
  },

  async createAdminUser(payload) {
    const res = await api.post('/api/admin/users', payload);
    return res.data;
  },

  async updateUserPermissions(id, payload) {
    const res = await api.put(`/api/admin/users/${id}/permissions`, payload);
    return res.data;
  },

  async deleteAdminUser(id) {
    const res = await api.delete(`/api/admin/users/${id}`);
    return res.data;
  }
};
