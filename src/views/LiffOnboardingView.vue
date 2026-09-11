<template>
  <div class="min-h-screen bg-gradient-to-b from-emerald-50/40 via-slate-50 to-teal-50/30 text-slate-800 flex flex-col items-center justify-center p-5 sm:p-6 font-sans">
    <div class="w-full max-w-sm space-y-5">
      <!-- Header Branding -->
      <div class="text-center space-y-2.5">
        <div class="w-16 h-16 rounded-2xl bg-white/95 p-1 border border-slate-100 shadow-md shadow-emerald-950/5 mx-auto flex items-center justify-center overflow-hidden">
          <img src="/horhub-app-icon.png" alt="HorHub Logo" class="w-full h-full object-contain rounded-xl" />
        </div>

        <div class="space-y-1">
          <div v-if="buildingName && buildingName !== 'หอพัก'" class="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50/80 border border-emerald-200/80 rounded-full text-xs font-bold text-emerald-800 shadow-xs mb-1">
            <Building2 class="w-3.5 h-3.5 text-emerald-600" />
            <span>{{ buildingName }}</span>
          </div>
          <h1 class="text-lg sm:text-xl font-bold tracking-tight text-slate-900">
            HorHub <span class="text-emerald-600 font-semibold">(หอฮับ)</span>
          </h1>
          <p class="text-xs text-slate-500">ยืนยันเบอร์โทรศัพท์หรือรหัสเชิญเพื่อเชื่อมต่อบัญชี LINE</p>
        </div>
      </div>

      <!-- Mode Selector Tabs -->
      <div class="grid grid-cols-2 p-1 bg-slate-100/90 rounded-2xl border border-slate-200/50 text-xs font-semibold">
        <button
          type="button"
          @click="activeMode = 'phone'"
          :class="activeMode === 'phone' ? 'bg-white text-emerald-700 shadow-xs' : 'text-slate-500 hover:text-slate-800'"
          class="py-2.5 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5"
        >
          <Phone class="w-3.5 h-3.5" />
          <span>เบอร์โทรศัพท์</span>
        </button>
        <button
          type="button"
          @click="activeMode = 'invite'"
          :class="activeMode === 'invite' ? 'bg-white text-emerald-700 shadow-xs' : 'text-slate-500 hover:text-slate-800'"
          class="py-2.5 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5"
        >
          <KeyRound class="w-3.5 h-3.5" />
          <span>รหัสเชิญ 6 หลัก</span>
        </button>
      </div>

      <!-- Form Card -->
      <div class="p-5 sm:p-6 bg-white rounded-2xl border border-slate-100/90 shadow-xs space-y-4">
        <!-- MODE 1: Phone Verification -->
        <div v-if="activeMode === 'phone'">
          <!-- Case A: Existing User detected in HorHub -> Prompt PIN -->
          <div v-if="isExistingUserPrompt" class="space-y-3.5 text-xs">
            <div class="p-3 bg-emerald-50 rounded-xl border border-emerald-100 flex items-center justify-between">
              <div>
                <div class="font-bold text-slate-800">{{ existingUserName || 'ลูกบ้าน HorHub' }}</div>
                <div class="text-[11px] text-slate-500 font-mono">{{ phoneInput }}</div>
              </div>
              <button
                type="button"
                @click="isExistingUserPrompt = false; pinInput = ''; errorMessage = ''"
                class="text-[11px] text-emerald-700 hover:text-emerald-800 font-medium cursor-pointer"
              >
                เปลี่ยนเบอร์
              </button>
            </div>

            <div class="space-y-1">
              <label class="block font-medium text-slate-700">
                {{ existingUserHasPin ? 'กรอกรหัส PIN 6 หลักเดิมของคุณ' : 'ตั้งรหัส PIN 6 หลักใหม่สำหรับบัญชีนี้' }}
                <span class="text-rose-500">*</span>
              </label>
              <input
                v-model="pinInput"
                type="password"
                inputmode="numeric"
                pattern="[0-9]*"
                maxlength="6"
                placeholder="••••••"
                required
                autofocus
                class="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-3 font-mono font-bold text-xl text-center tracking-[0.3em] text-slate-900 placeholder:font-sans placeholder:font-normal placeholder:tracking-normal placeholder:text-slate-400 focus:outline-hidden focus:border-emerald-400 transition-colors"
              />
              <div class="flex items-center justify-between pt-0.5">
                <p class="text-[11px] text-slate-400">
                  {{ existingUserHasPin ? 'ระบบจะเชื่อมต่อบัญชีเข้ากับตึกนี้ทันที' : 'บัญชีนี้ยังไม่เคยตั้งรหัส PIN ระบบจะบันทึกเป็น PIN ใหม่และผูกกับตึกนี้ทันที' }}
                </p>
                <button
                  v-if="existingUserHasPin"
                  type="button"
                  @click="handleForgotPin"
                  class="text-[11px] font-semibold text-emerald-600 hover:text-emerald-700 hover:underline cursor-pointer transition-colors"
                >
                  ลืมรหัส PIN?
                </button>
              </div>
            </div>

            <!-- Alert Error Message -->
            <div v-if="errorMessage" class="p-3 bg-rose-50 border border-rose-100 rounded-xl text-rose-700 text-xs font-medium space-y-1.5">
              <div class="flex items-center gap-2">
                <AlertCircle class="w-4 h-4 shrink-0" />
                <span>{{ errorMessage }}</span>
              </div>
              <div v-if="existingUserHasPin" class="pt-0.5 text-right">
                <button
                  type="button"
                  @click="handleForgotPin"
                  class="text-[11px] font-bold text-rose-700 underline hover:text-rose-900 cursor-pointer"
                >
                  คลิกที่นี่เพื่อตั้งรหัส PIN ใหม่
                </button>
              </div>
            </div>

            <!-- Submit Button -->
            <button
              type="button"
              :disabled="submitting || pinInput.length !== 6"
              @click="handleLinkAndLogin"
              class="w-full py-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-semibold text-xs shadow-xs transition-colors disabled:opacity-50 flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <CheckCircle2 class="w-4 h-4" />
              <span>{{ submitting ? (existingUserHasPin ? 'กำลังผูกบัญชี...' : 'กำลังตั้ง PIN และผูกบัญชี...') : (existingUserHasPin ? 'ยืนยัน PIN & เข้าสู่ระบบ' : 'ตั้งรหัส PIN ใหม่ & เข้าสู่ระบบ') }}</span>
            </button>
          </div>

          <!-- Case B: Regular Phone Input -->
          <form v-else @submit.prevent="handleVerifyByPhone" class="space-y-3.5 text-xs">
            <div class="space-y-1">
              <label class="block font-medium text-slate-700">
                เบอร์โทรศัพท์ที่ลงทะเบียนไว้ <span class="text-rose-500">*</span>
              </label>
              <input
                v-model="phoneInput"
                type="tel"
                placeholder="เช่น 0898765432"
                required
                class="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 font-mono font-bold text-sm text-center tracking-widest text-slate-900 placeholder:font-sans placeholder:font-normal placeholder:tracking-normal placeholder:text-slate-400 focus:outline-hidden focus:border-emerald-400 transition-colors"
              />
              <p class="text-[11px] text-slate-400 text-center pt-0.5">ระบบจะค้นหาห้องพักและผูกบัญชี LINE โดยอัตโนมัติ</p>
            </div>

            <!-- Alert Error Message -->
            <div v-if="errorMessage" class="p-3 bg-rose-50 border border-rose-100 rounded-xl text-rose-700 text-xs font-medium flex items-center gap-2">
              <AlertCircle class="w-4 h-4 shrink-0" />
              <span>{{ errorMessage }}</span>
            </div>

            <!-- Submit Button -->
            <button
              type="submit"
              :disabled="submitting || !phoneInput"
              class="w-full py-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-semibold text-xs shadow-xs transition-colors disabled:opacity-50 flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <CheckCircle2 class="w-4 h-4" />
              <span>{{ submitting ? 'กำลังยืนยันข้อมูล...' : 'ยืนยันเบอร์ & เข้าสู่ระบบ' }}</span>
            </button>
          </form>
        </div>

        <!-- MODE 2: Invite Code Linking -->
        <form v-else @submit.prevent="handleLinkAccount" class="space-y-3.5 text-xs">
          <!-- 1. Invite Code (6-digit alphanumeric) -->
          <div class="space-y-1">
            <label class="block font-medium text-slate-700">
              รหัสเชิญ 6 หลัก <span class="text-rose-500">*</span>
            </label>
            <input
              v-model="form.inviteCode"
              type="text"
              maxlength="6"
              placeholder="เช่น X7K9M2"
              required
              class="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 font-mono font-bold text-sm text-center uppercase tracking-widest text-slate-900 placeholder:font-sans placeholder:font-normal placeholder:tracking-normal placeholder:text-slate-400 focus:outline-hidden focus:border-emerald-400 transition-colors"
            />
          </div>

          <!-- 2. Phone Last 4 Digits -->
          <div class="space-y-1">
            <label class="block font-medium text-slate-700">
              เบอร์โทรศัพท์ 4 ตัวท้าย <span class="text-rose-500">*</span>
            </label>
            <input
              v-model="form.phoneLast4"
              type="text"
              maxlength="4"
              placeholder="เช่น 5678"
              required
              class="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 font-mono font-bold text-sm text-center tracking-widest text-slate-900 placeholder:font-sans placeholder:font-normal placeholder:tracking-normal placeholder:text-slate-400 focus:outline-hidden focus:border-emerald-400 transition-colors"
            />
          </div>

          <!-- Alert Error Message -->
          <div v-if="errorMessage" class="p-3 bg-rose-50 border border-rose-100 rounded-xl text-rose-700 text-xs font-medium flex items-center gap-2">
            <AlertCircle class="w-4 h-4 shrink-0" />
            <span>{{ errorMessage }}</span>
          </div>

          <!-- Submit Button -->
          <button
            type="submit"
            :disabled="submitting || !form.inviteCode || !form.phoneLast4"
            class="w-full py-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-semibold text-xs shadow-xs transition-colors disabled:opacity-50 flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <CheckCircle2 class="w-4 h-4" />
            <span>{{ submitting ? 'กำลังยืนยันข้อมูล...' : 'ยืนยันการผูกบัญชี' }}</span>
          </button>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import {
  Link2,
  Phone,
  KeyRound,
  AlertCircle,
  CheckCircle2,
  Building2
} from 'lucide-vue-next';
import { initLiff, isLiffLoggedIn, getLiffProfile, getLiffIdToken } from '@/utils/liff';
import api from '@/utils/api';
import authService from '@/services/authService';
import { useAuthStore } from '@/stores/auth';
import { useDynamicTheme } from '@/composables/useDynamicTheme';
import { showSuccess, showConfirm } from '@/utils/swal';

