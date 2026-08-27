<template>
  <div class="space-y-6">
    <!-- Top Action Bar & Information Header -->
    <div class="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 class="text-xl font-bold text-slate-900 flex items-center gap-2">
            <span>⚡</span>
            <span>ตารางจดมิเตอร์ประจำเดือน (Fast Meter Data Entry)</span>
          </h2>
          <p class="text-xs sm:text-sm text-slate-500 mt-1">
            คีย์ตัวเลขมิเตอร์น้ำ-ไฟของห้องที่มีผู้เช่า (รองรับการกด <kbd class="px-1.5 py-0.5 bg-slate-100 border border-slate-300 rounded-md font-mono text-xs text-slate-700">Enter</kbd> หรือ <kbd class="px-1.5 py-0.5 bg-slate-100 border border-slate-300 rounded-md font-mono text-xs text-slate-700">Tab</kbd> เพื่อย้าย Focus)
          </p>
        </div>

        <!-- Billing Cycle Picker & Quick Info -->
        <div class="flex items-center gap-3">
          <div class="flex items-center gap-1.5 bg-slate-50 border border-slate-200 px-3 py-1 rounded-xl">
            <span class="text-xs font-semibold text-slate-500">รอบบิล:</span>
            <CycleDatePicker v-model="selectedCycle" @change="fetchDraftData" />
          </div>

          <button
            @click="fetchDraftData"
            :disabled="loading"
            class="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition-all border border-slate-200 flex items-center gap-1.5"
          >
            <span>🔄</span>
            <span>ดึงข้อมูลล่าสุด</span>
          </button>
        </div>
      </div>

      <!-- Rate Cards Summary -->
      <div class="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 border-t border-slate-100">
        <div class="p-3 bg-cyan-50/70 border border-cyan-100 rounded-xl">
          <div class="text-[11px] font-bold text-cyan-700 uppercase">อัตราค่าน้ำประปา</div>
          <div class="text-sm font-extrabold text-cyan-900 mt-0.5">฿{{ rates.waterRate }} / หน่วย</div>
        </div>
        <div class="p-3 bg-amber-50/70 border border-amber-100 rounded-xl">
          <div class="text-[11px] font-bold text-amber-700 uppercase">อัตราค่าไฟฟ้า</div>
          <div class="text-sm font-extrabold text-amber-900 mt-0.5">฿{{ rates.electricRate }} / หน่วย</div>
        </div>
        <div class="p-3 bg-purple-50/70 border border-purple-100 rounded-xl">
          <div class="text-[11px] font-bold text-purple-700 uppercase">ค่าส่วนกลางประจำเดือน</div>
          <div class="text-sm font-extrabold text-purple-900 mt-0.5">฿{{ rates.commonFee }} / ห้อง</div>
        </div>
        <div class="p-3 bg-indigo-50/70 border border-indigo-100 rounded-xl">
          <div class="text-[11px] font-bold text-indigo-700 uppercase">ห้องที่มีผู้เช่า (Occupied)</div>
          <div class="text-sm font-extrabold text-indigo-900 mt-0.5">{{ rows.length }} ห้องพัก</div>
        </div>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="p-12 text-center text-slate-500 bg-white rounded-2xl border border-slate-200 shadow-xs">
      <div class="animate-spin w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full mx-auto mb-3"></div>
      กำลังโหลดรายชื่อห้องและมิเตอร์ย้อนหลัง...
    </div>

    <!-- Empty State -->
    <div v-else-if="rows.length === 0" class="p-12 text-center text-slate-400 bg-white rounded-2xl border border-slate-200 shadow-xs space-y-2">
      <div class="text-3xl">🚪</div>
      <p class="font-semibold text-slate-700">ไม่พบห้องพักที่มีผู้เช่า (Occupied) ในตึกนี้</p>
      <p class="text-xs text-slate-500">กรุณาเพิ่มผู้เช่าในหน้าจัดการห้องพักเพื่อเริ่มออกบิลประจำเดือน</p>
    </div>

    <!-- Data Entry Table -->
    <div v-else class="bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden space-y-4">
      <div class="overflow-x-auto">
        <table class="w-full text-left text-xs sm:text-sm text-slate-700">
          <thead class="bg-slate-50 text-[11px] font-bold text-slate-500 uppercase tracking-wider border-b border-slate-200">
            <tr>
              <th class="p-3.5 w-12 text-center">#</th>
              <th class="p-3.5 min-w-[130px]">ห้อง / ผู้เช่า</th>
              <th class="p-3.5 min-w-[220px] bg-amber-50/40 border-l border-r border-amber-100">
                ⚡ มิเตอร์ไฟ (เก่า ➔ ใหม่ ➔ หน่วย)
              </th>
              <th class="p-3.5 min-w-[220px] bg-cyan-50/40 border-r border-cyan-100">
                💧 มิเตอร์น้ำ (เก่า ➔ ใหม่ ➔ หน่วย)
              </th>
              <th class="p-3.5 min-w-[130px]">ค่าอื่นๆ (บาท)</th>
              <th class="p-3.5 min-w-[120px] text-right">ยอดรวมประมาณ</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100">
            <tr
              v-for="(row, index) in rows"
              :key="row.roomId"
              class="hover:bg-slate-50/80 transition-colors"
              :class="{ 'bg-rose-50/30': row.hasError, 'bg-amber-50/20': row.hasWarning }"
            >
              <!-- Row Index -->
              <td class="p-3.5 text-center font-mono text-xs text-slate-400 font-semibold">{{ index + 1 }}</td>

              <!-- Room & Tenant Info -->
              <td class="p-3.5 space-y-0.5">
                <div class="font-bold text-slate-900 text-sm sm:text-base flex items-center gap-1.5">
                  <span>Room {{ row.roomNumber }}</span>
                </div>
                <div class="text-xs text-slate-500 truncate max-w-[140px]">
                  👤 {{ row.tenant ? `${row.tenant.firstName} ${row.tenant.lastName}` : 'ไม่มีชื่อ' }}
                </div>
              </td>

              <!-- Electric Meter Reading Inputs -->
              <td class="p-3 bg-amber-50/20 border-l border-r border-amber-100/70">
                <div class="space-y-1.5">
                  <div class="flex items-center gap-2">
                    <!-- Prev Electric (Read-only) -->
                    <div class="w-16 text-center py-1 bg-amber-100/60 rounded-lg text-xs font-mono font-bold text-amber-900">
                      {{ row.previousElectricReading }}
                    </div>
                    <span class="text-slate-400 font-bold">➔</span>
                    <!-- Current Electric Input -->
                    <input
                      v-model.number="row.currentElectricReading"
                      type="number"
                      step="1"
                      placeholder="เลขใหม่"
                      :data-row="index"
                      data-col="electric"
                      @keydown="handleKeyNavigation($event, index, 'electric')"
                      class="w-24 px-2.5 py-1 rounded-lg border text-xs font-mono font-bold transition-all focus:outline-none"
                      :class="[
                        row.electricError
                          ? 'border-rose-500 bg-rose-50 text-rose-900 ring-2 ring-rose-500/20'
                          : row.electricWarning
                          ? 'border-amber-500 bg-amber-50 text-amber-900 ring-2 ring-amber-500/20'
                          : 'border-slate-300 bg-white focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 text-slate-900'
                      ]"
                    />
                    <!-- Units Used -->
                    <div class="text-xs font-mono font-extrabold" :class="row.electricError ? 'text-rose-600' : 'text-amber-800'">
                      +{{ getElectricUnits(row) }} u
                    </div>
                  </div>

                  <!-- Electric Validation Badges -->
                  <div v-if="row.electricError" class="text-[10px] font-bold text-rose-600 flex items-center gap-1">
                    <span>⚠️</span> <span>{{ row.electricError }}</span>
                  </div>
                  <div v-else-if="row.electricWarning" class="text-[10px] font-bold text-amber-700 flex items-center gap-1">
                    <span>⚡</span> <span>{{ row.electricWarning }}</span>
                  </div>
                </div>
              </td>

              <!-- Water Meter Reading Inputs -->
              <td class="p-3 bg-cyan-50/20 border-r border-cyan-100/70">
                <div class="space-y-1.5">
                  <div class="flex items-center gap-2">
                    <!-- Prev Water (Read-only) -->
                    <div class="w-16 text-center py-1 bg-cyan-100/60 rounded-lg text-xs font-mono font-bold text-cyan-900">
                      {{ row.previousWaterReading }}
                    </div>
                    <span class="text-slate-400 font-bold">➔</span>
                    <!-- Current Water Input -->
                    <input
                      v-model.number="row.currentWaterReading"
                      type="number"
                      step="1"
                      placeholder="เลขใหม่"
                      :data-row="index"
                      data-col="water"
                      @keydown="handleKeyNavigation($event, index, 'water')"
                      class="w-24 px-2.5 py-1 rounded-lg border text-xs font-mono font-bold transition-all focus:outline-none"
                      :class="[
                        row.waterError
                          ? 'border-rose-500 bg-rose-50 text-rose-900 ring-2 ring-rose-500/20'
                          : row.waterWarning
                          ? 'border-amber-500 bg-amber-50 text-amber-900 ring-2 ring-amber-500/20'
                          : 'border-slate-300 bg-white focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 text-slate-900'
                      ]"
                    />
                    <!-- Units Used -->
                    <div class="text-xs font-mono font-extrabold" :class="row.waterError ? 'text-rose-600' : 'text-cyan-800'">
                      +{{ getWaterUnits(row) }} u
                    </div>
                  </div>

                  <!-- Water Validation Badges -->
                  <div v-if="row.waterError" class="text-[10px] font-bold text-rose-600 flex items-center gap-1">
                    <span>⚠️</span> <span>{{ row.waterError }}</span>
                  </div>
                  <div v-else-if="row.waterWarning" class="text-[10px] font-bold text-amber-700 flex items-center gap-1">
                    <span>💧</span> <span>{{ row.waterWarning }}</span>
                  </div>
                </div>
              </td>

              <!-- Other Fee Input -->
              <td class="p-3.5 space-y-1">
                <input
                  v-model.number="row.otherFee"
                  type="number"
                  placeholder="0"
                  class="w-20 px-2 py-1 border border-slate-300 rounded-lg text-xs font-mono font-semibold focus:outline-none focus:border-indigo-500"
                />
                <input
                  v-model="row.otherFeeNote"
                  type="text"
                  placeholder="หมายเหตุ (เช่น ค่าจอดรถ)"
                  class="w-28 px-2 py-0.5 border border-slate-200 rounded-md text-[10px] text-slate-600 focus:outline-none"
                />
              </td>

              <!-- Grand Total Estimate -->
              <td class="p-3.5 text-right font-mono font-bold text-indigo-900 text-sm sm:text-base">
                ฿{{ calculateGrandTotal(row).toLocaleString() }}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Footer Action Toolbar -->
      <div class="p-4 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div class="text-xs text-slate-600 flex items-center gap-4">
          <span class="flex items-center gap-1 font-semibold text-rose-600" v-if="totalErrors > 0">
            <span>🔴</span> <span>มีข้อผิดพลาด {{ totalErrors }} จุด (โปรดแก้ไขก่อนบันทึก)</span>
          </span>
          <span class="flex items-center gap-1 font-semibold text-amber-600" v-if="totalWarnings > 0">
            <span>🟠</span> <span>หน่วยการใช้งานสูง {{ totalWarnings }} ห้อง</span>
          </span>
          <span v-if="totalErrors === 0" class="text-emerald-600 font-semibold flex items-center gap-1">
            <span>✅</span> <span>ข้อมูลครบถ้วนพร้อมออกบิล</span>
          </span>
        </div>

        <button
          @click="handleGenerateInvoices"
          :disabled="submitting || totalErrors > 0"
          class="w-full sm:w-auto px-6 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white rounded-xl text-xs sm:text-sm font-bold shadow-md shadow-purple-600/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          <span>🚀</span>
          <span>{{ submitting ? 'กำลังออกบิล Draft (Transaction)...' : 'คำนวณ & ออกบิลแบบ Draft' }}</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, watch, nextTick } from 'vue';
