import { describe, it, expect, beforeEach } from 'vitest';
import { isWebTenantNavigation } from './index';

// เดิมเช็คแค่ to.path === '/web/login' ทำให้หน้าที่ redirect ไปหลัง Login สำเร็จ (เช่น /liff/invoices)
// โดน Guard เด้งไปเปิด LINE App ทันที ทั้งที่เป็น Web Tenant ที่ไม่ใช้ LINE เลย
describe('isWebTenantNavigation', () => {
  beforeEach(() => {
    const store = new Map();
    global.localStorage = {
      getItem: (k) => store.get(k) ?? null,
      setItem: (k, v) => store.set(k, v),
      removeItem: (k) => store.delete(k)
    };
  });

  it('route แอดมินปกติ ไม่มี session ใดๆ -> false', () => {
    expect(isWebTenantNavigation({ path: '/dashboard', meta: {} }, { isWebTenant: false })).toBe(false);
  });

  it('/web/login เสมอเป็น web tenant route', () => {
    expect(isWebTenantNavigation({ path: '/web/login', meta: { isTenantWeb: true } }, { isWebTenant: false })).toBe(true);
  });

  it('/liff/invoices โดยไม่มี session ใดๆ -> false (ผู้ใช้ LINE จริงต้องยังโดนเด้งไป LINE ตามปกติ)', () => {
    expect(isWebTenantNavigation({ path: '/liff/invoices', meta: { isLiff: true } }, { isWebTenant: false })).toBe(false);
  });

  it('/liff/invoices ทันทีหลัง Login สำเร็จในเซสชันเดียวกัน (authStore.isWebTenant = true) -> true', () => {
    expect(isWebTenantNavigation({ path: '/liff/invoices', meta: { isLiff: true } }, { isWebTenant: true })).toBe(true);
  });

  it('/liff/invoices ตอน Refresh หน้าตรงๆ ขณะมี Token Web Tenant ใน localStorage -> true', () => {
    localStorage.setItem('horspace_tenant_token', 'fake-token');
    expect(isWebTenantNavigation({ path: '/liff/invoices', meta: { isLiff: true } }, { isWebTenant: false })).toBe(true);
  });
});
