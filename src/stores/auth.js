import { defineStore } from 'pinia';
import authService from '@/services/authService';
import { initLiff, isLiffLoggedIn, getLiffIdToken } from '@/utils/liff';

export const useAuthStore = defineStore('auth', {
  state: () => ({
    // CMS Admin Authentication State (Memory-only)
    user: null,
    accessToken: null,
    isInitialized: false,

    // LIFF Tenant Authentication State (Memory-only เช่นกัน - ห้ามเก็บ Access Token ลง LocalStorage)
    tenant: null,
    liffToken: null,
    isLiffReady: false,
    liffProfile: null,
    loading: false
  }),

  getters: {
    isAuthenticated: (state) => !!state.accessToken,
    currentUser: (state) => state.user,
    currentTenant: (state) => state.tenant,
    isTenantAuthenticated: (state) => !!state.liffToken,
    ready: (state) => state.isLiffReady
  },

  actions: {
    // CMS Admin Actions
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

    // LIFF Tenant Actions
    setLiffAuth(token, tenantData = null) {
      // เก็บ Access Token ไว้ใน Memory (Pinia State) เท่านั้น ห้ามเขียนลง LocalStorage
      // เพราะเสี่ยงต่อการถูกขโมยผ่าน XSS - เมื่อรีเฟรชหน้าให้ใช้ restoreLiffSession() แทน
      this.liffToken = token;
      if (tenantData) {
        this.tenant = tenantData;
      }
    },

    setTenant(tenantData) {
      this.tenant = tenantData;
    },

    clearLiffAuth() {
      this.tenant = null;
      this.liffToken = null;
      if (typeof window !== 'undefined') {
        // ล้าง Token เก่าที่อาจตกค้างอยู่ใน LocalStorage จากเวอร์ชันก่อนหน้า (Migration Cleanup)
        localStorage.removeItem('liff_token');
      }
    },

    /**
     * กู้คืน Session ของลูกบ้านหลังรีเฟรชหน้า/เปิดแอปใหม่ โดยไม่ต้องพึ่ง LocalStorage
     * ใช้ LINE ID Token ที่ LIFF SDK เก็บ Session ไว้ให้เอง (ปลอดภัยกว่าเพราะควบคุมโดย LINE)
     * แลกเป็น Access Token ใหม่ผ่าน Silent Login ทุกครั้งที่ต้องใช้งาน
     * @returns {Promise<boolean>} true หากกู้คืน Session สำเร็จ
     */
    async restoreLiffSession() {
      if (this.liffToken) return true;

      try {
        await initLiff();
        if (!isLiffLoggedIn()) return false;

        const idToken = getLiffIdToken();
        if (!idToken) return false;

        const data = await authService.silentLoginLiff(idToken);
        const token = data?.accessToken || data?.token || data?.data?.accessToken;
        const tenantData = data?.data?.tenant || data?.tenant;

        if (token) {
          this.setLiffAuth(token, tenantData);
          return true;
        }
        return false;
      } catch (err) {
        console.warn('restoreLiffSession failed:', err?.message || err);
        return false;
      }
    },

    setLiffReady(ready, profile = null) {
      this.isLiffReady = ready;
      if (profile) {
        this.liffProfile = profile;
      }
    },

    /**
     * Action เข้าสู่ระบบด้วย LINE Seamless PIN 6 หลัก
     */
    async loginPin(lineIdToken, pin) {
      this.loading = true;
      try {
        const data = await authService.loginPin(lineIdToken, pin);
        const token = data.accessToken || data.token || data.data?.accessToken;
        const tenantData = data.user || data.tenant || data.data?.tenant || data.data?.user;
        if (token) {
          this.setLiffAuth(token, tenantData);
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
        const token = data.accessToken || data.token || data.data?.accessToken;
        const tenantData = data.user || data.tenant || data.data?.tenant;
        if (token) {
          this.setLiffAuth(token, tenantData);
        }
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
        const token = data.accessToken || data.token || data.data?.accessToken;
        const tenantData = data.user || data.tenant || data.data?.tenant || data.data?.user;
        if (token) {
          this.setLiffAuth(token, tenantData);
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
        const token = data.accessToken || data.token || data.data?.accessToken;
        const tenantData = data.user || data.tenant || data.data?.tenant || data.data?.user;
        if (token) {
          this.setLiffAuth(token, tenantData);
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
        this.clearLiffAuth();
        if (typeof window !== 'undefined') {
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
