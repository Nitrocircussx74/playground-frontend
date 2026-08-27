<template>
  <div class="max-w-4xl mx-auto space-y-6 py-4">
    <!-- Header Banner -->
    <div class="bg-gradient-to-r from-purple-900 via-indigo-900 to-slate-900 rounded-3xl p-6 text-white shadow-xl flex flex-col md:flex-row items-center justify-between gap-4">
      <div class="flex items-center gap-4">
        <div class="w-16 h-16 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center text-3xl font-extrabold ring-2 ring-white/20 shadow-inner">
          {{ userInitials }}
        </div>
        <div>
          <h1 class="text-xl font-bold tracking-tight text-white">{{ meData?.name || authStore.currentUser?.name || 'Admin User' }}</h1>
          <div class="flex items-center gap-2 mt-1">
            <span class="px-2.5 py-0.5 rounded-full text-[11px] font-extrabold uppercase tracking-wider bg-purple-500/30 text-purple-200 border border-purple-400/40">
              {{ meData?.role || authStore.currentUser?.role || 'ADMIN' }}
            </span>
            <span class="text-xs text-purple-200">{{ meData?.email || authStore.currentUser?.email }}</span>
          </div>
        </div>
      </div>

      <button
        @click="fetchProfile"
        :disabled="loading"
        class="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-semibold backdrop-blur-md border border-white/15 transition-all shadow-xs"
      >
        <span>🔄 Refresh Profile</span>
      </button>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
      <!-- Card 1: Information & Building Access Rights -->
      <Card class="border-slate-200 bg-white shadow-sm">
        <CardHeader>
          <CardTitle class="text-base font-bold text-slate-900 flex items-center gap-2">
            <span>👤</span>
            <span>ข้อมูลส่วนตัว & สิทธิ์การเข้าถึงตึก</span>
          </CardTitle>
          <CardDescription class="text-xs text-slate-500">
            แสดงระดับสิทธิ์การใช้งานและตึกที่คุณได้รับมอบหมายให้ดูแล
          </CardDescription>
        </CardHeader>

        <CardContent class="space-y-4">
          <div class="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3 text-xs">
            <div class="flex justify-between items-center py-1.5 border-b border-slate-200/60">
              <span class="text-slate-500 font-semibold">ชื่อผู้ใช้งาน</span>
              <span class="font-bold text-slate-900">{{ meData?.name || 'N/A' }}</span>
            </div>

            <div class="flex justify-between items-center py-1.5 border-b border-slate-200/60">
              <span class="text-slate-500 font-semibold">อีเมลติดต่อ</span>
              <span class="font-bold text-slate-900 font-mono">{{ meData?.email || 'N/A' }}</span>
            </div>

            <div class="flex justify-between items-center py-1.5 border-b border-slate-200/60">
              <span class="text-slate-500 font-semibold">ระดับสิทธิ์ (Role)</span>
              <span
                class="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase"
                :class="isOwner ? 'bg-rose-100 text-rose-700 border border-rose-200' : 'bg-indigo-100 text-indigo-700 border border-indigo-200'"
              >
                {{ meData?.role || 'N/A' }}
              </span>
            </div>

            <div class="flex justify-between items-center py-1.5">
              <span class="text-slate-500 font-semibold">เบอร์โทรศัพท์</span>
              <span class="font-medium text-slate-800">{{ meData?.phone || 'ไม่ได้ระบุ' }}</span>
            </div>
          </div>

          <!-- Building Permissions Read-Only List -->
          <div class="space-y-2 pt-1">
            <h4 class="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center justify-between">
              <span>🏢 ตึกที่คุณมีสิทธิ์ดูแล (Read-Only)</span>
              <span v-if="isOwner" class="text-[10px] text-emerald-600 font-bold bg-emerald-50 px-2 py-0.5 rounded-full">
                เข้าถึงได้ทุกตึก (Owner Level)
              </span>
            </h4>

            <div v-if="isOwner" class="p-3 bg-indigo-50/60 border border-indigo-100 rounded-xl text-xs text-indigo-900 font-medium">
              🔑 ในฐานะ <span class="font-bold">OWNER</span> คุณมีสิทธิ์เข้าถึงและจัดการข้อมูลตึกและห้องพักทั้งหมดในระบบโดยปริยาย
            </div>

            <div v-else-if="assignedBuildings.length > 0" class="flex flex-wrap gap-2">
              <div
                v-for="b in assignedBuildings"
                :key="b.id"
                class="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-300 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-2xs"
              >
                <span>🏢</span>
                <span>{{ b.name }}</span>
              </div>
            </div>

            <div v-else class="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-800 font-medium">
              ⚠️ ยังไม่มีการมอบหมายสิทธิ์ดูแลตึกใดๆ กรุณาติดต่อ OWNER เพื่อเปิดสิทธิ์
            </div>
          </div>
        </CardContent>
      </Card>

      <!-- Card 2: Change Password Form -->
      <Card class="border-slate-200 bg-white shadow-sm">
        <CardHeader>
          <CardTitle class="text-base font-bold text-slate-900 flex items-center gap-2">
            <span>🔒</span>
            <span>เปลี่ยนรหัสผ่าน (Change Password)</span>
          </CardTitle>
          <CardDescription class="text-xs text-slate-500">
            อัปเดตรหัสผ่านใหม่สำหรับเข้าสู่ระบบหลังบ้านเพื่อความปลอดภัย
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form @submit.prevent="handleChangePassword" class="space-y-4">
            <div>
              <label class="block text-xs font-semibold text-slate-700 mb-1">รหัสผ่านปัจจุบัน (Current Password)</label>
              <input
                v-model="pwdForm.currentPassword"
                type="password"
                required
                placeholder="••••••••"
                class="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500"
              />
            </div>

            <div>
              <label class="block text-xs font-semibold text-slate-700 mb-1">รหัสผ่านใหม่ (New Password)</label>
              <input
                v-model="pwdForm.newPassword"
                type="password"
                required
                minlength="6"
                placeholder="อย่างน้อย 6 ตัวอักษร"
                class="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500"
              />
            </div>

            <div>
              <label class="block text-xs font-semibold text-slate-700 mb-1">ยืนยันรหัสผ่านใหม่ (Confirm Password)</label>
              <input
                v-model="pwdForm.confirmPassword"
                type="password"
                required
                placeholder="••••••••"
                class="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500"
              />
            </div>

            <div class="pt-2">
              <button
                type="submit"
                :disabled="updatingPwd"
                class="w-full py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-purple-600/20 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                <span>{{ updatingPwd ? 'กำลังบันทึก...' : '💾 บันทึกรหัสผ่านใหม่' }}</span>
              </button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue';
