<template>
  <div class="w-full min-h-full flex flex-col justify-between items-center px-4 sm:px-6 py-2 sm:py-4 select-none font-sans max-w-md mx-auto">
    
    <!-- 1. Header & Step Instructions -->
    <header class="w-full flex flex-col items-center pt-1 sm:pt-2 space-y-2 sm:space-y-3 text-center shrink-0">
      <!-- Icon Badge -->
      <div class="w-12 h-12 rounded-xl bg-teal-50 border border-teal-100/80 flex items-center justify-center text-teal-600">
        <KeyRound class="w-5 h-5" />
      </div>

      <div class="space-y-1">
        <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-teal-50 text-teal-600 border border-teal-100">
          ขั้นตอนที่ {{ step }} จาก 3
        </span>
        <h1 class="text-base sm:text-lg font-bold tracking-tight text-slate-900">
          {{ stepTitle }}
        </h1>
        <p class="text-xs text-slate-500 max-w-xs mx-auto">
          {{ stepSubtitle }}
        </p>
      </div>
    </header>

    <!-- 2. PIN Indicator Dots -->
    <main class="w-full flex flex-col items-center my-auto py-3 sm:py-6 shrink-0">
      <PinDotPad
        v-model="enteredPin"
        :disabled="isLoading"
        :shaking="isShaking"
        active-dot-class="bg-teal-500 scale-110 shadow-xs ring-4 ring-teal-50"
        dot-gap-class="gap-3 sm:gap-4"
      >
        <!-- Feedback / Error Message -->
        <transition name="fade">
          <div v-if="errorMessage" role="alert" class="text-xs font-medium text-rose-500 mt-2 sm:mt-3 text-center h-5 flex items-center justify-center gap-1.5">
            <AlertCircle class="w-3.5 h-3.5 shrink-0" />
            <span>{{ errorMessage }}</span>
          </div>
          <div v-else-if="isLoading" class="text-xs font-medium text-teal-600 mt-2 sm:mt-3 text-center h-5 flex items-center justify-center gap-1.5 animate-pulse">
            <span class="w-2 h-2 rounded-full bg-teal-500 animate-ping"></span>
            <span>กำลังเปลี่ยนรหัส PIN...</span>
          </div>
          <div v-else class="h-5 mt-2 sm:mt-3"></div>
        </transition>
      </PinDotPad>
    </main>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue';
import { useRouter } from 'vue-router';
import { authService } from '@/services/authService';
import { showSuccess, showError } from '@/utils/swal';
import { KeyRound, AlertCircle } from 'lucide-vue-next';
import PinDotPad from '@/components/PinDotPad.vue';

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
  if (step.value === 1) return 'กรอกรหัส PIN เดิม';
  if (step.value === 2) return 'ตั้งรหัส PIN ใหม่ 6 หลัก';
  return 'ยืนยันรหัส PIN ใหม่อีกครั้ง';
});

const stepSubtitle = computed(() => {
  if (step.value === 1) return 'ระบุรหัส PIN ปัจจุบันเพื่อยืนยันตัวตน';
  if (step.value === 2) return 'กรอกตัวเลข 6 หลักที่คุณต้องการตั้งเป็นรหัสใหม่';
  return 'กรอกรหัส PIN ใหม่อีกครั้งเพื่อยืนยันความถูกต้อง';
});

watch(enteredPin, () => {
  errorMessage.value = '';
});

const triggerHaptic = (pattern = 25) => {
  if (typeof navigator !== 'undefined' && typeof navigator.vibrate === 'function') {
    try {
      navigator.vibrate(pattern);
    } catch {}
  }
};

watch(enteredPin, async (newVal) => {
  if (newVal.length === 6 && !isLoading.value) {
    if (step.value === 1) {
      oldPin.value = newVal;
      triggerHaptic([30, 30]);
      setTimeout(() => {
        enteredPin.value = '';
        step.value = 2;
      }, 150);
    } else if (step.value === 2) {
      newPin.value = newVal;
      triggerHaptic([30, 30]);
      setTimeout(() => {
        enteredPin.value = '';
        step.value = 3;
      }, 150);
    } else if (step.value === 3) {
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
  triggerHaptic([60, 40, 60]);

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
  }, 500);
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
      await showSuccess('เปลี่ยนรหัส PIN สำเร็จ', 'คุณสามารถใช้รหัส PIN ใหม่ในการเข้าสู่ระบบครั้งถัดไป');
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

