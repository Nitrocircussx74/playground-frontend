<template>
  <div class="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between items-center p-6 select-none font-sans overflow-hidden">
    
    <!-- 1. Background Ambient Glow -->
    <div class="fixed inset-0 pointer-events-none overflow-hidden">
      <div class="absolute -top-40 -left-40 w-96 h-96 bg-indigo-600/15 rounded-full blur-3xl animate-pulse"></div>
      <div class="absolute -bottom-40 -right-40 w-96 h-96 bg-emerald-600/15 rounded-full blur-3xl"></div>
    </div>

    <!-- 2. Header & User Identity (ดึงจาก LINE Profile) -->
    <header class="w-full max-w-xs flex flex-col items-center pt-8 space-y-4 relative z-10">
      <!-- Loading Skeleton ขณะรอ liff.init() -->
      <div v-if="!isLiffReady" class="flex flex-col items-center space-y-3 animate-pulse">
        <div class="w-20 h-20 rounded-full bg-slate-800 border border-slate-700/60 shadow-lg flex items-center justify-center">
          <div class="w-8 h-8 rounded-full border-2 border-emerald-500 border-t-transparent animate-spin"></div>
        </div>
        <div class="h-4 w-32 bg-slate-800 rounded-full"></div>
        <div class="h-3 w-48 bg-slate-850 rounded-full"></div>
      </div>

      <!-- เมื่อ LIFF Ready พร้อมแสดง Profile -->
      <div v-else class="flex flex-col items-center text-center space-y-3">
        <div class="relative group">
          <img
            v-if="profile?.pictureUrl"
            :src="profile.pictureUrl"
            :alt="profile.displayName || 'LINE User'"
            class="w-20 h-20 rounded-full object-cover border-2 border-emerald-500/80 shadow-xl shadow-emerald-500/10 ring-4 ring-slate-900 transition-transform group-hover:scale-105"
          />
          <div
            v-else
            class="w-20 h-20 rounded-full bg-gradient-to-tr from-emerald-600 to-teal-500 text-white font-extrabold text-2xl flex items-center justify-center shadow-xl border-2 border-emerald-400/50 ring-4 ring-slate-900"
          >
            {{ userInitial }}
          </div>
          <span class="absolute bottom-0 right-0 w-5 h-5 bg-emerald-500 border-2 border-slate-950 rounded-full shadow-xs" title="LINE Verified"></span>
        </div>

        <div class="space-y-1">
          <h1 class="text-lg font-black tracking-tight text-white flex items-center justify-center gap-1.5">
            <span>ยินดีต้อนรับ, {{ profile?.displayName || 'ลูกบ้าน' }}</span>
          </h1>
          <p class="text-xs text-slate-400 font-medium">
            กรุณากรอกรหัส PIN 6 หลักเพื่อเข้าใช้งาน
          </p>
        </div>
      </div>
    </header>

    <!-- 3. PIN Indicator Dots (6 จุด พร้อม Animation สั่นเมื่อรหัสผิด) -->
    <main class="w-full max-w-xs flex flex-col items-center my-auto py-6 relative z-10">
      <div
        class="flex items-center justify-center gap-4 py-4"
        :class="{ 'animate-shake': isShaking }"
      >
        <div
          v-for="index in 6"
          :key="index"
          class="w-4 h-4 rounded-full transition-all duration-200"
          :class="[
            index <= enteredPin.length
              ? 'bg-emerald-400 scale-110 shadow-lg shadow-emerald-500/50 ring-4 ring-emerald-500/20'
              : 'bg-slate-800 border border-slate-700'
          ]"
        ></div>
      </div>

      <!-- Error Message Feedback -->
      <transition name="fade">
        <div v-if="errorMessage" class="text-xs font-semibold text-rose-400 mt-2 text-center h-5">
          {{ errorMessage }}
        </div>
        <div v-else-if="isLoading" class="text-xs font-semibold text-emerald-400 mt-2 text-center h-5 flex items-center justify-center gap-1.5 animate-pulse">
          <span class="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
          <span>กำลังตรวจสอบรหัส PIN...</span>
        </div>
      </transition>
    </main>

    <!-- 4. Tactile Numpad Grid (0-9, Backspace, Clear) -->
    <footer class="w-full max-w-xs pb-6 relative z-10">
      <div class="grid grid-cols-3 gap-y-4 gap-x-6 justify-items-center">
        <!-- แถวที่ 1-3: ตัวเลข 1 ถึง 9 -->
        <button
          v-for="num in [1, 2, 3, 4, 5, 6, 7, 8, 9]"
          :key="num"
          type="button"
          :disabled="isLoading || !isLiffReady"
          @click="pressKey(num)"
          class="w-18 h-18 rounded-full bg-slate-900/80 hover:bg-slate-800/90 active:bg-emerald-950/60 active:border-emerald-500/50 border border-slate-800 text-2xl font-bold text-slate-100 shadow-md transition-all duration-150 active:scale-90 flex items-center justify-center cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {{ num }}
        </button>

        <!-- แถวที่ 4: ปุ่มล้างค่า (Clear) -->
        <button
          type="button"
          :disabled="isLoading || enteredPin.length === 0"
          @click="clearPin"
          class="w-18 h-18 rounded-full flex items-center justify-center text-xs font-bold text-slate-400 hover:text-slate-200 active:scale-90 transition-all cursor-pointer disabled:opacity-0 disabled:cursor-default"
        >
          ล้างค่า
        </button>

        <!-- ตัวเลข 0 -->
        <button
          type="button"
          :disabled="isLoading || !isLiffReady"
          @click="pressKey(0)"
          class="w-18 h-18 rounded-full bg-slate-900/80 hover:bg-slate-800/90 active:bg-emerald-950/60 active:border-emerald-500/50 border border-slate-800 text-2xl font-bold text-slate-100 shadow-md transition-all duration-150 active:scale-90 flex items-center justify-center cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
        >
          0
        </button>

        <!-- ปุ่มลบทีละตัว (Backspace) -->
        <button
          type="button"
          :disabled="isLoading || enteredPin.length === 0"
          @click="deleteLastKey"
          class="w-18 h-18 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-200 active:scale-90 transition-all cursor-pointer disabled:opacity-30 disabled:cursor-default"
          aria-label="ลบตัวเลข"
        >
          <Delete class="w-6 h-6" />
        </button>
      </div>
    </footer>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, onUnmounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useAuthStore } from '@/stores/auth';
