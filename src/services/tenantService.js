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
  },

  /**
   * สร้างรหัสเชื่อมต่อบัญชี LINE 6 หลัก สำหรับผู้เช่า Walk-in เดิม
   * @param {string} tenantId - UUID ผู้เช่า
   */
  async generateTenantInvite(tenantId) {
    const res = await api.post(`/api/admin/tenants/${tenantId}/generate-invite`);
    return res.data;
  },

  /**
   * รีเซ็ตรหัส PIN 6 หลักของผู้เช่า (บังคับให้ตั้งค่า PIN ใหม่เมื่อเปิด LIFF ครั้งถัดไป)
   * @param {string} tenantId - UUID ผู้เช่า
   */
  async resetTenantPin(tenantId) {
    const res = await api.post(`/api/admin/tenants/${tenantId}/reset-pin`);
    return res.data;
  },

  /**
   * ยกเลิกการผูกบัญชี LINE และล้างค่า PIN (เตะออกจากระบบเมื่อมือถือหาย/เปลี่ยนเครื่อง)
   * @param {string} tenantId - UUID ผู้เช่า
   */
  async unlinkTenantLine(tenantId) {
    const res = await api.post(`/api/admin/tenants/${tenantId}/unlink-line`);
    return res.data;
  }
};

