<template>
  <div class="space-y-6">
    <!-- View Navigation Tabs Header -->
    <div class="flex items-center justify-between border-b border-slate-200 pb-3 no-print">
      <div class="flex items-center gap-2">
        <button
          @click="activeTab = 'all-invoices'"
          class="px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-2 cursor-pointer"
          :class="activeTab === 'all-invoices' ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30' : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'"
        >
          <span>🧾</span>
          <span>ใบแจ้งหนี้ทั้งหมด (All Invoices)</span>
        </button>

        <button
          @click="activeTab = 'draft-review'"
          class="px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-2 cursor-pointer"
          :class="activeTab === 'draft-review' ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30' : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'"
        >
          <span>📝</span>
          <span>ตรวจทานบิล Draft (Review & Publish)</span>
        </button>
      </div>

      <button
        v-if="activeTab === 'all-invoices'"
        @click="openCreateModal"
        class="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs sm:text-sm font-semibold transition-all shadow-sm shadow-indigo-600/20 flex items-center gap-1.5 cursor-pointer"
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
        <div class="p-4 border-b border-slate-200 flex items-center justify-between no-print">
          <h3 class="font-bold text-slate-900 text-sm">All Invoices & Payments</h3>
          <button @click="invoiceStore.fetchInvoices()" class="text-xs text-indigo-600 hover:underline font-semibold cursor-pointer">🔄 Refresh</button>
        </div>

        <div class="overflow-x-auto">
          <table class="w-full text-left text-sm text-slate-700">
            <thead class="bg-slate-50 text-xs text-slate-500 uppercase tracking-wider border-b border-slate-200 font-bold">
              <tr>
                <th class="p-3.5">Invoice #</th>
                <th class="p-3.5">Room</th>
                <th class="p-3.5">Tenant</th>
                <th class="p-3.5">Cycle</th>
                <th class="p-3.5">Rent</th>
                <th class="p-3.5">Water</th>
                <th class="p-3.5">Electric</th>
                <th class="p-3.5">Common</th>
                <th class="p-3.5">Other</th>
                <th class="p-3.5">Total</th>
                <th class="p-3.5">Slip</th>
                <th class="p-3.5">Status</th>
                <th class="p-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100">
              <tr v-for="inv in invoiceStore.invoices" :key="inv.id" class="hover:bg-slate-50/60 transition-colors">
                <td class="p-3.5 font-mono text-xs font-bold text-purple-700">{{ inv.invoiceNumber }}</td>
                <td class="p-3.5 font-bold text-slate-900">ห้อง {{ inv.room?.roomNumber }}</td>
                <td class="p-3.5 text-xs text-slate-600 font-medium">
                  {{ inv.tenant ? `${inv.tenant.firstName} ${inv.tenant.lastName}` : 'N/A' }}
                </td>
                <td class="p-3.5 font-mono text-xs text-slate-600">{{ inv.billingCycle }}</td>
                <td class="p-3.5 font-mono text-xs">฿{{ Number(inv.roomPrice).toLocaleString() }}</td>
                <td class="p-3.5 font-mono text-xs">฿{{ Number(inv.waterTotal).toLocaleString() }}</td>
                <td class="p-3.5 font-mono text-xs">฿{{ Number(inv.electricTotal).toLocaleString() }}</td>
                <td class="p-3.5 font-mono text-xs">
                  <span v-if="Number(inv.commonFee) === 0" class="text-emerald-600 font-semibold px-2 py-0.5 bg-emerald-50 rounded-md text-[11px]">
                    ฿0 (ฟรี)
                  </span>
                  <span v-else>฿{{ Number(inv.commonFee).toLocaleString() }}</span>
                </td>
                <td class="p-3.5 text-xs">
                  <div v-if="Number(inv.otherFee) > 0">
                    <span class="font-mono font-semibold text-indigo-700">฿{{ Number(inv.otherFee).toLocaleString() }}</span>
                    <div v-if="inv.otherFeeNote" class="text-[10px] text-slate-400 truncate max-w-28">{{ inv.otherFeeNote }}</div>
                  </div>
                  <span v-else class="text-slate-300">-</span>
                </td>
                <td class="p-3.5 font-mono font-black text-emerald-700 text-sm">฿{{ Number(inv.grandTotal).toLocaleString() }}</td>
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
                    class="text-[11px] font-extrabold px-2.5 py-1 rounded-full border shadow-2xs inline-flex items-center gap-1"
                    :class="{
                      'bg-emerald-100 border-emerald-300 text-emerald-800': inv.status === 'paid',
                      'bg-amber-100 border-amber-300 text-amber-800': inv.status === 'pending',
                      'bg-blue-100 border-blue-300 text-blue-800': inv.status === 'reviewing',
                      'bg-rose-100 border-rose-300 text-rose-800': inv.status === 'overdue'
                    }"
                  >
                    <span>{{ inv.status === 'paid' ? '✅' : '⏳' }}</span>
                    <span>{{ inv.status.toUpperCase() }}</span>
                  </span>
                </td>
                <td class="p-3.5 text-right space-x-1.5">
                  <!-- Manual Record Payment Button (For Non-Paid Invoices) -->
                  <button
                    v-if="inv.status !== 'paid'"
                    @click="openPaymentModal(inv)"
                    class="px-2.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer"
                  >
                    💵 รับเงินสด
                  </button>

                  <!-- Print Invoice / Receipt Button -->
                  <button
                    @click="openPrintModal(inv)"
                    class="px-2.5 py-1.5 bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200 rounded-xl text-xs font-bold transition-all shadow-2xs cursor-pointer"
                  >
                    🖨️ พิมพ์บิล
                  </button>

                  <!-- Edit Invoice Button -->
                  <button
                    v-if="inv.status !== 'paid'"
                    @click="openEditModal(inv)"
                    class="px-2.5 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 rounded-xl text-xs font-semibold shadow-2xs cursor-pointer"
                  >
                    ✏️ แก้ไข
                  </button>

                  <!-- PDF Export Button -->
                  <button
                    @click="invoiceStore.exportPdf(inv.id, inv.invoiceNumber)"
                    class="px-2 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300 rounded-xl text-xs font-semibold shadow-2xs cursor-pointer"
                  >
                    📄 PDF
                  </button>
                </td>
              </tr>
              <tr v-if="invoiceStore.invoices.length === 0">
                <td colspan="13" class="p-6 text-center text-slate-400">ยังไม่มีรายการใบแจ้งหนี้</td>
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

      <!-- 💵 Record Manual Payment Dialog Modal -->
      <div v-if="showPaymentModal" class="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 no-print">
        <div class="bg-white rounded-3xl border border-slate-200 shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-150">
          <div class="px-6 py-4 bg-gradient-to-r from-emerald-800 to-teal-800 text-white flex items-center justify-between">
            <div class="flex items-center gap-2">
              <span class="text-xl">💵</span>
              <h3 class="font-bold text-base text-white">บันทึกรับชำระเงิน (Record Payment)</h3>
            </div>
            <button @click="showPaymentModal = false" class="text-emerald-200 hover:text-white p-1 rounded-lg cursor-pointer">✕</button>
          </div>

          <form @submit.prevent="handleRecordPayment" class="p-6 space-y-4">
            <div class="bg-emerald-50 border border-emerald-200 p-4 rounded-2xl text-center space-y-1">
              <div class="text-xs font-bold text-emerald-800 uppercase tracking-wider">ยอดเงินที่ต้องรับชำระ (Total Payable)</div>
              <div class="text-3xl font-black text-emerald-700 font-mono">
                ฿{{ Number(payingInvoice?.grandTotal || 0).toLocaleString() }}
              </div>
              <div class="text-xs text-slate-600 font-medium">
                ห้อง {{ payingInvoice?.room?.roomNumber }} | รอบบิล {{ payingInvoice?.billingCycle }}
              </div>
            </div>

            <div>
              <label class="block text-xs font-bold text-slate-700 mb-1">ช่องทางการชำระเงิน (Payment Method)</label>
              <select
                v-model="paymentForm.paymentMethod"
                required
                class="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2 text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
              >
                <option value="CASH">💵 เงินสดผ่านเคาน์เตอร์ (Cash)</option>
                <option value="PROMPTPAY">📱 พร้อมเพย์ / สแกน QR (PromptPay)</option>
                <option value="BANK_TRANSFER">🏦 โอนเงินผ่านบัญชีธนาคาร (Bank Transfer)</option>
              </select>
            </div>

            <div>
              <label class="block text-xs font-bold text-slate-700 mb-1">หมายเหตุการชำระเงิน (Payment Note - Optional)</label>
              <input
                v-model="paymentForm.note"
                type="text"
                placeholder="เช่น รับเงินสดแบงก์ 5,000 บาท ทอน 200 บาท"
                class="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
              />
            </div>

            <div class="pt-3 flex gap-3">
              <button
                type="button"
                @click="showPaymentModal = false"
                class="w-1/2 py-2.5 border border-slate-300 text-slate-700 hover:bg-slate-100 rounded-xl text-xs font-bold transition-all cursor-pointer"
              >
                ยกเลิก
              </button>
              <button
                type="submit"
                :disabled="recordingPayment"
                class="w-1/2 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-emerald-600/20 disabled:opacity-50 cursor-pointer"
              >
                {{ recordingPayment ? 'กำลังบันทึก...' : '✅ บันทึกรับเงิน' }}
              </button>
            </div>
          </form>
        </div>
      </div>

      <!-- 🖨️ Printable Invoice/Receipt Teleport Modal -->
      <teleport to="body">
        <div v-if="showPrintModal" id="print-modal-root" class="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div class="bg-white rounded-3xl border border-slate-200 shadow-2xl w-full max-w-2xl overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-150">
            <!-- Print Toolbar Bar (Hidden during window.print) -->
            <div class="px-6 py-3 bg-slate-900 text-white flex items-center justify-between no-print">
              <div class="flex items-center gap-2">
                <span class="text-lg">🖨️</span>
                <span class="font-bold text-xs">พรีวิวใบแจ้งหนี้/ใบเสร็จ (Print Preview)</span>
              </div>

              <div class="flex items-center gap-2">
                <button
                  @click="triggerPrint"
                  class="px-4 py-1.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold transition-all shadow-sm flex items-center gap-1.5 cursor-pointer"
                >
                  <span>🖨️ สั่งพิมพ์ออกเครื่องพิมพ์ (Print)</span>
                </button>
                <button @click="showPrintModal = false" class="text-slate-400 hover:text-white p-1 rounded-lg cursor-pointer">✕</button>
              </div>
            </div>

            <!-- 📄 Print Content Paper Box -->
            <div id="printable-receipt" class="p-8 bg-white text-slate-900 font-sans space-y-6 relative border-t-4 border-purple-600">
              <!-- Watermark Stamp for PAID -->
              <div v-if="printingInvoice?.status === 'paid'" class="absolute top-20 right-8 pointer-events-none opacity-20 transform rotate-[-15deg] border-4 border-emerald-600 text-emerald-700 px-6 py-2 rounded-2xl font-black text-3xl uppercase tracking-widest text-center select-none">
                ชำระเงินแล้ว<br/><span class="text-lg font-bold">PAID OFFICIAL</span>
              </div>

              <!-- Document Header -->
              <div class="flex justify-between items-start border-b border-slate-200 pb-6">
                <div>
                  <div class="text-xl font-black tracking-tight text-purple-900 uppercase">
                    {{ printingInvoice?.room?.building?.name || 'หอพักสมาร์ทโดรม (Dormitory)' }}
                  </div>
                  <p class="text-xs text-slate-500 mt-1 font-semibold">ใบแจ้งหนี้ / ใบเสร็จรับเงิน (Invoice & Official Receipt)</p>
                  <div v-if="printingInvoice?.room?.building?.promptpayNumber" class="text-xs text-slate-600 mt-1 font-mono">
                    พร้อมเพย์: {{ printingInvoice.room.building.promptpayNumber }} ({{ printingInvoice.room.building.promptpayName }})
                  </div>
                </div>

                <div class="text-right">
                  <div class="text-[10px] font-bold text-slate-400 uppercase">เลขที่เอกสาร / No.</div>
                  <div class="text-base font-black font-mono text-purple-900">{{ printingInvoice?.invoiceNumber }}</div>
                  <div class="text-xs text-slate-500 font-mono mt-1">วันที่ออกบิล: {{ formatDate(printingInvoice?.createdAt) }}</div>
                </div>
              </div>

              <!-- Tenant & Room Info -->
              <div class="grid grid-cols-2 gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-200 text-xs">
                <div>
                  <div class="text-[10px] font-bold text-slate-400 uppercase">ข้อมูลผู้เช่า / Tenant Information</div>
                  <div class="font-bold text-slate-900 text-sm mt-0.5">
                    {{ printingInvoice?.tenant ? `${printingInvoice.tenant.firstName} ${printingInvoice.tenant.lastName}` : 'ผู้เช่าห้องพัก' }}
                  </div>
                  <div class="text-slate-600 mt-0.5">โทร: {{ printingInvoice?.tenant?.phone || '-' }}</div>
                </div>

                <div class="text-right">
                  <div class="text-[10px] font-bold text-slate-400 uppercase">ห้องพัก & รอบบิล / Room & Cycle</div>
                  <div class="font-extrabold text-slate-900 text-sm mt-0.5">ห้อง {{ printingInvoice?.room?.roomNumber }}</div>
                  <div class="text-purple-700 font-bold font-mono mt-0.5">ประจำรอบบิล: {{ printingInvoice?.billingCycle }}</div>
                </div>
              </div>

              <!-- Items Table -->
              <table class="w-full text-left text-xs border-collapse">
                <thead>
                  <tr class="bg-slate-100 text-slate-700 uppercase font-bold border-b border-slate-300">
                    <th class="p-3">รายการ (Description)</th>
                    <th class="p-3 text-right">จำนวนเงิน (Amount)</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-slate-200 text-slate-800 font-medium">
                  <tr>
                    <td class="p-3">ค่าเช่าห้องพักประจำเดือน (Monthly Room Rent)</td>
                    <td class="p-3 text-right font-mono font-semibold">฿{{ Number(printingInvoice?.roomPrice || 0).toLocaleString() }}</td>
                  </tr>
                  <tr>
                    <td class="p-3">ค่าน้ำประปา (Water Usage Fee)</td>
                    <td class="p-3 text-right font-mono font-semibold">฿{{ Number(printingInvoice?.waterTotal || 0).toLocaleString() }}</td>
                  </tr>
                  <tr>
                    <td class="p-3">ค่าไฟฟ้า (Electricity Usage Fee)</td>
                    <td class="p-3 text-right font-mono font-semibold">฿{{ Number(printingInvoice?.electricTotal || 0).toLocaleString() }}</td>
                  </tr>
                  <tr v-if="Number(printingInvoice?.commonFee) > 0">
                    <td class="p-3">ค่าส่วนกลาง (Common Maintenance Fee)</td>
                    <td class="p-3 text-right font-mono font-semibold">฿{{ Number(printingInvoice?.commonFee || 0).toLocaleString() }}</td>
                  </tr>
                  <tr v-if="Number(printingInvoice?.otherFee) > 0">
                    <td class="p-3">
                      ค่าบริการอื่นๆ (Other Charges)
                      <span v-if="printingInvoice?.otherFeeNote" class="text-slate-500 font-normal">({{ printingInvoice.otherFeeNote }})</span>
                    </td>
                    <td class="p-3 text-right font-mono font-semibold">฿{{ Number(printingInvoice?.otherFee || 0).toLocaleString() }}</td>
                  </tr>
                </tbody>
                <tfoot>
                  <tr class="border-t-2 border-slate-900 bg-slate-50 font-bold">
                    <td class="p-3 text-slate-900 text-sm">ยอดเงินสุทธิทั้งสิ้น (Grand Total)</td>
                    <td class="p-3 text-right font-mono text-base text-purple-900 font-black">
                      ฿{{ Number(printingInvoice?.grandTotal || 0).toLocaleString() }}
                    </td>
                  </tr>
                </tfoot>
              </table>

              <!-- Payment Status Footer -->
              <div class="pt-4 border-t border-slate-200 flex justify-between items-end text-xs">
                <div>
                  <div class="text-[10px] text-slate-400 font-bold uppercase mb-1">สถานะการชำระเงิน</div>
                  <div v-if="printingInvoice?.status === 'paid'" class="text-emerald-700 font-bold flex items-center gap-1.5">
                    <span>✅ ชำระเงินเรียบร้อยแล้ว</span>
                    <span class="px-2 py-0.5 bg-emerald-100 rounded-md text-[10px] font-extrabold uppercase font-mono border border-emerald-200">
                      {{ printingInvoice.paymentMethod || 'CASH' }}
                    </span>
                    <span v-if="printingInvoice.paidAt" class="text-slate-500 font-mono text-[10px]">({{ formatDate(printingInvoice.paidAt) }})</span>
                  </div>
                  <div v-else class="text-amber-700 font-bold flex items-center gap-1">
                    <span>⏳ รอชำระเงิน (กำหนดชำระ: {{ formatDate(printingInvoice?.dueDate) }})</span>
                  </div>
                  <div v-if="printingInvoice?.paymentNote" class="text-slate-500 italic mt-1 text-[11px]">
                    หมายเหตุ: {{ printingInvoice.paymentNote }}
                  </div>
                </div>

                <div class="text-center w-44 pt-4">
                  <div class="border-b border-dashed border-slate-400 mb-1"></div>
                  <div class="text-[10px] text-slate-500 font-semibold">ผู้รับเงิน / Authorized Signature</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </teleport>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, watch } from 'vue';
