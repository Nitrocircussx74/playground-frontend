<template>
  <div class="space-y-6">
    <!-- Header & Action Buttons -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div>
        <h1 class="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
          <span>{{ isRoomOwnerRole ? 'ห้องพักของฉัน (My Owned Rooms)' : 'จัดการห้องพัก & พื้นที่เช่า (Units & Spaces)' }}</span>
          <span class="text-xs font-bold px-2.5 py-0.5 rounded-full bg-cyan-100 text-cyan-700 border border-cyan-200">
            {{ filteredRooms.length }} ยูนิต
          </span>
        </h1>
        <p class="text-xs sm:text-sm text-slate-500 mt-0.5">
          {{ isRoomOwnerRole ? 'รายการห้องพักและยูนิตที่คุณถือครองกรรมสิทธิ์ พร้อมประวัติสัญญาและสถานะผู้เช่า' : 'ภาพรวมห้องพักอาศัย หน้าร้านค้า จุดวางตู้บริการ/เต่าบิน ที่จอดรถ และห้องเก็บของ' }}
        </p>
      </div>

      <div class="flex flex-wrap items-center gap-2.5">
        <Button @click="openCheckinModal()">
          <UserPlus class="w-3.5 h-3.5" />
          <span>+ เช็คอินผู้เช่า (Walk-in)</span>
        </Button>

        <Button
          v-if="!isRoomOwnerRole"
          class="bg-emerald-600 hover:bg-emerald-600/90 shadow-emerald-600/20"
          @click="showImportModal = true"
        >
          <Upload class="w-3.5 h-3.5" />
          <span>นำเข้า CSV</span>
        </Button>

        <Button
          v-if="!isRoomOwnerRole"
          variant="outline"
          @click="showCreateModal = !showCreateModal"
        >
          <Plus class="w-3.5 h-3.5" />
          <span>{{ showCreateModal ? 'ปิดแบบฟอร์ม' : '+ เพิ่มยูนิตใหม่' }}</span>
        </Button>

        <Button variant="outline" @click="roomStore.fetchRooms(buildingStore.activeBuildingId)">
          <RefreshCw class="w-3.5 h-3.5" :class="{ 'animate-spin': roomStore.isLoading }" />
          <span>รีเฟรช</span>
        </Button>
      </div>
    </div>

    <!-- Category / Unit Type Filter Tabs (Horizontal Scrollable) -->
    <Card class="p-2 flex items-center gap-1.5 overflow-x-auto">
      <button
        v-for="type in unitTypeOptions"
        :key="type.value"
        @click="activeTypeFilter = type.value"
        class="px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 flex items-center gap-1.5 cursor-pointer"
        :class="activeTypeFilter === type.value ? 'bg-cyan-600 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-100'"
      >
        <component :is="type.icon" class="w-3.5 h-3.5" />
        <span>{{ type.label }}</span>
        <span class="text-xs px-1.5 py-0.2 rounded-full font-mono font-bold" :class="activeTypeFilter === type.value ? 'bg-white/25 text-white' : 'bg-slate-100 text-slate-500'">
          {{ getCountByType(type.value) }}
        </span>
      </button>
    </Card>

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
    <Card v-if="showCreateModal" class="p-6 border-cyan-200/90 shadow-md space-y-4">
      <div class="flex items-center justify-between">
        <h2 class="text-base font-bold text-slate-900 flex items-center gap-2">
          <Store class="w-5 h-5 text-cyan-600" />
          <span>เพิ่มยูนิต / พื้นที่เช่าใหม่ (New Rental Unit / Space)</span>
        </h2>
        <span class="text-xs font-bold px-3 py-1 bg-cyan-50 text-cyan-700 border border-cyan-200 rounded-full flex items-center gap-1.5">
          <Building2 class="w-3.5 h-3.5" />
          <span>ตึก: {{ activeBuildingName }}</span>
        </span>
      </div>

      <form @submit.prevent="handleCreateRoom" class="grid grid-cols-1 md:grid-cols-4 gap-4">
        <!-- 1. Unit Type -->
        <div>
          <label class="block text-xs font-bold text-slate-700 mb-1">ประเภทพื้นที่เช่า (Unit Type)</label>
          <Select v-model="form.unitType">
            <option value="residential">ห้องพักอาศัย (Residential)</option>
            <option value="commercial_shop">ร้านค้า / ล็อคหน้าร้าน (Shop / Kiosk)</option>
            <option value="vending_spot">จุดวางตู้เต่าบิน / ตู้บริการ (Vending Spot)</option>
            <option value="parking">ช่องจอดรถ (Parking Slot)</option>
            <option value="storage">ห้องสต็อก / ล็อกเกอร์เก็บของ (Storage)</option>
            <option value="billboard_rooftop">ดาดฟ้า / เสาสัญญาณ / ป้ายโฆษณา (Rooftop)</option>
          </Select>
        </div>

        <!-- 2. Unit / Room Number -->
        <div>
          <label class="block text-xs font-bold text-slate-700 mb-1">รหัส/หมายเลขยูนิต (Number/ID)</label>
          <Input
            v-model="form.roomNumber"
            type="text"
            :placeholder="getPlaceholderByUnitType(form.unitType)"
            required
            class="font-mono"
          />
        </div>

        <!-- 3. Floor -->
        <div>
          <label class="block text-xs font-bold text-slate-700 mb-1">ชั้น (Floor)</label>
          <Input v-model.number="form.floor" type="number" min="0" placeholder="เช่น 1, 2" required />
        </div>

        <!-- 4. Area Sq.M. -->
        <div>
          <label class="block text-xs font-bold text-slate-700 mb-1">ขนาดพื้นที่ (ตร.ม.)</label>
          <Input v-model.number="form.areaSqm" type="number" step="0.1" placeholder="เช่น 24.5" />
        </div>

        <!-- 5. Monthly Price -->
        <div>
          <label class="block text-xs font-bold text-slate-700 mb-1">ราคาเช่ารายเดือน (บาท)</label>
          <Input v-model.number="form.price" type="number" step="100" placeholder="เช่น 4500" required />
        </div>

        <!-- 6. Location Zone -->
        <div>
          <label class="block text-xs font-bold text-slate-700 mb-1">โซนที่ตั้ง (Location Zone)</label>
          <Input v-model="form.locationZone" type="text" placeholder="เช่น ชั้น 1 ริมถนน, ลานจอด A" />
        </div>

        <!-- 7. Billing Model -->
        <div>
          <label class="block text-xs font-bold text-slate-700 mb-1">รูปแบบการคิดเงิน (Billing Model)</label>
          <Select v-model="form.billingModel">
            <option value="fixed">เหมาจ่ายรายเดือนคงที่ (Fixed Rent)</option>
            <option value="revenue_share">ส่วนแบ่งยอดขาย (Revenue Share / GP %)</option>
            <option value="metered_only">คิดตามมิเตอร์จริง (Metered Only)</option>
          </Select>
        </div>

        <!-- 8. Revenue Share % (If selected) -->
        <div v-if="form.billingModel === 'revenue_share'">
          <label class="block text-xs font-bold text-amber-700 mb-1">ส่วนแบ่งยอดขาย (% GP)</label>
          <Input
            v-model.number="form.revSharePercent"
            type="number"
            step="0.5"
            placeholder="เช่น 10%"
            class="bg-amber-50/50 border-amber-300 text-amber-900 font-bold focus-visible:ring-amber-500/20"
          />
        </div>

        <!-- 9. Initial Status -->
        <div>
          <label class="block text-xs font-bold text-slate-700 mb-1">สถานะเริ่มต้น (Status)</label>
          <Select v-model="form.status">
            <option value="available">ว่างพร้อมให้เช่า (Available)</option>
            <option value="occupied">มีผู้เช่า (Occupied)</option>
            <option value="maintenance">ปิดปรับปรุง/ซ่อมแซม (Maintenance)</option>
          </Select>
        </div>

        <!-- 10. Room Owner (Landlord/Investor) -->
        <div>
          <div class="flex items-center justify-between mb-1">
            <label class="block text-xs font-bold text-slate-700 flex items-center gap-1.5">
              <Crown class="w-3.5 h-3.5 text-amber-500" />
              <span>เจ้าของห้อง / นักลงทุน (Room Owner)</span>
            </label>
            <button
              type="button"
              @click="showQuickCreateOwnerModal = true"
              class="text-xs text-cyan-600 hover:text-cyan-800 font-bold hover:underline cursor-pointer flex items-center gap-1"
            >
              <Plus class="w-3 h-3" />
              <span>เพิ่มเจ้าของใหม่</span>
            </button>
          </div>
          <Select v-model="form.ownerId">
            <option :value="null">ไม่มี (หอพัก/โครงการเป็นเจ้าของเอง)</option>
            <option v-for="owner in roomOwners" :key="owner.id" :value="owner.id">
              {{ owner.name }} ({{ owner.phone || owner.email }})
            </option>
          </Select>
        </div>

        <div class="col-span-full flex justify-end gap-2 pt-2">
          <Button type="button" variant="outline" @click="showCreateModal = false">
            ยกเลิก
          </Button>
          <Button
            type="submit"
            :disabled="roomStore.isLoading"
            class="bg-emerald-600 hover:bg-emerald-600/90 shadow-emerald-600/20"
          >
            {{ roomStore.isLoading ? 'กำลังบันทึก...' : 'บันทึกยูนิต/พื้นที่เช่า' }}
          </Button>
        </div>
      </form>
    </Card>

    <Card v-if="roomStore.isLoading && !showCreateModal" class="p-12 text-center text-slate-500">
      <div class="animate-spin w-8 h-8 border-4 border-cyan-600 border-t-transparent rounded-full mx-auto mb-3"></div>
      กำลังโหลดข้อมูลพื้นที่เช่า...
    </Card>

    <div v-else-if="roomStore.errorMessage" class="p-4 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs font-medium">
      {{ roomStore.errorMessage }}
    </div>

    <!-- Empty State -->
    <Card v-else-if="filteredRooms.length === 0" class="p-12 text-center text-slate-500 space-y-3">
      <div class="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center mx-auto text-slate-400">
        <Building2 class="w-6 h-6" />
      </div>
      <div class="font-bold text-slate-800 text-base">ไม่พบข้อมูลพื้นที่เช่าตามตัวกรอง</div>
      <p class="text-xs text-slate-400">คุณสามารถเพิ่มยูนิตใหม่ หรือเปลี่ยนแท็บตัวกรองด้านบนได้</p>
    </Card>

    <!-- Room / Rental Unit Cards Grid -->
    <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
      <div v-for="room in filteredRooms" :key="room.id" class="space-y-2">
        <RoomOverviewCard :room="room" />

        <!-- History & Actions Buttons -->
        <div v-if="room.status === 'available'" class="space-y-1.5">
          <div class="grid grid-cols-2 gap-2">
            <!-- 1. ทางเลือกผ่าน LINE -->
            <Button
              variant="outline"
              class="w-full text-emerald-800 border-emerald-200 bg-emerald-50 hover:bg-emerald-100"
              title="สร้าง Invite Code / QR ให้ลูกบ้านลงทะเบียนผ่าน LINE"
              @click="openInviteModal(room)"
            >
              <Key class="w-3.5 h-3.5 text-emerald-600" />
              <span>Invite Code (LINE)</span>
            </Button>

            <!-- 2. ทางเลือกไม่ผ่าน LINE (Walk-in) -->
            <Button
              class="w-full"
              title="แอดมินกรอกข้อมูลและทำสัญญาเข้าพักทันที"
              @click="openCheckinModal(room)"
            >
              <UserPlus class="w-3.5 h-3.5" />
              <span>เช็คอิน (Walk-in)</span>
            </Button>
          </div>

          <!-- 3. ดูประวัติสัญญา -->
          <Button variant="outline" class="w-full" @click="openHistoryModal(room)">
            <History class="w-3.5 h-3.5 text-slate-400" />
            <span>ประวัติสัญญาเช่า</span>
          </Button>
        </div>

        <!-- Occupied / Maintenance Room Actions -->
        <div v-else class="grid grid-cols-1 gap-2">
          <Button variant="outline" class="w-full text-cyan-700 border-cyan-200 hover:bg-cyan-50" @click="openHistoryModal(room)">
            <History class="w-3.5 h-3.5" />
            <span>ดูประวัติสัญญาเช่า</span>
          </Button>
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

    <!-- Quick Create Room Owner Modal -->
    <Dialog :open="showQuickCreateOwnerModal" @update:open="showQuickCreateOwnerModal = $event">
      <DialogContent class="max-w-md">
        <DialogHeader>
          <DialogTitle class="flex items-center gap-2">
            <Crown class="w-4 h-4 text-amber-500" />
            <span>เพิ่มรายชื่อเจ้าของห้อง / นักลงทุน (New Room Owner)</span>
          </DialogTitle>
        </DialogHeader>

        <form @submit.prevent="handleQuickCreateOwner" class="space-y-3 text-xs">
          <div>
            <label class="block font-bold text-slate-700 mb-1">ชื่อ-นามสกุล *</label>
            <Input v-model="quickOwnerForm.name" type="text" required placeholder="เช่น คุณสมชาย ลงทุนดี" />
          </div>

          <div>
            <label class="block font-bold text-slate-700 mb-1">อีเมล (สำหรับเข้าสู่ระบบ) *</label>
            <Input v-model="quickOwnerForm.email" type="email" required placeholder="owner@example.com" class="font-mono" />
          </div>

          <div>
            <label class="block font-bold text-slate-700 mb-1">เบอร์โทรศัพท์ (ไม่บังคับ)</label>
            <Input v-model="quickOwnerForm.phone" type="tel" placeholder="081-xxx-xxxx" class="font-mono" />
          </div>

          <div>
            <label class="block font-bold text-slate-700 mb-1">รหัสผ่านเริ่มต้น *</label>
            <Input
              v-model="quickOwnerForm.password"
              type="password"
              required
              minlength="6"
              placeholder="•••••••• (อย่างน้อย 6 ตัวอักษร)"
              class="font-mono"
            />
          </div>

          <div class="p-2.5 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900 font-medium flex items-start gap-1.5">
            <Info class="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <span>บัญชีนี้จะมีระดับสิทธิ์ <strong>ROOM_OWNER</strong> สามารถเข้าดูและจัดการได้เฉพาะห้องที่ผูกไว้เท่านั้น</span>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" @click="showQuickCreateOwnerModal = false">
              ยกเลิก
            </Button>
            <Button type="submit" :disabled="creatingOwner">
              <UserPlus class="w-3.5 h-3.5" />
              <span>{{ creatingOwner ? 'กำลังสร้าง...' : 'บันทึกเจ้าของห้อง' }}</span>
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  </div>
</template>

