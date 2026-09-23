<template>
  <div class="space-y-4 pb-8 font-sans text-slate-800">
    <!-- Top Header Bar (No print) -->
    <div class="flex items-center justify-between no-print">
      <router-link
        to="/liff/profile"
        class="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-slate-900 transition-colors p-1"
      >
        <ChevronLeft class="w-4 h-4" />
        <span>กลับหน้าหลัก</span>
      </router-link>

      <button
        v-if="contract"
        @click="handlePrint"
        class="px-3.5 py-1.5 bg-teal-600 hover:bg-teal-700 active:scale-95 text-white font-bold text-xs rounded-xl transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
        :style="{ backgroundColor: themeColor }"
      >
        <Printer class="w-3.5 h-3.5" />
        <span>พิมพ์ / บันทึก PDF</span>
      </button>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="p-8 text-center space-y-3 no-print">
      <div class="w-8 h-8 border-3 border-teal-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
      <p class="text-xs text-slate-400 font-medium">กำลังโหลดข้อมูลสัญญาเช่า...</p>
    </div>

    <!-- No Contract Empty State -->
    <div v-else-if="!contract" class="p-8 text-center bg-white rounded-2xl border border-dashed border-slate-200 space-y-2 no-print">
      <FileText class="w-10 h-10 text-slate-300 mx-auto" />
      <h3 class="text-sm font-bold text-slate-700">ไม่พบข้อมูลสัญญาเช่าที่ใช้งานอยู่</h3>
      <p class="text-xs text-slate-400">กรุณาติดต่อเจ้าหน้าที่ดูแลหอพักหากต้องการเปิดดูสัญญาเช่า</p>
    </div>

    <!-- Contract Content -->
    <div v-else class="space-y-4">
      <!-- Summary Highlight Card (No print) -->
      <div class="bg-gradient-to-br from-slate-900 to-slate-800 text-white rounded-3xl p-5 shadow-lg space-y-4 no-print border border-slate-700">
        <div class="flex items-start justify-between">
          <div>
            <span class="px-2 py-0.5 text-[10px] font-bold rounded-md bg-teal-500/20 text-teal-300 border border-teal-500/30">
              สัญญาใช้งานอยู่ (Active)
            </span>
            <h2 class="text-xl font-black mt-1.5">ห้อง {{ contract.room?.roomNumber }}</h2>
            <p class="text-xs text-slate-300">{{ contract.building?.name || 'อาคารหอพัก' }}</p>
          </div>
          <div class="w-10 h-10 rounded-2xl bg-white/10 flex items-center justify-center text-teal-400">
            <FileCheck class="w-5 h-5" />
          </div>
        </div>

        <div class="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-2 border-t border-slate-700/60 text-xs">
          <div class="bg-white/5 p-2.5 rounded-xl border border-white/5">
            <div class="text-[10px] text-slate-400">ค่าเช่ารายเดือน</div>
            <div class="font-black text-sm text-teal-400 mt-0.5">฿{{ Number(contract.room?.price || 0).toLocaleString() }}</div>
          </div>
          <div class="bg-white/5 p-2.5 rounded-xl border border-white/5">
            <div class="text-[10px] text-slate-400">เงินประกันมัดจำ</div>
            <div class="font-black text-sm text-emerald-400 mt-0.5">฿{{ Number(contract.depositAmount || 0).toLocaleString() }}</div>
          </div>
          <div class="bg-white/5 p-2.5 rounded-xl border border-white/5">
            <div class="text-[10px] text-slate-400">วันเริ่มสัญญา</div>
            <div class="font-bold text-[11px] text-slate-200 mt-0.5 font-mono">{{ formatDate(contract.startDate) }}</div>
          </div>
          <div class="bg-white/5 p-2.5 rounded-xl border border-white/5">
            <div class="text-[10px] text-slate-400">วันสิ้นสุดสัญญา</div>
            <div class="font-bold text-[11px] text-slate-200 mt-0.5 font-mono">{{ formatDate(contract.expectedEndDate) }}</div>
          </div>
        </div>
      </div>

      <!-- Printable A4 Contract Sheet -->
      <div
        id="printable-liff-contract"
        class="bg-white text-slate-900 rounded-3xl p-6 sm:p-10 shadow-sm border border-slate-200/80 space-y-6 text-xs sm:text-sm leading-relaxed"
      >
        <!-- Header Title -->
        <div class="text-center space-y-1 pb-4 border-b-2 border-slate-900">
          <h1 class="text-base sm:text-lg font-bold tracking-tight text-slate-950">
            หนังสือสัญญาเช่าห้องพัก / อาคารชุด
          </h1>
          <p class="text-[11px] font-medium text-slate-600">
            RESIDENTIAL LEASE AGREEMENT
          </p>
          <div class="text-[10px] font-mono text-slate-500 pt-1">
            เลขที่สัญญา: <span class="font-bold text-slate-900">{{ contractNumber }}</span>
          </div>
        </div>

        <!-- Date & Place -->
        <div class="flex justify-end text-[11px] font-mono text-slate-700">
          <div>
            ทำที่: <strong>{{ contract.building?.name || 'อาคารหอพัก' }}</strong><br />
            วันที่ทำสัญญา: <strong>{{ formatDateThai(contract.startDate) }}</strong>
          </div>
        </div>

        <!-- Parties -->
        <div class="space-y-2 bg-slate-50/80 p-3.5 rounded-2xl border border-slate-200 text-xs">
          <p class="indent-4 text-justify leading-relaxed">
            สัญญาฉบับนี้ทำขึ้นระหว่าง <strong>{{ contract.building?.name || 'ผู้ให้เช่า' }}</strong> 
            ตั้งอยู่ ณ เลขที่ <strong>{{ contract.building?.address || '-' }}</strong> 
            ซึ่งต่อไปในสัญญานี้เรียกว่า <strong>"ผู้ให้เช่า"</strong> ฝ่ายหนึ่ง กับ
          </p>
          <p class="indent-4 text-justify leading-relaxed">
            <strong>{{ contract.tenant ? `${contract.tenant.firstName} ${contract.tenant.lastName}` : '-' }}</strong>
            หมายเลขประจำตัวประชาชน/ผู้เสียภาษี: <strong>{{ contract.tenant?.idCard || contract.tenant?.companyTaxId || '-' }}</strong>
            โทรศัพท์: <strong>{{ contract.tenant?.phone || '-' }}</strong>
            ซึ่งต่อไปในสัญญานี้เรียกว่า <strong>"ผู้เช่า"</strong> อีกฝ่ายหนึ่ง
          </p>
        </div>

        <!-- Clauses -->
        <div class="space-y-3 text-justify text-xs">
          <div>
            <strong>ข้อ 1. ทรัพย์สินที่เช่า:</strong>
            ผู้ให้เช่าตกลงให้เช่า และผู้เช่าตกลงเช่าห้องพัก <strong>เลขที่ {{ contract.room?.roomNumber || '-' }}</strong>
            ชั้นที่ <strong>{{ contract.room?.floor || '-' }}</strong>
            ของอาคาร <strong>{{ contract.building?.name || '-' }}</strong> เพื่อใช้เป็นที่อยู่อาศัยตามปกติ
          </div>

          <div>
            <strong>ข้อ 2. ระยะเวลาการเช่า:</strong>
            มีกำหนดเวลาตั้งแต่วันที่ <strong>{{ formatDateThai(contract.startDate) }}</strong> ถึงวันที่ <strong>{{ formatDateThai(contract.expectedEndDate) }}</strong>
          </div>

          <div>
            <strong>ข้อ 3. อัตราค่าเช่าและการชำระเงิน:</strong>
            ผู้เช่าตกลงชำระค่าเช่าในอัตราเดือนละ <strong>฿{{ Number(contract.room?.price || 0).toLocaleString() }} บาท</strong>
            โดยกำหนดชำระภายในวันที่ <strong>{{ contract.building?.setting?.dueDateDay || 5 }}</strong> ของทุกเดือน
          </div>

          <div>
            <strong>ข้อ 4. ค่าน้ำประปาและค่าไฟฟ้า:</strong>
            ค่าน้ำประปาหน่วยละ <strong>฿{{ Number(contract.building?.setting?.waterRate || 18).toLocaleString() }} บาท</strong>
            และค่าไฟฟ้าหน่วยละ <strong>฿{{ Number(contract.building?.setting?.electricRate || 7).toLocaleString() }} บาท</strong>
          </div>

          <div>
            <strong>ข้อ 5. เงินประกันความเสียหาย:</strong>
            ผู้เช่าได้วางเงินประกันความเสียหายเป็นจำนวน <strong>฿{{ Number(contract.depositAmount || 0).toLocaleString() }} บาท</strong>
            ไว้แก่ผู้ให้เช่า โดยจะได้รับคืนหลังจากย้ายออกและตรวจสอบสภาพห้องเรียบร้อยแล้ว
          </div>

          <div>
            <strong>ข้อ 6. กฎระเบียบอาคาร:</strong>
            <div class="mt-1 p-3 bg-slate-50 rounded-xl border border-slate-200 whitespace-pre-line text-[11px] text-slate-700 leading-relaxed">
              {{ contract.building?.setting?.termsAndConditions || defaultTerms }}
            </div>
          </div>
        </div>

        <!-- Signatures -->
        <div class="pt-6 border-t border-slate-200">
          <div class="grid grid-cols-2 gap-4 text-center pt-2">
            <div class="space-y-1.5">
              <div class="h-10 flex items-end justify-center">
                <span class="border-b border-dashed border-slate-600 w-36 block"></span>
              </div>
              <div class="text-xs font-bold text-slate-900">
                (...................................................)
              </div>
              <div class="text-[10px] text-slate-500">ผู้ให้เช่า (Lessor)</div>
            </div>

            <div class="space-y-1.5">
              <div class="h-10 flex items-end justify-center">
                <span class="border-b border-dashed border-slate-600 w-36 block"></span>
              </div>
              <div class="text-xs font-bold text-slate-900">
                ({{ contract.tenant ? `${contract.tenant.firstName} ${contract.tenant.lastName}` : '...................................................' }})
              </div>
              <div class="text-[10px] text-slate-500">ผู้เช่า (Lessee)</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { useDynamicTheme } from '@/composables/useDynamicTheme';
