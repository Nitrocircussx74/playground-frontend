<template>
  <div class="space-y-6">
    <!-- View Navigation Tabs Header -->
    <div class="flex items-center justify-between border-b border-slate-200 pb-3">
      <div class="flex items-center gap-2">
        <button
          @click="activeTab = 'all-invoices'"
          class="px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-2"
          :class="activeTab === 'all-invoices' ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30' : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'"
        >
          <span>🧾</span>
          <span>ใบแจ้งหนี้ทั้งหมด (All Invoices)</span>
        </button>

        <button
          @click="activeTab = 'draft-review'"
          class="px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-2"
          :class="activeTab === 'draft-review' ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30' : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'"
        >
          <span>📝</span>
          <span>ตรวจทานบิล Draft (Review & Publish)</span>
        </button>
      </div>

      <button
        v-if="activeTab === 'all-invoices'"
        @click="openCreateModal"
        class="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs sm:text-sm font-semibold transition-all shadow-sm shadow-indigo-600/20 flex items-center gap-1.5"
      >
        <span>+ ออกบิลปรับแต่ง (Custom Invoice)</span>
      </button>
    </div>

    <!-- Tab 2: Draft Invoice Review (InvoiceReview.vue) -->
    <div v-if="activeTab === 'draft-review'">
      <InvoiceReview />
    </div>

    <!-- Tab 1: Invoices Table -->
    <div v-else class="space-y-6">
    <div class="bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden">
      <div class="p-4 border-b border-slate-200 flex items-center justify-between">
        <h3 class="font-semibold text-slate-900">All Invoices</h3>
        <button @click="invoiceStore.fetchInvoices()" class="text-xs text-indigo-600 hover:underline font-semibold">Refresh</button>
      </div>

      <div class="overflow-x-auto">
        <table class="w-full text-left text-sm text-slate-700">
          <thead class="bg-slate-50 text-xs text-slate-500 uppercase tracking-wider border-b border-slate-200">
            <tr>
              <th class="p-3.5">Invoice #</th>
              <th class="p-3.5">Room</th>
              <th class="p-3.5">Tenant</th>
              <th class="p-3.5">Cycle</th>
              <th class="p-3.5">Rent</th>
              <th class="p-3.5">Water</th>
              <th class="p-3.5">Electric</th>
              <th class="p-3.5">Common Fee</th>
              <th class="p-3.5">Other Fee</th>
              <th class="p-3.5">Total</th>
              <th class="p-3.5">Slip</th>
              <th class="p-3.5">Status</th>
              <th class="p-3.5 text-right">Actions</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100">
            <tr v-for="inv in invoiceStore.invoices" :key="inv.id" class="hover:bg-slate-50/60">
              <td class="p-3.5 font-mono text-xs font-semibold text-indigo-700">{{ inv.invoiceNumber }}</td>
              <td class="p-3.5 font-semibold text-slate-900">Room {{ inv.room?.roomNumber }}</td>
              <td class="p-3.5 text-xs text-slate-600 font-medium">
                {{ inv.tenant ? `${inv.tenant.firstName} ${inv.tenant.lastName}` : 'N/A' }}
              </td>
              <td class="p-3.5 font-mono text-xs text-slate-600">{{ inv.billingCycle }}</td>
              <td class="p-3.5 font-mono text-xs">฿{{ inv.roomPrice }}</td>
              <td class="p-3.5 font-mono text-xs">฿{{ inv.waterTotal }}</td>
              <td class="p-3.5 font-mono text-xs">฿{{ inv.electricTotal }}</td>
              <td class="p-3.5 font-mono text-xs">
                <span v-if="Number(inv.commonFee) === 0" class="text-emerald-600 font-semibold px-2 py-0.5 bg-emerald-50 rounded-md">
                  ฿0 (ฟรี/ละเว้น)
                </span>
                <span v-else>฿{{ inv.commonFee }}</span>
              </td>
              <td class="p-3.5 text-xs">
                <div v-if="Number(inv.otherFee) > 0">
                  <span class="font-mono font-semibold text-indigo-700">฿{{ inv.otherFee }}</span>
                  <div v-if="inv.otherFeeNote" class="text-[10px] text-slate-400 truncate max-w-28">{{ inv.otherFeeNote }}</div>
                </div>
                <span v-else class="text-slate-300">-</span>
              </td>
              <td class="p-3.5 font-mono font-bold text-emerald-700 text-sm">฿{{ Number(inv.grandTotal).toLocaleString() }}</td>
              <td class="p-3.5">
                <div v-if="inv.slipUrl" class="flex items-center gap-1.5">
                  <a :href="inv.slipUrl" target="_blank" class="text-xs text-indigo-600 font-semibold hover:underline">View Slip</a>
                </div>
                <div v-else-if="inv.status !== 'paid'" class="flex items-center">
                  <label class="cursor-pointer text-xs text-slate-500 hover:text-indigo-600 font-medium">
                    <span>+ Upload Slip</span>
                    <input type="file" class="hidden" accept="image/*" @change="(e) => handleUploadSlip(inv.id, e)" />
                  </label>
                </div>
                <span v-else class="text-xs text-slate-400">-</span>
              </td>
              <td class="p-3.5">
                <span
                  class="text-xs font-semibold px-2.5 py-1 rounded-full border"
                  :class="{
                    'bg-emerald-50 border-emerald-300 text-emerald-800': inv.status === 'paid',
                    'bg-amber-50 border-amber-300 text-amber-800': inv.status === 'pending',
                    'bg-blue-50 border-blue-300 text-blue-800': inv.status === 'reviewing',
                    'bg-rose-50 border-rose-300 text-rose-800': inv.status === 'overdue'
                  }"
                >
                  {{ inv.status.toUpperCase() }}
                </span>
              </td>
              <td class="p-3.5 text-right space-x-2">
                <!-- Edit Invoice Button -->
                <button
                  v-if="inv.status !== 'paid'"
                  @click="openEditModal(inv)"
                  class="px-2.5 py-1 bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 rounded-lg text-xs font-semibold shadow-2xs"
                >
                  ✏️ แก้ไขบิล
                </button>

                <!-- PDF Export Button -->
                <button
                  @click="invoiceStore.exportPdf(inv.id, inv.invoiceNumber)"
                  class="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300 rounded-lg text-xs font-semibold shadow-2xs"
                >
                  📄 PDF
                </button>

                <button
                  v-if="inv.status !== 'paid'"
                  @click="handleApprove(inv.id)"
                  class="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-medium shadow-2xs"
                >
                  Approve
                </button>
              </td>
            </tr>
            <tr v-if="invoiceStore.invoices.length === 0">
              <td colspan="13" class="p-6 text-center text-slate-400">No invoices generated yet</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Edit / Create Custom Invoice Modal -->
    <EditInvoiceModal
      :show="showEditModal"
      :invoice="selectedInvoice"
      :rooms="roomStore.rooms"
      @close="showEditModal = false"
      @saved="invoiceStore.fetchInvoices()"
    />
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue';
import { useRoomStore } from '@/stores/useRoomStore';
import { useInvoiceStore } from '@/stores/useInvoiceStore';
import { useBuildingStore } from '@/stores/useBuildingStore';
import uploadService from '@/services/uploadService';
import EditInvoiceModal from '@/components/EditInvoiceModal.vue';
import InvoiceReview from '@/components/invoice/InvoiceReview.vue';

const activeTab = ref('all-invoices');
const roomStore = useRoomStore();
const invoiceStore = useInvoiceStore();
const buildingStore = useBuildingStore();

const showEditModal = ref(false);
const selectedInvoice = ref(null);

const loadData = (buildingId) => {
  roomStore.fetchRooms(buildingId);
  invoiceStore.fetchInvoices({ buildingId });
};

onMounted(() => {
  loadData(buildingStore.activeBuildingId);
});

watch(
  () => buildingStore.activeBuildingId,
  (newBuildingId) => {
    loadData(newBuildingId);
  }
);

const openCreateModal = () => {
  selectedInvoice.value = null;
  showEditModal.value = true;
};

const openEditModal = (inv) => {
  selectedInvoice.value = inv;
  showEditModal.value = true;
};

const handleUploadSlip = async (invoiceId, event) => {
  const file = event.target.files[0];
  if (!file) return;

  try {
    const uploadRes = await uploadService.uploadFile(file);
    await invoiceStore.uploadSlip(invoiceId, uploadRes.data.url);
    alert('Slip uploaded successfully!');
  } catch (error) {
    alert(error.response?.data?.message || 'Failed to upload slip');
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
