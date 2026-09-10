<template>
  <div class="space-y-4">
    <!-- Filter & Search Toolbar -->
    <div class="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-2xs space-y-3">
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h3 class="text-sm font-bold text-slate-900 flex items-center gap-2">
            <span>📜</span>
            <span>ประวัติการส่งข้อความ LINE (LINE Delivery Logs)</span>
            <span class="text-xs font-normal text-slate-500">
              ({{ pagination.total }} รายการ)
            </span>
          </h3>
          <p class="text-xs text-slate-500 mt-0.5">
            ติดตามสถานะการส่งแจ้งเตือนบิล พัสดุ และงานซ่อมรายห้องแบบ Real-time
          </p>
        </div>

        <!-- Action Buttons -->
        <div class="flex items-center gap-2">
          <button
            @click="fetchLogs(1)"
            :disabled="isLoading"
            class="px-3 py-1.5 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-2xs transition-all active:scale-95 disabled:opacity-50 cursor-pointer"
            title="รีเฟรชประวัติการส่งล่าสุด"
          >
            <RefreshCw class="w-3.5 h-3.5 text-slate-500" :class="{ 'animate-spin': isLoading }" />
            <span>รีเฟรช</span>
          </button>
        </div>
      </div>

      <!-- Filter Controls Row -->
      <div class="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-2 border-t border-slate-100">
        <!-- 1. Search Box -->
        <div class="relative">
          <Search class="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            v-model="searchQuery"
            @input="debouncedSearch"
            type="text"
            placeholder="ค้นหาเลขห้อง, ชื่อลูกบ้าน, หรือข้อความ..."
            class="w-full pl-8.5 pr-3 py-1.5 text-xs bg-slate-50/70 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-purple-600 transition-all font-sans"
          />
        </div>

        <!-- 2. Filter Status -->
        <div class="flex items-center gap-1.5">
          <label class="text-[11px] font-bold text-slate-600 shrink-0">สถานะ:</label>
          <select
            v-model="selectedStatus"
            @change="fetchLogs(1)"
            class="w-full px-2.5 py-1.5 text-xs bg-slate-50/70 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-purple-600 cursor-pointer"
          >
            <option value="ALL">ทั้งหมด (All Status)</option>
            <option value="SUCCESS">✅ ส่งสำเร็จ (Success)</option>
            <option value="FAILED">❌ ส่งล้มเหลว (Failed)</option>
          </select>
        </div>

        <!-- 3. Filter Type -->
        <div class="flex items-center gap-1.5">
          <label class="text-[11px] font-bold text-slate-600 shrink-0">ประเภท:</label>
          <select
            v-model="selectedType"
            @change="fetchLogs(1)"
            class="w-full px-2.5 py-1.5 text-xs bg-slate-50/70 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-purple-600 cursor-pointer"
          >
            <option value="ALL">ทั้งหมด (All Types)</option>
            <option value="INVOICE">🧾 บิลค่าเช่า (Invoice)</option>
            <option value="PARCEL">📦 พัสดุ (Parcel)</option>
            <option value="MAINTENANCE">🔧 แจ้งซ่อม (Maintenance)</option>
            <option value="GENERAL">💬 ทั่วไป (General)</option>
          </select>
        </div>
      </div>
    </div>

    <!-- Logs Table Card -->
    <div class="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
      <!-- Loading State -->
      <div v-if="isLoading && logs.length === 0" class="p-12 text-center text-slate-500 space-y-3">
        <div class="animate-spin inline-block w-8 h-8 border-3 border-purple-600 border-t-transparent rounded-full"></div>
        <p class="text-xs font-semibold">กำลังโหลดประวัติการส่งข้อความ...</p>
      </div>

      <!-- Empty State -->
      <div v-else-if="logs.length === 0" class="p-12 text-center text-slate-500 space-y-2">
        <div class="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto text-xl">
          📭
        </div>
        <h4 class="text-sm font-bold text-slate-700">ไม่พบประวัติการส่งข้อความ</h4>
        <p class="text-xs text-slate-400 max-w-sm mx-auto">
          ยังไม่มีข้อมูลประวัติการส่งแจ้งเตือนที่ตรงกับตัวกรองที่เลือก
        </p>
      </div>

      <!-- Table -->
      <div v-else class="overflow-x-auto">
        <table class="w-full text-left text-xs">
          <thead class="bg-slate-50/80 text-slate-600 font-bold border-b border-slate-100 uppercase tracking-wider text-[11px]">
            <tr>
              <th class="py-3.5 px-4">วันเวลาที่ส่ง</th>
              <th class="py-3.5 px-4">ห้อง / ผู้รับ</th>
              <th class="py-3.5 px-4">ประเภทข้อความ</th>
              <th class="py-3.5 px-4 hidden md:table-cell">ตัวอย่างข้อความ</th>
              <th class="py-3.5 px-4 text-center">สถานะการส่ง</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100">
            <tr
              v-for="log in logs"
              :key="log.id"
              class="hover:bg-slate-50/60 transition-colors"
            >
              <!-- 1. วันเวลาที่ส่ง -->
              <td class="py-3 px-4 whitespace-nowrap text-slate-600 font-medium">
                <div class="flex items-center gap-1.5">
                  <Clock class="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span>{{ formatDateTime(log.sentAt) }}</span>
                </div>
              </td>

              <!-- 2. ห้อง / ชื่อผู้รับ -->
              <td class="py-3 px-4">
                <div class="space-y-0.5">
                  <div class="font-bold text-slate-900 flex items-center gap-1">
                    <span>🏢</span>
                    <span>{{ log.room ? `ห้อง ${log.room.roomNumber}` : 'ระบบส่วนกลาง' }}</span>
                  </div>
                  <div class="text-[11px] text-slate-500 truncate max-w-[160px]">
                    {{ getRecipientName(log) }}
                  </div>
                </div>
              </td>

              <!-- 3. ประเภทข้อความ -->
              <td class="py-3 px-4 whitespace-nowrap">
                <span
                  class="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold border"
                  :class="getTypeBadgeClass(log.notificationType)"
                >
                  <span>{{ getTypeIcon(log.notificationType) }}</span>
                  <span>{{ getTypeLabel(log.notificationType) }}</span>
                </span>
              </td>

              <!-- 4. ตัวอย่างข้อความ (Preview) -->
              <td class="py-3 px-4 hidden md:table-cell max-w-xs">
                <p class="text-xs text-slate-600 truncate font-sans" :title="log.messagePreview">
                  {{ log.messagePreview || '-' }}
                </p>
              </td>

              <!-- 5. สถานะการส่ง -->
              <td class="py-3 px-4 whitespace-nowrap text-center">
                <!-- SUCCESS -->
                <span
                  v-if="log.status === 'SUCCESS'"
                  class="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200"
                >
                  <span class="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                  <span>สำเร็จ</span>
                </span>

                <!-- FAILED with Error Reason Dialog/Popover -->
                <div v-else class="inline-flex items-center gap-1">
                  <span
                    class="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-rose-50 text-rose-700 border border-rose-200"
                  >
                    <span class="w-1.5 h-1.5 rounded-full bg-rose-500"></span>
                    <span>ล้มเหลว</span>
                  </span>

                  <!-- Info Button to view error reason -->
                  <button
                    v-if="log.errorReason"
                    @click="showErrorModal(log)"
                    class="p-1 text-rose-500 hover:text-rose-700 hover:bg-rose-100 rounded-full transition-colors cursor-pointer"
                    title="คลิกเพื่อดูรายละเอียดข้อผิดพลาด"
                  >
                    <Info class="w-3.5 h-3.5" />
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Pagination Footer -->
      <div
        v-if="pagination.totalPages > 1"
        class="p-3.5 border-t border-slate-100 bg-slate-50/50 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 text-xs text-slate-500"
      >
        <div>
          <span>แสดงหน้า {{ pagination.page }} จาก {{ pagination.totalPages }} หน้า (ทั้งหมด {{ pagination.total }} รายการ)</span>
        </div>
        <div class="flex items-center gap-1.5 self-end sm:self-auto">
          <button
            @click="fetchLogs(pagination.page - 1)"
            :disabled="pagination.page <= 1 || isLoading"
            class="px-2.5 py-1 bg-white border border-slate-200 rounded-lg font-semibold hover:bg-slate-100 disabled:opacity-40 flex items-center gap-1 cursor-pointer"
          >
            <ChevronLeft class="w-3.5 h-3.5" />
            <span>ก่อนหน้า</span>
          </button>
          <button
            @click="fetchLogs(pagination.page + 1)"
            :disabled="pagination.page >= pagination.totalPages || isLoading"
            class="px-2.5 py-1 bg-white border border-slate-200 rounded-lg font-semibold hover:bg-slate-100 disabled:opacity-40 flex items-center gap-1 cursor-pointer"
          >
            <span>ถัดไป</span>
            <ChevronRight class="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>

    <!-- Error Detail Modal -->
    <div
      v-if="selectedErrorLog"
      class="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn"
      @click.self="selectedErrorLog = null"
    >
      <div class="bg-white rounded-2xl max-w-md w-full p-5 shadow-xl border border-slate-200 space-y-4">
        <div class="flex items-center justify-between border-b border-slate-100 pb-3">
          <h4 class="text-sm font-bold text-rose-900 flex items-center gap-2">
            <span class="w-6 h-6 rounded-full bg-rose-100 flex items-center justify-center text-rose-600 text-xs">⚠️</span>
            <span>สาเหตุที่ส่งข้อความ LINE ล้มเหลว</span>
          </h4>
          <button
            @click="selectedErrorLog = null"
            class="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100 cursor-pointer"
          >
            ✕
          </button>
        </div>

        <div class="space-y-3 text-xs text-slate-700">
          <div class="p-3 bg-slate-50 rounded-xl space-y-1 border border-slate-100">
            <div class="flex justify-between text-slate-500">
              <span>ห้องพัก:</span>
              <strong class="text-slate-800">{{ selectedErrorLog.room ? `ห้อง ${selectedErrorLog.room.roomNumber}` : 'N/A' }}</strong>
            </div>
            <div class="flex justify-between text-slate-500">
              <span>ผู้รับ:</span>
              <strong class="text-slate-800">{{ getRecipientName(selectedErrorLog) }}</strong>
            </div>
            <div class="flex justify-between text-slate-500">
              <span>ประเภท:</span>
              <strong class="text-slate-800">{{ getTypeLabel(selectedErrorLog.notificationType) }}</strong>
            </div>
          </div>

          <div class="space-y-1">
            <span class="font-bold text-slate-800">ข้อความ Error จาก LINE API:</span>
            <div class="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-900 font-mono text-[11px] break-all leading-relaxed">
              {{ selectedErrorLog.errorReason || 'ไม่ระบุสาเหตุ' }}
            </div>
          </div>

          <p class="text-[11px] text-slate-400 leading-relaxed">
            💡 <strong>สาเหตุที่พบบ่อย:</strong> ลูกบ้านยังไม่ได้กดเพิ่มเพื่อน LINE OA หรือกดบล็อกบอทไว้, LINE Token ประจำตึกหมดอายุ, หรือไม่มีสิทธิ์ส่งข้อความ Push
          </p>
        </div>

        <div class="pt-2 flex justify-end">
          <button
            @click="selectedErrorLog = null"
            class="px-4 py-1.5 bg-slate-900 text-white rounded-xl text-xs font-semibold hover:bg-slate-800 transition-colors cursor-pointer"
          >
            ปิดหน้าต่าง
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import api from '@/utils/api';
import { useBuildingStore } from '@/stores/useBuildingStore';
import {
  Clock,
  Search,
  RefreshCw,
  Info,
  ChevronLeft,
  ChevronRight
} from 'lucide-vue-next';

