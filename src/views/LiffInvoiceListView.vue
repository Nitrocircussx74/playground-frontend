<template>
  <div class="space-y-4 pb-6 font-sans text-slate-800">
    <div class="space-y-4">
      <!-- Page Header -->
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-lg font-bold text-slate-800 tracking-tight">บิลค่าเช่าทั้งหมด</h1>
          <p class="text-xs text-slate-400">ตรวจสอบยอดค่าใช้จ่ายและแนบสลิปชำระเงิน</p>
        </div>
        <Button variant="link" size="sm" class="h-auto p-0" @click="fetchInvoices">
          รีเฟรช
        </Button>
      </div>

      <!-- Session Expired Warning Banner -->
      <Card class="p-4 bg-amber-50/90 border-amber-200/70 space-y-2 shadow-xs" v-if="sessionExpired">
        <div class="flex items-center justify-between text-xs font-bold text-amber-900">
          <span>เซสชัน LINE หมดอายุ</span>
          <Badge variant="warning">Expired</Badge>
        </div>
        <p class="text-xs text-amber-800 leading-relaxed">
          กรุณายืนยันตัวตนผ่าน LINE อีกครั้งเพื่อดูรายการบิลของคุณ
        </p>
        <Button class="w-full bg-emerald-500 hover:bg-emerald-600" @click="loginLiff()">
          <span>เข้าสู่ระบบด้วย LINE</span>
        </Button>
      </Card>

      <!-- Room Filter Pills (Shown when invoices exist for multiple rooms) -->
      <div v-if="distinctRooms.length > 1" class="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
        <Button
          :variant="selectedRoomFilter === 'ALL' ? undefined : 'outline'"
          size="sm"
          class="rounded-full shrink-0"
          @click="selectedRoomFilter = 'ALL'"
        >
          ทั้งหมด
        </Button>
        <Button
          v-for="room in distinctRooms"
          :key="room.id"
          :variant="selectedRoomFilter === room.id ? undefined : 'outline'"
          size="sm"
          class="rounded-full shrink-0"
          @click="selectedRoomFilter = room.id"
        >
          ห้อง {{ room.roomNumber }}
        </Button>
      </div>

      <!-- Loading Skeleton State -->
      <div v-if="loading" class="space-y-3 animate-pulse">
        <Card v-for="i in 3" :key="i" class="p-4 sm:p-5 space-y-3">
          <div class="flex items-center justify-between">
            <div class="space-y-1.5">
              <div class="h-3 w-20 bg-slate-100 skeleton-shimmer rounded-md"></div>
              <div class="h-4 w-36 bg-slate-100 skeleton-shimmer rounded-lg"></div>
            </div>
            <div class="h-6 w-20 bg-slate-100 skeleton-shimmer rounded-full"></div>
          </div>
          <div class="pt-2 border-t border-slate-50 flex items-center justify-between">
            <div class="h-3 w-24 bg-slate-100 skeleton-shimmer rounded-md"></div>
            <div class="h-5 w-24 bg-slate-100 skeleton-shimmer rounded-md"></div>
          </div>
        </Card>
      </div>

      <div v-else class="space-y-4">
        <!-- 1. Category 1: Current Unpaid Invoices (Pending & Overdue) -->
        <div class="space-y-2.5">
          <div class="flex items-center justify-between px-1">
            <h2 class="text-xs font-bold text-amber-800 tracking-wide">
              บิลค้างชำระ (Pending Payment)
            </h2>
            <Badge variant="warning">{{ filteredPendingInvoices.length }} รายการ</Badge>
          </div>

          <div v-if="filteredPendingInvoices.length > 0" class="space-y-2.5">
            <Card
              v-for="inv in filteredPendingInvoices"
              :key="inv.id"
              @click="goToDetail(inv.id)"
              class="p-4 border-amber-200/80 hover:border-amber-300 transition-all cursor-pointer space-y-2.5 relative overflow-hidden group active:scale-[0.99]"
            >
              <!-- Card Header -->
              <div class="flex items-start justify-between">
                <div>
                  <div class="flex items-center gap-1.5">
                    <span class="text-xs font-mono text-slate-400">{{ inv.invoiceNumber }}</span>
                    <Badge v-if="inv.room?.roomNumber" variant="warning">ห้อง {{ inv.room.roomNumber }}</Badge>
                  </div>
                  <div class="font-bold text-slate-800 text-sm mt-0.5">รอบบิล {{ inv.billingCycle }}</div>
                </div>
                <!-- Status Badge -->
                <Badge :variant="inv.status === 'overdue' ? 'danger' : 'warning'">
                  {{ inv.status === 'overdue' ? 'เกินกำหนดชำระ' : 'รอชำระเงิน' }}
                </Badge>
              </div>

              <!-- Amount & Due Date -->
              <div class="pt-2.5 border-t border-slate-100 flex items-end justify-between">
                <div>
                  <div class="text-xs text-slate-400 font-medium">วันครบกำหนดชำระ</div>
                  <div class="text-xs font-bold" :class="inv.status === 'overdue' ? 'text-rose-600' : 'text-slate-700'">
                    {{ new Date(inv.dueDate).toLocaleDateString('th-TH') }}
                  </div>
                  <div v-if="Number(inv.lateFeeCharge) > 0" class="text-xs text-rose-600 font-bold mt-0.5">
                    (รวมค่าปรับ ฿{{ Number(inv.lateFeeCharge).toLocaleString() }})
                  </div>
                </div>
                <div class="text-right space-y-1">
                  <div class="text-xs text-slate-400 font-medium">ยอดรวมสุทธิ</div>
                  <div class="text-lg font-bold text-slate-900 font-mono">
                    ฿{{ Number(inv.grandTotal).toLocaleString() }}
                  </div>
                </div>
              </div>

              <!-- Quick Download Button -->
              <div class="pt-1 border-t border-slate-50 flex items-center justify-end">
                <Button variant="ghost" size="sm" class="bg-primary/10 hover:bg-primary/20 text-primary" @click.stop="downloadInvoicePdf(inv.id, inv.invoiceNumber)">
                  <Download class="w-3.5 h-3.5" />
                  <span>ดาวน์โหลดใบแจ้งหนี้ (PDF)</span>
                </Button>
              </div>
            </Card>
          </div>

          <Card v-else class="p-5 bg-emerald-50/50 border-emerald-100 text-center text-xs text-emerald-700">
            ไม่มีบิลค้างชำระ ชำระเงินครบถ้วนแล้ว
          </Card>
        </div>

        <!-- 2. Category 2: Paid & Reviewing Invoices History -->
        <div class="space-y-2.5 pt-1">
          <div class="flex items-center justify-between px-1">
            <h2 class="text-xs font-bold text-slate-500 tracking-wide">
              ประวัติบิลที่ชำระแล้ว (History)
            </h2>
          </div>

          <div v-if="filteredPaidInvoices.length > 0" class="space-y-2.5">
            <Card
              v-for="inv in filteredPaidInvoices"
              :key="inv.id"
              @click="goToDetail(inv.id)"
              class="p-4 hover:border-slate-300 transition-all cursor-pointer space-y-2.5 group active:scale-[0.99]"
            >
              <div class="flex items-start justify-between">
                <div>
                  <div class="flex items-center gap-1.5">
                    <span class="text-xs font-mono text-slate-400">{{ inv.invoiceNumber }}</span>
                    <Badge v-if="inv.room?.roomNumber" variant="neutral">ห้อง {{ inv.room.roomNumber }}</Badge>
                  </div>
                  <div class="font-bold text-slate-800 text-sm mt-0.5">รอบบิล {{ inv.billingCycle }}</div>
                </div>
                <!-- Status Badge -->
                <Badge :variant="inv.status === 'paid' ? 'success' : 'neutral'">
                  {{ inv.status === 'paid' ? 'ชำระแล้ว' : 'กำลังตรวจสอบสลิป' }}
                </Badge>
              </div>

              <div class="pt-2 border-t border-slate-100 flex items-center justify-between">
                <span class="text-xs text-slate-500">
                  {{ inv.paidAt ? `ชำระเมื่อ: ${new Date(inv.paidAt).toLocaleDateString('th-TH')}` : 'กำลังรอยืนยัน' }}
                </span>
                <span class="text-base font-extrabold text-slate-900 font-mono">
                  ฿{{ Number(inv.grandTotal).toLocaleString() }}
                </span>
              </div>

              <!-- Quick Download Buttons for Paid Invoices -->
              <div class="pt-1 border-t border-slate-50 flex items-center justify-end gap-2">
                <Button variant="secondary" size="sm" @click.stop="downloadInvoicePdf(inv.id, inv.invoiceNumber)">
                  <FileText class="w-3.5 h-3.5" />
                  <span>ใบแจ้งหนี้</span>
                </Button>
                <Button
                  v-if="inv.status === 'paid'"
                  variant="ghost"
                  size="sm"
                  class="bg-emerald-50 hover:bg-emerald-100 text-emerald-700"
                  @click.stop="downloadReceiptPdf(inv.id, inv.invoiceNumber)"
                >
                  <Receipt class="w-3.5 h-3.5" />
                  <span>ใบเสร็จ</span>
                </Button>
              </div>
            </Card>
          </div>

          <Card v-else class="p-6 text-center text-xs text-slate-400">
            ยังไม่มีประวัติบิลที่ชำระเงินแล้ว
          </Card>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { initLiff, isLiffLoggedIn, getLiffProfile, loginLiff } from '@/utils/liff';
