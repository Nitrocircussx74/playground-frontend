<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200 pb-4">
      <div>
        <h1 class="text-xl sm:text-2xl font-black text-slate-900 flex items-center gap-2.5">
          <ClipboardCheck class="w-6 h-6 text-teal-600" />
          <span>ตรวจสภาพห้องพัก (Room Inspection Checklist)</span>
        </h1>
        <p class="text-xs sm:text-sm text-slate-500 mt-1">
          บันทึกและตรวจสอบสภาพห้องก่อนส่งมอบ (Move-in) และก่อนย้ายออก (Move-out)
        </p>
      </div>

      <button
        @click="openCreateModal"
        class="px-4 py-2.5 bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-700 hover:to-cyan-700 text-white rounded-xl text-xs sm:text-sm font-bold transition-all shadow-md shadow-teal-600/20 flex items-center gap-2 cursor-pointer shrink-0"
      >
        <Plus class="w-4 h-4" />
        <span>บันทึกการตรวจสภาพห้อง</span>
      </button>
    </div>

    <!-- Filter Bar -->
    <div class="flex items-center gap-2 overflow-x-auto pb-1">
      <button
        v-for="t in ['ALL', 'MOVE_IN', 'MOVE_OUT']"
        :key="t"
        @click="selectedType = t"
        class="px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all shrink-0 cursor-pointer"
        :class="selectedType === t ? 'bg-teal-600 text-white shadow-xs font-bold' : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'"
      >
        {{ t === 'ALL' ? 'ทั้งหมด' : (t === 'MOVE_IN' ? 'ก่อนเข้าอยู่ (Move-in)' : 'ก่อนย้ายออก (Move-out)') }}
      </button>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      <div v-for="i in 6" :key="i" class="p-5 bg-white rounded-2xl border border-slate-200/80 animate-pulse space-y-3">
        <div class="h-4 w-32 bg-slate-200 rounded"></div>
        <div class="h-3 w-20 bg-slate-100 rounded"></div>
        <div class="h-12 bg-slate-50 rounded-xl"></div>
      </div>
    </div>

    <!-- Inspections Grid -->
    <div v-else-if="filteredInspections.length > 0" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      <div
        v-for="item in filteredInspections"
        :key="item.id"
        class="p-5 bg-white rounded-2xl border border-slate-200/80 hover:border-teal-300 shadow-2xs hover:shadow-md transition-all space-y-3 relative group"
      >
        <div class="flex items-start justify-between gap-3">
          <div class="flex items-center gap-3">
            <div
              class="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm shrink-0"
              :class="item.type === 'MOVE_IN' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-amber-50 text-amber-700 border border-amber-200'"
            >
              <ClipboardCheck class="w-5 h-5" />
            </div>
            <div>
              <div class="flex items-center gap-2">
                <h3 class="text-sm font-bold text-slate-900">ห้อง {{ item.lease?.room?.roomNumber || '-' }}</h3>
                <span
                  class="px-2 py-0.5 text-[10px] font-bold rounded-md"
                  :class="item.type === 'MOVE_IN' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'"
                >
                  {{ item.type === 'MOVE_IN' ? 'Move-in' : 'Move-out' }}
                </span>
              </div>
              <div class="text-[11px] text-slate-500 mt-0.5">
                ผู้เช่า: {{ item.lease?.tenant?.firstName }} {{ item.lease?.tenant?.lastName }}
              </div>
            </div>
          </div>

          <div class="flex items-center gap-1">
            <button
              @click="openDetailModal(item)"
              class="p-1.5 hover:bg-slate-100 text-slate-500 hover:text-slate-700 rounded-lg transition-colors cursor-pointer"
              title="ดูรายละเอียด"
            >
              <Eye class="w-3.5 h-3.5" />
            </button>
            <button
              @click="handleDelete(item)"
              class="p-1.5 hover:bg-rose-50 text-slate-400 hover:text-rose-600 rounded-lg transition-colors cursor-pointer"
              title="ลบ"
            >
              <Trash2 class="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        <!-- Items Summary Checklist -->
        <div class="space-y-1 bg-slate-50 p-3 rounded-xl border border-slate-100 text-xs">
          <div class="flex items-center justify-between text-[11px] text-slate-400 font-mono pb-1 border-b border-slate-200/60">
            <span>วันที่บันทึก: {{ formatDate(item.createdAt) }}</span>
            <span>{{ (item.items || []).length }} รายการ</span>
          </div>

          <div class="space-y-1 pt-1">
            <div
              v-for="(it, idx) in (item.items || []).slice(0, 3)"
              :key="idx"
              class="flex items-center justify-between text-[11px]"
            >
              <span class="text-slate-700 truncate">{{ it.label }}</span>
              <span
                class="px-1.5 py-0.2 rounded-md font-bold text-[10px]"
                :class="getConditionBadge(it.condition)"
              >
                {{ it.condition === 'GOOD' ? 'สมบูรณ์' : (it.condition === 'FAIR' ? 'พอใช้' : 'ชำรุด') }}
              </span>
            </div>
            <div v-if="(item.items || []).length > 3" class="text-[10px] text-slate-400 text-right pt-0.5">
              + อีก {{ (item.items || []).length - 3 }} รายการ
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Empty State -->
    <div v-else class="p-12 text-center bg-white rounded-2xl border border-dashed border-slate-300 space-y-2">
      <ClipboardCheck class="w-10 h-10 text-slate-300 mx-auto" />
      <h3 class="text-sm font-bold text-slate-700">ยังไม่มีบันทึกการตรวจสภาพห้อง</h3>
      <p class="text-xs text-slate-400">สร้าง Checklist ตรวจสภาพห้องพักเพื่อใช้เป็นหลักฐานและป้องกันข้อพิพาทเรื่องเงินมัดจำ</p>
    </div>

    <!-- Create Modal -->
    <div v-if="showModal" class="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
      <div class="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4 border border-slate-100 relative max-h-[90vh] overflow-y-auto">
        <button @click="showModal = false" class="absolute top-4 right-4 text-slate-400 hover:text-slate-700 p-1">
          <X class="w-5 h-5" />
        </button>

        <h3 class="text-base font-bold text-slate-900">บันทึกการตรวจสภาพห้องพัก</h3>

        <form @submit.prevent="handleSubmit" class="space-y-4">
          <div class="grid grid-cols-2 gap-3">
            <div class="space-y-1">
              <label class="block text-xs font-semibold text-slate-700">เลือกสัญญาเช่า/ห้อง *</label>
              <select
                v-model="form.leaseId"
                required
                class="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-800 focus:outline-hidden focus:border-teal-500"
              >
                <option value="" disabled>-- เลือกห้องพัก --</option>
                <option v-for="l in leases" :key="l.id" :value="l.id">
                  ห้อง {{ l.room?.roomNumber }} - {{ l.tenant?.firstName }} {{ l.tenant?.lastName }}
                </option>
              </select>
            </div>

            <div class="space-y-1">
              <label class="block text-xs font-semibold text-slate-700">ประเภทการตรวจ *</label>
              <select
                v-model="form.type"
                required
                class="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-800 focus:outline-hidden focus:border-teal-500"
              >
                <option value="MOVE_IN">ก่อนเข้าอยู่ (Move-in)</option>
                <option value="MOVE_OUT">ก่อนย้ายออก (Move-out)</option>
              </select>
            </div>
          </div>

          <!-- Checklist Items -->
          <div class="space-y-2">
            <div class="flex items-center justify-between">
              <label class="block text-xs font-bold text-slate-700">รายการตรวจสภาพ (Checklist)</label>
              <button
                type="button"
                @click="addChecklistItem"
                class="text-xs font-semibold text-teal-600 hover:text-teal-700 flex items-center gap-1 cursor-pointer"
              >
                <Plus class="w-3.5 h-3.5" />
                <span>เพิ่มรายการ</span>
              </button>
            </div>

            <div class="space-y-2 max-h-56 overflow-y-auto pr-1">
              <div
                v-for="(it, idx) in form.items"
                :key="idx"
                class="p-2.5 bg-slate-50 rounded-xl border border-slate-200/80 space-y-2"
              >
                <div class="flex items-center gap-2">
                  <input
                    v-model="it.label"
                    type="text"
                    required
                    placeholder="หัวข้อตรวจ (เช่น กุญแจห้อง, แอร์, ผนัง)"
                    class="flex-1 bg-white border border-slate-200 rounded-lg px-2.5 py-1 text-xs text-slate-800 focus:outline-hidden focus:border-teal-500"
                  />
                  <select
                    v-model="it.condition"
                    class="w-28 bg-white border border-slate-200 rounded-lg px-2 py-1 text-xs text-slate-800 focus:outline-hidden focus:border-teal-500"
                  >
                    <option value="GOOD">สมบูรณ์</option>
                    <option value="FAIR">พอใช้</option>
                    <option value="DAMAGED">ชำรุด</option>
                  </select>
                  <button
                    type="button"
                    @click="removeChecklistItem(idx)"
                    class="text-slate-400 hover:text-rose-600 p-1"
                  >
                    <Trash2 class="w-3.5 h-3.5" />
                  </button>
                </div>
                <input
                  v-model="it.note"
                  type="text"
                  placeholder="หมายเหตุเพิ่มเติม (ถ้ามี)"
                  class="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1 text-[11px] text-slate-600 focus:outline-hidden focus:border-teal-500"
                />
              </div>
            </div>
          </div>

          <div class="space-y-1">
            <label class="block text-xs font-semibold text-slate-700">บันทึกข้อสังเกตของเจ้าหน้าที่</label>
            <textarea
              v-model="form.adminNote"
              rows="2"
              placeholder="เช่น ตรวจสอบพร้อมผู้เช่า รับทราบสภาพห้องเรียบร้อย"
              class="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-800 focus:outline-hidden focus:border-teal-500"
            ></textarea>
          </div>

          <div class="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
            <button
              type="button"
              @click="showModal = false"
              class="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
            >
              ยกเลิก
            </button>
            <button
              type="submit"
              :disabled="submitting"
              class="px-5 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              <span>{{ submitting ? 'กำลังบันทึก...' : 'บันทึก' }}</span>
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Detail View Modal -->
    <div v-if="selectedDetail" class="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
      <div class="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4 border border-slate-100 relative max-h-[90vh] overflow-y-auto">
        <button @click="selectedDetail = null" class="absolute top-4 right-4 text-slate-400 hover:text-slate-700 p-1">
          <X class="w-5 h-5" />
        </button>

        <div class="space-y-1">
          <div class="flex items-center gap-2">
            <h3 class="text-base font-bold text-slate-900">
              รายละเอียดการตรวจสภาพห้อง {{ selectedDetail.lease?.room?.roomNumber }}
            </h3>
            <span
              class="px-2 py-0.5 text-[10px] font-bold rounded-md"
              :class="selectedDetail.type === 'MOVE_IN' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'"
            >
              {{ selectedDetail.type === 'MOVE_IN' ? 'Move-in' : 'Move-out' }}
            </span>
          </div>
          <p class="text-xs text-slate-500">
            ผู้เช่า: {{ selectedDetail.lease?.tenant?.firstName }} {{ selectedDetail.lease?.tenant?.lastName }} | วันที่ {{ formatDate(selectedDetail.createdAt) }}
          </p>
        </div>

        <div class="space-y-2 border-t border-slate-100 pt-3">
          <h4 class="text-xs font-bold text-slate-800">รายการ Checklist:</h4>
          <div class="space-y-1.5">
            <div
              v-for="(it, idx) in (selectedDetail.items || [])"
              :key="idx"
              class="p-2.5 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between gap-3 text-xs"
            >
              <div>
                <div class="font-semibold text-slate-800">{{ it.label }}</div>
                <div v-if="it.note" class="text-[11px] text-slate-500 mt-0.5">{{ it.note }}</div>
              </div>
              <span
                class="px-2 py-0.5 rounded-md font-bold text-[10px] shrink-0"
                :class="getConditionBadge(it.condition)"
              >
                {{ it.condition === 'GOOD' ? 'สมบูรณ์' : (it.condition === 'FAIR' ? 'พอใช้' : 'ชำรุด') }}
              </span>
            </div>
          </div>
        </div>

        <div v-if="selectedDetail.adminNote" class="p-3 bg-slate-50 rounded-xl border border-slate-100 text-xs space-y-1">
          <div class="text-[10px] font-bold text-slate-400 uppercase">บันทึกเจ้าหน้าที่</div>
          <div class="text-slate-700 leading-relaxed">{{ selectedDetail.adminNote }}</div>
        </div>

        <div class="flex justify-end pt-2">
          <button
            @click="selectedDetail = null"
            class="px-5 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer"
          >
            ปิด
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, watch } from 'vue';
import { useBuildingStore } from '@/stores/useBuildingStore';
import api from '@/utils/api';
import { showSuccess, showError, showConfirm } from '@/utils/swal';
import { formatDate } from '@/utils/formatters';
import {
  ClipboardCheck,
  Plus,
  Trash2,
  Eye,
  X
} from 'lucide-vue-next';

