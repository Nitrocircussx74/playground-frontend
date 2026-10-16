<template>
  <teleport to="body">
    <div
      v-if="show"
      id="contract-modal-root"
      class="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 overflow-y-auto"
    >
      <div
        class="bg-white w-full max-w-4xl rounded-2xl sm:rounded-3xl shadow-2xl overflow-hidden border border-slate-200 flex flex-col my-auto max-h-[95vh]"
      >
        <!-- Modal Top Action Bar (Hidden in print) -->
        <div class="px-6 py-4 bg-slate-900 text-white flex items-center justify-between no-print shrink-0">
          <div class="flex items-center gap-3">
            <div class="w-9 h-9 rounded-xl bg-teal-500/20 text-teal-400 flex items-center justify-center font-bold">
              <FileText class="w-5 h-5" />
            </div>
            <div>
              <h3 class="font-bold text-sm sm:text-base">หนังสือสัญญาเช่าห้องพัก (E-Contract)</h3>
              <p class="text-xs text-slate-400">เลขที่สัญญา: {{ contractNumber }} | ห้อง {{ lease?.room?.roomNumber }}</p>
            </div>
          </div>

          <div class="flex items-center gap-2">
            <button
              @click="handlePrint"
              class="px-4 py-2 bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs sm:text-sm rounded-xl transition-all shadow-md shadow-teal-600/20 flex items-center gap-1.5 cursor-pointer"
            >
              <Printer class="w-4 h-4" />
              <span>พิมพ์ / บันทึก PDF</span>
            </button>
            <button
              @click="$emit('close')"
              class="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <X class="w-5 h-5" />
            </button>
          </div>
        </div>

        <!-- Scrollable Printable Contract Paper View -->
        <div class="flex-1 overflow-y-auto p-4 sm:p-10 bg-slate-100 flex justify-center">
          <div
            id="printable-contract"
            class="bg-white text-slate-900 font-sans p-8 sm:p-12 shadow-md w-full max-w-[210mm] min-h-[297mm] space-y-6 text-xs sm:text-sm leading-relaxed border border-slate-200 relative"
          >
            <!-- Header Title -->
            <div class="text-center space-y-1 pb-4 border-b-2 border-slate-900">
              <h1 class="text-lg sm:text-xl font-bold tracking-tight text-slate-950">
                หนังสือสัญญาเช่าห้องพัก / อาคารชุด
              </h1>
              <p class="text-xs font-medium text-slate-600">
                RESIDENTIAL LEASE AGREEMENT
              </p>
              <div class="text-[11px] font-mono text-slate-500 pt-1">
                เลขที่สัญญา: <span class="font-bold text-slate-900">{{ contractNumber }}</span>
              </div>
            </div>

            <!-- Date & Place -->
            <div class="flex justify-end text-xs font-mono text-slate-700">
              <div>
                ทำที่: <strong>{{ lease?.building?.name || 'อาคารหอพัก' }}</strong><br />
                วันที่ทำสัญญา: <strong>{{ formatDateThai(lease?.startDate) }}</strong>
              </div>
            </div>

            <!-- Parties (คู่สัญญา) -->
            <div class="space-y-2 bg-slate-50/80 p-4 rounded-xl border border-slate-200">
              <p class="indent-6 text-justify leading-relaxed">
                สัญญาฉบับนี้ทำขึ้นระหว่าง <strong>{{ lease?.building?.name || 'ผู้ให้เช่า' }}</strong> 
                ตั้งอยู่ ณ เลขที่ <strong>{{ lease?.building?.address || '-' }}</strong> 
                โทรศัพท์ <strong>{{ lease?.building?.setting?.phone || '-' }}</strong> 
                ซึ่งต่อไปในสัญญานี้เรียกว่า <strong>"ผู้ให้เช่า"</strong> ฝ่ายหนึ่ง กับ
              </p>
              <p class="indent-6 text-justify leading-relaxed">
                <strong>{{ lease?.tenant ? `${lease.tenant.firstName} ${lease.tenant.lastName}` : '........................................................' }}</strong>
                หมายเลขประจำตัวประชาชน/ผู้เสียภาษี: <strong>{{ lease?.tenant?.idCard || lease?.tenant?.companyTaxId || '-' }}</strong>
                โทรศัพท์: <strong>{{ lease?.tenant?.phone || '-' }}</strong>
                ซึ่งต่อไปในสัญญานี้เรียกว่า <strong>"ผู้เช่า"</strong> อีกฝ่ายหนึ่ง
              </p>
              <p class="text-slate-700 text-xs pt-1 font-medium">
                คู่สัญญาทั้งสองฝ่ายได้ตกลงทำสัญญากันโดยมีข้อความและเงื่อนไขดังต่อไปนี้:
              </p>
            </div>

            <!-- Agreement Clauses -->
            <div class="space-y-3 text-justify">
              <!-- ข้อ 1 -->
              <div>
                <strong>ข้อ 1. ทรัพย์สินที่เช่า</strong>
                <p class="indent-6 mt-0.5 text-slate-800">
                  ผู้ให้เช่าตกลงให้เช่า และผู้เช่าตกลงเช่าห้องพัก <strong>เลขที่ {{ lease?.room?.roomNumber || '-' }}</strong>
                  ชั้นที่ <strong>{{ lease?.room?.floor || '-' }}</strong>
                  {{ lease?.room?.areaSqm ? `พื้นที่ใช้สอยประมาณ ${lease.room.areaSqm} ตารางเมตร` : '' }}
                  ของอาคาร <strong>{{ lease?.building?.name || '-' }}</strong> เพื่อใช้เป็นที่อยู่อาศัยตามปกติ
                </p>
              </div>

              <!-- ข้อ 2 -->
              <div>
                <strong>ข้อ 2. ระยะเวลาการเช่า</strong>
                <p class="indent-6 mt-0.5 text-slate-800">
                  คู่สัญญาตกลงเช่าห้องพักมีกำหนดเวลาตั้งแต่วันที่ 
                  <strong>{{ formatDateThai(lease?.startDate) }}</strong> ถึงวันที่ 
                  <strong>{{ formatDateThai(lease?.expectedEndDate) }}</strong>
                </p>
              </div>

              <!-- ข้อ 3 -->
              <div>
                <strong>ข้อ 3. อัตราค่าเช่าและการชำระเงิน</strong>
                <p class="indent-6 mt-0.5 text-slate-800">
                  ผู้เช่าตกลงชำระค่าเช่าในอัตราเดือนละ <strong>฿{{ Number(lease?.room?.price || 0).toLocaleString() }} บาท</strong>
                  ({{ formatThaiBahtText(Number(lease?.room?.price || 0)) }})
                  โดยกำหนดชำระภายในวันที่ <strong>{{ lease?.building?.setting?.dueDateDay || 5 }}</strong> ของทุกเดือน
                  หากชำระเกินกำหนดเวลา ผู้เช่ายินยอมเสียค่าปรับตามระเบียบของอาคาร
                  {{ lease?.building?.setting?.lateFeeType === 'DAILY' ? `(วันละ ${Number(lease?.building?.setting?.lateFeeAmount || 0).toLocaleString()} บาท)` : (lease?.building?.setting?.lateFeeType === 'FLAT' ? `(ครั้งละ ${Number(lease?.building?.setting?.lateFeeAmount || 0).toLocaleString()} บาท)` : '') }}
                </p>
              </div>

              <!-- ข้อ 4 -->
              <div>
                <strong>ข้อ 4. ค่าน้ำประปา ค่าไฟฟ้า และค่าบริการส่วนกลาง</strong>
                <p class="indent-6 mt-0.5 text-slate-800">
                  ผู้เช่าตกลงชำระค่าน้ำประปาในอัตราหน่วยละ <strong>฿{{ Number(lease?.building?.setting?.waterRate || 18).toLocaleString() }} บาท</strong>
                  และค่าไฟฟ้าในอัตราหน่วยละ <strong>฿{{ Number(lease?.building?.setting?.electricRate || 7).toLocaleString() }} บาท</strong>
                  ตามจำนวนหน่วยที่ใช้จริงในแต่ละเดือน พร้อมทั้งค่าบริการอื่น (ถ้ามี) ตามใบแจ้งหนี้
                </p>
              </div>

              <!-- ข้อ 5 -->
              <div>
                <strong>ข้อ 5. เงินประกันความเสียหายและเงินมัดจำ</strong>
                <p class="indent-6 mt-0.5 text-slate-800">
                  ในวันทำสัญญานี้ ผู้เช่าได้วางเงินประกันความเสียหายเป็นจำนวน 
                  <strong>฿{{ Number(lease?.depositAmount || 0).toLocaleString() }} บาท</strong>
                  ({{ formatThaiBahtText(Number(lease?.depositAmount || 0)) }})
                  ไว้แก่ผู้ให้เช่า โดยเงินประกันนี้ผู้ให้เช่าจะคืนให้แก่ผู้เช่าหลังจากหักค่าเสียหาย หนี้สิน หรือค่าใช้จ่ายค้างชำระ (ถ้ามี) ภายหลังผู้เช่าย้ายออกและส่งมอบห้องพักในสภาพเรียบร้อยแล้ว
                </p>
              </div>

              <!-- ข้อ 6 -->
              <div>
                <strong>ข้อ 6. กฎระเบียบและข้อตกลงการอยู่อาศัย</strong>
                <div class="mt-1 p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-700 whitespace-pre-line leading-relaxed">
                  {{ lease?.building?.setting?.termsAndConditions || defaultTerms }}
                </div>
              </div>
            </div>

            <!-- Signatures Section -->
            <div class="pt-8 border-t border-slate-300">
              <p class="text-xs text-slate-600 mb-6 text-center">
                สัญญานี้ทำขึ้นเป็นสองฉบับมีข้อความถูกต้องตรงกัน คู่สัญญาได้อ่านและเข้าใจข้อความโดยละเอียดแล้ว จึงได้ลงลายมือชื่อไว้เป็นสำคัญ
              </p>

              <div class="grid grid-cols-2 gap-8 text-center pt-2">
                <!-- ผู้ให้เช่า -->
                <div class="space-y-2">
                  <div class="h-12 flex items-end justify-center">
                    <span class="border-b border-dashed border-slate-700 w-48 block"></span>
                  </div>
                  <div class="text-xs font-bold text-slate-900">
                    (............................................................)
                  </div>
                  <div class="text-[11px] text-slate-500">ผู้ให้เช่า (Lessor)</div>
                </div>

                <!-- ผู้เช่า -->
                <div class="space-y-2">
                  <div class="h-12 flex items-end justify-center">
                    <span class="border-b border-dashed border-slate-700 w-48 block"></span>
                  </div>
                  <div class="text-xs font-bold text-slate-900">
                    ({{ lease?.tenant ? `${lease.tenant.firstName} ${lease.tenant.lastName}` : '............................................................' }})
                  </div>
                  <div class="text-[11px] text-slate-500">ผู้เช่า (Lessee)</div>
                </div>

                <!-- พยาน 1 -->
                <div class="space-y-2 pt-4">
                  <div class="h-10 flex items-end justify-center">
                    <span class="border-b border-dashed border-slate-700 w-48 block"></span>
                  </div>
                  <div class="text-xs font-bold text-slate-900">
                    (............................................................)
                  </div>
                  <div class="text-[11px] text-slate-500">พยาน (Witness)</div>
                </div>

                <!-- พยาน 2 -->
                <div class="space-y-2 pt-4">
                  <div class="h-10 flex items-end justify-center">
                    <span class="border-b border-dashed border-slate-700 w-48 block"></span>
                  </div>
                  <div class="text-xs font-bold text-slate-900">
                    (............................................................)
                  </div>
                  <div class="text-[11px] text-slate-500">พยาน (Witness)</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </teleport>
