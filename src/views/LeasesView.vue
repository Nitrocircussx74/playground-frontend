<template>
  <div class="space-y-6">
    <!-- Header Toolbar -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div>
        <h1 class="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
          <span>📜</span>
          <span>จัดการสัญญาเช่า & ประวัติการเข้าอยู่ (Leases & Tenancy)</span>
        </h1>
        <p class="text-sm text-slate-500">
          ค้นหา ตรวจสอบสัญญาเช่า ดำเนินการแจ้งย้ายออก และคืนเงินมัดจำสำหรับผู้เช่าทุกห้องพัก
        </p>
      </div>

      <div class="flex items-center gap-2">
        <button
          @click="fetchLeases"
          class="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition-all border border-slate-200 flex items-center gap-1.5 cursor-pointer"
        >
          <span>🔄 รีเฟรชข้อมูล</span>
        </button>
      </div>
    </div>

    <!-- Filter & Search Bar -->
    <div class="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs flex flex-col md:flex-row items-center justify-between gap-4">
      <div class="flex flex-wrap items-center gap-3 w-full md:w-auto">
        <!-- Status Filter Tabs -->
        <div id="tour-lease-status-tabs" class="flex items-center bg-slate-100 p-1 rounded-xl text-xs font-bold">
          <button
            @click="selectedStatus = 'ALL'"
            class="px-3 py-1.5 rounded-lg transition-all cursor-pointer"
            :class="selectedStatus === 'ALL' ? 'bg-white text-slate-900 shadow-2xs font-extrabold' : 'text-slate-500 hover:text-slate-800'"
          >
            ทั้งหมด ({{ leases.length }})
          </button>
          <button
            @click="selectedStatus = 'ACTIVE'"
            class="px-3 py-1.5 rounded-lg transition-all cursor-pointer"
            :class="selectedStatus === 'ACTIVE' ? 'bg-emerald-600 text-white shadow-2xs font-extrabold' : 'text-slate-500 hover:text-slate-800'"
          >
            🟢 กำลังพักอาศัย ({{ activeLeasesCount }})
          </button>
          <button
            @click="selectedStatus = 'ENDED'"
            class="px-3 py-1.5 rounded-lg transition-all cursor-pointer"
            :class="selectedStatus === 'ENDED' ? 'bg-slate-700 text-white shadow-2xs font-extrabold' : 'text-slate-500 hover:text-slate-800'"
          >
            ⚪ ย้ายออกแล้ว ({{ endedLeasesCount }})
          </button>
        </div>
      </div>

      <!-- Search Input -->
      <div id="tour-lease-search" class="w-full md:w-72 relative">
        <input
          v-model="searchQuery"
          type="text"
          placeholder="ค้นหาเลขห้อง หรือชื่อผู้เช่า..."
          class="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2 text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-500/20"
        />
        <span class="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs">🔍</span>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="p-12 text-center text-slate-500">
      <div class="animate-spin w-8 h-8 border-4 border-purple-600 border-t-transparent rounded-full mx-auto mb-3"></div>
      กำลังโหลดข้อมูลสัญญาเช่า...
    </div>

    <!-- Leases Data List -->
    <div v-else-if="filteredLeases.length > 0" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      <div
        v-for="item in filteredLeases"
        :key="item.id"
        class="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs space-y-4 hover:shadow-md transition-all relative overflow-hidden"
        :class="{ 'border-l-4 border-l-emerald-500': item.status === 'ACTIVE', 'border-l-4 border-l-slate-400': item.status === 'ENDED' }"
      >
        <!-- Card Top Header -->
        <div class="flex items-start justify-between border-b border-slate-100 pb-3">
          <div>
            <span
              class="text-[10px] font-extrabold px-2.5 py-0.5 rounded-full border shadow-2xs inline-flex items-center gap-1"
              :class="{
                'bg-emerald-100 border-emerald-300 text-emerald-800': item.status === 'ACTIVE',
                'bg-slate-100 border-slate-300 text-slate-600': item.status === 'ENDED',
                'bg-rose-100 border-rose-300 text-rose-800': item.status === 'CANCELLED'
              }"
            >
              <span>{{ item.status === 'ACTIVE' ? '🟢 กำลังพักอาศัย' : (item.status === 'ENDED' ? '⚪ ย้ายออกแล้ว' : '🔴 ยกเลิกสัญญา') }}</span>
            </span>

            <h3 class="text-base font-black text-slate-900 mt-1">
              ห้อง {{ item.room?.roomNumber || 'N/A' }}
              <span class="text-xs font-normal text-slate-500 ml-1">({{ item.building?.name || 'หอพัก' }})</span>
            </h3>
          </div>

          <div class="text-right font-mono">
            <div class="text-[10px] text-slate-400 font-bold uppercase">เงินมัดจำ</div>
            <div class="text-sm font-black text-emerald-700">฿{{ Number(item.depositAmount || 0).toLocaleString() }}</div>
          </div>
        </div>

        <!-- Tenant Info -->
        <div class="space-y-1 text-xs">
          <div class="font-bold text-slate-900 flex items-center justify-between">
            <span>👤 {{ item.tenant ? `${item.tenant.firstName} ${item.tenant.lastName}` : 'ผู้เช่า' }}</span>
            <span class="text-slate-500 font-mono text-[11px] font-normal">📞 {{ item.tenant?.phone || '-' }}</span>
          </div>

          <div class="grid grid-cols-2 gap-2 text-[11px] text-slate-600 font-mono pt-2 border-t border-slate-100">
            <div>📅 วันเริ่มสัญญา: {{ formatDate(item.startDate) }}</div>
            <div class="text-right">
              📅 วันย้ายออก: <span class="font-bold text-slate-800">{{ item.actualEndDate ? formatDate(item.actualEndDate) : formatDate(item.expectedEndDate) }}</span>
            </div>
          </div>

          <div v-if="item.moveOutReason || item.adminNote" class="mt-2 p-2 bg-slate-50 rounded-xl border border-slate-200 text-[11px] text-slate-600 space-y-1">
            <div v-if="item.moveOutReason" class="font-medium text-slate-700">
              <span class="font-bold text-slate-800">📌 เหตุผลย้ายออก:</span> {{ item.moveOutReason }}
            </div>
            <div v-if="item.adminNote" class="text-slate-500 italic">
              <span class="font-semibold text-slate-700">📝 หมายเหตุ:</span> {{ item.adminNote }}
            </div>
          </div>
        </div>

        <!-- Card Action Buttons -->
        <div class="pt-2 border-t border-slate-100 flex gap-2">
          <button
            @click="openRoomHistory(item.room)"
            class="w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1 cursor-pointer"
          >
            <span>📜 ประวัติห้อง</span>
          </button>

          <button
            id="tour-btn-move-out"
            v-if="item.status === 'ACTIVE'"
            @click="openMoveOutWizard(item)"
            class="w-full py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-1 cursor-pointer"
          >
            <span>🚨 แจ้งย้ายออก</span>
          </button>
        </div>
      </div>
    </div>

    <!-- Empty State -->
    <div v-else class="p-12 text-center bg-white border border-slate-200 rounded-3xl text-slate-400 space-y-2">
      <div class="text-4xl">📜</div>
      <div class="text-sm font-bold text-slate-700">ไม่พบรายการสัญญาเช่า</div>
      <p class="text-xs">ลองค้นหาด้วยคำอื่น หรือเลือกตัวกรองสถานะเป็น "ทั้งหมด"</p>
    </div>

    <!-- Room Tenancy History Modal -->
    <RoomTenancyHistoryModal
      :show="showHistoryModal"
      :room="selectedRoom"
      @close="showHistoryModal = false"
      @updated="fetchLeases"
    />

    <!-- Move Out Wizard Modal -->
    <MoveOutWizardModal
      :show="showMoveOutModal"
      :lease="selectedLease"
      :room="selectedLease?.room"
      @close="showMoveOutModal = false"
      @completed="fetchLeases"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import { useBuildingStore } from '@/stores/useBuildingStore';
