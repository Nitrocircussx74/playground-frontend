<template>
  <div class="space-y-6">
    <!-- Header & Action Buttons -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div>
        <h1 class="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
          <span>จัดการห้องพัก & พื้นที่เช่า (Units & Spaces)</span>
          <span class="text-xs font-bold px-2.5 py-0.5 rounded-full bg-purple-100 text-purple-700 border border-purple-200">
            {{ filteredRooms.length }} ยูนิต
          </span>
        </h1>
        <p class="text-xs sm:text-sm text-slate-500 mt-0.5">
          ภาพรวมห้องพักอาศัย หน้าร้านค้า จุดวางตู้บริการ/เต่าบิน ที่จอดรถ และห้องเก็บของ
        </p>
      </div>

      <div class="flex flex-wrap items-center gap-2.5">
        <button
          @click="openCheckinModal()"
          class="px-3.5 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-purple-600/20 flex items-center gap-1.5 cursor-pointer active:scale-95"
        >
          <UserPlus class="w-3.5 h-3.5" />
          <span>+ เช็คอินผู้เช่า (Walk-in)</span>
        </button>

        <button
          @click="showImportModal = true"
          class="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-emerald-600/20 flex items-center gap-1.5 cursor-pointer active:scale-95"
        >
          <Upload class="w-3.5 h-3.5" />
          <span>นำเข้า CSV</span>
        </button>

        <button
          @click="showCreateModal = !showCreateModal"
          class="px-3.5 py-2 bg-white hover:bg-slate-50 text-purple-700 border border-purple-200 rounded-xl text-xs font-bold transition-all shadow-2xs flex items-center gap-1.5 cursor-pointer active:scale-95"
        >
          <Plus class="w-3.5 h-3.5" />
          <span>{{ showCreateModal ? 'ปิดแบบฟอร์ม' : '+ เพิ่มยูนิตใหม่' }}</span>
        </button>

        <button
          @click="roomStore.fetchRooms(buildingStore.activeBuildingId)"
          class="px-3.5 py-2 bg-white hover:bg-slate-100 text-slate-700 rounded-xl text-xs font-semibold transition-all border border-slate-200 shadow-2xs flex items-center gap-1.5 cursor-pointer active:scale-95"
        >
          <RefreshCw class="w-3.5 h-3.5 text-slate-500" :class="{ 'animate-spin': roomStore.isLoading }" />
          <span>รีเฟรช</span>
        </button>
      </div>
    </div>

    <!-- Category / Unit Type Filter Tabs (Horizontal Scrollable) -->
    <div class="bg-white p-2 rounded-2xl border border-slate-200 shadow-2xs flex items-center gap-1.5 overflow-x-auto">
      <button
        v-for="type in unitTypeOptions"
        :key="type.value"
        @click="activeTypeFilter = type.value"
        class="px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 flex items-center gap-1.5 cursor-pointer"
        :class="activeTypeFilter === type.value ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-100'"
      >
        <span>{{ type.icon }}</span>
        <span>{{ type.label }}</span>
        <span class="text-[10px] px-1.5 py-0.2 rounded-full font-mono font-bold" :class="activeTypeFilter === type.value ? 'bg-white/25 text-white' : 'bg-slate-100 text-slate-500'">
          {{ getCountByType(type.value) }}
        </span>
      </button>
    </div>

    <!-- Status Sub-Filter Pills -->
    <div class="flex items-center gap-2 overflow-x-auto pb-1">
      <span class="text-xs font-bold text-slate-400 pl-1 shrink-0">สถานะ:</span>
      <button
        v-for="filter in statusFilterOptions"
        :key="filter.value"
        @click="activeStatusFilter = filter.value"
        class="px-3 py-1 rounded-xl text-xs font-semibold transition-all border shrink-0 cursor-pointer"
        :class="activeStatusFilter === filter.value ? 'bg-slate-900 text-white border-slate-900' : 'bg-white text-slate-600 hover:bg-slate-50 border-slate-200'"
      >
        {{ filter.label }}
      </button>
    </div>

    <!-- Create Room / Rental Unit Form Panel -->
    <div v-if="showCreateModal" class="p-6 bg-white border border-purple-200/90 rounded-3xl shadow-md space-y-4">
      <div class="flex items-center justify-between">
        <h2 class="text-base font-bold text-slate-900 flex items-center gap-2">
          <Store class="w-5 h-5 text-purple-600" />
          <span>เพิ่มยูนิต / พื้นที่เช่าใหม่ (New Rental Unit / Space)</span>
        </h2>
        <span class="text-xs font-bold px-3 py-1 bg-purple-50 text-purple-700 border border-purple-200 rounded-full flex items-center gap-1.5">
          <Building2 class="w-3.5 h-3.5" />
          <span>ตึก: {{ activeBuildingName }}</span>
        </span>
      </div>

      <form @submit.prevent="handleCreateRoom" class="grid grid-cols-1 md:grid-cols-4 gap-4">
        <!-- 1. Unit Type -->
        <div>
          <label class="block text-xs font-bold text-slate-700 mb-1">ประเภทพื้นที่เช่า (Unit Type)</label>
          <select
            v-model="form.unitType"
            class="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-sm text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 cursor-pointer"
          >
            <option value="residential">🚪 ห้องพักอาศัย (Residential)</option>
            <option value="commercial_shop">🏪 ร้านค้า / ล็อคหน้าร้าน (Shop / Kiosk)</option>
            <option value="vending_spot">☕ จุดวางตู้เต่าบิน / ตู้บริการ (Vending Spot)</option>
            <option value="parking">🚗 ช่องจอดรถ (Parking Slot)</option>
            <option value="storage">📦 ห้องสต็อก / ล็อกเกอร์เก็บของ (Storage)</option>
            <option value="billboard_rooftop">📡 ดาดฟ้า / เสาสัญญาณ / ป้ายโฆษณา (Rooftop)</option>
          </select>
        </div>

        <!-- 2. Unit / Room Number -->
        <div>
          <label class="block text-xs font-bold text-slate-700 mb-1">รหัส/หมายเลขยูนิต (Number/ID)</label>
          <input
            v-model="form.roomNumber"
            type="text"
            :placeholder="getPlaceholderByUnitType(form.unitType)"
            required
            class="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-sm text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 font-mono"
          />
        </div>

        <!-- 3. Floor -->
        <div>
          <label class="block text-xs font-bold text-slate-700 mb-1">ชั้น (Floor)</label>
          <input
            v-model.number="form.floor"
            type="number"
            min="0"
            placeholder="เช่น 1, 2"
            required
            class="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-sm text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500"
          />
        </div>

        <!-- 4. Area Sq.M. -->
        <div>
          <label class="block text-xs font-bold text-slate-700 mb-1">ขนาดพื้นที่ (ตร.ม.)</label>
          <input
            v-model.number="form.areaSqm"
            type="number"
            step="0.1"
            placeholder="เช่น 24.5"
            class="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-sm text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500"
          />
        </div>

        <!-- 5. Monthly Price -->
        <div>
          <label class="block text-xs font-bold text-slate-700 mb-1">ราคาเช่ารายเดือน (บาท)</label>
          <input
            v-model.number="form.price"
            type="number"
            step="100"
            placeholder="เช่น 4500"
            required
            class="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-sm text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500"
          />
        </div>

        <!-- 6. Location Zone -->
        <div>
          <label class="block text-xs font-bold text-slate-700 mb-1">โซนที่ตั้ง (Location Zone)</label>
          <input
            v-model="form.locationZone"
            type="text"
            placeholder="เช่น ชั้น 1 ริมถนน, ลานจอด A"
            class="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-sm text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500"
          />
        </div>

        <!-- 7. Billing Model -->
        <div>
          <label class="block text-xs font-bold text-slate-700 mb-1">รูปแบบการคิดเงิน (Billing Model)</label>
          <select
            v-model="form.billingModel"
            class="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-sm text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 cursor-pointer"
          >
            <option value="fixed">💵 เหมาจ่ายรายเดือนคงที่ (Fixed Rent)</option>
            <option value="revenue_share">📊 ส่วนแบ่งยอดขาย (Revenue Share / GP %)</option>
            <option value="metered_only">⚡ คิดตามมิเตอร์จริง (Metered Only)</option>
          </select>
        </div>

        <!-- 8. Revenue Share % (If selected) -->
        <div v-if="form.billingModel === 'revenue_share'">
          <label class="block text-xs font-bold text-amber-700 mb-1">ส่วนแบ่งยอดขาย (% GP)</label>
          <input
            v-model.number="form.revSharePercent"
            type="number"
            step="0.5"
            placeholder="เช่น 10%"
            class="w-full bg-amber-50/50 border border-amber-300 rounded-xl px-3.5 py-2 text-sm text-amber-900 focus:outline-hidden focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 font-bold"
          />
        </div>

        <!-- 9. Initial Status -->
        <div>
          <label class="block text-xs font-bold text-slate-700 mb-1">สถานะเริ่มต้น (Status)</label>
          <select
            v-model="form.status"
            class="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-sm text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 cursor-pointer"
          >
            <option value="available">🟢 ว่างพร้อมให้เช่า (Available)</option>
            <option value="occupied">🔵 มีผู้เช่า (Occupied)</option>
            <option value="maintenance">🟠 ปิดปรับปรุง/ซ่อมแซม (Maintenance)</option>
          </select>
        </div>

        <div class="col-span-full flex justify-end gap-2 pt-2">
          <button
            type="button"
            @click="showCreateModal = false"
            class="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold cursor-pointer"
          >
            ยกเลิก
          </button>
          <button
            type="submit"
            :disabled="roomStore.isLoading"
            class="px-6 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-emerald-600/20 disabled:opacity-50 cursor-pointer"
          >
            {{ roomStore.isLoading ? 'กำลังบันทึก...' : 'บันทึกยูนิต/พื้นที่เช่า' }}
          </button>
        </div>
      </form>
    </div>

    <div v-if="roomStore.isLoading && !showCreateModal" class="p-12 text-center text-slate-500 bg-white rounded-3xl border border-slate-200">
      <div class="animate-spin w-8 h-8 border-4 border-purple-600 border-t-transparent rounded-full mx-auto mb-3"></div>
      กำลังโหลดข้อมูลพื้นที่เช่า...
    </div>

    <div v-else-if="roomStore.errorMessage" class="p-4 bg-rose-50 border border-rose-200 text-rose-700 rounded-2xl text-xs font-medium">
      {{ roomStore.errorMessage }}
    </div>

    <!-- Empty State -->
    <div v-else-if="filteredRooms.length === 0" class="p-12 text-center text-slate-500 bg-white rounded-3xl border border-slate-200 space-y-3">
      <div class="text-4xl">🏢</div>
      <div class="font-bold text-slate-800 text-base">ไม่พบข้อมูลพื้นที่เช่าตามตัวกรอง</div>
      <p class="text-xs text-slate-400">คุณสามารถเพิ่มยูนิตใหม่ หรือเปลี่ยนแท็บตัวกรองด้านบนได้</p>
    </div>

    <!-- Room / Rental Unit Cards Grid -->
    <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
      <div v-for="room in filteredRooms" :key="room.id" class="space-y-2">
        <RoomOverviewCard :room="room" />

        <!-- History & Actions Buttons -->
        <div v-if="room.status === 'available'" class="space-y-1.5">
          <div class="grid grid-cols-2 gap-2">
            <!-- 1. ทางเลือกผ่าน LINE -->
            <button
              @click="openInviteModal(room)"
              class="w-full py-2 bg-gradient-to-r from-emerald-50 to-teal-50 hover:from-emerald-100 hover:to-teal-100 text-emerald-800 border border-emerald-200 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs active:scale-95"
              title="สร้าง Invite Code / QR ให้ลูกบ้านลงทะเบียนผ่าน LINE"
            >
              <Key class="w-3.5 h-3.5 text-emerald-600" />
              <span>Invite Code (LINE)</span>
            </button>

            <!-- 2. ทางเลือกไม่ผ่าน LINE (Walk-in) -->
            <button
              @click="openCheckinModal(room)"
              class="w-full py-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs active:scale-95"
              title="แอดมินกรอกข้อมูลและทำสัญญาเข้าพักทันที"
            >
              <UserPlus class="w-3.5 h-3.5" />
              <span>เช็คอิน (Walk-in)</span>
            </button>
          </div>

          <!-- 3. ดูประวัติสัญญา -->
          <button
            @click="openHistoryModal(room)"
            class="w-full py-1.5 bg-white hover:bg-slate-50 text-slate-600 border border-slate-200 rounded-xl text-xs font-semibold transition-all flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <History class="w-3.5 h-3.5 text-slate-400" />
            <span>ประวัติสัญญาเช่า</span>
          </button>
        </div>

        <!-- Occupied / Maintenance Room Actions -->
        <div v-else class="grid grid-cols-1 gap-2">
          <button
            @click="openHistoryModal(room)"
            class="w-full py-2 bg-white hover:bg-purple-50 text-purple-700 border border-purple-200 rounded-xl text-xs font-semibold transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs hover:border-purple-300"
          >
            <History class="w-3.5 h-3.5" />
            <span>📜 ดูประวัติสัญญาเช่า</span>
          </button>
        </div>
      </div>
    </div>

    <!-- Manual Tenant Walk-in Check-in Modal -->
    <ManualTenantCheckinModal
      :show="showCheckinModal"
      :pre-selected-room-id="selectedRoomIdForCheckin"
      :rooms="roomStore.rooms"
      @close="showCheckinModal = false"
      @created="handleCheckinSuccess"
    />

    <!-- Room Tenancy History Modal -->
    <RoomTenancyHistoryModal
      :show="showHistoryModal"
      :room="selectedRoomForHistory"
      @close="showHistoryModal = false"
      @updated="loadRooms"
    />

    <!-- Room Invite Code Management Modal -->
    <RoomInviteModal
      :show="showInviteModal"
      :room="selectedRoomForInvite"
      @close="showInviteModal = false"
    />

    <!-- Bulk Room Import Modal -->
    <RoomImportModal
      :show="showImportModal"
      @close="showImportModal = false"
    />
  </div>
