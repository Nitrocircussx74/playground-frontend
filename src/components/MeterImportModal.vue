<template>
  <div v-if="show" class="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
    <div class="bg-white rounded-3xl border border-slate-200 shadow-2xl w-full max-w-4xl overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-150">
      <!-- Modal Header -->
      <div class="px-6 py-4 bg-gradient-to-r from-cyan-600 via-teal-600 to-slate-900 text-white flex items-center justify-between">
        <div class="flex items-center gap-2">
          <span class="text-xl">📊</span>
          <div>
            <h3 class="font-bold text-base text-white leading-tight">นำเข้าข้อมูลมิเตอร์ผ่านไฟล์ Excel/CSV (Bulk Meter Import)</h3>
            <p class="text-xs text-teal-100/80">ดาวน์โหลด Template, อัปโหลดไฟล์, และตรวจสอบข้อมูลล่วงหน้าก่อนออกบิล</p>
          </div>
        </div>

        <button @click="emit('close')" class="text-teal-100 hover:text-white p-1 rounded-lg cursor-pointer">✕</button>
      </div>

      <div class="p-6 space-y-6">
        <!-- Section 1: Template Download & File Upload Area -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <!-- Step A: Download Template -->
          <div class="bg-teal-50/60 border border-teal-200 p-4 rounded-2xl flex flex-col justify-between space-y-3">
            <div>
              <div class="flex items-center gap-2 text-teal-800 font-bold text-xs uppercase tracking-wider">
                <span>1️⃣ ดาวน์โหลดไฟล์ Template</span>
              </div>
              <p class="text-xs text-slate-600 mt-1">
                ระบบจะสร้างไฟล์ Excel ที่มีรายชื่อห้องที่มีผู้เช่าและเลขมิเตอร์เดิม (`Previous Readings`) ให้พร้อมใช้งาน
              </p>
            </div>

            <button
              @click="handleDownloadTemplate"
              :disabled="downloading"
              class="w-full py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <span>📥 {{ downloading ? 'กำลังสร้างไฟล์...' : 'ดาวน์โหลด Template Excel (.xlsx)' }}</span>
            </button>
          </div>

          <!-- Step B: Upload File Area -->
          <div class="bg-slate-50 border border-slate-200 p-4 rounded-2xl flex flex-col justify-between space-y-3">
            <div>
              <div class="flex items-center gap-2 text-slate-800 font-bold text-xs uppercase tracking-wider">
                <span>2️⃣ อัปโหลดไฟล์ที่กรอกแล้ว</span>
              </div>
              <p class="text-xs text-slate-500 mt-1">
                เลือกหรือลากไฟล์ Excel/CSV (.xlsx, .csv) ที่กรอกตัวเลขใหม่แล้ว เพื่อตรวจสอบข้อมูล
              </p>
            </div>

            <div class="relative">
              <input
                type="file"
                accept=".xlsx, .xls, .csv"
                @change="handleFileUpload"
                class="hidden"
                id="meter-file-input"
              />
              <label
                for="meter-file-input"
                class="w-full py-2.5 border-2 border-dashed border-cyan-500 bg-white hover:bg-cyan-50/50 text-cyan-800 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer text-center"
              >
                <span>📁 {{ uploading ? 'กำลังประมวลผลไฟล์...' : 'คลิกเลือกไฟล์เพื่อนำเข้า (Import File)' }}</span>
              </label>
            </div>
          </div>
        </div>

        <!-- Section 2: Preview Data Table & Live Inline Edit -->
        <div v-if="previewItems.length > 0" class="space-y-3 border-t border-slate-200 pt-5">
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-2">
              <h4 class="font-bold text-sm text-slate-900">ตารางพรีวิวและแก้ไขข้อมูล (Preview & Inline Edit)</h4>
              <span class="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-slate-100 text-slate-700">
                {{ previewItems.length }} แถว
              </span>
            </div>

            <div class="flex items-center gap-3 text-xs">
              <span class="text-emerald-700 font-bold">✅ ถูกต้อง: {{ validCount }}</span>
              <span class="text-rose-600 font-bold" v-if="invalidCount > 0">❌ มีข้อผิดพลาด: {{ invalidCount }}</span>
            </div>
          </div>

          <div class="border border-slate-200 rounded-2xl overflow-hidden max-h-96 overflow-y-auto">
            <table class="w-full text-left text-xs border-collapse">
              <thead class="bg-slate-100 text-slate-700 font-bold uppercase tracking-wider sticky top-0 z-10 border-b border-slate-200">
                <tr>
                  <th class="p-3">#</th>
                  <th class="p-3">ห้องพัก</th>
                  <th class="p-3">ผู้เช่า</th>
                  <th class="p-3 text-center">ค่าน้ำเดิม</th>
                  <th class="p-3 text-center">ค่าน้ำใหม่ (แก้ไขได้)</th>
                  <th class="p-3 text-center">ใช้น้ำ</th>
                  <th class="p-3 text-center">ค่าไฟเดิม</th>
                  <th class="p-3 text-center">ค่าไฟใหม่ (แก้ไขได้)</th>
                  <th class="p-3 text-center">ใช้ไฟ</th>
                  <th class="p-3">สถานะ / Error</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-200 font-medium">
                <tr
                  v-for="item in previewItems"
                  :key="item.rowId"
                  class="transition-colors"
                  :class="item.isValid ? 'hover:bg-slate-50' : 'bg-rose-50/80 border-l-4 border-l-rose-500'"
                >
                  <td class="p-3 font-mono text-slate-400">{{ item.rowId }}</td>
                  <td class="p-3 font-bold text-slate-900">ห้อง {{ item.roomNumber }}</td>
                  <td class="p-3 text-slate-600">{{ item.tenantName }}</td>

                  <!-- Water -->
                  <td class="p-3 text-center font-mono text-slate-500">{{ item.oldWater }}</td>
                  <td class="p-3 text-center">
                    <input
                      type="number"
                      v-model.number="item.newWater"
                      @input="revalidateRow(item)"
                      class="w-20 bg-white border border-slate-300 rounded-lg px-2 py-1 text-center font-mono font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                    />
                  </td>
                  <td class="p-3 text-center font-mono font-bold text-teal-700">
                    {{ calculateUsage(item.newWater, item.oldWater) }}
                  </td>

                  <!-- Electric -->
                  <td class="p-3 text-center font-mono text-slate-500">{{ item.oldElectric }}</td>
                  <td class="p-3 text-center">
                    <input
                      type="number"
                      v-model.number="item.newElectric"
                      @input="revalidateRow(item)"
                      class="w-20 bg-white border border-slate-300 rounded-lg px-2 py-1 text-center font-mono font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                    />
                  </td>
                  <td class="p-3 text-center font-mono font-bold text-amber-700">
                    {{ calculateUsage(item.newElectric, item.oldElectric) }}
                  </td>

                  <!-- Status -->
                  <td class="p-3">
                    <span v-if="item.isValid" class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                      ✅ ถูกต้อง
                    </span>
                    <span v-else class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800 border border-rose-200 flex items-center gap-1">
                      ⚠️ {{ item.errorMessage }}
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- Section 3: Confirmation Action -->
        <div class="pt-4 border-t border-slate-200 flex items-center justify-between">
          <div class="text-xs text-slate-500">
            รอบบิลปัจจุบัน: <span class="font-bold text-slate-800 font-mono">{{ currentBillingCycle }}</span>
          </div>

          <div class="flex items-center gap-3">
            <button
              type="button"
              @click="emit('close')"
              class="px-4 py-2.5 border border-slate-300 text-slate-700 hover:bg-slate-100 rounded-xl text-xs font-bold transition-all cursor-pointer"
            >
              ยกเลิก
            </button>

            <button
              type="button"
              @click="handleGenerateInvoices"
              :disabled="!allValid || generating || previewItems.length === 0"
              class="px-5 py-2.5 bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-700 hover:to-cyan-700 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-teal-600/20 disabled:opacity-50 cursor-pointer flex items-center gap-2"
            >
              <span>⚡ {{ generating ? 'กำลังสร้างบิล...' : 'ยืนยันและสร้างบิลฉบับร่าง (Generate Draft Invoices)' }}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useBuildingStore } from '@/stores/useBuildingStore';
