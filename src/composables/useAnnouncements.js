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
      const readIds = getReadIds();

      const unreadList = list.filter((item) => !readIds.includes(item.id));
      latestUnreadAnnouncements.value = unreadList;
      unreadCount.value = unreadList.length;
      return unreadList;
    } catch (e) {
      console.warn('Failed to check unread announcements:', e);
      return [];
    }
  };

  const markAsRead = (id) => {
    if (!id) return;
    const readIds = getReadIds();
    if (!readIds.includes(id)) {
      readIds.push(id);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(readIds));
    }
    latestUnreadAnnouncements.value = latestUnreadAnnouncements.value.filter((item) => item.id !== id);
    unreadCount.value = latestUnreadAnnouncements.value.length;
  };

  const markAllAsRead = (ids = []) => {
    const readIds = getReadIds();
    ids.forEach((id) => {
      if (!readIds.includes(id)) readIds.push(id);
    });
    localStorage.setItem(STORAGE_KEY, JSON.stringify(readIds));
    latestUnreadAnnouncements.value = [];
    unreadCount.value = 0;
  };

  const isRead = (id) => {
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