</template>

<script setup>
import { reactive, ref, computed, onMounted, watch } from 'vue';
import { useRoomStore } from '@/stores/useRoomStore';
import { useBuildingStore } from '@/stores/useBuildingStore';
import { showSuccess, showError } from '@/utils/swal';
import RoomOverviewCard from '@/components/RoomOverviewCard.vue';
import RoomInviteModal from '@/components/RoomInviteModal.vue';
import RoomImportModal from '@/components/RoomImportModal.vue';
import RoomTenancyHistoryModal from '@/components/RoomTenancyHistoryModal.vue';
import ManualTenantCheckinModal from '@/components/ManualTenantCheckinModal.vue';
import {
  Upload,
  Plus,
  RefreshCw,
  Store,
  Building2,
  History,
  Key,
  UserPlus
} from 'lucide-vue-next';

const roomStore = useRoomStore();
const buildingStore = useBuildingStore();

const showCheckinModal = ref(false);
const selectedRoomIdForCheckin = ref('');

const activeBuildingName = computed(() => {
  const current = buildingStore.buildings.find((b) => b.id === buildingStore.activeBuildingId);
  return current ? current.name : 'ตึกที่เลือกอยู่';
});

const showCreateModal = ref(false);
const showImportModal = ref(false);
const showInviteModal = ref(false);
const selectedRoomForInvite = ref(null);

