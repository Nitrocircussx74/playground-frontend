<template>
  <div class="min-h-screen bg-slate-100/90 pb-24 font-sans text-slate-900 selection:bg-indigo-600 selection:text-white">
    <div class="max-w-md mx-auto px-4 py-6 space-y-5 relative z-10">
      
      <!-- Header -->
      <div class="space-y-1">
        <h1 class="text-xl font-bold text-slate-900 tracking-tight">✏️ แก้ไขข้อมูลส่วนตัวลูกบ้าน</h1>
        <p class="text-xs text-slate-500">อัปเดตข้อมูลติดต่อและยานพาหนะที่ลงทะเบียนในหอพัก</p>
      </div>

      <!-- Toast Feedback Banner -->
      <div
        v-if="toastMessage"
        class="p-4 rounded-2xl text-xs font-bold shadow-md transition-all flex items-center justify-between"
        :class="toastType === 'success' ? 'bg-emerald-600 text-white shadow-emerald-600/20' : 'bg-rose-600 text-white shadow-rose-600/20'"
      >
        <span>{{ toastMessage }}</span>
        <button @click="toastMessage = ''" class="text-white/80 hover:text-white font-bold text-sm">✕</button>
      </div>

      <!-- Loading State -->
      <div v-if="loading" class="p-8 bg-white rounded-3xl text-center text-slate-500 shadow-xs">
        <div class="animate-spin w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full mx-auto mb-3"></div>
        กำลังโหลดข้อมูลส่วนตัว...
      </div>

      <form v-else @submit.prevent="saveProfile" class="space-y-5">
        <!-- Section 1: Read-Only Tenant Info (ข้อมูลที่ไม่สามารถแก้ไขได้) -->
        <div class="p-5 bg-white rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
          <div class="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 class="text-xs uppercase font-extrabold text-slate-400 tracking-wider">ส่วนที่ 1: ข้อมูลสัญญาหอพัก (Read-Only)</h3>
            <span class="text-[10px] bg-slate-100 text-slate-500 font-bold px-2 py-0.5 rounded-full">🔒 ห้ามแก้ไข</span>
          </div>

          <div class="space-y-3">
            <div>
              <label class="block text-xs font-bold text-slate-700 mb-1">ชื่อ-นามสกุล ผู้เช่า</label>
              <input
                type="text"
                :value="`${profile.firstName} ${profile.lastName}`"
                disabled
                class="w-full bg-slate-100 border border-slate-200 rounded-2xl px-4 py-2.5 text-sm text-slate-500 font-medium cursor-not-allowed"
              />
            </div>

            <div class="grid grid-cols-2 gap-3">
              <div>
                <label class="block text-xs font-bold text-slate-700 mb-1">หมายเลขห้องพัก</label>
                <input
                  type="text"
                  :value="`ห้อง ${profile.roomNumber}`"
                  disabled
                  class="w-full bg-slate-100 border border-slate-200 rounded-2xl px-4 py-2.5 text-sm text-slate-700 font-bold cursor-not-allowed"
                />
              </div>

              <div>
                <label class="block text-xs font-bold text-slate-700 mb-1">วันหมดอายุสัญญา</label>
                <input
                  type="text"
                  :value="profile.contractEndDate"
                  disabled
                  class="w-full bg-slate-100 border border-slate-200 rounded-2xl px-4 py-2.5 text-xs text-slate-500 font-medium cursor-not-allowed"
                />
              </div>
            </div>

            <p class="text-[11px] text-slate-400 italic">
              ℹ️ หากต้องการเปลี่ยนแปลงชื่อผู้เช่าหรือย้ายห้องพัก กรุณาติดต่อแอดมินหอพักโดยตรง
            </p>
          </div>
        </div>

        <!-- Section 2: Contact Info (ข้อมูลติดต่อ - Editable) -->
        <div class="p-5 bg-white rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
          <h3 class="text-xs uppercase font-extrabold text-indigo-700 tracking-wider">ส่วนที่ 2: ข้อมูลติดต่อ (Editable)</h3>

          <div>
            <label class="block text-xs font-bold text-slate-700 mb-1">
              เบอร์โทรศัพท์ติดต่อ <span class="text-rose-500">*</span>
            </label>
            <input
              v-model="profile.phone"
              type="tel"
              maxlength="10"
              placeholder="e.g. 0812345678"
              required
              @input="validatePhone"
              class="w-full bg-slate-50 border rounded-2xl px-4 py-3 text-sm text-slate-900 font-mono font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              :class="phoneError ? 'border-rose-400 focus:border-rose-500' : 'border-slate-300 focus:border-indigo-500'"
            />
            <span v-if="phoneError" class="text-xs font-semibold text-rose-500 mt-1 block">
              {{ phoneError }}
            </span>
          </div>
        </div>

        <!-- Section 3: Vehicle Management (จัดการยานพาหนะ - Controlled by Feature Flag ENABLE_VEHICLE_MANAGEMENT) -->
        <div
          v-if="featureStore.isEnabled('ENABLE_VEHICLE_MANAGEMENT')"
          class="p-5 bg-white rounded-3xl border border-indigo-200 shadow-xs space-y-4"
        >
          <div class="flex items-center justify-between">
            <h3 class="text-xs uppercase font-extrabold text-indigo-800 tracking-wider">
              ส่วนที่ 3: จัดการยานพาหนะ (Vehicle Management)
            </h3>
            <button
              type="button"
              @click="showAddVehicleModal = true"
              class="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
            >
              <span>+ เพิ่มยานพาหนะ</span>
            </button>
          </div>

          <!-- Registered Vehicles List -->
          <div v-if="vehicles.length > 0" class="space-y-2.5">
            <div
              v-for="v in vehicles"
              :key="v.id"
              class="p-3.5 bg-indigo-50/50 rounded-2xl border border-indigo-100 flex items-center justify-between"
            >
              <div class="space-y-0.5">
                <div class="flex items-center gap-2">
                  <span class="text-base">{{ v.type === 'car' ? '🚗' : '🛵' }}</span>
                  <span class="font-mono font-bold text-sm text-slate-900">{{ v.licensePlate }}</span>
                </div>
                <div class="text-xs text-slate-500">{{ v.brandModel }}</div>
              </div>

              <button
                type="button"
                @click="removeVehicle(v.id)"
                class="p-2 text-rose-500 hover:bg-rose-50 rounded-xl transition-colors"
                title="ลบยานพาหนะ"
              >
                <Trash2 class="w-4 h-4" />
              </button>
            </div>
          </div>

          <div v-else class="p-4 bg-slate-50 rounded-2xl text-center text-xs text-slate-400">
            ยังไม่มียานพาหนะที่ลงทะเบียนในระบบ
          </div>
        </div>

        <!-- Sticky Bottom Action Button -->
        <div class="fixed bottom-0 left-1/2 -translate-x-1/2 max-w-md w-full p-4 bg-white/90 backdrop-blur-md border-t border-slate-200 z-40">
          <button
            type="submit"
            :disabled="isSubmitting || !!phoneError"
            class="w-full py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-bold text-sm transition-all shadow-lg shadow-indigo-600/25 flex items-center justify-center gap-2 disabled:opacity-50"
          >
            <div v-if="isSubmitting" class="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full"></div>
            <span>{{ isSubmitting ? 'กำลังบันทึกข้อมูล...' : 'บันทึกข้อมูล (Save Changes)' }}</span>
          </button>
        </div>
      </form>
    </div>

    <!-- Modal เพิ่มยานพาหนะ -->
    <div v-if="showAddVehicleModal" class="fixed inset-0 z-50 bg-slate-950/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div class="bg-white rounded-3xl p-6 max-w-sm w-full shadow-2xl space-y-4 border border-slate-200 relative">
        <div class="flex items-center justify-between border-b border-slate-100 pb-3">
          <h3 class="text-base font-bold text-slate-900">ลงทะเบียนยานพาหนะใหม่</h3>
          <button @click="showAddVehicleModal = false" class="text-slate-400 hover:text-slate-700">
            <X class="w-5 h-5" />
          </button>
        </div>

        <form @submit.prevent="addVehicle" class="space-y-3 text-xs">
          <div>
            <label class="block font-bold text-slate-700 mb-1">ประเภทพาหนะ</label>
            <select v-model="newVehicle.type" required class="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-slate-900">
              <option value="motorcycle">🛵 รถจักรยานยนต์ / มอเตอร์ไซค์</option>
              <option value="car">🚗 รถยนต์</option>
            </select>
          </div>

          <div>
            <label class="block font-bold text-slate-700 mb-1">เลขทะเบียนรถ <span class="text-rose-500">*</span></label>
            <input
              v-model="newVehicle.licensePlate"
              type="text"
              placeholder="e.g. 1กข-9999 กทม"
              required
              class="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-slate-900 font-mono font-bold"
            />
          </div>

          <div>
            <label class="block font-bold text-slate-700 mb-1">ยี่ห้อ / รุ่น <span class="text-rose-500">*</span></label>
            <input
              v-model="newVehicle.brandModel"
              type="text"
              placeholder="e.g. Honda CBR / Toyota Yaris"
              required
              class="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-slate-900"
            />
          </div>

          <div class="pt-2 flex gap-2">
            <button
              type="button"
              @click="showAddVehicleModal = false"
              class="flex-1 py-2.5 bg-slate-100 text-slate-700 rounded-xl font-bold"
            >
              ยกเลิก
            </button>
            <button
              type="submit"
              class="flex-1 py-2.5 bg-indigo-600 text-white rounded-xl font-bold shadow-xs"
            >
              เพิ่มยานพาหนะ
            </button>
          </div>
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
import { useFeatureStore } from '@/stores/useFeatureStore';
import { Trash2, X } from 'lucide-vue-next';