const buildingStore = useBuildingStore();

const selectedType = ref('ALL');
const inspections = ref([]);
const leases = ref([]);
const loading = ref(false);
const showModal = ref(false);
const submitting = ref(false);
const selectedDetail = ref(null);

const defaultChecklist = [
  { label: 'กุญแจห้อง / คีย์การ์ด', condition: 'GOOD', note: '' },
  { label: 'ประตูและลูกบิด', condition: 'GOOD', note: '' },
  { label: 'เครื่องปรับอากาศ & รีโมท', condition: 'GOOD', note: '' },
  { label: 'ระบบไฟฟ้าและสวิตช์', condition: 'GOOD', note: '' },
  { label: 'สุขภัณฑ์และท่อน้ำในห้องน้ำ', condition: 'GOOD', note: '' },
  { label: 'ผนังและพื้นห้อง', condition: 'GOOD', note: '' },
  { label: 'เตียงและเฟอร์นิเจอร์', condition: 'GOOD', note: '' }
];

const form = reactive({
  leaseId: '',
  type: 'MOVE_IN',
  items: [],
  adminNote: ''
});

const getConditionBadge = (cond) => {
  if (cond === 'GOOD') return 'bg-emerald-100 text-emerald-800';
  if (cond === 'FAIR') return 'bg-amber-100 text-amber-800';
  return 'bg-rose-100 text-rose-800';
};

