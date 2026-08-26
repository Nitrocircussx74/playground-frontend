import { defineStore } from 'pinia';
import authService from '@/services/authService';

export const useAuthStore = defineStore('auth', {
  state: () => ({
    // เก็บไว้ใน Memory (Pinia State) เท่านั้น ห้ามเก็บลง LocalStorage เด็ดขาด
    user: null,
    accessToken: null,
    isInitialized: false,
    loading: false
  }),

  getters: {
    isAuthenticated: (state) => !!state.accessToken,
    currentUser: (state) => state.user
  },

  actions: {
    setAccessToken(token) {
      this.accessToken = token;
    },

    setUser(userData) {
      this.user = userData;
    },

    clearAuth() {
      this.user = null;
      this.accessToken = null;
    },

    /**
     * Action สำหรับเข้าสู่ระบบ
     */
    async login(email) {
      this.loading = true;
      try {
        const data = await authService.login({ email });
        this.setAccessToken(data.accessToken);
        this.setUser(data.user);
        return data;
      } finally {
        this.loading = false;
      }
    },

    /**
     * Action ทำ Silent Refresh เพื่อขอ Access Token ใหม่เมื่อโหลดหน้าเว็บใหม่
     */
    async silentRefresh() {
      try {
        const data = await authService.refreshToken();
        this.setAccessToken(data.accessToken);

        // ดึงข้อมูล User Profile เพิ่มเติมหากยังไม่มีใน State
        if (!this.user) {
          await this.fetchProfile();
        }
        return true;
      } catch (error) {
        this.clearAuth();
        return false;
      } finally {
        this.isInitialized = true;
      }
    },

    /**
     * Action ดึงข้อมูล Profile ผู้ใช้ปัจจุบัน
     */
    async fetchProfile() {
      try {
        const data = await authService.getProfile();
        this.setUser(data.user);
        return data.user;
      } catch (error) {
        throw error;
      }
    },

    /**
     * Action ออกจากระบบ
     */
    async logout() {
      this.loading = true;
      try {
        await authService.logout();
      } catch (error) {
        console.warn('Logout server request failed:', error);
      } finally {
        this.clearAuth();
        this.loading = false;
      }
    }
  }
});
