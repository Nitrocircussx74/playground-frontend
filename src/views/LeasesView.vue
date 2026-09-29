<template>
  <div class="space-y-6">
    <!-- Header Toolbar -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div>
        <h1 class="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
          <FileText class="w-6 h-6 text-cyan-600" />
          <span>จัดการสัญญาเช่า & ประวัติการเข้าอยู่ (Leases & Tenancy)</span>
        </h1>
        <p class="text-sm text-slate-500">
          ค้นหา ตรวจสอบสัญญาเช่า ดำเนินการแจ้งย้ายออก และคืนเงินมัดจำสำหรับผู้เช่าทุกห้องพัก
        </p>
      </div>

      <div class="flex items-center gap-2">
        <Button variant="outline" @click="fetchLeases">
          <RefreshCw :class="['w-3.5 h-3.5', loading ? 'animate-spin' : '']" /><span>รีเฟรชข้อมูล</span>
        </Button>
      </div>
    </div>

    <!-- Filter & Search Bar -->
    <Card class="p-4 flex flex-col md:flex-row items-center justify-between gap-4">
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
            กำลังพักอาศัย ({{ activeLeasesCount }})
          </button>
          <button
            @click="selectedStatus = 'ENDED'"
            class="px-3 py-1.5 rounded-lg transition-all cursor-pointer"
            :class="selectedStatus === 'ENDED' ? 'bg-slate-700 text-white shadow-2xs font-extrabold' : 'text-slate-500 hover:text-slate-800'"
          >
            ย้ายออกแล้ว ({{ endedLeasesCount }})
          </button>
        </div>
      </div>

      <!-- Search Input -->
      <div id="tour-lease-search" class="w-full md:w-72 relative">
        <Input
          v-model="searchQuery"
          type="text"
          placeholder="ค้นหาเลขห้อง หรือชื่อผู้เช่า..."
          class="pl-9 text-xs"
        />
        <span class="absolute left-3 top-2.5 text-muted-foreground"><Search class="w-4 h-4" /></span>
      </div>
    </Card>

    <!-- Loading State -->
    <Card v-if="loading" class="p-12 text-center text-slate-500">
      <div class="animate-spin w-8 h-8 border-4 border-cyan-600 border-t-transparent rounded-full mx-auto mb-3"></div>
      กำลังโหลดข้อมูลสัญญาเช่า...
    </Card>

    <!-- Leases Data List -->
    <div v-else-if="filteredLeases.length > 0" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      <Card
        v-for="item in filteredLeases"
        :key="item.id"
        class="p-5 space-y-4 hover:shadow-md transition-all relative overflow-hidden"
        :class="{ 'border-l-4 border-l-emerald-500': item.status === 'ACTIVE', 'border-l-4 border-l-slate-400': item.status === 'ENDED' }"
      >
        <!-- Card Top Header -->
        <div class="flex items-start justify-between border-b border-slate-100 pb-3">
          <div>
            <Badge :variant="item.status === 'ACTIVE' ? 'success' : (item.status === 'ENDED' ? 'neutral' : 'danger')">
              {{ item.status === 'ACTIVE' ? 'กำลังพักอาศัย' : (item.status === 'ENDED' ? 'ย้ายออกแล้ว' : 'ยกเลิกสัญญา') }}
            </Badge>

            <h3 class="text-base font-black text-slate-900 mt-1">
              ห้อง {{ item.room?.roomNumber || 'N/A' }}
              <span class="text-xs font-normal text-slate-500 ml-1">({{ item.building?.name || 'หอพัก' }})</span>
            </h3>
          </div>

          <div class="text-right font-mono">
            <div class="text-xs text-slate-400 font-bold uppercase">เงินมัดจำ</div>
            <div class="text-sm font-black text-emerald-700">฿{{ Number(item.depositAmount || 0).toLocaleString() }}</div>
          </div>
        </div>

        <!-- Tenant Info -->
        <div class="space-y-1 text-xs">
          <div class="font-bold text-slate-900 flex items-center justify-between">
            <div class="flex items-center gap-1.5">
              <img
                v-if="item.tenant?.linePictureUrl"
                :src="item.tenant.linePictureUrl"
                alt="LINE Avatar"
                class="w-5 h-5 rounded-full object-cover border border-emerald-500 shadow-xs"
              />
              <div
                v-else
                class="w-5 h-5 rounded-full bg-slate-200 text-slate-700 font-extrabold text-xs flex items-center justify-center border border-slate-300"
              >
                {{ item.tenant?.firstName ? item.tenant.firstName.charAt(0) : 'U' }}
              </div>
              <span>{{ item.tenant ? `${item.tenant.firstName} ${item.tenant.lastName}` : 'ผู้เช่า' }}</span>
            </div>
            <span class="text-slate-500 font-mono text-xs font-normal">{{ item.tenant?.phone || '-' }}</span>
          </div>

          <div class="grid grid-cols-2 gap-2 text-xs text-slate-600 font-mono pt-2 border-t border-slate-100">
            <div>วันเริ่มสัญญา: {{ formatDate(item.startDate) }}</div>
            <div class="text-right">
              วันย้ายออก: <span class="font-bold text-slate-800">{{ item.actualEndDate ? formatDate(item.actualEndDate) : formatDate(item.expectedEndDate) }}</span>
            </div>
          </div>

          <!-- เลขมิเตอร์วันเข้าพัก: สัญญาที่ไม่ได้จดตอนสร้าง (เช่น ผู้เช่าลงทะเบียนเองผ่าน Invite Code) ต้องจดทีหลัง ไม่งั้นบิลรอบแรกอาจรวมหน่วยของผู้เช่าคนก่อน -->
          <div
            v-if="item.status === 'ACTIVE' && readingDrafts[item.id]"
            class="mt-2 p-2 rounded-xl border text-xs space-y-1.5"
            :class="hasInitialReadings(item) ? 'bg-slate-50 border-slate-200' : 'bg-amber-50 border-amber-200'"
          >
            <div class="font-bold" :class="hasInitialReadings(item) ? 'text-slate-700' : 'text-amber-900'">
              เลขมิเตอร์วันเข้าพัก
              <span v-if="!hasInitialReadings(item)" class="font-medium">(ยังไม่ได้จด: บิลรอบแรกอาจรวมหน่วยของผู้เช่าคนก่อน)</span>
            </div>
            <div class="grid grid-cols-3 gap-2">
              <input
                v-model="readingDrafts[item.id].water"
                type="number"
                min="0"
                step="any"
                placeholder="น้ำ"
                class="w-full bg-white border border-slate-200 rounded-lg px-2 py-1 font-mono text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500"
              />
              <input
                v-model="readingDrafts[item.id].electric"
                type="number"
                min="0"
                step="any"
                placeholder="ไฟ"
                class="w-full bg-white border border-slate-200 rounded-lg px-2 py-1 font-mono text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500"
              />
              <Button size="sm" class="py-1 h-auto rounded-lg" :disabled="savingReadingId === item.id" @click="saveInitialReadings(item)">
                บันทึก
              </Button>
            </div>
          </div>

          <div v-if="item.moveOutReason || item.adminNote" class="mt-2 p-2 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-600 space-y-1">
            <div v-if="item.moveOutReason" class="font-medium text-slate-700">
              <span class="font-bold text-slate-800">เหตุผลย้ายออก:</span> {{ item.moveOutReason }}
            </div>
            <div v-if="item.adminNote" class="text-slate-500 italic">
              <span class="font-semibold text-slate-700">หมายเหตุ:</span> {{ item.adminNote }}
            </div>
          </div>
        </div>

        <!-- Card Action Buttons -->
        <div class="pt-2 border-t border-slate-100 grid grid-cols-2 sm:grid-cols-4 gap-2">
          <Button
            variant="outline"
            size="sm"
            class="text-teal-700 border-teal-200 hover:bg-teal-50 h-auto py-2"
            title="ดูและพิมพ์สัญญาเช่าห้องพักฉบับเต็ม"
            @click="openContractPreview(item)"
          >
            <FileText class="w-3.5 h-3.5" /><span>สัญญาเช่า</span>
          </Button>

          <router-link
            v-if="item.tenantId || item.tenant?.id"
            :to="`/tenants/${item.tenantId || item.tenant?.id}`"
            class="py-2 bg-cyan-50 hover:bg-cyan-100 text-cyan-700 border border-cyan-200 rounded-md text-xs font-bold transition-all flex items-center justify-center gap-1 cursor-pointer"
          >
            <User class="w-3.5 h-3.5" /><span>โปรไฟล์</span>
          </router-link>

          <Button variant="outline" size="sm" class="h-auto py-2" @click="openRoomHistory(item.room)">
            <History class="w-3.5 h-3.5" /><span>ประวัติห้อง</span>
          </Button>

          <Button
            id="tour-btn-move-out"
            v-if="item.status === 'ACTIVE'"
            variant="destructive"
            size="sm"
            class="h-auto py-2"
            @click="openMoveOutWizard(item)"
          >
            <LogOut class="w-3.5 h-3.5" /><span>แจ้งย้ายออก</span>
          </Button>
        </div>
      </Card>
    </div>

    <!-- Empty State -->
    <Card v-else class="p-12 text-center text-slate-400 space-y-2">
      <div class="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center mx-auto text-slate-400 mb-2"><FileText class="w-6 h-6" /></div>
      <div class="text-sm font-bold text-slate-700">ไม่พบรายการสัญญาเช่า</div>
      <p class="text-xs">ลองค้นหาด้วยคำอื่น หรือเลือกตัวกรองสถานะเป็น "ทั้งหมด"</p>
    </Card>

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

    <!-- E-Contract Print Modal -->
    <ContractPrintModal
      :show="showContractModal"
      :lease="selectedContractLease"
      @close="showContractModal = false"
    />
  </div>