<script setup>
import { reactive, ref, computed, onMounted, watch } from 'vue';
import { useRoomStore } from '@/stores/useRoomStore';
import { useBuildingStore } from '@/stores/useBuildingStore';
import { useAuthStore } from '@/stores/auth';
import { showSuccess, showError } from '@/utils/swal';
import api from '@/utils/api';
import RoomOverviewCard from '@/components/RoomOverviewCard.vue';
import RoomInviteModal from '@/components/RoomInviteModal.vue';
import RoomImportModal from '@/components/RoomImportModal.vue';
import RoomTenancyHistoryModal from '@/components/RoomTenancyHistoryModal.vue';
import ManualTenantCheckinModal from '@/components/ManualTenantCheckinModal.vue';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import {
  Upload,
  Plus,
  RefreshCw,
  Store,
  Building2,
  History,
  Key,
  UserPlus,
  Globe,
  DoorOpen,
  Coffee,
  Car,
  Box,
  Radio,
  Crown,
  Info
} from 'lucide-vue-next';

const roomStore = useRoomStore();
const buildingStore = useBuildingStore();
const authStore = useAuthStore();

const isRoomOwnerRole = computed(() => {
  const role = (authStore.currentUser?.role || authStore.user?.role || '').toLowerCase();
  return ['room_owner', 'investor'].includes(role);
});

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
const roomOwners = ref([]);

