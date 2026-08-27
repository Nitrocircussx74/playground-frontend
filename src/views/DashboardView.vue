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
        <div class="flex items-center gap-2 bg-white px-3 py-1.5 rounded-xl border border-slate-200 shadow-2xs">
          <label class="text-xs font-semibold text-slate-500">Cycle:</label>
          <input
            v-model="selectedCycle"
            type="text"
            placeholder="MM-YYYY (e.g. 08-2026)"
            class="text-xs font-mono font-semibold bg-transparent focus:outline-hidden w-28 text-slate-800"
          />
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
      <!-- 1. KPI Summary Cards Section -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-5">
        <!-- Card 1: Revenue -->
        <Card class="bg-gradient-to-br from-white to-purple-50/40 border border-slate-200/80 shadow-2xs">
          <CardHeader class="pb-2">
            <CardTitle class="text-xs font-semibold text-slate-500 uppercase tracking-wider">Revenue This Month</CardTitle>
          </CardHeader>
          <CardContent class="space-y-1">
            <div class="text-3xl font-extrabold text-slate-900 font-mono">
              ฿{{ Number(summary.financial?.currentTotal || 0).toLocaleString() }}
            </div>
            <div class="flex items-center gap-1.5 text-xs font-semibold">
              <span :class="summary.financial?.momGrowth >= 0 ? 'text-emerald-600' : 'text-rose-600'">
                {{ summary.financial?.momGrowth >= 0 ? '▲' : '▼' }} {{ Math.abs(summary.financial?.momGrowth || 0) }}%
              </span>
              <span class="text-slate-400">vs last month ({{ summary.financial?.prevCycle || 'N/A' }})</span>
            </div>
          </CardContent>
        </Card>

        <!-- Card 2: Total Debt -->
        <Card class="bg-gradient-to-br from-white to-rose-50/40 border border-slate-200/80 shadow-2xs">
          <CardHeader class="pb-2">
            <CardTitle class="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Overdue Debt</CardTitle>
          </CardHeader>
          <CardContent class="space-y-1">
            <div class="text-3xl font-extrabold text-rose-600 font-mono">
              ฿{{ Number(summary.debt?.totalDebt || 0).toLocaleString() }}
            </div>
            <div class="text-xs text-rose-700 font-medium">
              {{ summary.debt?.debtorCount || 0 }} Rooms Pending Payment
            </div>
          </CardContent>
        </Card>

        <!-- Card 3: Occupancy Rate -->
        <Card class="bg-gradient-to-br from-white to-indigo-50/40 border border-slate-200/80 shadow-2xs">
          <CardHeader class="pb-2">
            <CardTitle class="text-xs font-semibold text-slate-500 uppercase tracking-wider">Occupancy Rate</CardTitle>
          </CardHeader>
          <CardContent class="space-y-1">
            <div class="text-3xl font-extrabold text-indigo-600 font-mono">
              {{ summary.occupancy?.occupancyRate || 0 }}%
            </div>
            <div class="text-xs text-slate-500 font-medium">
              {{ summary.occupancy?.occupiedRooms || 0 }} / {{ summary.occupancy?.totalRooms || 0 }} Occupied Rooms ({{ summary.occupancy?.availableRooms || 0 }} Available)
            </div>
          </CardContent>
        </Card>
      </div>

      <!-- 2. Interactive Charts Section -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <!-- 6-Month Revenue Trend Chart -->
        <div class="p-6 bg-white border border-slate-200 rounded-2xl shadow-2xs space-y-4">
          <div class="flex items-center justify-between">
            <div>
              <h3 class="font-semibold text-slate-900">Revenue Trend (แนวโน้มรายรับ 6 เดือน)</h3>
              <p class="text-xs text-slate-500">Historical monthly revenue performance</p>
            </div>
          </div>

          <div class="h-64 flex items-center justify-center">
            <Bar :data="trendChartData" :options="trendChartOptions" />
          </div>
        </div>

        <!-- Revenue Breakdown Chart -->
        <div class="p-6 bg-white border border-slate-200 rounded-2xl shadow-2xs space-y-4">
          <div class="flex items-center justify-between">
            <div>
              <h3 class="font-semibold text-slate-900">Revenue Breakdown ({{ summary.financial?.currentCycle || 'Current Cycle' }})</h3>
              <p class="text-xs text-slate-500">Category breakdown for room, utilities, & common fees</p>
            </div>
          </div>

          <div class="h-64 flex items-center justify-center">
            <Doughnut :data="breakdownChartData" :options="breakdownChartOptions" />
          </div>
        </div>
      </div>

      <!-- 3. Debt Tracking & Automated LINE Reminder Section -->
      <div class="bg-white border border-slate-200 rounded-2xl shadow-2xs overflow-hidden">
        <div class="p-5 border-b border-slate-200 flex items-center justify-between">
          <div>
            <h3 class="font-bold text-slate-900 text-base">Overdue Debtors (รายการลูกหนี้ค้างชำระ)</h3>
            <p class="text-xs text-slate-500">List of unpaid invoices awaiting payment</p>
          </div>

          <button
            @click="showRemindModal = true"
            :disabled="!summary.debt?.debtors || summary.debt?.debtors.length === 0"
            class="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs shadow-rose-600/20 disabled:opacity-50 flex items-center gap-1.5"
          >
            <span>📢 ส่ง LINE ทวงหนี้ (Remind Overdue)</span>
          </button>
        </div>

        <div class="overflow-x-auto">
          <table class="w-full text-left text-sm text-slate-700">
            <thead class="bg-slate-50 text-xs text-slate-500 uppercase tracking-wider border-b border-slate-200">
              <tr>
                <th class="p-3.5">Invoice #</th>
                <th class="p-3.5">Room</th>
                <th class="p-3.5">Tenant</th>
                <th class="p-3.5">Cycle</th>
                <th class="p-3.5">Due Date</th>
                <th class="p-3.5">Amount</th>
                <th class="p-3.5">Status</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100">
              <tr v-for="inv in summary.debt?.debtors" :key="inv.id" class="hover:bg-slate-50/60">
                <td class="p-3.5 font-mono text-xs font-semibold text-indigo-700">{{ inv.invoiceNumber }}</td>
                <td class="p-3.5 font-semibold text-slate-900">Room {{ inv.room?.roomNumber }}</td>
                <td class="p-3.5 text-xs text-slate-600">
                  {{ inv.tenant ? `${inv.tenant.firstName} ${inv.tenant.lastName}` : 'N/A' }}
                </td>
                <td class="p-3.5 font-mono text-xs">{{ inv.billingCycle }}</td>
                <td class="p-3.5 font-mono text-xs text-rose-600 font-semibold">
                  {{ inv.dueDate ? new Date(inv.dueDate).toLocaleDateString('th-TH') : '-' }}
                </td>
                <td class="p-3.5 font-mono font-bold text-rose-700">฿{{ Number(inv.grandTotal).toLocaleString() }}</td>
                <td class="p-3.5">
                  <span
                    class="text-xs font-semibold px-2.5 py-1 rounded-full border"
                    :class="{
                      'bg-amber-50 border-amber-300 text-amber-800': inv.status === 'pending',
                      'bg-rose-50 border-rose-300 text-rose-800': inv.status === 'overdue',
                      'bg-indigo-50 border-indigo-300 text-indigo-800': inv.status === 'reviewing'
                    }"
                  >
                    {{ inv.status.toUpperCase() }}
                  </span>
                </td>
              </tr>

              <tr v-if="!summary.debt?.debtors || summary.debt?.debtors.length === 0">
                <td colspan="7" class="p-6 text-center text-slate-400">No overdue debtors at the moment 🎉</td>
              </tr>
            </tbody>
          </table>
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
import { ref, computed, onMounted } from 'vue';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Bar, Doughnut } from 'vue-chartjs';
import { Chart as ChartJS, Title, Tooltip, Legend, BarElement, ArcElement, CategoryScale, LinearScale } from 'chart.js';
import { useDashboardStore } from '@/stores/useDashboardStore';

