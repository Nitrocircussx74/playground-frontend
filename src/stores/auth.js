import { defineStore } from 'pinia';
import authService from '@/services/authService';

export const useAuthStore = defineStore('auth', {
  state: () => ({
    // เก็บไว้ใน Memory (Pinia State) เท่านั้น ห้ามเก็บลง LocalStorage เด็ดขาด
    user: null,
    accessToken: null,
    isInitialized: false,
    isLiffReady: false,
    liffProfile: null,
    loading: false
  }),

  getters: {
    isAuthenticated: (state) => !!state.accessToken,
    currentUser: (state) => state.user,
    ready: (state) => state.isLiffReady
  },

  actions: {
    setAccessToken(token) {
      this.accessToken = token;
    },

    setUser(userData) {
      this.user = userData;
    },

    setLiffReady(ready, profile = null) {
      this.isLiffReady = ready;
      if (profile) {
        this.liffProfile = profile;
      }
    },

    clearAuth() {
      this.user = null;
      this.accessToken = null;
    },

    /**
     * Action เข้าสู่ระบบด้วย LINE Seamless PIN 6 หลัก
     */
    async loginPin(lineIdToken, pin) {
      this.loading = true;
      try {
        const data = await authService.loginPin(lineIdToken, pin);
        const token = data.accessToken || data.token;
        if (token) {
          this.setAccessToken(token);
          localStorage.setItem('liff_token', token);
        }
        if (data.user || data.tenant) {
          this.setUser(data.user || data.tenant);
        }
        return data;
      } finally {
        this.loading = false;
      }
    },

    /**
     * Action ตั้งค่าหรือเปลี่ยนรหัส PIN 6 หลัก
     */
    async setupPin(pin, lineIdToken = '') {
      this.loading = true;
      try {
        const data = await authService.setupPin({ pin, lineIdToken });
        return data;
      } finally {
        this.loading = false;
      }
    },

    /**
     * Action สำหรับเข้าสู่ระบบ
     */
    async login(email, password = 'password123') {
      this.loading = true;
      try {
        const data = await authService.login({ email, password });
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
     * Action สำหรับเข้าสู่ระบบด้วย LINE SSO ID Token
     */
    async loginLine(idToken) {
      this.loading = true;
      try {
        const data = await authService.loginLine(idToken);
        const token = data.accessToken || data.token;
        if (token) {
          this.setAccessToken(token);
          localStorage.setItem('liff_token', token);
        }
        if (data.user || data.tenant) {
          this.setUser(data.user || data.tenant);
        }
        return data;
      } finally {
        this.loading = false;
      }
    },

    /**
     * Action สำหรับเข้าสู่ระบบด้วยเบอร์โทรศัพท์และรหัสผ่าน (Local Password)
     */
    async loginLocal(phoneNumber, password) {
      this.loading = true;
      try {
        const data = await authService.loginLocal({ phoneNumber, password });
        const token = data.accessToken || data.token;
        if (token) {
          this.setAccessToken(token);
          localStorage.setItem('liff_token', token);
        }
        if (data.user || data.tenant) {
          this.setUser(data.user || data.tenant);
        }
        return data;
      } finally {
        this.loading = false;
      }
    },

    /**
     * Action สำหรับตั้งรหัสผ่านใหม่
     */
    async setupPassword(newPassword, oldPassword = '') {
      this.loading = true;
      try {
        const data = await authService.setupPassword({ newPassword, oldPassword });
        return data;
      } finally {
        this.loading = false;
      }
    },

    /**
     * Action ออกจากระบบ (Logout Logic ครอบคลุมทั้ง Web และ LIFF)
     */
    async logout() {
      this.loading = true;
      try {
        await authService.logout();
      } catch (error) {
        console.warn('Logout server request failed:', error);
      } finally {
        // 1. เคลียร์ State ใน Pinia และ LocalStorage
        this.clearAuth();
        if (typeof window !== 'undefined') {
          localStorage.removeItem('liff_token');
          localStorage.removeItem('dev_line_user_id');
        }

        // 2. ตรวจสอบ LINE LIFF SDK:
        // ข้อควรระวัง: คำสั่ง liff.logout() ใช้ได้เฉพาะบน External Browser เท่านั้น
        // หากทำงานใน LINE App (isInClient() === true) จะไม่มีการ logout LINE App session
        try {
          const liff = (await import('@line/liff')).default;
          if (typeof liff.isLoggedIn === 'function' && liff.isLoggedIn()) {
            if (typeof liff.isInClient === 'function' && !liff.isInClient()) {
              liff.logout();
            }
          }
        } catch (liffErr) {
          console.warn('LIFF logout check skipped:', liffErr);
        }

        this.loading = false;
      }
    }
  }
});