const props = defineProps({
  buildingId: {
    type: String,
    default: ''
  }
});

const buildingStore = useBuildingStore();
const logs = ref([]);
const isLoading = ref(false);
const searchQuery = ref('');
const selectedStatus = ref('ALL');
const selectedType = ref('ALL');
const selectedErrorLog = ref(null);

const pagination = ref({
  page: 1,
  limit: 20,
  total: 0,
  totalPages: 1
});

let searchTimeout = null;

const targetBuildingId = computed(() => {
  return props.buildingId || buildingStore.activeBuildingId || '';
});

/**
 * ดึงประวัติการส่งแจ้งเตือนจาก API
 */
const fetchLogs = async (page = 1) => {
  const bId = targetBuildingId.value;
  if (!bId) return;

  isLoading.value = true;
  try {
    const params = {
      page,
      limit: pagination.value.limit,
      ...(selectedStatus.value !== 'ALL' && { status: selectedStatus.value }),
      ...(selectedType.value !== 'ALL' && { notificationType: selectedType.value }),
      ...(searchQuery.value.trim() && { search: searchQuery.value.trim() })
    };

    const res = await api.get(`/api/admin/buildings/${bId}/notification-logs`, { params });
    if (res.data?.success) {
      logs.value = res.data.data || [];
      if (res.data.pagination) {
        pagination.value = res.data.pagination;
      }
    }
  } catch (error) {
    console.warn('⚠️ ไม่สามารถดึงประวัติการส่งแจ้งเตือนได้:', error.message);
  } finally {
    isLoading.value = false;
  }
};

