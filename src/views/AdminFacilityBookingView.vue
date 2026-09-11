<template>
  <div class="space-y-6 font-sans">
    <!-- Header Banner -->
    <div class="bg-gradient-to-r from-indigo-600 via-blue-600 to-slate-900 p-6 rounded-3xl text-white shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
      <div>
        <h1 class="text-2xl font-black tracking-tight text-white">📅 จองพื้นที่ส่วนกลาง (Facility Booking)</h1>
        <p class="text-xs text-indigo-100/80 mt-1 max-w-xl">
          จัดการพื้นที่ส่วนกลางที่เปิดให้จอง และดูรายการจองของลูกบ้านทั้งหมด
        </p>
      </div>
      <button
        v-if="activeTab === 'facilities'"
        @click="openCreateFacilityModal"
        class="px-5 py-2.5 bg-white/15 hover:bg-white/25 border border-white/30 text-white rounded-xl text-xs sm:text-sm font-bold transition-all shrink-0 cursor-pointer"
      >
        ➕ เพิ่มพื้นที่ส่วนกลาง
      </button>
    </div>

    <Tabs v-model="activeTab">
      <TabsList>
        <TabsTrigger value="facilities">พื้นที่ส่วนกลาง ({{ facilities.length }})</TabsTrigger>
        <TabsTrigger value="bookings">รายการจอง ({{ bookings.length }})</TabsTrigger>
      </TabsList>

      <TabsContent value="facilities">
        <div class="bg-white border border-slate-200 rounded-3xl shadow-xs overflow-hidden">
          <div class="overflow-x-auto">
            <table class="w-full text-left text-sm text-slate-700">
              <thead class="bg-slate-50 text-xs text-slate-500 uppercase tracking-wider border-b border-slate-200 font-bold">
                <tr>
                  <th class="p-3.5">ชื่อพื้นที่</th>
                  <th class="p-3.5">รายละเอียด</th>
                  <th class="p-3.5">สถานะ</th>
                  <th class="p-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-100">
                <tr v-for="f in facilities" :key="f.id" class="hover:bg-slate-50/60 transition-colors">
                  <td class="p-3.5 font-bold text-slate-900">{{ f.name }}</td>
                  <td class="p-3.5 text-xs text-slate-600">{{ f.description || '-' }}</td>
                  <td class="p-3.5">
                    <span
                      class="text-[11px] font-extrabold px-2.5 py-1 rounded-full border"
                      :class="f.isActive ? 'bg-emerald-100 border-emerald-300 text-emerald-800' : 'bg-slate-100 border-slate-300 text-slate-500'"
                    >
                      {{ f.isActive ? 'เปิดให้จอง' : 'ปิดใช้งาน' }}
                    </span>
                  </td>
                  <td class="p-3.5 text-right space-x-1.5">
                    <button
                      @click="toggleFacilityActive(f)"
                      class="px-2.5 py-1.5 bg-slate-50 hover:bg-slate-100 text-slate-700 rounded-xl text-xs font-semibold border border-slate-200 cursor-pointer"
                    >
                      {{ f.isActive ? 'ปิดใช้งาน' : 'เปิดใช้งาน' }}
                    </button>
                    <button
                      @click="handleDeleteFacility(f.id)"
                      class="px-2.5 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-xl text-xs font-semibold border border-rose-200 cursor-pointer"
                    >
                      🗑️ ลบ
                    </button>
                  </td>
                </tr>
                <tr v-if="facilities.length === 0">
                  <td colspan="4" class="p-8 text-center text-slate-400 text-xs">ยังไม่มีพื้นที่ส่วนกลางในตึกนี้</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </TabsContent>

      <TabsContent value="bookings">
        <div class="bg-white border border-slate-200 rounded-3xl shadow-xs overflow-hidden">
          <div class="overflow-x-auto">
            <table class="w-full text-left text-sm text-slate-700">
              <thead class="bg-slate-50 text-xs text-slate-500 uppercase tracking-wider border-b border-slate-200 font-bold">
                <tr>
                  <th class="p-3.5">พื้นที่</th>
                  <th class="p-3.5">ผู้จอง</th>
                  <th class="p-3.5">ช่วงเวลา</th>
                  <th class="p-3.5">สถานะ</th>
                  <th class="p-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-100">
                <tr v-for="b in bookings" :key="b.id" class="hover:bg-slate-50/60 transition-colors">
                  <td class="p-3.5 font-bold text-slate-900">{{ b.facility?.name }}</td>
                  <td class="p-3.5 text-xs text-slate-600">{{ b.tenant ? `${b.tenant.firstName} ${b.tenant.lastName}` : '-' }}</td>
                  <td class="p-3.5 text-xs text-slate-500 font-mono">{{ formatDate(b.startTime) }} - {{ formatTime(b.endTime) }}</td>
                  <td class="p-3.5">
                    <span
                      class="text-[11px] font-extrabold px-2.5 py-1 rounded-full border"
                      :class="b.status === 'CONFIRMED' ? 'bg-indigo-100 border-indigo-300 text-indigo-800' : 'bg-slate-100 border-slate-300 text-slate-500'"
                    >
                      {{ b.status === 'CONFIRMED' ? 'ยืนยันแล้ว' : 'ยกเลิกแล้ว' }}
                    </span>
                  </td>
                  <td class="p-3.5 text-right">
                    <button
                      v-if="b.status === 'CONFIRMED'"
                      @click="handleCancelBooking(b.id)"
                      class="px-2.5 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-xl text-xs font-semibold border border-rose-200 cursor-pointer"
                    >
                      ยกเลิกการจอง
                    </button>
                  </td>
                </tr>
                <tr v-if="bookings.length === 0">
                  <td colspan="5" class="p-8 text-center text-slate-400 text-xs">ยังไม่มีรายการจอง</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </TabsContent>
    </Tabs>

    <!-- Create Facility Modal -->
    <div v-if="showModal" class="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div class="bg-white rounded-3xl border border-slate-200 shadow-2xl w-full max-w-md overflow-hidden">
        <div class="px-6 py-4 bg-gradient-to-r from-indigo-600 to-blue-600 text-white flex items-center justify-between">
          <h3 class="font-bold text-base text-white">เพิ่มพื้นที่ส่วนกลาง</h3>
          <button @click="showModal = false" class="text-indigo-100 hover:text-white p-1 rounded-lg cursor-pointer">✕</button>
        </div>
        <form @submit.prevent="handleCreateFacility" class="p-6 space-y-4">
          <div>
            <label class="block text-xs font-bold text-slate-700 mb-1">ชื่อพื้นที่</label>
            <input
              v-model="form.name"
              required
              type="text"
              placeholder="เช่น สระว่ายน้ำ, ห้องฟิตเนส"
              class="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
            />
          </div>
          <div>
            <label class="block text-xs font-bold text-slate-700 mb-1">รายละเอียด (Optional)</label>
            <textarea
              v-model="form.description"
              rows="2"
              class="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
            ></textarea>
          </div>
          <div class="pt-3 flex gap-3">
            <button type="button" @click="showModal = false" class="w-1/2 py-2.5 border border-slate-300 text-slate-700 hover:bg-slate-100 rounded-xl text-xs font-bold cursor-pointer">
              ยกเลิก
            </button>
            <button type="submit" :disabled="submitting" class="w-1/2 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold disabled:opacity-50 cursor-pointer">
              {{ submitting ? 'กำลังบันทึก...' : '✅ บันทึก' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, watch } from 'vue';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { useBuildingStore } from '@/stores/useBuildingStore';
import { showSuccess, showError, showConfirm } from '@/utils/swal';
import api from '@/utils/api';

const buildingStore = useBuildingStore();

const activeTab = ref('facilities');
const facilities = ref([]);
const bookings = ref([]);
const showModal = ref(false);
const submitting = ref(false);
const form = reactive({ name: '', description: '' });

const loadData = () => {
  const bId = buildingStore.activeBuildingId || buildingStore.buildings[0]?.id;
  if (!bId) return;
  fetchFacilities(bId);
  fetchBookings(bId);
};

onMounted(loadData);
watch(() => buildingStore.activeBuildingId, loadData);

const fetchFacilities = async (bId) => {
  try {
    const res = await api.get(`/api/admin/buildings/${bId}/facilities`);
    facilities.value = res.data.data;
  } catch (error) {
    console.error('Failed to fetch facilities:', error);
  }
};

const fetchBookings = async (bId) => {
  try {
    const res = await api.get(`/api/admin/buildings/${bId}/facility-bookings`);
    bookings.value = res.data.data;
  } catch (error) {
    console.error('Failed to fetch facility bookings:', error);
  }
};

const openCreateFacilityModal = () => {
  form.name = '';
  form.description = '';
  showModal.value = true;
};

const handleCreateFacility = async () => {
  submitting.value = true;
  try {
    const bId = buildingStore.activeBuildingId || buildingStore.buildings[0]?.id;
    const res = await api.post(`/api/admin/buildings/${bId}/facilities`, form);
    await showSuccess('สำเร็จ!', res.data.message);
    showModal.value = false;
    loadData();
  } catch (error) {
    showError('เกิดข้อผิดพลาด', error.response?.data?.message || 'ไม่สามารถเพิ่มพื้นที่ส่วนกลางได้');
  } finally {
    submitting.value = false;
  }
};

const toggleFacilityActive = async (f) => {
  try {
    await api.patch(`/api/admin/facilities/${f.id}`, { isActive: !f.isActive });
    loadData();
  } catch (error) {
    showError('เกิดข้อผิดพลาด', error.response?.data?.message || 'ไม่สามารถอัปเดตสถานะได้');
  }
};

const handleDeleteFacility = async (id) => {
  const confirmed = await showConfirm('ยืนยันลบ', 'ต้องการลบพื้นที่ส่วนกลางนี้ใช่หรือไม่?');
  if (!confirmed) return;
  try {
    await api.delete(`/api/admin/facilities/${id}`);
    loadData();
  } catch (error) {
    showError('เกิดข้อผิดพลาด', error.response?.data?.message || 'ไม่สามารถลบได้');
  }
};

const handleCancelBooking = async (id) => {
  const confirmed = await showConfirm('ยืนยันยกเลิก', 'ต้องการยกเลิกการจองนี้ใช่หรือไม่?');
  if (!confirmed) return;
  try {
    await api.patch(`/api/admin/facility-bookings/${id}`);
    loadData();
  } catch (error) {
    showError('เกิดข้อผิดพลาด', error.response?.data?.message || 'ไม่สามารถยกเลิกได้');
  }
};

const formatDate = (d) => new Date(d).toLocaleString('th-TH');
const formatTime = (d) => new Date(d).toLocaleTimeString('th-TH');
</script>
