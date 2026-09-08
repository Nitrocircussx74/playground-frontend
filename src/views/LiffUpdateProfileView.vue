<template>
  <div class="space-y-5 pb-6 font-sans text-slate-800">
    <!-- Header -->
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-lg font-bold text-slate-900 tracking-tight">แก้ไขข้อมูลส่วนตัว</h1>
        <p class="text-xs text-slate-500 mt-0.5">อัปเดตข้อมูลติดต่อและยานพาหนะ</p>
      </div>

      <!-- Top Save Header Button -->
      <button
        type="button"
        @click="saveProfile"
        :disabled="isSubmitting || !!phoneError"
        class="px-4 py-2 bg-indigo-500 hover:bg-indigo-600 text-white rounded-xl text-xs font-semibold transition-colors shadow-xs disabled:opacity-50 shrink-0 flex items-center gap-1.5"
      >
        <Save class="w-3.5 h-3.5" />
        <span>{{ isSubmitting ? 'บันทึก...' : 'บันทึก' }}</span>
      </button>
    </div>

    <!-- Toast Feedback Banner -->
    <div
      v-if="toastMessage"
      class="p-3.5 rounded-2xl text-xs font-medium shadow-xs transition-all flex items-center justify-between border"
      :class="toastType === 'success' ? 'bg-emerald-50 text-emerald-800 border-emerald-200/80' : 'bg-rose-50 text-rose-800 border-rose-200/80'"
    >
      <span>{{ toastMessage }}</span>
      <button @click="toastMessage = ''" class="text-slate-400 hover:text-slate-700 p-1">
        <X class="w-3.5 h-3.5" />
      </button>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="p-8 bg-white rounded-2xl border border-slate-100/80 text-center text-slate-400 text-xs shadow-xs">
      <div class="animate-spin w-6 h-6 border-2 border-indigo-400 border-t-transparent rounded-full mx-auto mb-2.5"></div>
      กำลังโหลดข้อมูลส่วนตัว...
    </div>

    <form v-else @submit.prevent="saveProfile" class="space-y-4">
      <!-- Section 1: Read-Only Tenant Info -->
      <div class="p-4 sm:p-5 bg-white rounded-2xl border border-slate-100/90 shadow-xs space-y-3.5">
        <div class="flex items-center justify-between border-b border-slate-100 pb-2.5">
          <div class="flex items-center gap-2">
            <Shield class="w-4 h-4 text-slate-400" />
            <h3 class="text-xs font-bold text-slate-700">ข้อมูลสัญญาหอพัก</h3>
          </div>
          <span class="text-[10px] bg-slate-100 text-slate-500 font-medium px-2 py-0.5 rounded-full">ไม่สามารถแก้ไขได้</span>
        </div>

        <div class="space-y-3">
          <div class="space-y-1">
            <label class="block text-xs font-medium text-slate-600">ชื่อ-นามสกุล ผู้เช่า</label>
            <input
              type="text"
              :value="`${profile.firstName} ${profile.lastName}`"
              disabled
              class="w-full bg-slate-50 border border-slate-200/80 rounded-xl px-3.5 py-2.5 text-xs text-slate-600 font-medium cursor-not-allowed"
            />
          </div>

          <div class="grid grid-cols-2 gap-3">
            <div class="space-y-1">
              <label class="block text-xs font-medium text-slate-600">ห้องพัก</label>
              <input
                type="text"
                :value="`ห้อง ${profile.roomNumber}`"
                disabled
                class="w-full bg-slate-50 border border-slate-200/80 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 font-bold cursor-not-allowed"
              />
            </div>

            <div class="space-y-1">
              <label class="block text-xs font-medium text-slate-600">วันสิ้นสุดสัญญา</label>
              <input
                type="text"
                :value="profile.contractEndDate"
                disabled
                class="w-full bg-slate-50 border border-slate-200/80 rounded-xl px-3.5 py-2.5 text-xs text-slate-500 font-medium cursor-not-allowed"
              />
            </div>
          </div>

          <p class="text-[11px] text-slate-400">
            หากต้องการเปลี่ยนแปลงชื่อผู้เช่าหรือย้ายห้องพัก กรุณาติดต่อสำนักงานหอพัก
          </p>
        </div>
      </div>

      <!-- Section 2: Contact Info (Editable) -->
      <div class="p-4 sm:p-5 bg-white rounded-2xl border border-slate-100/90 shadow-xs space-y-3.5">
        <div class="flex items-center gap-2 border-b border-slate-100 pb-2.5">
          <Phone class="w-4 h-4 text-indigo-500" />
          <h3 class="text-xs font-bold text-slate-800">ข้อมูลติดต่อ</h3>
        </div>

        <div class="space-y-1">
          <label class="block text-xs font-medium text-slate-700">
            เบอร์โทรศัพท์ <span class="text-rose-500">*</span>
          </label>
          <input
            v-model="profile.phone"
            type="tel"
            maxlength="10"
            placeholder="เช่น 0812345678"
            required
            @input="validatePhone"
            class="w-full bg-slate-50 border rounded-xl px-3.5 py-2.5 text-xs text-slate-800 font-mono font-medium focus:outline-hidden focus:ring-2 focus:ring-indigo-100"
            :class="phoneError ? 'border-rose-300 focus:border-rose-400' : 'border-slate-200 focus:border-indigo-400'"
          />
          <span v-if="phoneError" class="text-[11px] font-medium text-rose-500 block pt-0.5">
            {{ phoneError }}
          </span>
        </div>
      </div>

      <!-- Section 3: Vehicle Management -->
      <div
        v-if="featureStore.isEnabled('ENABLE_VEHICLE_MANAGEMENT')"
        class="p-4 sm:p-5 bg-white rounded-2xl border border-slate-100/90 shadow-xs space-y-3.5"
      >
        <div class="flex items-center justify-between border-b border-slate-100 pb-2.5">
          <div class="flex items-center gap-2">
            <Car class="w-4 h-4 text-indigo-500" />
            <h3 class="text-xs font-bold text-slate-800">จัดการยานพาหนะ</h3>
          </div>
          <button
            type="button"
            @click="showAddVehicleModal = true"
            class="inline-flex items-center gap-1 text-xs font-semibold text-indigo-600 hover:text-indigo-800"
          >
            <Plus class="w-3.5 h-3.5" />
            <span>เพิ่มยานพาหนะ</span>
          </button>
        </div>

        <!-- Registered Vehicles List -->
        <div v-if="vehicles.length > 0" class="space-y-2">
          <div
            v-for="v in vehicles"
            :key="v.id"
            class="p-3 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between"
          >
            <div class="space-y-0.5">
              <div class="flex items-center gap-2">
                <component :is="v.type === 'car' ? Car : Bike" class="w-4 h-4 text-slate-500" />
                <span class="font-mono font-bold text-xs text-slate-800">{{ v.licensePlate }}</span>
              </div>
              <div class="text-[11px] text-slate-500">{{ v.brandModel }}</div>
            </div>

            <button
              type="button"
              @click="removeVehicle(v.id)"
              class="p-1.5 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-colors"
              title="ลบยานพาหนะ"
            >
              <Trash2 class="w-4 h-4" />
            </button>
          </div>
        </div>

        <div v-else class="p-4 bg-slate-50 rounded-xl text-center text-xs text-slate-400">
          ยังไม่มียานพาหนะที่ลงทะเบียนในระบบ
        </div>
      </div>

      <!-- Main Submit Button -->
      <div class="pt-2">
        <button
          type="submit"
          :disabled="isSubmitting || !!phoneError"
          class="w-full py-3 bg-indigo-500 hover:bg-indigo-600 text-white rounded-xl font-semibold text-xs transition-colors shadow-xs flex items-center justify-center gap-1.5 disabled:opacity-50"
        >
          <div v-if="isSubmitting" class="animate-spin w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full"></div>
          <Save v-else class="w-3.5 h-3.5" />
          <span>{{ isSubmitting ? 'กำลังบันทึกข้อมูล...' : 'บันทึกข้อมูลส่วนตัว' }}</span>
        </button>
      </div>
    </form>

    <!-- Modal เพิ่มยานพาหนะ -->
    <div v-if="showAddVehicleModal" class="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
      <div class="bg-white rounded-2xl p-5 max-w-sm w-full shadow-lg space-y-4 border border-slate-100 relative">
        <div class="flex items-center justify-between border-b border-slate-100 pb-2.5">
          <h3 class="text-sm font-bold text-slate-900">ลงทะเบียนยานพาหนะ</h3>
          <button @click="showAddVehicleModal = false" class="text-slate-400 hover:text-slate-700 p-1">
            <X class="w-4 h-4" />
          </button>
        </div>

        <form @submit.prevent="addVehicle" class="space-y-3 text-xs">
          <div class="space-y-1">
            <label class="block font-medium text-slate-700">ประเภทพาหนะ</label>
            <select v-model="newVehicle.type" required class="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-800 focus:outline-hidden focus:border-indigo-400">
              <option value="motorcycle">รถจักรยานยนต์</option>
              <option value="car">รถยนต์</option>
            </select>
          </div>

          <div class="space-y-1">
            <label class="block font-medium text-slate-700">เลขทะเบียนรถ <span class="text-rose-500">*</span></label>
            <input
              v-model="newVehicle.licensePlate"
              type="text"
              placeholder="เช่น 1กข-9999 กทม"
              required
              class="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-800 font-mono font-medium focus:outline-hidden focus:border-indigo-400"
            />
          </div>

          <div class="space-y-1">
            <label class="block font-medium text-slate-700">ยี่ห้อ / รุ่น <span class="text-rose-500">*</span></label>
            <input
              v-model="newVehicle.brandModel"
              type="text"
              placeholder="เช่น Honda Click / Toyota Yaris"
              required
              class="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-800 focus:outline-hidden focus:border-indigo-400"
            />
          </div>

          <div class="pt-2 flex gap-2">
            <button
              type="button"
              @click="showAddVehicleModal = false"
              class="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-medium transition-colors"
            >
              ยกเลิก
            </button>
            <button
              type="submit"
              class="flex-1 py-2.5 bg-indigo-500 hover:bg-indigo-600 text-white rounded-xl font-semibold shadow-xs transition-colors"
            >
              เพิ่ม
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import {
  Shield,
  Phone,
  Car,
  Bike,
  Plus,
  Trash2,
  Save,
  X
} from 'lucide-vue-next';
import { initLiff, isLiffLoggedIn, getLiffProfile } from '@/utils/liff';
import api from '@/utils/api';
import { useFeatureStore } from '@/stores/useFeatureStore';
import { useAuthStore } from '@/stores/auth';
import { showConfirm } from '@/utils/swal';

