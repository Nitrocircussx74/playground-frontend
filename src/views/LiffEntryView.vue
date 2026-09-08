<template>
  <div class="min-h-screen bg-gradient-to-b from-emerald-50/70 via-slate-50 to-white text-slate-800 flex flex-col items-center justify-center p-6 relative overflow-hidden font-sans">
    <!-- Ambient Light Background Ornaments -->
    <div class="absolute -top-32 -left-32 w-80 h-80 bg-emerald-300/20 rounded-full blur-3xl pointer-events-none"></div>
    <div class="absolute -bottom-32 -right-32 w-80 h-80 bg-purple-300/20 rounded-full blur-3xl pointer-events-none"></div>

    <div class="relative z-10 w-full max-w-sm text-center space-y-6">
      <!-- LINE Brand Header & Logo -->
      <div class="mx-auto w-20 h-20 rounded-3xl bg-[#06C755] p-3.5 shadow-xl shadow-emerald-500/25 ring-4 ring-emerald-100 flex items-center justify-center animate-bounce-subtle">
        <svg class="w-full h-full fill-current text-white" viewBox="0 0 24 24">
          <path d="M19.365 9.863c.349 0 .63.285.63.631 0 .345-.281.63-.63.63H17.61v1.125h1.755c.349 0 .63.283.63.63 0 .344-.281.629-.63.629h-2.386c-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.627-.63h2.386c.349 0 .63.285.63.63 0 .349-.281.63-.63.63H17.61v1.125h1.755zm-3.855 3.016c0 .27-.174.51-.432.596-.064.021-.133.031-.199.031-.211 0-.391-.09-.51-.25l-2.443-3.317v2.94c0 .344-.279.629-.631.629-.346 0-.626-.285-.626-.629V8.108c0-.27.173-.51.43-.595.06-.023.136-.033.194-.033.195 0 .375.104.477.254l2.486 3.37V8.108c0-.345.282-.63.63-.63.345 0 .624.285.624.63v4.771zm-5.741 0c0 .344-.282.629-.631.629-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.627-.63.349 0 .631.285.631.63v4.771zm-2.466.629H4.917c-.345 0-.63-.285-.63-.629V8.108c0-.345.285-.63.63-.63.348 0 .63.285.63.63v4.141h1.756c.348 0 .629.283.629.63 0 .344-.281.629-.629.629M24 10.314C24 4.943 18.615.572 12 .572S0 4.943 0 10.314c0 4.811 4.27 8.842 10.035 9.608.391.082.923.258 1.058.59.12.301.079.766.038 1.08l-.164 1.02c-.045.301-.24 1.186 1.049.645 1.291-.539 6.916-4.078 9.436-6.975C23.176 14.393 24 12.458 24 10.314" />
        </svg>
      </div>

      <!-- App Title Header -->
      <div class="space-y-1">
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

      <!-- 1. Loading Indicator (Initial Check) -->
      <div v-if="loading" class="p-6 bg-white/95 rounded-3xl border border-slate-200/90 backdrop-blur-md space-y-3 shadow-xl shadow-slate-200/60">
        <div class="w-9 h-9 border-3 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
        <p class="text-xs font-bold text-slate-700">{{ statusText }}</p>
      </div>

      <!-- 2. Phone Verification Form (For Unlinked Tenants) -->
      <div v-else-if="showPhoneVerifyForm" class="p-6 bg-white/95 rounded-3xl border border-slate-200/90 space-y-5 text-left shadow-xl shadow-slate-200/60 backdrop-blur-md">
        <!-- User Profile Greeting Tag -->
        <div v-if="lineProfile" class="flex items-center gap-3 p-3 bg-emerald-50/80 border border-emerald-200/80 rounded-2xl">
          <img
            v-if="lineProfile.pictureUrl"
            :src="lineProfile.pictureUrl"
            alt="LINE Avatar"
            class="w-10 h-10 rounded-full border border-emerald-300 shadow-xs object-cover"
          />
          <div v-else class="w-10 h-10 rounded-full bg-emerald-500 text-white font-bold flex items-center justify-center text-sm shadow-xs">
            👤
          </div>
          <div class="min-w-0 flex-1">
            <div class="text-[10px] text-emerald-700 font-bold uppercase tracking-wider">บัญชี LINE</div>
            <div class="text-xs font-extrabold text-slate-900 truncate">{{ lineProfile.displayName || 'ผู้ใช้งาน LINE' }}</div>
          </div>
        </div>

        <div class="space-y-1">
          <h2 class="text-sm font-extrabold text-slate-900">📱 ยืนยันเบอร์โทรศัพท์ลูกบ้าน</h2>
          <p class="text-[11px] text-slate-500">กรอกเบอร์โทรศัพท์ที่เคยลงทะเบียนไว้เพื่อเชื่อมต่อห้องพักอัตโนมัติ</p>
        </div>

        <!-- Phone Verification Input & Submit -->
        <form @submit.prevent="handleVerifyByPhone" class="space-y-3">
          <div>
            <input
              v-model="verifyPhoneInput"
              type="tel"
              maxlength="10"
              placeholder="กรอกเบอร์โทรศัพท์ เช่น 0898765432"
              required
              autofocus
              class="w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-2xl text-sm font-mono font-bold text-center tracking-widest text-slate-900 placeholder:text-slate-400 placeholder:font-normal focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500 transition-all"
            />
          </div>

          <!-- Error Alert Banner -->
          <div v-if="phoneErrorMessage" class="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-600 text-xs font-semibold flex items-center gap-1.5">
            <span>⚠️</span>
            <span>{{ phoneErrorMessage }}</span>
          </div>

          <!-- Submit Button -->
          <button
            type="submit"
            :disabled="verifyingPhone || !verifyPhoneInput"
            class="w-full py-3.5 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 active:from-emerald-700 active:to-teal-700 text-white rounded-2xl text-xs font-extrabold transition-all shadow-md shadow-emerald-500/25 disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer hover:scale-[1.01] active:scale-[0.99]"
          >
            <span v-if="verifyingPhone" class="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full"></span>
            <span v-else>✅</span>
            <span>{{ verifyingPhone ? 'กำลังค้นหาและผูกบัญชี...' : 'ยืนยันเบอร์ & เข้าสู่ห้องพัก' }}</span>
          </button>
        </form>

        <!-- Minimal Footer Link for Invite Code / Register -->
        <div class="pt-2 text-center border-t border-slate-100">
          <router-link
            to="/liff/register"
            class="text-[11px] font-semibold text-emerald-600 hover:text-emerald-700 hover:underline inline-flex items-center gap-1 transition-colors"
          >
            <span>📝</span>
            <span>สำหรับผู้เช่าใหม่ที่มีรหัสเชิญ (Invite Code)</span>
          </router-link>
        </div>
      </div>

      <!-- 3. LINE Login Prompt (When opened in external browser without LINE session) -->
      <div v-else class="p-6 bg-white/95 rounded-3xl border border-slate-200/90 space-y-4 text-center shadow-xl shadow-slate-200/60 backdrop-blur-md">
        <div class="space-y-1">
          <h2 class="text-sm font-extrabold text-slate-900">เข้าสู่ระบบด้วย LINE</h2>
          <p class="text-[11px] text-slate-500">กรุณาเข้าสู่ระบบผ่านบัญชี LINE เพื่อเริ่มต้นใช้งาน</p>
        </div>

        <button
          @click="handleLineLogin"
          :disabled="isLoggingIn"
          class="w-full py-3.5 px-4 bg-[#06C755] hover:bg-[#05B34C] active:bg-[#049B42] text-white rounded-2xl text-xs font-extrabold transition-all shadow-md shadow-emerald-600/30 flex items-center justify-center gap-2 cursor-pointer hover:scale-[1.01] active:scale-[0.99]"
        >
          <span class="text-base">💬</span>
          <span>{{ isLoggingIn ? 'กำลังเชื่อมต่อ LINE...' : 'เข้าสู่ระบบด้วย LINE' }}</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import liff, { initLiff, isLiffLoggedIn, loginLiff, getLiffProfile } from '@/utils/liff';
