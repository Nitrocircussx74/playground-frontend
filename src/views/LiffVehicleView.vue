<template>
  <div class="space-y-5 pb-6 font-sans text-slate-800">
    <!-- Feature Disabled State -->
    <div v-if="!isFeatureEnabled" class="p-8 bg-white rounded-2xl border border-slate-100/80 shadow-xs text-center space-y-3">
      <div class="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto">
        <Car class="w-6 h-6" />
      </div>
      <h2 class="text-sm font-bold text-slate-800">ฟีเจอร์นี้ไม่พร้อมใช้งาน</h2>
      <p class="text-xs text-slate-500">ขออภัย ฟีเจอร์จัดการยานพาหนะ/ผู้มาเยือนถูกปิดการใช้งานชั่วคราว</p>
    </div>

    <template v-else>
      <div>
        <h1 class="text-lg font-bold text-slate-900 tracking-tight">ยานพาหนะ/ผู้มาเยือน</h1>
        <p class="text-xs text-slate-500 mt-0.5">ลงทะเบียนรถของคุณ หรือแจ้งแขกล่วงหน้า</p>
      </div>

      <Tabs v-model="activeTab">
        <TabsList>
          <TabsTrigger value="vehicles">รถของฉัน</TabsTrigger>
          <TabsTrigger value="visitors">แขกของฉัน</TabsTrigger>
        </TabsList>

        <TabsContent value="vehicles">
          <div class="space-y-3">
            <button
              @click="showVehicleForm = true"
              class="w-full py-2.5 bg-cyan-600 hover:bg-cyan-700 text-white rounded-xl text-xs font-bold"
            >
              ➕ ลงทะเบียนรถใหม่
            </button>

            <div v-for="v in myVehicles" :key="v.id" class="bg-white rounded-2xl border border-slate-100/90 shadow-xs p-4 flex items-center justify-between gap-3">
              <div class="min-w-0">
                <div class="font-bold text-slate-800 text-sm font-mono">{{ v.licensePlate }}</div>
                <div class="text-xs text-slate-500">{{ v.vehicleType === 'car' ? 'รถยนต์' : 'มอเตอร์ไซค์' }} {{ v.brand ? `- ${v.brand}` : '' }}</div>
                <span
                  class="text-[10px] font-semibold px-2 py-0.5 rounded-full border inline-block mt-1"
                  :class="{
                    'bg-amber-50 border-amber-200 text-amber-700': v.status === 'PENDING',
                    'bg-emerald-50 border-emerald-200 text-emerald-700': v.status === 'APPROVED',
                    'bg-rose-50 border-rose-200 text-rose-700': v.status === 'REJECTED'
                  }"
                >
                  {{ { PENDING: 'รออนุมัติ', APPROVED: 'อนุมัติแล้ว', REJECTED: 'ปฏิเสธ' }[v.status] }}
                </span>
              </div>
              <button
                v-if="v.status === 'PENDING'"
                @click="handleDeleteVehicle(v.id)"
                class="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-xl text-xs font-semibold border border-rose-200 shrink-0"
              >
                ลบ
              </button>
            </div>
            <div v-if="!loading && myVehicles.length === 0" class="p-6 bg-white rounded-2xl border border-slate-100/80 text-center">
              <p class="text-xs text-slate-400">คุณยังไม่ได้ลงทะเบียนรถ</p>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="visitors">
          <div class="space-y-3">
            <button
              @click="showVisitorForm = true"
              class="w-full py-2.5 bg-cyan-600 hover:bg-cyan-700 text-white rounded-xl text-xs font-bold"
            >
              ➕ แจ้งแขกล่วงหน้า
            </button>

            <div v-for="v in myVisitors" :key="v.id" class="bg-white rounded-2xl border border-slate-100/90 shadow-xs p-4 flex items-center justify-between gap-3">
              <div class="min-w-0">
                <div class="font-bold text-slate-800 text-sm">{{ v.visitorName }}</div>
                <div class="text-xs text-slate-500 font-mono">{{ formatDate(v.expectedDate) }} {{ v.licensePlate ? `· ${v.licensePlate}` : '' }}</div>
              </div>
              <button
                v-if="v.status === 'EXPECTED'"
                @click="handleDeleteVisitor(v.id)"
                class="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-xl text-xs font-semibold border border-rose-200 shrink-0"
              >
                ยกเลิก
              </button>
            </div>
            <div v-if="!loading && myVisitors.length === 0" class="p-6 bg-white rounded-2xl border border-slate-100/80 text-center">
              <p class="text-xs text-slate-400">คุณยังไม่มีการแจ้งแขก</p>
            </div>
          </div>
        </TabsContent>
      </Tabs>

      <!-- Register Vehicle Modal -->
      <div v-if="showVehicleForm" class="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4">
        <div class="bg-white w-full sm:max-w-sm rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden">
          <div class="px-5 py-4 bg-gradient-to-r from-cyan-600 to-sky-600 text-white flex items-center justify-between">
            <h3 class="font-bold text-sm">ลงทะเบียนยานพาหนะ</h3>
            <button @click="showVehicleForm = false" class="text-cyan-100 hover:text-white">✕</button>
          </div>
          <form @submit.prevent="handleRegisterVehicle" class="p-5 space-y-4">
            <div>
              <label class="block text-xs font-bold text-slate-700 mb-1">ทะเบียนรถ</label>
              <input v-model="vehicleForm.licensePlate" required type="text" placeholder="เช่น กข-1234" class="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs font-mono" />
            </div>
            <div>
              <label class="block text-xs font-bold text-slate-700 mb-1">ประเภท</label>
              <select v-model="vehicleForm.vehicleType" class="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs">
                <option value="car">รถยนต์</option>
                <option value="motorcycle">มอเตอร์ไซค์</option>
              </select>
            </div>
            <div>
              <label class="block text-xs font-bold text-slate-700 mb-1">ยี่ห้อ (Optional)</label>
              <input v-model="vehicleForm.brand" type="text" class="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs" />
            </div>
            <div class="pt-2 flex gap-3">
              <button type="button" @click="showVehicleForm = false" class="w-1/2 py-2.5 border border-slate-300 text-slate-700 rounded-xl text-xs font-bold">ยกเลิก</button>
              <button type="submit" :disabled="submitting" class="w-1/2 py-2.5 bg-cyan-600 hover:bg-cyan-700 text-white rounded-xl text-xs font-bold disabled:opacity-50">
                {{ submitting ? 'กำลังบันทึก...' : 'ลงทะเบียน' }}
              </button>
            </div>
          </form>
        </div>
      </div>

      <!-- Add Visitor Modal -->
      <div v-if="showVisitorForm" class="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4">
        <div class="bg-white w-full sm:max-w-sm rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden">
          <div class="px-5 py-4 bg-gradient-to-r from-cyan-600 to-sky-600 text-white flex items-center justify-between">
            <h3 class="font-bold text-sm">แจ้งแขกล่วงหน้า</h3>
            <button @click="showVisitorForm = false" class="text-cyan-100 hover:text-white">✕</button>
          </div>
          <form @submit.prevent="handleCreateVisitor" class="p-5 space-y-4">
            <div>
              <label class="block text-xs font-bold text-slate-700 mb-1">ชื่อแขก</label>
              <input v-model="visitorForm.visitorName" required type="text" class="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs" />
            </div>
            <div>
              <label class="block text-xs font-bold text-slate-700 mb-1">วันที่คาดว่าจะมา</label>
              <input v-model="visitorForm.expectedDate" required type="date" class="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs" />
            </div>
            <div>
              <label class="block text-xs font-bold text-slate-700 mb-1">ทะเบียนรถ (Optional)</label>
              <input v-model="visitorForm.licensePlate" type="text" class="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs font-mono" />
            </div>
            <div class="pt-2 flex gap-3">
              <button type="button" @click="showVisitorForm = false" class="w-1/2 py-2.5 border border-slate-300 text-slate-700 rounded-xl text-xs font-bold">ยกเลิก</button>
              <button type="submit" :disabled="submitting" class="w-1/2 py-2.5 bg-cyan-600 hover:bg-cyan-700 text-white rounded-xl text-xs font-bold disabled:opacity-50">
                {{ submitting ? 'กำลังบันทึก...' : 'บันทึก' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { Car } from 'lucide-vue-next';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { useFeatureStore } from '@/stores/useFeatureStore';
import { showSuccess, showError, showConfirm } from '@/utils/swal';
import api from '@/utils/api';

const featureStore = useFeatureStore();
const loading = ref(true);
const submitting = ref(false);
const activeTab = ref('vehicles');
const myVehicles = ref([]);
const myVisitors = ref([]);
const showVehicleForm = ref(false);
const showVisitorForm = ref(false);
const vehicleForm = ref({ licensePlate: '', vehicleType: 'car', brand: '' });
const visitorForm = ref({ visitorName: '', expectedDate: '', licensePlate: '' });

const isFeatureEnabled = computed(() => featureStore.isEnabled('ENABLE_VEHICLE_MANAGEMENT'));

onMounted(async () => {
  if (featureStore.features.length === 0) {
    await featureStore.fetchFeatures();
  }
  await loadAll();
});

const loadAll = async () => {
  loading.value = true;
  try {
    const [vehiclesRes, visitorsRes] = await Promise.all([
      api.get('/api/v1/liff/vehicles/mine'),
      api.get('/api/v1/liff/visitors/mine')
    ]);
    myVehicles.value = vehiclesRes.data.data;
    myVisitors.value = visitorsRes.data.data;
  } catch (error) {
    console.error('Failed to fetch vehicle/visitor data:', error);
  } finally {
    loading.value = false;
  }
};

const handleRegisterVehicle = async () => {
  submitting.value = true;
  try {
    const res = await api.post('/api/v1/liff/vehicles', vehicleForm.value);
    await showSuccess('สำเร็จ!', res.data.message);
    showVehicleForm.value = false;
    vehicleForm.value = { licensePlate: '', vehicleType: 'car', brand: '' };
    loadAll();
  } catch (error) {
    showError('เกิดข้อผิดพลาด', error.response?.data?.message || 'ไม่สามารถลงทะเบียนได้');
  } finally {
    submitting.value = false;
  }
};

const handleDeleteVehicle = async (id) => {
  const confirmed = await showConfirm('ยืนยันลบ', 'ต้องการลบรายการรถนี้ใช่หรือไม่?');
  if (!confirmed) return;
  try {
    await api.delete(`/api/v1/liff/vehicles/${id}`);
    loadAll();
  } catch (error) {
    showError('เกิดข้อผิดพลาด', error.response?.data?.message || 'ไม่สามารถลบได้');
  }
};

const handleCreateVisitor = async () => {
  submitting.value = true;
  try {
    const res = await api.post('/api/v1/liff/visitors', visitorForm.value);
    await showSuccess('สำเร็จ!', res.data.message);
    showVisitorForm.value = false;
    visitorForm.value = { visitorName: '', expectedDate: '', licensePlate: '' };
    loadAll();
  } catch (error) {
    showError('เกิดข้อผิดพลาด', error.response?.data?.message || 'ไม่สามารถบันทึกได้');
  } finally {
    submitting.value = false;
  }
};

const handleDeleteVisitor = async (id) => {
  const confirmed = await showConfirm('ยืนยันยกเลิก', 'ต้องการยกเลิกการแจ้งแขกนี้ใช่หรือไม่?');
  if (!confirmed) return;
  try {
    await api.delete(`/api/v1/liff/visitors/${id}`);
    loadAll();
  } catch (error) {
    showError('เกิดข้อผิดพลาด', error.response?.data?.message || 'ไม่สามารถยกเลิกได้');
  }
};

const formatDate = (d) => new Date(d).toLocaleDateString('th-TH');
</script>
