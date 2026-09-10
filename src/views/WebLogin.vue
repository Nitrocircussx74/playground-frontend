<template>
  <div class="min-h-screen flex items-center justify-center px-4 py-8 relative overflow-hidden bg-slate-900 font-sans selection:bg-cyan-600 selection:text-white">
    <!-- Ambient Background Glows -->
    <div class="absolute inset-0 pointer-events-none overflow-hidden z-0">
      <div class="absolute -top-32 -left-32 w-80 h-80 bg-cyan-600/25 rounded-full blur-[90px]"></div>
      <div class="absolute top-1/2 -right-32 w-96 h-96 bg-teal-600/20 rounded-full blur-[100px]"></div>
      <div class="absolute -bottom-32 left-1/4 w-80 h-80 bg-emerald-600/15 rounded-full blur-[90px]"></div>
    </div>

    <!-- Main Card Container -->
    <div class="w-full max-w-md relative z-10">
      <div class="border border-slate-800/80 bg-slate-900/85 backdrop-blur-2xl shadow-2xl shadow-cyan-950/40 rounded-3xl overflow-hidden text-slate-100">
        
        <!-- Header -->
        <div class="space-y-3 text-center pb-5 pt-7 px-6 sm:px-8 border-b border-slate-800/60 bg-gradient-to-b from-slate-800/50 to-transparent">
          <div class="relative mx-auto inline-flex">
            <div class="w-14 h-14 rounded-2xl bg-white p-1 flex items-center justify-center shadow-lg shadow-cyan-600/20 ring-4 ring-cyan-500/20 overflow-hidden">
              <img src="/horhub-app-icon.png" alt="HorHub App Icon" class="w-full h-full object-contain rounded-xl" />
            </div>
            <span class="absolute -top-1 -right-1 flex h-3.5 w-3.5">
              <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span class="relative inline-flex rounded-full h-3.5 w-3.5 bg-emerald-500 border-2 border-slate-900"></span>
            </span>
          </div>

          <div>
            <h1 class="text-xl sm:text-2xl font-extrabold tracking-tight text-white">
              เข้าสู่ระบบลูกบ้าน <span class="text-cyan-400">(Web Portal)</span>
            </h1>
            <p class="text-[11px] font-semibold text-emerald-400 tracking-wide mt-1">
              HorHub Dual-Mode Living Platform
            </p>
          </div>
          <p class="text-slate-400 text-xs">
            สำหรับลูกบ้านที่เข้าใช้งานผ่านเว็บเบราว์เซอร์ปกติ (ไม่ผ่าน LINE)
          </p>
        </div>

        <!-- Form & Login Options Content -->
        <div class="p-6 sm:p-8 space-y-6">
          <!-- Feedback Alert -->
          <div
            v-if="errorMessage"
            class="p-3.5 bg-rose-500/10 border border-rose-500/30 text-rose-300 rounded-2xl text-xs flex items-center gap-2 animate-shake"
          >
            <span class="text-base shrink-0">⚠️</span>
            <span>{{ errorMessage }}</span>
          </div>

          <!-- OPTION A: Primary LINE Login Button (Fast & Seamless with QR Code support on Desktop) -->
          <div class="space-y-2">
            <button
              type="button"
              :disabled="isLineLoggingIn || isLoading"
              @click="handleLineWebLogin"
              class="w-full py-3.5 px-4 bg-gradient-to-r from-[#06C755] via-emerald-500 to-[#06C755] hover:from-[#05b34c] hover:to-emerald-600 active:scale-[0.99] text-white rounded-2xl text-sm font-extrabold shadow-lg shadow-[#06C755]/25 transition-all flex items-center justify-center gap-2.5 cursor-pointer disabled:opacity-50"
            >
              <div v-if="isLineLoggingIn" class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              <svg v-else class="w-5 h-5 fill-current text-white shrink-0" viewBox="0 0 24 24">
                <path d="M19.365 9.863c.349 0 .63.285.63.631 0 .345-.281.63-.63.63H17.61v1.125h1.755c.349 0 .63.283.63.63 0 .344-.281.629-.63.629h-2.386c-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.627-.63h2.386c.349 0 .63.285.63.63 0 .349-.281.63-.63.63H17.61v1.125h1.755zm-3.855 3.016c0 .27-.174.51-.432.596-.064.021-.133.031-.199.031-.211 0-.391-.09-.51-.25l-2.443-3.317v2.94c0 .344-.279.629-.631.629-.346 0-.626-.285-.626-.629V8.108c0-.27.173-.51.43-.595.06-.023.136-.033.194-.033.195 0 .375.104.477.254l2.486 3.37V8.108c0-.345.282-.63.63-.63.345 0 .624.285.624.63v4.771zm-5.741 0c0 .344-.282.629-.631.629-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.627-.63.349 0 .631.285.631.63v4.771zm-2.466.629H4.917c-.345 0-.63-.285-.63-.629V8.108c0-.345.285-.63.63-.63.348 0 .63.285.63.63v4.141h1.756c.348 0 .629.283.629.63 0 .344-.281.629-.629.629M24 10.314C24 4.943 18.615.572 12 .572S0 4.943 0 10.314c0 4.811 4.27 8.842 10.035 9.608.391.082.923.258 1.058.59.12.301.079.766.038 1.08l-.164 1.02c-.045.301-.24 1.186 1.049.645 1.291-.539 6.916-4.078 9.436-6.975C23.176 14.393 24 12.458 24 10.314" />
              </svg>
              <span>{{ isLineLoggingIn ? 'กำลังเชื่อมต่อ LINE...' : 'เข้าสู่ระบบด้วย LINE (แนะนำ)' }}</span>
            </button>
            <p class="text-[11px] text-center text-slate-500">
              บนคอมพิวเตอร์สามารถสแกน QR Code ด้วยมือถือเพื่อเข้าสู่ระบบได้ทันที
            </p>
          </div>

          <!-- Divider -->
          <div class="relative flex items-center justify-center">
            <div class="border-t border-slate-800 w-full"></div>
            <span class="bg-slate-900 px-3 text-[11px] font-semibold text-slate-500 uppercase tracking-wider shrink-0">
              หรือ เข้าสู่ระบบด้วยรหัส PIN
            </span>
            <div class="border-t border-slate-800 w-full"></div>
          </div>

          <!-- OPTION B: Phone + PIN Form -->
          <form @submit.prevent="handleWebLogin" class="space-y-4">
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
                class="w-full px-4 py-3 bg-slate-950/70 border border-slate-800 rounded-2xl text-white text-sm font-sans focus:outline-hidden focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-all placeholder:text-slate-600 disabled:opacity-50"
              />
            </div>

            <!-- 2. PIN Input Section (6 Digits) -->
            <div class="space-y-2">
              <label class="text-xs font-bold text-slate-300 flex items-center justify-between">
                <span>🔐 รหัส PIN 6 หลัก</span>
                <button
                  type="button"
                  @click="showPin = !showPin"
                  class="text-[11px] text-cyan-400 hover:text-cyan-300 font-semibold cursor-pointer"
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
                      ? 'bg-cyan-600/20 border-cyan-500 text-cyan-300 shadow-inner'
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
              <div class="pt-1">
                <div class="grid grid-cols-3 gap-2 max-w-[250px] mx-auto">
                  <button
                    v-for="num in [1, 2, 3, 4, 5, 6, 7, 8, 9]"
                    :key="num"
                    type="button"
                    :disabled="isLoading"
                    @click="pressPinDigit(num)"
                    class="h-10 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 active:bg-slate-600 text-white font-bold text-base shadow-xs transition-all active:scale-95 flex items-center justify-center cursor-pointer disabled:opacity-40"
                  >
                    {{ num }}
                  </button>

                  <!-- Clear Button -->
                  <button
                    type="button"
                    :disabled="isLoading || pin.length === 0"
                    @click="clearPin"
                    class="h-10 rounded-xl text-xs font-bold text-slate-400 hover:text-slate-200 active:scale-95 transition-all flex items-center justify-center cursor-pointer disabled:opacity-30"
                  >
                    ล้าง
                  </button>

                  <!-- 0 -->
                  <button
                    type="button"
                    :disabled="isLoading"
                    @click="pressPinDigit(0)"
                    class="h-10 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 active:bg-slate-600 text-white font-bold text-base shadow-xs transition-all active:scale-95 flex items-center justify-center cursor-pointer disabled:opacity-40"
                  >
                    0
                  </button>

                  <!-- Backspace -->
                  <button
                    type="button"
                    :disabled="isLoading || pin.length === 0"
                    @click="deletePinDigit"
                    class="h-10 rounded-xl text-slate-400 hover:text-slate-200 active:scale-95 transition-all flex items-center justify-center cursor-pointer disabled:opacity-30"
                    title="ลบตัวเลขล่าสุด"
                  >
                    ⌫
                  </button>
                </div>
              </div>
            </div>

            <!-- Submit Button for Phone+PIN -->
            <div class="pt-2">
              <button
                type="submit"
                :disabled="isLoading || !phoneNumber || pin.length !== 6"
                class="w-full py-3 px-4 bg-gradient-to-r from-cyan-600 via-teal-600 to-cyan-600 hover:from-cyan-500 hover:to-teal-500 active:scale-[0.99] text-white rounded-2xl text-sm font-extrabold shadow-lg shadow-cyan-600/30 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <div v-if="isLoading" class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>{{ isLoading ? 'กำลังเข้าสู่ระบบ...' : 'เข้าสู่ระบบด้วย PIN (Sign In)' }}</span>
              </button>
            </div>

            <!-- Help footer -->
            <div class="text-center pt-3 border-t border-slate-800/60">
              <p class="text-[11px] text-slate-500">
                ลืมรหัส PIN หรือยังไม่เคยลงทะเบียน? ติดต่อนิติบุคคลประจำหอพัก
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import api from '@/utils/api';
import { useAuthStore } from '@/stores/auth';
import { loginLiff } from '@/utils/liff';

