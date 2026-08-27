<template>
  <div class="space-y-6">
    <!-- Header Toolbar -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div>
        <h1 class="text-2xl font-bold text-slate-900 tracking-tight">Audit Logs & Activity History</h1>
        <p class="text-sm text-slate-500">บันทึกประวัติการเข้าใช้งาน การแก้ไข และการลบข้อมูลโดยผู้ดูแลระบบ (Owner Only)</p>
      </div>

      <button
        @click="fetchLogs"
        class="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition-all border border-slate-200 flex items-center gap-1.5 self-start sm:self-auto"
      >
        <span>🔄 Refresh History</span>
      </button>
    </div>

    <!-- Filters Bar -->
    <div class="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-3">
      <div class="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
        <span>🔍 ตัวกรองค้นหา (Filter Activity Logs)</span>
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <!-- Filter Action -->
        <div>
          <label class="block text-[11px] font-semibold text-slate-500 mb-1">การกระทำ (Action)</label>
          <select
            v-model="filters.action"
            @change="handleFilterChange"
            class="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-1.5 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-purple-500/20"
          >
            <option value="">ทั้งหมด (All Actions)</option>
            <option value="CREATE">➕ CREATE (เพิ่มข้อมูล)</option>
            <option value="UPDATE">✏️ UPDATE (แก้ไขข้อมูล)</option>
            <option value="DELETE">🗑️ DELETE (ลบข้อมูล)</option>
          </select>
        </div>

        <!-- Filter Entity -->
        <div>
          <label class="block text-[11px] font-semibold text-slate-500 mb-1">โมดูล (Module / Entity)</label>
          <select
            v-model="filters.entity"
            @change="handleFilterChange"
            class="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-1.5 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-purple-500/20"
          >
            <option value="">ทั้งหมด (All Modules)</option>
            <option value="INVOICE">📄 ใบแจ้งหนี้ (INVOICE)</option>
            <option value="ROOM">🏢 ห้องพัก (ROOM)</option>
            <option value="TENANT">👤 ผู้เช่า (TENANT)</option>
            <option value="BUILDING_SETTING">⚙️ ตั้งค่าตึก (BUILDING_SETTING)</option>
            <option value="USER">👑 แอดมิน (USER)</option>
            <option value="ANNOUNCEMENT">📢 ประกาศ (ANNOUNCEMENT)</option>
          </select>
        </div>

        <!-- Filter Start Date -->
        <div>
          <label class="block text-[11px] font-semibold text-slate-500 mb-1">ตั้งแต่วันที่ (Start Date)</label>
          <input
            v-model="filters.startDate"
            type="date"
            @change="handleFilterChange"
            class="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-purple-500/20"
          />
        </div>

        <!-- Filter End Date -->
        <div>
          <label class="block text-[11px] font-semibold text-slate-500 mb-1">ถึงวันที่ (End Date)</label>
          <input
            v-model="filters.endDate"
            type="date"
            @change="handleFilterChange"
            class="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-purple-500/20"
          />
        </div>
      </div>
    </div>

    <!-- Error Alert -->
    <div v-if="error" class="p-4 bg-rose-50 border border-rose-200 rounded-2xl text-rose-700 text-xs font-medium flex items-center justify-between">
      <span>⚠️ {{ error }}</span>
      <button @click="error = ''" class="text-rose-500 hover:text-rose-700 font-bold">✕</button>
    </div>

    <!-- Data Table Panel -->
    <div class="bg-white border border-slate-200 rounded-2xl shadow-2xs overflow-hidden">
      <div v-if="loading && logs.length === 0" class="p-12 text-center text-slate-500">
        <div class="animate-spin w-8 h-8 border-4 border-purple-600 border-t-transparent rounded-full mx-auto mb-3"></div>
        กำลังโหลดบันทึกประวัติการใช้งาน...
      </div>

      <div v-else-if="logs.length === 0" class="p-12 text-center text-slate-400">
        <div class="text-3xl mb-2">📜</div>
        <div class="text-sm font-semibold text-slate-600">ไม่พบประวัติการใช้งานตามเงื่อนไข</div>
        <p class="text-xs text-slate-400 mt-1">ลองปรับเปลี่ยนตัวกรองการค้นหาด้านบน</p>
      </div>

      <div v-else class="overflow-x-auto">
        <table class="w-full text-left text-xs">
          <thead class="bg-slate-50 text-slate-700 uppercase font-bold border-b border-slate-200 tracking-wider">
            <tr>
              <th class="px-6 py-3.5">วันเวลา (Timestamp)</th>
              <th class="px-6 py-3.5">ผู้ดำเนินการ (Admin User)</th>
              <th class="px-6 py-3.5">การกระทำ (Action)</th>
              <th class="px-6 py-3.5">โมดูล (Module / Entity)</th>
              <th class="px-6 py-3.5 text-right">รายละเอียด Before / After</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100">
            <tr v-for="log in logs" :key="log.id" class="hover:bg-slate-50/80 transition-colors">
              <!-- Timestamp -->
              <td class="px-6 py-4 font-mono text-[11px] text-slate-600">
                <div>{{ formatDate(log.createdAt) }}</div>
                <div class="text-[10px] text-slate-400">{{ formatTime(log.createdAt) }}</div>
              </td>

              <!-- Admin User -->
              <td class="px-6 py-4">
                <div class="flex items-center gap-2.5">
                  <div class="w-8 h-8 rounded-lg bg-gradient-to-tr from-purple-700 to-indigo-700 text-white font-bold flex items-center justify-center text-xs shrink-0 shadow-2xs">
                    {{ log.admin?.name?.slice(0, 2).toUpperCase() || 'AD' }}
                  </div>
                  <div>
                    <div class="font-bold text-slate-900">{{ log.admin?.name || 'Unknown Admin' }}</div>
                    <div class="text-[10px] text-purple-600 font-semibold">{{ log.admin?.email || 'N/A' }}</div>
                  </div>
                </div>
              </td>

              <!-- Action Badge -->
              <td class="px-6 py-4">
                <span
                  class="px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase border shadow-2xs inline-flex items-center gap-1"
                  :class="getActionBadgeClass(log.action)"
                >
                  <span>{{ getActionIcon(log.action) }}</span>
                  <span>{{ log.action }}</span>
                </span>
              </td>

              <!-- Module / Entity -->
              <td class="px-6 py-4">
                <div class="font-bold text-slate-800">{{ log.entity }}</div>
                <div v-if="log.entityId" class="text-[10px] text-slate-400 font-mono">ID: {{ truncateUuid(log.entityId) }}</div>
              </td>

              <!-- View Details / Diff Modal Trigger -->
              <td class="px-6 py-4 text-right">
                <button
                  v-if="log.oldValues || log.newValues"
                  @click="openDiffModal(log)"
                  class="px-3 py-1.5 bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200 rounded-xl text-xs font-bold transition-all flex items-center gap-1 ml-auto"
                >
                  <span>🔍 ดูรายละเอียด Diff</span>
                </button>
                <span v-else class="text-slate-400 text-[11px] italic">ไม่มีข้อมูล Snapshot</span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Pagination Footer -->
      <div v-if="meta.totalPages > 1" class="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs">
        <div class="text-slate-500">
          แสดงหน้า <span class="font-bold text-slate-900">{{ meta.page }}</span> จาก <span class="font-bold text-slate-900">{{ meta.totalPages }}</span> (รวม {{ meta.total }} รายการ)
        </div>

        <div class="flex items-center gap-2">
          <button
            @click="changePage(meta.page - 1)"
            :disabled="meta.page <= 1"
            class="px-3 py-1.5 bg-white border border-slate-300 rounded-xl font-semibold text-slate-700 hover:bg-slate-100 disabled:opacity-40"
          >
            ← หน้าก่อนหน้า
          </button>
          <button
            @click="changePage(meta.page + 1)"
            :disabled="meta.page >= meta.totalPages"
            class="px-3 py-1.5 bg-white border border-slate-300 rounded-xl font-semibold text-slate-700 hover:bg-slate-100 disabled:opacity-40"
          >
            หน้าถัดไป →
          </button>
        </div>
      </div>
    </div>

    <!-- Before / After JSON Diff Modal -->
    <div v-if="selectedLog" class="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div class="bg-white rounded-3xl border border-slate-200 shadow-2xl w-full max-w-3xl overflow-hidden flex flex-col max-h-[90vh]">
        <!-- Modal Header -->
        <div class="px-6 py-4 bg-gradient-to-r from-purple-900 to-indigo-900 text-white flex items-center justify-between">
          <div class="flex items-center gap-2">
            <span class="text-xl">📊</span>
            <div>
              <h3 class="font-bold text-base text-white">เปรียบเทียบการเปลี่ยนแปลง (Data Diff Inspection)</h3>
              <p class="text-xs text-purple-200">
                โมดูล {{ selectedLog.entity }} | โดย {{ selectedLog.admin?.name }} ({{ formatDate(selectedLog.createdAt) }})
              </p>
            </div>
          </div>
          <button @click="selectedLog = null" class="text-purple-300 hover:text-white p-1 rounded-lg">✕</button>
        </div>

        <!-- Modal Body: Diff View -->
        <div class="p-6 overflow-y-auto space-y-4 flex-1">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <!-- Left: Old Values (Before) -->
            <div class="bg-rose-50/70 border border-rose-200 rounded-2xl p-4 space-y-3">
              <div class="text-xs font-bold text-rose-800 uppercase tracking-wider flex items-center gap-1.5">
                <span>🔴 ค่าเดิมก่อนดำเนินการ (Before / Old Values)</span>
              </div>

              <div v-if="!selectedLog.oldValues" class="text-xs text-rose-600 italic">
                - ไม่มีข้อมูลเดิม (เป็นการสร้างเรคคอร์ดใหม่) -
              </div>

              <div v-else class="space-y-1.5 font-mono text-xs">
                <div
                  v-for="(val, key) in selectedLog.oldValues"
                  :key="key"
                  class="p-2 rounded-lg bg-white/80 border border-rose-100 flex flex-col"
                  :class="isKeyModified(key) ? 'ring-2 ring-amber-400 bg-amber-50/50' : ''"
                >
                  <span class="text-[10px] text-slate-500 font-bold uppercase">{{ key }}:</span>
                  <span class="font-semibold text-slate-800 break-all">{{ formatValue(val) }}</span>
                </div>
              </div>
            </div>

            <!-- Right: New Values (After) -->
            <div class="bg-emerald-50/70 border border-emerald-200 rounded-2xl p-4 space-y-3">
              <div class="text-xs font-bold text-emerald-800 uppercase tracking-wider flex items-center gap-1.5">
                <span>🟢 ค่าใหม่หลังดำเนินการ (After / New Values)</span>
              </div>

              <div v-if="!selectedLog.newValues" class="text-xs text-emerald-600 italic">
                - ไม่มีข้อมูลใหม่ (เป็นการลบเรคคอร์ดออก) -
              </div>

              <div v-else class="space-y-1.5 font-mono text-xs">
                <div
                  v-for="(val, key) in selectedLog.newValues"
                  :key="key"
                  class="p-2 rounded-lg bg-white/80 border border-emerald-100 flex flex-col"
                  :class="isKeyModified(key) ? 'ring-2 ring-amber-400 bg-amber-50/50' : ''"
                >
                  <span class="text-[10px] text-slate-500 font-bold uppercase">{{ key }}:</span>
                  <span class="font-semibold text-slate-800 break-all">{{ formatValue(val) }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Modal Footer -->
        <div class="px-6 py-4 bg-slate-50 border-t border-slate-100 flex justify-end">
          <button
            @click="selectedLog = null"
            class="px-5 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-bold transition-all"
          >
            ปิดหน้าต่าง (Close)
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue';
import auditLogService from '@/services/auditLogService';

const logs = ref([]);
const loading = ref(false);
const error = ref('');
const selectedLog = ref(null);

const meta = reactive({
  total: 0,
  page: 1,
  limit: 20,
  totalPages: 1
});

const filters = reactive({
  action: '',
  entity: '',
  startDate: '',
  endDate: ''
});

onMounted(() => {
  fetchLogs();
});

const fetchLogs = async () => {
  loading.value = true;
  error.value = '';
  try {
    const res = await auditLogService.getAuditLogs({
      page: meta.page,
      limit: meta.limit,
      action: filters.action || undefined,
      entity: filters.entity || undefined,
      startDate: filters.startDate || undefined,
      endDate: filters.endDate || undefined
    });
    logs.value = res.data || [];
    meta.total = res.meta?.total || 0;
    meta.totalPages = res.meta?.totalPages || 1;
  } catch (err) {
    error.value = err.response?.data?.message || 'ไม่สามารถดึงข้อมูล Audit Logs ได้';
  } finally {
    loading.value = false;
  }
};

const handleFilterChange = () => {
  meta.page = 1;
  fetchLogs();
};

const changePage = (newPage) => {
  if (newPage >= 1 && newPage <= meta.totalPages) {
    meta.page = newPage;
    fetchLogs();
  }
};

const openDiffModal = (log) => {
  selectedLog.value = log;
};

const isKeyModified = (key) => {
  if (!selectedLog.value?.oldValues || !selectedLog.value?.newValues) return false;
  const oldV = JSON.stringify(selectedLog.value.oldValues[key]);
  const newV = JSON.stringify(selectedLog.value.newValues[key]);
  return oldV !== newV;
};

const formatValue = (val) => {
  if (val === null || val === undefined) return 'null';
  if (typeof val === 'object') return JSON.stringify(val);
  return String(val);
};

const getActionIcon = (action) => {
  switch ((action || '').toUpperCase()) {
    case 'CREATE': return '➕';
    case 'UPDATE': return '✏️';
    case 'DELETE': return '🗑️';
    default: return '⚡';
  }
};

const getActionBadgeClass = (action) => {
  switch ((action || '').toUpperCase()) {
    case 'CREATE': return 'bg-emerald-100 text-emerald-800 border-emerald-200';
    case 'UPDATE': return 'bg-amber-100 text-amber-800 border-amber-200';
    case 'DELETE': return 'bg-rose-100 text-rose-800 border-rose-200';
    default: return 'bg-slate-100 text-slate-800 border-slate-200';
  }
};

const truncateUuid = (uuid) => {
  if (!uuid) return '';
  return uuid.length > 12 ? `${uuid.slice(0, 8)}...` : uuid;
};

const formatDate = (dateStr) => {
  if (!dateStr) return '';
  return new Date(dateStr).toLocaleDateString('th-TH');
};

const formatTime = (dateStr) => {
  if (!dateStr) return '';
  return new Date(dateStr).toLocaleTimeString('th-TH');
};
</script>
