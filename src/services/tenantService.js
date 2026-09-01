import api from '@/utils/api';

export default {
  /**
   * ดึงข้อมูลผู้เช่ารายเดียวแบบจัดเต็ม 360-Degree View
   * @param {string} tenantId - UUID ผู้เช่า
   */
  async getTenantDetail(tenantId, params = {}) {
    const res = await api.get(`/api/admin/tenants/${tenantId}`, { params });
    return res.data;
  },

  /**
   * อัปเดตบันทึกภายใน (Internal Notes) และสถานะ Blacklist
   * @param {string} tenantId - UUID ผู้เช่า
   * @param {Object} payload - { internalNotes, isBlacklisted }
   */
  async updateTenantNotes(tenantId, payload) {
    const res = await api.patch(`/api/admin/tenants/${tenantId}/notes`, payload);
    return res.data;
  },

  /**
   * ดึงรายการผู้เช่าทั้งหมดในระบบ
   * @param {Object} params - ตัวกรองค้นหา
   */
  async getAllTenants(params = {}) {
    const res = await api.get('/api/admin/tenants', { params });
    return res.data;
  }
};
