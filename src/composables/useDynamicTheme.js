import { ref, computed } from 'vue';
import api from '@/utils/api';
import { initLiff } from '@/utils/liff';

// Global singleton state so all components and layouts share the exact same active theme
const currentThemeColor = ref('#0E7490'); // HorHub Brand Teal (สีเดียวกับโลโก้)
const currentLogoUrl = ref(null);
const currentBuildingName = ref('หอพัก');
const currentBuildingId = ref(null);

/**
 * แปลง Hex Color (e.g. #3B82F6, #EF4444, #FFF) เป็น RGB Channels { r, g, b }
 */
export function hexToRgb(hex) {
  if (!hex || typeof hex !== 'string') {
    return { r: 14, g: 116, b: 144 };
  }

  let cleanHex = hex.replace('#', '').trim();
  if (cleanHex.length === 3) {
    cleanHex = cleanHex
      .split('')
      .map((c) => c + c)
      .join('');
  }

  if (cleanHex.length !== 6) {
    return { r: 14, g: 116, b: 144 };
  }

  const num = parseInt(cleanHex, 16);
  return {
    r: (num >> 16) & 255,
    g: (num >> 8) & 255,
    b: num & 255
  };
}

/**
 * แปลง Hex Color เป็น HSL { h, s, l } สำหรับ CSS Variables สไตล์ Shadcn UI
 */
export function hexToHsl(hex) {
  const { r, g, b } = hexToRgb(hex);
  const rNorm = r / 255;
  const gNorm = g / 255;
  const bNorm = b / 255;

  const max = Math.max(rNorm, gNorm, bNorm);
  const min = Math.min(rNorm, gNorm, bNorm);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case rNorm:
        h = (gNorm - bNorm) / d + (gNorm < bNorm ? 6 : 0);
        break;
      case gNorm:
        h = (bNorm - rNorm) / d + 2;
        break;
      case bNorm:
        h = (rNorm - gNorm) / d + 4;
        break;
    }
    h /= 6;
  }

  return {
    h: Math.round(h * 360 * 10) / 10,
    s: Math.round(s * 100 * 10) / 10,
    l: Math.round(l * 100 * 10) / 10
  };
}

/**
 * ปรับความสว่างของสี Hex (Lighten / Darken) สำหรับสร้างมิติและ Gradient
 */
export function adjustBrightness(hex, percent) {
  const { r, g, b } = hexToRgb(hex);
  const amount = Math.round((percent / 100) * 255);

  const clamp = (val) => Math.min(255, Math.max(0, val));
  const newR = clamp(r + amount).toString(16).padStart(2, '0');
  const newG = clamp(g + amount).toString(16).padStart(2, '0');
  const newB = clamp(b + amount).toString(16).padStart(2, '0');

  return `#${newR}${newG}${newB}`;
}

/**
 * Composable สำหรับจัดการ Dynamic Theming ประจำตึกในฝั่ง LIFF App
 */
export function useDynamicTheme() {
  /**
   * นำค่าสีและโลโก้ที่ได้จาก API มาประมวลผลและ Inject ลงใน :root ของเอกสาร
   */
  const applyTheme = (themeData = {}) => {
    const rawColor = themeData.themeColor || themeData.theme_color || '#0E7490';
    const logo = themeData.logoUrl || themeData.logo_url || null;
    const buildingName = themeData.buildingName || 'หอพัก';
    const buildingId = themeData.buildingId || null;

    // 1. คำนวณ RGB และ HSL Color Spaces
    const { r, g, b } = hexToRgb(rawColor);
    const hsl = hexToHsl(rawColor);
    const lightColor = adjustBrightness(rawColor, 20);
    const darkColor = adjustBrightness(rawColor, -20);

    // 2. อัปเดต CSS Variables ที่ :root (document.documentElement)
    if (typeof document !== 'undefined' && document.documentElement) {
      const root = document.documentElement;

      // Hex & RGB Values for Tailwind Opacity Support (<alpha-value>)
      root.style.setProperty('--theme-primary', rawColor);
      root.style.setProperty('--theme-primary-rgb', `${r} ${g} ${b}`);
      root.style.setProperty('--theme-primary-light', lightColor);
      root.style.setProperty('--theme-primary-dark', darkColor);

      // HSL Value for Shadcn/UI Compatibility
      root.style.setProperty('--primary', `${hsl.h} ${hsl.s}% ${hsl.l}%`);
      root.style.setProperty('--ring', `${hsl.h} ${hsl.s}% ${hsl.l}%`);
    }

    // 3. บันทึกค่าลง Reactive State
    currentThemeColor.value = rawColor;
    currentLogoUrl.value = logo;
    currentBuildingName.value = buildingName;
    currentBuildingId.value = buildingId;
  };

  /**
   * คืนค่าธีมกลับสู่ค่าเริ่มต้นของระบบ
   */
  const resetTheme = () => {
    applyTheme({
      themeColor: '#0E7490',
      logoUrl: null,
      buildingName: 'หอพัก',
      buildingId: null
    });
  };

  /**
   * ดึงข้อมูลโปรไฟล์ลูกบ้านและอัปเดตธีมอัตโนมัติจาก Backend
   */
  const fetchAndApplyTheme = async (params = {}) => {
    try {
      await initLiff();
      const res = await api.get('/api/v1/liff/profile', { params });
      if (res.data?.success && res.data?.data) {
        applyTheme(res.data.data);
        return res.data.data;
      }
    } catch (err) {
      console.warn('Could not auto-fetch building theme:', err.message);
    }
    return null;
  };

  /**
   * ดึงข้อมูลธีมสาธารณะของตึกโดยตรงผ่าน Building Code/ID (ใช้ตอน Onboarding/Register ก่อน Login)
   */
  const fetchAndApplyBuildingTheme = async (buildingParam) => {
    if (!buildingParam) return null;
    try {
      const res = await api.get('/api/v1/liff/building-info', {
        params: { building: buildingParam }
      });
      if (res.data?.success && res.data?.data) {
        applyTheme({
          themeColor: res.data.data.themeColor,
          logoUrl: res.data.data.logoUrl,
          buildingName: res.data.data.name,
          buildingId: res.data.data.id
        });
        return res.data.data;
      }
    } catch (err) {
      console.warn('Could not fetch building public theme:', err.message);
    }
    return null;
  };

  return {
    themeColor: computed(() => currentThemeColor.value),
    logoUrl: computed(() => currentLogoUrl.value),
    buildingName: computed(() => currentBuildingName.value),
    buildingId: computed(() => currentBuildingId.value),
    applyTheme,
    resetTheme,
    fetchAndApplyTheme,
    fetchAndApplyBuildingTheme,
    hexToRgb,
    hexToHsl,
    adjustBrightness
  };
}
