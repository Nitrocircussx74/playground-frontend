<template>
  <div class="w-full min-h-full flex flex-col justify-between items-center px-4 sm:px-6 py-2 sm:py-4 select-none font-sans max-w-md mx-auto">
    
    <!-- 1. Header & Step Instructions -->
    <header class="w-full flex flex-col items-center pt-2 space-y-2 text-center shrink-0">
      <!-- Back / Cancel Button if coming with mode or redirect -->
      <div v-if="isResetMode || hasCancelOption" class="w-full flex justify-start -mb-2">
        <button
          type="button"
          @click="handleCancel"
          class="text-xs text-slate-400 hover:text-slate-600 font-medium flex items-center gap-1 cursor-pointer transition-colors"
        >
          <span>← ย้อนกลับ</span>
        </button>
      </div>

      <!-- Icon Badge -->
      <div
        class="w-12 h-12 rounded-2xl flex items-center justify-center transition-all"
        :class="isResetMode ? 'bg-amber-50 border border-amber-100 text-amber-600' : 'bg-indigo-50 border border-indigo-100 text-indigo-600'"
      >
        <KeyRound v-if="isResetMode" class="w-6 h-6" />
        <ShieldCheck v-else class="w-6 h-6" />
      </div>

      <!-- User Info Pill (if resetting with phone/name) -->
      <div v-if="userInfoText" class="inline-flex items-center gap-1.5 px-3 py-1 bg-slate-100 rounded-full text-[11px] font-medium text-slate-600 border border-slate-200/60">
        <span class="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
        <span class="truncate max-w-[200px]">{{ userInfoText }}</span>
      </div>

      <div class="space-y-1">
        <span
          class="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold border"
          :class="isResetMode ? 'bg-amber-50 text-amber-700 border-amber-200/80' : 'bg-indigo-50 text-indigo-600 border-indigo-100'"
        >
          {{ isResetMode ? 'รีเซ็ตรหัส PIN • ' : '' }}ขั้นตอนที่ {{ step }} จาก 2
        </span>
        <h1 class="text-base font-bold tracking-tight text-slate-800">
          <template v-if="isResetMode">
            {{ step === 1 ? 'ตั้งรหัส PIN 6 หลักใหม่' : 'ยืนยันรหัส PIN ใหม่อีกครั้ง' }}
          </template>
          <template v-else>
            {{ step === 1 ? 'ตั้งรหัส PIN 6 หลัก' : 'ยืนยันรหัส PIN อีกครั้ง' }}
          </template>
        </h1>
        <p class="text-xs text-slate-400 font-medium max-w-xs mx-auto">
          <template v-if="isResetMode">
            {{ step === 1 ? 'สร้างรหัสผ่าน 6 หลักใหม่เพื่อเข้าใช้งานระบบอย่างปลอดภัย' : 'กรอกรหัส PIN ใหม่อีกครั้งเพื่อยืนยันความถูกต้อง' }}
          </template>
          <template v-else>
            {{ step === 1 ? 'สร้างรหัสผ่าน 6 หลักเพื่อใช้เข้าสู่ระบบอย่างรวดเร็ว' : 'กรอกรหัส PIN เดิมอีกครั้งเพื่อยืนยันความถูกต้อง' }}
          </template>
        </p>
      </div>
    </header>

    <!-- 2. PIN Indicator Dots (6 จุด พร้อม Animation สั่นเมื่อไม่ตรงกัน) -->
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
              ? (isResetMode ? 'bg-amber-500 scale-110 shadow-sm shadow-amber-300/40 ring-4 ring-amber-100/70' : 'bg-indigo-600 scale-110 shadow-sm shadow-indigo-300/40 ring-4 ring-indigo-100/70')
              : 'bg-slate-200/60 border border-slate-200'
          ]"
        ></div>
      </div>

      <!-- Feedback / Error Message -->
      <transition name="fade">
        <div v-if="errorMessage" class="text-xs font-semibold text-rose-500 mt-2 text-center h-5 flex items-center justify-center gap-1">
          <span>{{ errorMessage }}</span>
        </div>
        <div v-else-if="isLoading" class="text-xs font-medium mt-2 text-center h-5 flex items-center justify-center gap-1.5 animate-pulse" :class="isResetMode ? 'text-amber-600' : 'text-indigo-600'">
          <span class="w-1.5 h-1.5 rounded-full animate-ping" :class="isResetMode ? 'bg-amber-600' : 'bg-indigo-600'"></span>
          <span>{{ isResetMode ? 'กำลังรีเซ็ตรหัส PIN...' : 'กำลังบันทึกรหัส PIN...' }}</span>
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
          :disabled="isLoading"
          @click="pressKey(num)"
          class="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-white hover:bg-slate-50 active:bg-slate-100 border border-slate-100 text-slate-700 text-xl font-semibold shadow-2xs transition-all duration-150 active:scale-95 flex items-center justify-center cursor-pointer disabled:opacity-40 touch-manipulation"
        >
          {{ num }}
        </button>

        <!-- แถวที่ 4: ปุ่มล้างค่า (Clear) -->
        <button
          type="button"
          :disabled="isLoading || enteredPin.length === 0"
          @click="clearCurrentPin"
          class="w-14 h-14 sm:w-16 sm:h-16 rounded-full flex items-center justify-center text-xs font-bold text-slate-400 hover:text-slate-600 active:scale-95 transition-all cursor-pointer disabled:opacity-0 touch-manipulation"
        >
          ล้าง
        </button>

        <!-- ตัวเลข 0 -->
        <button
          type="button"
          :disabled="isLoading"
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
    </footer>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, onUnmounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useAuthStore } from '@/stores/auth';