const router = useRouter();
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
  firstName: 'สมชาย',
  lastName: 'ใจดี',
  phone: '0812345678',
  roomNumber: '101',
  contractEndDate: '31 ธันวาคม 2026'
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

  const liffId = import.meta.env.VITE_LINE_LIFF_ID || '2000000000-mockliffid';
  try {
    await liff.init({ liffId });
    if (liff.isLoggedIn()) {
      const lineProfile = await liff.getProfile();
      lineUserId.value = lineProfile.userId;
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

    const res = await api.get('/api/v1/liff/profile', { params });
    const data = res.data.data;

    profile.id = data.id || '';
    profile.firstName = data.firstName || 'สมชาย';
    profile.lastName = data.lastName || 'ใจดี';
    profile.phone = data.phone || '0812345678';
    profile.roomNumber = data.roomNumber || '101';
    profile.contractEndDate = data.contractEndDate || '31 ธันวาคม 2026';
  } catch (err) {
    console.error('Failed to fetch profile:', err);
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

    showToast('อัปเดตข้อมูลส่วนตัวเรียบร้อยแล้ว!', 'success');

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

const removeVehicle = (id) => {
  if (!confirm('ยืนยันลบรายการยานพาหนะนี้?')) return;
  vehicles.value = vehicles.value.filter((v) => v.id !== id);
  showToast('ลบรายการยานพาหนะแล้ว', 'success');
};
</script>
