<template>
  <div class="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between items-center p-6 select-none font-sans overflow-hidden">
    
    <!-- 1. Background Ambient Glow -->
    <div class="fixed inset-0 pointer-events-none overflow-hidden">
      <div class="absolute -top-40 -left-40 w-96 h-96 bg-indigo-600/15 rounded-full blur-3xl animate-pulse"></div>
      <div class="absolute -bottom-40 -right-40 w-96 h-96 bg-amber-600/15 rounded-full blur-3xl"></div>
    </div>

    <!-- 2. Header & Step Instructions -->
    <header class="w-full max-w-xs flex flex-col items-center pt-8 space-y-4 relative z-10 text-center">
      <div class="w-full flex items-center justify-between">
        <button
          type="button"
          @click="router.push('/liff/profile')"
          class="p-2 rounded-2xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft class="w-5 h-5" />
        </button>
        <span class="text-xs font-bold text-slate-500 uppercase tracking-wider">เปลี่ยนรหัส PIN</span>
        <div class="w-9"></div>
      </div>

      <div class="w-16 h-16 rounded-3xl bg-amber-950/70 border border-amber-700/50 shadow-xl flex items-center justify-center text-amber-400">
        <KeyRound class="w-8 h-8" />
      </div>

      <div class="space-y-1">
        <div class="text-[11px] font-black uppercase tracking-widest text-amber-400">
          ขั้นตอนที่ {{ step }} / 3
        </div>
        <h1 class="text-xl font-black tracking-tight text-white">
          {{ stepTitle }}
        </h1>
        <p class="text-xs text-slate-400 font-medium leading-relaxed">
          {{ stepSubtitle }}
        </p>
      </div>
    </header>

    <!-- 3. PIN Indicator Dots (6 จุด พร้อม Shake Animation) -->
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
              ? 'bg-amber-400 scale-110 shadow-lg shadow-amber-500/50 ring-4 ring-amber-500/20'
              : 'bg-slate-800 border border-slate-700'
          ]"
        ></div>
      </div>

      <!-- Feedback / Error Message -->
      <transition name="fade">
        <div v-if="errorMessage" class="text-xs font-semibold text-rose-400 mt-2 text-center h-5">
          {{ errorMessage }}
        </div>
        <div v-else-if="isLoading" class="text-xs font-semibold text-amber-400 mt-2 text-center h-5 flex items-center justify-center gap-1.5 animate-pulse">
          <span class="w-2 h-2 rounded-full bg-amber-400 animate-ping"></span>
          <span>กำลังเปลี่ยนรหัส PIN...</span>
        </div>
      </transition>
    </main>

    <!-- 4. Tactile Numpad Grid -->
    <footer class="w-full max-w-xs pb-6 relative z-10">
      <div class="grid grid-cols-3 gap-y-4 gap-x-6 justify-items-center">
        <button
          v-for="num in [1, 2, 3, 4, 5, 6, 7, 8, 9]"
          :key="num"
          type="button"
          :disabled="isLoading"
          @click="pressKey(num)"
          class="w-18 h-18 rounded-full bg-slate-900/80 hover:bg-slate-800/90 active:bg-amber-950/60 active:border-amber-500/50 border border-slate-800 text-2xl font-bold text-slate-100 shadow-md transition-all duration-150 active:scale-90 flex items-center justify-center cursor-pointer disabled:opacity-40"
        >
          {{ num }}
        </button>

        <button
          type="button"
          :disabled="isLoading || enteredPin.length === 0"
          @click="clearCurrentPin"
          class="w-18 h-18 rounded-full flex items-center justify-center text-xs font-bold text-slate-400 hover:text-slate-200 active:scale-90 transition-all cursor-pointer disabled:opacity-0"
        >
          ล้างค่า
        </button>

        <button
          type="button"
          :disabled="isLoading"
          @click="pressKey(0)"
          class="w-18 h-18 rounded-full bg-slate-900/80 hover:bg-slate-800/90 active:bg-amber-950/60 active:border-amber-500/50 border border-slate-800 text-2xl font-bold text-slate-100 shadow-md transition-all duration-150 active:scale-90 flex items-center justify-center cursor-pointer disabled:opacity-40"
        >
          0
        </button>

        <button
          type="button"
          :disabled="isLoading || enteredPin.length === 0"
          @click="deleteLastKey"
          class="w-18 h-18 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-200 active:scale-90 transition-all cursor-pointer disabled:opacity-30"
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
import { useRouter } from 'vue-router';
import { authService } from '@/services/authService';
import { showSuccess, showError } from '@/utils/swal';
import { KeyRound, ArrowLeft, Delete } from 'lucide-vue-next';

