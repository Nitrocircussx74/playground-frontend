import { ref } from 'vue';
import api from '@/utils/api';

const STORAGE_KEY = 'liff_read_announcement_ids';

const unreadCount = ref(0);
const latestUnreadAnnouncements = ref([]);
const announcements = ref([]);

function getReadIds() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function useAnnouncements() {
  const checkUnread = async (lineUserId = '') => {
    try {
      const params = {};
      if (lineUserId) params.lineUserId = lineUserId;
      const res = await api.get('/api/v1/liff/announcements', { params });
      const list = res.data?.data || [];
      announcements.value = list;
      const localReadIds = getReadIds();

      // รวม ID ที่อ่านแล้วทั้งจาก Database (item.isRead === true) และจาก LocalStorage
      const mergedReadIds = new Set(localReadIds);
      list.forEach((item) => {
        if (item.isRead) {
          mergedReadIds.add(item.id);
        }
      });
      localStorage.setItem(STORAGE_KEY, JSON.stringify(Array.from(mergedReadIds)));

      const unreadList = list.filter((item) => !item.isRead && !mergedReadIds.has(item.id));
      latestUnreadAnnouncements.value = unreadList;
      unreadCount.value = unreadList.length;
      return unreadList;
    } catch (e) {
      console.warn('Failed to check unread announcements:', e);
      return [];
    }
  };

  const markAsRead = async (id, lineUserId = '') => {
    if (!id) return;

    // 1. อัปเดตใน LocalStorage ทันที
    const readIds = getReadIds();
    if (!readIds.includes(id)) {
      readIds.push(id);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(readIds));
    }

    // 2. อัปเดต State ใน Memory ทันทีเพื่อให้ UI เปลี่ยนสถานะเป็น "อ่านแล้ว" ทันที
    const found = announcements.value.find((a) => a.id === id);
    if (found) {
      found.isRead = true;
      found.readAt = found.readAt || new Date().toISOString();
    }
    latestUnreadAnnouncements.value = latestUnreadAnnouncements.value.filter((item) => item.id !== id);
    unreadCount.value = latestUnreadAnnouncements.value.length;

    // 3. ส่งไปบันทึกลง Database ฝั่ง Server แบบ Background
    try {
      const payload = {};
      if (lineUserId) payload.lineUserId = lineUserId;
      await api.post(`/api/v1/liff/announcements/${id}/read`, payload);
    } catch (err) {
      console.warn(`Could not sync markAsRead for ${id} to server:`, err.message);
    }
  };

  const markAllAsRead = async (ids = [], lineUserId = '') => {
    const readIds = getReadIds();
    const targetIds = ids.length > 0 ? ids : announcements.value.map((a) => a.id);

    targetIds.forEach((id) => {
      if (!readIds.includes(id)) readIds.push(id);
    });
    localStorage.setItem(STORAGE_KEY, JSON.stringify(readIds));

    // อัปเดต State ใน Memory
    announcements.value.forEach((a) => {
      a.isRead = true;
      a.readAt = a.readAt || new Date().toISOString();
    });
    latestUnreadAnnouncements.value = [];
    unreadCount.value = 0;

    // ส่งไปบันทึก Server
    try {
      const payload = {};
      if (lineUserId) payload.lineUserId = lineUserId;
      await api.post('/api/v1/liff/announcements/read-all', payload);
    } catch (err) {
      console.warn('Could not sync markAllAsRead to server:', err.message);
    }
  };

  const isRead = (id) => {
    if (!id) return false;
    const found = announcements.value.find((a) => a.id === id);
    if (found && found.isRead) return true;
    return getReadIds().includes(id);
  };

  return {
    unreadCount,
    latestUnreadAnnouncements,
    announcements,
    checkUnread,
    markAsRead,
    markAllAsRead,
    isRead
  };
}