const router = useRouter();
const route = useRoute();
const authStore = useAuthStore();
const featureStore = useFeatureStore();

const loading = ref(true);
const isSubmitting = ref(false);
const toastMessage = ref('');
const toastType = ref('success');
const phoneError = ref('');
const lineUserId = ref('');
const showAddVehicleModal = ref(false);

const profile = reactive({
  id: '',
  firstName: '',
  lastName: '',
  phone: '',
  roomNumber: '',
  contractEndDate: ''
});

const vehicles = ref([
  { id: 'v-1', type: 'motorcycle', licensePlate: '1กข-9999 กทม', brandModel: 'Honda CBR 300R' }
]);

const newVehicle = reactive({
  type: 'motorcycle',
  licensePlate: '',
  brandModel: ''
});

onMounted(async () => {
  featureStore.fetchFeatures();

  try {
    await initLiff();
    if (isLiffLoggedIn()) {
      const lineProfile = await getLiffProfile();
      if (lineProfile?.userId) {
        lineUserId.value = lineProfile.userId;
      }
    } else if (!authStore.liffToken && !localStorage.getItem('dev_line_user_id')) {
      authStore.clearLiffAuth();
      router.replace('/liff');
      return;
    }
  } catch (err) {
    console.warn('LIFF init fallback mode:', err.message);
  }

  fetchProfile();
});

