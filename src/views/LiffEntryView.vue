<template>
  <div class="min-h-screen bg-gradient-to-b from-emerald-50/70 via-slate-50 to-white text-slate-800 flex flex-col items-center justify-center p-6 relative overflow-hidden font-sans">
    <!-- Ambient Light Background Ornaments -->
    <div class="absolute -top-32 -left-32 w-80 h-80 bg-emerald-300/20 rounded-full blur-3xl pointer-events-none"></div>
    <div class="absolute -bottom-32 -right-32 w-80 h-80 bg-purple-300/20 rounded-full blur-3xl pointer-events-none"></div>

    <div class="relative z-10 w-full max-w-sm text-center space-y-6">
      <!-- LINE Brand Header & Glowing Logo -->
      <div class="mx-auto w-20 h-20 rounded-3xl bg-gradient-to-tr from-emerald-500 to-teal-400 p-1 shadow-xl shadow-emerald-500/25 ring-4 ring-emerald-100 flex items-center justify-center animate-bounce-subtle">
        <div class="w-full h-full bg-white rounded-[22px] flex items-center justify-center text-3xl font-extrabold text-emerald-500 shadow-inner">
          💬
        </div>
      </div>

      <!-- App Title Header -->
      <div class="space-y-1.5">
        <div class="flex items-center justify-center gap-2">
          <h1 class="text-2xl font-extrabold tracking-tight text-slate-900">
            ระบบจัดการหอพัก
          </h1>
          <span class="px-2.5 py-0.5 text-[11px] font-extrabold bg-emerald-100 text-emerald-800 rounded-full border border-emerald-300/80 font-mono shadow-2xs">
            LINE LIFF
          </span>
        </div>
        <p class="text-xs text-slate-500 font-medium">
          ศูนย์บริการและตรวจสอบสถานะห้องพักสำหรับลูกบ้าน
        </p>
      </div>

      <!-- Loading Spinner Indicator (Light Theme) -->
      <div v-if="loading" class="p-6 bg-white/90 rounded-3xl border border-slate-200/90 backdrop-blur-md space-y-3 shadow-xl shadow-slate-200/60">
        <div class="w-9 h-9 border-3 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
        <p class="text-xs font-bold text-slate-700">{{ statusText }}</p>
      </div>

      <!-- Standalone / Session Expired Entry Card (Clean & Modern) -->
      <div v-else-if="isStandaloneDevMode" class="p-6 bg-white/95 rounded-3xl border border-slate-200/90 space-y-4 text-left shadow-xl shadow-slate-200/60 backdrop-blur-md">
        <!-- 1. Primary LINE Login Button -->
        <button
          @click="handleLineLogin('/liff/profile')"
          :disabled="isLoggingIn"
          class="w-full py-3.5 px-4 bg-[#06C755] hover:bg-[#05B34C] active:bg-[#049B42] text-white rounded-2xl text-xs font-bold transition-all shadow-md shadow-emerald-600/25 flex items-center justify-between cursor-pointer hover:scale-[1.01] active:scale-[0.99]"
        >
          <div class="flex items-center gap-2.5">
            <div class="w-6 h-6 rounded-full bg-white flex items-center justify-center text-xs font-black text-[#06C755] shadow-xs">
              💬
            </div>
            <div class="text-left font-bold">
              <div>{{ isLoggingIn ? 'กำลังเชื่อมต่อ LINE...' : 'เข้าสู่ระบบด้วย LINE' }}</div>
            </div>
          </div>
          <span class="text-base font-extrabold">➔</span>
        </button>

        <div class="relative flex py-1 items-center">
          <div class="flex-grow border-t border-slate-200"></div>
          <span class="flex-shrink mx-2 text-[10px] text-slate-400 font-bold uppercase">หรือ</span>
          <div class="flex-grow border-t border-slate-200"></div>
        </div>

        <!-- 2. Phone Verification Box -->
        <div class="p-4 bg-slate-50 border border-slate-200/80 rounded-2xl space-y-3">
          <div class="flex items-center justify-between text-xs font-bold text-slate-800">
            <div class="flex items-center gap-1.5">
              <span>📱</span>
              <span>ยืนยันด้วยเบอร์โทรศัพท์</span>
            </div>
          </div>

          <div class="space-y-2">
            <input
              v-model="verifyPhoneInput"
              type="tel"
              placeholder="กรอกเบอร์โทรศัพท์ เช่น 0898765432"
              class="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-xs font-mono font-bold text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
              @keyup.enter="handleVerifyByPhone"
            />
            <button
              @click="handleVerifyByPhone"
              :disabled="verifyingPhone || !verifyPhoneInput"
              class="w-full py-2.5 bg-slate-900 hover:bg-slate-800 active:bg-slate-950 text-white rounded-xl text-xs font-bold transition-all shadow-sm disabled:opacity-50 flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <span v-if="verifyingPhone" class="animate-spin w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full"></span>
              <span v-else>🔍</span>
              <span>{{ verifyingPhone ? 'กำลังค้นหาและผูกบัญชี...' : 'เข้าสู่ระบบ' }}</span>
            </button>
          </div>
        </div>

        <!-- 3. Simple Footer Link for New Tenants -->
        <div class="pt-2 text-center">
          <button
            @click="goTo('/liff/register')"
            class="text-xs font-semibold text-emerald-600 hover:text-emerald-700 hover:underline inline-flex items-center gap-1 cursor-pointer transition-colors"
          >
            <span>📝</span>
            <span>ลงทะเบียนผู้เช่าใหม่ด้วยรหัสเชิญ</span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import liff, { initLiff, isLiffLoggedIn, loginLiff } from '@/utils/liff';
