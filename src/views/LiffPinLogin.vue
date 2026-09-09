<template>
  <div class="w-full min-h-full flex flex-col justify-between items-center px-4 sm:px-6 py-2 sm:py-4 select-none font-sans max-w-md mx-auto">
    
    <!-- 1. Header: Avatar & Greeting -->
    <header class="w-full flex flex-col items-center pt-2 space-y-2 text-center shrink-0">
      <!-- Loading Skeleton ขณะรอ liff.init() -->
      <div v-if="!isLiffReady" class="flex flex-col items-center space-y-2 animate-pulse">
        <div class="w-14 h-14 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center">
          <div class="w-5 h-5 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
        <div class="h-3.5 w-24 bg-slate-200/80 rounded-full"></div>
      </div>

      <!-- เมื่อ LIFF Ready พร้อมแสดง Profile -->
      <div v-else class="flex flex-col items-center space-y-1.5">
        <div class="relative">
          <img
            v-if="profile?.pictureUrl"
            :src="profile.pictureUrl"
            :alt="profile.displayName || 'LINE User'"
            class="w-14 h-14 sm:w-16 sm:h-16 rounded-full object-cover border-2 border-emerald-400 shadow-sm ring-4 ring-emerald-50 transition-transform"
          />
          <div
            v-else
            class="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-emerald-500 text-white font-bold text-lg flex items-center justify-center shadow-sm ring-4 ring-emerald-50"
          >
            {{ userInitial }}
          </div>
          <span class="absolute bottom-0 right-0 w-3.5 h-3.5 bg-emerald-400 border-2 border-white rounded-full shadow-2xs" title="LINE Verified"></span>
        </div>

        <div class="space-y-0.5">
          <h1 class="text-base font-bold tracking-tight text-slate-800">
            ยินดีต้อนรับ, {{ profile?.displayName || 'ลูกบ้าน' }}
          </h1>
          <p class="text-xs text-slate-400 font-medium">
            กรุณากรอกรหัส PIN 6 หลักเพื่อเข้าใช้งาน
          </p>
        </div>
      </div>
    </header>

    <!-- 2. PIN Indicator Dots (6 จุด) -->
    <main class="w-full flex flex-col items-center my-auto py-4 shrink-0">
      <div
        class="flex items-center justify-center gap-3.5 py-1"
        :class="{ 'animate-shake': isShaking }"
      >
        <div
          v-for="index in 6"
          :key="index"
          class="w-3 h-3 sm:w-3.5 sm:h-3.5 rounded-full transition-all duration-200"
          :class="[
            index <= enteredPin.length
              ? 'bg-emerald-500 scale-110 shadow-sm shadow-emerald-300/40 ring-4 ring-emerald-100/70'
              : 'bg-slate-200/60 border border-slate-200'
          ]"
        ></div>
      </div>

      <!-- Feedback / Error Message -->
      <transition name="fade">
        <div v-if="errorMessage" class="text-xs font-semibold text-rose-500 mt-2 text-center h-5 flex items-center justify-center gap-1">
          <span>{{ errorMessage }}</span>
        </div>
        <div v-else-if="isLoading" class="text-xs font-medium text-emerald-600 mt-2 text-center h-5 flex items-center justify-center gap-1.5 animate-pulse">
          <span class="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping"></span>
          <span>กำลังตรวจสอบรหัส PIN...</span>
        </div>
        <div v-else class="h-5 mt-2"></div>
      </transition>
    </main>

    <!-- 3. Minimalist iOS-Style Numpad Grid (0-9, Clear, Backspace) -->
    <footer class="w-full pb-2 shrink-0">
      <div class="grid grid-cols-3 gap-y-2.5 sm:gap-y-3.5 gap-x-4 sm:gap-x-6 justify-items-center max-w-[260px] sm:max-w-[280px] mx-auto">
        <!-- แถวที่ 1 ถึง 3: ตัวเลข 1 ถึง 9 -->
        <button
          v-for="num in [1, 2, 3, 4, 5, 6, 7, 8, 9]"
          :key="num"
          type="button"
          :disabled="isLoading || !isLiffReady"
          @click="pressKey(num)"
          class="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-white hover:bg-slate-50 active:bg-slate-100 border border-slate-100 text-slate-700 text-xl font-semibold shadow-2xs transition-all duration-150 active:scale-95 flex items-center justify-center cursor-pointer disabled:opacity-40 touch-manipulation"
        >
          {{ num }}
        </button>

        <!-- แถวที่ 4: ปุ่มล้างค่า (Clear) -->
        <button
          type="button"
          :disabled="isLoading || enteredPin.length === 0"
          @click="clearPin"
          class="w-14 h-14 sm:w-16 sm:h-16 rounded-full flex items-center justify-center text-xs font-bold text-slate-400 hover:text-slate-600 active:scale-95 transition-all cursor-pointer disabled:opacity-0 touch-manipulation"
        >
          ล้าง
        </button>

        <!-- ตัวเลข 0 -->
        <button
          type="button"
          :disabled="isLoading || !isLiffReady"
          @click="pressKey(0)"
          class="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-white hover:bg-slate-50 active:bg-slate-100 border border-slate-100 text-slate-700 text-xl font-semibold shadow-2xs transition-all duration-150 active:scale-95 flex items-center justify-center cursor-pointer disabled:opacity-40 touch-manipulation"
        >
          0
        </button>

        <!-- ปุ่มลบทีละตัว (Backspace) -->
        <button
          type="button"
          :disabled="isLoading || enteredPin.length === 0"
          @click="deleteLastKey"
          class="w-14 h-14 sm:w-16 sm:h-16 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-600 active:scale-95 transition-all cursor-pointer disabled:opacity-30 touch-manipulation"
          aria-label="ลบตัวเลข"
        >
          <Delete class="w-5 h-5 sm:w-5.5 sm:h-5.5" />
        </button>
      </div>

      <!-- ตัวเลือกลืมรหัส PIN และสลับไปใช้การล็อกอินด้วยเบอร์โทร/รหัสผ่านปกติ -->
      <div class="flex flex-col items-center gap-2 pt-3 sm:pt-4">
        <button
          type="button"
          @click="handleForgotPin"
          class="text-xs font-semibold text-emerald-600 hover:text-emerald-700 hover:underline cursor-pointer transition-colors"
        >
          ลืมรหัส PIN?
        </button>
        <router-link
          to="/login"
          class="text-[11px] sm:text-xs font-medium text-slate-400 hover:text-slate-600 transition-colors"
        >
          เข้าสู่ระบบด้วยเบอร์โทรศัพท์ / รหัสผ่าน
        </router-link>
      </div>
    </footer>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, onUnmounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useAuthStore } from '@/stores/auth';
