<template>
  <div class="space-y-6 pb-6 font-sans text-slate-900">
    <div class="space-y-6">
      <!-- Page Header -->
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-xl font-bold text-slate-900 tracking-tight">🧾 บิลค่าเช่าทั้งหมด (Tenant Invoices)</h1>
          <p class="text-xs text-slate-500">ตรวจสอบยอดค่าใช้จ่ายและแนบสลิปชำระเงิน</p>
        </div>
        <button
          @click="fetchInvoices"
          class="text-xs font-semibold text-indigo-600 hover:text-indigo-800 transition-colors"
        >
          รีเฟรช
        </button>
      </div>

      <!-- Loading State -->
      <div v-if="loading" class="p-8 bg-white rounded-3xl text-center text-slate-500 shadow-xs">
        <div class="animate-spin w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full mx-auto mb-3"></div>
        กำลังโหลดรายการบิลค่าเช่า...
      </div>

      <div v-else class="space-y-6">
        <!-- 1. Category 1: Current Unpaid Invoices (Pending & Overdue) -->
        <div class="space-y-3">
          <div class="flex items-center justify-between px-1">
            <h2 class="text-xs font-extrabold text-amber-800 uppercase tracking-wider flex items-center gap-1.5">
              <span>⚠️ บิลค้างชำระ (Pending Payment)</span>
            </h2>
            <span class="text-[11px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800">
              {{ pendingInvoices.length }} รายการ
            </span>
          </div>

          <div v-if="pendingInvoices.length > 0" class="space-y-3">
            <div
              v-for="inv in pendingInvoices"
              :key="inv.id"
              @click="goToDetail(inv.id)"
              class="p-5 bg-white rounded-3xl border-2 border-amber-200/90 shadow-md hover:shadow-lg transition-all cursor-pointer space-y-3 relative overflow-hidden group"
            >
              <!-- Card Header -->
              <div class="flex items-start justify-between">
                <div>
                  <span class="text-[10px] font-mono text-slate-400">{{ inv.invoiceNumber }}</span>
                  <div class="font-extrabold text-slate-900 text-base">รอบบิล {{ inv.billingCycle }}</div>
                </div>
                <!-- Status Badge -->
                <span
                  class="text-xs font-extrabold px-3 py-1 rounded-full border shadow-2xs"
                  :class="inv.status === 'overdue' ? 'bg-rose-50 border-rose-300 text-rose-700' : 'bg-amber-50 border-amber-300 text-amber-800'"
                >
                  {{ inv.status === 'overdue' ? '🚨 เกินกำหนดชำระ' : '⏳ รอชำระเงิน' }}
                </span>
              </div>

              <!-- Amount & Due Date -->
              <div class="pt-3 border-t border-slate-100 flex items-end justify-between">
                <div>
                  <div class="text-[10px] text-slate-400 font-medium">วันครบกำหนดชำระ</div>
                  <div class="text-xs font-bold text-rose-600">
                    {{ new Date(inv.dueDate).toLocaleDateString('th-TH') }}
                  </div>
                </div>
                <div class="text-right">
                  <div class="text-[10px] text-slate-400 font-medium">ยอดรวมสุทธิ</div>
                  <div class="text-xl font-black text-slate-900 font-mono">
                    ฿{{ Number(inv.grandTotal).toLocaleString() }}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div v-else class="p-6 bg-emerald-50/60 rounded-3xl border border-emerald-100 text-center text-xs text-emerald-800">
            🎉 ไม่มีบิลค้างชำระ! คุณชำระเงินครบถ้วนแล้ว
          </div>
        </div>

        <!-- 2. Category 2: Paid & Reviewing Invoices History -->
        <div class="space-y-3">
          <div class="flex items-center justify-between px-1">
            <h2 class="text-xs font-extrabold text-slate-500 uppercase tracking-wider">
              📜 ประวัติบิลที่ชำระแล้ว & รอตรวจสอบ (History)
            </h2>
          </div>

          <div v-if="paidInvoices.length > 0" class="space-y-3">
            <div
              v-for="inv in paidInvoices"
              :key="inv.id"
              @click="goToDetail(inv.id)"
              class="p-5 bg-white rounded-3xl border border-slate-200/80 shadow-xs hover:shadow-md transition-all cursor-pointer space-y-3 group"
            >
              <div class="flex items-start justify-between">
                <div>
                  <span class="text-[10px] font-mono text-slate-400">{{ inv.invoiceNumber }}</span>
                  <div class="font-bold text-slate-900 text-sm sm:text-base">รอบบิล {{ inv.billingCycle }}</div>
                </div>
                <!-- Status Badge -->
                <span
                  class="text-xs font-extrabold px-3 py-1 rounded-full border"
                  :class="inv.status === 'paid' ? 'bg-emerald-50 border-emerald-300 text-emerald-700' : 'bg-blue-50 border-blue-300 text-blue-700'"
                >
                  {{ inv.status === 'paid' ? '✓ PAID (ชำระแล้ว)' : '🔍 กำลังตรวจสอบสลิป' }}
                </span>
              </div>

              <div class="pt-2 border-t border-slate-100 flex items-center justify-between">
                <span class="text-xs text-slate-500">
                  {{ inv.paidAt ? `ชำระเมื่อ: ${new Date(inv.paidAt).toLocaleDateString('th-TH')}` : 'กำลังรอยืนยัน' }}
                </span>
                <span class="text-base font-extrabold text-slate-900 font-mono">
                  ฿{{ Number(inv.grandTotal).toLocaleString() }}
                </span>
              </div>
            </div>
          </div>

          <div v-else class="p-6 bg-white rounded-3xl border border-slate-200 text-center text-xs text-slate-400">
            ยังไม่มีประวัติบิลที่ชำระเงินแล้ว
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import liff from '@line/liff';
import api from '@/utils/api';

const router = useRouter();
const loading = ref(true);
const invoices = ref([]);
const lineUserId = ref('');

onMounted(async () => {
  const liffId = import.meta.env.VITE_LINE_LIFF_ID || import.meta.env.VITE_LIFF_ID || '';
  if (liffId) {
    try {
      await liff.init({ liffId });
      if (liff.isLoggedIn()) {
        const profile = await liff.getProfile();
        lineUserId.value = profile.userId;
      }
    } catch (err) {
      console.warn('LIFF init fallback mode:', err.message);
    }
  }

  fetchInvoices();
});

const fetchInvoices = async () => {
  loading.value = true;
  try {
    const params = {};
    if (lineUserId.value) params.lineUserId = lineUserId.value;

    const res = await api.get('/api/v1/liff/invoices/history', { params });
    invoices.value = res.data.data;
  } catch (err) {
    console.error('Failed to fetch invoices:', err);
  } finally {
    loading.value = false;
  }
};

const pendingInvoices = computed(() => {
  return invoices.value.filter((i) => i.status === 'pending' || i.status === 'overdue');
});

const paidInvoices = computed(() => {
  return invoices.value.filter((i) => i.status === 'paid' || i.status === 'reviewing');
});

const goToDetail = (id) => {
  router.push(`/liff/invoices/${id}`);
};
</script>
