import { defineStore } from 'pinia';

/**
 * LIFF Auth Store: จัดการเก็บข้อมูล LINE User Profile สำหรับผู้เช่าที่เปิดผ่าน LINE App
 */
export const useLiffAuthStore = defineStore('liffAuth', {
  state: () => ({
    lineUserId: null,
    displayName: '',
    pictureUrl: '',
    statusMessage: '',
    isLoggedIn: false,
    isInitialized: false,
    liffError: null
  }),

  actions: {
    /**
     * บันทึกข้อมูล LINE Profile จาก LIFF SDK
     */
    setLineProfile(profile) {
      this.lineUserId = profile.userId;
      this.displayName = profile.displayName;
      this.pictureUrl = profile.pictureUrl || '';
      this.statusMessage = profile.statusMessage || '';
      this.isLoggedIn = true;
    },

    setInitialized(status) {
      this.isInitialized = status;
    },

    setError(err) {
      this.liffError = err;
    },

    clearLiffAuth() {
      this.lineUserId = null;
      this.displayName = '';
      this.pictureUrl = '';
      this.statusMessage = '';
      this.isLoggedIn = false;
    }
  }
});