import { downloadOrSharePdf } from '@/utils/downloadHelper';
import { useAuthStore } from '@/stores/auth';
import api from '@/utils/api';
import { showError } from '@/utils/swal';
import { Download, FileText, Receipt } from 'lucide-vue-next';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

const router = useRouter();
const route = useRoute();
const authStore = useAuthStore();
const loading = ref(true);
const sessionExpired = ref(false);
const invoices = ref([]);
const lineUserId = ref('');
const selectedRoomFilter = ref('ALL');

onMounted(async () => {
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

  fetchInvoices();
});

const fetchInvoices = async () => {
  loading.value = true;
  try {
    const params = {};
    if (lineUserId.value) params.lineUserId = lineUserId.value;
    if (route.query.room) params.room = route.query.room;
    if (route.query.roomNumber) params.roomNumber = route.query.roomNumber;
    if (route.query.tenantId) params.tenantId = route.query.tenantId;

    const res = await api.get('/api/v1/liff/invoices/history', { params });
    sessionExpired.value = false;
    invoices.value = res.data.data || [];

    if (route.query.roomId) {
      selectedRoomFilter.value = route.query.roomId;
    } else if (route.query.room) {
      const match = invoices.value.find((i) => i.room?.roomNumber === route.query.room);
      if (match?.room?.id) {
        selectedRoomFilter.value = match.room.id;
      }
    }
  } catch (err) {
    console.error('Failed to fetch invoices:', err);
    if (err.response?.status === 401 || !isLiffLoggedIn()) {
      sessionExpired.value = true;
    }
  } finally {
    loading.value = false;
  }
};

