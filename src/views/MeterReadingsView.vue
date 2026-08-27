<template>
  <div class="space-y-6">
    <!-- View Navigation Tabs Header -->
    <div class="flex items-center justify-between border-b border-slate-200 pb-3">
      <div class="flex items-center gap-2">
        <button
          @click="activeTab = 'fast-table'"
          class="px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-2"
          :class="activeTab === 'fast-table' ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30' : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'"
        >
          <span>⚡</span>
          <span>ตารางคีย์มิเตอร์ (Fast Entry)</span>
        </button>

        <button
          @click="activeTab = 'draft-review'"
          class="px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-2"
          :class="activeTab === 'draft-review' ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30' : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'"
        >
          <span>📝</span>
          <span>ตรวจทานบิล Draft (Review & Publish)</span>
        </button>

        <button
          @click="activeTab = 'single-history'"
          class="px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-2"
          :class="activeTab === 'single-history' ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30' : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'"
        >
          <span>📜</span>
          <span>ประวัติการจดมิเตอร์</span>
        </button>
      </div>
    </div>

    <!-- Tab 1: Fast Entry Table (MeterReadingTable.vue) -->
    <div v-if="activeTab === 'fast-table'">
      <MeterReadingTable :onSuccess="handleMeterSuccess" />
    </div>

    <!-- Tab 2: Draft Invoice Review (InvoiceReview.vue) -->
    <div v-else-if="activeTab === 'draft-review'">
      <InvoiceReview />
    </div>

    <!-- Tab 3: Single Entry & History Logs -->
    <div v-else-if="activeTab === 'single-history'" class="space-y-6">
      <!-- Form for Recording Single Meter -->
      <div class="p-6 bg-white border border-slate-200 rounded-2xl shadow-xs space-y-4">
        <h2 class="text-lg font-semibold text-slate-900">บันทึกมิเตอร์รายห้อง (Single Meter Entry)</h2>

        <form @submit.prevent="handleSubmit" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label class="block text-xs font-semibold text-slate-700 mb-1">Select Room</label>
            <select
              v-model="form.roomId"
              required
              class="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
            >
              <option value="" disabled>-- Select Room --</option>
              <option v-for="room in roomStore.rooms" :key="room.id" :value="room.id">
                Room {{ room.roomNumber }} ({{ room.status }})
              </option>
            </select>
          </div>

          <div>
            <label class="block text-xs font-semibold text-slate-700 mb-1">Meter Type</label>
            <select
              v-model="form.meterType"
              required
              class="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
            >
              <option value="water">Water (น้ำ)</option>
              <option value="electric">Electric (ไฟ)</option>
            </select>
          </div>

          <div>
            <label class="block text-xs font-semibold text-slate-700 mb-1">Billing Cycle</label>
            <input
              v-model="form.billingCycle"
              type="text"
              placeholder="08-2026"
              required
              class="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
            />
          </div>

          <div>
            <label class="block text-xs font-semibold text-slate-700 mb-1">Current Reading</label>
            <input
              v-model.number="form.currentReading"
              type="number"
              step="0.01"
              placeholder="e.g. 135"
              required
              class="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
            />
          </div>

          <div class="col-span-full flex items-center justify-between pt-2">
            <label class="flex items-center space-x-2 text-xs text-slate-600 cursor-pointer">
              <input v-model="form.isReset" type="checkbox" class="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500" />
              <span>Meter has been reset (มิเตอร์วนรอบกลับมา 0)</span>
            </label>

            <button
              type="submit"
              :disabled="meterStore.isLoading"
              class="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-semibold transition-all shadow-sm shadow-indigo-600/20 disabled:opacity-50"
            >
              {{ meterStore.isLoading ? 'Saving...' : 'Save Meter Reading' }}
            </button>
          </div>
        </form>
      </div>

      <!-- Meter Records Table -->
      <div class="bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden">
        <div class="p-4 border-b border-slate-200 flex items-center justify-between">
          <h3 class="font-semibold text-slate-900">Recent Meter Records</h3>
          <button @click="meterStore.fetchMeterRecords(buildingStore.activeBuildingId)" class="text-xs text-indigo-600 hover:underline font-semibold">Refresh</button>
        </div>

        <div class="overflow-x-auto">
          <table class="w-full text-left text-sm text-slate-700">
            <thead class="bg-slate-50 text-xs text-slate-500 uppercase tracking-wider border-b border-slate-200">
              <tr>
                <th class="p-3.5">Room</th>
                <th class="p-3.5">Meter Type</th>
                <th class="p-3.5">Cycle</th>
                <th class="p-3.5">Prev Reading</th>
                <th class="p-3.5">Current Reading</th>
                <th class="p-3.5">Units Used</th>
                <th class="p-3.5">Date Recorded</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100">
              <tr v-for="record in meterStore.meterRecords" :key="record.id" class="hover:bg-slate-50/60">
                <td class="p-3.5 font-semibold text-slate-900">Room {{ record.room?.roomNumber }}</td>
                <td class="p-3.5 capitalize font-medium">
                  <span :class="record.meterType === 'water' ? 'text-cyan-700' : 'text-amber-700'">
                    {{ record.meterType }}
                  </span>
                </td>
                <td class="p-3.5 font-mono text-xs text-slate-600">{{ record.billingCycle }}</td>
                <td class="p-3.5 font-mono text-slate-600">{{ record.previousReading }}</td>
                <td class="p-3.5 font-mono font-semibold text-slate-900">{{ record.currentReading }}</td>
                <td class="p-3.5 font-mono font-bold text-emerald-600">+{{ record.unitsUsed }}</td>
                <td class="p-3.5 text-xs text-slate-500">{{ new Date(record.recordedAt).toLocaleDateString() }}</td>
              </tr>
              <tr v-if="meterStore.meterRecords.length === 0">
                <td colspan="7" class="p-6 text-center text-slate-400">No meter records found</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, watch } from 'vue';
import { useRoomStore } from '@/stores/useRoomStore';
import { useMeterStore } from '@/stores/useMeterStore';
import { useBuildingStore } from '@/stores/useBuildingStore';
import MeterReadingTable from '@/components/meter/MeterReadingTable.vue';
import InvoiceReview from '@/components/invoice/InvoiceReview.vue';

const activeTab = ref('fast-table');
const roomStore = useRoomStore();
const meterStore = useMeterStore();
const buildingStore = useBuildingStore();

const form = reactive({
  roomId: '',
  meterType: 'water',
  billingCycle: '08-2026',
  currentReading: '',
  isReset: false
});

const loadData = () => {
  const bId = buildingStore.activeBuildingId;
  roomStore.fetchRooms(bId);
  meterStore.fetchMeterRecords(bId);
};

onMounted(() => {
  loadData();
});

watch(
  () => buildingStore.activeBuildingId,
  () => {
    loadData();
  }
);

const handleMeterSuccess = () => {
  activeTab.value = 'draft-review';
};

const handleSubmit = async () => {
  try {
    await meterStore.recordMeter({ ...form });
    form.currentReading = '';
    alert('Meter reading saved successfully!');
    loadData();
  } catch (error) {
    alert(error.response?.data?.message || 'Error saving meter reading');
  }
};
</script>