import api from '@/utils/api';
import { useAuthStore } from '@/stores/auth';
import { showSuccess } from '@/utils/swal';

const router = useRouter();
const route = useRoute();
const authStore = useAuthStore();

const loading = ref(true);
const statusText = ref('กำลังเชื่อมต่อ LINE SDK...');
const isLoggingIn = ref(false);
const showPhoneVerifyForm = ref(false);
const lineProfile = ref(null);
const verifyPhoneInput = ref('');
const verifyingPhone = ref(false);
const phoneErrorMessage = ref('');

onMounted(async () => {
  try {
    statusText.value = 'กำลังยืนยันตัวตนบัญชี LINE...';
    await initLiff();

    if (isLiffLoggedIn()) {
      statusText.value = 'กำลังตรวจสอบข้อมูลสัญญาเช่าหอพัก...';

      // 1. ดึง LINE Profile สดจาก LINE SDK
      lineProfile.value = await getLiffProfile();

      // 2. เช็คสถานะการผูกห้องพักและการตั้งค่า PIN ในฐานข้อมูล
      const idToken = getLiffIdToken() || localStorage.getItem('dev_line_user_id') || 'U_mock_tenant_user_1';
      let statusRes = null;
      try {
        statusRes = await authService.checkLiffStatus(idToken);
      } catch (e) {
        console.warn('Check status fallback:', e.message);
      }

      const isLinked = statusRes?.isLinked || statusRes?.isRegistered || statusRes?.data?.isLinked;
      const hasPin = statusRes?.hasPin || statusRes?.data?.hasPin;

      if (isLinked) {
        if (!hasPin) {
          // [CASE 1: ลูกบ้านยังไม่มี PIN] -> บังคับตั้ง PIN ครั้งแรก
          statusText.value = 'พบข้อมูลลูกบ้าน กำลังพาไปตั้งรหัส PIN ครั้งแรก...';
          router.replace('/liff/setup-pin');
        } else {
          // [CASE 2: ลูกบ้านมี PIN แล้ว] -> พาไปหน้ากรอก PIN Auto-Login
          statusText.value = 'พบข้อมูลลูกบ้าน กำลังเปิดหน้าระบุ PIN...';
          router.replace('/liff/pin-login');
        }
      } else {
        // [CASE 3: ลูกบ้านใหม่/ยังไม่เคยผูก] -> แสดงฟอร์มกรอกเบอร์โทรศัพท์
        loading.value = false;
        showPhoneVerifyForm.value = true;
      }
      return;
    }

    // หากเปิดใน LINE App แต่ยังไม่ได้ล็อกอิน ให้ login อัตโนมัติ
    if (typeof liff.isInClient === 'function' && liff.isInClient()) {
      liff.login();
      return;
    }

    // กรณีเปิดบนเบราว์เซอร์ภายนอก (Standalone Browser)
    loading.value = false;
  } catch (err) {
    console.error('LIFF Smart Entry init error:', err);
    loading.value = false;
  }
});