const router = useRouter();
const route = useRoute();
const authStore = useAuthStore();

const phoneNumber = ref('');
const pin = ref('');
const showPin = ref(false);
const isLoading = ref(false);
const isLineLoggingIn = ref(false);
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
 * ดำเนินการเข้าสู่ระบบผ่าน LINE Login Web OAuth (สแกน QR Code บน Desktop หรือ Auto-login บน Mobile)
 */
const handleLineWebLogin = async () => {
  isLineLoggingIn.value = true;
  errorMessage.value = '';
  try {
    const origin = typeof window !== 'undefined' ? window.location.origin : '';
    const redirectUri = `${origin}/liff${route.query.redirect ? `?redirect=${encodeURIComponent(route.query.redirect)}` : ''}`;
    const success = await loginLiff(redirectUri);
    if (!success) {
      // Fallback: หาก LIFF SDK ไม่พร้อม ให้พาไปที่หน้า /liff
      router.push('/liff');
    }
  } catch (error) {
    console.error('LINE Web Login failed:', error);
    errorMessage.value = 'ไม่สามารถเชื่อมต่อ LINE Login ได้ กรุณาลองใหม่อีกครั้งหรือเข้าสู่ระบบด้วยรหัส PIN';
  } finally {
    isLineLoggingIn.value = false;
  }
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
