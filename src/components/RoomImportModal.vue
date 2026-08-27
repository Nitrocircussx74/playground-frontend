<template>
  <div v-if="show" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
    <div class="bg-white rounded-2xl border border-slate-200 shadow-2xl w-full max-w-3xl overflow-hidden flex flex-col max-h-[90vh]">
      <!-- Modal Header -->
      <div class="px-6 py-4 bg-gradient-to-r from-indigo-900 to-slate-900 text-white flex items-center justify-between">
        <div class="flex items-center gap-2.5">
          <div class="w-9 h-9 rounded-xl bg-indigo-600/40 flex items-center justify-center text-lg">
            📥
          </div>
          <div>
            <h3 class="font-bold text-base text-white">Import Rooms (นำเข้าห้องพักจำนวนมาก)</h3>
            <p class="text-xs text-indigo-200">นำเข้าด้วยไฟล์ CSV หรือสร้างห้องพักอัตโนมัติตามช่วงชั้น</p>
          </div>
        </div>
        <button @click="close" class="text-slate-400 hover:text-white p-1 rounded-lg transition-colors">
          ✕
        </button>
      </div>

      <!-- Modal Tabs -->
      <div class="flex border-b border-slate-200 bg-slate-50 px-6 pt-3 gap-2">
        <button
          @click="activeTab = 'csv'"
          class="px-4 py-2 text-xs font-bold rounded-t-xl transition-all border-b-2"
          :class="activeTab === 'csv' ? 'bg-white border-indigo-600 text-indigo-600 shadow-2xs' : 'border-transparent text-slate-500 hover:text-slate-900'"
        >
          📄 อัปโหลดไฟล์ CSV
        </button>
        <button
          @click="activeTab = 'generator'"
          class="px-4 py-2 text-xs font-bold rounded-t-xl transition-all border-b-2"
          :class="activeTab === 'generator' ? 'bg-white border-indigo-600 text-indigo-600 shadow-2xs' : 'border-transparent text-slate-500 hover:text-slate-900'"
        >
          ⚡ Quick Batch Generator (สร้างตามช่วงชั้น)
        </button>
      </div>

      <!-- Modal Content Body -->
      <div class="p-6 overflow-y-auto space-y-5 flex-1">
        <!-- Tab 1: CSV Upload -->
        <div v-if="activeTab === 'csv'" class="space-y-4">
          <div class="flex items-center justify-between bg-indigo-50 border border-indigo-100 p-3 rounded-xl">
            <span class="text-xs text-indigo-900 font-medium">
              💡 ต้องการไฟล์ตัวอย่างสำหรับเตรียมข้อมูล?
            </span>
            <button
              @click="downloadTemplate"
              class="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold transition-all shadow-xs"
            >
              📥 ดาวน์โหลด CSV Template
            </button>
          </div>

          <!-- File Dropzone -->
          <div
            @dragover.prevent
            @drop.prevent="handleFileDrop"
            class="border-2 border-dashed border-indigo-200 hover:border-indigo-500 bg-indigo-50/30 hover:bg-indigo-50 rounded-2xl p-6 text-center cursor-pointer transition-all"
            @click="$refs.fileInput.click()"
          >
            <input
              ref="fileInput"
              type="file"
              accept=".csv"
              class="hidden"
              @change="handleFileSelect"
            />
            <div class="text-3xl mb-2">📁</div>
            <div class="text-xs font-bold text-slate-800">คลิกที่นี่ หรือ ลากไฟล์ .CSV มาวาง</div>
            <div class="text-[11px] text-slate-400 mt-1">รองรับ Header: roomNumber, floor, price, status</div>
          </div>
        </div>

        <!-- Tab 2: Quick Generator -->
        <div v-if="activeTab === 'generator'" class="grid grid-cols-1 sm:grid-cols-4 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200">
          <div>
            <label class="block text-xs font-semibold text-slate-700 mb-1">เริ่มต้นที่ชั้น (Start)</label>
            <input
              v-model.number="genForm.startFloor"
              type="number"
              min="1"
              class="w-full bg-white border border-slate-300 rounded-xl px-3 py-1.5 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            />
          </div>
          <div>
            <label class="block text-xs font-semibold text-slate-700 mb-1">ถึงชั้น (End)</label>
            <input
              v-model.number="genForm.endFloor"
              type="number"
              min="1"
              class="w-full bg-white border border-slate-300 rounded-xl px-3 py-1.5 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            />
          </div>
          <div>
            <label class="block text-xs font-semibold text-slate-700 mb-1">จำนวนห้อง/ชั้น</label>
            <input
              v-model.number="genForm.roomsPerFloor"
              type="number"
              min="1"
              class="w-full bg-white border border-slate-300 rounded-xl px-3 py-1.5 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            />
          </div>
          <div>
            <label class="block text-xs font-semibold text-slate-700 mb-1">ราคาค่าเช่า/เดือน</label>
            <input
              v-model.number="genForm.defaultPrice"
              type="number"
              step="100"
              class="w-full bg-white border border-slate-300 rounded-xl px-3 py-1.5 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            />
          </div>

          <div class="col-span-full flex justify-end">
            <button
              @click="generateBatchRooms"
              class="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold shadow-xs transition-all flex items-center gap-1.5"
            >
              <span>⚡ สร้างรายการพรีวิว</span>
            </button>
          </div>
        </div>

        <!-- Preview Table -->
        <div v-if="parsedRooms.length > 0" class="space-y-3">
          <div class="flex items-center justify-between">
            <h4 class="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <span>📋 รายการพรีวิวห้องพักที่จะนำเข้า</span>
              <span class="px-2 py-0.5 bg-indigo-100 text-indigo-700 rounded-full text-[10px]">
                {{ parsedRooms.length }} รายการ
              </span>
            </h4>

            <button @click="parsedRooms = []" class="text-xs text-rose-600 hover:underline">
              ล้างรายการทั้งหมด
            </button>
          </div>

          <div class="max-h-60 overflow-y-auto border border-slate-200 rounded-xl">
            <table class="w-full text-left text-xs">
              <thead class="bg-slate-100 text-slate-700 uppercase sticky top-0 font-bold border-b border-slate-200">
                <tr>
                  <th class="px-3 py-2">เลขห้อง (Room No.)</th>
                  <th class="px-3 py-2">ชั้น (Floor)</th>
                  <th class="px-3 py-2">ราคา/เดือน (Price)</th>
                  <th class="px-3 py-2">สถานะ (Status)</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-100">
                <tr v-for="(r, idx) in parsedRooms" :key="idx" class="hover:bg-slate-50">
                  <td class="px-3 py-1.5 font-bold text-slate-900">{{ r.roomNumber }}</td>
                  <td class="px-3 py-1.5 text-slate-600">ชั้น {{ r.floor }}</td>
                  <td class="px-3 py-1.5 font-mono text-emerald-700">฿{{ r.price?.toLocaleString() }}</td>
                  <td class="px-3 py-1.5">
                    <span class="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-100 text-emerald-700">
                      {{ r.status || 'available' }}
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <!-- Modal Footer -->
      <div class="px-6 py-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between shrink-0">
        <button @click="close" class="px-4 py-2 border border-slate-300 text-slate-700 hover:bg-slate-100 rounded-xl text-xs font-semibold">
          ยกเลิก
        </button>

        <button
          @click="submitImport"
          :disabled="parsedRooms.length === 0 || submitting"
          class="px-6 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold shadow-md shadow-emerald-600/20 disabled:opacity-50 transition-all flex items-center gap-1.5"
        >
          <span>{{ submitting ? 'กำลังนำเข้า...' : '🚀 กดยืนยันนำเข้าข้อมูล' }}</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue';
