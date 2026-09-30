<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
      <div>
        <h1 class="text-lg font-bold text-slate-900 tracking-tight flex items-center gap-2">
          <Package class="w-5 h-5 text-orange-600" />
          <span>จัดการพัสดุ</span>
        </h1>
        <p class="text-xs text-slate-500 mt-0.5">บันทึกรับพัสดุ ถ่ายรูปหน้ากล่อง แจ้งเตือนลูกบ้านทาง LINE อัตโนมัติ</p>
      </div>

      <Button class="bg-orange-600 hover:bg-orange-700 shrink-0" @click="openCreateModal">
        <Plus class="w-4 h-4" />
        <span>บันทึกพัสดุเข้าใหม่</span>
      </Button>
    </div>

    <!-- KPI Stats Bar -->
    <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
      <Card class="p-4 flex items-center gap-3">
        <div class="w-10 h-10 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center font-bold">
          <Package class="w-5 h-5" />
        </div>
        <div>
          <div class="text-xs font-bold text-slate-400 uppercase tracking-wider">พัสดุทั้งหมดในระบบ</div>
          <div class="text-xl font-black text-slate-900 font-mono">{{ parcels.length }} รายการ</div>
        </div>
      </Card>

      <Card class="p-4 flex items-center gap-3">
        <div class="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
          <Clock class="w-5 h-5" />
        </div>
        <div>
          <div class="text-xs font-bold text-slate-400 uppercase tracking-wider">รอรับที่นิติฯ (Pending)</div>
          <div class="text-xl font-black text-amber-600 font-mono">{{ pendingCount }} รายการ</div>
        </div>
      </Card>

      <Card class="p-4 flex items-center gap-3">
        <div class="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
          <CheckCircle2 class="w-5 h-5" />
        </div>
        <div>
          <div class="text-xs font-bold text-slate-400 uppercase tracking-wider">รับไปแล้ว (Picked Up)</div>
          <div class="text-xl font-black text-emerald-600 font-mono">{{ pickedUpCount }} รายการ</div>
        </div>
      </Card>
    </div>

    <!-- Filter & Data Table -->
    <Card class="p-0 overflow-hidden">
      <div class="p-4 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <Tabs v-model="filterStatus">
          <TabsList>
            <TabsTrigger value="ALL" active-class="bg-white text-orange-700 shadow-sm shadow-orange-600/10 font-bold">
              ทั้งหมด ({{ parcels.length }})
            </TabsTrigger>
            <TabsTrigger value="PENDING" active-class="bg-white text-orange-700 shadow-sm shadow-orange-600/10 font-bold">
              <Clock class="w-3.5 h-3.5" />
              <span>รอรับ ({{ pendingCount }})</span>
            </TabsTrigger>
            <TabsTrigger value="PICKED_UP" active-class="bg-white text-orange-700 shadow-sm shadow-orange-600/10 font-bold">
              <CheckCircle2 class="w-3.5 h-3.5" />
              <span>รับแล้ว ({{ pickedUpCount }})</span>
            </TabsTrigger>
          </TabsList>
        </Tabs>

        <Button variant="link" size="sm" class="h-auto p-0 text-orange-600" @click="fetchParcels">
          <RotateCw class="w-3.5 h-3.5" />
          <span>รีเฟรชรายการ</span>
        </Button>
      </div>

      <div class="overflow-x-auto">
        <table class="w-full text-left text-sm text-slate-700">
          <thead class="bg-slate-50 text-xs text-slate-500 uppercase tracking-wider border-b border-slate-200 font-bold">
            <tr>
              <th class="p-3.5">รูปหน้ากล่อง</th>
              <th class="p-3.5">ห้อง / ผู้เช่า</th>
              <th class="p-3.5">ขนส่ง</th>
              <th class="p-3.5">เวลา</th>
              <th class="p-3.5">สถานะ</th>
              <th class="p-3.5 text-right">จัดการ</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100">
            <tr v-for="item in filteredParcels" :key="item.id" class="hover:bg-slate-50/60 transition-colors align-top">
              <td class="p-3.5">
                <a v-if="item.photoUrl" :href="item.photoUrl" target="_blank">
                  <img :src="item.photoUrl" class="w-20 h-20 rounded-xl object-cover border border-slate-200 shadow-2xs hover:scale-105 transition-transform" />
                </a>
                <div v-else class="w-20 h-20 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-400 text-xs font-bold text-center px-1">
                  ไม่มีรูป
                </div>
              </td>
              <td class="p-3.5">
                <div class="font-bold text-slate-900">
                  ห้อง {{ item.room?.roomNumber }} {{ item.room?.building?.name || item.building?.name ? `(${item.room?.building?.name || item.building?.name})` : '' }}
                </div>
                <div class="text-xs text-slate-600 font-medium mt-0.5">
                  {{ item.tenant ? `${item.tenant.firstName} ${item.tenant.lastName}` : (item.room?.tenant ? `${item.room.tenant.firstName} ${item.room.tenant.lastName}` : 'N/A') }}
                </div>
              </td>
              <td class="p-3.5">
                <div class="font-bold text-orange-700 text-xs flex items-center gap-1">
                  <Truck class="w-3.5 h-3.5 text-orange-600" />
                  <span>{{ item.courier }}</span>
                </div>
                <div class="font-mono text-xs text-teal-700 font-semibold mt-0.5">{{ item.trackingNumber || '-' }}</div>
              </td>
              <td class="p-3.5 text-xs text-slate-500">
                <div>รับเข้า: <span class="font-mono">{{ formatDateTime(item.receivedAt) }}</span></div>
                <div v-if="item.pickedUpAt" class="mt-0.5">รับออก: <span class="font-mono">{{ formatDateTime(item.pickedUpAt) }}</span></div>
              </td>
              <td class="p-3.5">
                <Badge :variant="item.status === 'PENDING' ? 'warning' : 'success'">
                  <component :is="item.status === 'PENDING' ? Clock : CheckCircle2" class="w-3 h-3" />
                  <span>{{ item.status === 'PENDING' ? 'รอรับที่นิติฯ' : 'รับแล้ว' }}</span>
                </Badge>
              </td>
              <td class="p-3.5 text-right space-x-1.5">
                <!-- Mark as Picked Up Button -->
                <Button
                  v-if="item.status === 'PENDING'"
                  size="sm"
                  class="bg-emerald-600 hover:bg-emerald-600/90"
                  @click="handleMarkPickedUp(item.id, item.room?.roomNumber)"
                >
                  <CheckCircle2 class="w-3.5 h-3.5" />
                  <span>จ่ายพัสดุแล้ว</span>
                </Button>

                <!-- Delete Button -->
                <Button variant="outline" size="sm" class="text-rose-700 border-rose-200 hover:bg-rose-50" @click="handleDeleteParcel(item.id)">
                  <Trash2 class="w-3.5 h-3.5" />
                  <span>ลบ</span>
                </Button>
              </td>
            </tr>

            <tr v-if="filteredParcels.length === 0">
              <td colspan="6" class="p-8 text-center text-slate-400 text-xs">
                ไม่มีรายการพัสดุในหมวดหมู่นี้
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </Card>

    <!-- Receive Parcel Modal -->
    <Dialog :open="showModal" @update:open="showModal = $event">
      <DialogContent class="max-w-md p-0 overflow-hidden">
        <div class="px-6 py-4 bg-gradient-to-r from-orange-600 to-amber-600 text-white">
          <DialogHeader class="pr-6">
            <DialogTitle class="text-white flex items-center gap-2">
              <Package class="w-5 h-5 text-amber-200" />
              <span>บันทึกรับพัสดุเข้าใหม่ (Receive Parcel)</span>
            </DialogTitle>
          </DialogHeader>
        </div>

        <form @submit.prevent="handleCreateParcel" class="p-6 space-y-4">
          <!-- Room Selector -->
          <div>
            <label class="block text-xs font-bold text-slate-700 mb-1">เลือกห้องพัก (Select Room)</label>
            <Select v-model="form.roomId" required class="font-bold">
              <option value="" disabled>-- เลือกห้องพัก --</option>
              <option v-for="r in roomStore.rooms" :key="r.id" :value="r.id">
                ห้อง {{ r.roomNumber }} {{ r.building?.name ? `(${r.building.name})` : '' }} (ชั้น {{ r.floor }}) - {{ r.tenant ? `${r.tenant.firstName} ${r.tenant.lastName}` : 'ห้องว่าง' }}
              </option>
            </Select>
          </div>

          <!-- Courier Selector -->
          <div>
            <label class="block text-xs font-bold text-slate-700 mb-1">บริษัทขนส่ง (Courier)</label>
            <Select v-model="form.courier" required class="font-bold">
              <option value="Shopee Express">Shopee Express</option>
              <option value="Lazada Logistics">Lazada Logistics</option>
              <option value="Kerry Express">Kerry Express</option>
              <option value="Flash Express">Flash Express</option>
              <option value="J&T Express">J&T Express</option>
              <option value="ไปรษณีย์ไทย (Thailand Post)">ไปรษณีย์ไทย (EMS/ลงทะเบียน)</option>
              <option value="อื่นๆ (Other)">อื่นๆ</option>
            </Select>
          </div>

          <!-- Tracking Number -->
          <div>
            <label class="block text-xs font-bold text-slate-700 mb-1">หมายเลขพัสดุ / Tracking Number (Optional)</label>
            <Input v-model="form.trackingNumber" type="text" placeholder="เช่น TH0192837465 หรือ SHP99887766" class="font-mono" />
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
              <img :src="form.photoUrl" class="h-24 rounded-xl object-cover border border-slate-200 shadow-xs" />
              <button
                type="button"
                @click="form.photoUrl = ''"
                class="absolute -top-2 -right-2 bg-rose-600 text-white rounded-full w-5 h-5 text-xs flex items-center justify-center font-bold cursor-pointer"
              >
                <X class="w-3 h-3" />
              </button>
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" @click="showModal = false">ยกเลิก</Button>
            <Button type="submit" class="bg-orange-600 hover:bg-orange-600/90" :disabled="submitting || uploading">
              <CheckCircle2 class="w-4 h-4" />
              <span>{{ submitting ? 'กำลังบันทึก...' : 'บันทึกพัสดุ' }}</span>
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, watch } from 'vue';
import { useRoomStore } from '@/stores/useRoomStore';
import { useBuildingStore } from '@/stores/useBuildingStore';
import uploadService from '@/services/uploadService';
import { showSuccess, showError, showConfirm } from '@/utils/swal';
import { formatDateTime } from '@/utils/formatters';
import api from '@/utils/api';
import {
  Package,
  Plus,
  Clock,
  CheckCircle2,
  RotateCw,
  Truck,
  Trash2,
  X
} from 'lucide-vue-next';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';

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