const fetchProfile = async () => {
  loading.value = true;
  try {
    const params = {};
    if (lineUserId.value) params.lineUserId = lineUserId.value;
    if (route.query.room) params.room = route.query.room;
    if (route.query.roomNumber) params.roomNumber = route.query.roomNumber;
    if (route.query.tenantId) params.tenantId = route.query.tenantId;

    const res = await api.get('/api/v1/liff/profile', { params });
    const data = res.data.data;

    profile.id = data.id || '';
    profile.firstName = data.firstName || '';
    profile.lastName = data.lastName || '';
    profile.phone = data.phone || '';
    profile.roomNumber = data.roomNumber || '-';
    profile.contractEndDate = data.contractEndDate || '-';
  } catch (err) {
    console.error('Failed to fetch profile:', err);
    if (err.response?.status === 401 || err.response?.status === 403 || !isLiffLoggedIn()) {
      authStore.clearLiffAuth();
      router.replace('/liff');
    }
  } finally {
    loading.value = false;
  }
};

const validatePhone = () => {
  const cleanPhone = String(profile.phone).replace(/[^0-9]/g, '');
  profile.phone = cleanPhone;

  if (cleanPhone.length < 9 || cleanPhone.length > 10) {
    phoneError.value = 'กรุณากรอกเบอร์โทรศัพท์ 9-10 หลัก (เฉพาะตัวเลข)';
  } else {
    phoneError.value = '';
  }
};

const showToast = (msg, type = 'success') => {
  toastMessage.value = msg;
  toastType.value = type;
  setTimeout(() => {
    toastMessage.value = '';
  }, 4000);
};

const saveProfile = async () => {
  validatePhone();
  if (phoneError.value) return;

  isSubmitting.value = true;
  try {
    await api.put('/api/v1/liff/profile', {
      phone: profile.phone,
      lineUserId: lineUserId.value,
      tenantId: profile.id
    });

    showToast('อัปเดตข้อมูลส่วนตัวเรียบร้อยแล้ว', 'success');

    setTimeout(() => {
      router.push('/liff/profile');
    }, 1500);
  } catch (err) {
    showToast(err.response?.data?.message || 'เกิดข้อผิดพลาดในการบันทึกข้อมูล', 'error');
  } finally {
    isSubmitting.value = false;
  }
};

const addVehicle = () => {
  if (!newVehicle.licensePlate || !newVehicle.brandModel) return;

  vehicles.value.push({
    id: `v-${Date.now()}`,
    type: newVehicle.type,
    licensePlate: newVehicle.licensePlate,
    brandModel: newVehicle.brandModel
  });

  newVehicle.licensePlate = '';
  newVehicle.brandModel = '';
  showAddVehicleModal.value = false;
  showToast('ลงทะเบียนยานพาหนะเรียบร้อยแล้ว', 'success');
};

const removeVehicle = async (id) => {
  const confirmed = await showConfirm('ลบยานพาหนะ', 'ยืนยันลบรายการยานพาหนะนี้?');
  if (!confirmed) return;
  vehicles.value = vehicles.value.filter((v) => v.id !== id);
  showToast('ลบรายการยานพาหนะแล้ว', 'success');
};
</script>