import CycleDatePicker from '@/components/common/CycleDatePicker.vue';
import { useBuildingStore } from '@/stores/useBuildingStore';
import api from '@/utils/api';
import { showSuccess, showError, showWarning, showConfirm } from '@/utils/swal';

const props = defineProps({
  onSuccess: {
    type: Function,
    default: null
  }
});

const buildingStore = useBuildingStore();
const loading = ref(false);
const submitting = ref(false);
const selectedCycle = ref(`${String(new Date().getMonth() + 1).padStart(2, '0')}-${new Date().getFullYear()}`);

const rates = reactive({
  waterRate: 18.0,
  electricRate: 7.0,
  commonFee: 100.0,
  dueDateDay: 5
});

const rows = ref([]);

onMounted(() => {
  fetchDraftData();
});

watch(
  () => buildingStore.activeBuildingId,
  () => {
    fetchDraftData();
  }
);

/**
 * ดึงข้อมูลมิเตอร์ร่าง (GET /api/admin/buildings/:buildingId/meters/draft)
 */
const fetchDraftData = async () => {
  if (!buildingStore.activeBuildingId) return;

  loading.value = true;
  try {
    const res = await api.get(`/api/admin/buildings/${buildingStore.activeBuildingId}/meters/draft`, {
      params: { billingCycle: selectedCycle.value }
    });

    if (res.data.success) {
      const data = res.data.data;
      rates.waterRate = Number(data.rates.waterRate);
      rates.electricRate = Number(data.rates.electricRate);
      rates.commonFee = Number(data.rates.commonFee);
      rates.dueDateDay = data.rates.dueDateDay;

      rows.value = (data.rooms || []).map((r) => ({
        roomId: r.roomId,
        roomNumber: r.roomNumber,
        floor: r.floor,
        roomPrice: Number(r.roomPrice),
        tenant: r.tenant,
        previousWaterReading: Number(r.previousWaterReading),
        previousElectricReading: Number(r.previousElectricReading),
        currentWaterReading: Number(r.previousWaterReading), // Default = เลขเดิม
        currentElectricReading: Number(r.previousElectricReading), // Default = เลขเดิม
        otherFee: 0,
        otherFeeNote: ''
      }));
    }
  } catch (error) {
    console.error('Failed to fetch meter draft data:', error);
  } finally {
    loading.value = false;
  }
};

