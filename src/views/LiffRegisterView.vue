<template>
  <div class="min-h-screen bg-slate-50/60 py-6 sm:py-8 px-4 font-sans text-slate-800">
    <div class="max-w-md mx-auto space-y-5">
      <!-- Header -->
      <div class="text-center space-y-2">
        <div class="w-12 h-12 rounded-2xl bg-indigo-50 border border-indigo-100/80 text-indigo-600 flex items-center justify-center mx-auto">
          <Building2 class="w-6 h-6" />
        </div>
        <h1 class="text-xl font-bold text-slate-900 tracking-tight">ลงทะเบียนผู้เช่าใหม่</h1>
        <p class="text-xs text-slate-500">กรอกรหัสเชิญและข้อมูลส่วนตัวเพื่อผูกบัญชีกับห้องพัก</p>
      </div>

      <!-- Success Card -->
      <div v-if="successData" class="p-6 bg-white rounded-2xl border border-emerald-100 shadow-xs text-center space-y-4">
        <div class="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto">
          <CheckCircle2 class="w-6 h-6" />
        </div>
        <div class="space-y-1">
          <h2 class="text-lg font-bold text-slate-900">ลงทะเบียนสำเร็จ</h2>
          <p class="text-xs text-slate-600 leading-relaxed">
            ยินดีต้อนรับคุณ <span class="font-semibold text-slate-900">{{ successData.tenant.firstName }} {{ successData.tenant.lastName }}</span><br />
            เข้าสู่ <span class="font-bold text-indigo-600">ห้อง {{ successData.room.roomNumber }}</span>
          </p>
        </div>

        <div class="pt-3 border-t border-slate-100">
          <!-- หากยังไม่เคยตั้งรหัส PIN ให้พาไปตั้งค่าก่อนเข้าใช้งาน เพื่อป้องกันบัญชีตั้งแต่ครั้งแรก -->
          <router-link
            :to="successData.hasPin ? '/liff/profile' : '/liff/setup-pin'"
            class="inline-flex items-center gap-1.5 px-5 py-2.5 bg-indigo-500 hover:bg-indigo-600 text-white rounded-xl font-semibold text-xs transition-colors shadow-xs"
          >
            <span>{{ successData.hasPin ? 'ไปยังหน้าหลักผู้เช่า' : 'ตั้งรหัส PIN 6 หลัก' }}</span>
            <ArrowRight class="w-3.5 h-3.5" />
          </router-link>
        </div>
      </div>

      <!-- Registration Form Card -->
      <div v-else class="p-5 sm:p-6 bg-white rounded-2xl border border-slate-100/90 shadow-xs space-y-4">
        <div v-if="errorMessage" class="p-3 bg-rose-50 border border-rose-100 text-rose-700 text-xs font-medium rounded-xl flex items-center gap-2">
          <AlertCircle class="w-4 h-4 shrink-0" />
          <span>{{ errorMessage }}</span>
        </div>

        <!-- Verified Room Information Banner -->
        <div v-if="verifiedRoom" class="p-3.5 bg-indigo-50/70 border border-indigo-100 rounded-xl space-y-1">
          <div class="text-xs font-semibold text-indigo-900 flex items-center gap-1.5">
            <CheckCircle2 class="w-3.5 h-3.5 text-indigo-600" />
            <span>รหัสถูกต้อง: <strong class="text-indigo-600 font-bold">ห้อง {{ verifiedRoom.roomNumber }} (ชั้น {{ verifiedRoom.floor }})</strong></span>
          </div>
          <div class="text-[11px] text-indigo-700 pl-5">
            ค่าเช่า: <span class="font-semibold font-mono">฿{{ Number(verifiedRoom.price).toLocaleString() }}</span> / เดือน
          </div>
        </div>

        <form @submit.prevent="handleRegister" class="space-y-3.5">
          <!-- 1. Invite Code -->
          <div class="space-y-1">
            <div class="flex items-center justify-between">
              <label class="block text-xs font-medium text-slate-700">
                รหัสเชิญลงทะเบียน <span class="text-rose-500">*</span>
              </label>

              <button
                type="button"
                @click="verifyCode"
                :disabled="verifying || !form.inviteCode"
                class="text-[11px] font-semibold text-indigo-600 hover:text-indigo-800 disabled:opacity-50"
              >
                {{ verifying ? 'กำลังตรวจสอบ...' : 'ตรวจสอบรหัส' }}
              </button>
            </div>

            <input
              v-model="form.inviteCode"
              @input="onInviteInput"
              type="text"
              placeholder="กรอกรหัสเชิญ 6 หลัก เช่น X9K2P4"
              required
              maxlength="10"
              class="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm font-mono font-bold text-slate-900 placeholder:font-sans placeholder:text-slate-400 placeholder:font-normal uppercase focus:outline-hidden focus:border-indigo-400"
            />
          </div>

          <div class="grid grid-cols-2 gap-3">
            <div class="space-y-1">
              <label class="block text-xs font-medium text-slate-700">ชื่อจริง <span class="text-rose-500">*</span></label>
              <input
                v-model="form.firstName"
                type="text"
                placeholder="สมชาย"
                required
                class="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-hidden focus:border-indigo-400"
              />
            </div>

            <div class="space-y-1">
              <label class="block text-xs font-medium text-slate-700">นามสกุล <span class="text-rose-500">*</span></label>
              <input
                v-model="form.lastName"
                type="text"
                placeholder="ใจดี"
                required
                class="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-hidden focus:border-indigo-400"
              />
            </div>
          </div>

          <div class="space-y-1">
            <label class="block text-xs font-medium text-slate-700">เบอร์โทรศัพท์ <span class="text-rose-500">*</span></label>
            <input
              v-model="form.phone"
              type="tel"
              placeholder="0812345678"
              required
              class="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-mono text-slate-800 placeholder:text-slate-400 focus:outline-hidden focus:border-indigo-400"
            />
          </div>

          <div class="space-y-1">
            <label class="block text-xs font-medium text-slate-700">เลขบัตรประชาชน (ไม่บังคับ)</label>
            <input
              v-model="form.idCard"
              type="text"
              placeholder="1100200300401"
              maxlength="13"
              class="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-mono text-slate-800 placeholder:text-slate-400 focus:outline-hidden focus:border-indigo-400"
            />
          </div>

          <button
            type="submit"
            :disabled="loading"
            class="w-full py-3 bg-indigo-500 hover:bg-indigo-600 text-white rounded-xl font-semibold text-xs transition-colors shadow-xs disabled:opacity-50 mt-1 flex items-center justify-center gap-1.5"
          >
            <UserPlus class="w-4 h-4" />
            <span>{{ loading ? 'กำลังลงทะเบียน...' : 'ยืนยันลงทะเบียนผูกห้องพัก' }}</span>
          </button>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import {
  Building2,
  CheckCircle2,
  ArrowRight,
  AlertCircle,
  UserPlus
} from 'lucide-vue-next';
import { initLiff, isLiffLoggedIn, getLiffProfile } from '@/utils/liff';
import api from '@/utils/api';

const route = useRoute();
const loading = ref(false);
const verifying = ref(false);
const errorMessage = ref('');
const successData = ref(null);
const verifiedRoom = ref(null);

const form = reactive({
  inviteCode: '',
  firstName: '',
  lastName: '',
  phone: '',
  idCard: ''
});

onMounted(async () => {
  if (route.query.inviteCode) {
    form.inviteCode = String(route.query.inviteCode).toUpperCase();
    verifyCode();
  }

  try {
    await initLiff();
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
    const payload = { ...form };

    try {
      if (isLiffLoggedIn()) {
        const profile = await getLiffProfile();
        if (profile) {
          payload.lineDisplayName = profile.displayName || null;
          payload.linePictureUrl = profile.pictureUrl || null;
          payload.lineStatusMessage = profile.statusMessage || null;
        }
      }
    } catch (profileErr) {
      console.warn('Could not read LINE profile:', profileErr);
    }

    const res = await api.post('/api/v1/liff/register/invite', payload);
    successData.value = res.data.data;
  } catch (error) {
    errorMessage.value = error.response?.data?.message || 'การลงทะเบียนไม่สำเร็จ รหัสเชิญอาจผิดหรือหมดอายุ';
  } finally {
    loading.value = false;
  }
};
</script>
