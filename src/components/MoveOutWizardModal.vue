<template>
  <teleport to="body">
    <div v-if="show" class="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto print:p-0 print:bg-white print:static">
      <div id="print-refund-root" class="bg-white rounded-3xl border border-slate-200 shadow-2xl w-full max-w-3xl overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-150 print:border-none print:shadow-none print:m-0 print:max-w-none print:w-full">
        <!-- Modal Header (Hidden on Print) -->
        <div class="px-6 py-4 bg-slate-900 text-white flex items-center justify-between print:hidden">
          <div class="flex items-center gap-2">
            <span class="text-2xl">💵</span>
            <div>
              <h3 class="font-bold text-base text-white leading-tight">
                ระบบแจ้งย้ายออก & คำนวณคืนเงินมัดจำ (ห้อง {{ room?.roomNumber }})
              </h3>
              <p class="text-xs text-slate-400">
                ผู้เช่า: {{ tenantName }} | สัญญาเงินมัดจำ: ฿{{ Number(lease?.depositAmount || 0).toLocaleString() }}
              </p>
            </div>
          </div>
          <button @click="emit('close')" class="text-slate-400 hover:text-white p-1 rounded-lg cursor-pointer">✕</button>
        </div>

        <!-- Stepper Progress Bar (Hidden on Print) -->
        <div class="px-8 py-4 bg-slate-50 border-b border-slate-200 print:hidden">
          <div class="flex items-center justify-between relative">
            <div class="absolute left-0 right-0 top-1/2 -translate-y-1/2 h-1 bg-slate-200 z-0"></div>
            <div
              class="absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-emerald-500 transition-all duration-300 z-0"
              :style="{ width: step === 1 ? '0%' : step === 2 ? '50%' : '100%' }"
            ></div>

            <!-- Step 1 Indicator -->
            <div class="relative z-10 flex flex-col items-center gap-1 cursor-pointer" @click="step = 1">
              <div class="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all" :class="step >= 1 ? 'bg-emerald-600 text-white shadow-md' : 'bg-slate-200 text-slate-600'">
                1
              </div>
              <span class="text-[11px] font-bold" :class="step === 1 ? 'text-emerald-700' : 'text-slate-500'">จดมิเตอร์วันออก</span>
            </div>

            <!-- Step 2 Indicator -->
            <div class="relative z-10 flex flex-col items-center gap-1 cursor-pointer" @click="step = 2">
              <div class="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all" :class="step >= 2 ? 'bg-emerald-600 text-white shadow-md' : 'bg-slate-200 text-slate-600'">
                2
              </div>
              <span class="text-[11px] font-bold" :class="step === 2 ? 'text-emerald-700' : 'text-slate-500'">รายการหักเงิน</span>
            </div>

            <!-- Step 3 Indicator -->
            <div class="relative z-10 flex flex-col items-center gap-1 cursor-pointer" @click="step = 3">
              <div class="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all" :class="step === 3 ? 'bg-emerald-600 text-white shadow-md' : 'bg-slate-200 text-slate-600'">
                3
              </div>
              <span class="text-[11px] font-bold" :class="step === 3 ? 'text-emerald-700' : 'text-slate-500'">สรุปคืนเงินมัดจำ</span>
            </div>
          </div>
        </div>

        <!-- Wizard Step Content (Hidden on Print) -->
        <div class="p-6 space-y-6 print:hidden">
          <!-- STEP 1: Final Meter Readings -->
          <div v-if="step === 1" class="space-y-4 animate-in fade-in duration-150">
            <div class="bg-indigo-50 border border-indigo-200 p-4 rounded-2xl flex items-center justify-between text-xs">
              <div>
                <span class="font-bold text-indigo-900">📅 วันที่แจ้งย้ายออกจริง:</span>
                <input
                  v-model="form.moveOutDate"
                  type="date"
                  class="ml-2 bg-white border border-indigo-300 rounded-lg px-2.5 py-1 font-mono font-bold text-indigo-950"
                />
              </div>
              <div class="text-right text-indigo-700">
                เงินมัดจำในสัญญา: <span class="font-black font-mono text-sm text-indigo-950">฿{{ depositAmount.toLocaleString() }}</span>
              </div>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <!-- Water Meter -->
              <div class="p-4 bg-blue-50/60 border border-blue-200 rounded-2xl space-y-3">
                <div class="flex items-center justify-between border-b border-blue-200 pb-2">
                  <span class="font-bold text-xs text-blue-900 flex items-center gap-1">💧 มิเตอร์น้ำวันย้ายออก</span>
                  <span class="text-[10px] bg-blue-100 text-blue-800 font-bold px-2 py-0.5 rounded-full">อัตรา ฿{{ waterRate }}/ยูนิต</span>
                </div>

                <div class="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <label class="block text-[10px] text-slate-500 font-bold">เลขเดิมครั้งก่อน</label>
                    <input :value="oldWater" readonly class="w-full bg-slate-100 border border-slate-300 rounded-xl px-3 py-1.5 font-mono text-slate-600 font-bold" />
                  </div>
                  <div>
                    <label class="block text-[10px] text-blue-800 font-bold">เลขใหม่วันย้ายออก</label>
                    <input v-model.number="form.finalWaterMeter" type="number" min="0" class="w-full bg-white border border-blue-400 rounded-xl px-3 py-1.5 font-mono font-bold text-blue-950 focus:ring-2 focus:ring-blue-500/20" />
                  </div>
                </div>

                <div class="pt-2 border-t border-blue-200/60 flex justify-between text-xs font-mono">
                  <span class="text-slate-600">ยูนิตที่ใช้: <b class="text-blue-900">{{ waterUsage }}</b> หน่วย</span>
                  <span class="font-black text-blue-900">รวม ฿{{ finalWaterTotal.toLocaleString() }}</span>
                </div>
              </div>

              <!-- Electric Meter -->
              <div class="p-4 bg-amber-50/60 border border-amber-200 rounded-2xl space-y-3">
                <div class="flex items-center justify-between border-b border-amber-200 pb-2">
                  <span class="font-bold text-xs text-amber-900 flex items-center gap-1">⚡ มิเตอร์ไฟวันย้ายออก</span>
                  <span class="text-[10px] bg-amber-100 text-amber-800 font-bold px-2 py-0.5 rounded-full">อัตรา ฿{{ electricRate }}/ยูนิต</span>
                </div>

                <div class="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <label class="block text-[10px] text-slate-500 font-bold">เลขเดิมครั้งก่อน</label>
                    <input :value="oldElectric" readonly class="w-full bg-slate-100 border border-slate-300 rounded-xl px-3 py-1.5 font-mono text-slate-600 font-bold" />
                  </div>
                  <div>
                    <label class="block text-[10px] text-amber-800 font-bold">เลขใหม่วันย้ายออก</label>
                    <input v-model.number="form.finalElectricMeter" type="number" min="0" class="w-full bg-white border border-amber-400 rounded-xl px-3 py-1.5 font-mono font-bold text-amber-950 focus:ring-2 focus:ring-amber-500/20" />
                  </div>
                </div>

                <div class="pt-2 border-t border-amber-200/60 flex justify-between text-xs font-mono">
                  <span class="text-slate-600">ยูนิตที่ใช้: <b class="text-amber-900">{{ electricUsage }}</b> หน่วย</span>
                  <span class="font-black text-amber-900">รวม ฿{{ finalElectricTotal.toLocaleString() }}</span>
                </div>
              </div>
            </div>

            <div class="flex justify-end pt-4">
              <button
                @click="step = 2"
                class="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all shadow-md cursor-pointer flex items-center gap-1"
              >
                <span>ถัดไป: รายการหักเงิน ➔</span>
              </button>
            </div>
          </div>

          <!-- STEP 2: Deductions & Damage Charges -->
          <div v-else-if="step === 2" class="space-y-4 animate-in fade-in duration-150">
            <div class="flex items-center justify-between">
              <div>
                <h4 class="font-bold text-sm text-slate-900">🛠️ รายการหักเงิน / ค่าทำความสะอาด / ค่าซ่อมแซม</h4>
                <p class="text-xs text-slate-500">ระบุรายการค่าปรับ หรือค่าทำความสะอาดที่ต้องหักออกจากเงินมัดจำ</p>
              </div>
              <button
                @click="addDamageItem"
                class="px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 rounded-xl text-xs font-bold transition-all flex items-center gap-1 cursor-pointer"
              >
                <span>➕ เพิ่มรายการหักเงิน</span>
              </button>
            </div>

            <div v-if="form.damageCharges.length > 0" class="space-y-2 max-h-60 overflow-y-auto p-1">
              <div
                v-for="(item, idx) in form.damageCharges"
                :key="idx"
                class="flex items-center gap-2 bg-slate-50 p-2.5 border border-slate-200 rounded-xl text-xs"
              >
                <input
                  v-model="item.item"
                  type="text"
                  placeholder="ชื่อรายการ (เช่น ค่าทำความสะอาดห้องพัก)"
                  class="flex-1 bg-white border border-slate-300 rounded-lg px-3 py-1.5 font-medium text-slate-900 focus:outline-none"
                />
                <div class="w-32 flex items-center gap-1">
                  <span class="text-slate-400 font-bold">฿</span>
                  <input
                    v-model.number="item.amount"
                    type="number"
                    min="0"
                    placeholder="จำนวนเงิน"
                    class="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 font-mono font-bold text-slate-900 focus:outline-none"
                  />
                </div>
                <button @click="removeDamageItem(idx)" class="text-rose-500 hover:text-rose-700 p-1.5 rounded-lg cursor-pointer">✕</button>
              </div>
            </div>

            <div v-else class="p-8 text-center bg-slate-50 border border-dashed border-slate-300 rounded-2xl text-xs text-slate-400">
              ยังไม่มีรายการหักเงินเพิ่มเติม (กดปุ่ม "เพิ่มรายการหักเงิน" ด้านบนเพื่อระบุ)
            </div>

            <div class="p-3 bg-slate-100 rounded-xl flex justify-between text-xs font-mono font-bold text-slate-800">
              <span>รวมรายการหักเพิ่มเติม (Damage Charges Total):</span>
              <span class="text-rose-600">฿{{ damageTotal.toLocaleString() }}</span>
            </div>

            <div class="flex justify-between pt-4">
              <button @click="step = 1" class="px-5 py-2.5 border border-slate-300 text-slate-700 hover:bg-slate-100 rounded-xl text-xs font-bold cursor-pointer">
                ⬅ ย้อนกลับ
              </button>
              <button @click="step = 3" class="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all shadow-md cursor-pointer flex items-center gap-1">
                <span>ถัดไป: สรุปยอดเงินคืนมัดจำ ➔</span>
              </button>
            </div>
          </div>

          <!-- STEP 3: Summary & Net Refund Ledger -->
          <div v-else-if="step === 3" class="space-y-5 animate-in fade-in duration-150">
            <!-- Accounting Breakdown Table -->
            <div class="bg-slate-50 border border-slate-200 rounded-2xl overflow-hidden divide-y divide-slate-200 text-xs">
              <div class="px-4 py-3 bg-slate-900 text-white font-bold flex justify-between">
                <span>รายละเอียดบัญชีการคืนเงินมัดจำ (Deposit Settlement Ledger)</span>
                <span>จำนวนเงิน (บาท)</span>
              </div>

              <!-- Deposit -->
              <div class="px-4 py-2.5 flex justify-between font-bold text-emerald-800 bg-emerald-50/50">
                <span>➕ เงินประกัน/มัดจำ ( Deposit Amount )</span>
                <span class="font-mono">+ ฿{{ depositAmount.toLocaleString() }}</span>
              </div>

              <!-- Deductions -->
              <div class="px-4 py-2 flex justify-between text-slate-700">
                <span>➖ ค่าน้ำรอบสุดท้าย ({{ waterUsage }} หน่วย × ฿{{ waterRate }})</span>
                <span class="font-mono text-rose-600">- ฿{{ finalWaterTotal.toLocaleString() }}</span>
              </div>

              <div class="px-4 py-2 flex justify-between text-slate-700">
                <span>➖ ค่าไฟรอบสุดท้าย ({{ electricUsage }} หน่วย × ฿{{ electricRate }})</span>
                <span class="font-mono text-rose-600">- ฿{{ finalElectricTotal.toLocaleString() }}</span>
              </div>

              <div v-if="unpaidInvoicesTotal > 0" class="px-4 py-2 flex justify-between text-slate-700">
                <span>➖ บิลค้างชำระเดิมก่อนหน้า (Unpaid Invoices)</span>
                <span class="font-mono text-rose-600">- ฿{{ unpaidInvoicesTotal.toLocaleString() }}</span>
              </div>

              <div v-for="(item, idx) in form.damageCharges" :key="idx" class="px-4 py-2 flex justify-between text-slate-700">
                <span>➖ {{ item.item || 'รายการหักเงิน' }}</span>
                <span class="font-mono text-rose-600">- ฿{{ Number(item.amount || 0).toLocaleString() }}</span>
              </div>

              <!-- Net Refund Total Card -->
              <div class="p-4 flex items-center justify-between" :class="netRefund >= 0 ? 'bg-emerald-100/80 text-emerald-950' : 'bg-rose-100/80 text-rose-950'">
                <div>
                  <div class="text-xs font-bold uppercase">
                    {{ netRefund >= 0 ? '🟢 ยอดเงินมัดจำคงเหลือที่ต้องคืนลูกบ้าน (Net Refund)' : '🔴 ยอดเงินที่ลูกบ้านต้องชำระเพิ่มเติม (Amount Due)' }}
                  </div>
                  <div class="text-[10px] text-slate-600 mt-0.5">
                    {{ netRefund >= 0 ? 'โอนคืนให้ลูกบ้านหลังจากหักลบกลบหนี้เรียบร้อยแล้ว' : 'ลูกบ้านต้องชำระยอดส่วนต่างเพิ่มเติมก่อนส่งมอบห้อง' }}
                  </div>
                </div>

                <div class="text-right font-mono font-black text-2xl" :class="netRefund >= 0 ? 'text-emerald-700' : 'text-rose-700'">
                  ฿{{ Math.abs(netRefund).toLocaleString() }}
                </div>
              </div>
            </div>

            <!-- Action Controls -->
            <div class="flex items-center justify-between pt-2">
              <button @click="step = 2" class="px-4 py-2 border border-slate-300 text-slate-700 hover:bg-slate-100 rounded-xl text-xs font-bold cursor-pointer">
                ⬅ ย้อนกลับ
              </button>

              <div class="flex gap-2">
                <button
                  @click="triggerPrint"
                  class="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-bold transition-all shadow-sm flex items-center gap-1 cursor-pointer"
                >
                  <span>🖨️ พิมพ์ใบสรุปคืนเงิน (Refund Voucher)</span>
                </button>

                <button
                  @click="handleConfirmMoveOut"
                  :disabled="processing"
                  class="px-5 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-rose-600/20 cursor-pointer disabled:opacity-50 flex items-center gap-1"
                >
                  <span>{{ processing ? 'กำลังประมวลผล...' : '✅ ยืนยันการย้ายออก (Confirm)' }}</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Printable Document: Refund Settlement Voucher (Only Visible on Print) -->
        <div class="hidden print:block p-8 space-y-6 text-slate-900 text-xs leading-normal">
          <div class="text-center border-b border-slate-900 pb-4 space-y-1">
            <h2 class="text-xl font-bold uppercase tracking-wide">{{ room?.building?.name || 'หอพัก' }}</h2>
            <h3 class="text-base font-semibold">ใบสรุปการคืนเงินประกัน/มัดจำ (Refund Settlement Voucher)</h3>
            <p class="text-[10px] text-slate-600">วันที่ทำรายการ: {{ new Date().toLocaleDateString('th-TH') }}</p>
          </div>

          <div class="grid grid-cols-2 gap-4 text-xs font-medium">
            <div>
              <div><b>ห้องพัก:</b> {{ room?.roomNumber }} (ชั้น {{ room?.floor }})</div>
              <div><b>ชื่อผู้เช่า:</b> {{ tenantName }}</div>
              <div><b>เบอร์โทรศัพท์:</b> {{ lease?.tenant?.phone || '-' }}</div>
            </div>
            <div class="text-right">
              <div><b>วันที่เริ่มสัญญา:</b> {{ formatDate(lease?.startDate) }}</div>
              <div><b>วันที่ย้ายออกจริง:</b> {{ formatDate(form.moveOutDate) }}</div>
              <div><b>สถานะการคืนเงิน:</b> {{ netRefund >= 0 ? 'คืนเงินมัดจำ' : 'ชำระเพิ่ม' }}</div>
            </div>
          </div>

          <table class="w-full border-collapse border border-slate-900 text-xs">
            <thead>
              <tr class="bg-slate-200 text-slate-900 border-b border-slate-900">
                <th class="border border-slate-900 px-3 py-2 text-left">รายการ (Description)</th>
                <th class="border border-slate-900 px-3 py-2 text-right">จำนวนเงิน (บาท)</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td class="border border-slate-900 px-3 py-1.5 font-bold">เงินประกัน/มัดจำในสัญญา (Deposit)</td>
                <td class="border border-slate-900 px-3 py-1.5 text-right font-mono font-bold">+ ฿{{ depositAmount.toLocaleString() }}</td>
              </tr>
              <tr>
                <td class="border border-slate-900 px-3 py-1.5">ค่าน้ำรอบสุดท้าย (มิเตอร์ {{ oldWater }} ➔ {{ form.finalWaterMeter }} = {{ waterUsage }} หน่วย)</td>
                <td class="border border-slate-900 px-3 py-1.5 text-right font-mono text-rose-700">- ฿{{ finalWaterTotal.toLocaleString() }}</td>
              </tr>
              <tr>
                <td class="border border-slate-900 px-3 py-1.5">ค่าไฟรอบสุดท้าย (มิเตอร์ {{ oldElectric }} ➔ {{ form.finalElectricMeter }} = {{ electricUsage }} หน่วย)</td>
                <td class="border border-slate-900 px-3 py-1.5 text-right font-mono text-rose-700">- ฿{{ finalElectricTotal.toLocaleString() }}</td>
              </tr>
              <tr v-if="unpaidInvoicesTotal > 0">
                <td class="border border-slate-900 px-3 py-1.5">บิลค้างชำระเดิมก่อนหน้า</td>
                <td class="border border-slate-900 px-3 py-1.5 text-right font-mono text-rose-700">- ฿{{ unpaidInvoicesTotal.toLocaleString() }}</td>
              </tr>
              <tr v-for="(item, idx) in form.damageCharges" :key="idx">
                <td class="border border-slate-900 px-3 py-1.5">{{ item.item || 'รายการหักเงิน' }}</td>
                <td class="border border-slate-900 px-3 py-1.5 text-right font-mono text-rose-700">- ฿{{ Number(item.amount || 0).toLocaleString() }}</td>
              </tr>
              <tr class="bg-slate-100 font-bold">
                <td class="border border-slate-900 px-3 py-2 text-right">ยอดสุทธิ {{ netRefund >= 0 ? '(คืนเงินมัดจำ)' : '(ชำระเพิ่ม)' }}:</td>
                <td class="border border-slate-900 px-3 py-2 text-right font-mono text-sm">฿{{ Math.abs(netRefund).toLocaleString() }}</td>
              </tr>
            </tbody>
          </table>

          <!-- Signature Section -->
          <div class="grid grid-cols-2 gap-12 pt-12 text-center text-xs">
            <div class="space-y-12">
              <div class="border-b border-dashed border-slate-900 w-3/4 mx-auto"></div>
              <div>
                <div>ลงชื่อ..........................................................ผู้เช่า</div>
                <div class="text-[10px] text-slate-600 font-normal mt-1">( {{ tenantName }} )</div>
                <div class="text-[10px] text-slate-500">ผู้รับเงิน / รับทราบยอดเงินคืนมัดจำ</div>
              </div>
            </div>

            <div class="space-y-12">
              <div class="border-b border-dashed border-slate-900 w-3/4 mx-auto"></div>
              <div>
                <div>ลงชื่อ..........................................................ผู้อนุมัติ</div>
                <div class="text-[10px] text-slate-600 font-normal mt-1">( ผู้จัดการ / เจ้าหน้าที่ออฟฟิศ )</div>
                <div class="text-[10px] text-slate-500">ผู้อนุมัติการคืนเงินมัดจำ</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </teleport>