const router = useRouter();

// Step Management: 1 = PIN เดิม, 2 = PIN ใหม่, 3 = ยืนยัน PIN ใหม่
const step = ref(1);
const oldPin = ref('');
const newPin = ref('');
const enteredPin = ref('');
const isLoading = ref(false);
const isShaking = ref(false);
const errorMessage = ref('');

const stepTitle = computed(() => {
  if (step.value === 1) return 'กรอกรหัส PIN เดิมของคุณ';
  if (step.value === 2) return 'ตั้งรหัส PIN ใหม่ 6 หลัก';
  return 'ยืนยันรหัส PIN ใหม่อีกครั้ง';
});

const stepSubtitle = computed(() => {
  if (step.value === 1) return 'ระบุรหัส PIN ปัจจุบันเพื่อยืนยันตัวตน';
  if (step.value === 2) return 'กรอกตัวเลข 6 หลักที่คุณต้องการตั้งเป็นรหัสใหม่';
  return 'กรอกรหัส PIN ใหม่อีกครั้งเพื่อยืนยันความถูกต้อง';
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

const clearCurrentPin = () => {
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
 * =========================================================================
 * Multi-Step Watcher: จัดการ Flow 3 ขั้นตอนในการเปลี่ยนรหัส PIN
 * =========================================================================
 */
watch(enteredPin, async (newVal) => {
  if (newVal.length === 6 && !isLoading.value) {
    if (step.value === 1) {
      // Step 1: เก็บ oldPin -> เปลี่ยนไป Step 2
      oldPin.value = newVal;
      triggerHaptic([40, 40]);
      setTimeout(() => {
        enteredPin.value = '';
        step.value = 2;
      }, 200);
    } else if (step.value === 2) {
      // Step 2: เก็บ newPin -> เปลี่ยนไป Step 3
      newPin.value = newVal;
      triggerHaptic([40, 40]);
      setTimeout(() => {
        enteredPin.value = '';
        step.value = 3;
      }, 200);
    } else if (step.value === 3) {
      // Step 3: ยืนยัน newPin
      if (newVal !== newPin.value) {
        triggerMismatchFeedback('รหัส PIN ใหม่ไม่ตรงกัน กรุณาตั้งใหม่', 2);
      } else {
        await submitChangePin();
      }
    }
  }
});

const triggerMismatchFeedback = (msg, targetStep = 1) => {
  errorMessage.value = msg;
  isShaking.value = true;
  triggerHaptic([80, 50, 80]);

  setTimeout(() => {
    isShaking.value = false;
    enteredPin.value = '';
    if (targetStep === 1) {
      oldPin.value = '';
      newPin.value = '';
    } else if (targetStep === 2) {
      newPin.value = '';
    }
    step.value = targetStep;
  }, 600);
};

const submitChangePin = async () => {
  isLoading.value = true;
  errorMessage.value = '';

  try {
    const res = await authService.changePin({
      oldPin: oldPin.value,
      newPin: newPin.value
    });

    if (res?.success) {
      await showSuccess('เปลี่ยนรหัสผ่านสำเร็จ!', 'คุณสามารถใช้รหัส PIN ใหม่ในการเข้าสู่ระบบครั้งถัดไป');
      router.push('/liff/profile');
    } else {
      showError('ไม่สำเร็จ', res?.message || 'รหัส PIN เดิมไม่ถูกต้อง');
      triggerMismatchFeedback(res?.message || 'รหัส PIN เดิมไม่ถูกต้อง', 1);
    }
  } catch (err) {
    const msg = err.response?.data?.message || 'รหัส PIN เดิมไม่ถูกต้อง';
    showError('เกิดข้อผิดพลาด', msg);
    triggerMismatchFeedback(msg, 1);
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