const filteredInspections = computed(() => {
  if (selectedType.value === 'ALL') return inspections.value;
  return inspections.value.filter((i) => i.type === selectedType.value);
});

const fetchInspections = async () => {
  const buildingId = buildingStore.activeBuildingId;
  if (!buildingId) return;

  loading.value = true;
  try {
    const res = await api.get(`/api/admin/buildings/${buildingId}/inspections`);
    if (res.data?.success) {
      inspections.value = res.data.data || [];
    }
  } catch (err) {
    console.warn('Failed to fetch inspections:', err);
  } finally {
    loading.value = false;
  }
};

const fetchActiveLeases = async () => {
  const buildingId = buildingStore.activeBuildingId;
  if (!buildingId) return;

  try {
    const res = await api.get(`/api/admin/leases?buildingId=${buildingId}`);
    if (res.data?.success) {
      leases.value = res.data.data || [];
    }
  } catch (err) {
    console.warn('Failed to fetch leases:', err);
  }
};

const openCreateModal = () => {
  form.leaseId = '';
  form.type = 'MOVE_IN';
  form.items = JSON.parse(JSON.stringify(defaultChecklist));
  form.adminNote = '';
  showModal.value = true;
};

const addChecklistItem = () => {
  form.items.push({ label: '', condition: 'GOOD', note: '' });
};

