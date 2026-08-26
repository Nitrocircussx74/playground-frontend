<template>
  <div class="space-y-6">
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-bold text-slate-100">Invoice Management</h1>
        <p class="text-sm text-slate-400">Generate monthly invoices and verify tenant payment slips</p>
      </div>
    </div>

    <!-- Generator Box -->
    <div class="p-6 bg-slate-900/60 border border-slate-800 rounded-2xl shadow-sm space-y-4">
      <h2 class="text-lg font-semibold text-slate-200">Generate Monthly Invoice</h2>

      <form @submit.prevent="handleGenerate" class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label class="block text-xs font-medium text-slate-400 mb-1">Select Room</label>
          <select
            v-model="genForm.roomId"
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
          <label class="block text-xs font-medium text-slate-400 mb-1">Billing Cycle</label>
          <input
            v-model="genForm.billingCycle"
            type="text"
            placeholder="08-2026"
            required
            class="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-indigo-500"
          />
        </div>

        <div class="flex items-end">
          <button
            type="submit"
            :disabled="invoiceStore.isLoading"
            class="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-sm font-medium transition-all shadow-sm disabled:opacity-50"
          >
            {{ invoiceStore.isLoading ? 'Generating...' : 'Generate Invoice' }}
          </button>
        </div>
      </form>
    </div>

    <!-- Invoices Table -->
    <div class="bg-slate-900/60 border border-slate-800 rounded-2xl shadow-sm overflow-hidden">
      <div class="p-4 border-b border-slate-800 flex items-center justify-between">
        <h3 class="font-semibold text-slate-200">All Invoices</h3>
        <button @click="invoiceStore.fetchInvoices()" class="text-xs text-indigo-400 hover:underline">Refresh</button>
      </div>

      <div class="overflow-x-auto">
        <table class="w-full text-left text-sm text-slate-300">
          <thead class="bg-slate-800/50 text-xs text-slate-400 uppercase tracking-wider">
            <tr>
              <th class="p-3.5">Invoice #</th>
              <th class="p-3.5">Room</th>
              <th class="p-3.5">Tenant</th>
              <th class="p-3.5">Cycle</th>
              <th class="p-3.5">Rent</th>
              <th class="p-3.5">Water</th>
              <th class="p-3.5">Electric</th>
              <th class="p-3.5">Total</th>
              <th class="p-3.5">Status</th>
              <th class="p-3.5 text-right">Actions</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-800">
            <tr v-for="inv in invoiceStore.invoices" :key="inv.id" class="hover:bg-slate-800/30">
              <td class="p-3.5 font-mono text-xs font-semibold text-indigo-300">{{ inv.invoiceNumber }}</td>
              <td class="p-3.5 font-medium text-slate-100">Room {{ inv.room?.roomNumber }}</td>
              <td class="p-3.5 text-xs text-slate-300">
                {{ inv.tenant ? `${inv.tenant.firstName} ${inv.tenant.lastName}` : 'N/A' }}
              </td>
              <td class="p-3.5 font-mono text-xs">{{ inv.billingCycle }}</td>
              <td class="p-3.5 font-mono text-xs">฿{{ inv.roomPrice }}</td>
              <td class="p-3.5 font-mono text-xs">฿{{ inv.waterTotal }}</td>
              <td class="p-3.5 font-mono text-xs">฿{{ inv.electricTotal }}</td>
              <td class="p-3.5 font-mono font-bold text-emerald-400 text-sm">฿{{ Number(inv.grandTotal).toLocaleString() }}</td>
              <td class="p-3.5">
                <span
                  class="text-xs font-semibold px-2.5 py-1 rounded-full border"
                  :class="{
                    'bg-emerald-500/10 border-emerald-500/30 text-emerald-400': inv.status === 'paid',
                    'bg-amber-500/10 border-amber-500/30 text-amber-400': inv.status === 'pending',
                    'bg-red-500/10 border-red-500/30 text-red-400': inv.status === 'overdue'
                  }"
                >
                  {{ inv.status.toUpperCase() }}
                </span>
              </td>
              <td class="p-3.5 text-right space-x-2">
                <button
                  v-if="inv.status !== 'paid'"
                  @click="handleApprove(inv.id)"
                  class="px-2.5 py-1 bg-emerald-600/80 hover:bg-emerald-600 text-white rounded-lg text-xs font-medium"
                >
                  Approve Paid
                </button>
              </td>
            </tr>
            <tr v-if="invoiceStore.invoices.length === 0">
              <td colspan="10" class="p-6 text-center text-slate-500">No invoices generated yet</td>
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
import { useInvoiceStore } from '@/stores/useInvoiceStore';

const roomStore = useRoomStore();
const invoiceStore = useInvoiceStore();

const genForm = reactive({
  roomId: '',
  billingCycle: '08-2026'
});

onMounted(() => {
  roomStore.fetchRooms();
  invoiceStore.fetchInvoices();
});

const handleGenerate = async () => {
  try {
    await invoiceStore.generateInvoice({ ...genForm });
    alert('Invoice generated successfully!');
  } catch (error) {
    alert(error.response?.data?.message || 'Error generating invoice');
  }
};

const handleApprove = async (invoiceId) => {
  if (!confirm('Approve payment for this invoice?')) return;
  try {
    await invoiceStore.updateStatus(invoiceId, 'paid');
    alert('Invoice marked as PAID!');
  } catch (error) {
    alert(error.response?.data?.message || 'Failed to update status');
  }
};
</script>
