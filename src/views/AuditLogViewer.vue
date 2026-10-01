<template>
  <div class="space-y-6">
    <!-- Header Toolbar -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div>
        <h1 class="text-2xl font-bold text-slate-900 tracking-tight">Audit Logs & Activity History</h1>
        <p class="text-sm text-slate-500">บันทึกประวัติการเข้าใช้งาน การแก้ไข และการลบข้อมูลโดยผู้ดูแลระบบ (Owner Only)</p>
      </div>

      <Button variant="outline" @click="fetchLogs" class="self-start sm:self-auto">
        <RefreshCw class="w-3.5 h-3.5" :class="{ 'animate-spin': loading }" />
        <span>รีเฟรชประวัติ</span>
      </Button>
    </div>

    <!-- Filters Bar -->
    <Card class="p-4 space-y-3">
      <div class="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
        <Filter class="w-3.5 h-3.5 text-cyan-700" />
        <span>ตัวกรองค้นหา (Filter Activity Logs)</span>
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <!-- Filter Action -->
        <div>
          <label class="block text-xs font-semibold text-slate-500 mb-1">การกระทำ (Action)</label>
          <Select v-model="filters.action" @change="handleFilterChange">
            <option value="">ทั้งหมด (All Actions)</option>
            <option value="CREATE">CREATE (เพิ่มข้อมูล)</option>
            <option value="UPDATE">UPDATE (แก้ไขข้อมูล)</option>
            <option value="DELETE">DELETE (ลบข้อมูล)</option>
          </Select>
        </div>

        <!-- Filter Entity -->
        <div>
          <label class="block text-xs font-semibold text-slate-500 mb-1">โมดูล (Module / Entity)</label>
          <Select v-model="filters.entity" @change="handleFilterChange">
            <option value="">ทั้งหมด (All Modules)</option>
            <option value="INVOICE">ใบแจ้งหนี้ (INVOICE)</option>
            <option value="ROOM">ห้องพัก (ROOM)</option>
            <option value="TENANT">ผู้เช่า (TENANT)</option>
            <option value="BUILDING_SETTING">ตั้งค่าตึก (BUILDING_SETTING)</option>
            <option value="USER">แอดมิน (USER)</option>
            <option value="ANNOUNCEMENT">ประกาศ (ANNOUNCEMENT)</option>
          </Select>
        </div>

        <!-- Filter Start Date -->
        <div>
          <label class="block text-xs font-semibold text-slate-500 mb-1">ตั้งแต่วันที่ (Start Date)</label>
          <Input v-model="filters.startDate" type="date" @change="handleFilterChange" />
        </div>

        <!-- Filter End Date -->
        <div>
          <label class="block text-xs font-semibold text-slate-500 mb-1">ถึงวันที่ (End Date)</label>
          <Input v-model="filters.endDate" type="date" @change="handleFilterChange" />
        </div>
      </div>
    </Card>

    <!-- Error Alert -->
    <div v-if="error" class="p-4 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs font-medium flex items-center justify-between">
      <div class="flex items-center gap-2">
        <AlertCircle class="w-4 h-4 text-rose-600" />
        <span>{{ error }}</span>
      </div>
      <button @click="error = ''" class="text-rose-500 hover:text-rose-700 font-bold cursor-pointer">
        <X class="w-4 h-4" />
      </button>
    </div>

    <!-- Data Table Panel -->
    <Card class="overflow-hidden">
      <div v-if="loading && logs.length === 0" class="p-12 text-center text-slate-500">
        <div class="animate-spin w-8 h-8 border-4 border-cyan-600 border-t-transparent rounded-full mx-auto mb-3"></div>
        กำลังโหลดบันทึกประวัติการใช้งาน...
      </div>

      <div v-else-if="logs.length === 0" class="p-12 text-center text-slate-400">
        <History class="w-10 h-10 text-slate-300 mx-auto mb-2" />
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
              <td class="px-6 py-4 font-mono text-xs text-slate-600">
                <div>{{ formatDate(log.createdAt) }}</div>
                <div class="text-xs text-slate-400">{{ formatDate(log.createdAt, { hour: '2-digit', minute: '2-digit', second: '2-digit' }) }}</div>
              </td>

              <!-- Admin User -->
              <td class="px-6 py-4">
                <div class="flex items-center gap-2.5">
                  <div class="w-8 h-8 rounded-lg bg-gradient-to-tr from-cyan-700 to-teal-700 text-white font-bold flex items-center justify-center text-xs shrink-0 shadow-2xs">
                    {{ log.admin?.name?.slice(0, 2).toUpperCase() || 'AD' }}
                  </div>
                  <div>
                    <div class="font-bold text-slate-900">{{ log.admin?.name || 'Unknown Admin' }}</div>
                    <div class="text-xs text-cyan-600 font-semibold">{{ log.admin?.email || 'N/A' }}</div>
                  </div>
                </div>
              </td>

              <!-- Action Badge -->
              <td class="px-6 py-4">
                <Badge :variant="getActionVariant(log.action)" class="uppercase font-extrabold">
                  <component :is="getActionIcon(log.action)" class="w-3 h-3" />
                  <span>{{ log.action }}</span>
                </Badge>
              </td>

              <!-- Module / Entity -->
              <td class="px-6 py-4">
                <div class="font-bold text-slate-800">{{ log.entity }}</div>
                <div v-if="log.entityId" class="text-xs text-slate-400 font-mono">ID: {{ truncateUuid(log.entityId) }}</div>
              </td>

              <!-- View Details / Diff Modal Trigger -->
              <td class="px-6 py-4 text-right">
                <Button
                  v-if="log.oldValues || log.newValues"
                  variant="outline"
                  size="sm"
                  @click="openDiffModal(log)"
                  class="text-cyan-700 border-cyan-200 hover:bg-cyan-50 ml-auto"
                >
                  <Search class="w-3.5 h-3.5" />
                  <span>ดูรายละเอียด Diff</span>
                </Button>
                <span v-else class="text-slate-400 text-xs italic">ไม่มีข้อมูล Snapshot</span>
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
          <Button
            variant="outline"
            size="sm"
            @click="changePage(meta.page - 1)"
            :disabled="meta.page <= 1"
          >
            <ArrowLeft class="w-3.5 h-3.5" />
            <span>หน้าก่อนหน้า</span>
          </Button>
          <Button
            variant="outline"
            size="sm"
            @click="changePage(meta.page + 1)"
            :disabled="meta.page >= meta.totalPages"
          >
            <span>หน้าถัดไป</span>
            <ArrowRight class="w-3.5 h-3.5" />
          </Button>
        </div>
      </div>
    </Card>

    <!-- Before / After JSON Diff Modal -->
    <Dialog :open="!!selectedLog" @update:open="(v) => { if (!v) selectedLog = null }">
      <DialogContent class="max-w-3xl p-0 overflow-hidden flex flex-col max-h-[90vh]">
        <!-- Modal Header -->
        <div class="px-6 py-4 bg-gradient-to-r from-cyan-900 to-teal-900 text-white">
          <DialogHeader>
            <DialogTitle class="text-white flex items-center gap-2.5">
              <BarChart3 class="w-5 h-5 text-cyan-300" />
              <span>เปรียบเทียบการเปลี่ยนแปลง (Data Diff Inspection)</span>
            </DialogTitle>
            <DialogDescription v-if="selectedLog" class="text-cyan-200">
              โมดูล {{ selectedLog.entity }} | โดย {{ selectedLog.admin?.name }} ({{ formatDate(selectedLog.createdAt) }})
            </DialogDescription>
          </DialogHeader>
        </div>

        <!-- Modal Body: Diff View -->
        <div v-if="selectedLog" class="p-6 overflow-y-auto space-y-4 flex-1">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <!-- Left: Old Values (Before) -->
            <div class="bg-rose-50/70 border border-rose-200 rounded-xl p-4 space-y-3">
              <div class="text-xs font-bold text-rose-800 uppercase tracking-wider flex items-center gap-1.5">
                <span class="w-2 h-2 rounded-full bg-rose-500"></span>
                <span>ค่าเดิมก่อนดำเนินการ (Before / Old Values)</span>
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
                  <span class="text-xs text-slate-500 font-bold uppercase">{{ key }}:</span>
                  <span class="font-semibold text-slate-800 break-all">{{ formatValue(val) }}</span>
                </div>
              </div>
            </div>

            <!-- Right: New Values (After) -->
            <div class="bg-emerald-50/70 border border-emerald-200 rounded-xl p-4 space-y-3">
              <div class="text-xs font-bold text-emerald-800 uppercase tracking-wider flex items-center gap-1.5">
                <span class="w-2 h-2 rounded-full bg-emerald-500"></span>
                <span>ค่าใหม่หลังดำเนินการ (After / New Values)</span>
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
                  <span class="text-xs text-slate-500 font-bold uppercase">{{ key }}:</span>
                  <span class="font-semibold text-slate-800 break-all">{{ formatValue(val) }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Modal Footer -->
        <DialogFooter class="px-6 py-4 bg-slate-50 border-t border-slate-100">
          <Button variant="outline" @click="selectedLog = null">ปิดหน้าต่าง (Close)</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue';
import api from '@/utils/api';
import { formatDate } from '@/utils/formatters';
import {
  History,
  RefreshCw,
  Filter,
  Plus,
  Edit3,
  Trash2,
  Zap,
  Search,
  AlertCircle,
  X,
  ArrowLeft,
  ArrowRight,
  BarChart3
} from 'lucide-vue-next';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';

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
    const { data: res } = await api.get('/api/admin/audit-logs', {
      params: {
        page: meta.page,
        limit: meta.limit,
        action: filters.action || undefined,
        entity: filters.entity || undefined,
        startDate: filters.startDate || undefined,
        endDate: filters.endDate || undefined
      }
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
    case 'CREATE': return Plus;
    case 'UPDATE': return Edit3;
    case 'DELETE': return Trash2;
    default: return Zap;
  }
};

const getActionVariant = (action) => {
  switch ((action || '').toUpperCase()) {
    case 'CREATE': return 'success';
    case 'UPDATE': return 'warning';
    case 'DELETE': return 'danger';
    default: return 'neutral';
  }
};

const truncateUuid = (uuid) => {
  if (!uuid) return '';
  return uuid.length > 12 ? `${uuid.slice(0, 8)}...` : uuid;
};

</script>
