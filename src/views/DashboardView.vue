<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-bold text-slate-900 tracking-tight">Business Analytics Dashboard</h1>
        <p class="text-sm text-slate-500">Real-time overview of revenue, occupancy rate, and debt tracking</p>
      </div>

      <button
        @click="fetchSummaryData"
        class="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-sm font-semibold transition-all border border-slate-200"
      >
        Refresh Dashboard
      </button>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="p-12 text-center text-slate-500">
      <div class="animate-spin w-8 h-8 border-4 border-purple-600 border-t-transparent rounded-full mx-auto mb-3"></div>
      Loading business analytics...
    </div>

    <div v-else class="space-y-6">
      <!-- 1. KPI Summary Cards Section -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-5">
        <!-- Card 1: Revenue -->
        <Card class="bg-gradient-to-br from-white to-purple-50/40 border border-slate-200/80 shadow-xs">
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
              <span class="text-slate-400">vs last month ({{ summary.financial?.prevCycle }})</span>
            </div>
          </CardContent>
        </Card>

        <!-- Card 2: Total Debt -->
        <Card class="bg-gradient-to-br from-white to-rose-50/40 border border-slate-200/80 shadow-xs">
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
        <Card class="bg-gradient-to-br from-white to-indigo-50/40 border border-slate-200/80 shadow-xs">
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

      <!-- 2. Chart Section -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <!-- Revenue Breakdown Chart -->
        <div class="p-6 bg-white border border-slate-200 rounded-2xl shadow-xs space-y-4">
          <div class="flex items-center justify-between">
            <h3 class="font-semibold text-slate-900">Revenue Breakdown ({{ summary.financial?.currentCycle }})</h3>
          </div>

          <div class="h-64 flex items-center justify-center">
            <Bar :data="chartData" :options="chartOptions" />
          </div>
        </div>

        <!-- Occupancy Distribution -->
        <div class="p-6 bg-white border border-slate-200 rounded-2xl shadow-xs space-y-4">
          <h3 class="font-semibold text-slate-900">Room Status Distribution</h3>

          <div class="space-y-3 pt-2">
            <div>
              <div class="flex justify-between text-xs font-semibold mb-1">
                <span class="text-indigo-700">Occupied Rooms (มีผู้เช่า)</span>
                <span>{{ summary.occupancy?.occupiedRooms }} Rooms</span>
              </div>
              <div class="w-full bg-slate-100 h-3 rounded-full overflow-hidden">
                <div class="bg-indigo-600 h-full" :style="{ width: `${summary.occupancy?.occupancyRate}%` }"></div>
              </div>
            </div>

            <div>
              <div class="flex justify-between text-xs font-semibold mb-1">
                <span class="text-emerald-700">Available Rooms (ห้องว่าง)</span>
                <span>{{ summary.occupancy?.availableRooms }} Rooms</span>
              </div>
              <div class="w-full bg-slate-100 h-3 rounded-full overflow-hidden">
                <div
                  class="bg-emerald-500 h-full"
                  :style="{ width: `${(summary.occupancy?.availableRooms / summary.occupancy?.totalRooms) * 100}%` }"
                ></div>
              </div>
            </div>

            <div>
              <div class="flex justify-between text-xs font-semibold mb-1">
                <span class="text-amber-700">Maintenance Rooms (ซ่อมบำรุง)</span>
                <span>{{ summary.occupancy?.maintenanceRooms }} Rooms</span>
              </div>
              <div class="w-full bg-slate-100 h-3 rounded-full overflow-hidden">
                <div
                  class="bg-amber-500 h-full"
                  :style="{ width: `${(summary.occupancy?.maintenanceRooms / summary.occupancy?.totalRooms) * 100}%` }"
                ></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 3. Debt Tracking & Automated LINE Reminder Section -->
      <div class="bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden">
        <div class="p-5 border-b border-slate-200 flex items-center justify-between">
          <div>
            <h3 class="font-bold text-slate-900 text-base">Overdue Debtors (รายการลูกหนี้ค้างชำระ)</h3>
            <p class="text-xs text-slate-500">List of unpaid invoices awaiting payment</p>
          </div>

          <button
            @click="showRemindModal = true"
            :disabled="summary.debt?.debtors?.length === 0"
            class="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold transition-all shadow-sm shadow-rose-600/20 disabled:opacity-50 flex items-center gap-1.5"
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
                  {{ new Date(inv.dueDate).toLocaleDateString('th-TH') }}
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
import { Bar } from 'vue-chartjs';
import { Chart as ChartJS, Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale } from 'chart.js';
import api from '@/utils/api';

ChartJS.register(Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale);

const loading = ref(true);
const reminding = ref(false);
const showRemindModal = ref(false);
const summary = ref({
  occupancy: {},
  financial: { breakdown: {} },
  debt: { debtors: [] }
});

onMounted(() => {
  fetchSummaryData();
});

const fetchSummaryData = async () => {
  loading.value = true;
  try {
    const res = await api.get('/api/v1/dashboard/summary');
    summary.value = res.data.data;
  } catch (error) {
    console.error('Failed to fetch dashboard summary:', error);
  } finally {
    loading.value = false;
  }
};

const chartData = computed(() => ({
  labels: ['ค่าเช่าห้องพัก', 'ค่าน้ำประปา', 'ค่าไฟฟ้า', 'ค่าส่วนกลาง'],
  datasets: [
    {
      label: 'รายรับตามหมวดหมู่ (บาท)',
      backgroundColor: ['#6366f1', '#06b6d4', '#eab308', '#10b981'],
      borderRadius: 12,
      data: [
        summary.value.financial?.breakdown?.roomPrice || 0,
        summary.value.financial?.breakdown?.waterTotal || 0,
        summary.value.financial?.breakdown?.electricTotal || 0,
        summary.value.financial?.breakdown?.commonFee || 0
      ]
    }
  ]
}));

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { display: false }
  }
};

const handleRemindDebtors = async () => {
  reminding.value = true;
  try {
    const res = await api.post('/api/v1/dashboard/remind-debtors');
    alert(res.data.message);
    showRemindModal.value = false;
    fetchSummaryData();
  } catch (error) {
    alert(error.response?.data?.message || 'Failed to send debt reminders');
  } finally {
    reminding.value = false;
  }
};
</script>
