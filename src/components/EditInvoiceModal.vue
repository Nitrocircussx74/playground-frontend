<template>
  <div v-if="show" class="fixed inset-0 z-50 bg-slate-950/40 backdrop-blur-xs flex items-center justify-center p-4">
    <div class="bg-white rounded-3xl p-6 max-w-lg w-full shadow-2xl space-y-5 border border-slate-200">
      <!-- Modal Header -->
      <div class="flex items-center justify-between border-b border-slate-100 pb-4">
        <div>
          <h3 class="text-lg font-bold text-slate-900">
            {{ isEditing ? `✏️ แก้ไขใบแจ้งหนี้ ${invoice?.invoiceNumber}` : '📝 สร้างใบแจ้งหนี้แบบปรับแต่ง' }}
          </h3>
          <p class="text-xs text-slate-500">ปรับแต่งค่าน้ำ, ค่าไฟ, ละเว้นส่วนกลาง หรือเพิ่มรายการค่าบริการอื่นๆ ได้หลายรายการ</p>
        </div>
        <button @click="$emit('close')" class="text-slate-400 hover:text-slate-600 font-bold p-1">✕</button>
      </div>

      <!-- Form -->
      <form @submit.prevent="handleSubmit" class="space-y-4 text-xs">
        <!-- Room & Billing Cycle (Create Mode) -->
        <div v-if="!isEditing" class="grid grid-cols-2 gap-3">
          <div>
            <label class="block font-semibold text-slate-700 mb-1">เลือกห้องพัก <span class="text-rose-500">*</span></label>
            <select
              v-model="form.roomId"
              required
              class="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 focus:outline-hidden"
            >
              <option value="" disabled>-- เลือกห้องพัก --</option>
              <option v-for="r in rooms" :key="r.id" :value="r.id">
                ห้อง {{ r.roomNumber }} (฿{{ Number(r.price).toLocaleString() }}/เดือน)
              </option>
            </select>
          </div>

          <div>
            <label class="block font-semibold text-slate-700 mb-1">รอบบิล (Billing Cycle) <span class="text-rose-500">*</span></label>
            <div class="p-1 bg-slate-50 border border-slate-300 rounded-xl">
              <CycleDatePicker v-model="form.billingCycle" />
            </div>
          </div>
        </div>

        <!-- Room Price & Water Total -->
        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="block font-semibold text-slate-700 mb-1">ค่าเช่าห้องพัก (บาท)</label>
            <input
              v-model.number="form.roomPrice"
              type="number"
              min="0"
              required
              class="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 font-mono text-slate-900 focus:outline-hidden"
            />
          </div>

          <div>
            <label class="block font-semibold text-slate-700 mb-1">ค่าน้ำประปา (บาท)</label>
            <input
              v-model.number="form.customWaterTotal"
              type="number"
              min="0"
              placeholder="0"
              class="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 font-mono text-slate-900 focus:outline-hidden"
            />
          </div>
        </div>

        <!-- Electric Total & Common Fee Waive Toggle -->
        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="block font-semibold text-slate-700 mb-1">ค่าไฟฟ้า (บาท)</label>
            <input
              v-model.number="form.customElectricTotal"
              type="number"
              min="0"
              placeholder="0"
              class="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 font-mono text-slate-900 focus:outline-hidden"
            />
          </div>

          <div>
            <label class="block font-semibold text-slate-700 mb-1">ค่าส่วนกลาง (บาท)</label>
            <input
              v-model.number="form.commonFee"
              type="number"
              min="0"
              :disabled="form.waiveCommonFee"
              class="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 font-mono text-slate-900 focus:outline-hidden disabled:bg-slate-100 disabled:text-slate-400"
            />
          </div>
        </div>

        <!-- Common Fee Waive Switch Box -->
        <div class="p-3 bg-indigo-50/70 border border-indigo-200 rounded-2xl flex items-center justify-between">
          <div>
            <span class="font-bold text-indigo-900">🎁 ละเว้น/งดเว้นค่าส่วนกลาง (Waive Common Fee)</span>
            <p class="text-[11px] text-indigo-600">ตั้งค่าส่วนกลางเป็น 0 บาท สำหรับโปรโมชั่นหรือเงื่อนไขพิเศษ</p>
          </div>

          <label class="relative inline-flex items-center cursor-pointer">
            <input type="checkbox" v-model="form.waiveCommonFee" class="sr-only peer" />
            <div class="w-9 h-5 bg-slate-300 peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-indigo-600"></div>
          </label>
        </div>

        <!-- Dynamic Multiple Other Fees Section -->
        <div class="space-y-2 border-t border-slate-100 pt-3">
          <div class="flex items-center justify-between">
            <label class="font-bold text-slate-800">📌 รายการค่าบริการอื่นๆ (เพิ่มได้หลายรายการ)</label>
            <button
              type="button"
              @click="addOtherFeeItem"
              class="px-2.5 py-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-lg text-[11px] font-bold transition-all"
            >
              + เพิ่มรายการ
            </button>
          </div>

          <div v-if="otherFeeItems.length === 0" class="text-slate-400 text-[11px] text-center py-2 bg-slate-50 rounded-xl border border-slate-100">
            ไม่มีรายการค่าบริการอื่นๆ
          </div>

          <div v-else class="space-y-2 max-h-36 overflow-y-auto pr-1">
            <div v-for="(item, idx) in otherFeeItems" :key="idx" class="flex items-center gap-2">
              <input
                v-model="item.note"
                type="text"
                placeholder="ชื่อรายการ (e.g. ค่าที่จอดรถ, ค่าคีย์การ์ด)"
                class="flex-1 bg-slate-50 border border-slate-300 rounded-xl px-3 py-1.5 text-xs text-slate-900 focus:outline-hidden"
              />
              <input
                v-model.number="item.amount"
                type="number"
                min="0"
                placeholder="จำนวนเงิน (บาท)"
                class="w-28 bg-slate-50 border border-slate-300 rounded-xl px-3 py-1.5 text-xs font-mono text-slate-900 focus:outline-hidden"
              />
              <button
                type="button"
                @click="removeOtherFeeItem(idx)"
                class="text-rose-500 hover:text-rose-700 font-bold p-1 text-sm"
              >
                ✕
              </button>
            </div>
          </div>
        </div>

        <!-- Real-time Grand Total Summary Box -->
        <div class="p-4 bg-slate-900 text-white rounded-2xl flex items-center justify-between shadow-xs">
          <div>
            <div class="text-[11px] text-slate-400">ยอดรวมสุทธิ (Grand Total)</div>
            <div class="text-xs text-slate-300">
              ค่าห้อง + ค่าน้ำ + ค่าไฟ + ส่วนกลาง + รายการอื่นๆ ({{ otherFeeItems.length }} รายการ)
            </div>
          </div>

          <div class="text-xl font-extrabold font-mono text-emerald-400">
            ฿{{ calculatedGrandTotal.toLocaleString() }}
          </div>
        </div>

        <!-- Modal Footer -->
        <div class="flex items-center justify-end gap-2 pt-2">
          <button
            type="button"
            @click="$emit('close')"
            class="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-semibold transition-all"
          >
            ยกเลิก
          </button>

          <button
            type="submit"
            :disabled="submitting"
            class="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold transition-all shadow-xs disabled:opacity-50"
          >
            {{ submitting ? 'กำลังบันทึก...' : (isEditing ? 'อัปเดตบิล' : 'สร้างบิลใหม่') }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, watch } from 'vue';