import api from '@/utils/api';
import RoomTenancyHistoryModal from '@/components/RoomTenancyHistoryModal.vue';
import MoveOutWizardModal from '@/components/MoveOutWizardModal.vue';

const buildingStore = useBuildingStore();
const leases = ref([]);
const loading = ref(false);
const searchQuery = ref('');
const selectedStatus = ref('ALL');

const showHistoryModal = ref(false);
const showMoveOutModal = ref(false);
const selectedRoom = ref(null);
const selectedLease = ref(null);

const activeLeasesCount = computed(() => leases.value.filter((l) => l.status === 'ACTIVE').length);
const endedLeasesCount = computed(() => leases.value.filter((l) => l.status === 'ENDED').length);

const fetchLeases = async () => {
  loading.value = true;
  try {
    const bId = buildingStore.activeBuildingId;
    // Fetch all leases across building/rooms
    const res = await api.get('/api/admin/rooms/all/leases', {
      params: { ...(bId && { buildingId: bId }) }
    });
    leases.value = res.data.data;
  } catch (err) {
    // Fallback query if specific route not available
    try {
      const res = await api.get('/api/admin/buildings/' + (buildingStore.activeBuildingId || 'all') + '/leases');
      leases.value = res.data.data;
    } catch {
      leases.value = [];
    }
  } finally {
    loading.value = false;
  }
};

import { startTour } from '@/utils/tours';

onMounted(() => {
  buildingStore.fetchBuildings();
  fetchLeases();
  setTimeout(() => {
    startTour('leases');
  }, 600);
});

watch(
  () => buildingStore.activeBuildingId,
  () => {
    fetchLeases();
  }
);

const filteredLeases = computed(() => {
  return leases.value.filter((l) => {
    const matchStatus = selectedStatus.value === 'ALL' || l.status === selectedStatus.value;
    const roomNum = l.room?.roomNumber || '';
    const tName = l.tenant ? `${l.tenant.firstName} ${l.tenant.lastName}` : '';
    const query = searchQuery.value.trim().toLowerCase();
    const matchQuery = !query || roomNum.toLowerCase().includes(query) || tName.toLowerCase().includes(query);
    return matchStatus && matchQuery;
  });
});

const openRoomHistory = (room) => {
  selectedRoom.value = room;
  showHistoryModal.value = true;
};

const openMoveOutWizard = (lease) => {
  selectedLease.value = lease;
  showMoveOutModal.value = true;
};

const formatDate = (dateStr) => {
  if (!dateStr) return '-';
  return new Date(dateStr).toLocaleDateString('th-TH');
};
</script>
