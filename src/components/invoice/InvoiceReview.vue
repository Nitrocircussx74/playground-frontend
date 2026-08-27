<template>
  <div class="space-y-6">
    <!-- Top Action Bar & Summary Header -->
    <div class="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 class="text-xl font-bold text-slate-900 flex items-center gap-2">
            <span>📝</span>
            <span>ตรวจสอบและยืนยันออกบิลร่าง (Draft Invoice Review)</span>
          </h2>
          <p class="text-xs sm:text-sm text-slate-500 mt-1">
            ตรวจทานความถูกต้องของยอดเงินสุทธิของแต่ละห้องก่อนยืนยันส่ง LINE Notification ให้ลูกบ้าน
          </p>
        </div>

        <div class="flex items-center gap-3">
          <button
            @click="fetchDraftInvoices"
            :disabled="loading"
            class="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition-all border border-slate-200 flex items-center gap-1.5"
          >
            <span>🔄</span>
            <span>ดึงข้อมูลล่าสุด</span>
          </button>

          <button
            @click="handlePublishInvoices"
            :disabled="publishing || draftInvoices.length === 0"
            class="px-5 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white rounded-xl text-xs sm:text-sm font-bold shadow-md shadow-emerald-600/30 transition-all disabled:opacity-50 flex items-center gap-2"
          >
            <span>📢</span>
            <span>{{ publishing ? 'กำลังส่งแจ้งเตือน...' : 'ยืนยันและส่งแจ้งเตือน (Publish & Notify)' }}</span>
          </button>
        </div>
      </div>

      <!-- Financial Flow Summary Cards -->
      <div class="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 border-t border-slate-100">
        <div class="p-3.5 bg-purple-50/70 border border-purple-100 rounded-xl space-y-0.5">
          <div class="text-[11px] font-bold text-purple-700 uppercase">จำนวนบิลร่าง (Draft Invoices)</div>
          <div class="text-lg font-extrabold text-purple-900 font-mono">{{ draftInvoices.length }} ใบ</div>
        </div>

        <div class="p-3.5 bg-indigo-50/70 border border-indigo-100 rounded-xl space-y-0.5">
          <div class="text-[11px] font-bold text-indigo-700 uppercase">รวมค่าเช่าห้องพัก</div>
          <div class="text-lg font-extrabold text-indigo-900 font-mono">฿{{ summaryTotals.roomPrice.toLocaleString() }}</div>
        </div>

        <div class="p-3.5 bg-cyan-50/70 border border-cyan-100 rounded-xl space-y-0.5">
          <div class="text-[11px] font-bold text-cyan-700 uppercase">รวมค่าน้ำ-ค่าไฟ</div>
          <div class="text-lg font-extrabold text-cyan-900 font-mono">฿{{ (summaryTotals.waterTotal + summaryTotals.electricTotal).toLocaleString() }}</div>
        </div>

        <div class="p-3.5 bg-emerald-50/70 border border-emerald-100 rounded-xl space-y-0.5">
          <div class="text-[11px] font-bold text-emerald-700 uppercase">ยอดรวมสุทธิ (Grand Total)</div>
          <div class="text-lg font-extrabold text-emerald-900 font-mono">฿{{ summaryTotals.grandTotal.toLocaleString() }}</div>
        </div>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="p-12 text-center text-slate-500 bg-white rounded-2xl border border-slate-200 shadow-xs">
      <div class="animate-spin w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full mx-auto mb-3"></div>
      กำลังโหลดรายการบิลร่าง...
    </div>

    <!-- Empty State -->
    <div v-else-if="draftInvoices.length === 0" class="p-12 text-center text-slate-400 bg-white rounded-2xl border border-slate-200 shadow-xs space-y-2">
      <div class="text-3xl">🎉</div>
      <p class="font-semibold text-slate-700">ไม่พบบิลสถานะ Draft ค้างอยู่</p>
      <p class="text-xs text-slate-500">บิลทั้งหมดได้รับการยืนยัน Publish และส่งหาผู้เช่าเรียบร้อยแล้ว</p>
    </div>

    <!-- Draft Invoices List Table -->
    <div v-else class="bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden">
      <div class="overflow-x-auto">
        <table class="w-full text-left text-xs sm:text-sm text-slate-700">
          <thead class="bg-slate-50 text-[11px] font-bold text-slate-500 uppercase tracking-wider border-b border-slate-200">
            <tr>
              <th class="p-3.5">Invoice #</th>
              <th class="p-3.5">ห้อง / ผู้เช่า</th>
              <th class="p-3.5">รอบบิล</th>
              <th class="p-3.5 text-right">ค่าเช่าห้อง</th>
              <th class="p-3.5 text-right">ค่าน้ำประปา</th>
              <th class="p-3.5 text-right">ค่าไฟฟ้า</th>
              <th class="p-3.5 text-right">ค่าส่วนกลาง</th>
              <th class="p-3.5 text-right">ค่าอื่นๆ</th>
              <th class="p-3.5 text-right font-bold text-slate-900">ยอดรวมสุทธิ</th>
              <th class="p-3.5 text-center">สถานะ</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100">
            <tr v-for="inv in draftInvoices" :key="inv.id" class="hover:bg-slate-50/70 transition-colors">
              <td class="p-3.5 font-mono text-xs font-bold text-indigo-700">{{ inv.invoiceNumber }}</td>
              <td class="p-3.5 space-y-0.5">
                <div class="font-bold text-slate-900">Room {{ inv.room?.roomNumber }}</div>
                <div class="text-xs text-slate-500">
                  {{ inv.tenant ? `${inv.tenant.firstName} ${inv.tenant.lastName}` : 'N/A' }}
                </div>
              </td>
              <td class="p-3.5 font-mono text-xs text-slate-600">{{ inv.billingCycle }}</td>
              <td class="p-3.5 text-right font-mono font-semibold">฿{{ Number(inv.roomPrice).toLocaleString() }}</td>
              <td class="p-3.5 text-right font-mono font-semibold text-cyan-700">฿{{ Number(inv.waterTotal).toLocaleString() }}</td>
              <td class="p-3.5 text-right font-mono font-semibold text-amber-700">฿{{ Number(inv.electricTotal).toLocaleString() }}</td>
              <td class="p-3.5 text-right font-mono text-slate-600">฿{{ Number(inv.commonFee).toLocaleString() }}</td>
              <td class="p-3.5 text-right font-mono text-slate-600">
                <span>฿{{ Number(inv.otherFee).toLocaleString() }}</span>
                <div v-if="inv.otherFeeNote" class="text-[10px] text-slate-400 truncate max-w-[100px]">{{ inv.otherFeeNote }}</div>
              </td>
              <td class="p-3.5 text-right font-mono font-extrabold text-indigo-950 text-sm sm:text-base bg-indigo-50/30">
                ฿{{ Number(inv.grandTotal).toLocaleString() }}
              </td>
              <td class="p-3.5 text-center">
                <span class="text-[10px] font-extrabold px-2.5 py-1 rounded-full bg-purple-100 text-purple-800 uppercase tracking-wider">
                  DRAFT (ร่าง)
                </span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import { useBuildingStore } from '@/stores/useBuildingStore';
