import axios from 'axios';
import { useAuthStore } from '@/stores/auth';
import router from '@/router';

// 1. สร้าง Axios Instance พร้อมกำหนด withCredentials: true เสมอ
// เพื่อให้เบราว์เซอร์ส่งและรับ HTTP-Only Cookies (Refresh Token) อัตโนมัติ
const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000',
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
    const isAuthRoute =
      originalRequest.url.includes('/auth/login') ||
      originalRequest.url.includes('/auth/refresh');

    if (isAuthRoute) {
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
        `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000'}/auth/refresh`,
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
