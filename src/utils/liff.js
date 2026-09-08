import liff from '@line/liff';

let liffInitPromise = null;
let isInitialized = false;

/**
 * กำหนดและเริ่มกระบวนการ Initialize LINE LIFF SDK เพียงครั้งเดียวทั่วทั้งแอป (Singleton Promise)
 */
export async function initLiff() {
  if (isInitialized) {
    return liff;
  }

  if (liffInitPromise) {
    return liffInitPromise;
  }

  const liffId = import.meta.env.VITE_LINE_LIFF_ID || import.meta.env.VITE_LIFF_ID || '';

  if (!liffId) {
    console.warn('⚠️ ไม่พบ VITE_LINE_LIFF_ID ใน Environment Variables (ทำงานใน Standalone Dev Mode)');
    isInitialized = true;
    return liff;
  }

  liffInitPromise = (async () => {
    try {
      await liff.init({ liffId });
      isInitialized = true;
      return liff;
    } catch (error) {
      console.warn('⚠️ LIFF initialization failed or running in external browser:', error.message);
      isInitialized = true;
      return liff;
    }
  })();

  return liffInitPromise;
}

/**
 * ตรวจสอบว่าผู้ใช้ล็อกอินผ่าน LINE แล้วหรือไม่
 */
export function isLiffLoggedIn() {
  try {
    return isInitialized && liff.isLoggedIn();
  } catch {
    return false;
  }
}

/**
 * ดึง LINE ID Token สำหรับส่งไปยืนยันกับ Backend API
 */
export function getLiffIdToken() {
  try {
    if (isLiffLoggedIn()) {
      return liff.getIDToken() || null;
    }
  } catch (err) {
    console.warn('Could not get LIFF ID Token:', err.message);
  }
  return null;
}

/**
 * ดึงข้อมูลผู้ใช้จาก LINE Profile
 */
export async function getLiffProfile() {
  try {
    await initLiff();
    if (isLiffLoggedIn()) {
      return await liff.getProfile();
    }
  } catch (err) {
    console.warn('Could not get LINE Profile:', err.message);
  }
  return null;
}

/**
 * ดำเนินการเข้าสู่ระบบผ่าน LINE Login เพื่อ Verify ตัวตน หรือต่ออายุ Session ที่หมดอายุ
 */
export async function loginLiff(redirectUri) {
  try {
    await initLiff();
    const liffId = import.meta.env.VITE_LINE_LIFF_ID || import.meta.env.VITE_LIFF_ID || '';
    if (liffId && typeof liff.login === 'function') {
      const uri = redirectUri || (typeof window !== 'undefined' ? window.location.href : undefined);
      liff.login({ redirectUri: uri });
      return true;
    }
  } catch (err) {
    console.error('Failed to trigger liff.login():', err);
  }
  return false;
}

/**
 * ล็อกเอาต์ออกจาก LINE LIFF
 */
export function logoutLiff() {
  try {
    if (isLiffLoggedIn() && typeof liff.logout === 'function') {
      liff.logout();
    }
    localStorage.removeItem('dev_line_user_id');
  } catch (err) {
    console.warn('Error during liff.logout():', err);
  }
}

/**
 * ตรวจสอบว่าแอปกำลังทำงานอยู่ภายใน LINE App (In-App Browser/LIFF WebView) หรือไม่
 */
export function isInLiffClient() {
  try {
    return isInitialized && typeof liff.isInClient === 'function' && liff.isInClient();
  } catch {
    return false;
  }
}

/**
 * เปิด URL ใน External Browser (Safari บน iOS / Chrome บน Android)
 */
export function openExternalWindow(url) {
  try {
    if (typeof liff.openWindow === 'function') {
      liff.openWindow({ url, external: true });
      return true;
    }
  } catch (err) {
    console.warn('liff.openWindow failed:', err);
  }
  if (typeof window !== 'undefined') {
    window.open(url, '_blank');
  }
  return true;
}

export default liff;
