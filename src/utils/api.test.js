import { describe, it, expect, vi, beforeEach } from 'vitest';
import axios from 'axios';

const authStore = {
  isWebTenant: true,
  liffToken: 'expired-token',
  accessToken: null,
  setTenantWebAuth: vi.fn((token) => {
    authStore.liffToken = token;
  }),
  clearLiffAuth: vi.fn()
};

vi.mock('@/stores/auth', () => ({ useAuthStore: () => authStore }));
vi.mock('@/router', () => ({ default: { push: vi.fn() } }));
vi.mock('./liff', () => ({
  getLiffIdToken: vi.fn(() => null),
  initLiff: vi.fn(() => Promise.reject(new Error('ไม่ควรเรียก LINE Silent Login สำหรับผู้เช่าเว็บ'))),
  isLiffLoggedIn: vi.fn(() => false),
  loginLiff: vi.fn()
}));

import api from './api';
import router from '@/router';
import { initLiff } from './liff';

// Adapter จำลอง Server: Token เก่าได้ 401, Token ใหม่ได้ 200
const stubServer = () => {
  api.defaults.adapter = async (config) => {
    if (config.headers.Authorization === 'Bearer expired-token') {
      const error = new Error('Unauthorized');
      error.config = config;
      error.response = { status: 401, data: {}, config };
      throw error;
    }
    return { data: { ok: true, auth: config.headers.Authorization }, status: 200, statusText: 'OK', headers: {}, config };
  };
};

describe('api interceptor: ต่ออายุเซสชันผู้เช่าเว็บ (ไม่ผ่าน LINE)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // สภาพแวดล้อมเทสต์ไม่มี localStorage (โค้ดจริงรันบนเบราว์เซอร์ที่มี)
    vi.stubGlobal('localStorage', { getItem: vi.fn(() => null), setItem: vi.fn(), removeItem: vi.fn() });
    authStore.isWebTenant = true;
    authStore.liffToken = 'expired-token';
    stubServer();
  });

  it('401 แล้วต่ออายุด้วย Refresh Cookie และยิง Request เดิมซ้ำด้วย Token ใหม่ (ไม่เรียก LINE Silent Login)', async () => {
    vi.spyOn(axios, 'post').mockResolvedValue({ data: { accessToken: 'fresh-token' } });

    const res = await api.get('/api/v1/liff/invoices/history');

    expect(axios.post).toHaveBeenCalledWith(expect.stringContaining('/auth/refresh'), {}, { withCredentials: true });
    expect(authStore.setTenantWebAuth).toHaveBeenCalledWith('fresh-token');
    expect(res.data.auth).toBe('Bearer fresh-token');
    expect(initLiff).not.toHaveBeenCalled();
  });

  it('ต่ออายุไม่สำเร็จ (Refresh Token หมดอายุ/ถูกเพิกถอน) ต้องล้าง Session และพากลับหน้าเข้าสู่ระบบเว็บ', async () => {
    vi.spyOn(axios, 'post').mockRejectedValue(new Error('401'));

    await expect(api.get('/api/v1/liff/invoices/history')).rejects.toThrow('401');
    expect(authStore.clearLiffAuth).toHaveBeenCalled();
    expect(router.push).toHaveBeenCalledWith(expect.objectContaining({ path: '/web/login' }));
  });
});
