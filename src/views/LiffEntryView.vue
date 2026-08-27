<template>
  <div class="min-h-screen bg-slate-900 text-white flex flex-col items-center justify-center p-6 relative overflow-hidden font-sans">
    <!-- Background Branding Ornaments -->
    <div class="absolute -top-32 -left-32 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl"></div>
    <div class="absolute -bottom-32 -right-32 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl"></div>

    <div class="relative z-10 w-full max-w-sm text-center space-y-6">
      <!-- LINE Brand Header & Logo -->
      <div class="mx-auto w-20 h-20 rounded-3xl bg-gradient-to-tr from-emerald-500 to-teal-400 p-0.5 shadow-xl shadow-emerald-500/20 flex items-center justify-center animate-pulse">
        <div class="w-full h-full bg-slate-900 rounded-[22px] flex items-center justify-center text-3xl font-extrabold text-emerald-400">
          💬
        </div>
      </div>

      <div>
        <h1 class="text-xl font-extrabold tracking-tight text-white flex items-center justify-center gap-2">
          <span>ระบบจัดการหอพัก</span>
          <span class="px-2 py-0.5 text-[11px] font-bold bg-emerald-500/20 text-emerald-300 rounded-full border border-emerald-500/30 font-mono">LINE LIFF</span>
        </h1>
        <p class="text-xs text-slate-400 mt-1">กำลังตรวจสอบสถานะสิทธิ์การเข้าใช้งานของผู้เช่า...</p>
      </div>

      <!-- Loading Spinner Indicator -->
      <div v-if="loading" class="p-6 bg-slate-800/80 rounded-2xl border border-slate-700/80 backdrop-blur-md space-y-3 shadow-lg">
        <div class="w-8 h-8 border-3 border-emerald-400 border-t-transparent rounded-full animate-spin mx-auto"></div>
        <p class="text-xs font-semibold text-slate-300">{{ statusText }}</p>
      </div>

      <!-- Standalone Dev Mode Selector (For Testing outside LINE App) -->
      <div v-else-if="isStandaloneDevMode" class="p-5 bg-slate-800/90 rounded-2xl border border-slate-700 space-y-4 text-left shadow-xl">
        <div class="text-xs font-bold text-amber-400 flex items-center gap-1.5 border-b border-slate-700 pb-2">
          <span>🛠️</span>
          <span>โหมดทดสอบภายนอก LINE App (Standalone Dev Mode)</span>
        </div>
        <p class="text-xs text-slate-300 leading-relaxed">
          ตรวจพบว่าเปิดใช้งานผ่านเบราว์เซอร์ปกติ เลือกหน้าที่ต้องการทดสอบได้เลยครับ:
        </p>

        <div class="space-y-2.5">
          <button
            @click="goTo('/liff/profile')"
            class="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition-all flex items-center justify-between cursor-pointer"
          >
            <span>🟢 สำหรับลูกบ้านที่ลงทะเบียนแล้ว (Profile Hub)</span>
            <span>➔</span>
          </button>

          <button
            @click="goTo('/liff/register')"
            class="w-full py-2.5 px-4 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-xs font-bold transition-all flex items-center justify-between cursor-pointer"
          >
            <span>📝 สำหรับผู้เช่าใหม่ (Register Invite)</span>
            <span>➔</span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import liff from '@line/liff';
import api from '@/utils/api';

const router = useRouter();
const loading = ref(true);
const statusText = ref('กำลังเชื่อมต่อ LINE SDK...');
const isStandaloneDevMode = ref(false);

const liffId = import.meta.env.VITE_LIFF_ID || '';

onMounted(async () => {
  if (!liffId) {
    loading.value = false;
    isStandaloneDevMode.value = true;
    return;
  }

  try {
    statusText.value = 'กำลังยืนยันตัวตนบัญชี LINE...';
    await liff.init({ liffId });

    if (!liff.isLoggedIn()) {
      liff.login();
      return;
    }

    const profile = await liff.getProfile();
    const lineUserId = profile.userId;

    statusText.value = 'กำลังตรวจสอบข้อมูลสัญญาเช่าหอพัก...';
    const res = await api.get('/api/v1/liff/check-status', {
      params: { lineUserId }
    });

    if (res.data.isRegistered) {
      statusText.value = 'พบข้อมูลลูกบ้าน กำลังนำทางไปหน้าศูนย์กลางผู้เช่า...';
      router.replace('/liff/profile');
    } else {
      statusText.value = 'ยังไม่เคยลงทะเบียน กำลังนำทางไปหน้าลงทะเบียน...';
      router.replace('/liff/register');
    }
  } catch (err) {
    console.warn('LIFF Smart Entry init fallback:', err.message);
    loading.value = false;
    isStandaloneDevMode.value = true;
  }
});

const goTo = (path) => {
  router.push(path);
};
</script>