</template>

<script setup>
import { ref, reactive, computed, watch } from 'vue';
import Swal from 'sweetalert2';
import { showSuccess, showError } from '@/utils/swal';
import api from '@/utils/api';

const props = defineProps({
  show: Boolean,
  lease: Object,
  room: Object
});

const emit = defineEmits(['close', 'completed']);

const step = ref(1);
const processing = ref(false);

const oldWater = ref(0);
const oldElectric = ref(0);
const waterRate = ref(18);
const electricRate = ref(7);
const depositAmount = ref(0);
const unpaidInvoicesTotal = ref(0);

const form = reactive({
  moveOutDate: new Date().toISOString().split('T')[0],
  finalWaterMeter: 0,
  finalElectricMeter: 0,
  damageCharges: [
    { item: 'ค่าทำความสะอาดห้องพัก', amount: 500 }
  ]
});

const tenantName = computed(() => {
  if (!props.lease?.tenant) return 'ผู้เช่า';
  return `${props.lease.tenant.firstName} ${props.lease.tenant.lastName}`;
});

const waterUsage = computed(() => Math.max(0, Number(form.finalWaterMeter || 0) - oldWater.value));
const electricUsage = computed(() => Math.max(0, Number(form.finalElectricMeter || 0) - oldElectric.value));