const route = useRoute();
const router = useRouter();
const authStore = useAuthStore();
const { fetchAndApplyBuildingTheme, buildingName } = useDynamicTheme();
const activeMode = ref('phone');
const phoneInput = ref('');
const pinInput = ref('');
const isExistingUserPrompt = ref(false);
const existingUserHasPin = ref(true);
const existingUserName = ref('');
const lineDisplayName = ref('');
const linePictureUrl = ref('');
const lineStatusMessage = ref('');
const submitting = ref(false);
const errorMessage = ref('');

const form = reactive({
  inviteCode: '',
  phoneLast4: ''
});

onMounted(async () => {
  const targetBuilding = route.query.building || route.query.buildingId || (typeof window !== 'undefined' ? localStorage.getItem('liff_target_building') : null);
  if (targetBuilding) {
    fetchAndApplyBuildingTheme(targetBuilding);
  }

  if (route.query.code) {
    form.inviteCode = String(route.query.code).trim().toUpperCase();
    activeMode.value = 'invite';
  }

  // หมายเหตุ: auto-login ผ่าน LINE (loginLiff) ย้ายไปเช็ครวมที่ router guard (liffNavigationGuard) แล้ว
  // ครอบคลุมทุกหน้าที่มาผ่าน LIFF ไม่ต้องเช็คซ้ำในแต่ละหน้าอีก — ถึงตรงนี้ถือว่าล็อกอิน LINE แล้ว (หรือไม่ใช่ LIFF context จริง)
  try {
    await initLiff();
    if (isLiffLoggedIn()) {
      const profile = await getLiffProfile();
      if (profile) {
        lineDisplayName.value = profile.displayName || '';
        linePictureUrl.value = profile.pictureUrl || '';
        lineStatusMessage.value = profile.statusMessage || '';
      }
    }
  } catch (err) {
    console.warn('LIFF init fallback in LiffOnboarding:', err.message);
  }
});