import { authService } from '@/services/authService';
import { initLiff, isLiffLoggedIn, getLiffProfile, getLiffIdToken } from '@/utils/liff';
import { showConfirm } from '@/utils/swal';
import { Delete } from 'lucide-vue-next';

const router = useRouter();
const route = useRoute();
const authStore = useAuthStore();

const enteredPin = ref('');
const profile = ref(null);
const isLiffReady = ref(false);
const isLoading = ref(false);
const isShaking = ref(false);
const errorMessage = ref('');

const userInitial = computed(() => {
  if (profile.value?.displayName && profile.value.displayName.trim()) {
    return profile.value.displayName.trim().charAt(0).toUpperCase();
  }
  return '👤';
});

const pressKey = (num) => {
  if (isLoading.value || enteredPin.value.length >= 6) return;
  errorMessage.value = '';
  enteredPin.value += String(num);
  triggerHaptic();
};

const deleteLastKey = () => {
  if (isLoading.value || enteredPin.value.length === 0) return;
  errorMessage.value = '';
  enteredPin.value = enteredPin.value.slice(0, -1);
  triggerHaptic();
};

const clearPin = () => {
  if (isLoading.value) return;
  enteredPin.value = '';
  errorMessage.value = '';
};

const triggerHaptic = (pattern = 25) => {
  if (typeof navigator !== 'undefined' && typeof navigator.vibrate === 'function') {
    try {
      navigator.vibrate(pattern);
    } catch {}
  }
};