const distinctRooms = computed(() => {
  const roomMap = new Map();
  invoices.value.forEach((inv) => {
    if (inv.room && inv.room.id && !roomMap.has(inv.room.id)) {
      roomMap.set(inv.room.id, {
        id: inv.room.id,
        roomNumber: inv.room.roomNumber
      });
    }
  });
  return Array.from(roomMap.values());
});

const filteredInvoices = computed(() => {
  if (selectedRoomFilter.value === 'ALL') {
    return invoices.value;
  }
  return invoices.value.filter((inv) => inv.roomId === selectedRoomFilter.value || inv.room?.id === selectedRoomFilter.value);
});

const filteredPendingInvoices = computed(() => {
  return filteredInvoices.value.filter((i) => i.status === 'pending' || i.status === 'overdue');
});

const filteredPaidInvoices = computed(() => {
  return filteredInvoices.value.filter((i) => i.status === 'paid' || i.status === 'reviewing');
});

const goToDetail = (id) => {
  router.push(`/liff/invoices/${id}`);
};

const downloadInvoicePdf = async (invoiceId, invoiceNumber) => {
  try {
    const rawBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';
    const cleanBaseUrl = rawBaseUrl.replace(/\/+$/, '');
    const token = authStore.liffToken || '';
    const directUrl = `${cleanBaseUrl}/api/v1/liff/invoices/${invoiceId}/invoice-pdf?token=${encodeURIComponent(token)}`;

    const res = await api.get(`/api/v1/liff/invoices/${invoiceId}/invoice-pdf`, {
      responseType: 'blob'
    });
    const blob = new Blob([res.data], { type: 'application/pdf' });
    const filename = `Invoice-${invoiceNumber || invoiceId}.pdf`;

    await downloadOrSharePdf(blob, filename, directUrl);
  } catch (err) {
    showError('เกิดข้อผิดพลาด', err.response?.data?.message || 'ไม่สามารถดาวน์โหลดใบแจ้งหนี้ได้');
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

