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

  async updateStatus(id, status) {
    const response = await api.patch(`/api/v1/maintenance-requests/${id}/status`, { status });
    return response.data;
  }
};
