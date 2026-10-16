import api from '@/utils/api';

// ระบบแจ้งเตือน In-App (Bell) — ฝั่ง Admin CMS สโคปตามตึก, ฝั่ง Tenant LIFF สโคปตามผู้เช่าที่ login อยู่
export default {
  async getAdminNotifications(buildingId, { unread = false } = {}) {
    const res = await api.get(`/api/admin/buildings/${buildingId}/notifications`, { params: { unread: unread ? 1 : undefined } });
    return res.data;
  },
  async markAdminNotificationRead(buildingId, notifId) {
    const res = await api.patch(`/api/admin/buildings/${buildingId}/notifications/${notifId}/read`);
    return res.data;
  },
  async markAllAdminNotificationsRead(buildingId) {
    const res = await api.post(`/api/admin/buildings/${buildingId}/notifications/read-all`);
    return res.data;
  },

  async getTenantNotifications({ unread = false } = {}) {
    const res = await api.get('/api/v1/liff/notifications', { params: { unread: unread ? 1 : undefined } });
    return res.data;
  },
  async markTenantNotificationRead(id) {
    const res = await api.patch(`/api/v1/liff/notifications/${id}/read`);
    return res.data;
  },
  async markAllTenantNotificationsRead() {
    const res = await api.post('/api/v1/liff/notifications/read-all');
    return res.data;
  }
};