const showHistoryModal = ref(false);
const selectedRoomForHistory = ref(null);

// Category Unit Type Filters
const activeTypeFilter = ref('all');
const unitTypeOptions = [
  { label: 'ทั้งหมด', value: 'all', icon: '🌐' },
  { label: 'ห้องพักอาศัย', value: 'residential', icon: '🚪' },
  { label: 'ร้านค้า/หน้าร้าน', value: 'commercial_shop', icon: '🏪' },
  { label: 'ตู้บริการ/เต่าบิน', value: 'vending_spot', icon: '☕' },
  { label: 'ที่จอดรถ', value: 'parking', icon: '🚗' },
  { label: 'ห้องเก็บของ', value: 'storage', icon: '📦' },
  { label: 'ดาดฟ้า/ป้าย', value: 'billboard_rooftop', icon: '📡' }
];

// Status Sub-Filters
const activeStatusFilter = ref('all');
const statusFilterOptions = [
  { label: 'ทั้งหมด (All)', value: 'all' },
  { label: '🟢 ว่าง (Available)', value: 'available' },
  { label: '🔵 มีผู้เช่า (Occupied)', value: 'occupied' },
  { label: '🟠 ซ่อมบำรุง (Maintenance)', value: 'maintenance' }
];

const getCountByType = (typeValue) => {
  if (!roomStore.rooms) return 0;
  if (typeValue === 'all') return roomStore.rooms.length;
  return roomStore.rooms.filter((r) => (r.unitType || 'residential') === typeValue).length;
};

