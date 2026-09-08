<template>
  <div class="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between items-center p-6 select-none font-sans overflow-hidden">
    
    <!-- 1. Background Ambient Glow -->
    <div class="fixed inset-0 pointer-events-none overflow-hidden">
      <div class="absolute -top-40 -left-40 w-96 h-96 bg-indigo-600/15 rounded-full blur-3xl animate-pulse"></div>
      <div class="absolute -bottom-40 -right-40 w-96 h-96 bg-emerald-600/15 rounded-full blur-3xl"></div>
    </div>

    <!-- 2. Header & Step Instructions -->
    <header class="w-full max-w-xs flex flex-col items-center pt-8 space-y-4 relative z-10 text-center">
      <div class="w-16 h-16 rounded-3xl bg-indigo-950/80 border border-indigo-800/60 shadow-xl flex items-center justify-center text-indigo-400">
        <ShieldCheck class="w-8 h-8" />
      </div>

      <div class="space-y-1">
        <div class="text-[11px] font-black uppercase tracking-widest text-indigo-400">
          ขั้นตอนที่ {{ step }} / 2
        </div>
        <h1 class="text-xl font-black tracking-tight text-white">
          {{ step === 1 ? 'ตั้งรหัส PIN 6 หลัก' : 'ยืนยันรหัส PIN อีกครั้ง' }}
        </h1>
        <p class="text-xs text-slate-400 font-medium leading-relaxed">
          {{ step === 1 ? 'สร้างรหัสผ่าน 6 หลักเพื่อใช้เข้าสู่ระบบอย่างรวดเร็ว' : 'กรอกรหัส PIN อีกครั้งเพื่อยืนยันความถูกต้อง' }}
        </p>
      </div>
    </header>

    <!-- 3. PIN Indicator Dots (6 จุด พร้อม Animation สั่นเมื่อรหัสไม่ตรงกัน) -->
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
              ? (step === 1 ? 'bg-indigo-400 scale-110 shadow-lg shadow-indigo-500/50 ring-4 ring-indigo-500/20' : 'bg-emerald-400 scale-110 shadow-lg shadow-emerald-500/50 ring-4 ring-emerald-500/20')
              : 'bg-slate-800 border border-slate-700'
          ]"
        ></div>
      </div>

      <!-- Feedback / Error Message -->
      <transition name="fade">
        <div v-if="errorMessage" class="text-xs font-semibold text-rose-400 mt-2 text-center h-5">
          {{ errorMessage }}
        </div>
        <div v-else-if="isLoading" class="text-xs font-semibold text-emerald-400 mt-2 text-center h-5 flex items-center justify-center gap-1.5 animate-pulse">
          <span class="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
          <span>กำลังบันทึกรหัส PIN...</span>
        </div>
      </transition>
    </main>

    <!-- 4. Tactile Numpad Grid (0-9, Backspace, Clear) -->
    <footer class="w-full max-w-xs pb-6 relative z-10">
      <div class="grid grid-cols-3 gap-y-4 gap-x-6 justify-items-center">
        <button
          v-for="num in [1, 2, 3, 4, 5, 6, 7, 8, 9]"
          :key="num"
          type="button"
          :disabled="isLoading"
          @click="pressKey(num)"
          class="w-18 h-18 rounded-full bg-slate-900/80 hover:bg-slate-800/90 active:bg-indigo-950/60 active:border-indigo-500/50 border border-slate-800 text-2xl font-bold text-slate-100 shadow-md transition-all duration-150 active:scale-90 flex items-center justify-center cursor-pointer disabled:opacity-40"
        >
          {{ num }}
        </button>

        <!-- ปุ่มล้างค่า / ย้อนกลับ -->
        <button
          type="button"
          :disabled="isLoading || enteredPin.length === 0"
          @click="clearCurrentPin"
          class="w-18 h-18 rounded-full flex items-center justify-center text-xs font-bold text-slate-400 hover:text-slate-200 active:scale-90 transition-all cursor-pointer disabled:opacity-0"
        >
          ล้างค่า
        </button>

        <!-- ตัวเลข 0 -->
        <button
          type="button"
          :disabled="isLoading"
          @click="pressKey(0)"
          class="w-18 h-18 rounded-full bg-slate-900/80 hover:bg-slate-800/90 active:bg-indigo-950/60 active:border-indigo-500/50 border border-slate-800 text-2xl font-bold text-slate-100 shadow-md transition-all duration-150 active:scale-90 flex items-center justify-center cursor-pointer disabled:opacity-40"
        >
          0
        </button>

        <!-- ปุ่มลบทีละตัว (Backspace) -->
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
import { ref, watch, onMounted, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth';
import { authService } from '@/services/authService';
import { getLiffIdToken } from '@/utils/liff';
import { showSuccess, showError } from '@/utils/swal';
import { ShieldCheck, Delete } from 'lucide-vue-next';

const router = useRouter();
const authStore = useAuthStore();

// Step Management: 1 = ตั้งรหัส PIN, 2 = ยืนยันรหัส PIN
const step = ref(1);
const firstPin = ref('');
const enteredPin = ref('');
const isLoading = ref(false);
const isShaking = ref(false);
const errorMessage = ref('');

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
 * Multi-Step Watcher: จับความยาวครบ 6 หลักสำหรับ Step 1 และ Step 2
 * =========================================================================
 */
watch(enteredPin, async (newVal) => {
  if (newVal.length === 6 && !isLoading.value) {
    if (step.value === 1) {
      // จบขั้นตอนที่ 1: บันทึกค่า firstPin แล้วสลับไปขั้นตอนที่ 2
      firstPin.value = newVal;
      triggerHaptic([40, 40]);
      setTimeout(() => {
        enteredPin.value = '';
        step.value = 2;
      }, 200);
    } else if (step.value === 2) {
      // จบขั้นตอนที่ 2: เปรียบเทียบรหัสที่ยืนยันกับ firstPin
      if (newVal !== firstPin.value) {
        // รหัสไม่ตรงกัน: สั่นหน้าจอ + รีเซ็ตกลับไปขั้นตอนที่ 1
        triggerMismatchFeedback();
      } else {
        // รหัสตรงกัน: บันทึกลงเซิร์ฟเวอร์
        await submitSetupPin();
      }
    }
  }
});

const triggerMismatchFeedback = () => {
  errorMessage.value = 'รหัส PIN ไม่ตรงกัน กรุณาตั้งใหม่อีกครั้ง';
  isShaking.value = true;
  triggerHaptic([80, 50, 80]);

  setTimeout(() => {
    isShaking.value = false;
    enteredPin.value = '';
    firstPin.value = '';
    step.value = 1;
  }, 600);
};

const submitSetupPin = async () => {
  isLoading.value = true;
  errorMessage.value = '';

  try {
    const idToken = getLiffIdToken() || localStorage.getItem('dev_line_user_id') || 'U_mock_tenant_user_1';
    const res = await authService.setupPin({
      lineIdToken: idToken,
      newPin: firstPin.value
    });

    if (res?.success) {
      const token = res.accessToken || res.token || res.data?.accessToken;
      if (token) {
        authStore.setAccessToken(token);
        localStorage.setItem('liff_token', token);
      }
      if (res.user || res.tenant || res.data?.user) {
        authStore.setUser(res.user || res.tenant || res.data?.user);
      }

      await showSuccess('ตั้งรหัส PIN สำเร็จ!', 'คุณสามารถใช้รหัส PIN นี้เข้าใช้งานหอพักได้ทันที');
      router.push('/liff/profile');
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