</template>

<script setup>
import { FileText, RefreshCw, Search, User, History, LogOut } from 'lucide-vue-next';
import { ref, reactive, computed, onMounted, watch } from 'vue';
import { useBuildingStore } from '@/stores/useBuildingStore';
import api from '@/utils/api';
import { showSuccess, showError } from '@/utils/swal';
import { startTour } from '@/utils/tours';
import { formatDate } from '@/utils/formatters';
import RoomTenancyHistoryModal from '@/components/RoomTenancyHistoryModal.vue';
import MoveOutWizardModal from '@/components/MoveOutWizardModal.vue';
import ContractPrintModal from '@/components/contract/ContractPrintModal.vue';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';

const buildingStore = useBuildingStore();
const leases = ref([]);
const loading = ref(false);
const searchQuery = ref('');
const selectedStatus = ref('ALL');

const showHistoryModal = ref(false);
const showMoveOutModal = ref(false);
const showContractModal = ref(false);
const selectedRoom = ref(null);
const selectedLease = ref(null);
const selectedContractLease = ref(null);

const activeLeasesCount = computed(() => leases.value.filter((l) => l.status === 'ACTIVE').length);
const endedLeasesCount = computed(() => leases.value.filter((l) => l.status === 'ENDED').length);

const readingDrafts = reactive({});
const savingReadingId = ref(null);
const hasInitialReadings = (l) => l.initialWaterReading != null || l.initialElectricReading != null;