const removeChecklistItem = (idx) => {
  form.items.splice(idx, 1);
};

const openDetailModal = (item) => {
  selectedDetail.value = item;
};

const handleSubmit = async () => {
  const buildingId = buildingStore.activeBuildingId;
  if (!buildingId) return showError('ข้อผิดพลาด', 'กรุณาเลือกตึกก่อน');

  submitting.value = true;
  try {
    await api.post('/api/admin/inspections', {
      ...form,
      buildingId
    });
    showSuccess('สำเร็จ', 'บันทึกการตรวจสภาพห้องเรียบร้อย');
    showModal.value = false;
    await fetchInspections();
  } catch (err) {
    showError('เกิดข้อผิดพลาด', err.response?.data?.message || 'ไม่สามารถบันทึกได้');
  } finally {
    submitting.value = false;
  }
};

const handleDelete = async (item) => {
  const confirmed = await showConfirm(
    'ยืนยันการลบ',
    'ต้องการลบรายการตรวจสภาพห้องนี้หรือไม่?',
    'ลบข้อมูล'
  );
  if (!confirmed) return;

  try {
    await api.delete(`/api/admin/inspections/${item.id}`);
    showSuccess('สำเร็จ', 'ลบข้อมูลเรียบร้อย');
    await fetchInspections();
  } catch (err) {
    showError('เกิดข้อผิดพลาด', err.response?.data?.message || 'ไม่สามารถลบได้');
  }
};

watch(() => buildingStore.activeBuildingId, () => {
  fetchInspections();
  fetchActiveLeases();
});

onMounted(() => {
  fetchInspections();
  fetchActiveLeases();
});
</script>