import { useAuthStore } from '@/stores/auth';
import adminService from '@/services/adminService';
import { showSuccess, showError } from '@/utils/swal';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';

const authStore = useAuthStore();
const meData = ref(null);
const loading = ref(false);
const updatingPwd = ref(false);

const pwdForm = reactive({
  currentPassword: '',
  newPassword: '',
  confirmPassword: ''
});

const isOwner = computed(() => {
  const role = (meData.value?.role || authStore.currentUser?.role || '').toLowerCase();
  return ['owner', 'super_admin', 'superadmin'].includes(role);
});

const assignedBuildings = computed(() => {
  if (!meData.value?.buildingPermissions) return [];
  return meData.value.buildingPermissions.map((p) => p.building).filter(Boolean);
});

const userInitials = computed(() => {
  const name = meData.value?.name || authStore.currentUser?.email || '';
  return name.slice(0, 2).toUpperCase();
});

onMounted(() => {
  fetchProfile();
});

const fetchProfile = async () => {
  loading.value = true;
  try {
    const res = await adminService.getMe();
    meData.value = res.data;
  } catch (error) {
    console.error('Failed to fetch profile:', error);
  } finally {
    loading.value = false;
  }
};

const handleChangePassword = async () => {
  if (pwdForm.newPassword !== pwdForm.confirmPassword) {
    showError('เกิดข้อผิดพลาด', 'รหัสผ่านใหม่และรหัสผ่านยืนยันไม่ตรงกัน');
    return;
  }

  updatingPwd.value = true;
  try {
    const res = await adminService.updatePassword({
      currentPassword: pwdForm.currentPassword,
      newPassword: pwdForm.newPassword
    });

    await showSuccess('สำเร็จ!', res.message || 'เปลี่ยนรหัสผ่านเรียบร้อยแล้ว');
    pwdForm.currentPassword = '';
    pwdForm.newPassword = '';
    pwdForm.confirmPassword = '';
  } catch (error) {
    showError('เกิดข้อผิดพลาด', error.response?.data?.message || 'ไม่สามารถเปลี่ยนรหัสผ่านได้');
  } finally {
    updatingPwd.value = false;
  }
};
</script>