import { authService } from '@/services/authService';
import { initLiff, isLiffLoggedIn, getLiffProfile, getLiffIdToken, loginLiff } from '@/utils/liff';
import { Delete } from 'lucide-vue-next';

const router = useRouter();
const route = useRoute();
const authStore = useAuthStore();

// Reactive States
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

const triggerHaptic = (pattern = 30) => {
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
    let idToken = getLiffIdToken();
    if (!idToken && typeof window !== 'undefined') {
      idToken = localStorage.getItem('dev_line_user_id') || 'U_mock_tenant_user_1';
    }

    const res = await authService.loginPin(idToken, enteredPin.value);
    
    if (res?.success) {
      triggerHaptic([40, 60, 40]);
      const token = res.accessToken || res.token || res.data?.accessToken;
      if (token) {
        authStore.setAccessToken(token);
        localStorage.setItem('liff_token', token);
      }
      if (res.user || res.tenant || res.data?.user) {
        authStore.setUser(res.user || res.tenant || res.data?.user);
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
  triggerHaptic([80, 50, 80]);

  // Shake animation 600ms แล้วเคลียร์ค่า PIN เพื่อให้กดใหม่ทันที
  setTimeout(() => {
    isShaking.value = false;
    enteredPin.value = '';
  }, 600);
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
    transform: translateX(-8px);
  }
  40%, 80% {
    transform: translateX(8px);
  }
}

.animate-shake {
  animation: shake 0.5s cubic-bezier(0.36, 0.07, 0.19, 0.97) both;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