</template>

<script setup>
import { computed } from 'vue';
import { FileText, Printer, X } from 'lucide-vue-next';
import { formatDate } from '@/utils/formatters';

const props = defineProps({
  show: {
    type: Boolean,
    default: false
  },
  lease: {
    type: Object,
    default: () => ({})
  }
});

defineEmits(['close']);

const defaultTerms = `1. ผู้เช่าจะต้องรักษาความสะอาดและความสงบเรียบร้อย ไม่ส่งเสียงดังรบกวนผู้อื่น
2. ห้ามนำสิ่งผิดกฎหมาย วัตถุไวไฟ หรือสารเสพติดเข้ามาในบริเวณอาคารโดยเด็ดขาด
3. ห้ามเลี้ยงสัตว์เลี้ยงทุกชนิด เว้นแต่จะได้รับอนุญาตเป็นลายลักษณ์อักษรจากผู้ให้เช่า
4. ห้ามดัดแปลง ต่อเติม หรือเจาะผนังห้องพักโดยมิได้รับความยินยอมจากผู้ให้เช่า
5. เมื่อครบกำหนดสัญญาหรือประสงค์จะย้ายออก ผู้เช่าต้องแจ้งล่วงหน้าไม่น้อยกว่า 30 วัน`;

const contractNumber = computed(() => {
  if (!props.lease) return 'CTR-0000';
  const start = props.lease.startDate ? new Date(props.lease.startDate) : new Date();
  const year = start.getFullYear();
  const room = props.lease.room?.roomNumber || '000';
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

const formatThaiBahtText = (num) => {
  if (!num || isNaN(num)) return 'ศูนย์บาทถ้วน';
  const numbers = ['', 'หนึ่ง', 'สอง', 'สาม', 'สี่', 'ห้า', 'หก', 'เจ็ด', 'แปด', 'เก้า'];
  const units = ['', 'สิบ', 'ร้อย', 'พัน', 'หมื่น', 'แสน', 'ล้าน'];
  
  let str = Math.floor(num).toString();
  let len = str.length;
  let text = '';
  
  for (let i = 0; i < len; i++) {
    let digit = parseInt(str.charAt(i));
    let pos = len - i - 1;
    if (digit !== 0) {
      if (pos === 1 && digit === 1) {
        text += 'สิบ';
      } else if (pos === 1 && digit === 2) {
        text += 'ยี่สิบ';
      } else if (pos === 0 && digit === 1 && len > 1) {
        text += 'เอ็ด';
      } else {
        text += numbers[digit] + units[pos];
      }
    }
  }
  return (text || 'ศูนย์') + 'บาทถ้วน';
};

const handlePrint = () => {
  window.print();
};
</script>

<style>
@media print {
  body > *:not(#contract-modal-root) {
    display: none !important;
  }
  #contract-modal-root {
    position: static !important;
    background: transparent !important;
    padding: 0 !important;
    display: block !important;
    width: 100% !important;
    height: auto !important;
    overflow: visible !important;
  }
  #contract-modal-root > div {
    max-width: 100% !important;
    width: 100% !important;
    box-shadow: none !important;
    border: none !important;
    border-radius: 0 !important;
    margin: 0 !important;
  }
  #printable-contract {
    box-shadow: none !important;
    border: none !important;
    padding: 0 !important;
    width: 100% !important;
    max-width: 100% !important;
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