import api from '@/utils/api';
import { formatDate } from '@/utils/formatters';
import {
  ChevronLeft,
  Printer,
  FileText,
  FileCheck
} from 'lucide-vue-next';

const route = useRoute();
const { themeColor, applyTheme } = useDynamicTheme();

const contract = ref(null);
const loading = ref(true);

const defaultTerms = `1. ผู้เช่าจะต้องรักษาความสะอาดและความสงบเรียบร้อย ไม่ส่งเสียงดังรบกวนผู้อื่น
2. ห้ามนำสิ่งผิดกฎหมาย วัตถุไวไฟ หรือสารเสพติดเข้ามาในบริเวณอาคารโดยเด็ดขาด
3. ห้ามเลี้ยงสัตว์เลี้ยงทุกชนิด เว้นแต่จะได้รับอนุญาตเป็นลายลักษณ์อักษรจากผู้ให้เช่า
4. ห้ามดัดแปลง ต่อเติม หรือเจาะผนังห้องพักโดยมิได้รับความยินยอมจากผู้ให้เช่า
5. เมื่อครบกำหนดสัญญาหรือประสงค์จะย้ายออก ผู้เช่าต้องแจ้งล่วงหน้าไม่น้อยกว่า 30 วัน`;

const contractNumber = computed(() => {
  if (!contract.value) return 'CTR-0000';
  const start = contract.value.startDate ? new Date(contract.value.startDate) : new Date();
  const year = start.getFullYear();
  const room = contract.value.room?.roomNumber || '000';
  return `CTR-${year}-${room}`;
});

