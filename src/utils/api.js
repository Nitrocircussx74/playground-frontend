import axios from 'axios';
import liff from '@line/liff';
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

// ตัวแปรสำหรับจัดการ Silent Refresh และคิวของ Request กรณีโดน 401 พร้อมกันหลายตัว
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

// 2. Request Interceptor: แนบ Access Token ไปใน Header Authorization (Bearer)
api.interceptors.request.use(
  (config) => {
    const authStore = useAuthStore();
    if (authStore.accessToken) {
      config.headers.Authorization = `Bearer ${authStore.accessToken}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 2.1 Request Interceptor เฉพาะ LIFF: แนบ LINE ID Token ไปให้ Backend ตรวจสอบตัวตนจริง
// (แทนที่การส่ง lineUserId เองทาง Query/Body ซึ่งฝั่ง Client ปลอมแปลงได้)
api.interceptors.request.use(
  async (config) => {
    if (config.url && config.url.includes('/api/v1/liff')) {
      try {
        if (liff.isLoggedIn()) {
          const idToken = liff.getIDToken();
          if (idToken) {
            config.headers['X-Line-Id-Token'] = idToken;
          }
        }
      } catch {
        // LIFF ยังไม่ได้ liff.init() สำเร็จในหน้านี้ — ปล่อยให้ Request ไปโดยไม่มี Token
        // Backend จะตอบ 401 กลับมาเอง ดีกว่าปิดบัง error แบบเงียบ ๆ
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// 3. Response Interceptor: ดักจับ 401 Unauthorized และทำ Silent Refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // หากไม่มี response หรือ error ไม่ใช่ status 401 ให้ reject ต่อ
    if (!error.response || error.response.status !== 401) {
      return Promise.reject(error);
    }

    // ข้ามการทำ Silent Refresh สำหรับ Endpoint ที่ไม่จำเป็น (เช่น /auth/login หรือ /auth/refresh ที่ล้มเหลว)
    // และสำหรับ LIFF Endpoint ทั้งหมด เพราะใช้ LINE ID Token คนละระบบกับ CMS JWT
    // (ก่อนหน้านี้ 401 จาก LIFF จะหลุดไปเข้า Flow รีเฟรช Token ของ CMS แล้วพา router ไปหน้า /login ผิดที่)
    const isAuthRoute =
      originalRequest.url.includes('/auth/login') ||
      originalRequest.url.includes('/auth/refresh');
    const isLiffRoute = originalRequest.url.includes('/api/v1/liff');

    if (isAuthRoute || isLiffRoute) {
      return Promise.reject(error);
    }

    // หาก Request นี้เคย Retry แล้ว แต่ยังได้ 401 ให้หลุดออกเพื่อป้องกัน Infinite Loop
    if (originalRequest._retry) {
      return Promise.reject(error);
    }

    // หากกำลังทำการ Refresh Token อยู่ ให้นำ Request ใหม่นี้เข้าคิวรอ
    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        failedQueue.push({ resolve, reject });
      })
        .then((token) => {
          originalRequest.headers.Authorization = `Bearer ${token}`;
          return api(originalRequest);
        })
        .catch((err) => Promise.reject(err));
    }

    originalRequest._retry = true;
    isRefreshing = true;

    const authStore = useAuthStore();

    try {
      // ยิงย่อหน้าขอ Access Token ใหม่แบบ Silent Refresh ผ่าน HTTP-Only Cookie
      const response = await axios.post(
        `${cleanBaseUrl}/auth/refresh`,
        {},
        { withCredentials: true }
      );

      const newAccessToken = response.data.accessToken;

      // อัปเดต Token ใน Pinia Store (In-Memory)
      authStore.setAccessToken(newAccessToken);

      // แนบ Header Token ใหม่ให้ Request เดิม
      originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;

      // ปล่อย Request ที่ค้างอยู่ใน Queue ทั้งหมดพร้อมแนบ Token ใหม่
      processQueue(null, newAccessToken);

      // รัน Request เดิมซ้ำอีกครั้ง
      return api(originalRequest);
    } catch (refreshError) {
      // กรณี Refresh Token หมดอายุหรือ Cookie ถูก Revoke
      processQueue(refreshError, null);
      authStore.clearAuth();
      router.push('/login');
      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
  }
);

export default api;