import CycleDatePicker from '@/components/common/CycleDatePicker.vue';
import api from '@/utils/api';
import { showSuccess, showError } from '@/utils/swal';

const props = defineProps({
  show: Boolean,
  invoice: Object,
  rooms: Array
});

const emit = defineEmits(['close', 'saved']);

const submitting = ref(false);
const isEditing = computed(() => !!props.invoice?.id);

const otherFeeItems = ref([
  { note: '', amount: 0 }
]);

const form = reactive({
  roomId: '',
  billingCycle: '09-2026',
  roomPrice: 4500,
  customWaterTotal: 0,
  customElectricTotal: 0,
  waiveCommonFee: false,
  commonFee: 100
});

const addOtherFeeItem = () => {
  otherFeeItems.value.push({ note: '', amount: 0 });
};

const removeOtherFeeItem = (index) => {
  otherFeeItems.value.splice(index, 1);
};

watch(
  () => props.show,
  (newVal) => {
    if (newVal) {
      if (props.invoice?.id) {
        // Edit Mode
        form.roomId = props.invoice.roomId || '';
        form.billingCycle = props.invoice.billingCycle || '09-2026';
        form.roomPrice = Number(props.invoice.roomPrice) || 0;
        form.customWaterTotal = Number(props.invoice.waterTotal) || 0;
        form.customElectricTotal = Number(props.invoice.electricTotal) || 0;
        form.commonFee = Number(props.invoice.commonFee) || 0;
        form.waiveCommonFee = Number(props.invoice.commonFee) === 0;

        // Parse Multiple Other Fee Items
        if (props.invoice.otherFeeNote) {
          try {
            if (props.invoice.otherFeeNote.startsWith('[')) {
              otherFeeItems.value = JSON.parse(props.invoice.otherFeeNote);
            } else {
              otherFeeItems.value = [
                { note: props.invoice.otherFeeNote, amount: Number(props.invoice.otherFee) || 0 }
              ];
            }
          } catch {
            otherFeeItems.value = [
              { note: props.invoice.otherFeeNote, amount: Number(props.invoice.otherFee) || 0 }
            ];
          }
        } else if (Number(props.invoice.otherFee) > 0) {
          otherFeeItems.value = [
            { note: 'ค่าบริการอื่นๆ', amount: Number(props.invoice.otherFee) }
          ];
        } else {
          otherFeeItems.value = [];
        }
      } else {
        // Create Mode
        form.roomId = props.rooms && props.rooms.length > 0 ? props.rooms[0].id : '';
        form.billingCycle = '09-2026';
        form.roomPrice = 4500;
        form.customWaterTotal = 0;
        form.customElectricTotal = 0;
        form.waiveCommonFee = false;
        form.commonFee = 100;
        otherFeeItems.value = [{ note: '', amount: 0 }];
      }
    }
  }
);