/**
 * =======================================================================
 * Auto-Submit Logic: Composition API watch จับความยาว 6 ตัวอักษร
 * =======================================================================
 */
watch(enteredPin, async (newVal) => {
  if (newVal.length === 6 && !isLoading.value) {
    await submitPinLogin();
  }
});

const submitPinLogin = async () => {
  isLoading.value = true;
  errorMessage.value = '';

  try {
    // หมายเหตุ: Dev Fallback ใช้งานได้เฉพาะ Dev Build เท่านั้น (import.meta.env.DEV)
    // ห้ามมี Mock User ID ติดไปกับ Production Build เด็ดขาด เพราะเสี่ยงต่อการ Bypass การยืนยันตัวตน
    let idToken = getLiffIdToken();
    if (!idToken && import.meta.env.DEV && typeof window !== 'undefined') {
      idToken = localStorage.getItem('dev_line_user_id') || null;
    }

    const res = await authService.loginPin(idToken, enteredPin.value);
    
    if (res?.success) {
      triggerHaptic([30, 50, 30]);
      const token = res.accessToken || res.token || res.data?.accessToken;
      const tenantData = res.user || res.tenant || res.data?.tenant || res.data?.user;
      if (token) {
        authStore.setLiffAuth(token, tenantData);
      }

      const redirect = route.query.redirect || '/liff/profile';
      router.push(redirect);
    } else {
      triggerErrorFeedback(res?.message || 'รหัส PIN 6 หลักไม่ถูกต้อง');
    }
  } catch (err) {
    const msg = err.response?.data?.message || 'รหัส PIN 6 หลักไม่ถูกต้อง';
    triggerErrorFeedback(msg);
  } finally {
    isLoading.value = false;
  }
};

const triggerErrorFeedback = (msg) => {
  errorMessage.value = msg;
  isShaking.value = true;
  triggerHaptic([60, 40, 60]);

  setTimeout(() => {
    isShaking.value = false;
    enteredPin.value = '';
  }, 500);
};

const handleForgotPin = async () => {
  const confirmed = await showConfirm(
    'ลืมรหัส PIN?',
    'ต้องการตั้งรหัส PIN ใหม่ผ่านบัญชี LINE ของคุณใช่หรือไม่?',
    'ตั้งรหัส PIN ใหม่',
    'ยกเลิก'
  );

  if (confirmed) {
    router.push({
      path: '/liff/setup-pin',
      query: { mode: 'reset' }
    });
  }
};

const handleKeyDown = (e) => {
  if (isLoading.value) return;
  if (/^[0-9]$/.test(e.key)) {
    pressKey(Number(e.key));
  } else if (e.key === 'Backspace') {
    deleteLastKey();
  } else if (e.key === 'Escape') {
    clearPin();
  }
};

onMounted(async () => {
  if (typeof window !== 'undefined') {
    window.addEventListener('keydown', handleKeyDown);
  }

  try {
    await initLiff();
    if (isLiffLoggedIn()) {
      const userProfile = await getLiffProfile();
      profile.value = userProfile;
      authStore.setLiffReady(true, userProfile);
    } else if (typeof window !== 'undefined' && !window.navigator.userAgent.includes('Line/')) {
      profile.value = { displayName: 'ลูกบ้าน', pictureUrl: '' };
      authStore.setLiffReady(true, profile.value);
    }
  } catch (err) {
    console.warn('LIFF init in LiffPinLogin:', err.message);
    authStore.setLiffReady(true, { displayName: 'ลูกบ้าน' });
  } finally {
    isLiffReady.value = true;
  }
});

onUnmounted(() => {
  if (typeof window !== 'undefined') {
    window.removeEventListener('keydown', handleKeyDown);
  }
});
</script>

<style scoped>
@keyframes shake {
  0%, 100% {
    transform: translateX(0);
  }
  20%, 60% {
    transform: translateX(-6px);
  }
  40%, 80% {
    transform: translateX(6px);
  }
}

.animate-shake {
  animation: shake 0.45s cubic-bezier(0.36, 0.07, 0.19, 0.97) both;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.15s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
