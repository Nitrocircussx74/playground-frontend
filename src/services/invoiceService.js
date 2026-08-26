import api from '@/utils/api';

export default {
  async getInvoices(params = {}) {
    const response = await api.get('/api/v1/invoices', { params });
    return response.data;
  },

  async createInvoice(payload) {
    const response = await api.post('/api/v1/invoices', payload);
    return response.data;
  },

  async uploadPaymentSlip(invoiceId, payload) {
    const response = await api.post(`/api/v1/invoices/${invoiceId}/payment-slips`, payload);
    return response.data;
  },

  async updateInvoiceStatus(invoiceId, payload) {
    const response = await api.patch(`/api/v1/invoices/${invoiceId}/status`, payload);
    return response.data;
  },

  async exportPdf(invoiceId) {
    const response = await api.get(`/api/v1/invoices/${invoiceId}/export`, {
      responseType: 'blob'
    });
    return response.data;
  }
};