/**
 * คำนวณหน่วยไฟย้อนกลับ Real-time
 */
const getElectricUnits = (row) => {
  const current = Number(row.currentElectricReading) || 0;
  const prev = Number(row.previousElectricReading) || 0;
  return Math.max(0, current - prev);
};

/**
 * คำนวณหน่วยน้ำย้อนกลับ Real-time
 */
const getWaterUnits = (row) => {
  const current = Number(row.currentWaterReading) || 0;
  const prev = Number(row.previousWaterReading) || 0;
  return Math.max(0, current - prev);
};

/**
 * Real-time Validation สำหรับแต่ละแถว
 */
const evaluatedRows = computed(() => {
  return rows.value.map((r) => {
    const electricUnits = getElectricUnits(r);
    const waterUnits = getWaterUnits(r);

    let electricError = '';
    let electricWarning = '';
    if (Number(r.currentElectricReading) < Number(r.previousElectricReading)) {
      electricError = 'เลขมิเตอร์ไฟต้องไม่น้อยกว่าเลขเดิม';
    } else if (electricUnits > 500) {
      electricWarning = `หน่วยไฟสูงผิดปกติ (${electricUnits} หน่วย)`;
    }

    let waterError = '';
    let waterWarning = '';
    if (Number(r.currentWaterReading) < Number(r.previousWaterReading)) {
      waterError = 'เลขมิเตอร์น้ำต้องไม่น้อยกว่าเลขเดิม';
    } else if (waterUnits > 50) {
      waterWarning = `หน่วยน้ำสูงผิดปกติ (${waterUnits} หน่วย)`;
    }

    r.electricError = electricError;
    r.electricWarning = electricWarning;
    r.waterError = waterError;
    r.waterWarning = waterWarning;

    r.hasError = Boolean(electricError || waterError);
    r.hasWarning = Boolean(electricWarning || waterWarning);

    return r;
  });
});