import { useRoomStore } from '@/stores/useRoomStore';
import { useBuildingStore } from '@/stores/useBuildingStore';
import { showSuccess, showError } from '@/utils/swal';

const props = defineProps({
  show: Boolean
});

const emit = defineEmits(['close']);

const roomStore = useRoomStore();
const buildingStore = useBuildingStore();

const activeTab = ref('csv');
const submitting = ref(false);
const fileInput = ref(null);
const parsedRooms = ref([]);

const genForm = reactive({
  startFloor: 1,
  endFloor: 4,
  roomsPerFloor: 10,
  defaultPrice: 4500
});

const close = () => {
  parsedRooms.value = [];
  emit('close');
};

const downloadTemplate = () => {
  const csvContent = 'data:text/csv;charset=utf-8,roomNumber,floor,price,status\n101,1,4500,available\n102,1,4500,available\n201,2,5000,available\n202,2,5000,available\n';
  const encodedUri = encodeURI(csvContent);
  const link = document.createElement('a');
  link.setAttribute('href', encodedUri);
  link.setAttribute('download', 'rooms_import_template.csv');
  document.body.appendChild(link);
  link.click();
  link.remove();
};

const handleFileSelect = (e) => {
  const file = e.target.files[0];
  if (file) parseCsvFile(file);
};

const handleFileDrop = (e) => {
  const file = e.dataTransfer.files[0];
  if (file) parseCsvFile(file);
};

const parseCsvFile = (file) => {
  const reader = new FileReader();
  reader.onload = (evt) => {
    const text = evt.target.result;
    const lines = text.split(/\r\n|\n/);
    const rooms = [];

    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;
      const parts = line.split(',');
      if (parts.length >= 3) {
        rooms.push({
          roomNumber: parts[0]?.trim(),
          floor: Number(parts[1]?.trim()) || 1,
          price: Number(parts[2]?.trim()) || 4000,
          status: parts[3]?.trim() || 'available'
        });
      }
    }

    parsedRooms.value = rooms;
  };
  reader.readAsText(file);
};

const generateBatchRooms = () => {
  const rooms = [];
  for (let f = genForm.startFloor; f <= genForm.endFloor; f++) {
    for (let r = 1; r <= genForm.roomsPerFloor; r++) {
      const roomNum = `${f}${String(r).padStart(2, '0')}`;
      rooms.push({
        roomNumber: roomNum,
        floor: f,
        price: genForm.defaultPrice,
        status: 'available'
      });
    }
  }
  parsedRooms.value = rooms;
};

const submitImport = async () => {
  if (parsedRooms.value.length === 0) return;

  submitting.value = true;
  try {
    const res = await roomStore.importRooms({
      buildingId: buildingStore.activeBuildingId,
      rooms: parsedRooms.value
    });

    const data = res.data;
    await showSuccess(
      'นำเข้าสำเร็จ!',
      `นำเข้าห้องใหม่สำเร็จ ${data.createdCount} ห้อง (ข้ามห้องซ้ำ ${data.skippedCount} ห้อง)`
    );

    close();
  } catch (error) {
    showError('เกิดข้อผิดพลาด', error.response?.data?.message || 'Failed to import rooms');
  } finally {
    submitting.value = false;
  }
};
</script>
