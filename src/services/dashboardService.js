import api from '@/utils/api';

export default {
  async getSummary(params = {}) {
    const response = await api.get('/api/v1/dashboard/summary', { params });
    return response.data;
  },

  async getRevenueTrend(params = {}) {
    const response = await api.get('/api/v1/dashboard/trend', { params });
    return response.data;
  },

  async remindDebtors() {
    const response = await api.post('/api/v1/dashboard/remind-debtors');
    return response.data;
  },

  async downloadCsv(params = {}) {
    const response = await api.get('/api/v1/dashboard/export/csv', {
      params,
      responseType: 'blob'
    });
    return response.data;
  },

  async downloadPdf(params = {}) {
    const response = await api.get('/api/v1/dashboard/export/pdf', {
      params,
      responseType: 'blob'
    });
    return response.data;
  }
};