import { useRoomStore } from '@/stores/useRoomStore';
import { useInvoiceStore } from '@/stores/useInvoiceStore';
import { useBuildingStore } from '@/stores/useBuildingStore';
import uploadService from '@/services/uploadService';
import EditInvoiceModal from '@/components/EditInvoiceModal.vue';
import InvoiceReview from '@/components/invoice/InvoiceReview.vue';
import { showSuccess, showError, showConfirm } from '@/utils/swal';

const activeTab = ref('all-invoices');
const roomStore = useRoomStore();
const invoiceStore = useInvoiceStore();
const buildingStore = useBuildingStore();

const showEditModal = ref(false);
const selectedInvoice = ref(null);

const showPaymentModal = ref(false);
const payingInvoice = ref(null);
const recordingPayment = ref(false);

const showPrintModal = ref(false);
const printingInvoice = ref(null);

const paymentForm = reactive({
  paymentMethod: 'CASH',
  note: ''
});

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

const openPaymentModal = (inv) => {
  payingInvoice.value = inv;
  paymentForm.paymentMethod = 'CASH';
  paymentForm.note = '';
  showPaymentModal.value = true;
};

const openPrintModal = (inv) => {
  printingInvoice.value = inv;
  showPrintModal.value = true;
};

const triggerPrint = () => {
  window.print();
};

