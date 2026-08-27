<template>
  <div class="min-h-screen bg-slate-100 py-8 px-4 font-sans text-slate-900">
    <div class="max-w-md mx-auto space-y-6">
      <!-- Header -->
      <div class="text-center space-y-2">
        <div class="w-12 h-12 rounded-2xl bg-indigo-600 text-white text-2xl font-bold flex items-center justify-center mx-auto shadow-md shadow-indigo-600/30">
          🏢
        </div>
        <h1 class="text-2xl font-bold text-slate-900 tracking-tight">ลงทะเบียนผู้เช่าใหม่ (LIFF)</h1>
        <p class="text-xs text-slate-500">กรอกรหัสเชิญและข้อมูลส่วนตัวเพื่อลงทะเบียนผูกเข้ากับห้องพัก</p>
      </div>

      <!-- Success Card -->
      <div v-if="successData" class="p-6 bg-white rounded-3xl border border-emerald-200 shadow-md text-center space-y-4">
        <div class="w-16 h-16 bg-emerald-100 text-emerald-600 text-3xl rounded-full flex items-center justify-center mx-auto">
          ✓
        </div>
        <h2 class="text-xl font-bold text-emerald-950">ลงทะเบียนเข้าพักสำเร็จ!</h2>
        <p class="text-sm text-slate-600">
          ยินดีต้อนรับคุณ <span class="font-bold text-slate-900">{{ successData.tenant.firstName }} {{ successData.tenant.lastName }}</span><br />
          เข้าสู่ <span class="font-extrabold text-indigo-600">ห้อง {{ successData.room.roomNumber }}</span>
        </p>

        <div class="pt-4 border-t border-slate-100">
          <router-link to="/liff/profile" class="inline-block px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-semibold text-xs transition-all shadow-sm">
            ไปยังศูนย์กลางผู้เช่า (Tenant Hub)
          </router-link>
        </div>
      </div>

      <!-- Registration Form Card -->
      <div v-else class="p-6 bg-white rounded-3xl border border-slate-200 shadow-sm space-y-5">
        <div v-if="errorMessage" class="p-4 bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium rounded-2xl">
          ⚠️ {{ errorMessage }}
        </div>

        <!-- Verified Room Information Banner -->
        <div v-if="verifiedRoom" class="p-4 bg-indigo-50 border border-indigo-200 rounded-2xl space-y-1">
          <div class="text-xs font-bold text-indigo-900 flex items-center gap-1.5">
            <span>✓ ตรวจสอบรหัสสำเร็จ:</span>
            <span class="text-indigo-600 font-extrabold">ห้อง {{ verifiedRoom.roomNumber }} (ชั้น {{ verifiedRoom.floor }})</span>
          </div>
          <div class="text-xs text-indigo-700">
            ค่าเช่าประจำเดือน: <span class="font-bold font-mono">฿{{ Number(verifiedRoom.price).toLocaleString() }}</span> บาท/เดือน
          </div>
        </div>

        <form @submit.prevent="handleRegister" class="space-y-4">
          <!-- 1. Invite Code (Top Priority Field) -->
          <div>
            <div class="flex items-center justify-between mb-1">
              <label class="block text-xs font-bold text-indigo-700">
                🔑 รหัสเชิญลงทะเบียน (Invite Code) <span class="text-rose-500">*</span>
              </label>

              <button
                type="button"
                @click="verifyCode"
                :disabled="verifying || !form.inviteCode"
                class="text-[11px] font-bold text-indigo-600 hover:text-indigo-800 disabled:opacity-50"
              >
                {{ verifying ? 'กำลังตรวจ...' : 'ตรวจรหัส' }}
              </button>
            </div>

            <input
              v-model="form.inviteCode"
              @input="onInviteInput"
              type="text"
              placeholder="กรอกรหัสเชิญ 6 หลัก e.g. X9K2P4"
              required
              maxlength="10"
              class="w-full bg-indigo-50/50 border border-indigo-200 rounded-2xl px-4 py-3 text-base font-mono font-bold text-indigo-950 placeholder-indigo-300 uppercase focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-600"
            />
          </div>

          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block text-xs font-semibold text-slate-700 mb-1">ชื่อจริง (First Name) <span class="text-rose-500">*</span></label>
              <input
                v-model="form.firstName"
                type="text"
                placeholder="สมชาย"
                required
                class="w-full bg-slate-50 border border-slate-300 rounded-2xl px-3.5 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
            </div>

            <div>
              <label class="block text-xs font-semibold text-slate-700 mb-1">นามสกุล (Last Name) <span class="text-rose-500">*</span></label>
              <input
                v-model="form.lastName"
                type="text"
                placeholder="ใจดี"
                required
                class="w-full bg-slate-50 border border-slate-300 rounded-2xl px-3.5 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
            </div>
          </div>

          <div>
            <label class="block text-xs font-semibold text-slate-700 mb-1">เบอร์โทรศัพท์ (Phone) <span class="text-rose-500">*</span></label>
            <input
              v-model="form.phone"
              type="tel"
              placeholder="0812345678"
              required
              class="w-full bg-slate-50 border border-slate-300 rounded-2xl px-3.5 py-2.5 text-sm font-mono text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
            />
          </div>

          <div>
            <label class="block text-xs font-semibold text-slate-700 mb-1">เลขบัตรประชาชน (ID Card)</label>
            <input
              v-model="form.idCard"
              type="text"
              placeholder="1100200300401"
              maxlength="13"
              class="w-full bg-slate-50 border border-slate-300 rounded-2xl px-3.5 py-2.5 text-sm font-mono text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
            />
          </div>

          <button
            type="submit"
            :disabled="loading"
            class="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-bold text-sm transition-all shadow-md shadow-indigo-600/20 disabled:opacity-50 mt-2"
          >
            {{ loading ? 'กำลังลงทะเบียน...' : 'ยืนยันลงทะเบียนผูกห้องพัก' }}
          </button>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import liff from '@line/liff';
