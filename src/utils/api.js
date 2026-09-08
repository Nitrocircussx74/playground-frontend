import axios from 'axios';
import { getLiffIdToken, initLiff, isLiffLoggedIn, loginLiff } from './liff';
import { useAuthStore } from '@/stores/auth';
import router from '@/router';

// 1. สร้าง Axios Instance พร้อมกำหนด withCredentials: true เสมอ
// เพื่อให้เบราว์เซอร์ส่งและรับ HTTP-Only Cookies (Refresh Token) อัตโนมัติ
const rawBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';
const cleanBaseUrl = rawBaseUrl.replace(/\/+$/, '');

const api = axios.create({
  baseURL: cleanBaseUrl,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json'
  }
});

// ==========================================
// 1. CMS Admin Token Refresh Queue & Lock
// ==========================================
let isCmsRefreshing = false;
let cmsFailedQueue = [];

const processCmsQueue = (error, token = null) => {
  cmsFailedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  cmsFailedQueue = [];
};

// ==========================================
// 2. LIFF Silent Re-Authentication Queue & Lock
// ==========================================
let isLiffRefreshing = false;
let liffFailedQueue = [];

const processLiffQueue = (error, token = null) => {
  liffFailedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  liffFailedQueue = [];
};

// ==========================================
// 3. Request Interceptors
// ==========================================

