<template>
  <div class="space-y-5 pb-6 font-sans text-slate-800">
    <!-- Feature Disabled State -->
    <div v-if="!isFeatureEnabled" class="p-8 bg-white rounded-2xl border border-slate-100/80 shadow-xs text-center space-y-3">
      <div class="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto">
        <CalendarCheck class="w-6 h-6" />
      </div>
      <h2 class="text-sm font-bold text-slate-800">ฟีเจอร์จองพื้นที่ส่วนกลางไม่พร้อมใช้งาน</h2>
      <p class="text-xs text-slate-500">ขออภัย ฟีเจอร์นี้ถูกปิดการใช้งานชั่วคราว</p>
    </div>

    <template v-else>
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-lg font-bold text-slate-900 tracking-tight">จองพื้นที่ส่วนกลาง</h1>
          <p class="text-xs text-slate-500 mt-0.5">เลือกพื้นที่และช่วงเวลาที่ต้องการจอง</p>
        </div>
        <button
          @click="loadAll"
          class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-50/80 hover:bg-indigo-100 text-xs font-semibold text-indigo-700"
        >
          <RotateCw class="w-3.5 h-3.5" :class="{ 'animate-spin': loading }" />
          <span>รีเฟรช</span>
        </button>
      </div>

      <!-- Facility List -->
      <div class="space-y-3">
        <div
          v-for="f in facilities"
          :key="f.id"
          class="bg-white rounded-2xl border border-slate-100/90 shadow-xs p-4 space-y-3"
        >
          <div class="flex items-center gap-3">
            <div class="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
              <CalendarCheck class="w-4 h-4" />
            </div>
            <div class="min-w-0">
              <div class="font-bold text-slate-800 text-sm">{{ f.name }}</div>
              <div class="text-xs text-slate-500">{{ f.description || '-' }}</div>
            </div>
          </div>
          <button
            @click="openBookModal(f)"
            class="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all"
          >
            จองพื้นที่นี้
          </button>
        </div>
        <div v-if="!loading && facilities.length === 0" class="p-10 bg-white rounded-2xl border border-slate-100/80 text-center space-y-2 shadow-xs">
          <p class="text-xs font-medium text-slate-500">ยังไม่มีพื้นที่ส่วนกลางให้จองในตอนนี้</p>
        </div>
      </div>

      <!-- My Bookings -->
      <div>
        <h2 class="text-sm font-bold text-slate-800 mb-2">รายการจองของฉัน</h2>
        <div class="space-y-2">
          <div
            v-for="b in myBookings"
            :key="b.id"
            class="bg-white rounded-2xl border border-slate-100/90 shadow-xs p-4 flex items-center justify-between gap-3"
          >
            <div class="min-w-0">
              <div class="font-bold text-slate-800 text-sm truncate">{{ b.facility?.name }}</div>
              <div class="text-xs text-slate-500 font-mono">{{ formatDateTime(b.startTime) }} - {{ formatTime(b.endTime) }}</div>
              <span
                class="text-[10px] font-semibold px-2 py-0.5 rounded-full border inline-block mt-1"
                :class="b.status === 'CONFIRMED' ? 'bg-indigo-50 border-indigo-200 text-indigo-700' : 'bg-slate-100 border-slate-200 text-slate-500'"
              >
                {{ b.status === 'CONFIRMED' ? 'ยืนยันแล้ว' : 'ยกเลิกแล้ว' }}
              </span>
            </div>
            <button
              v-if="b.status === 'CONFIRMED'"
              @click="handleCancel(b.id)"
              class="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-xl text-xs font-semibold border border-rose-200 shrink-0"
            >
              ยกเลิก
            </button>
          </div>
          <div v-if="!loading && myBookings.length === 0" class="p-6 bg-white rounded-2xl border border-slate-100/80 text-center">
            <p class="text-xs text-slate-400">คุณยังไม่มีการจอง</p>
          </div>
        </div>
      </div>

      <!-- Booking Modal -->
      <div v-if="bookingFacility" class="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4">
        <div class="bg-white w-full sm:max-w-sm rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden">
          <div class="px-5 py-4 bg-gradient-to-r from-indigo-600 to-blue-600 text-white flex items-center justify-between">
            <h3 class="font-bold text-sm">จอง: {{ bookingFacility.name }}</h3>
            <button @click="bookingFacility = null" class="text-indigo-100 hover:text-white">✕</button>
          </div>
          <form @submit.prevent="handleBook" class="p-5 space-y-4">
            <div>
              <label class="block text-xs font-bold text-slate-700 mb-1">วันที่</label>
              <input v-model="bookForm.date" type="date" required class="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs" />
            </div>
            <div class="grid grid-cols-2 gap-3">
              <div>
                <label class="block text-xs font-bold text-slate-700 mb-1">เวลาเริ่ม</label>
                <input v-model="bookForm.startTime" type="time" required class="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs" />
              </div>
              <div>
                <label class="block text-xs font-bold text-slate-700 mb-1">เวลาสิ้นสุด</label>
                <input v-model="bookForm.endTime" type="time" required class="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs" />
              </div>
            </div>
            <div class="pt-2 flex gap-3">
              <button type="button" @click="bookingFacility = null" class="w-1/2 py-2.5 border border-slate-300 text-slate-700 rounded-xl text-xs font-bold">
                ยกเลิก
              </button>
              <button type="submit" :disabled="submitting" class="w-1/2 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold disabled:opacity-50">
                {{ submitting ? 'กำลังจอง...' : 'ยืนยันจอง' }}
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
import { CalendarCheck, RotateCw } from 'lucide-vue-next';
import { useFeatureStore } from '@/stores/useFeatureStore';
import { showSuccess, showError, showConfirm } from '@/utils/swal';
import api from '@/utils/api';