const handleVerifyByPhone = async () => {
  if (!phoneInput.value || !phoneInput.value.trim()) return;
  submitting.value = true;
  errorMessage.value = '';

  const cleanPhone = phoneInput.value.trim();
  const targetBuilding = route.query.building || route.query.buildingId || (typeof window !== 'undefined' ? localStorage.getItem('liff_target_building') : null);

  try {
    // 1. ตรวจสอบสถานะเบอร์โทรศัพท์ในระบบ HorHub ก่อน
    const phoneStatus = await authService.verifyPhoneStatus({ phone: cleanPhone, building: targetBuilding || undefined });

    if (phoneStatus?.isExistingUser) {
      // พบบัญชีเดิมในระบบ HorHub -> ให้กรอก PIN เดิม (ถ้ามี) หรือตั้ง PIN ใหม่ (ถ้ายังไม่เคยตั้ง) แล้วผูกกับตึกนี้
      existingUserName.value = phoneStatus.userName || phoneStatus.tenantName || 'ลูกบ้าน HorHub';
      existingUserHasPin.value = Boolean(phoneStatus.hasPin);
      isExistingUserPrompt.value = true;
      submitting.value = false;
      return;
    }

    // 2. กรณีลูกบ้านใหม่
    const payload = {
      phone: cleanPhone,
      building: targetBuilding || undefined,
      lineDisplayName: lineDisplayName.value || null,
      linePictureUrl: linePictureUrl.value || null,
      lineStatusMessage: lineStatusMessage.value || null
    };

    const res = await api.post('/api/v1/liff/auth/verify-phone', payload);
    const accessToken = res.data.accessToken || res.data.data?.accessToken;
    const tenantData = res.data.data?.tenant || res.data.tenant;
    if (accessToken) {
      authStore.setLiffAuth(accessToken, tenantData);
    }
    await showSuccess('สำเร็จ', res.data.message || 'เชื่อมต่อบัญชี LINE ของคุณเรียบร้อยแล้ว');
    router.push('/liff/setup-pin');
  } catch (err) {
    errorMessage.value = err.response?.data?.message || 'ไม่พบข้อมูลลูกบ้านที่ตรงกับเบอร์โทรศัพท์นี้ กรุณาตรวจสอบเบอร์โทรศัพท์อีกครั้ง';
  } finally {
    submitting.value = false;
  }
};