// 3.1 Attach JWT Access Token (Authorization: Bearer)
api.interceptors.request.use(
  (config) => {
    const authStore = useAuthStore();
    const liffToken = localStorage.getItem('liff_token');
    const token = authStore.accessToken || liffToken;

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// 3.2 Attach LINE ID Token for LIFF Endpoints
api.interceptors.request.use(
  async (config) => {
    const isLiff = config.url && (config.url.includes('/api/v1/liff') || config.url.includes('/api/liff'));
    if (isLiff) {
      try {
        const idToken = getLiffIdToken();
        if (idToken) {
          config.headers['X-Line-Id-Token'] = idToken;
        }

        // Attach lineUserId fallback for Standalone Dev Mode
        const devLineUserId = localStorage.getItem('dev_line_user_id');
        if (devLineUserId && !config.headers['X-Line-User-Id']) {
          config.headers['X-Line-User-Id'] = devLineUserId;
        }
      } catch {
        // Continue request even if token extraction fails
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ==========================================
// 4. Response Interceptor (Dual Silent Refresh)
// ==========================================
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // หากไม่มี response หรือ error ไม่ใช่ status 401 ให้ reject ต่อทันที
    if (!error.response || error.response.status !== 401 || !originalRequest) {
      return Promise.reject(error);
    }

    const url = originalRequest.url || '';
    const isLiffRoute = url.includes('/api/v1/liff') || url.includes('/api/liff');
    const isLiffSilentAuthRoute = url.includes('/auth/silent-login');
    const isCmsAuthRoute = url.includes('/auth/login') || url.includes('/auth/refresh');

    // ------------------------------------------------------------------------
    // CASE A: LIFF Silent Re-Authentication (สำหรับลูกบ้านใน LINE LIFF)
    // ------------------------------------------------------------------------
    if (isLiffRoute) {
      // หากเป็น silent-login เองที่ตอบ 401 ให้เข้า Fallback ทันที ป้องกัน Infinite Loop
      if (isLiffSilentAuthRoute) {
        const authStore = useAuthStore();
        authStore.clearAuth();
        localStorage.removeItem('liff_token');
        return Promise.reject(error);
      }

      // หาก Request นี้เคย Retry แล้วแต่ยังคงได้ 401 ให้ Fallback
      if (originalRequest._retry) {
        return Promise.reject(error);
      }

      // [QUEUEING SYSTEM]: หากกำลังทำการ Silent Re-Auth อยู่ ให้ Request อื่นเข้าคิวรอ Promise
      if (isLiffRefreshing) {
        return new Promise((resolve, reject) => {
          liffFailedQueue.push({ resolve, reject });
        })
          .then((newToken) => {
            originalRequest.headers.Authorization = `Bearer ${newToken}`;
            const idToken = getLiffIdToken();
            if (idToken) originalRequest.headers['X-Line-Id-Token'] = idToken;
            return api(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      // [LOCKING]: ล็อกไม่ให้ยิงขอ Silent Login ซ้ำซ้อน
      originalRequest._retry = true;
      isLiffRefreshing = true;

      try {
        await initLiff();
        const idToken = getLiffIdToken();

        // ยิง Silent Re-Auth API ขอ JWT ตัวใหม่จาก LINE ID Token
        const silentRes = await axios.post(
          `${cleanBaseUrl}/api/v1/liff/auth/silent-login`,
          { lineIdToken: idToken },
          {
            headers: {
              'Content-Type': 'application/json',
              ...(idToken ? { 'X-Line-Id-Token': idToken } : {})
            },
            withCredentials: true
          }
        );

        const newAccessToken = silentRes.data?.accessToken || silentRes.data?.token || silentRes.data?.data?.accessToken;
        if (!newAccessToken) {
          throw new Error('ไม่ได้รับ JWT Token ใหม่จากการต่ออายุเซสชัน LIFF');
        }

        // บันทึก Token ใหม่ลง Pinia Store และ LocalStorage
        const authStore = useAuthStore();
        authStore.setAccessToken(newAccessToken);
        if (silentRes.data?.data?.tenant) {
          authStore.setUser(silentRes.data.data.tenant);
        }
        localStorage.setItem('liff_token', newAccessToken);

        // อัปเดต Authorization Header ให้ Request เดิม
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        if (idToken) {
          originalRequest.headers['X-Line-Id-Token'] = idToken;
        }

        // ปล่อย Request ทุกตัวที่รออยู่ใน Queue ให้ทำงานต่อด้วย Token ใหม่
        processLiffQueue(null, newAccessToken);

        // ยิง Request เดิมซ้ำ (Retry)
        return api(originalRequest);
      } catch (refreshError) {
        // [FALLBACK / EDGE CASE]: ต่ออายุไม่สำเร็จ (เช่น เปลี่ยน LINE Account หรือสิทธิ์หลุด)
        processLiffQueue(refreshError, null);

        const authStore = useAuthStore();
        authStore.clearAuth();
        localStorage.removeItem('liff_token');
        localStorage.removeItem('dev_line_user_id');

        // หากทำงานอยู่ใน LINE App หรือรองรับ LINE Login ให้เปิด Consent / Re-Login
        if (typeof window !== 'undefined') {
          try {
            await loginLiff(window.location.href);
          } catch (loginErr) {
            console.warn('Fallback loginLiff error:', loginErr);
          }
        }

        return Promise.reject(refreshError);
      } finally {
        isLiffRefreshing = false;
      }
    }

    // ------------------------------------------------------------------------
    // CASE B: CMS Admin Silent Refresh (สำหรับผู้ดูแลระบบผ่าน Cookies)
    // ------------------------------------------------------------------------
    if (isCmsAuthRoute) {
      return Promise.reject(error);
    }

    if (originalRequest._retry) {
      return Promise.reject(error);
    }

    // [QUEUEING SYSTEM]: สำหรับ CMS Admin Request
    if (isCmsRefreshing) {
      return new Promise((resolve, reject) => {
        cmsFailedQueue.push({ resolve, reject });
      })
        .then((token) => {
          originalRequest.headers.Authorization = `Bearer ${token}`;
          return api(originalRequest);
        })
        .catch((err) => Promise.reject(err));
    }

    originalRequest._retry = true;
    isCmsRefreshing = true;

    const authStore = useAuthStore();

    try {
      // ขอ Access Token ใหม่ผ่าน HTTP-Only Cookie
      const response = await axios.post(
        `${cleanBaseUrl}/auth/refresh`,
        {},
        { withCredentials: true }
      );

      const newAccessToken = response.data?.accessToken;
      if (!newAccessToken) {
        throw new Error('No access token returned from CMS refresh');
      }

      authStore.setAccessToken(newAccessToken);
      originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;

      processCmsQueue(null, newAccessToken);

      return api(originalRequest);
    } catch (refreshError) {
      processCmsQueue(refreshError, null);
      authStore.clearAuth();
      router.push('/login');
      return Promise.reject(refreshError);
    } finally {
      isCmsRefreshing = false;
    }
  }
);

export default api;
