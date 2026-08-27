import api from '@/utils/api';

export default {
  async getAuditLogs(params = {}) {
    const res = await api.get('/api/admin/audit-logs', { params });
    return res.data;
  }
};