const finalWaterTotal = computed(() => waterUsage.value * waterRate.value);
const finalElectricTotal = computed(() => electricUsage.value * electricRate.value);

const damageTotal = computed(() => {
  return form.damageCharges.reduce((acc, item) => acc + Number(item.amount || 0), 0);
});

const totalDeductions = computed(() => {
  return finalWaterTotal.value + finalElectricTotal.value + unpaidInvoicesTotal.value + damageTotal.value;
});

const netRefund = computed(() => depositAmount.value - totalDeductions.value);

const fetchCalculation = async () => {
  if (!props.lease?.id) return;

  try {
    const res = await api.get(`/api/admin/leases/${props.lease.id}/move-out-calculation`);
    const d = res.data.data;
    depositAmount.value = d.depositAmount || 0;
    oldWater.value = d.oldWater || 0;
    oldElectric.value = d.oldElectric || 0;
    waterRate.value = d.waterRate || 18;
    electricRate.value = d.electricRate || 7;
    unpaidInvoicesTotal.value = d.unpaidInvoicesTotal || 0;

    form.finalWaterMeter = d.oldWater || 0;
    form.finalElectricMeter = d.oldElectric || 0;
  } catch (err) {
    console.error('Failed to fetch move-out calculation:', err);
  }
};

watch(
  () => props.show,
  (isShown) => {
    if (isShown && props.lease?.id) {
      step.value = 1;
      fetchCalculation();
    }
  }
);