const formatDateThai = (dateStr) => {
  if (!dateStr) return '..............................';
  const d = new Date(dateStr);
  const thaiMonths = [
    'มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน',
    'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม'
  ];
  return `${d.getDate()} ${thaiMonths[d.getMonth()]} พ.ศ. ${d.getFullYear() + 543}`;
};

const fetchContract = async () => {
  loading.value = true;
  try {
    const params = {};
    if (route.query.roomId) params.roomId = route.query.roomId;
    const res = await api.get('/api/v1/liff/contract', { params });
    if (res.data?.success) {
      contract.value = res.data.data;
      if (contract.value?.room) {
        applyTheme(contract.value.room);
      }
    }
  } catch (err) {
    console.warn('Failed to fetch contract:', err);
  } finally {
    loading.value = false;
  }
};

const handlePrint = () => {
  window.print();
};

onMounted(() => {
  fetchContract();
});
</script>

<style>
@media print {
  body > *:not(#app) {
    display: none !important;
  }
  .no-print {
    display: none !important;
  }
  #printable-liff-contract {
    box-shadow: none !important;
    border: none !important;
    padding: 0 !important;
    width: 100% !important;
  }
  * {
    -webkit-print-color-adjust: exact !important;
    print-color-adjust: exact !important;
  }
}
</style>