import api from '@/utils/api';

const route = useRoute();
const loading = ref(false);
const verifying = ref(false);
const errorMessage = ref('');
const successData = ref(null);
const verifiedRoom = ref(null);
const lineUserId = ref('');

const form = reactive({
  inviteCode: '',
  firstName: '',
  lastName: '',
  phone: '',
  idCard: ''
});

onMounted(async () => {
  // Read invite code from URL query parameter
  if (route.query.inviteCode) {
    form.inviteCode = String(route.query.inviteCode).toUpperCase();
    verifyCode();
  }

  const liffId = import.meta.env.VITE_LINE_LIFF_ID || '2000000000-mockliffid';
  try {
    await liff.init({ liffId });
    if (liff.isLoggedIn()) {
      const profile = await liff.getProfile();
      lineUserId.value = profile.userId;
    }
  } catch (err) {
    console.warn('LIFF init fallback mode:', err.message);
  }
});

const onInviteInput = () => {
  verifiedRoom.value = null;
  errorMessage.value = '';
  if (form.inviteCode.length === 6) {
    verifyCode();
  }
};

const verifyCode = async () => {
  if (!form.inviteCode) return;
  verifying.value = true;
  errorMessage.value = '';
  try {
    const res = await api.get(`/api/v1/liff/invites/verify/${form.inviteCode}`);
    verifiedRoom.value = res.data.data;
  } catch (error) {
    verifiedRoom.value = null;
    errorMessage.value = error.response?.data?.message || 'รหัสเชิญไม่ถูกต้องหรือหมดอายุแล้ว';
  } finally {
    verifying.value = false;
  }
};

const handleRegister = async () => {
  loading.value = true;
  errorMessage.value = '';

  try {
    const payload = {
      ...form,
      lineUserId: lineUserId.value || null
    };

    const res = await api.post('/api/v1/liff/register/invite', payload);
    successData.value = res.data.data;
  } catch (error) {
    errorMessage.value = error.response?.data?.message || 'การลงทะเบียนไม่สำเร็จ รหัสเชิญอาจผิดหรือหมดอายุ';
  } finally {
    loading.value = false;
  }
};
</script>