const handleLinkAndLogin = async () => {
  if (!pinInput.value || pinInput.value.length !== 6) return;
  submitting.value = true;
  errorMessage.value = '';

  const targetBuilding = route.query.building || route.query.buildingId || (typeof window !== 'undefined' ? localStorage.getItem('liff_target_building') : null);

  try {
    const idToken = getLiffIdToken() || (import.meta.env.DEV && typeof window !== 'undefined' ? localStorage.getItem('dev_line_user_id') : null);
    const payload = {
      phone: phoneInput.value.trim(),
      pin: pinInput.value,
      building: targetBuilding || undefined,
      lineIdToken: idToken,
      lineDisplayName: lineDisplayName.value || null,
      linePictureUrl: linePictureUrl.value || null,
      lineStatusMessage: lineStatusMessage.value || null
    };

    const res = await authService.linkAndLogin(payload);

    if (res?.success) {
      const token = res.accessToken || res.data?.accessToken;
      const tenantData = res.user || res.tenant || res.data?.tenant || res.data?.user;
      if (token) {
        authStore.setLiffAuth(token, tenantData);
      }

      const pinCreated = res.pinCreated ?? res.data?.pinCreated;
      await showSuccess(
        pinCreated ? 'ตั้งรหัส PIN ใหม่และเข้าสู่ระบบสำเร็จ! 🎉' : 'เชื่อมต่อบัญชีสำเร็จ! 🎉',
        `ยินดีต้อนรับคุณ ${existingUserName.value || 'ลูกบ้าน'} เข้าสู่ระบบหอพัก`
      );
      router.replace('/liff/profile');
    } else {
      errorMessage.value = res?.message || 'รหัส PIN 6 หลักไม่ถูกต้อง';
    }
  } catch (err) {
    console.error('Link and login error in onboarding:', err);
    // หาก LINE ID Token หมดอายุ (code: LINE_TOKEN_INVALID) Axios Interceptor กลาง (utils/api.js)
    // จะ Hard Redirect ไปหน้า /liff ให้เข้าสู่ระบบใหม่อัตโนมัติอยู่แล้ว ไม่ต้องจัดการซ้ำที่นี่
    errorMessage.value = err.response?.data?.message || 'รหัส PIN 6 หลักไม่ถูกต้อง กรุณาลองใหม่อีกครั้ง';
  } finally {
    submitting.value = false;
  }
};