import api from '@/utils/api';

const buildingStore = useBuildingStore();
const loading = ref(false);
const publishing = ref(false);
const draftInvoices = ref([]);

onMounted(() => {
  fetchDraftInvoices();
});

watch(
  () => buildingStore.activeBuildingId,
  () => {
    fetchDraftInvoices();
  }
);

/**
 * ดึงรายการบิลร่าง (GET /api/v1/invoices?buildingId=...&status=draft)
 */
const fetchDraftInvoices = async () => {
  if (!buildingStore.activeBuildingId) return;

  loading.value = true;
  try {
    const res = await api.get('/api/v1/invoices', {
      params: {
        buildingId: buildingStore.activeBuildingId,
        status: 'draft'
      }
    });

    if (res.data.success) {
      draftInvoices.value = res.data.data || [];
    }
  } catch (error) {
    console.error('Failed to fetch draft invoices:', error);
  } finally {
    loading.value = false;
  }
};

/**
 * สรุปผลรวมทางด้านการเงินของบิลร่าง
 */
const summaryTotals = computed(() => {
  return draftInvoices.value.reduce(
    (acc, inv) => {
      acc.roomPrice += Number(inv.roomPrice || 0);
      acc.waterTotal += Number(inv.waterTotal || 0);
      acc.electricTotal += Number(inv.electricTotal || 0);
      acc.commonFee += Number(inv.commonFee || 0);
      acc.otherFee += Number(inv.otherFee || 0);
      acc.grandTotal += Number(inv.grandTotal || 0);
      return acc;
    },
    { roomPrice: 0, waterTotal: 0, electricTotal: 0, commonFee: 0, otherFee: 0, grandTotal: 0 }
  );
});

/**
 * ยืนยันการออกบิลและส่ง LINE Notification (POST /api/admin/buildings/:buildingId/invoices/publish)
 */
const handlePublishInvoices = async () => {
  if (draftInvoices.value.length === 0) return;

  if (
    !confirm(
      `ยืนยันการเปลี่ยนสถานะบิลเป็น Pending และส่ง LINE Flex Message แจ้งบิลไปยังผู้เช่าจำนวน ${draftInvoices.value.length} รายใช่หรือไม่?`
    )
  ) {
    return;
  }

  publishing.value = true;
  try {
    const res = await api.post(`/api/admin/buildings/${buildingStore.activeBuildingId}/invoices/publish`, {
      invoiceIds: draftInvoices.value.map((inv) => inv.id)
    });

    if (res.data.success) {
      alert(res.data.message || 'ยืนยันบิลสำเร็จและส่งแจ้งเตือนเรียบร้อยแล้ว!');
      fetchDraftInvoices();
    }
  } catch (error) {
    console.error('Failed to publish invoices:', error);
    alert(error.response?.data?.message || 'เกิดข้อผิดพลาดในการยืนยันบิล');
  } finally {
    publishing.value = false;
  }
};
</script>