ChartJS.register(Title, Tooltip, Legend, BarElement, ArcElement, CategoryScale, LinearScale);

const dashboardStore = useDashboardStore();
const selectedCycle = ref('');
const showRemindModal = ref(false);
const reminding = ref(false);

const summary = computed(() => dashboardStore.summary);
const revenueTrends = computed(() => dashboardStore.revenueTrends);

onMounted(() => {
  loadDashboardData();
});

const loadDashboardData = async () => {
  await dashboardStore.fetchSummary();
  await dashboardStore.fetchRevenueTrend();
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
    alert(res.message || 'Debt reminder notifications sent successfully!');
    showRemindModal.value = false;
  } catch (error) {
    alert(error.response?.data?.message || 'Failed to send debt reminders');
  } finally {
    reminding.value = false;
  }
};

// 6-Month Trend Chart Data
const trendChartData = computed(() => ({
  labels: revenueTrends.value.map((t) => t.cycle),
  datasets: [
    {
      label: 'Total Paid Revenue (บาท)',
      backgroundColor: '#8b5cf6',
      borderRadius: 8,
      data: revenueTrends.value.map((t) => t.totalRevenue)
    }
  ]
}));

const trendChartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { display: true, position: 'top' }
  }
};

// Category Revenue Breakdown Chart Data
const breakdownChartData = computed(() => ({
  labels: ['ค่าเช่าห้องพัก', 'ค่าน้ำประปา', 'ค่าไฟฟ้า', 'ค่าส่วนกลาง'],
  datasets: [
    {
      backgroundColor: ['#6366f1', '#06b6d4', '#eab308', '#10b981'],
      borderWidth: 0,
      data: [
        summary.value.financial?.breakdown?.roomPrice || 0,
        summary.value.financial?.breakdown?.waterTotal || 0,
        summary.value.financial?.breakdown?.electricTotal || 0,
        summary.value.financial?.breakdown?.commonFee || 0
      ]
    }
  ]
}));

const breakdownChartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { display: true, position: 'right' }
  }
};
</script>
