<template>
  <div class="min-h-screen bg-slate-900 text-white flex flex-col items-center justify-center p-6 relative overflow-hidden font-sans">
    <!-- Background Ornaments -->
    <div class="absolute -top-32 -left-32 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl"></div>
    <div class="absolute -bottom-32 -right-32 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl"></div>

    <div class="relative z-10 w-full max-w-sm space-y-6">
      <!-- Header Branding -->
      <div class="text-center space-y-3">
        <div class="w-16 h-16 rounded-3xl bg-gradient-to-tr from-emerald-500 to-teal-400 p-0.5 shadow-xl shadow-emerald-500/20 mx-auto flex items-center justify-center">
          <div class="w-full h-full bg-slate-900 rounded-[22px] flex items-center justify-center text-3xl font-bold text-emerald-400">
            🔐
          </div>
        </div>

        <div>
          <h1 class="text-xl font-extrabold tracking-tight text-white">ผูกบัญชีลูกบ้าน (Account Linking)</h1>
          <p class="text-xs text-slate-400 mt-1">กรอกรหัสเชิญ 6 หลักและเบอร์โทรศัพท์ 4 ตัวท้ายเพื่อเชื่อมต่อบัญชี LINE</p>
        </div>
      </div>

      <!-- Form Card -->
      <div class="p-6 bg-slate-800/90 rounded-3xl border border-slate-700/80 shadow-2xl backdrop-blur-md space-y-5">
        <form @submit.prevent="handleLinkAccount" class="space-y-4 text-xs">
          <!-- 1. Invite Code (6-digit alphanumeric) -->
          <div>
            <label class="block font-bold text-slate-200 mb-1.5 flex items-center gap-1">
              <span>🔑</span>
              <span>รหัสเชิญ 6 หลัก (Invite Code)</span>
              <span class="text-rose-400">*</span>
            </label>
            <input
              v-model="form.inviteCode"
              type="text"
              maxlength="6"
              placeholder="e.g. X7K9M2"
              required
              class="w-full bg-slate-900 border border-slate-700 rounded-2xl px-4 py-3 font-mono font-bold text-base text-center uppercase tracking-widest text-emerald-400 focus:outline-hidden focus:border-emerald-500 transition-colors"
            />
          </div>

          <!-- 2. Phone Last 4 Digits -->
          <div>
            <label class="block font-bold text-slate-200 mb-1.5 flex items-center gap-1">
              <span>📱</span>
              <span>เบอร์โทรศัพท์ 4 ตัวท้าย</span>
              <span class="text-rose-400">*</span>
            </label>
            <input
              v-model="form.phoneLast4"
              type="text"
              maxlength="4"
              placeholder="e.g. 5678"
              required
              class="w-full bg-slate-900 border border-slate-700 rounded-2xl px-4 py-3 font-mono font-bold text-base text-center tracking-widest text-white focus:outline-hidden focus:border-emerald-500 transition-colors"
            />
          </div>

          <!-- Alert Error Message -->
          <div v-if="errorMessage" class="p-3 bg-rose-500/10 border border-rose-500/30 rounded-2xl text-rose-300 text-xs font-semibold text-center">
            ⚠️ {{ errorMessage }}
          </div>

          <!-- Submit Button -->
          <button
            type="submit"
            :disabled="submitting || !form.inviteCode || !form.phoneLast4"
            class="w-full py-3.5 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white rounded-2xl font-bold text-xs shadow-lg shadow-emerald-500/25 transition-all disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>{{ submitting ? 'กำลังยืนยันข้อมูล...' : '✅ ยืนยันการผูกบัญชีลูกบ้าน' }}</span>
          </button>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import liff from '@line/liff';
import api from '@/utils/api';
import { showSuccess, showError } from '@/utils/swal';

const router = useRouter();
const lineUserId = ref('');
const submitting = ref(false);
const errorMessage = ref('');

const form = reactive({
  inviteCode: '',
  phoneLast4: ''
});

const liffId = import.meta.env.VITE_LIFF_ID || '';

onMounted(async () => {
  if (!liffId) return;
  try {
    await liff.init({ liffId });
    if (liff.isLoggedIn()) {
      const profile = await liff.getProfile();
      lineUserId.value = profile.userId;
    }
  } catch (err) {
    console.warn('LIFF init fallback in LiffOnboarding:', err.message);
  }
});

const handleLinkAccount = async () => {
  submitting.value = true;
  errorMessage.value = '';

  try {
    const payload = {
      inviteCode: form.inviteCode.trim().toUpperCase(),
      phoneLast4: form.phoneLast4.trim(),
      lineUserId: lineUserId.value || null
    };

    const res = await api.post('/api/v1/liff/auth/link-account', payload);

    await showSuccess('ผูกบัญชีสำเร็จ! 🎉', res.data.message || 'เชื่อมต่อบัญชี LINE ของคุณเรียบร้อยแล้ว');
    router.push('/liff/profile');
  } catch (err) {
    errorMessage.value = err.response?.data?.message || 'การผูกบัญชีไม่สำเร็จ กรุณาตรวจสอบรหัสเชิญและเบอร์โทรศัพท์';
  } finally {
    submitting.value = false;
  }
};
</script>