const debouncedSearch = () => {
  clearTimeout(searchTimeout);
  searchTimeout = setTimeout(() => {
    fetchLogs(1);
  }, 400);
};

const showErrorModal = (log) => {
  selectedErrorLog.value = log;
};

/**
 * Helpers & Formatters
 */
const formatDateTime = (dateStr) => {
  if (!dateStr) return '-';
  const d = new Date(dateStr);
  return d.toLocaleDateString('th-TH', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

const getRecipientName = (log) => {
  if (log.tenant) {
    return `${log.tenant.firstName || ''} ${log.tenant.lastName || ''}`.trim() || log.tenant.lineDisplayName || 'ลูกบ้าน';
  }
  if (log.user) {
    return log.user.name || log.user.email;
  }
  return 'ไม่ระบุผู้รับ';
};

const getTypeLabel = (type) => {
  switch (type) {
    case 'INVOICE':
      return 'บิลค่าเช่า';
    case 'PARCEL':
      return 'พัสดุ';
    case 'MAINTENANCE':
      return 'แจ้งซ่อม';
    default:
      return 'ทั่วไป';
  }
};

const getTypeIcon = (type) => {
  switch (type) {
    case 'INVOICE':
      return '🧾';
    case 'PARCEL':
      return '📦';
    case 'MAINTENANCE':
      return '🔧';
    default:
      return '💬';
  }
};

const getTypeBadgeClass = (type) => {
  switch (type) {
    case 'INVOICE':
      return 'bg-blue-50 text-blue-700 border-blue-200';
    case 'PARCEL':
      return 'bg-amber-50 text-amber-700 border-amber-200';
    case 'MAINTENANCE':
      return 'bg-purple-50 text-purple-700 border-purple-200';
    default:
      return 'bg-slate-50 text-slate-700 border-slate-200';
  }
};

onMounted(() => {
  fetchLogs(1);
});

watch(
  () => targetBuildingId.value,
  (newVal) => {
    if (newVal) {
      fetchLogs(1);
    }
  }
);

defineExpose({
  fetchLogs
});
</script>
