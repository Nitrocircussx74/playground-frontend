<template>
  <div class="space-y-6">
    <!-- Header Banner -->
    <div class="bg-gradient-to-r from-amber-600 via-orange-600 to-slate-900 p-6 rounded-3xl text-white shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
      <div>
        <div class="flex items-center gap-2">
          <span class="px-3 py-1 bg-amber-400/30 border border-amber-300/40 rounded-full text-xs font-bold tracking-wider uppercase text-amber-100">
            Smart Parcel Management
          </span>
        </div>
        <h1 class="text-2xl font-black tracking-tight text-white mt-1">📦 จัดการพัสดุอัจฉริยะ (Parcel Management)</h1>
        <p class="text-xs text-amber-100/80 mt-1 max-w-xl">
          บันทึกรับพัสดุ ถ่ายรูปหน้ากล่อง แจ้งเตือนลูกบ้านทาง LINE อัตโนมัติ พร้อมอัปเดตสถานะการรับของ
        </p>
      </div>

      <button
        @click="openCreateModal"
        class="px-5 py-2.5 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white rounded-xl text-xs sm:text-sm font-bold transition-all shadow-lg shadow-amber-600/30 flex items-center gap-2 shrink-0 cursor-pointer"
      >
        <span>➕ บันทึกพัสดุเข้าใหม่ (Receive Parcel)</span>
      </button>
    </div>

    <!-- KPI Stats Bar -->
    <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
      <div class="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs flex items-center gap-3">
        <div class="w-10 h-10 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center font-bold text-lg">
          📦
        </div>
        <div>
          <div class="text-[11px] font-bold text-slate-400 uppercase tracking-wider">พัสดุทั้งหมดในระบบ</div>
          <div class="text-xl font-black text-slate-900 font-mono">{{ parcels.length }} รายการ</div>
        </div>
      </div>

      <div class="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs flex items-center gap-3">
        <div class="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold text-lg">
          ⏳
        </div>
        <div>
          <div class="text-[11px] font-bold text-slate-400 uppercase tracking-wider">รอรับที่นิติฯ (Pending)</div>
          <div class="text-xl font-black text-amber-600 font-mono">{{ pendingCount }} รายการ</div>
        </div>
      </div>

      <div class="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs flex items-center gap-3">
        <div class="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold text-lg">
          ✅
        </div>
        <div>
          <div class="text-[11px] font-bold text-slate-400 uppercase tracking-wider">รับไปแล้ว (Picked Up)</div>
          <div class="text-xl font-black text-emerald-600 font-mono">{{ pickedUpCount }} รายการ</div>
        </div>
      </div>
    </div>

    <!-- Filter & Data Table -->
    <div class="bg-white border border-slate-200 rounded-3xl shadow-xs overflow-hidden">
      <div class="p-4 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <!-- Filter Tabs -->
        <div class="flex items-center gap-2">
          <button
            @click="filterStatus = 'ALL'"
            class="px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer"
            :class="filterStatus === 'ALL' ? 'bg-orange-600 text-white shadow-xs' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'"
          >
            ทั้งหมด ({{ parcels.length }})
          </button>
          <button
            @click="filterStatus = 'PENDING'"
            class="px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer"
            :class="filterStatus === 'PENDING' ? 'bg-amber-500 text-white shadow-xs' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'"
          >
            ⏳ รอรับ ({{ pendingCount }})
          </button>
          <button
            @click="filterStatus = 'PICKED_UP'"
            class="px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer"
            :class="filterStatus === 'PICKED_UP' ? 'bg-emerald-600 text-white shadow-xs' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'"
          >
            ✅ รับแล้ว ({{ pickedUpCount }})
          </button>
        </div>

        <button @click="fetchParcels" class="text-xs text-orange-600 hover:underline font-semibold cursor-pointer flex items-center gap-1">
          <span>🔄 รีเฟรชรายการ</span>
        </button>
      </div>

      <div class="overflow-x-auto">
        <table class="w-full text-left text-sm text-slate-700">
          <thead class="bg-slate-50 text-xs text-slate-500 uppercase tracking-wider border-b border-slate-200 font-bold">
            <tr>
              <th class="p-3.5">รูปหน้ากล่อง</th>
              <th class="p-3.5">ห้องพัก</th>
              <th class="p-3.5">ผู้เช่า</th>
              <th class="p-3.5">บริษัทขนส่ง</th>
              <th class="p-3.5">เลขแทรคกิ้ง</th>
              <th class="p-3.5">เวลาที่รับเข้า</th>
              <th class="p-3.5">เวลาที่รับของออก</th>
              <th class="p-3.5">สถานะ</th>
              <th class="p-3.5 text-right">Actions</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100">
            <tr v-for="item in filteredParcels" :key="item.id" class="hover:bg-slate-50/60 transition-colors">
              <td class="p-3.5">
                <div v-if="item.photoUrl">
                  <a :href="item.photoUrl" target="_blank">
                    <img :src="item.photoUrl" class="w-12 h-12 rounded-xl object-cover border border-slate-200 shadow-2xs hover:scale-110 transition-transform" />
                  </a>
                </div>
                <div v-else class="w-12 h-12 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-400 text-xs font-bold">
                  ไม่มีรูป
                </div>
              </td>
              <td class="p-3.5 font-bold text-slate-900">ห้อง {{ item.room?.roomNumber }}</td>
              <td class="p-3.5 text-xs text-slate-600 font-medium">
                {{ item.tenant ? `${item.tenant.firstName} ${item.tenant.lastName}` : (item.room?.tenant ? `${item.room.tenant.firstName} ${item.room.tenant.lastName}` : 'N/A') }}
              </td>
              <td class="p-3.5 font-bold text-orange-700 text-xs">🚚 {{ item.courier }}</td>
              <td class="p-3.5 font-mono text-xs text-indigo-700 font-semibold">{{ item.trackingNumber || '-' }}</td>
              <td class="p-3.5 text-xs text-slate-500 font-mono">{{ formatDate(item.receivedAt) }}</td>
              <td class="p-3.5 text-xs text-slate-500 font-mono">{{ item.pickedUpAt ? formatDate(item.pickedUpAt) : '-' }}</td>
              <td class="p-3.5">
                <span
                  class="text-[11px] font-extrabold px-2.5 py-1 rounded-full border shadow-2xs inline-flex items-center gap-1"
                  :class="{
                    'bg-amber-100 border-amber-300 text-amber-800': item.status === 'PENDING',
                    'bg-emerald-100 border-emerald-300 text-emerald-800': item.status === 'PICKED_UP'
                  }"
                >
                  <span>{{ item.status === 'PENDING' ? '⏳' : '✅' }}</span>
                  <span>{{ item.status === 'PENDING' ? 'รอรับที่นิติฯ' : 'รับแล้ว' }}</span>
                </span>
              </td>
              <td class="p-3.5 text-right space-x-1.5">
                <!-- Mark as Picked Up Button -->
                <button
                  v-if="item.status === 'PENDING'"
                  @click="handleMarkPickedUp(item.id, item.room?.roomNumber)"
                  class="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer"
                >
                  ✅ จ่ายพัสดุแล้ว
                </button>

                <!-- Delete Button -->
                <button
                  @click="handleDeleteParcel(item.id)"
                  class="px-2.5 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-xl text-xs font-semibold border border-rose-200 cursor-pointer"
                >
                  🗑️ ลบ
                </button>
              </td>
            </tr>

            <tr v-if="filteredParcels.length === 0">
              <td colspan="9" class="p-8 text-center text-slate-400 text-xs">
                ไม่มีรายการพัสดุในหมวดหมู่นี้
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Receive Parcel Modal -->
    <div v-if="showModal" class="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div class="bg-white rounded-3xl border border-slate-200 shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        <div class="px-6 py-4 bg-gradient-to-r from-orange-600 to-amber-600 text-white flex items-center justify-between">
          <div class="flex items-center gap-2">
            <span class="text-xl">📦</span>
            <h3 class="font-bold text-base text-white">บันทึกรับพัสดุเข้าใหม่ (Receive Parcel)</h3>
          </div>
          <button @click="showModal = false" class="text-orange-100 hover:text-white p-1 rounded-lg cursor-pointer">✕</button>
        </div>

        <form @submit.prevent="handleCreateParcel" class="p-6 space-y-4">
          <!-- Room Selector -->
          <div>
            <label class="block text-xs font-bold text-slate-700 mb-1">เลือกห้องพัก (Select Room)</label>
            <select
              v-model="form.roomId"
              required
              class="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
            >
              <option value="" disabled>-- เลือกห้องพัก --</option>
              <option v-for="r in roomStore.rooms" :key="r.id" :value="r.id">
                🚪 ห้อง {{ r.roomNumber }} (ชั้น {{ r.floor }}) - {{ r.tenant ? `${r.tenant.firstName} ${r.tenant.lastName}` : 'ห้องว่าง' }}
              </option>
            </select>
          </div>

          <!-- Courier Selector -->
          <div>
            <label class="block text-xs font-bold text-slate-700 mb-1">บริษัทขนส่ง (Courier)</label>
            <select
              v-model="form.courier"
              required
              class="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
            >
              <option value="Shopee Express">🚚 Shopee Express</option>
              <option value="Lazada Logistics">📦 Lazada Logistics</option>
              <option value="Kerry Express">🚚 Kerry Express</option>
              <option value="Flash Express">⚡ Flash Express</option>
              <option value="J&T Express">🚚 J&T Express</option>
              <option value="ไปรษณีย์ไทย (Thailand Post)">📮 ไปรษณีย์ไทย (EMS/ลงทะเบียน)</option>
              <option value="อื่นๆ (Other)">🚚 อื่นๆ</option>
            </select>
          </div>

          <!-- Tracking Number -->
          <div>
            <label class="block text-xs font-bold text-slate-700 mb-1">หมายเลขพัสดุ / Tracking Number (Optional)</label>
            <input
              v-model="form.trackingNumber"
              type="text"
              placeholder="เช่น TH0192837465 หรือ SHP99887766"
              class="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2 text-xs font-mono text-slate-900 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
            />
          </div>

          <!-- Photo Upload -->
          <div>
            <label class="block text-xs font-bold text-slate-700 mb-1">ถ่ายภาพ / อัปโหลดรูปหน้ากล่อง (Parcel Photo)</label>
            <input
              type="file"
              accept="image/*"
              @change="handlePhotoUpload"
              class="text-xs text-slate-500 file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-orange-50 file:text-orange-700 hover:file:bg-orange-100 cursor-pointer"
            />
            <div v-if="uploading" class="text-xs text-orange-600 font-semibold animate-pulse mt-1">กำลังอัปโหลดรูปภาพ...</div>

            <div v-if="form.photoUrl" class="mt-2 relative inline-block">
              <img :src="form.photoUrl" class="h-24 rounded-2xl object-cover border border-slate-200 shadow-xs" />
              <button
                type="button"
                @click="form.photoUrl = ''"
                class="absolute -top-2 -right-2 bg-rose-600 text-white rounded-full w-5 h-5 text-xs flex items-center justify-center font-bold"
              >
                ✕
              </button>
            </div>
          </div>

          <div class="pt-3 flex gap-3">
            <button
              type="button"
              @click="showModal = false"
              class="w-1/2 py-2.5 border border-slate-300 text-slate-700 hover:bg-slate-100 rounded-xl text-xs font-bold transition-all cursor-pointer"
            >
              ยกเลิก
            </button>
            <button
              type="submit"
              :disabled="submitting || uploading"
              class="w-1/2 py-2.5 bg-orange-600 hover:bg-orange-700 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-orange-600/20 disabled:opacity-50 cursor-pointer"
            >
              {{ submitting ? 'กำลังบันทึก...' : '✅ บันทึกพัสดุ' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, watch } from 'vue';
import { useRoomStore } from '@/stores/useRoomStore';
import { useBuildingStore } from '@/stores/useBuildingStore';
import uploadService from '@/services/uploadService';
import { showSuccess, showError, showConfirm } from '@/utils/swal';
import api from '@/utils/api';

const roomStore = useRoomStore();
const buildingStore = useBuildingStore();

const parcels = ref([]);
const filterStatus = ref('ALL');
const showModal = ref(false);
const submitting = ref(false);
const uploading = ref(false);

const form = reactive({
  roomId: '',
  courier: 'Shopee Express',
  trackingNumber: '',
  photoUrl: ''
});

const pendingCount = computed(() => parcels.value.filter((p) => p.status === 'PENDING').length);
const pickedUpCount = computed(() => parcels.value.filter((p) => p.status === 'PICKED_UP').length);

const filteredParcels = computed(() => {
  if (filterStatus.value === 'ALL') return parcels.value;
  return parcels.value.filter((p) => p.status === filterStatus.value);
});

const loadData = (buildingId) => {
  const targetBuildingId = buildingId || buildingStore.activeBuildingId;
  roomStore.fetchRooms(targetBuildingId);
  fetchParcels();
};

onMounted(() => {
  loadData();
});

watch(
  () => buildingStore.activeBuildingId,
  (newBuildingId) => {
    loadData(newBuildingId);
  }
);

const fetchParcels = async () => {
  try {
    const bId = buildingStore.activeBuildingId || (buildingStore.buildings[0]?.id || '');
    if (!bId) return;

    const res = await api.get(`/api/admin/buildings/${bId}/parcels`);
    parcels.value = res.data.data;
  } catch (error) {
    console.error('Failed to fetch parcels:', error);
  }
};

const openCreateModal = () => {
  form.roomId = roomStore.rooms[0]?.id || '';
  form.courier = 'Shopee Express';
  form.trackingNumber = '';
  form.photoUrl = '';
  showModal.value = true;
};

const handlePhotoUpload = async (event) => {
  const file = event.target.files[0];
  if (!file) return;

  uploading.value = true;
  try {
    const res = await uploadService.uploadFile(file);
    form.photoUrl = res.data.url;
    await showSuccess('สำเร็จ!', 'อัปโหลดรูปถ่ายพัสดุเรียบร้อยแล้ว');
  } catch (err) {
    showError('เกิดข้อผิดพลาด', err.response?.data?.message || 'ไม่สามารถอัปโหลดรูปภาพได้');
  } finally {
    uploading.value = false;
  }
};

const handleCreateParcel = async () => {
  submitting.value = true;
  try {
    const bId = buildingStore.activeBuildingId || buildingStore.buildings[0]?.id;
    const res = await api.post(`/api/admin/buildings/${bId}/parcels`, {
      roomId: form.roomId,
      courier: form.courier,
      trackingNumber: form.trackingNumber,
      photoUrl: form.photoUrl
    });

    await showSuccess('สำเร็จ!', res.data.message || 'บันทึกพัสดุเรียบร้อยแล้ว');
    showModal.value = false;
    fetchParcels();
  } catch (error) {
    showError('เกิดข้อผิดพลาด', error.response?.data?.message || 'ไม่สามารถบันทึกพัสดุได้');
  } finally {
    submitting.value = false;
  }
};

const handleMarkPickedUp = async (id, roomNumber) => {
  const confirmed = await showConfirm('ยืนยันจ่ายพัสดุ', `ยืนยันว่าลูกบ้านห้อง ${roomNumber || ''} รับพัสดุไปเรียบร้อยแล้ว?`);
  if (!confirmed) return;

  try {
    const res = await api.patch(`/api/admin/parcels/${id}/pickup`);
    await showSuccess('สำเร็จ!', res.data.message || 'อัปเดตสถานะรับพัสดุเรียบร้อยแล้ว');
    fetchParcels();
  } catch (error) {
    showError('เกิดข้อผิดพลาด', error.response?.data?.message || 'ไม่สามารถอัปเดตสถานะพัสดุได้');
  }
};

const handleDeleteParcel = async (id) => {
  const confirmed = await showConfirm('ยืนยันลบพัสดุ', 'คุณต้องการลบรายการพัสดุนี้ใช่หรือไม่?');
  if (!confirmed) return;

  try {
    await api.delete(`/api/admin/parcels/${id}`);
    await showSuccess('สำเร็จ!', 'ลบรายการพัสดุเรียบร้อยแล้ว');
    fetchParcels();
  } catch (error) {
    showError('เกิดข้อผิดพลาด', error.response?.data?.message || 'ไม่สามารถลบพัสดุได้');
  }
};

const formatDate = (dateStr) => {
  if (!dateStr) return '-';
  return new Date(dateStr).toLocaleString('th-TH');
};
</script>
