<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200 pb-4">
      <div>
        <h1 class="text-xl sm:text-2xl font-black text-slate-900 flex items-center gap-2.5">
          <Briefcase class="w-6 h-6 text-teal-600" />
          <span>รายชื่อช่าง & ผู้รับเหมา (Vendor Directory)</span>
        </h1>
        <p class="text-xs sm:text-sm text-slate-500 mt-1">
          สมุดรวมเบอร์ติดต่อช่างซ่อมบำรุงและผู้รับเหมาประจำอาคาร
        </p>
      </div>

      <button
        @click="openCreateModal"
        class="px-4 py-2.5 bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-700 hover:to-cyan-700 text-white rounded-xl text-xs sm:text-sm font-bold transition-all shadow-md shadow-teal-600/20 flex items-center gap-2 cursor-pointer shrink-0"
      >
        <Plus class="w-4 h-4" />
        <span>เพิ่มช่าง/ผู้รับเหมา</span>
      </button>
    </div>

    <!-- Category Filter Bar -->
    <div class="flex items-center gap-2 overflow-x-auto pb-1">
      <button
        v-for="cat in categories"
        :key="cat"
        @click="selectedCategory = cat"
        class="px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all shrink-0 cursor-pointer"
        :class="selectedCategory === cat ? 'bg-teal-600 text-white shadow-xs font-bold' : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'"
      >
        {{ cat }}
      </button>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      <div v-for="i in 6" :key="i" class="p-5 bg-white rounded-2xl border border-slate-200/80 animate-pulse space-y-3">
        <div class="h-4 w-32 bg-slate-200 rounded"></div>
        <div class="h-3 w-20 bg-slate-100 rounded"></div>
        <div class="h-8 bg-slate-50 rounded-xl"></div>
      </div>
    </div>

    <!-- Vendors Grid -->
    <div v-else-if="filteredVendors.length > 0" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      <div
        v-for="v in filteredVendors"
        :key="v.id"
        class="p-5 bg-white rounded-2xl border border-slate-200/80 hover:border-teal-300 shadow-2xs hover:shadow-md transition-all space-y-3 relative group"
      >
        <div class="flex items-start justify-between gap-3">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center font-bold text-sm shrink-0 border border-teal-100">
              <Wrench class="w-5 h-5" />
            </div>
            <div>
              <h3 class="text-sm font-bold text-slate-900">{{ v.name }}</h3>
              <span class="inline-block px-2 py-0.5 text-[10px] font-bold rounded-md bg-slate-100 text-slate-600 mt-0.5">
                {{ v.category }}
              </span>
            </div>
          </div>

          <div class="flex items-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
            <button
              @click="openEditModal(v)"
              class="p-1.5 hover:bg-slate-100 text-slate-500 hover:text-slate-700 rounded-lg transition-colors cursor-pointer"
              title="แก้ไข"
            >
              <Edit3 class="w-3.5 h-3.5" />
            </button>
            <button
              @click="handleDelete(v)"
              class="p-1.5 hover:bg-rose-50 text-slate-400 hover:text-rose-600 rounded-lg transition-colors cursor-pointer"
              title="ลบ"
            >
              <Trash2 class="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        <!-- Contact Info -->
        <div class="space-y-1.5 text-xs text-slate-600 bg-slate-50/80 p-3 rounded-xl border border-slate-100">
          <div v-if="v.phone" class="flex items-center justify-between">
            <span class="text-slate-400">โทรศัพท์:</span>
            <a :href="`tel:${v.phone}`" class="font-bold text-teal-700 hover:underline flex items-center gap-1">
              <Phone class="w-3 h-3" />
              <span>{{ v.phone }}</span>
            </a>
          </div>
          <div v-if="v.lineId" class="flex items-center justify-between">
            <span class="text-slate-400">LINE ID:</span>
            <span class="font-mono text-slate-800 font-semibold">{{ v.lineId }}</span>
          </div>
          <div v-if="v.note" class="text-[11px] text-slate-500 pt-1 border-t border-slate-200/60 leading-relaxed">
            {{ v.note }}
          </div>
        </div>
      </div>
    </div>

    <!-- Empty State -->
    <div v-else class="p-12 text-center bg-white rounded-2xl border border-dashed border-slate-300 space-y-2">
      <Briefcase class="w-10 h-10 text-slate-300 mx-auto" />
      <h3 class="text-sm font-bold text-slate-700">ยังไม่มีรายชื่อช่าง/ผู้รับเหมา</h3>
      <p class="text-xs text-slate-400">เพิ่มข้อมูลช่างประจำตึกเพื่อความสะดวกในการส่งต่องานซ่อมบำรุง</p>
    </div>

    <!-- Modal Form -->
    <div v-if="showModal" class="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
      <div class="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4 border border-slate-100 relative">
        <button @click="showModal = false" class="absolute top-4 right-4 text-slate-400 hover:text-slate-700 p-1">
          <X class="w-5 h-5" />
        </button>

        <h3 class="text-base font-bold text-slate-900">
          {{ editingId ? 'แก้ไขข้อมูลช่าง' : 'เพิ่มช่าง/ผู้รับเหมาใหม่' }}
        </h3>

        <form @submit.prevent="handleSubmit" class="space-y-3">
          <div class="space-y-1">
            <label class="block text-xs font-semibold text-slate-700">ชื่อช่าง / บริษัท / ร้าน *</label>
            <input
              v-model="form.name"
              type="text"
              required
              placeholder="เช่น ช่างสมหมาย แอร์เซอร์วิส"
              class="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-800 focus:outline-hidden focus:border-teal-500"
            />
          </div>

          <div class="space-y-1">
            <label class="block text-xs font-semibold text-slate-700">หมวดหมู่ความเชี่ยวชาญ *</label>
            <select
              v-model="form.category"
              required
              class="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-800 focus:outline-hidden focus:border-teal-500"
            >
              <option value="ช่างแอร์">ช่างแอร์</option>
              <option value="ช่างไฟ">ช่างไฟ</option>
              <option value="ช่างประปา">ช่างประปา</option>
              <option value="ทำความสะอาด">ทำความสะอาด</option>
              <option value="ช่างประตู/กุญแจ">ช่างประตู/กุญแจ</option>
              <option value="อินเทอร์เน็ต/CCTV">อินเทอร์เน็ต/CCTV</option>
              <option value="อื่นๆ">อื่นๆ</option>
            </select>
          </div>

          <div class="grid grid-cols-2 gap-3">
            <div class="space-y-1">
              <label class="block text-xs font-semibold text-slate-700">เบอร์โทรศัพท์</label>
              <input
                v-model="form.phone"
                type="tel"
                placeholder="08x-xxx-xxxx"
                class="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-800 focus:outline-hidden focus:border-teal-500"
              />
            </div>
            <div class="space-y-1">
              <label class="block text-xs font-semibold text-slate-700">LINE ID</label>
              <input
                v-model="form.lineId"
                type="text"
                placeholder="ไอดีไลน์"
                class="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-800 focus:outline-hidden focus:border-teal-500"
              />
            </div>
          </div>

          <div class="space-y-1">
            <label class="block text-xs font-semibold text-slate-700">หมายเหตุ / ขอบเขตงาน</label>
            <textarea
              v-model="form.note"
              rows="3"
              placeholder="เช่น รับงานเฉพาะช่วงกลางวัน, มีค่าเปิดงาน 300 บาท"
              class="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-800 focus:outline-hidden focus:border-teal-500"
            ></textarea>
          </div>

          <div class="flex items-center justify-end gap-2 pt-2">
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
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, watch } from 'vue';
import { useBuildingStore } from '@/stores/useBuildingStore';
import api from '@/utils/api';
import { showSuccess, showError, showConfirm } from '@/utils/swal';
import {
  Briefcase,
  Plus,
  Wrench,
  Edit3,
  Trash2,
  Phone,
  X
} from 'lucide-vue-next';

