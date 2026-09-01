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

      <!-- Standalone Dev Mode Selector (Bright, Beautiful Card) -->
      <div v-else-if="isStandaloneDevMode" class="p-6 bg-white/95 rounded-3xl border border-slate-200/90 space-y-4 text-left shadow-xl shadow-slate-200/60 backdrop-blur-md">
        <!-- Dev Mode Header Tag -->
        <div class="text-xs font-bold text-amber-800 bg-amber-50 border border-amber-200/80 px-3.5 py-2 rounded-2xl flex items-center gap-2 shadow-2xs">
          <span class="text-sm">🛠️</span>
          <span>โหมดทดสอบภายนอก LINE App (Standalone Mode)</span>
        </div>

        <!-- Dev / Connection Notice (Clean and bright) -->
        <div v-if="liffErrorMessage" class="p-3 bg-rose-50 border border-rose-200/80 rounded-2xl space-y-1">
          <p class="text-[11px] font-bold text-rose-700 flex items-center gap-1.5">
            <span>⚠️</span>
            <span>แจ้งเตือนสถานะ LINE LIFF SDK:</span>
          </p>
          <p class="text-[11px] text-rose-600 font-mono break-all">{{ liffErrorMessage }}</p>
          <p class="text-[10px] text-slate-500 pt-0.5">
            (เปิดทดสอบบนเบราว์เซอร์ปกติ สามารถเลือกเมนูเข้าใช้งานจำลองด้านล่างได้เลยครับ)
          </p>
        </div>

        <p class="text-xs text-slate-600 font-medium leading-relaxed">
          ตรวจพบการเปิดใช้งานผ่านเว็บบราวเซอร์ เลือกหน้าที่ต้องการทดสอบได้ทันที:
        </p>

        <!-- Navigation Buttons -->
        <div class="space-y-3 pt-1">
          <!-- Button 1: Profile Hub (Green Gradient) -->
          <button
            @click="goTo('/liff/profile')"
            class="w-full py-3.5 px-4 bg-gradient-to-r from-emerald-500 via-emerald-600 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white rounded-2xl text-xs font-bold transition-all shadow-md shadow-emerald-500/25 flex items-center justify-between cursor-pointer hover:scale-[1.01] active:scale-[0.99]"
          >
            <div class="flex items-center gap-2">
              <span class="w-2 h-2 rounded-full bg-white animate-pulse"></span>
              <span>สำหรับลูกบ้านที่ลงทะเบียนแล้ว (Profile Hub)</span>
            </div>
            <span class="text-base font-extrabold">➔</span>
          </button>

          <!-- Button 2: Register Invite (Purple Gradient) -->
          <button
            @click="goTo('/liff/register')"
            class="w-full py-3.5 px-4 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white rounded-2xl text-xs font-bold transition-all shadow-md shadow-purple-600/25 flex items-center justify-between cursor-pointer hover:scale-[1.01] active:scale-[0.99]"
          >
            <div class="flex items-center gap-2">
              <span>📝</span>
              <span>สำหรับผู้เช่าใหม่ (Register Invite)</span>
            </div>
            <span class="text-base font-extrabold">➔</span>
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
const liffErrorMessage = ref('');

const liffId = import.meta.env.VITE_LINE_LIFF_ID || import.meta.env.VITE_LIFF_ID || '';

onMounted(async () => {
  if (!liffId) {
    // ไม่ได้ตั้งค่า VITE_LIFF_ID เลย (เช่น รัน dev บนเครื่องโดยไม่ตั้ง .env) -> เข้าโหมดทดสอบตามปกติ ไม่ถือเป็น error
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

    statusText.value = 'กำลังตรวจสอบข้อมูลสัญญาเช่าหอพัก...';
    const res = await api.get('/api/v1/liff/check-status');

    if (res.data.isRegistered) {
      statusText.value = 'พบข้อมูลลูกบ้าน กำลังนำทางไปหน้าศูนย์กลางผู้เช่า...';
      router.replace('/liff/profile');
    } else {
      statusText.value = 'ยังไม่เคยลงทะเบียน กำลังนำทางไปหน้าลงทะเบียน...';
      router.replace('/liff/register');
    }
  } catch (err) {
    console.error('LIFF Smart Entry init error:', err);
    liffErrorMessage.value = err?.message || 'ไม่สามารถยืนยันตัวตน LIFF ในเบราว์เซอร์ปกติได้';
    loading.value = false;
    isStandaloneDevMode.value = true;
  }
});

const goTo = (path) => {
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