const getPlaceholderByUnitType = (type) => {
  switch (type) {
    case 'commercial_shop': return 'เช่น SHOP-101, KIOSK-01';
    case 'vending_spot': return 'เช่น VEND-TAOBIN-01';
    case 'parking': return 'เช่น P-01, CAR-A10';
    case 'storage': return 'เช่น STORE-B01';
    case 'billboard_rooftop': return 'เช่น ROOF-5G-AIS';
    default: return 'เช่น 101, 202';
  }
};

const filteredRooms = computed(() => {
  let list = roomStore.rooms || [];

  if (activeTypeFilter.value !== 'all') {
    list = list.filter((r) => (r.unitType || 'residential') === activeTypeFilter.value);
  }

  if (activeStatusFilter.value !== 'all') {
    list = list.filter((r) => r.status === activeStatusFilter.value);
  }

  return list;
});

const openHistoryModal = (room) => {
  selectedRoomForHistory.value = room;
  showHistoryModal.value = true;
};

const form = reactive({
  roomNumber: '',
  floor: 1,
  price: 4500,
  status: 'available',
  unitType: 'residential',
  areaSqm: null,
  locationZone: '',
  billingModel: 'fixed',
  revSharePercent: null,
  buildingId: buildingStore.activeBuildingId || ''
});

