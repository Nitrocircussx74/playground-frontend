<template>
  <div class="space-y-5 pb-6 font-sans text-slate-800">
    <!-- Header -->
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-lg font-bold text-slate-900 tracking-tight">ประวัติการชำระเงิน</h1>
        <p class="text-xs text-slate-500 mt-0.5">ใบเสร็จรับเงินอิเล็กทรอนิกส์ (E-Receipt)</p>
      </div>

      <button
        v-if="featureStore.isEnabled('ENABLE_RECEIPT_HISTORY')"
        @click="fetchHistory"
        class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-50/80 hover:bg-indigo-100 text-xs font-semibold text-indigo-600 transition-colors"
      >
        <RotateCw class="w-3.5 h-3.5" :class="{ 'animate-spin': loading }" />
        <span>รีเฟรช</span>
      </button>
    </div>

    <!-- Feature Disabled Notice (Admin ปิดใช้งานระบบประวัติใบเสร็จไว้) -->
    <div
      v-if="!featureStore.isEnabled('ENABLE_RECEIPT_HISTORY')"
      class="p-5 bg-amber-50 border border-amber-200 rounded-3xl text-amber-900 space-y-2 shadow-xs"
    >
      <div class="flex items-center gap-2 font-bold text-xs">
        <AlertTriangle class="w-4 h-4 text-amber-600 shrink-0" />
        <span>ระบบประวัติใบเสร็จถูกปิดใช้งานชั่วคราว</span>
      </div>
      <p class="text-[11px] text-amber-700 leading-relaxed">
        ผู้ดูแลหอพักได้ปิดการดูประวัติใบเสร็จผ่านระบบออนไลน์ชั่วคราว หากต้องการใบเสร็จกรุณาติดต่อเจ้าหน้าที่โดยตรง
      </p>
    </div>

    <template v-else>
      <!-- Loading Skeleton State -->
      <div v-if="loading" class="space-y-3 animate-pulse">
        <div v-for="i in 3" :key="i" class="p-4 sm:p-5 bg-white rounded-2xl border border-slate-100/90 shadow-xs space-y-3">
          <div class="flex items-center justify-between">
            <div class="space-y-1.5">
              <div class="h-3 w-20 bg-slate-100 skeleton-shimmer rounded-md"></div>
              <div class="h-4 w-32 bg-slate-100 skeleton-shimmer rounded-lg"></div>
            </div>
            <div class="h-6 w-16 bg-slate-100 skeleton-shimmer rounded-full"></div>
          </div>
          <div class="pt-2 border-t border-slate-50 flex items-center justify-between">
            <div class="h-3 w-24 bg-slate-100 skeleton-shimmer rounded-md"></div>
            <div class="h-5 w-20 bg-slate-100 skeleton-shimmer rounded-md"></div>
          </div>
          <div class="h-8 w-full bg-slate-100 skeleton-shimmer rounded-xl"></div>
        </div>
      </div>

      <!-- Paid Invoices List -->
      <div v-else class="space-y-3">
        <div
          v-for="inv in paidInvoices"
          :key="inv.id"
          class="p-4 sm:p-5 bg-white rounded-2xl border border-slate-100/90 shadow-xs space-y-3 transition-all hover:border-slate-200"
        >
          <div class="flex items-start justify-between gap-3">
            <div class="space-y-0.5">
              <div class="flex items-center gap-2">
                <span class="text-[11px] font-mono font-medium text-slate-400">REC-{{ inv.invoiceNumber }}</span>
                <span class="text-[11px] font-medium px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                  ห้อง {{ inv.room?.roomNumber }}
                </span>
              </div>
              <div class="font-bold text-slate-800 text-sm sm:text-base">
                รอบบิล {{ inv.billingCycle }}
              </div>
            </div>
            <span class="inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-100 shrink-0">
              <CheckCircle2 class="w-3 h-3" />
              ชำระแล้ว
            </span>
          </div>

          <div class="pt-2.5 border-t border-slate-100 flex items-center justify-between">
            <div>
              <div class="text-[10px] text-slate-400">วันที่ชำระเงิน</div>
              <div class="text-xs font-medium text-slate-700 mt-0.5">
                {{ inv.paidAt ? new Date(inv.paidAt).toLocaleDateString('th-TH', { year: 'numeric', month: 'short', day: 'numeric' }) : 'ชำระแล้ว' }}
              </div>
            </div>

            <div class="text-right">
              <div class="text-[10px] text-slate-400">ยอดชำระสุทธิ</div>
              <div class="text-base font-bold text-slate-900 font-mono tracking-tight mt-0.5">
                ฿{{ Number(inv.grandTotal).toLocaleString() }}
              </div>
            </div>
          </div>

          <!-- Download E-Receipt Button -->
          <div class="pt-1">
            <button
              @click="downloadReceiptPdf(inv.id, inv.invoiceNumber)"
              class="w-full py-2.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200/70 rounded-xl font-semibold text-xs transition-colors flex items-center justify-center gap-1.5 active:scale-[0.99]"
            >
              <Download class="w-3.5 h-3.5" />
              <span>ดาวน์โหลดใบเสร็จ (E-Receipt PDF)</span>
            </button>
          </div>
        </div>

        <!-- Empty State -->
        <div v-if="paidInvoices.length === 0" class="p-10 bg-white rounded-2xl border border-slate-100/80 text-center space-y-2 shadow-xs">
          <div class="w-10 h-10 rounded-2xl bg-slate-50 text-slate-400 flex items-center justify-center mx-auto">
            <Receipt class="w-5 h-5" />
          </div>
          <p class="text-xs font-medium text-slate-500">ยังไม่มีประวัติการชำระเงินในระบบ</p>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { RotateCw, CheckCircle2, Download, Receipt, AlertTriangle } from 'lucide-vue-next';
import { useAuthStore } from '@/stores/auth';
import { useFeatureStore } from '@/stores/useFeatureStore';
import { initLiff, isLiffLoggedIn, getLiffProfile } from '@/utils/liff';
import { downloadOrSharePdf } from '@/utils/downloadHelper';
import api from '@/utils/api';
import { showError } from '@/utils/swal';

const authStore = useAuthStore();
const featureStore = useFeatureStore();
const loading = ref(true);
const paidInvoices = ref([]);
const lineUserId = ref('');

onMounted(async () => {
  await featureStore.fetchFeatures();
  if (!featureStore.isEnabled('ENABLE_RECEIPT_HISTORY')) {
    loading.value = false;
    return;
  }

  try {
    await initLiff();
    if (isLiffLoggedIn()) {
      const profile = await getLiffProfile();
      if (profile?.userId) {
        lineUserId.value = profile.userId;
      }
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
    const rawBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';
    const cleanBaseUrl = rawBaseUrl.replace(/\/+$/, '');
    const token = authStore.liffToken || '';
    const directUrl = `${cleanBaseUrl}/api/v1/liff/invoices/${invoiceId}/receipt-pdf?token=${encodeURIComponent(token)}`;

    const res = await api.get(`/api/v1/liff/invoices/${invoiceId}/receipt-pdf`, {
      responseType: 'blob'
    });

    const blob = new Blob([res.data], { type: 'application/pdf' });
    const filename = `Official-Receipt-REC-${invoiceNumber || invoiceId}.pdf`;

    await downloadOrSharePdf(blob, filename, directUrl);
  } catch (err) {
    showError('เกิดข้อผิดพลาด', err.response?.data?.message || 'ไม่สามารถดาวน์โหลดใบเสร็จรับเงินได้');
  }
};
</script>