const saveInitialReadings = async (lease) => {
  const draft = readingDrafts[lease.id];
  savingReadingId.value = lease.id;
  try {
    const res = await api.patch(`/api/admin/leases/${lease.id}/initial-readings`, {
      initialWaterReading: draft.water,
      initialElectricReading: draft.electric
    });
    Object.assign(lease, res.data.data);
    await showSuccess('สำเร็จ', 'บันทึกเลขมิเตอร์วันเข้าพักเรียบร้อยแล้ว');
  } catch (err) {
    showError('ข้อผิดพลาด', err.response?.data?.message || 'ไม่สามารถบันทึกเลขมิเตอร์ได้');
  } finally {
    savingReadingId.value = null;
  }
};

const fetchLeases = async () => {
  loading.value = true;
  try {
    const bId = buildingStore.activeBuildingId;
    const res = await api.get('/api/admin/leases', {
      params: { ...(bId && { buildingId: bId }) }
    });
    leases.value = Array.isArray(res.data?.data) ? res.data.data : [];
    leases.value.forEach((l) => {
      readingDrafts[l.id] = { water: l.initialWaterReading ?? '', electric: l.initialElectricReading ?? '' };
    });
  } catch (err) {
    console.error('Failed to fetch leases:', err);
    leases.value = [];
  } finally {
    loading.value = false;
  }
};

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

const openContractPreview = async (lease) => {
  try {
    const res = await api.get(`/api/admin/leases/${lease.id}/contract`);
    if (res.data?.success) {
      selectedContractLease.value = res.data.data;
      showContractModal.value = true;
    }
  } catch (err) {
    selectedContractLease.value = lease;
    showContractModal.value = true;
  }
};
</script>
