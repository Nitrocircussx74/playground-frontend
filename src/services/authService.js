import api from '@/utils/api';
import axios from 'axios';

const BASE_URL = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000').replace(/\/+$/, '');

export const authService = {
  /**
   * เข้าสู่ระบบด้วย Email (Admin / CMS)
   * @param {Object} credentials - { email: string, password?: string }
   */
  async login(credentials) {
    const response = await api.post('/auth/login', credentials);
    return response.data; // { success: true, accessToken, user }
  },

  /**
   * เข้าสู่ระบบด้วย LINE SSO ID Token (LIFF / ลูกบ้าน)
   * @param {string} idToken
   */
  async loginLine(idToken) {
    const response = await api.post('/api/auth/login/line', { idToken });
    return response.data; // { success: true, accessToken, user, tenant }
  },

  /**
   * เข้าสู่ระบบด้วยเบอร์โทรศัพท์และรหัสผ่าน (Local Password)
   * @param {Object} credentials - { phoneNumber: string, password: string }
   */
  async loginLocal(credentials) {
    const response = await api.post('/api/auth/login/local', credentials);
    return response.data; // { success: true, accessToken, user, tenant }
  },

  /**
   * เข้าสู่ระบบด้วย LINE PIN 6 หลัก (LIFF Seamless PIN Auto-Login)
   * @param {string} lineIdToken
   * @param {string} pin
   */
  async loginPin(lineIdToken, pin) {
    const response = await api.post('/api/auth/liff/pin-login', { lineIdToken, pin });
    return response.data; // { success: true, accessToken, user, tenant }
  },

  /**
   * ตั้งค่าหรือเปลี่ยนรหัส PIN 6 หลัก
   * @param {Object} payload - { pin: string, lineIdToken?: string }
   */
  async setupPin(payload) {
    const response = await api.post('/api/auth/liff/setup-pin', payload);
    return response.data; // { success: true, message }
  },

  /**
   * ตั้งค่ารหัสผ่านใหม่หรือเปลี่ยนรหัสผ่าน
   * @param {Object} payload - { newPassword: string, oldPassword?: string }
   */
  async setupPassword(payload) {
    const response = await api.post('/api/auth/setup-password', payload);
    return response.data; // { success: true, message }
  },

  /**
   * ขอ Access Token ใหม่ด้วย HTTP-Only Refresh Token Cookie (Silent Refresh)
   */
  async refreshToken() {
    const response = await axios.post(
      `${BASE_URL}/auth/refresh`,
      {},
      { withCredentials: true }
    );
    return response.data; // { success: true, accessToken }
  },

  /**
   * ดึงข้อมูลโปรไฟล์ผู้ใช้ปัจจุบัน
   */
  async getProfile() {
    const response = await api.get('/auth/me');
    return response.data; // { success: true, user }
  },

  /**
   * ออกจากระบบ (ลบ Refresh Token ใน Server & ลบ Cookie)
   */
  async logout() {
    const response = await api.post('/auth/logout');
    return response.data; // { success: true, message }
  }
};

export default authService;