// Category Unit Type Filters
const activeTypeFilter = ref('all');
const unitTypeOptions = [
  { label: 'ทั้งหมด', value: 'all', icon: Globe },
  { label: 'ห้องพักอาศัย', value: 'residential', icon: DoorOpen },
  { label: 'ร้านค้า/หน้าร้าน', value: 'commercial_shop', icon: Store },
  { label: 'ตู้บริการ/เต่าบิน', value: 'vending_spot', icon: Coffee },
  { label: 'ที่จอดรถ', value: 'parking', icon: Car },
  { label: 'ห้องเก็บของ', value: 'storage', icon: Box },
  { label: 'ดาดฟ้า/ป้าย', value: 'billboard_rooftop', icon: Radio }
];

// Status Sub-Filters
const activeStatusFilter = ref('all');
const statusFilterOptions = [
  { label: 'ทั้งหมด (All)', value: 'all' },
  { label: 'ว่าง (Available)', value: 'available' },
  { label: 'มีผู้เช่า (Occupied)', value: 'occupied' },
  { label: 'ซ่อมบำรุง (Maintenance)', value: 'maintenance' }
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
  ownerId: null,
  buildingId: buildingStore.activeBuildingId || ''
});

const showQuickCreateOwnerModal = ref(false);
const creatingOwner = ref(false);
const quickOwnerForm = reactive({
  name: '',
  email: '',
  phone: '',
  password: ''
});

