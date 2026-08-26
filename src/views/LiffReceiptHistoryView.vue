<template>
  <div class="min-h-screen bg-slate-100 py-6 px-4 font-sans text-slate-900">
    <div class="max-w-md mx-auto space-y-5">
      <!-- Header -->
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-xl font-bold text-slate-900 tracking-tight">📜 ประวัติชำระเงิน & ใบเสร็จ (E-Receipt)</h1>
          <p class="text-xs text-slate-500">รวมประวัติการชำระเงินย้อนหลัง และดาวน์โหลดใบเสร็จรับเงิน</p>
        </div>

        <button @click="fetchHistory" class="text-xs text-indigo-600 font-semibold hover:underline">
          รีเฟรช
        </button>
      </div>

      <!-- Loading State -->
      <div v-if="loading" class="p-8 bg-white rounded-3xl text-center text-slate-500">
        <div class="animate-spin w-8 h-8 border-4 border-emerald-600 border-t-transparent rounded-full mx-auto mb-3"></div>
        กำลังโหลดประวัติใบเสร็จ...
      </div>

      <!-- Paid Invoices List -->
      <div v-else class="space-y-4">
        <div
          v-for="inv in paidInvoices"
          :key="inv.id"
          class="p-5 bg-white rounded-3xl border border-slate-200 shadow-sm space-y-3"
        >
          <div class="flex items-center justify-between">
            <div>
              <span class="text-xs text-slate-400 font-mono">REC-{{ inv.invoiceNumber }}</span>
              <div class="font-bold text-slate-900 text-base">รอบบิล {{ inv.billingCycle }} (ห้อง {{ inv.room?.roomNumber }})</div>
            </div>
            <span class="text-xs font-bold px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800">
              ✓ PAID
            </span>
          </div>

          <div class="pt-2 border-t border-slate-100 flex items-center justify-between">
            <div>
              <div class="text-[10px] text-slate-400">วันที่ชำระเงิน</div>
              <div class="text-xs font-semibold text-slate-700">
                {{ inv.paidAt ? new Date(inv.paidAt).toLocaleDateString('th-TH') : 'ชำระแล้ว' }}
              </div>
            </div>

            <div class="text-right">
              <div class="text-[10px] text-slate-400">ยอดเงินสุทธิ</div>
              <div class="text-base font-extrabold text-emerald-600 font-mono">
                ฿{{ Number(inv.grandTotal).toLocaleString() }}
              </div>
            </div>
          </div>

          <!-- Download E-Receipt Button -->
          <div class="pt-1">
            <button
              @click="downloadReceiptPdf(inv.id, inv.invoiceNumber)"
              class="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl font-bold text-xs transition-all shadow-xs flex items-center justify-center gap-1.5"
            >
              <span>📄 ดาวน์โหลดใบเสร็จรับเงิน (Download E-Receipt)</span>
            </button>
          </div>
        </div>

        <div v-if="paidInvoices.length === 0" class="p-8 bg-white rounded-3xl text-center text-slate-400 text-xs">
          ยังไม่มีประวัติการชำระเงินในระบบ
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import liff from '@line/liff';
import api from '@/utils/api';

const loading = ref(true);
const paidInvoices = ref([]);
const lineUserId = ref('');

onMounted(async () => {
  const liffId = import.meta.env.VITE_LINE_LIFF_ID || '2000000000-mockliffid';
  try {
    await liff.init({ liffId });
    if (liff.isLoggedIn()) {
      const profile = await liff.getProfile();
      lineUserId.value = profile.userId;
    }
  } catch (err) {
    console.warn('LIFF init fallback mode:', err.message);
  }

  fetchHistory();
});

const fetchHistory = async () => {
  loading.value = true;
  try {
    const params = {};
    if (lineUserId.value) params.lineUserId = lineUserId.value;

    const res = await api.get('/api/v1/liff/invoices/history', { params });
    paidInvoices.value = res.data.data;
  } catch (err) {
    console.error('Failed to fetch paid invoice history:', err);
  } finally {
    loading.value = false;
  }
};

const downloadReceiptPdf = async (invoiceId, invoiceNumber) => {
  try {
    const res = await api.get(`/api/v1/liff/invoices/${invoiceId}/receipt-pdf`, {
      responseType: 'blob'
    });

    const blob = new Blob([res.data], { type: 'application/pdf' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `Official-Receipt-REC-${invoiceNumber}.pdf`);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  } catch (err) {
    alert(err.response?.data?.message || 'ไม่สามารถดาวน์โหลดใบเสร็จรับเงินได้');
  }
};
</script>
