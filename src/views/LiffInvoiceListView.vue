<template>
  <div class="space-y-4 pb-6 font-sans text-slate-800">
    <div class="space-y-4">
      <!-- Page Header -->
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-lg font-bold text-slate-800 tracking-tight">บิลค่าเช่าทั้งหมด</h1>
          <p class="text-xs text-slate-400">ตรวจสอบยอดค่าใช้จ่ายและแนบสลิปชำระเงิน</p>
        </div>
        <button
          @click="fetchInvoices"
          class="text-xs font-semibold text-indigo-600 hover:text-indigo-700 transition-colors"
        >
          รีเฟรช
        </button>
      </div>

      <!-- Session Expired Warning Banner -->
      <div v-if="sessionExpired" class="p-4 bg-amber-50/90 border border-amber-200/70 rounded-2xl space-y-2 shadow-xs">
        <div class="flex items-center justify-between text-xs font-bold text-amber-900">
          <span>เซสชัน LINE หมดอายุ</span>
          <span class="text-[10px] bg-amber-200/70 text-amber-900 px-2 py-0.5 rounded-full font-bold">
            Expired
          </span>
        </div>
        <p class="text-[11px] text-amber-800 leading-relaxed">
          กรุณายืนยันตัวตนผ่าน LINE อีกครั้งเพื่อดูรายการบิลของคุณ
        </p>
        <button
          @click="loginLiff()"
          class="w-full py-2.5 px-4 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer"
        >
          <span>เข้าสู่ระบบด้วย LINE</span>
        </button>
      </div>

      <!-- Room Filter Pills (Shown when invoices exist for multiple rooms) -->
      <div v-if="distinctRooms.length > 1" class="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
        <button
          @click="selectedRoomFilter = 'ALL'"
          class="px-3 py-1 rounded-full text-xs font-semibold transition-all shrink-0 cursor-pointer"
          :class="selectedRoomFilter === 'ALL' ? 'bg-indigo-600 text-white shadow-2xs' : 'bg-white text-slate-600 border border-slate-200/80 hover:bg-slate-50'"
        >
          ทั้งหมด
        </button>
        <button
          v-for="room in distinctRooms"
          :key="room.id"
          @click="selectedRoomFilter = room.id"
          class="px-3 py-1 rounded-full text-xs font-semibold transition-all shrink-0 cursor-pointer"
          :class="selectedRoomFilter === room.id ? 'bg-indigo-600 text-white shadow-2xs' : 'bg-white text-slate-600 border border-slate-200/80 hover:bg-slate-50'"
        >
          ห้อง {{ room.roomNumber }}
        </button>
      </div>

      <!-- Loading Skeleton State -->
      <div v-if="loading" class="space-y-3 animate-pulse">
        <div v-for="i in 3" :key="i" class="p-4 sm:p-5 bg-white rounded-2xl border border-slate-100 shadow-xs space-y-3">
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
        </div>
      </div>

      <div v-else class="space-y-4">
        <!-- 1. Category 1: Current Unpaid Invoices (Pending & Overdue) -->
        <div class="space-y-2.5">
          <div class="flex items-center justify-between px-1">
            <h2 class="text-xs font-bold text-amber-800 tracking-wide">
              บิลค้างชำระ (Pending Payment)
            </h2>
            <span class="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200/70">
              {{ filteredPendingInvoices.length }} รายการ
            </span>
          </div>

          <div v-if="filteredPendingInvoices.length > 0" class="space-y-2.5">
            <div
              v-for="inv in filteredPendingInvoices"
              :key="inv.id"
              @click="goToDetail(inv.id)"
              class="p-4 bg-white rounded-2xl border border-amber-200/80 shadow-xs hover:border-amber-300 transition-all cursor-pointer space-y-2.5 relative overflow-hidden group active:scale-[0.99]"
            >
              <!-- Card Header -->
              <div class="flex items-start justify-between">
                <div>
                  <div class="flex items-center gap-1.5">
                    <span class="text-[10px] font-mono text-slate-400">{{ inv.invoiceNumber }}</span>
                    <span v-if="inv.room?.roomNumber" class="px-1.5 py-0.2 bg-amber-50 text-amber-800 font-bold text-[10px] rounded-full border border-amber-200">
                      ห้อง {{ inv.room.roomNumber }}
                    </span>
                  </div>
                  <div class="font-bold text-slate-800 text-sm mt-0.5">รอบบิล {{ inv.billingCycle }}</div>
                </div>
                <!-- Status Badge -->
                <span
                  class="text-[11px] font-bold px-2.5 py-0.5 rounded-full border"
                  :class="inv.status === 'overdue' ? 'bg-rose-50 border-rose-200 text-rose-700' : 'bg-amber-50 border-amber-200 text-amber-800'"
                >
                  {{ inv.status === 'overdue' ? 'เกินกำหนดชำระ' : 'รอชำระเงิน' }}
                </span>
              </div>

              <!-- Amount & Due Date -->
              <div class="pt-2.5 border-t border-slate-100 flex items-end justify-between">
                <div>
                  <div class="text-[10px] text-slate-400 font-medium">วันครบกำหนดชำระ</div>
                  <div class="text-xs font-bold" :class="inv.status === 'overdue' ? 'text-rose-600' : 'text-slate-700'">
                    {{ new Date(inv.dueDate).toLocaleDateString('th-TH') }}
                  </div>
                  <div v-if="Number(inv.lateFeeCharge) > 0" class="text-[10px] text-rose-600 font-bold mt-0.5">
                    (รวมค่าปรับ ฿{{ Number(inv.lateFeeCharge).toLocaleString() }})
                  </div>
                </div>
                <div class="text-right">
                  <div class="text-[10px] text-slate-400 font-medium">ยอดรวมสุทธิ</div>
                  <div class="text-lg font-bold text-slate-900 font-mono">
                    ฿{{ Number(inv.grandTotal).toLocaleString() }}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div v-else class="p-5 bg-emerald-50/50 rounded-2xl border border-emerald-100 text-center text-xs text-emerald-700">
            ไม่มีบิลค้างชำระ ชำระเงินครบถ้วนแล้ว
          </div>
        </div>

        <!-- 2. Category 2: Paid & Reviewing Invoices History -->
        <div class="space-y-2.5 pt-1">
          <div class="flex items-center justify-between px-1">
            <h2 class="text-xs font-bold text-slate-500 tracking-wide">
              ประวัติบิลที่ชำระแล้ว (History)
            </h2>
          </div>

          <div v-if="filteredPaidInvoices.length > 0" class="space-y-2.5">
            <div
              v-for="inv in filteredPaidInvoices"
              :key="inv.id"
              @click="goToDetail(inv.id)"
              class="p-4 bg-white rounded-2xl border border-slate-100 shadow-2xs hover:border-slate-200 transition-all cursor-pointer space-y-2.5 group active:scale-[0.99]"
            >
              <div class="flex items-start justify-between">
                <div>
                  <div class="flex items-center gap-1.5">
                    <span class="text-[10px] font-mono text-slate-400">{{ inv.invoiceNumber }}</span>
                    <span v-if="inv.room?.roomNumber" class="px-1.5 py-0.2 bg-slate-50 text-slate-600 font-medium text-[10px] rounded-full border border-slate-200">
                      ห้อง {{ inv.room.roomNumber }}
                    </span>
                  </div>
                  <div class="font-bold text-slate-800 text-sm mt-0.5">รอบบิล {{ inv.billingCycle }}</div>
                </div>
                <!-- Status Badge -->
                <span
                  class="text-[11px] font-bold px-2.5 py-0.5 rounded-full border"
                  :class="inv.status === 'paid' ? 'bg-emerald-50 border-emerald-200 text-emerald-700' : 'bg-sky-50 border-sky-200 text-sky-700'"
                >
                  {{ inv.status === 'paid' ? 'ชำระแล้ว' : 'กำลังตรวจสอบสลิป' }}
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