const totalErrors = computed(() => {
  return evaluatedRows.value.filter((r) => r.hasError).length;
});

const totalWarnings = computed(() => {
  return evaluatedRows.value.filter((r) => r.hasWarning).length;
});

/**
 * คำนวณ ยอดรวมประมาณการ (Grand Total) ประจำแถว
 */
const calculateGrandTotal = (row) => {
  const electricCost = getElectricUnits(row) * rates.electricRate;
  const waterCost = getWaterUnits(row) * rates.waterRate;
  const otherCost = Number(row.otherFee) || 0;
  return Number((row.roomPrice + electricCost + waterCost + rates.commonFee + otherCost).toFixed(2));
};

/**
 * Fast Keyboard Navigation (Enter, Tab, ArrowDown, ArrowUp)
 */
const handleKeyNavigation = (event, rowIndex, colType) => {
  const key = event.key;

  if (['Enter', 'ArrowDown', 'Tab'].includes(key)) {
    if (key === 'Enter' || (key === 'Tab' && !event.shiftKey)) {
      event.preventDefault();
    }

    let targetRow = rowIndex;
    let targetCol = colType;

    if (key === 'Enter' || key === 'ArrowDown') {
      // เลื่อนไปแถวถัดไปในคอลัมน์เดิม
      if (rowIndex < rows.value.length - 1) {
        targetRow = rowIndex + 1;
      }
    } else if (key === 'Tab') {
      // หากอยู่ที่ electric สลับไป water หากอยู่ที่ water สลับไป electric แถวถัดไป
      if (colType === 'electric') {
        targetCol = 'water';
      } else {
        if (rowIndex < rows.value.length - 1) {
          targetRow = rowIndex + 1;
          targetCol = 'electric';
        }
      }
    }

    nextTick(() => {
      const targetEl = document.querySelector(`input[data-row="${targetRow}"][data-col="${targetCol}"]`);
      if (targetEl) {
        targetEl.focus();
        targetEl.select();
      }
    });
  } else if (key === 'ArrowUp') {
    if (rowIndex > 0) {
      event.preventDefault();
      const targetRow = rowIndex - 1;
      nextTick(() => {
        const targetEl = document.querySelector(`input[data-row="${targetRow}"][data-col="${colType}"]`);
        if (targetEl) {
          targetEl.focus();
          targetEl.select();
        }
      });
    }
  }
};