const loadData = () => {
  const bId = buildingStore.activeBuildingId || buildingStore.buildings[0]?.id;
  if (!bId) return;
  fetchParcels();
  roomStore.fetchRooms({ buildingId: bId });
};

onMounted(loadData);
watch(() => buildingStore.activeBuildingId, loadData);

const fetchParcels = async () => {
  try {
    const bId = buildingStore.activeBuildingId || buildingStore.buildings[0]?.id;
    const res = await api.get(`/api/v1/buildings/${bId}/parcels`);
    parcels.value = res.data.data;
  } catch (err) {
    console.error('Fetch parcels failed', err);
  }
};

const openCreateModal = () => {
  form.roomId = '';
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
    const res = await uploadService.uploadFile(file, 'parcels');
    form.photoUrl = res.url;
  } catch (err) {
    showError('อัปโหลดล้มเหลว', 'ไม่สามารถอัปโหลดรูปภาพพัสดุได้');
  } finally {
    uploading.value = false;
  }
};

const handleCreateParcel = async () => {
  if (!form.roomId) {
    showError('ข้อผิดพลาด', 'กรุณาเลือกห้องพัก');
    return;
  }
  submitting.value = true;
  try {
    const bId = buildingStore.activeBuildingId || buildingStore.buildings[0]?.id;
    await api.post(`/api/v1/buildings/${bId}/parcels`, form);
    showSuccess('สำเร็จ', 'บันทึกรับพัสดุและส่งแจ้งเตือน LINE เรียบร้อยแล้ว');
    showModal.value = false;
    fetchParcels();
  } catch (err) {
    showError('ข้อผิดพลาด', err.response?.data?.message || 'ไม่สามารถบันทึกพัสดุได้');
  } finally {
    submitting.value = false;
  }
};