const handleForgotPin = async () => {
  const cleanPhone = phoneInput.value?.trim();
  const confirmed = await showConfirm(
    'ลืมรหัส PIN?',
    `ต้องการตั้งรหัส PIN ใหม่สำหรับเบอร์ ${cleanPhone} ใช่หรือไม่?`,
    'ตั้งรหัส PIN ใหม่',
    'ยกเลิก'
  );

  if (confirmed) {
    router.push({
      path: '/liff/setup-pin',
      query: {
        phone: cleanPhone || undefined,
        name: existingUserName.value || undefined,
        mode: 'reset'
      }
    });
  }
};

const handleLinkAccount = async () => {
  submitting.value = true;
  errorMessage.value = '';

  try {
    const payload = {
      inviteCode: form.inviteCode.trim().toUpperCase(),
      phoneLast4: form.phoneLast4.trim(),
      lineDisplayName: lineDisplayName.value || null,
      linePictureUrl: linePictureUrl.value || null,
      lineStatusMessage: lineStatusMessage.value || null
    };

    const res = await api.post('/api/v1/liff/auth/link-account', payload);

    await showSuccess('สำเร็จ', res.data.message || 'เชื่อมต่อบัญชี LINE ของคุณเรียบร้อยแล้ว');
    // หากบัญชีนี้ยังไม่เคยตั้งรหัส PIN มาก่อน ให้พาไปตั้งค่าต่อทันทีเพื่อความปลอดภัย
    const hasPin = res.data?.data?.hasPin ?? res.data?.hasPin;
    router.push(hasPin ? '/liff/profile' : '/liff/setup-pin');
  } catch (err) {
    errorMessage.value = err.response?.data?.message || 'การผูกบัญชีไม่สำเร็จ กรุณาตรวจสอบรหัสเชิญและเบอร์โทรศัพท์';
  } finally {
    submitting.value = false;
  }
};
</script>