const buildingStore = useBuildingStore();

const categories = ['ทั้งหมด', 'ช่างแอร์', 'ช่างไฟ', 'ช่างประปา', 'ทำความสะอาด', 'ช่างประตู/กุญแจ', 'อินเทอร์เน็ต/CCTV', 'อื่นๆ'];
const selectedCategory = ref('ทั้งหมด');

const vendors = ref([]);
const loading = ref(false);
const showModal = ref(false);
const submitting = ref(false);
const editingId = ref(null);

const form = reactive({
  name: '',
  category: 'ช่างแอร์',
  phone: '',
  lineId: '',
  note: ''
});

const filteredVendors = computed(() => {
  if (selectedCategory.value === 'ทั้งหมด') return vendors.value;
  return vendors.value.filter((v) => v.category === selectedCategory.value);
});

const fetchVendors = async () => {
  const buildingId = buildingStore.activeBuildingId;
  if (!buildingId) return;

  loading.value = true;
  try {
    const res = await api.get(`/api/admin/buildings/${buildingId}/vendors`);
    if (res.data?.success) {
      vendors.value = res.data.data || [];
    }
  } catch (err) {
    console.warn('Failed to fetch vendors:', err);
  } finally {
    loading.value = false;
  }
};

const openCreateModal = () => {
  editingId.value = null;
  form.name = '';
  form.category = 'ช่างแอร์';
  form.phone = '';
  form.lineId = '';
  form.note = '';
  showModal.value = true;
};

const openEditModal = (v) => {
  editingId.value = v.id;
  form.name = v.name;
  form.category = v.category;
  form.phone = v.phone || '';
  form.lineId = v.lineId || '';
  form.note = v.note || '';
  showModal.value = true;
};

const handleSubmit = async () => {
  const buildingId = buildingStore.activeBuildingId;
  if (!buildingId) return showError('ข้อผิดพลาด', 'กรุณาเลือกตึกก่อน');

  submitting.value = true;
  try {
    if (editingId.value) {
      await api.put(`/api/admin/vendors/${editingId.value}`, form);
      showSuccess('สำเร็จ', 'อัปเดตข้อมูลช่างเรียบร้อย');
    } else {
      await api.post(`/api/admin/buildings/${buildingId}/vendors`, form);
      showSuccess('สำเร็จ', 'เพิ่มข้อมูลช่างเรียบร้อย');
    }
    showModal.value = false;
    await fetchVendors();
  } catch (err) {
    showError('เกิดข้อผิดพลาด', err.response?.data?.message || 'ไม่สามารถบันทึกได้');
  } finally {
    submitting.value = false;
  }
};

const handleDelete = async (v) => {
  const confirmed = await showConfirm(
    'ยืนยันการลบ',
    `ต้องการลบรายชื่อ "${v.name}" หรือไม่?`,
    'ลบข้อมูล'
  );
  if (!confirmed) return;

  try {
    await api.delete(`/api/admin/vendors/${v.id}`);
    showSuccess('สำเร็จ', 'ลบข้อมูลเรียบร้อย');
    await fetchVendors();
  } catch (err) {
    showError('เกิดข้อผิดพลาด', err.response?.data?.message || 'ไม่สามารถลบได้');
  }
};

watch(() => buildingStore.activeBuildingId, () => {
  fetchVendors();
});

onMounted(() => {
  fetchVendors();
});
</script>