const handleMarkPickedUp = async (parcelId, roomNum) => {
  const isConfirm = await showConfirm(
    'ยืนยันการจ่ายพัสดุ?',
    `ต้องการบันทึกว่าลูกบ้านห้อง ${roomNum} มารับพัสดุชิ้นนี้แล้วใช่หรือไม่?`
  );
  if (!isConfirm) return;

  try {
    await api.patch(`/api/v1/parcels/${parcelId}/pickup`);
    showSuccess('สำเร็จ', 'อัปเดตสถานะเป็นรับพัสดุแล้ว');
    fetchParcels();
  } catch (err) {
    showError('ข้อผิดพลาด', 'ไม่สามารถอัปเดตสถานะได้');
  }
};

const handleDeleteParcel = async (parcelId) => {
  const isConfirm = await showConfirm(
    'ยืนยันการลบพัสดุ?',
    'ประวัติพัสดุชิ้นนี้จะถูกลบออกจากระบบอย่างถาวร'
  );
  if (!isConfirm) return;

  try {
    await api.delete(`/api/v1/parcels/${parcelId}`);
    showSuccess('สำเร็จ', 'ลบรายการพัสดุเรียบร้อยแล้ว');
    fetchParcels();
  } catch (err) {
    showError('ข้อผิดพลาด', 'ไม่สามารถลบรายการได้');
  }
};

</script>
