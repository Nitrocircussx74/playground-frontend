<template>
  <div class="space-y-6">
    <!-- Header & Export Toolbar -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div>
        <h1 class="text-2xl font-bold text-slate-900 tracking-tight">Business Analytics Dashboard</h1>
        <p class="text-sm text-slate-500">Real-time overview of revenue, occupancy rate, debt tracking & report export</p>
      </div>

      <!-- Toolbar Controls -->
      <div class="flex flex-wrap items-center gap-2.5">
        <!-- Billing Cycle Selector -->
        <div class="flex items-center gap-1 bg-white px-3 py-1 rounded-xl border border-slate-200 shadow-2xs">
          <Calendar class="w-3.5 h-3.5 text-purple-600 shrink-0" />
          <label class="text-xs font-semibold text-slate-500">Cycle:</label>
          <CycleDatePicker v-model="selectedCycle" />
        </div>

        <!-- Refresh Button -->
        <button
          @click="loadDashboardData"
          class="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition-all border border-slate-200 flex items-center gap-1.5"
        >
          <span>🔄 Refresh</span>
        </button>

        <!-- Export CSV Button -->
        <button
          @click="handleExportCsv"
          :disabled="dashboardStore.isLoading"
          class="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 disabled:opacity-50"
        >
          <span>📊 Export CSV</span>
        </button>

        <!-- Export PDF Button -->
        <button
          @click="handleExportPdf"
          :disabled="dashboardStore.isLoading"
          class="px-3.5 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 disabled:opacity-50"
        >
          <span>📄 Export PDF</span>
        </button>
      </div>
    </div>

    <!-- Dashboard Mode Banner -->
    <div
      class="p-4 rounded-2xl border flex items-center justify-between shadow-2xs transition-all"
      :class="isConsolidatedMode ? 'bg-gradient-to-r from-purple-900 to-indigo-900 text-white border-purple-800' : 'bg-white border-slate-200 text-slate-900'"
    >
      <div class="flex items-center gap-3">
        <div class="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-xl shrink-0">
          {{ isConsolidatedMode ? '🌐' : '🏢' }}
        </div>
        <div>
          <h2 class="font-bold text-sm sm:text-base">
            {{ isConsolidatedMode ? 'โหมดภาพรวมทั้งหมด (Consolidated Portfolio View)' : `สรุปผลประกอบการ: ${activeBuildingName}` }}
          </h2>
          <p class="text-xs" :class="isConsolidatedMode ? 'text-purple-200' : 'text-slate-500'">
            {{ isConsolidatedMode ? 'แสดงผลสรุปรายรับรวม อัตราครองห้องรวม และการเปรียบเทียบระหว่างตึกทั้งหมดในระบบ' : 'แสดงข้อมูลสถิติเฉพาะหอพักที่เลือกอยู่' }}
          </p>
        </div>
      </div>

      <div class="hidden md:flex items-center gap-2">
        <span class="px-3 py-1 rounded-full text-xs font-bold" :class="isConsolidatedMode ? 'bg-purple-500/30 text-purple-200 border border-purple-400/40' : 'bg-slate-100 text-slate-700 border border-slate-200'">
          {{ isConsolidatedMode ? 'ทุกหอพัก' : activeBuildingName }}
        </span>
      </div>
    </div>

    <!-- Error Alert -->
    <div v-if="dashboardStore.errorMessage" class="p-4 bg-rose-50 border border-rose-200 rounded-2xl text-rose-700 text-xs font-medium flex items-center justify-between">
      <span>⚠️ {{ dashboardStore.errorMessage }}</span>
      <button @click="dashboardStore.errorMessage = ''" class="text-rose-500 hover:text-rose-700 font-bold">✕</button>
    </div>

    <!-- Loading State -->
    <div v-if="dashboardStore.isLoading && !summary.occupancy?.totalRooms" class="p-12 text-center text-slate-500">
      <div class="animate-spin w-8 h-8 border-4 border-purple-600 border-t-transparent rounded-full mx-auto mb-3"></div>
      Loading business analytics...
    </div>

    <div v-else class="space-y-6">
      <!-- Building Comparison Section (Visible in Consolidated Mode) -->
      <div v-if="isConsolidatedMode && summary.buildingBreakdown?.length > 0" class="space-y-3">
        <h3 class="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
          <span>📊 เปรียบเทียบผลประกอบการระหว่างตึก (Building Performance Breakdown)</span>
        </h3>

        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div
            v-for="b in summary.buildingBreakdown"
            :key="b.id"
            @click="selectBuilding(b.id)"
            class="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs hover:shadow-md hover:border-purple-300 cursor-pointer transition-all space-y-3 group"
          >
            <div class="flex items-center justify-between">
              <h4 class="font-bold text-slate-900 group-hover:text-purple-600 transition-colors flex items-center gap-2">
                <span>🏢 {{ b.name }}</span>
              </h4>
              <span class="text-xs text-purple-600 font-semibold group-hover:underline">ดูรายละเอียด →</span>
            </div>

            <div class="grid grid-cols-2 gap-2 text-xs pt-1">
              <div class="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                <div class="text-slate-500 text-[11px]">รายได้เดือนนี้</div>
                <div class="font-bold font-mono text-purple-700 text-sm">฿{{ b.currentRevenue?.toLocaleString() }}</div>
              </div>
              <div class="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                <div class="text-slate-500 text-[11px]">อัตราครองห้อง</div>
                <div class="font-bold text-slate-900 text-sm">{{ b.occupancyRate }}% <span class="text-[10px] text-slate-400">({{ b.occupiedRooms }}/{{ b.totalRooms }})</span></div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <!-- 1. Top KPI Summary Cards (4 Cards) -->
      <div id="tour-kpi-cards" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <!-- Card 1: Revenue -->
        <Card class="bg-gradient-to-br from-white to-purple-50/40 border border-slate-200/80 shadow-2xs">
          <CardHeader class="pb-2">
            <CardTitle class="text-xs font-semibold text-slate-500 uppercase tracking-wider">💰 Revenue This Month</CardTitle>
          </CardHeader>
          <CardContent class="space-y-1">
            <div class="text-2xl font-extrabold text-slate-900 font-mono">
              ฿{{ Number(summary.financial?.currentTotal || 0).toLocaleString() }}
            </div>
            <div class="flex items-center gap-1.5 text-xs font-semibold">
              <span :class="summary.financial?.momGrowth >= 0 ? 'text-emerald-600' : 'text-rose-600'">
                {{ summary.financial?.momGrowth >= 0 ? '▲' : '▼' }} {{ Math.abs(summary.financial?.momGrowth || 0) }}%
              </span>
              <span class="text-slate-400">vs last month</span>
            </div>
          </CardContent>
        </Card>

        <!-- Card 2: Total Debt -->
        <Card class="bg-gradient-to-br from-white to-rose-50/40 border border-slate-200/80 shadow-2xs">
          <CardHeader class="pb-2">
            <CardTitle class="text-xs font-semibold text-slate-500 uppercase tracking-wider">⚠️ Total Overdue Debt</CardTitle>
          </CardHeader>
          <CardContent class="space-y-1">
            <div class="text-2xl font-extrabold text-rose-600 font-mono">
              ฿{{ Number(summary.debt?.totalDebt || 0).toLocaleString() }}
            </div>
            <div class="text-xs text-rose-700 font-medium">
              {{ summary.debt?.debtorCount || 0 }} ห้องค้างชำระค่าบริการ
            </div>
          </CardContent>
        </Card>

        <!-- Card 3: Occupancy Rate -->
        <Card class="bg-gradient-to-br from-white to-emerald-50/40 border border-slate-200/80 shadow-2xs">
          <CardHeader class="pb-2">
            <CardTitle class="text-xs font-semibold text-slate-500 uppercase tracking-wider">🏠 Occupancy Rate</CardTitle>
          </CardHeader>
          <CardContent class="space-y-1">
            <div class="text-2xl font-extrabold text-emerald-700 font-mono">
              {{ summary.occupancy?.occupancyRate || 0 }}%
            </div>
            <div class="text-xs text-slate-500 font-medium">
              {{ summary.occupancy?.occupiedRooms || 0 }} / {{ summary.occupancy?.totalRooms || 0 }} ห้องมีคนอยู่ (ว่าง {{ summary.occupancy?.availableRooms || 0 }})
            </div>
          </CardContent>
        </Card>

        <!-- Card 4: Pending Tasks & Maintenance -->
        <Card class="bg-gradient-to-br from-white to-amber-50/40 border border-slate-200/80 shadow-2xs">
          <CardHeader class="pb-2">
            <CardTitle class="text-xs font-semibold text-slate-500 uppercase tracking-wider">🔧 Tasks & Maintenance</CardTitle>
          </CardHeader>
          <CardContent class="space-y-1">
            <div class="text-2xl font-extrabold text-amber-600 font-mono">
              {{ summary.pendingMaintenanceCount || 0 }} <span class="text-xs font-normal text-slate-500">เคส</span>
            </div>
            <div class="text-xs text-amber-700 font-medium">
              สัญญาใกล้หมดอายุ (30 วัน): {{ summary.expiringLeasesCount || 0 }} รายการ
            </div>
          </CardContent>
        </Card>
      </div>

      <!-- 2. Interactive Charts Section -->
      <div id="tour-revenue-chart" class="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <!-- Stacked Bar Chart: 6-Month Revenue Trend -->
        <div class="lg:col-span-2 p-6 bg-white border border-slate-200 rounded-2xl shadow-2xs space-y-4">
          <div class="flex items-center justify-between">
            <div>
              <h3 class="font-bold text-slate-900 text-sm">📊 แนวโน้มรายรับ 6 เดือนย้อนหลัง (Stacked Revenue Trend)</h3>
              <p class="text-xs text-slate-500">แสดงการกระจายรายรับจำแนกตามค่าเช่า ค่าน้ำไฟ และค่าส่วนกลาง</p>
            </div>
          </div>

          <div class="h-64 flex items-center justify-center">
            <Bar :data="trendChartData" :options="trendChartOptions" />
          </div>
        </div>

        <!-- Doughnut Chart: Room Status Distribution -->
        <div class="p-6 bg-white border border-slate-200 rounded-2xl shadow-2xs space-y-4">
          <div class="flex items-center justify-between">
            <div>
              <h3 class="font-bold text-slate-900 text-sm">🍩 สัดส่วนห้องพัก (Room Status)</h3>
              <p class="text-xs text-slate-500">สัดส่วนห้องพักมีคนอยู่ / ว่าง / ซ่อมบำรุง</p>
            </div>
          </div>

          <div class="h-64 flex items-center justify-center">
            <Doughnut :data="roomStatusChartData" :options="roomStatusChartOptions" />
          </div>
        </div>
      </div>

      <!-- 3. Bottom Grid: 2-Column To-Do Lists (Overdue Debtors & Expiring Leases) -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <!-- Left Column: Overdue Debtors -->
        <div id="tour-overdue-debtors" class="bg-white border border-slate-200 rounded-2xl shadow-2xs overflow-hidden flex flex-col justify-between">
          <div>
            <div class="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
              <div>
                <h3 class="font-bold text-slate-900 text-sm flex items-center gap-1.5">
                  <span>⚠️</span>
                  <span>รายการห้องค้างชำระ (Overdue Invoices)</span>
                </h3>
                <p class="text-[11px] text-slate-500">รวม {{ summary.debt?.debtorCount || 0 }} ห้องพักที่รอดำเนินการทวงถามยอด</p>
              </div>

              <button
                @click="showRemindModal = true"
                :disabled="!summary.debt?.debtors || summary.debt?.debtors.length === 0"
                class="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs disabled:opacity-50 flex items-center gap-1 cursor-pointer"
              >
                <span>💬 ส่ง LINE ทวงหนี้</span>
              </button>
            </div>

            <div class="overflow-x-auto max-h-72">
              <table class="w-full text-left text-xs text-slate-700">
                <thead class="bg-slate-100 text-[10px] text-slate-500 uppercase tracking-wider sticky top-0">
                  <tr>
                    <th class="p-2.5">ห้องพัก</th>
                    <th class="p-2.5">ผู้เช่า</th>
                    <th class="p-2.5">รอบบิล</th>
                    <th class="p-2.5">ยอดรวม</th>
                    <th class="p-2.5 text-right">สถานะ</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-slate-100 font-mono">
                  <tr v-for="inv in summary.debt?.debtors" :key="inv.id" class="hover:bg-slate-50">
                    <td class="p-2.5 font-bold text-slate-900">ห้อง {{ inv.room?.roomNumber }}</td>
                    <td class="p-2.5 font-sans font-medium text-slate-700">
                      {{ inv.tenant ? `${inv.tenant.firstName} ${inv.tenant.lastName}` : '-' }}
                    </td>
                    <td class="p-2.5 text-slate-500">{{ inv.billingCycle }}</td>
                    <td class="p-2.5 font-bold text-rose-600">฿{{ Number(inv.grandTotal).toLocaleString() }}</td>
                    <td class="p-2.5 text-right">
                      <span class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800 border border-rose-300">
                        {{ inv.status.toUpperCase() }}
                      </span>
                    </td>
                  </tr>
                  <tr v-if="!summary.debt?.debtors || summary.debt?.debtors.length === 0">
                    <td colspan="5" class="p-6 text-center text-slate-400 font-sans">ไม่มีรายการห้องค้างชำระ 🎉</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <!-- Right Column: Expiring Leases in 30 Days -->
        <div id="tour-expiring-leases" class="bg-white border border-slate-200 rounded-2xl shadow-2xs overflow-hidden flex flex-col justify-between">
          <div>
            <div class="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
              <div>
                <h3 class="font-bold text-slate-900 text-sm flex items-center gap-1.5">
                  <span>📜</span>
                  <span>สัญญาใกล้หมดอายุใน 30 วัน (Expiring Leases)</span>
                </h3>
                <p class="text-[11px] text-slate-500">มีทั้งหมด {{ summary.expiringLeasesCount || 0 }} สัญญาที่ต้องติดต่อต่อสัญญา</p>
              </div>

              <router-link to="/leases" class="text-xs text-purple-700 font-bold hover:underline">
                ดูทั้งหมด ➔
              </router-link>
            </div>

            <div class="overflow-x-auto max-h-72">
              <table class="w-full text-left text-xs text-slate-700">
                <thead class="bg-slate-100 text-[10px] text-slate-500 uppercase tracking-wider sticky top-0">
                  <tr>
                    <th class="p-2.5">ห้องพัก</th>
                    <th class="p-2.5">ผู้เช่า</th>
                    <th class="p-2.5">วันหมดสัญญา</th>
                    <th class="p-2.5 text-right">มัดจำ</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-slate-100 font-mono">
                  <tr v-for="lease in summary.expiringLeases" :key="lease.id" class="hover:bg-slate-50">
                    <td class="p-2.5 font-bold text-slate-900">ห้อง {{ lease.room?.roomNumber }}</td>
                    <td class="p-2.5 font-sans font-medium text-slate-700">
                      {{ lease.tenant ? `${lease.tenant.firstName} ${lease.tenant.lastName}` : '-' }}
                      <span class="block text-[10px] text-slate-400 font-mono">📞 {{ lease.tenant?.phone || '-' }}</span>
                    </td>
                    <td class="p-2.5 font-bold text-amber-700">
                      {{ lease.expectedEndDate ? new Date(lease.expectedEndDate).toLocaleDateString('th-TH') : '-' }}
                    </td>
                    <td class="p-2.5 text-right font-bold text-emerald-700">
                      ฿{{ Number(lease.depositAmount || 0).toLocaleString() }}
                    </td>
                  </tr>
                  <tr v-if="!summary.expiringLeases || summary.expiringLeases.length === 0">
                    <td colspan="4" class="p-6 text-center text-slate-400 font-sans">ไม่มีสัญญาที่กำลังจะหมดอายุใน 30 วัน 🎉</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Confirm Debt Reminder Modal -->
    <div v-if="showRemindModal" class="fixed inset-0 z-50 bg-slate-950/40 backdrop-blur-xs flex items-center justify-center p-4">
      <div class="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4 border border-slate-200">
        <div class="w-12 h-12 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center text-2xl mx-auto">
          ⚠️
        </div>

        <h3 class="text-lg font-bold text-slate-900 text-center">ยืนยันการส่ง LINE ทวงหนี้</h3>

        <p class="text-sm text-slate-600 text-center leading-relaxed">
          คุณต้องการส่งข้อความแจ้งเตือนยอดค้างชำระผ่าน LINE ไปยัง
          <span class="font-bold text-slate-900">{{ summary.debt?.debtorCount }} ห้องพัก</span>
          (รวมยอด <span class="font-bold text-rose-600">฿{{ Number(summary.debt?.totalDebt).toLocaleString() }}</span>) ใช่หรือไม่?
        </p>

        <div class="flex gap-3 pt-2">
          <button
            @click="showRemindModal = false"
            class="w-1/2 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition-all"
          >
            ยกเลิก (Cancel)
          </button>

          <button
            @click="handleRemindDebtors"
            :disabled="reminding"
            class="w-1/2 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-rose-600/20 disabled:opacity-50"
          >
            {{ reminding ? 'กำลังส่ง...' : 'ยืนยันส่ง LINE ทวงหนี้' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import { Calendar } from 'lucide-vue-next';
import CycleDatePicker from '@/components/common/CycleDatePicker.vue';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Bar, Doughnut } from 'vue-chartjs';
import { Chart as ChartJS, Title, Tooltip, Legend, BarElement, ArcElement, CategoryScale, LinearScale } from 'chart.js';
import { useDashboardStore } from '@/stores/useDashboardStore';
import { useBuildingStore } from '@/stores/useBuildingStore';
import { showSuccess, showError } from '@/utils/swal';

ChartJS.register(Title, Tooltip, Legend, BarElement, ArcElement, CategoryScale, LinearScale);

const dashboardStore = useDashboardStore();
const buildingStore = useBuildingStore();
const selectedCycle = ref('');
const showRemindModal = ref(false);
const reminding = ref(false);

const summary = computed(() => dashboardStore.summary);
const revenueTrends = computed(() => dashboardStore.revenueTrends);
const isConsolidatedMode = computed(() => !buildingStore.activeBuildingId);

const activeBuildingName = computed(() => {
  if (!buildingStore.activeBuildingId) return 'ภาพรวมทุกหอพัก';
  const b = buildingStore.buildings.find((x) => x.id === buildingStore.activeBuildingId);
  return b ? b.name : 'ตึกที่เลือก';
});

const selectBuilding = (buildingId) => {
  buildingStore.setActiveBuildingId(buildingId);
};

import { startTour } from '@/utils/tours';

onMounted(async () => {
  buildingStore.fetchBuildings();
  await loadDashboardData();
  setTimeout(() => {
    startTour('dashboard');
  }, 600);
});

watch(
  () => buildingStore.activeBuildingId,
  () => {
    loadDashboardData();
  }
);

const loadDashboardData = async () => {
  const bId = buildingStore.activeBuildingId;
  await dashboardStore.fetchSummary(bId);
  await dashboardStore.fetchRevenueTrend(bId);
  if (summary.value.financial?.currentCycle) {
    selectedCycle.value = summary.value.financial.currentCycle;
  }
};

const handleExportCsv = async () => {
  await dashboardStore.exportCsv(selectedCycle.value);
};

const handleExportPdf = async () => {
  await dashboardStore.exportPdf(selectedCycle.value);
};

const handleRemindDebtors = async () => {
  reminding.value = true;
  try {
    const res = await dashboardStore.remindDebtors();
    await showSuccess('สำเร็จ!', res.message || 'ส่งการแจ้งเตือนทวงถามยอดค้างชำระเรียบร้อยแล้ว');
    showRemindModal.value = false;
  } catch (error) {
    showError('เกิดข้อผิดพลาด', error.response?.data?.message || 'Failed to send debt reminders');
  } finally {
    reminding.value = false;
  }
};

// 6-Month Stacked Revenue Trend Chart Data
const trendChartData = computed(() => ({
  labels: revenueTrends.value.map((t) => t.cycle),
  datasets: [
    {
      label: 'ค่าเช่าห้องพัก (Room Rent)',
      backgroundColor: '#6366f1',
      data: revenueTrends.value.map((t) => t.roomPrice || 0)
    },
    {
      label: 'ค่าน้ำประปา (Water)',
      backgroundColor: '#06b6d4',
      data: revenueTrends.value.map((t) => t.waterTotal || 0)
    },
    {
      label: 'ค่าไฟฟ้า (Electricity)',
      backgroundColor: '#eab308',
      data: revenueTrends.value.map((t) => t.electricTotal || 0)
    },
    {
      label: 'ค่าส่วนกลาง (Common Fee)',
      backgroundColor: '#10b981',
      data: revenueTrends.value.map((t) => t.commonFee || 0)
    }
  ]
}));

const trendChartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  scales: {
    x: { stacked: true },
    y: { stacked: true }
  },
  plugins: {
    legend: { display: true, position: 'top' }
  }
};

// Doughnut Chart Data for Room Status Breakdown
const roomStatusChartData = computed(() => ({
  labels: ['มีผู้เช่า (Occupied)', 'ห้องว่าง (Available)', 'ซ่อมบำรุง (Maintenance)'],
  datasets: [
    {
      backgroundColor: ['#10b981', '#6366f1', '#64748b'],
      borderWidth: 0,
      data: [
        summary.value.occupancy?.occupiedRooms || 0,
        summary.value.occupancy?.availableRooms || 0,
        summary.value.occupancy?.maintenanceRooms || 0
      ]
    }
  ]
}));

const roomStatusChartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { display: true, position: 'bottom' }
  }
};
</script>