const handleRecordPayment = async () => {
  recordingPayment.value = true;
  try {
    const res = await invoiceStore.recordManualPayment(payingInvoice.value.id, {
      paymentMethod: paymentForm.paymentMethod,
      note: paymentForm.note
    });

    await showSuccess('สำเร็จ!', res.message || 'บันทึกรับชำระเงินเรียบร้อยแล้ว');
    showPaymentModal.value = false;
  } catch (err) {
    showError('เกิดข้อผิดพลาด', err.response?.data?.message || 'ไม่สามารถบันทึกรับชำระเงินได้');
  } finally {
    recordingPayment.value = false;
  }
};

const handleUploadSlip = async (invoiceId, event) => {
  const file = event.target.files[0];
  if (!file) return;

  try {
    const uploadRes = await uploadService.uploadFile(file);
    await invoiceStore.uploadSlip(invoiceId, uploadRes.data.url);
    await showSuccess('สำเร็จ!', 'อัปโหลดสลิปโอนเงินเรียบร้อยแล้ว');
  } catch (error) {
    showError('เกิดข้อผิดพลาด', error.response?.data?.message || 'Failed to upload slip');
  }
};

const formatDate = (dateStr) => {
  if (!dateStr) return '';
  return new Date(dateStr).toLocaleDateString('th-TH');
};
</script>

<style scoped>
@media print {
  body > *:not(#print-modal-root) {
    display: none !important;
  }

  #print-modal-root {
    position: absolute !important;
    left: 0 !important;
    top: 0 !important;
    width: 100% !important;
    height: auto !important;
    background: white !important;
    padding: 0 !important;
    margin: 0 !important;
    overflow: visible !important;
  }

  #print-modal-root > div {
    max-width: 100% !important;
    border: none !important;
    box-shadow: none !important;
    margin: 0 !important;
    border-radius: 0 !important;
  }

  #printable-receipt {
    padding: 20px !important;
    border-top: none !important;
  }

  .no-print {
    display: none !important;
  }

  * {
    -webkit-print-color-adjust: exact !important;
    print-color-adjust: exact !important;
  }
}
</style>
