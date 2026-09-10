<template>
  <div class="min-h-screen flex items-center justify-center px-4 py-8 relative overflow-hidden bg-slate-900 font-sans selection:bg-purple-600 selection:text-white">
    <!-- Ambient Background Glows -->
    <div class="absolute inset-0 pointer-events-none overflow-hidden z-0">
      <div class="absolute -top-32 -left-32 w-80 h-80 bg-purple-600/25 rounded-full blur-[90px]"></div>
      <div class="absolute top-1/2 -right-32 w-96 h-96 bg-indigo-600/20 rounded-full blur-[100px]"></div>
      <div class="absolute -bottom-32 left-1/4 w-80 h-80 bg-emerald-600/15 rounded-full blur-[90px]"></div>
    </div>

    <!-- Main Card Container -->
    <div class="w-full max-w-md relative z-10">
      <div class="border border-slate-800/80 bg-slate-900/85 backdrop-blur-2xl shadow-2xl shadow-purple-950/40 rounded-3xl overflow-hidden text-slate-100">
        
        <!-- Header -->
        <div class="space-y-3 text-center pb-5 pt-7 px-6 sm:px-8 border-b border-slate-800/60 bg-gradient-to-b from-slate-800/50 to-transparent">
          <div class="relative mx-auto inline-flex">
            <div class="w-14 h-14 rounded-2xl bg-white p-1 flex items-center justify-center shadow-lg shadow-purple-600/20 ring-4 ring-purple-500/20 overflow-hidden">
              <img src="/horhub-app-icon.png" alt="HorHub App Icon" class="w-full h-full object-contain rounded-xl" />
            </div>
            <span class="absolute -top-1 -right-1 flex h-3.5 w-3.5">
              <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span class="relative inline-flex rounded-full h-3.5 w-3.5 bg-emerald-500 border-2 border-slate-900"></span>
            </span>
          </div>

          <div>
            <h1 class="text-xl sm:text-2xl font-extrabold tracking-tight text-white">
              เข้าสู่ระบบลูกบ้าน <span class="text-purple-400">(Web Portal)</span>
            </h1>
            <p class="text-[11px] font-semibold text-emerald-400 tracking-wide mt-1">
              HorHub Dual-Mode Living Platform
            </p>
          </div>
          <p class="text-slate-400 text-xs">
            สำหรับลูกบ้านที่เข้าใช้งานผ่านเว็บเบราว์เซอร์ปกติ (ไม่ผ่าน LINE)
          </p>
        </div>

        <!-- Form Content -->
        <form @submit.prevent="handleWebLogin" class="p-6 sm:p-8 space-y-5">
          <!-- Feedback Alert -->
          <div
            v-if="errorMessage"
            class="p-3.5 bg-rose-500/10 border border-rose-500/30 text-rose-300 rounded-2xl text-xs flex items-center gap-2 animate-shake"
          >
            <span class="text-base shrink-0">⚠️</span>
            <span>{{ errorMessage }}</span>
          </div>

          <!-- 1. Phone Number Input -->
          <div class="space-y-1.5">
            <label class="text-xs font-bold text-slate-300 flex items-center justify-between">
              <span>📱 หมายเลขโทรศัพท์ที่ลงทะเบียน</span>
              <span class="text-[10px] text-slate-400 font-normal">เช่น 0812345678</span>
            </label>
            <input
              v-model="phoneNumber"
              type="tel"
              inputmode="numeric"
              maxlength="12"
              placeholder="กรอกเบอร์โทรศัพท์ 10 หลัก..."
              required
              :disabled="isLoading"
              class="w-full px-4 py-3 bg-slate-950/70 border border-slate-800 rounded-2xl text-white text-sm font-sans focus:outline-hidden focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all placeholder:text-slate-600 disabled:opacity-50"
            />
          </div>

          <!-- 2. PIN Input Section (6 Digits) -->
          <div class="space-y-2">
            <label class="text-xs font-bold text-slate-300 flex items-center justify-between">
              <span>🔐 รหัส PIN 6 หลัก</span>
              <button
                type="button"
                @click="showPin = !showPin"
                class="text-[11px] text-purple-400 hover:text-purple-300 font-semibold cursor-pointer"
              >
                {{ showPin ? 'ซ่อนรหัส' : 'แสดงรหัส' }}
              </button>
            </label>

            <!-- PIN Indicator Dots / Boxes -->
            <div class="flex items-center justify-center gap-2.5 py-1">
              <div
                v-for="index in 6"
                :key="index"
                class="w-10 h-12 sm:w-11 sm:h-13 rounded-xl border flex items-center justify-center text-lg font-bold transition-all duration-200"
                :class="[
                  index <= pin.length
                    ? 'bg-purple-600/20 border-purple-500 text-purple-300 shadow-inner'
                    : 'bg-slate-950/50 border-slate-800 text-slate-600'
                ]"
              >
                <span v-if="index <= pin.length">
                  {{ showPin ? pin[index - 1] : '●' }}
                </span>
                <span v-else class="text-slate-700">·</span>
              </div>
            </div>

            <!-- Virtual Numpad Grid -->
            <div class="pt-2">
              <div class="grid grid-cols-3 gap-2 sm:gap-2.5 max-w-[260px] mx-auto">
                <button
                  v-for="num in [1, 2, 3, 4, 5, 6, 7, 8, 9]"
                  :key="num"
                  type="button"
                  :disabled="isLoading"
                  @click="pressPinDigit(num)"
                  class="h-11 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 active:bg-slate-600 text-white font-bold text-base shadow-xs transition-all active:scale-95 flex items-center justify-center cursor-pointer disabled:opacity-40"
                >
                  {{ num }}
                </button>

                <!-- Clear Button -->
                <button
                  type="button"
                  :disabled="isLoading || pin.length === 0"
                  @click="clearPin"
                  class="h-11 rounded-xl text-xs font-bold text-slate-400 hover:text-slate-200 active:scale-95 transition-all flex items-center justify-center cursor-pointer disabled:opacity-30"
                >
                  ล้าง
                </button>

                <!-- 0 -->
                <button
                  type="button"
                  :disabled="isLoading"
                  @click="pressPinDigit(0)"
                  class="h-11 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 active:bg-slate-600 text-white font-bold text-base shadow-xs transition-all active:scale-95 flex items-center justify-center cursor-pointer disabled:opacity-40"
                >
                  0
                </button>

                <!-- Backspace -->
                <button
                  type="button"
                  :disabled="isLoading || pin.length === 0"
                  @click="deletePinDigit"
                  class="h-11 rounded-xl text-slate-400 hover:text-slate-200 active:scale-95 transition-all flex items-center justify-center cursor-pointer disabled:opacity-30"
                  title="ลบตัวเลขล่าสุด"
                >
                  ⌫
                </button>
              </div>
            </div>
          </div>

          <!-- Submit Button -->
          <div class="pt-2 space-y-3">
            <button
              type="submit"
              :disabled="isLoading || !phoneNumber || pin.length !== 6"
              class="w-full py-3.5 px-4 bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-600 hover:from-purple-500 hover:to-indigo-500 active:scale-[0.99] text-white rounded-2xl text-sm font-extrabold shadow-lg shadow-purple-600/30 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <div v-if="isLoading" class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              <span>{{ isLoading ? 'กำลังเข้าสู่ระบบ...' : 'เข้าสู่ระบบ (Sign In)' }}</span>
            </button>

            <!-- Switch to LINE Login Option -->
            <button
              type="button"
              @click="openLineLiff"
              class="w-full py-2.5 px-4 bg-emerald-950/40 hover:bg-emerald-900/50 text-emerald-300 border border-emerald-500/30 rounded-2xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>💬</span>
              <span>ใช้งานผ่าน LINE Official Account</span>
            </button>
          </div>

          <!-- Help footer -->
          <div class="text-center pt-2 border-t border-slate-800/60">
            <p class="text-[11px] text-slate-500">
              ลืมรหัส PIN หรือยังไม่เคยลงทะเบียน? ติดต่อนิติบุคคลประจำหอพัก
            </p>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import api from '@/utils/api';