onMounted(() => {
  buildingStore.fetchBuildings();
  roomStore.fetchRooms(buildingStore.activeBuildingId);
  if (buildingStore.activeBuildingId) {
    form.buildingId = buildingStore.activeBuildingId;
  }
});

watch(
  () => buildingStore.activeBuildingId,
  (newBuildingId) => {
    form.buildingId = newBuildingId;
    roomStore.fetchRooms(newBuildingId);
  }
);

const handleCreateRoom = async () => {
  try {
    await roomStore.createRoom({
      ...form,
      buildingId: form.buildingId || buildingStore.activeBuildingId
    });
    await showSuccess('สำเร็จ!', `สร้างยูนิต ${form.roomNumber} เรียบร้อยแล้ว`);
    form.roomNumber = '';
    form.areaSqm = null;
    form.locationZone = '';
    showCreateModal.value = false;
  } catch (error) {
    showError('เกิดข้อผิดพลาด', error.response?.data?.message || 'Failed to create unit');
  }
};

const openInviteModal = (room) => {
  selectedRoomForInvite.value = room;
  showInviteModal.value = true;
};

const openCheckinModal = (room = null) => {
  selectedRoomIdForCheckin.value = room ? room.id : '';
  showCheckinModal.value = true;
};

const handleCheckinSuccess = () => {
  roomStore.fetchRooms(buildingStore.activeBuildingId);
};
</script>