const handleVerifyByPhone = async () => {
  if (!verifyPhoneInput.value || !verifyPhoneInput.value.trim()) return;
  verifyingPhone.value = true;
  phoneErrorMessage.value = '';

  try {
    const payload = {
      phone: verifyPhoneInput.value.trim(),
      lineDisplayName: lineProfile.value?.displayName || null,
      linePictureUrl: lineProfile.value?.pictureUrl || null,
      lineStatusMessage: lineProfile.value?.statusMessage || null
    };

    const res = await api.post('/api/v1/liff/auth/verify-phone', payload);

    if (res.data?.success) {
      const accessToken = res.data.accessToken || res.data.data?.accessToken;
      if (accessToken) {
        authStore.setAccessToken(accessToken);
        localStorage.setItem('liff_token', accessToken);
      }
      if (res.data.data?.tenant) {
        authStore.setUser(res.data.data.tenant);
      }

      await showSuccess('ยืนยันตัวตนสำเร็จ! 🎉', res.data.message || 'เชื่อมต่อบัญชี LINE ของคุณกับห้องพักเรียบร้อยแล้ว');
      router.replace('/liff/profile');
    } else {
      router.replace('/liff/profile');
    }
  } catch (err) {
    console.error('Verify phone error:', err);
    phoneErrorMessage.value = err.response?.data?.message || 'ไม่พบข้อมูลลูกบ้านที่ตรงกับเบอร์โทรศัพท์นี้ กรุณาตรวจสอบเบอร์โทรศัพท์อีกครั้ง';
  } finally {
    verifyingPhone.value = false;
  }
};

const handleLineLogin = async () => {
  isLoggingIn.value = true;
  try {
    const liffId = import.meta.env.VITE_LINE_LIFF_ID || import.meta.env.VITE_LIFF_ID || '';
    if (liffId) {
      const targetUri = window.location.origin + '/liff/profile';
      await loginLiff(targetUri);
    } else {
      router.push('/liff/profile');
    }
  } catch (err) {
    console.error('LINE Login error:', err);
    router.push('/liff/profile');
  } finally {
    isLoggingIn.value = false;
  }
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