const addDamageItem = () => {
  form.damageCharges.push({ item: '', amount: 0 });
};

const removeDamageItem = (idx) => {
  form.damageCharges.splice(idx, 1);
};

const triggerPrint = () => {
  window.print();
};

const handleConfirmMoveOut = async () => {
  const result = await Swal.fire({
    title: 'ยืนยันการแจ้งย้ายออก?',
    html: `
      <div class="text-xs text-slate-600 text-left space-y-2">
        <p><b>ห้องพัก:</b> ${props.room?.roomNumber || ''} | <b>ผู้เช่า:</b> ${tenantName.value}</p>
        <p class="text-rose-600 font-bold">⚠️ การกระทำนี้จะเปลี่ยนสถานะห้องเป็น "ซ่อมบำรุง", สิ้นสุดสัญญาเช่า, และตัดสิทธิ์การใช้งาน LIFF ของลูกบ้านทันที</p>
      </div>
    `,
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#e11d48',
    cancelButtonColor: '#64748b',
    confirmButtonText: '🚨 ยืนยันย้ายออกและคืนมัดจำ',
    cancelButtonText: 'ยกเลิก'
  });

  if (!result.isConfirmed) return;

  processing.value = true;
  try {
    const res = await api.post(`/api/admin/leases/${props.lease.id}/process-move-out`, {
      moveOutDate: form.moveOutDate,
      finalWaterMeter: form.finalWaterMeter,
      finalElectricMeter: form.finalElectricMeter,
      damageCharges: form.damageCharges,
      adminNote: `คืนเงินมัดจำสุทธิ ฿${netRefund.value.toLocaleString()}`
    });

    await showSuccess('แจ้งย้ายออกสำเร็จ!', res.data.message || 'บันทึกรายการย้ายออกเรียบร้อยแล้ว');
    emit('completed');
    emit('close');
  } catch (err) {
    showError('เกิดข้อผิดพลาด', err.response?.data?.message || 'ไม่สามารถประมวลผลแจ้งย้ายออกได้');
  } finally {
    processing.value = false;
  }
};

const formatDate = (dateStr) => {
  if (!dateStr) return '-';
  return new Date(dateStr).toLocaleDateString('th-TH');
};
</script>

<style>
@media print {
  body > *:not(#print-refund-root) {
    display: none !important;
  }
  #print-refund-root {
    display: block !important;
    position: absolute !important;
    left: 0 !important;
    top: 0 !important;
    width: 100% !important;
  }
}
</style>
