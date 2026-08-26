import { defineStore } from 'pinia';

/**
 * Admin Auth Store: จัดการยืนยันตัวตนสำหรับผู้ดูแลหลังบ้าน (Username/Password & JWT)
 */
export const useAdminAuthStore = defineStore('adminAuth', {
  state: () => ({
    adminUser: null,
    accessToken: null,
    loading: false
  }),

  getters: {
    isAdminAuthenticated: (state) => !!state.accessToken
  },

  actions: {
    setAdminToken(token) {
      this.accessToken = token;
    },

    setAdminUser(user) {
      this.adminUser = user;
    },

    logout() {
      this.adminUser = null;
      this.accessToken = null;
    }
  }
});
