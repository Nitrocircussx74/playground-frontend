<template>
  <div class="space-y-6 font-sans">
    <!-- Header & Action Controls -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div>
        <h1 class="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
          <div class="w-9 h-9 rounded-xl bg-purple-600 text-white flex items-center justify-center shadow-xs">
            <Wrench class="w-5 h-5" />
          </div>
          <span>ระบบแจ้งซ่อมและติดตามงาน (Maintenance Ticketing)</span>
        </h1>
        <p class="text-sm text-slate-500">จัดการตั๋วงานซ่อม มอบหมายช่าง คำนวณค่าซ่อม และส่งสัญญาณอัปเดต LINE ลูกบ้าน</p>
      </div>

      <div class="flex items-center gap-2.5">
        <button
          @click="showNewModal = true"
          class="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
        >
          <Plus class="w-4 h-4" />
          <span>สร้างใบแจ้งซ่อมใหม่</span>
        </button>
        <button
          @click="fetchData"
          class="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition-all border border-slate-200 flex items-center gap-1.5 cursor-pointer"
        >
          <RefreshCw class="w-3.5 h-3.5 text-slate-500" />
          <span>รีเฟรชข้อมูล</span>
        </button>
      </div>
    </div>

    <!-- Kanban Board Grid (3 Columns) -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-5 items-start">
      <!-- Column 1: Pending (รอดำเนินการ) -->
      <div id="tour-kanban-pending" class="bg-slate-100/80 p-4 rounded-2xl border border-slate-200/80 space-y-3.5 min-h-[500px]">
        <div class="flex items-center justify-between px-1">
          <div class="flex items-center gap-2">
            <Clock class="w-4 h-4 text-amber-500" />
            <h3 class="font-bold text-slate-800 text-sm">รอดำเนินการ (Pending)</h3>
          </div>
          <span class="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-amber-100 text-amber-800 border border-amber-200">
            {{ pendingList.length }}
          </span>
        </div>

        <div class="space-y-3">
          <div
            v-for="item in pendingList"
            :key="item.id"
            @click="openEditModal(item)"
            class="p-4 bg-white rounded-2xl border border-slate-200/90 shadow-2xs hover:shadow-md hover:border-amber-300 transition-all cursor-pointer space-y-3 group"
          >
            <div class="flex items-center justify-between">
              <span class="px-2 py-0.5 rounded-lg text-xs font-bold bg-purple-50 text-purple-700 border border-purple-200/60 font-mono flex items-center gap-1">
                <DoorClosed class="w-3.5 h-3.5" />
                <span>ห้อง {{ item.room?.roomNumber || 'N/A' }}</span>
              </span>
              <span class="text-[11px] text-slate-400 font-mono">
                {{ new Date(item.createdAt).toLocaleDateString('th-TH') }}
              </span>
            </div>

            <div>
              <h4 class="font-bold text-slate-900 text-sm group-hover:text-purple-600 transition-colors flex items-center gap-1.5">
                <Wrench class="w-4 h-4 text-amber-500 shrink-0" />
                <span>{{ item.title }}</span>
              </h4>
              <p class="text-xs text-slate-600 mt-1 line-clamp-2 leading-relaxed">{{ item.description }}</p>
            </div>

            <div v-if="item.imageUrl || item.photoUrl" class="rounded-xl overflow-hidden max-h-32 border border-slate-100">
              <img :src="item.imageUrl || item.photoUrl" class="w-full h-full object-cover" />
            </div>

            <div class="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
              <span class="flex items-center gap-1">
                <UserCheck class="w-3.5 h-3.5 text-slate-400" />
                <span>{{ item.tenant ? `${item.tenant.firstName}` : 'ลูกบ้าน' }}</span>
              </span>
              <button
                @click.stop="handleQuickStatus(item.id, 'in_progress')"
                class="px-2 py-1 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg text-[11px] font-bold transition-all border border-blue-200 flex items-center gap-1"
              >
                <Zap class="w-3 h-3" />
                <span>➔ กำลังซ่อม</span>
              </button>
            </div>
          </div>

          <div v-if="pendingList.length === 0" class="p-8 text-center text-slate-400 text-xs bg-white/60 rounded-2xl border border-dashed border-slate-200">
            ไม่มีรายการรอดำเนินการ 🎉
          </div>
        </div>
      </div>

      <!-- Column 2: In Progress (กำลังดำเนินการซ่อม) -->
      <div id="tour-kanban-inprogress" class="bg-slate-100/80 p-4 rounded-2xl border border-slate-200/80 space-y-3.5 min-h-[500px]">
        <div class="flex items-center justify-between px-1">
          <div class="flex items-center gap-2">
            <Zap class="w-4 h-4 text-blue-500" />
            <h3 class="font-bold text-slate-800 text-sm">กำลังดำเนินการ (In Progress)</h3>
          </div>
          <span class="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-blue-100 text-blue-800 border border-blue-200">
            {{ inProgressList.length }}
          </span>
        </div>

        <div class="space-y-3">
          <div
            v-for="item in inProgressList"
            :key="item.id"
            @click="openEditModal(item)"
            class="p-4 bg-white rounded-2xl border border-slate-200/90 shadow-2xs hover:shadow-md hover:border-blue-300 transition-all cursor-pointer space-y-3 group"
          >
            <div class="flex items-center justify-between">
              <span class="px-2 py-0.5 rounded-lg text-xs font-bold bg-purple-50 text-purple-700 border border-purple-200/60 font-mono flex items-center gap-1">
                <DoorClosed class="w-3.5 h-3.5" />
                <span>ห้อง {{ item.room?.roomNumber || 'N/A' }}</span>
              </span>
              <span class="text-[11px] text-blue-600 font-semibold bg-blue-50 px-2 py-0.5 rounded-full flex items-center gap-1 border border-blue-200">
                <Zap class="w-3 h-3" />
                <span>กำลังซ่อม</span>
              </span>
            </div>

            <div>
              <h4 class="font-bold text-slate-900 text-sm group-hover:text-blue-600 transition-colors flex items-center gap-1.5">
                <Wrench class="w-4 h-4 text-blue-500 shrink-0" />
                <span>{{ item.title }}</span>
              </h4>
              <p class="text-xs text-slate-600 mt-1 line-clamp-2 leading-relaxed">{{ item.description }}</p>
            </div>

            <div v-if="item.technicianName" class="p-2 bg-blue-50/60 rounded-xl border border-blue-100 text-xs text-blue-900 font-medium flex items-center gap-1.5">
              <UserCheck class="w-3.5 h-3.5 text-blue-600" />
              <span>ช่าง: {{ item.technicianName }}</span>
            </div>

            <div class="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
              <span class="flex items-center gap-1">
                <UserCheck class="w-3.5 h-3.5 text-slate-400" />
                <span>{{ item.tenant ? `${item.tenant.firstName}` : 'ลูกบ้าน' }}</span>
              </span>
              <button
                @click.stop="handleQuickStatus(item.id, 'resolved')"
                class="px-2 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-lg text-[11px] font-bold transition-all border border-emerald-200 flex items-center gap-1"
              >
                <CheckCircle2 class="w-3 h-3" />
                <span>➔ ซ่อมเสร็จแล้ว</span>
              </button>
            </div>
          </div>

          <div v-if="inProgressList.length === 0" class="p-8 text-center text-slate-400 text-xs bg-white/60 rounded-2xl border border-dashed border-slate-200">
            ไม่มีรายการกำลังซ่อม
          </div>
        </div>
      </div>

      <!-- Column 3: Resolved (เสร็จสิ้น) -->
      <div id="tour-kanban-resolved" class="bg-slate-100/80 p-4 rounded-2xl border border-slate-200/80 space-y-3.5 min-h-[500px]">
        <div class="flex items-center justify-between px-1">
          <div class="flex items-center gap-2">
            <CheckCircle2 class="w-4 h-4 text-emerald-500" />
            <h3 class="font-bold text-slate-800 text-sm">เสร็จสิ้น (Resolved)</h3>
          </div>
          <span class="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
            {{ resolvedList.length }}
          </span>
        </div>

        <div class="space-y-3">
          <div
            v-for="item in resolvedList"
            :key="item.id"
            @click="openEditModal(item)"
            class="p-4 bg-white/90 rounded-2xl border border-slate-200/80 shadow-2xs hover:shadow-md transition-all cursor-pointer space-y-3 group opacity-90 hover:opacity-100"
          >
            <div class="flex items-center justify-between">
              <span class="px-2 py-0.5 rounded-lg text-xs font-bold bg-slate-100 text-slate-700 font-mono flex items-center gap-1">
                <DoorClosed class="w-3.5 h-3.5 text-slate-500" />
                <span>ห้อง {{ item.room?.roomNumber || 'N/A' }}</span>
              </span>
              <span class="text-[11px] text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200 flex items-center gap-1">
                <CheckCircle2 class="w-3 h-3" />
                <span>เรียบร้อย</span>
              </span>
            </div>

            <div>
              <h4 class="font-bold text-slate-900 text-sm line-through decoration-slate-400 text-slate-600 flex items-center gap-1.5">
                <Wrench class="w-4 h-4 text-emerald-500 shrink-0" />
                <span>{{ item.title }}</span>
              </h4>
              <p class="text-xs text-slate-500 mt-1 line-clamp-1 leading-relaxed">{{ item.description }}</p>
            </div>

            <div class="flex items-center justify-between text-xs pt-1">
              <span v-if="item.technicianName" class="text-slate-500 flex items-center gap-1">
                <UserCheck class="w-3.5 h-3.5 text-slate-400" />
                <span>{{ item.technicianName }}</span>
              </span>
              <span v-if="Number(item.repairCost || 0) > 0" class="font-mono font-bold text-emerald-700 flex items-center gap-1">
                <Coins class="w-3.5 h-3.5" />
                <span>฿{{ Number(item.repairCost).toLocaleString() }}</span>
              </span>
            </div>
          </div>

          <div v-if="resolvedList.length === 0" class="p-8 text-center text-slate-400 text-xs bg-white/60 rounded-2xl border border-dashed border-slate-200">
            ยังไม่มีรายการที่ปิดงานซ่อม
          </div>
        </div>
      </div>
    </div>

    <!-- Modal 1: Edit Maintenance Ticket Modal -->
    <div v-if="selectedTicket" class="fixed inset-0 z-50 bg-slate-950/40 backdrop-blur-xs flex items-center justify-center p-4">
      <div class="bg-white rounded-3xl p-6 max-w-lg w-full shadow-2xl space-y-5 border border-slate-200">
        <div class="flex items-center justify-between border-b border-slate-100 pb-3">
          <div class="flex items-center gap-2">
            <Edit3 class="w-5 h-5 text-purple-600" />
            <div>
              <h3 class="text-base font-bold text-slate-900">จัดการตั๋วงานซ่อม (ห้อง {{ selectedTicket.room?.roomNumber }})</h3>
              <p class="text-xs text-slate-500">อัปเดตสถานะ มอบหมายช่าง และกรอกค่าใช้จ่ายเพิ่มเติม</p>
            </div>
          </div>
          <button @click="selectedTicket = null" class="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center font-bold text-xs cursor-pointer">
            <X class="w-4 h-4" />
          </button>
        </div>

        <form @submit.prevent="handleSaveTicket" class="space-y-4 text-xs text-slate-700">
          <div>
            <label class="block font-bold text-slate-800 mb-1">หัวข้อการแจ้งซ่อม</label>
            <div class="p-3 bg-slate-50 rounded-xl border border-slate-200 font-semibold text-slate-900 flex items-center gap-2">
              <Wrench class="w-4 h-4 text-purple-600" />
              <span>{{ selectedTicket.title }}</span>
            </div>
          </div>

          <div>
            <label class="block font-bold text-slate-800 mb-1">รายละเอียดจากลูกบ้าน</label>
            <div class="p-3 bg-slate-50 rounded-xl border border-slate-200 text-slate-700 leading-relaxed">
              {{ selectedTicket.description }}
            </div>
          </div>

          <div v-if="selectedTicket.imageUrl || selectedTicket.photoUrl">
            <label class="block font-bold text-slate-800 mb-1 flex items-center gap-1">
              <Camera class="w-3.5 h-3.5 text-slate-500" />
              <span>รูปถ่ายประกอบปัญหาสภาพจริง</span>
            </label>
            <a :href="selectedTicket.imageUrl || selectedTicket.photoUrl" target="_blank" class="block max-h-40 rounded-xl overflow-hidden border border-slate-200">
              <img :src="selectedTicket.imageUrl || selectedTicket.photoUrl" class="w-full h-full object-cover hover:scale-105 transition-transform" />
            </a>
          </div>

          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block font-bold text-slate-800 mb-1">สถานะงานซ่อม <span class="text-rose-500">*</span></label>
              <select
                v-model="editForm.status"
                class="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 font-bold text-slate-900 focus:outline-hidden"
              >
                <option value="pending">⏳ รอดำเนินการ (PENDING)</option>
                <option value="in_progress">🔧 กำลังซ่อม (IN_PROGRESS)</option>
                <option value="resolved">✅ ซ่อมเสร็จสิ้น (RESOLVED)</option>
                <option value="cancelled">❌ ยกเลิก (CANCELLED)</option>
              </select>
            </div>

            <div>
              <label class="block font-bold text-slate-800 mb-1">ชื่อช่างผู้รับผิดชอบ</label>
              <input
                v-model="editForm.technicianName"
                type="text"
                placeholder="e.g. ช่างสมชาย (ช่างแอร์)"
                class="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 font-semibold text-slate-900 focus:outline-hidden"
              />
            </div>
          </div>

          <div>
            <label class="block font-bold text-slate-800 mb-1">ค่าซ่อม / ค่าอะไหล่เพิ่มเติม (บาท)</label>
            <input
              v-model.number="editForm.repairCost"
              type="number"
              min="0"
              placeholder="0.00"
              class="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 font-mono font-bold text-slate-900 focus:outline-hidden"
            />
          </div>

          <div>
            <label class="block font-bold text-slate-800 mb-1 flex items-center gap-1">
              <MessageSquare class="w-3.5 h-3.5 text-slate-500" />
              <span>หมายเหตุจากแอดมิน / รายงานสรุป</span>
            </label>
            <textarea
              v-model="editForm.adminNote"
              rows="3"
              placeholder="ข้อความถึงลูกบ้าน (จะส่งผ่าน LINE Flex Message เมื่ออัปเดต)..."
              class="w-full bg-slate-50 border border-slate-300 rounded-xl p-3 text-slate-900 focus:outline-hidden"
            ></textarea>
          </div>

          <div class="flex items-center justify-between pt-2 border-t border-slate-100">
            <button
              type="button"
              @click="handleDeleteTicket(selectedTicket.id)"
              class="px-3 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-xl text-xs font-bold transition-all border border-rose-200 flex items-center gap-1 cursor-pointer"
            >
              <Trash2 class="w-3.5 h-3.5" />
              <span>ลบตั๋วแจ้งซ่อม</span>
            </button>

            <div class="flex gap-2">
              <button
                type="button"
                @click="selectedTicket = null"
                class="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold cursor-pointer"
              >
                ยกเลิก
              </button>
              <button
                type="submit"
                :disabled="saving"
                class="px-5 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-bold shadow-md shadow-purple-600/20 disabled:opacity-50 flex items-center gap-1 cursor-pointer"
              >
                <span>{{ saving ? 'กำลังบันทึก...' : '💾 บันทึก & ส่ง LINE' }}</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>

    <!-- Modal 2: Create New Maintenance Request Modal -->
    <div v-if="showNewModal" class="fixed inset-0 z-50 bg-slate-950/40 backdrop-blur-xs flex items-center justify-center p-4">
      <div class="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4 border border-slate-200">
        <div class="flex items-center justify-between border-b border-slate-100 pb-3">
          <h3 class="text-base font-bold text-slate-900 flex items-center gap-1.5">
            <Plus class="w-5 h-5 text-purple-600" />
            <span>สร้างใบแจ้งซ่อมใหม่ (Admin)</span>
          </h3>
          <button @click="showNewModal = false" class="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center font-bold text-xs cursor-pointer">
            <X class="w-4 h-4" />
          </button>
        </div>

        <form @submit.prevent="handleCreateSubmit" class="space-y-4 text-xs text-slate-700">
          <div>
            <label class="block font-bold text-slate-800 mb-1">เลือกห้องพัก <span class="text-rose-500">*</span></label>
            <select
              v-model="newForm.roomId"
              required
              class="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 font-bold text-slate-900 focus:outline-hidden"
            >
              <option value="" disabled>-- เลือกห้องพัก --</option>
              <option v-for="room in roomStore.rooms" :key="room.id" :value="room.id">
                ห้อง {{ room.roomNumber }}
              </option>
            </select>
          </div>

          <div>
            <label class="block font-bold text-slate-800 mb-1">หัวข้อเรื่องแจ้งซ่อม <span class="text-rose-500">*</span></label>
            <input
              v-model="newForm.title"
              type="text"
              placeholder="e.g. เครื่องปรับอากาศมีเสียงดัง / หลอดไฟห้องน้ำเสีย"
              required
              class="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 font-semibold text-slate-900 focus:outline-hidden"
            />
          </div>

          <div>
            <label class="block font-bold text-slate-800 mb-1">รายละเอียดเพิ่มเติม <span class="text-rose-500">*</span></label>
            <textarea
              v-model="newForm.description"
              rows="3"
              placeholder="รายละเอียดอาการชำรุด..."
              required
              class="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-slate-900 focus:outline-hidden"
            ></textarea>
          </div>

          <div>
            <label class="block font-bold text-slate-800 mb-1">อัปโหลดรูปภาพประกอบ</label>
            <input
              type="file"
              accept="image/*"
              @change="handleFileChange"
              class="block w-full text-xs text-slate-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-purple-50 file:text-purple-700 hover:file:bg-purple-100"
            />
          </div>

          <div class="flex justify-end gap-2 pt-2 border-t border-slate-100">
            <button
              type="button"
              @click="showNewModal = false"
              class="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold cursor-pointer"
            >
              ยกเลิก
            </button>
            <button
              type="submit"
              :disabled="submitting || uploading"
              class="px-5 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-bold shadow-md shadow-purple-600/20 disabled:opacity-50 cursor-pointer"
            >
              {{ submitting ? 'กำลังบันทึก...' : 'สร้างตั๋วแจ้งซ่อม' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, watch } from 'vue';
import {
  Wrench,
  Plus,
  RefreshCw,
  Clock,
  Zap,
  CheckCircle2,
  UserCheck,
  Coins,
  MessageSquare,
  Trash2,
  Edit3,
  Camera,
  DoorClosed,
  X
} from 'lucide-vue-next';
import { useRoomStore } from '@/stores/useRoomStore';
import { useBuildingStore } from '@/stores/useBuildingStore';
import uploadService from '@/services/uploadService';
import maintenanceService from '@/services/maintenanceService';
import { showSuccess, showError, showToast, showConfirm } from '@/utils/swal';

const roomStore = useRoomStore();
const buildingStore = useBuildingStore();
const requests = ref([]);
const uploading = ref(false);
const submitting = ref(false);
const saving = ref(false);
const showNewModal = ref(false);
const selectedTicket = ref(null);

const newForm = reactive({
  roomId: '',
  title: '',
  description: '',
  imageUrl: ''
});

const editForm = reactive({
  status: 'pending',
  technicianName: '',
  repairCost: 0,
  adminNote: ''
});

const pendingList = computed(() => requests.value.filter((r) => r.status === 'pending'));
const inProgressList = computed(() => requests.value.filter((r) => r.status === 'in_progress'));
const resolvedList = computed(() => requests.value.filter((r) => r.status === 'resolved' || r.status === 'completed'));

const fetchData = async () => {
  const bId = buildingStore.activeBuildingId;
  await roomStore.fetchRooms(bId);
  const res = await maintenanceService.getRequests({ ...(bId && { buildingId: bId }) });
  requests.value = res.data || [];
};

import { startTour } from '@/utils/tours';

onMounted(async () => {
  await fetchData();
  setTimeout(() => {
    startTour('maintenance');
  }, 600);
});

watch(
  () => buildingStore.activeBuildingId,
  () => {
    fetchData();
  }
);

const openEditModal = (ticket) => {
  selectedTicket.value = ticket;
  editForm.status = ticket.status;
  editForm.technicianName = ticket.technicianName || '';
  editForm.repairCost = Number(ticket.repairCost || 0);
  editForm.adminNote = ticket.adminNote || '';
};

const handleFileChange = async (event) => {
  const file = event.target.files[0];
  if (!file) return;
  uploading.value = true;
  try {
    const res = await uploadService.uploadFile(file);
    newForm.imageUrl = res.data.url;
    showToast('อัปโหลดรูปภาพเรียบร้อยแล้ว');
  } catch (err) {
    showError('เกิดข้อผิดพลาด', err.response?.data?.message || 'File upload failed');
  } finally {
    uploading.value = false;
  }
};

const handleCreateSubmit = async () => {
  submitting.value = true;
  try {
    await maintenanceService.createRequest({ ...newForm });
    await showSuccess('สำเร็จ!', 'บันทึกตั๋วแจ้งซ่อมเรียบร้อยแล้ว');
    newForm.title = '';
    newForm.description = '';
    newForm.imageUrl = '';
    showNewModal.value = false;
    fetchData();
  } catch (err) {
    showError('เกิดข้อผิดพลาด', err.response?.data?.message || 'Failed to submit request');
  } finally {
    submitting.value = false;
  }
};

const handleSaveTicket = async () => {
  if (!selectedTicket.value) return;
  saving.value = true;
  try {
    await maintenanceService.updateStatus(selectedTicket.value.id, editForm.status, {
      adminNote: editForm.adminNote,
      technicianName: editForm.technicianName,
      repairCost: editForm.repairCost
    });
    showToast('อัปเดตตั๋วแจ้งซ่อมและส่ง LINE อัปเดตลูกบ้านเรียบร้อยแล้ว');
    selectedTicket.value = null;
    fetchData();
  } catch (err) {
    showError('เกิดข้อผิดพลาด', err.response?.data?.message || 'Failed to update ticket');
  } finally {
    saving.value = false;
  }
};

const handleQuickStatus = async (id, status) => {
  try {
    await maintenanceService.updateStatus(id, status);
    showToast(`อัปเดตสถานะเป็น ${status} เรียบร้อยแล้ว`);
    fetchData();
  } catch (err) {
    showError('เกิดข้อผิดพลาด', err.response?.data?.message || 'Failed to update status');
  }
};

const handleDeleteTicket = async (id) => {
  const confirm = await showConfirm('ยืนยันการลบ', 'คุณต้องการลบตั๋วแจ้งซ่อมนี้ใช่หรือไม่?');
  if (!confirm.isConfirmed) return;
  try {
    await maintenanceService.deleteRequest(id);
    showToast('ลบตั๋วแจ้งซ่อมเรียบร้อยแล้ว');
    selectedTicket.value = null;
    fetchData();
  } catch (err) {
    showError('เกิดข้อผิดพลาด', err.response?.data?.message || 'Failed to delete ticket');
  }
};
</script>