const featureStore = useFeatureStore();
const loading = ref(true);
const submitting = ref(false);
const facilities = ref([]);
const myBookings = ref([]);
const bookingFacility = ref(null);
const bookForm = ref({ date: '', startTime: '', endTime: '' });

const isFeatureEnabled = computed(() => featureStore.isEnabled('ENABLE_FACILITY_BOOKING'));

onMounted(async () => {
  if (featureStore.features.length === 0) {
    await featureStore.fetchFeatures();
  }
  await loadAll();
});

const loadAll = async () => {
  loading.value = true;
  try {
    const [facRes, bookingRes] = await Promise.all([
      api.get('/api/v1/liff/facilities'),
      api.get('/api/v1/liff/facility-bookings/mine')
    ]);
    facilities.value = facRes.data.data;
    myBookings.value = bookingRes.data.data;
  } catch (error) {
    console.error('Failed to fetch facility booking data:', error);
  } finally {
    loading.value = false;
  }
};

const openBookModal = (f) => {
  bookingFacility.value = f;
  const today = new Date().toISOString().slice(0, 10);
  bookForm.value = { date: today, startTime: '09:00', endTime: '10:00' };
};

const handleBook = async () => {
  submitting.value = true;
  try {
    const startTime = new Date(`${bookForm.value.date}T${bookForm.value.startTime}:00`).toISOString();
    const endTime = new Date(`${bookForm.value.date}T${bookForm.value.endTime}:00`).toISOString();
    const res = await api.post('/api/v1/liff/facility-bookings', {
      facilityId: bookingFacility.value.id,
      startTime,
      endTime
    });
    await showSuccess('สำเร็จ!', res.data.message);
    bookingFacility.value = null;
    loadAll();
  } catch (error) {
    showError('เกิดข้อผิดพลาด', error.response?.data?.message || 'ไม่สามารถจองได้');
  } finally {
    submitting.value = false;
  }
};

const handleCancel = async (id) => {
  const confirmed = await showConfirm('ยืนยันยกเลิก', 'ต้องการยกเลิกการจองนี้ใช่หรือไม่?');
  if (!confirmed) return;
  try {
    await api.delete(`/api/v1/liff/facility-bookings/${id}`);
    loadAll();
  } catch (error) {
    showError('เกิดข้อผิดพลาด', error.response?.data?.message || 'ไม่สามารถยกเลิกได้');
  }
};

const formatDateTime = (d) => new Date(d).toLocaleString('th-TH');
const formatTime = (d) => new Date(d).toLocaleTimeString('th-TH');
</script>
