<template>
  <div class="min-h-screen bg-gradient-to-b from-emerald-50/40 via-slate-50 to-indigo-50/30 text-slate-800 flex flex-col items-center justify-center p-5 sm:p-6 font-sans">
    <div class="w-full max-w-sm space-y-5">
      <!-- Header Branding -->
      <div class="text-center space-y-2.5">
        <div class="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-100/80 mx-auto flex items-center justify-center text-emerald-600 shadow-xs">
          <Link2 class="w-6 h-6" />
        </div>

        <div class="space-y-1">
          <h1 class="text-lg sm:text-xl font-bold tracking-tight text-slate-900">ผูกบัญชีผู้เช่า</h1>
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
        <form v-if="activeMode === 'phone'" @submit.prevent="handleVerifyByPhone" class="space-y-3.5 text-xs">
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
  CheckCircle2
} from 'lucide-vue-next';
import { initLiff, isLiffLoggedIn, getLiffProfile } from '@/utils/liff';
import api from '@/utils/api';
import { showSuccess } from '@/utils/swal';

const route = useRoute();
const router = useRouter();
const activeMode = ref('phone');
const phoneInput = ref('');
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
  if (route.query.code) {
    form.inviteCode = String(route.query.code).trim().toUpperCase();
    activeMode.value = 'invite';
  }

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

  try {
    const payload = {
      phone: phoneInput.value.trim(),
      lineDisplayName: lineDisplayName.value || null,
      linePictureUrl: linePictureUrl.value || null,
      lineStatusMessage: lineStatusMessage.value || null
    };

    const res = await api.post('/api/v1/liff/auth/verify-phone', payload);
    await showSuccess('สำเร็จ', res.data.message || 'เชื่อมต่อบัญชี LINE ของคุณเรียบร้อยแล้ว');
    router.push('/liff/profile');
  } catch (err) {
    errorMessage.value = err.response?.data?.message || 'ไม่พบข้อมูลลูกบ้านที่ตรงกับเบอร์โทรศัพท์นี้ กรุณาตรวจสอบเบอร์โทรศัพท์อีกครั้ง';
  } finally {
    submitting.value = false;
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
    router.push('/liff/profile');
  } catch (err) {
    errorMessage.value = err.response?.data?.message || 'การผูกบัญชีไม่สำเร็จ กรุณาตรวจสอบรหัสเชิญและเบอร์โทรศัพท์';
  } finally {
    submitting.value = false;
  }
};
</script>