/**
 * ส่งออกบิล Draft ผ่าน Prisma Transaction (POST /api/admin/buildings/:buildingId/invoices/generate)
 */
const handleGenerateInvoices = async () => {
  if (totalErrors.value > 0) {
    showWarning('พบข้อมูลมิเตอร์ผิดพลาด', 'กรุณาตรวจสอบและแก้ไขข้อผิดพลาดขอบสีแดงก่อนดำเนินการออกบิล');
    return;
  }

  const confirmed = await showConfirm(
    'คำนวณ & ออกบิลร่าง',
    `ยืนยันการคำนวณและสร้างบิล Draft จำนวน ${rows.value.length} ห้องพักใช่หรือไม่?`
  );

  if (!confirmed) return;

  submitting.value = true;
  try {
    const payload = {
      billingCycle: selectedCycle.value,
      roomReadings: rows.value.map((r) => ({
        roomId: r.roomId,
        currentWaterReading: r.currentWaterReading,
        currentElectricReading: r.currentElectricReading,
        otherFee: r.otherFee,
        otherFeeNote: r.otherFeeNote
      }))
    };

    const res = await api.post(`/api/admin/buildings/${buildingStore.activeBuildingId}/invoices/generate`, payload);

    if (res.data.success) {
      await showSuccess('สำเร็จ!', res.data.message || 'สร้างบิลสถานะ Draft สำเร็จเรียบร้อยแล้ว');
      if (props.onSuccess) {
        props.onSuccess();
      }
    }
  } catch (error) {
    console.error('Failed to generate invoices:', error);
    showError('เกิดข้อผิดพลาด', error.response?.data?.message || 'เกิดข้อผิดพลาดในการออกบิล');
  } finally {
    submitting.value = false;
  }
};
</script>