import { showSuccess, showError } from '@/utils/swal';
import api from '@/utils/api';

const props = defineProps({
  show: Boolean,
  billingCycle: String
});

const emit = defineEmits(['close', 'imported']);
const buildingStore = useBuildingStore();

const downloading = ref(false);
const uploading = ref(false);
const generating = ref(false);
const previewItems = ref([]);

const currentBillingCycle = computed(() => props.billingCycle || `${String(new Date().getMonth() + 1).padStart(2, '0')}-${new Date().getFullYear()}`);

const validCount = computed(() => previewItems.value.filter((i) => i.isValid).length);
const invalidCount = computed(() => previewItems.value.filter((i) => !i.isValid).length);
const allValid = computed(() => previewItems.value.length > 0 && previewItems.value.every((i) => i.isValid));

const handleDownloadTemplate = async () => {
  downloading.value = true;
  try {
    const bId = buildingStore.activeBuildingId || buildingStore.buildings[0]?.id;
    const res = await api.get(`/api/admin/buildings/${bId}/meters/template`, {
      responseType: 'blob'
    });

    const url = window.URL.createObjectURL(new Blob([res.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `meter_template.xlsx`);
    document.body.appendChild(link);
    link.click();
    link.remove();

    await showSuccess('ดาวน์โหลดสำเร็จ!', 'ไฟล์ Template Excel ถูกดาวน์โหลดเรียบร้อยแล้ว');
  } catch (err) {
    showError('เกิดข้อผิดพลาด', 'ไม่สามารถดาวน์โหลดไฟล์ Template ได้');
  } finally {
    downloading.value = false;
  }
};

const handleFileUpload = async (event) => {
  const file = event.target.files[0];
  if (!file) return;

  uploading.value = true;
  try {
    const bId = buildingStore.activeBuildingId || buildingStore.buildings[0]?.id;
    const formData = new FormData();
    formData.append('file', file);

    const res = await api.post(`/api/admin/buildings/${bId}/meters/import-preview`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });

    previewItems.value = res.data.data;
    await showSuccess('สำเร็จ!', `ประมวลผลไฟล์เรียบร้อยแล้ว (${previewItems.value.length} แถว)`);
  } catch (err) {
    showError('เกิดข้อผิดพลาด', err.response?.data?.message || 'ไม่สามารถอ่านข้อมูลจากไฟล์ได้');
  } finally {
    uploading.value = false;
    event.target.value = '';
  }
};

const calculateUsage = (newVal, oldVal) => {
  if (newVal === '' || isNaN(newVal)) return 0;
  return Math.max(0, Number(newVal) - Number(oldVal || 0));
};

const revalidateRow = (item) => {
  const newW = Number(item.newWater);
  const newE = Number(item.newElectric);

  if (!item.roomId) {
    item.isValid = false;
    item.errorMessage = 'ไม่พบข้อมูลห้องพัก';
    return;
  }

  if (isNaN(newW) || newW < 0) {
    item.isValid = false;
    item.errorMessage = 'กรุณาระบุเลขมิเตอร์น้ำให้ถูกต้อง';
  } else if (newW < item.oldWater) {
    item.isValid = false;
    item.errorMessage = `เลขมิเตอร์น้ำใหม่ (${newW}) น้อยกว่าเลขเดิม (${item.oldWater})`;
  } else if (isNaN(newE) || newE < 0) {
    item.isValid = false;
    item.errorMessage = 'กรุณาระบุเลขมิเตอร์ไฟให้ถูกต้อง';
  } else if (newE < item.oldElectric) {
    item.isValid = false;
    item.errorMessage = `เลขมิเตอร์ไฟใหม่ (${newE}) น้อยกว่าเลขเดิม (${item.oldElectric})`;
  } else {
    item.isValid = true;
    item.errorMessage = null;
  }

  item.waterUsage = calculateUsage(newW, item.oldWater);
  item.electricUsage = calculateUsage(newE, item.oldElectric);
};

const handleGenerateInvoices = async () => {
  if (!allValid.value) return;

  generating.value = true;
  try {
    const bId = buildingStore.activeBuildingId || buildingStore.buildings[0]?.id;
    const readings = previewItems.value.map((item) => ({
      roomId: item.roomId,
      waterReading: Number(item.newWater),
      electricReading: Number(item.newElectric)
    }));

    const res = await api.post(`/api/v1/buildings/${bId}/invoices/generate`, {
      billingCycle: currentBillingCycle.value,
      readings
    });

    await showSuccess('สร้างบิลสำเร็จ!', res.data.message || 'สร้างบิลฉบับร่างสำเร็จเรียบร้อยแล้ว');
    emit('imported');
    emit('close');
  } catch (err) {
    showError('เกิดข้อผิดพลาด', err.response?.data?.message || 'ไม่สามารถสร้างบิลฉบับร่างได้');
  } finally {
    generating.value = false;
  }
};
</script>
