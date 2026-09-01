import api from '@/utils/api';
import axios from 'axios';

const BASE_URL = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000').replace(/\/+$/, '');

export const authService = {
  /**
   * เข้าสู่ระบบด้วย Email
   * @param {Object} credentials - { email: string }
   */
  async login(credentials) {
    const response = await api.post('/auth/login', credentials);
    return response.data; // { success: true, accessToken, user }
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