import { useAuthStore } from '@/stores/auth';

const router = useRouter();
const route = useRoute();
const authStore = useAuthStore();

const phoneNumber = ref('');
const pin = ref('');
const showPin = ref(false);
const isLoading = ref(false);
const errorMessage = ref('');

const pressPinDigit = (num) => {
  if (pin.value.length < 6) {
    pin.value += String(num);
    errorMessage.value = '';
  }
};

const deletePinDigit = () => {
  if (pin.value.length > 0) {
    pin.value = pin.value.slice(0, -1);
    errorMessage.value = '';
  }
};

const clearPin = () => {
  pin.value = '';
  errorMessage.value = '';
};

/**
 * ส่งคำขอเข้าสู่ระบบผ่าน Web Login API
 */
const handleWebLogin = async () => {
  if (!phoneNumber.value || pin.value.length !== 6) {
    errorMessage.value = 'กรุณากรอกเบอร์โทรศัพท์และรหัส PIN 6 หลักให้ครบถ้วน';
    return;
  }

  isLoading.value = true;
  errorMessage.value = '';

  try {
    const res = await api.post('/api/auth/web/login', {
      phone_number: phoneNumber.value.trim(),
      pin: pin.value.trim()
    });

    if (res.data?.success && res.data?.data) {
      const { accessToken, tenant, user, rooms, building } = res.data.data;
      const tenantData = {
        ...(tenant || user),
        rooms: rooms || tenant?.rooms || [],
        building: building || tenant?.rooms?.[0]?.building || null
      };

      // บันทึกลง AuthStore (แยกส่วน Web Tenant Auth ออกจาก CMS Admin Auth อย่างสมบูรณ์)
      authStore.setTenantWebAuth(accessToken, tenantData);

      // Redirect ไปยังหน้าที่ต้องการ หรือ Portal บิลค่าเช่า
      const redirectPath = route.query.redirect || '/liff/invoices';
      router.push(redirectPath);
    } else {
      errorMessage.value = res.data?.message || 'เข้าสู่ระบบไม่สำเร็จ กรุณาตรวจสอบข้อมูล';
    }
  } catch (error) {
    errorMessage.value = error.response?.data?.message || error.message || 'เบอร์โทรศัพท์หรือรหัส PIN ไม่ถูกต้อง';
    pin.value = '';
  } finally {
    isLoading.value = false;
  }
};

const openLineLiff = () => {
  router.push('/liff');
};
</script>

<style scoped>
@keyframes shake {
  0%, 100% { transform: translateX(0); }
  20%, 60% { transform: translateX(-5px); }
  40%, 80% { transform: translateX(5px); }
}

.animate-shake {
  animation: shake 0.4s ease-in-out;
}
</style>