const handleQuickCreateOwner = async () => {
  if (!quickOwnerForm.name || !quickOwnerForm.email || !quickOwnerForm.password) return;
  creatingOwner.value = true;
  try {
    const res = await api.post('/api/admin/users', {
      name: quickOwnerForm.name,
      email: quickOwnerForm.email,
      phone: quickOwnerForm.phone || undefined,
      password: quickOwnerForm.password,
      role: 'ROOM_OWNER',
      buildingIds: []
    });
    await showSuccess('สำเร็จ!', 'สร้างบัญชีเจ้าของห้องเรียบร้อยแล้ว');
    const newOwner = res.data.data;
    await fetchRoomOwners();
    form.ownerId = newOwner?.id || null;
    showQuickCreateOwnerModal.value = false;
    quickOwnerForm.name = '';
    quickOwnerForm.email = '';
    quickOwnerForm.phone = '';
    quickOwnerForm.password = '';
  } catch (err) {
    showError('เกิดข้อผิดพลาด', err.response?.data?.message || 'ไม่สามารถสร้างเจ้าของห้องได้');
  } finally {
    creatingOwner.value = false;
  }
};

const fetchRoomOwners = async () => {
  try {
    const res = await api.get('/api/admin/room-owners');
    roomOwners.value = res.data?.data || [];
  } catch (err) {
    console.warn('Failed to fetch room owners:', err.message);
  }
};

onMounted(() => {
  buildingStore.fetchBuildings();
  roomStore.fetchRooms(buildingStore.activeBuildingId);
  fetchRoomOwners();
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
