import api from '@/utils/api';

export default {
  async getRequests(params = {}) {
    const response = await api.get('/api/v1/maintenance-requests', { params });
    return response.data;
  },

  async createRequest(payload) {
    const response = await api.post('/api/v1/maintenance-requests', payload);
    return response.data;
  },

  async updateStatus(id, status, extraPayload = {}) {
    const response = await api.patch(`/api/v1/maintenance-requests/${id}`, { status, ...extraPayload });
    return response.data;
  },

  async deleteRequest(id) {
    const response = await api.delete(`/api/v1/maintenance-requests/${id}`);
    return response.data;
  }
};
