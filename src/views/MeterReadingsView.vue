<template>
  <div class="space-y-6">
    <div>
      <h1 class="text-2xl font-bold text-slate-100">Meter Readings Record</h1>
      <p class="text-sm text-slate-400">Record monthly water and electricity consumption for rooms</p>
    </div>

    <!-- Form for Recording Meter -->
    <div class="p-6 bg-slate-900/60 border border-slate-800 rounded-2xl shadow-sm space-y-4">
      <h2 class="text-lg font-semibold text-slate-200">New Meter Entry</h2>

      <form @submit.prevent="handleSubmit" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div>
          <label class="block text-xs font-medium text-slate-400 mb-1">Select Room</label>
          <select
            v-model="form.roomId"
            required
            class="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-indigo-500"
          >
            <option value="" disabled>-- Select Room --</option>
            <option v-for="room in roomStore.rooms" :key="room.id" :value="room.id">
              Room {{ room.roomNumber }} ({{ room.status }})
            </option>
          </select>
        </div>

        <div>
          <label class="block text-xs font-medium text-slate-400 mb-1">Meter Type</label>
          <select
            v-model="form.meterType"
            required
            class="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-indigo-500"
          >
            <option value="water">Water (น้ำ)</option>
            <option value="electric">Electric (ไฟ)</option>
          </select>
        </div>

        <div>
          <label class="block text-xs font-medium text-slate-400 mb-1">Billing Cycle</label>
          <input
            v-model="form.billingCycle"
            type="text"
            placeholder="08-2026"
            required
            class="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-indigo-500"
          />
        </div>

        <div>
          <label class="block text-xs font-medium text-slate-400 mb-1">Current Reading</label>
          <input
            v-model.number="form.currentReading"
            type="number"
            step="0.01"
            placeholder="e.g. 135"
            required
            class="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-indigo-500"
          />
        </div>

        <div class="col-span-full flex items-center justify-between pt-2">
          <label class="flex items-center space-x-2 text-xs text-slate-400 cursor-pointer">
            <input v-model="form.isReset" type="checkbox" class="rounded bg-slate-800 border-slate-700 text-indigo-600 focus:ring-0" />
            <span>Meter has been reset (มิเตอร์วนรอบกลับมา 0)</span>
          </label>

          <button
            type="submit"
            :disabled="meterStore.isLoading"
            class="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-sm font-medium transition-all shadow-sm disabled:opacity-50"
          >
            {{ meterStore.isLoading ? 'Saving...' : 'Save Meter Reading' }}
          </button>
        </div>
      </form>
    </div>

    <!-- Meter Records Table -->
    <div class="bg-slate-900/60 border border-slate-800 rounded-2xl shadow-sm overflow-hidden">
      <div class="p-4 border-b border-slate-800 flex items-center justify-between">
        <h3 class="font-semibold text-slate-200">Recent Meter Records</h3>
        <button @click="meterStore.fetchMeterRecords()" class="text-xs text-indigo-400 hover:underline">Refresh</button>
      </div>

      <div class="overflow-x-auto">
        <table class="w-full text-left text-sm text-slate-300">
          <thead class="bg-slate-800/50 text-xs text-slate-400 uppercase tracking-wider">
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
          <tbody class="divide-y divide-slate-800">
            <tr v-for="record in meterStore.meterRecords" :key="record.id" class="hover:bg-slate-800/30">
              <td class="p-3.5 font-medium text-slate-100">Room {{ record.room?.roomNumber }}</td>
              <td class="p-3.5 capitalize">
                <span :class="record.meterType === 'water' ? 'text-cyan-400' : 'text-amber-400'">
                  {{ record.meterType }}
                </span>
              </td>
              <td class="p-3.5 font-mono text-xs">{{ record.billingCycle }}</td>
              <td class="p-3.5 font-mono">{{ record.previousReading }}</td>
              <td class="p-3.5 font-mono font-semibold text-white">{{ record.currentReading }}</td>
              <td class="p-3.5 font-mono font-bold text-emerald-400">+{{ record.unitsUsed }}</td>
              <td class="p-3.5 text-xs text-slate-400">{{ new Date(record.recordedAt).toLocaleDateString() }}</td>
            </tr>
            <tr v-if="meterStore.meterRecords.length === 0">
              <td colspan="7" class="p-6 text-center text-slate-500">No meter records found</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup>
import { reactive, onMounted } from 'vue';
import { useRoomStore } from '@/stores/useRoomStore';
import { useMeterStore } from '@/stores/useMeterStore';

const roomStore = useRoomStore();
const meterStore = useMeterStore();

const form = reactive({
  roomId: '',
  meterType: 'water',
  billingCycle: '08-2026',
  currentReading: '',
  isReset: false
});

onMounted(() => {
  roomStore.fetchRooms();
  meterStore.fetchMeterRecords();
});

const handleSubmit = async () => {
  try {
    await meterStore.recordMeter({ ...form });
    form.currentReading = '';
    alert('Meter reading saved successfully!');
  } catch (error) {
    alert(error.response?.data?.message || 'Error saving meter reading');
  }
};
</script>
