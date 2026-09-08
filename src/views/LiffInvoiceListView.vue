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

      <!-- Session Expired Warning Banner -->
      <div v-if="sessionExpired" class="p-4 bg-amber-50 border border-amber-200 rounded-3xl space-y-3 shadow-md">
        <div class="flex items-center justify-between text-xs font-bold text-amber-900">
          <div class="flex items-center gap-2">
            <span>🔑</span>
            <span>เซสชัน LINE หมดอายุ</span>
          </div>
          <span class="text-[10px] bg-amber-200/80 text-amber-900 px-2 py-0.5 rounded-full font-bold">
            Session Expired
          </span>
        </div>
        <p class="text-[11px] text-amber-800 leading-relaxed">
          กรุณายืนยันตัวตนผ่าน LINE อีกครั้งเพื่อดูรายการบิลของคุณ
        </p>
        <button
          @click="loginLiff()"
          class="w-full py-2.5 px-4 bg-[#06C755] hover:bg-[#05B34C] text-white rounded-2xl text-xs font-extrabold transition-all shadow-md shadow-emerald-500/20 flex items-center justify-center gap-2 cursor-pointer"
        >
          <span>💬</span>
          <span>เข้าสู่ระบบด้วย LINE เพื่อดูบิล (Verify LINE)</span>
        </button>
      </div>

      <!-- Room Filter Pills (Shown when invoices exist for multiple rooms) -->
      <div v-if="distinctRooms.length > 1" class="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
        <button
          @click="selectedRoomFilter = 'ALL'"
          class="px-3.5 py-1.5 rounded-full text-xs font-bold transition-all shrink-0 cursor-pointer"
          :class="selectedRoomFilter === 'ALL' ? 'bg-indigo-600 text-white shadow-xs' : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'"
        >
          ทั้งหมด (All Rooms)
        </button>
        <button
          v-for="room in distinctRooms"
          :key="room.id"
          @click="selectedRoomFilter = room.id"
          class="px-3.5 py-1.5 rounded-full text-xs font-bold transition-all shrink-0 cursor-pointer"
          :class="selectedRoomFilter === room.id ? 'bg-indigo-600 text-white shadow-xs' : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'"
        >
          ห้อง {{ room.roomNumber }}
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
              {{ filteredPendingInvoices.length }} รายการ
            </span>
          </div>

          <div v-if="filteredPendingInvoices.length > 0" class="space-y-3">
            <div
              v-for="inv in filteredPendingInvoices"
              :key="inv.id"
              @click="goToDetail(inv.id)"
              class="p-5 bg-white rounded-3xl border-2 border-amber-200/90 shadow-md hover:shadow-lg transition-all cursor-pointer space-y-3 relative overflow-hidden group"
            >
              <!-- Card Header -->
              <div class="flex items-start justify-between">
                <div>
                  <div class="flex items-center gap-2">
                    <span class="text-[10px] font-mono text-slate-400">{{ inv.invoiceNumber }}</span>
                    <span v-if="inv.room?.roomNumber" class="px-2 py-0.5 bg-yellow-400 text-slate-950 font-black text-[10px] rounded-full shadow-2xs">
                      ห้อง {{ inv.room.roomNumber }}
                    </span>
                  </div>
                  <div class="font-extrabold text-slate-900 text-base mt-0.5">รอบบิล {{ inv.billingCycle }}</div>
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

          <div v-if="filteredPaidInvoices.length > 0" class="space-y-3">
            <div
              v-for="inv in filteredPaidInvoices"
              :key="inv.id"
              @click="goToDetail(inv.id)"
              class="p-5 bg-white rounded-3xl border border-slate-200/80 shadow-xs hover:shadow-md transition-all cursor-pointer space-y-3 group"
            >
              <div class="flex items-start justify-between">
                <div>
                  <div class="flex items-center gap-2">
                    <span class="text-[10px] font-mono text-slate-400">{{ inv.invoiceNumber }}</span>
                    <span v-if="inv.room?.roomNumber" class="px-2 py-0.5 bg-slate-100 text-slate-700 font-bold text-[10px] rounded-full border border-slate-200">
                      ห้อง {{ inv.room.roomNumber }}
                    </span>
                  </div>
                  <div class="font-bold text-slate-900 text-sm sm:text-base mt-0.5">รอบบิล {{ inv.billingCycle }}</div>
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
import { useRouter, useRoute } from 'vue-router';
import { initLiff, isLiffLoggedIn, getLiffProfile, loginLiff } from '@/utils/liff';
import api from '@/utils/api';

const router = useRouter();
const route = useRoute();
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

const pendingInvoices = computed(() => {
  return invoices.value.filter((i) => i.status === 'pending' || i.status === 'overdue');
});

const filteredPendingInvoices = computed(() => {
  return filteredInvoices.value.filter((i) => i.status === 'pending' || i.status === 'overdue');
});

const paidInvoices = computed(() => {
  return invoices.value.filter((i) => i.status === 'paid' || i.status === 'reviewing');
});

const filteredPaidInvoices = computed(() => {
  return filteredInvoices.value.filter((i) => i.status === 'paid' || i.status === 'reviewing');
});

const goToDetail = (id) => {
  router.push(`/liff/invoices/${id}`);
};
</script>

