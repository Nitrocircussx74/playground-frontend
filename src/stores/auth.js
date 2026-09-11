import { defineStore } from 'pinia';
import authService from '@/services/authService';
import { initLiff, isLiffLoggedIn, getLiffIdToken } from '@/utils/liff';

export const useAuthStore = defineStore('auth', {
  state: () => ({
    // CMS Admin Authentication State (Memory-only)
    user: null,
    accessToken: null,
    isInitialized: false,

    // LIFF & Web Portal Tenant Authentication State (แยกอิสระจาก CMS Admin)
    tenant: null,
    liffToken: null,
    isLiffReady: false,
    liffProfile: null,
    isWebTenant: false,
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
    // 🏢 CMS Admin Actions
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

    // 👤 LIFF & Web Tenant Actions (Isolated from CMS Admin)
    setLiffAuth(token, tenantData = null) {
      this.liffToken = token;
      if (tenantData) {
        this.tenant = tenantData;
      }
    },

    setTenantWebAuth(token, tenantData = null) {
      this.liffToken = token;
      this.isWebTenant = true;
      if (tenantData) {
        this.tenant = tenantData;
      }
      if (typeof window !== 'undefined') {
        localStorage.setItem('horhub_tenant_token', token);
        if (tenantData) {
          localStorage.setItem('horhub_tenant_data', JSON.stringify(tenantData));
        }
      }
    },

    setTenant(tenantData) {
      this.tenant = tenantData;
    },

    clearLiffAuth() {
      this.tenant = null;
      this.liffToken = null;
      this.isWebTenant = false;
      if (typeof window !== 'undefined') {
        localStorage.removeItem('liff_token');
        localStorage.removeItem('horhub_tenant_token');
        localStorage.removeItem('horhub_tenant_data');
      }
    },

    /**
     * กู้คืน Session ของลูกบ้าน (รองรับทั้ง LINE LIFF และ Web Portal)
     * @returns {Promise<boolean>} true หากกู้คืน Session สำเร็จ
     */
    async restoreLiffSession() {
      if (this.liffToken) return true;

      // 1. ตรวจสอบ Web Tenant Session ใน LocalStorage ก่อน
      if (typeof window !== 'undefined') {
        const storedTenantToken = localStorage.getItem('horhub_tenant_token');
        const storedTenantData = localStorage.getItem('horhub_tenant_data');
        if (storedTenantToken) {
          this.liffToken = storedTenantToken;
          this.isWebTenant = true;
          if (storedTenantData) {
            try {
              this.tenant = JSON.parse(storedTenantData);
            } catch {}
          }
          return true;
        }
      }

      // 2. ถ้าไม่มี Web Tenant ให้ลองกู้คืนผ่าน LINE LIFF Silent Login
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
     * Action ออกจากระบบสำหรับลูกบ้าน (Tenant Logout)
     * แยก Channel ชัดเจน: ถ้าเข้าผ่าน Web Portal จะจบเซสชันเว็บแล้วพาไป /web/login
     * ถ้าเข้าผ่าน LINE LIFF จะปิดหน้าต่าง LINE App หรือ logout LINE session
     */
    async logoutTenant() {
      this.loading = true;
      const wasWebTenant = this.isWebTenant;
      try {
        this.clearLiffAuth();
        if (typeof window !== 'undefined') {
          localStorage.removeItem('dev_line_user_id');
        }

        if (wasWebTenant) {
          return { channel: 'web', redirect: '/web/login' };
        } else {
          try {
            const liff = (await import('@line/liff')).default;
            if (typeof liff.isInClient === 'function' && liff.isInClient()) {
              if (typeof liff.closeWindow === 'function') {
                liff.closeWindow();
              }
              return { channel: 'line_client', closed: true };
            } else if (typeof liff.isLoggedIn === 'function' && liff.isLoggedIn()) {
              if (typeof liff.logout === 'function') {
                liff.logout();
              }
              return { channel: 'line_external', redirect: '/liff' };
            }
          } catch (liffErr) {
            console.warn('LIFF logout warning:', liffErr);
          }
          return { channel: 'line', redirect: '/liff' };
        }
      } finally {
        this.loading = false;
      }
    },

    /**
     * Action ออกจากระบบสำหรับ CMS Admin
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
