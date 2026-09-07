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

export default liff;