import { authService } from '@/services/authService';
import { getLiffIdToken } from '@/utils/liff';
import { showSuccess, showError } from '@/utils/swal';
import { ShieldCheck, KeyRound, Delete } from 'lucide-vue-next';

const router = useRouter();
const route = useRoute();
const authStore = useAuthStore();

// Reset Mode Detection
const isResetMode = computed(() => route.query.mode === 'reset');
const hasCancelOption = computed(() => Boolean(route.query.phone || route.query.mode));
const userInfoText = computed(() => {
  const name = route.query.name ? String(route.query.name).trim() : '';
  const phone = route.query.phone ? String(route.query.phone).trim() : '';
  if (name && phone) return `${name} (${phone})`;
  return name || phone || '';
});

// Step Management: 1 = ตั้งรหัส PIN, 2 = ยืนยันรหัส PIN
const step = ref(1);
const firstPin = ref('');
const enteredPin = ref('');
const isLoading = ref(false);
const isShaking = ref(false);
const errorMessage = ref('');

const handleCancel = () => {
  router.back();
};

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

const clearCurrentPin = () => {
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
 * =========================================================================
 * Multi-Step Watcher: จับความยาวครบ 6 หลักสำหรับ Step 1 และ Step 2
 * =========================================================================
 */
watch(enteredPin, async (newVal) => {
  if (newVal.length === 6 && !isLoading.value) {
    if (step.value === 1) {
      firstPin.value = newVal;
      triggerHaptic([30, 30]);
      setTimeout(() => {
        enteredPin.value = '';
        step.value = 2;
      }, 150);
    } else if (step.value === 2) {
      if (newVal !== firstPin.value) {
        triggerMismatchFeedback();
      } else {
        await submitSetupPin();
      }
    }
  }
});

const triggerMismatchFeedback = () => {
  errorMessage.value = 'รหัส PIN ไม่ตรงกัน กรุณาตั้งใหม่อีกครั้ง';
  isShaking.value = true;
  triggerHaptic([60, 40, 60]);

  setTimeout(() => {
    isShaking.value = false;
    enteredPin.value = '';
    firstPin.value = '';
    step.value = 1;
  }, 500);
};

const submitSetupPin = async () => {
  isLoading.value = true;
  errorMessage.value = '';

  try {
    const idToken = getLiffIdToken() || (typeof window !== 'undefined' ? localStorage.getItem('dev_line_user_id') : null) || 'U_mock_tenant_user_1';
    const phoneParam = route.query.phone ? String(route.query.phone).trim() : undefined;

    const payload = {
      lineIdToken: idToken,
      phone: phoneParam,
      newPin: firstPin.value,
      pin: firstPin.value
    };

    const res = await authService.setupPin(payload);

    if (res?.success) {
      const token = res.accessToken || res.token || res.data?.accessToken;
      const tenantData = res.user || res.tenant || res.data?.tenant || res.data?.user;
      if (token) {
        authStore.setLiffAuth(token, tenantData);
      }

      const successTitle = isResetMode.value ? 'รีเซ็ตรหัส PIN สำเร็จ! 🎉' : 'ตั้งรหัส PIN สำเร็จ! 🎉';
      const successText = isResetMode.value
        ? 'คุณสามารถใช้รหัส PIN ใหม่นี้เข้าใช้งานหอพักได้ทันที'
        : 'คุณสามารถใช้รหัส PIN นี้เข้าใช้งานหอพักได้ทันที';

      await showSuccess(successTitle, successText);
      const redirect = route.query.redirect || '/liff/profile';
      router.push(redirect);
    } else {
      showError('ไม่สำเร็จ', res?.message || 'ไม่สามารถตั้งค่า PIN ได้');
      triggerMismatchFeedback();
    }
  } catch (err) {
    showError('เกิดข้อผิดพลาด', err.response?.data?.message || 'ไม่สามารถบันทึก PIN ได้');
    triggerMismatchFeedback();
  } finally {
    isLoading.value = false;
  }
};

const handleKeyDown = (e) => {
  if (isLoading.value) return;
  if (/^[0-9]$/.test(e.key)) {
    pressKey(Number(e.key));
  } else if (e.key === 'Backspace') {
    deleteLastKey();
  } else if (e.key === 'Escape') {
    clearCurrentPin();
  }
};

onMounted(() => {
  if (typeof window !== 'undefined') {
    window.addEventListener('keydown', handleKeyDown);
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