import api from '@/utils/api';

const router = useRouter();
const route = useRoute();
const loading = ref(true);
const isLoggingIn = ref(false);
const statusText = ref('กำลังเชื่อมต่อ LINE SDK...');
const isStandaloneDevMode = ref(false);
const liffErrorMessage = ref('');
const verifyPhoneInput = ref('');
const verifyingPhone = ref(false);

const handleVerifyByPhone = async () => {
  if (!verifyPhoneInput.value || !verifyPhoneInput.value.trim()) return;
  verifyingPhone.value = true;
  try {
    let profile = null;
    if (isLiffLoggedIn()) {
      try {
        profile = await liff.getProfile();
      } catch (err) {
        console.warn('Could not get LIFF profile:', err);
      }
    }

    const payload = {
      phone: verifyPhoneInput.value.trim(),
      lineDisplayName: profile?.displayName || null,
      linePictureUrl: profile?.pictureUrl || null,
      lineStatusMessage: profile?.statusMessage || null
    };

    const res = await api.post('/api/v1/liff/auth/verify-phone', payload);
    if (res.data?.success || res.data?.data) {
      router.push('/liff/profile');
    } else {
      router.push('/liff/profile');
    }
  } catch (err) {
    console.error('Verify phone error:', err);
    alert(err.response?.data?.message || 'ไม่พบข้อมูลลูกบ้านที่ตรงกับเบอร์โทรศัพท์นี้ กรุณาตรวจสอบเบอร์โทรศัพท์อีกครั้ง');
  } finally {
    verifyingPhone.value = false;
  }
};

onMounted(async () => {
  try {
    statusText.value = 'กำลังยืนยันตัวตนบัญชี LINE...';
    await initLiff();

    if (isLiffLoggedIn()) {
      statusText.value = 'กำลังตรวจสอบข้อมูลสัญญาเช่าหอพัก...';
      const res = await api.get('/api/v1/liff/check-status');

      // ตรวจสอบ Deep Link Target จาก query / liff.state หรือ fallback ไปที่ /liff/profile
      const liffState = route.query['liff.state'] || (typeof window !== 'undefined' ? new URLSearchParams(window.location.search).get('liff.state') : null);
      const redirectQuery = route.query.redirect || route.query.path || route.query.target;
      let targetPath = '/liff/profile';

      if (liffState) {
        try {
          const decoded = decodeURIComponent(liffState);
          targetPath = decoded.startsWith('/liff') ? decoded : `/liff${decoded.startsWith('/') ? '' : '/'}${decoded}`;
        } catch {
          targetPath = '/liff/profile';
        }
      } else if (redirectQuery) {
        targetPath = redirectQuery.startsWith('/liff') ? redirectQuery : `/liff${redirectQuery.startsWith('/') ? '' : '/'}${redirectQuery}`;
      }

      if (res.data?.isRegistered) {
        statusText.value = 'พบข้อมูลลูกบ้าน กำลังเปิดหน้าบริการ...';
        router.replace(targetPath);
      } else {
        statusText.value = 'ยังไม่เคยลงทะเบียน กำลังนำทางไปหน้าลงทะเบียน...';
        router.replace('/liff/register');
      }
      return;
    }

    // หากเปิดใน LINE App แต่ยังไม่ได้ล็อกอิน ให้ login อัตโนมัติ
    if (typeof liff.isInClient === 'function' && liff.isInClient()) {
      liff.login();
      return;
    }

    // กรณีเปิดบนเบราว์เซอร์ภายนอก (Standalone Mode / Session Expired)
    loading.value = false;
    isStandaloneDevMode.value = true;
  } catch (err) {
    console.error('LIFF Smart Entry init error:', err);
    liffErrorMessage.value = err?.message || 'ไม่สามารถยืนยันตัวตน LIFF ในเบราว์เซอร์ปกติได้';
    loading.value = false;
    isStandaloneDevMode.value = true;
  }
});

const handleLineLogin = async (redirectPath = '/liff/profile') => {
  isLoggingIn.value = true;
  try {
    const liffId = import.meta.env.VITE_LINE_LIFF_ID || import.meta.env.VITE_LIFF_ID || '';
    if (liffId) {
      const targetUri = window.location.origin + redirectPath;
      await loginLiff(targetUri);
    } else {
      router.push(redirectPath);
    }
  } catch (err) {
    console.error('LINE Login error:', err);
    router.push(redirectPath);
  } finally {
    isLoggingIn.value = false;
  }
};

const goTo = async (path) => {
  // หากยังไม่ได้ล็อกอิน LINE และมี LIFF ID ให้ Verify/Login ผ่าน LINE ก่อน
  if (!isLiffLoggedIn()) {
    const liffId = import.meta.env.VITE_LINE_LIFF_ID || import.meta.env.VITE_LIFF_ID || '';
    if (liffId) {
      handleLineLogin(path);
      return;
    }
  }
  router.push(path);
};
</script>

<style scoped>
@keyframes bounceSubtle {
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-4px);
  }
}
.animate-bounce-subtle {
  animation: bounceSubtle 3s ease-in-out infinite;
}
</style>
