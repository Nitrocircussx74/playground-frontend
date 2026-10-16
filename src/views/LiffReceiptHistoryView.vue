<template>
  <div class="space-y-5 pb-6 font-sans text-slate-800">
    <!-- Header -->
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-lg font-bold text-slate-900 tracking-tight">ประวัติการชำระเงิน</h1>
        <p class="text-xs text-slate-500 mt-0.5">ใบเสร็จรับเงินอิเล็กทรอนิกส์ (E-Receipt)</p>
      </div>

      <Button
        v-if="featureStore.isEnabled('ENABLE_RECEIPT_HISTORY')"
        variant="ghost"
        size="sm"
        class="bg-primary/10 hover:bg-primary/20 text-primary"
        @click="fetchHistory"
      >
        <RotateCw class="w-3.5 h-3.5" :class="{ 'animate-spin': loading }" />
        <span>รีเฟรช</span>
      </Button>
    </div>

    <!-- Feature Disabled Notice (Admin ปิดใช้งานระบบประวัติใบเสร็จไว้) -->
    <Card v-if="!featureStore.isEnabled('ENABLE_RECEIPT_HISTORY')" class="p-5 bg-amber-50 border-amber-200 text-amber-900 space-y-2 shadow-xs">
      <div class="flex items-center gap-2 font-bold text-xs">
        <AlertTriangle class="w-4 h-4 text-amber-600 shrink-0" />
        <span>ระบบประวัติใบเสร็จถูกปิดใช้งานชั่วคราว</span>
      </div>
      <p class="text-xs text-amber-700 leading-relaxed">
        ผู้ดูแลหอพักได้ปิดการดูประวัติใบเสร็จผ่านระบบออนไลน์ชั่วคราว หากต้องการใบเสร็จกรุณาติดต่อเจ้าหน้าที่โดยตรง
      </p>
    </Card>

    <template v-else>
      <!-- Loading Skeleton State -->
      <div v-if="loading" class="space-y-3 animate-pulse">
        <Card v-for="i in 3" :key="i" class="p-4 sm:p-5 space-y-3">
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
        </Card>
      </div>

      <!-- Paid Invoices List -->
      <div v-else class="space-y-3">
        <Card
          v-for="inv in paidInvoices"
          :key="inv.id"
          class="p-4 sm:p-5 space-y-3 transition-all hover:border-slate-300"
        >
          <div class="flex items-start justify-between gap-3">
            <div class="space-y-0.5">
              <div class="flex items-center gap-2">
                <span class="text-xs font-mono font-medium text-slate-400">REC-{{ inv.invoiceNumber }}</span>
                <Badge variant="neutral">ห้อง {{ inv.room?.roomNumber }}</Badge>
              </div>
              <div class="font-bold text-slate-800 text-sm sm:text-base">
                รอบบิล {{ inv.billingCycle }}
              </div>
            </div>
            <Badge variant="success" class="shrink-0">
              <CheckCircle2 class="w-3 h-3" />
              ชำระแล้ว
            </Badge>
          </div>

          <div class="pt-2.5 border-t border-slate-100 flex items-center justify-between">
            <div>
              <div class="text-xs text-slate-400">วันที่ชำระเงิน</div>
              <div class="text-xs font-medium text-slate-700 mt-0.5">
                {{ inv.paidAt ? new Date(inv.paidAt).toLocaleDateString('th-TH', { year: 'numeric', month: 'short', day: 'numeric' }) : 'ชำระแล้ว' }}
              </div>
            </div>

            <div class="text-right">
              <div class="text-xs text-slate-400">ยอดชำระสุทธิ</div>
              <div class="text-base font-bold text-slate-900 font-mono tracking-tight mt-0.5">
                ฿{{ Number(inv.grandTotal).toLocaleString() }}
              </div>
            </div>
          </div>

          <!-- Download E-Receipt Button -->
          <Button
            variant="outline"
            class="w-full text-emerald-700 border-emerald-200 hover:bg-emerald-50"
            @click="downloadReceiptPdf(inv.id, inv.invoiceNumber)"
          >
            <Download class="w-3.5 h-3.5" />
            <span>ดาวน์โหลดใบเสร็จ (E-Receipt PDF)</span>
          </Button>
        </Card>

        <!-- Empty State -->
        <Card v-if="paidInvoices.length === 0" class="p-10 text-center space-y-2">
          <div class="w-10 h-10 rounded-xl bg-slate-50 text-slate-400 flex items-center justify-center mx-auto">
            <Receipt class="w-5 h-5" />
          </div>
          <p class="text-xs font-medium text-slate-500">ยังไม่มีประวัติการชำระเงินในระบบ</p>
        </Card>
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
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

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
