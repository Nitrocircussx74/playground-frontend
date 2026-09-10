import api from '@/utils/api';

export default {
  async getMaintenanceRequests(buildingId) {
    const params = buildingId ? { buildingId } : {};
    const response = await api.get('/api/v1/maintenance-requests', { params });
    return response.data;
  },

  async createMaintenanceRequest(payload) {
    const response = await api.post('/api/v1/maintenance-requests', payload);
    return response.data;
  },

  async updateMaintenanceRequest(id, payload) {
    const { status, ...extra } = payload || {};
    const response = await api.patch(`/api/v1/maintenance-requests/${id}`, { status, ...extra });
    return response.data;
  },

  async deleteMaintenanceRequest(id) {
    const response = await api.delete(`/api/v1/maintenance-requests/${id}`);
    return response.data;
  }
};
