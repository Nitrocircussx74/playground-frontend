<template>
  <div class="min-h-screen bg-slate-50/60 py-6 sm:py-8 px-4 font-sans text-slate-800">
    <div class="max-w-md mx-auto space-y-5">
      <!-- Header -->
      <div class="text-center space-y-2">
        <div class="w-12 h-12 rounded-xl bg-primary/10 border border-primary/20 text-primary flex items-center justify-center mx-auto">
          <Building2 class="w-6 h-6" />
        </div>
        <Badge v-if="buildingName && buildingName !== 'หอพัก'" variant="neutral" class="bg-primary/10 text-primary border border-primary/20">
          <Building2 class="w-3.5 h-3.5" />
          <span>{{ buildingName }}</span>
        </Badge>
        <h1 class="text-xl font-bold text-slate-900 tracking-tight">ลงทะเบียนผู้เช่าใหม่</h1>
        <p class="text-xs text-slate-500">กรอกรหัสเชิญและข้อมูลส่วนตัวเพื่อผูกบัญชีกับห้องพัก</p>
      </div>

      <!-- Success Card -->
      <Card v-if="successData" class="p-6 border-emerald-100 text-center space-y-4">
        <div class="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center mx-auto">
          <CheckCircle2 class="w-6 h-6" />
        </div>
        <div class="space-y-1">
          <h2 class="text-lg font-bold text-slate-900">ลงทะเบียนสำเร็จ</h2>
          <p class="text-xs text-slate-600 leading-relaxed">
            ยินดีต้อนรับคุณ <span class="font-semibold text-slate-900">{{ successData.tenant.firstName }} {{ successData.tenant.lastName }}</span><br />
            เข้าสู่ <span class="font-bold text-primary">ห้อง {{ successData.room.roomNumber }}</span>
          </p>
        </div>

        <div class="pt-3 border-t border-slate-100">
          <!-- หากยังไม่เคยตั้งรหัส PIN ให้พาไปตั้งค่าก่อนเข้าใช้งาน เพื่อป้องกันบัญชีตั้งแต่ครั้งแรก -->
          <Button as-child>
            <router-link :to="successData.hasPin ? '/liff/profile' : '/liff/setup-pin'">
              <span>{{ successData.hasPin ? 'ไปยังหน้าหลักผู้เช่า' : 'ตั้งรหัส PIN 6 หลัก' }}</span>
              <ArrowRight class="w-3.5 h-3.5" />
            </router-link>
          </Button>
        </div>
      </Card>

      <!-- Registration Form Card -->
      <Card v-else class="p-5 sm:p-6 space-y-4">
        <div v-if="errorMessage" class="p-3 bg-rose-50 border border-rose-100 text-rose-700 text-xs font-medium rounded-xl flex items-center gap-2">
          <AlertCircle class="w-4 h-4 shrink-0" />
          <span>{{ errorMessage }}</span>
        </div>

        <!-- Verified Room Information Banner -->
        <div v-if="verifiedRoom" class="p-3.5 bg-primary/5 border border-primary/20 rounded-xl space-y-1">
          <div class="text-xs font-semibold text-slate-900 flex items-center gap-1.5">
            <CheckCircle2 class="w-3.5 h-3.5 text-primary" />
            <span>รหัสถูกต้อง: <strong class="text-primary font-bold">ห้อง {{ verifiedRoom.roomNumber }} (ชั้น {{ verifiedRoom.floor }})</strong></span>
          </div>
          <div class="text-xs text-slate-600 pl-5">
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

              <Button
                type="button"
                variant="link"
                size="sm"
                class="h-auto p-0 text-xs"
                :disabled="verifying || !form.inviteCode"
                @click="verifyCode"
              >
                {{ verifying ? 'กำลังตรวจสอบ...' : 'ตรวจสอบรหัส' }}
              </Button>
            </div>

            <Input
              v-model="form.inviteCode"
              @input="onInviteInput"
              type="text"
              placeholder="กรอกรหัสเชิญ 6 หลัก เช่น X9K2P4"
              required
              maxlength="10"
              class="text-sm font-mono font-bold uppercase placeholder:font-sans placeholder:font-normal"
            />
          </div>

          <div class="grid grid-cols-2 gap-3">
            <div class="space-y-1">
              <label class="block text-xs font-medium text-slate-700">ชื่อจริง <span class="text-rose-500">*</span></label>
              <Input v-model="form.firstName" type="text" placeholder="สมชาย" required />
            </div>

            <div class="space-y-1">
              <label class="block text-xs font-medium text-slate-700">นามสกุล <span class="text-rose-500">*</span></label>
              <Input v-model="form.lastName" type="text" placeholder="ใจดี" required />
            </div>
          </div>

          <div class="space-y-1">
            <label class="block text-xs font-medium text-slate-700">เบอร์โทรศัพท์ <span class="text-rose-500">*</span></label>
            <Input v-model="form.phone" type="tel" placeholder="0812345678" required class="font-mono" />
          </div>

          <div class="space-y-1">
            <label class="block text-xs font-medium text-slate-700">เลขบัตรประชาชน (ไม่บังคับ)</label>
            <Input v-model="form.idCard" type="text" placeholder="1100200300401" maxlength="13" class="font-mono" />
          </div>

          <Button type="submit" class="w-full mt-1" :disabled="loading">
            <UserPlus class="w-4 h-4" />
            <span>{{ loading ? 'กำลังลงทะเบียน...' : 'ยืนยันลงทะเบียนผูกห้องพัก' }}</span>
          </Button>
        </form>
      </Card>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import {
  Building2,
  CheckCircle2,
  ArrowRight,
  AlertCircle,
  UserPlus
} from 'lucide-vue-next';
import { initLiff, isLiffLoggedIn, getLiffProfile } from '@/utils/liff';
import api from '@/utils/api';
import { useDynamicTheme } from '@/composables/useDynamicTheme';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';

const route = useRoute();
const router = useRouter();
const { fetchAndApplyBuildingTheme, buildingName } = useDynamicTheme();
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
  const targetBuilding = route.query.building || route.query.buildingId || (typeof window !== 'undefined' ? localStorage.getItem('liff_target_building') : null);
  if (targetBuilding) {
    fetchAndApplyBuildingTheme(targetBuilding);
  }

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
    // รหัสนี้เป็นของระบบผูกบัญชีลูกบ้านเดิม (Tenant.inviteCode) ไม่ใช่รหัสลงทะเบียนใหม่ (RoomInvite.code)
    // พาไปหน้าที่ถูกต้องอัตโนมัติแทนที่จะโชว์ "ไม่พบรหัสเชิญ" ให้ผู้ใช้งง
    if (error.response?.data?.code === 'TENANT_LINK_CODE') {
      router.replace({ path: '/liff/onboarding', query: { ...route.query, code: form.inviteCode } });
      return;
    }
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
