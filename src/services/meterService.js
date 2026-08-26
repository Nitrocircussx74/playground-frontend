import api from '@/utils/api';

export default {
  async getMeterRecords(params = {}) {
    const response = await api.get('/api/v1/meter-records', { params });
    return response.data;
  },

  async createMeterRecord(payload) {
    const response = await api.post('/api/v1/meter-records', payload);
    return response.data;
  }
};