watch(
  () => form.waiveCommonFee,
  (waived) => {
    if (waived) {
      form.commonFee = 0;
    } else if (form.commonFee === 0) {
      form.commonFee = 100;
    }
  }
);

const totalOtherFeeAmount = computed(() => {
  return otherFeeItems.value.reduce((sum, item) => sum + (Number(item.amount) || 0), 0);
});

const calculatedGrandTotal = computed(() => {
  const roomP = Number(form.roomPrice) || 0;
  const waterP = Number(form.customWaterTotal) || 0;
  const electricP = Number(form.customElectricTotal) || 0;
  const commonP = form.waiveCommonFee ? 0 : (Number(form.commonFee) || 0);

  return roomP + waterP + electricP + commonP + totalOtherFeeAmount.value;
});

const handleSubmit = async () => {
  submitting.value = true;
  try {
    const validItems = otherFeeItems.value.filter((item) => (Number(item.amount) > 0 || item.note.trim() !== ''));
    const totalOtherFee = validItems.reduce((sum, item) => sum + (Number(item.amount) || 0), 0);
    const otherFeeNoteStr = validItems.length > 0 ? JSON.stringify(validItems) : null;

    const payload = {
      roomId: form.roomId,
      billingCycle: form.billingCycle,
      roomPrice: form.roomPrice,
      customWaterTotal: form.customWaterTotal,
      waterTotal: form.customWaterTotal,
      customElectricTotal: form.customElectricTotal,
      electricTotal: form.customElectricTotal,
      waiveCommonFee: form.waiveCommonFee,
      commonFee: form.waiveCommonFee ? 0 : form.commonFee,
      otherFee: totalOtherFee,
      otherFeeNote: otherFeeNoteStr
    };

    if (isEditing.value) {
      await api.put(`/api/v1/invoices/${props.invoice.id}`, payload);
      await showSuccess('สำเร็จ!', `อัปเดตใบแจ้งหนี้ ${props.invoice.invoiceNumber} เรียบร้อยแล้ว`);
    } else {
      await api.post('/api/v1/invoices', payload);
      await showSuccess('สำเร็จ!', 'สร้างใบแจ้งหนี้เรียบร้อยแล้ว');
    }

    emit('saved');
    emit('close');
  } catch (error) {
    showError('เกิดข้อผิดพลาด', error.response?.data?.message || 'เกิดข้อผิดพลาดในการบันทึกใบแจ้งหนี้');
  } finally {
    submitting.value = false;
  }
};
</script>
