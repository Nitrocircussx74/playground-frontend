<template>
  <div v-if="show" class="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
    <div class="bg-white rounded-3xl p-6 sm:p-8 max-w-2xl w-full shadow-2xl space-y-6 border border-slate-200 relative my-8">
      <!-- Close Button -->
      <button
        @click="closeModal"
        class="absolute top-5 right-5 text-slate-400 hover:text-slate-700 p-1.5 rounded-full hover:bg-slate-100 transition-colors cursor-pointer"
      >
        <X class="w-5 h-5" />
      </button>

      <!-- Modal Header -->
      <div class="flex items-center gap-3.5 border-b border-slate-100 pb-4">
        <div class="w-12 h-12 rounded-2xl bg-gradient-to-tr from-purple-600 via-indigo-600 to-purple-500 flex items-center justify-center text-white shadow-md shadow-purple-600/30 shrink-0">
          <UserPlus class="w-6 h-6" />
        </div>
        <div>
          <h2 class="text-lg sm:text-xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <span>ลงทะเบียนผู้เช่าใหม่ & ทำสัญญาเข้าพัก</span>
            <span class="text-[11px] font-bold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
              Walk-in / ไม่ใช้ LINE
            </span>
          </h2>
          <p class="text-xs text-slate-500 mt-0.5">
            บันทึกประวัติผู้เช่า ย้ายเข้าห้องพัก และสร้างสัญญาเช่าอัตโนมัติ (สามารถผูก LINE ย้อนหลังได้)
          </p>
        </div>
      </div>

      <!-- Form -->
      <form @submit.prevent="handleSubmit" class="space-y-6">
        <!-- Section 1: ข้อมูลผู้เช่า -->
        <div class="space-y-3">
          <div class="text-xs font-extrabold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
            <User class="w-3.5 h-3.5 text-purple-600" />
            <span>1. ข้อมูลส่วนตัวผู้เช่า (Tenant Profile)</span>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label class="block text-xs font-bold text-slate-700 mb-1">ชื่อจริง <span class="text-rose-500">*</span></label>
              <input
                v-model="form.firstName"
                type="text"
                placeholder="เช่น สมชาย"
                required
                class="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-sm text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500"
              />
            </div>

            <div>
              <label class="block text-xs font-bold text-slate-700 mb-1">นามสกุล <span class="text-rose-500">*</span></label>
              <input
                v-model="form.lastName"
                type="text"
                placeholder="เช่น ใจดี"
                required
                class="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-sm text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500"
              />
            </div>

            <div>
              <label class="block text-xs font-bold text-slate-700 mb-1">เบอร์โทรศัพท์ <span class="text-rose-500">*</span></label>
              <input
                v-model="form.phone"
                type="tel"
                placeholder="เช่น 0812345678"
                required
                class="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-sm text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 font-mono"
              />
            </div>

            <div>
              <label class="block text-xs font-bold text-slate-700 mb-1">เลขบัตรประชาชน / พาสปอร์ต</label>
              <input
                v-model="form.idCard"
                type="text"
                placeholder="เลข 13 หลัก หรือ Passport ID"
                class="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-sm text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 font-mono"
              />
            </div>
          </div>
        </div>

        <!-- Section 2: เลือกห้องพัก / พื้นที่เช่า -->
        <div class="space-y-3 pt-2 border-t border-slate-100">
          <div class="text-xs font-extrabold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
            <DoorOpen class="w-3.5 h-3.5 text-indigo-600" />
            <span>2. เลือกห้องพัก / พื้นที่เช่า (Room / Space)</span>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div class="sm:col-span-2">
              <label class="block text-xs font-bold text-slate-700 mb-1">ยูนิตที่ต้องการเข้าพัก <span class="text-rose-500">*</span></label>
              <select
                v-model="form.roomId"
                @change="handleRoomSelect"
                required
                class="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 cursor-pointer font-medium"
              >
                <option value="" disabled>-- กรุณาเลือกห้องพักที่ว่าง --</option>
                <option v-for="r in availableRooms" :key="r.id" :value="r.id">
                  {{ getUnitIcon(r.unitType) }} {{ r.roomNumber }} {{ r.building?.name ? `(${r.building.name})` : '' }} (ชั้น {{ r.floor }}) — ฿{{ Number(r.price).toLocaleString() }}/เดือน {{ r.locationZone ? `[📍 ${r.locationZone}]` : '' }}
                </option>
              </select>
            </div>
          </div>
        </div>

        <!-- Section 3: สัญญาเช่าและการเงิน -->
        <div class="space-y-3 pt-2 border-t border-slate-100">
          <div class="text-xs font-extrabold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
            <FileText class="w-3.5 h-3.5 text-emerald-600" />
            <span>3. รายละเอียดสัญญาเช่า & มัดจำ (Lease Terms)</span>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label class="block text-xs font-bold text-slate-700 mb-1">วันที่เริ่มสัญญา / เข้าอยู่ <span class="text-rose-500">*</span></label>
              <input
                v-model="form.startDate"
                type="date"
                required
                class="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-sm text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500"
              />
            </div>

            <div>
              <label class="block text-xs font-bold text-slate-700 mb-1">วันที่สิ้นสุดสัญญา (โดยประมาณ)</label>
              <input
                v-model="form.expectedEndDate"
                type="date"
                class="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-sm text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500"
              />
            </div>

            <div>
              <label class="block text-xs font-bold text-slate-700 mb-1">เงินประกันมัดจำ (บาท)</label>
              <input
                v-model.number="form.depositAmount"
                type="number"
                step="100"
                placeholder="เช่น 5000"
                class="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-sm text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 font-mono"
              />
            </div>

            <div>
              <label class="block text-xs font-bold text-slate-700 mb-1">บันทึกภายใน / หมายเหตุ (Admin Note)</label>
              <input
                v-model="form.adminNote"
                type="text"
                placeholder="เช่น ผู้เช่า Walk-in ชำระเงินสดแล้ว"
                class="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-sm text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500"
              />
            </div>
          </div>
        </div>

        <!-- Action Buttons -->
        <div class="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
          <button
            type="button"
            @click="closeModal"
            class="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition-all cursor-pointer"
          >
            ยกเลิก (Cancel)
          </button>

          <button
            type="submit"
            :disabled="submitting"
            class="px-6 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-purple-600/25 flex items-center gap-2 disabled:opacity-50 cursor-pointer active:scale-95"
          >
            <span v-if="submitting">กำลังบันทึกข้อมูล...</span>
            <span v-else class="flex items-center gap-1.5">
              <CheckCircle class="w-4 h-4" />
              <span>ยืนยันบันทึกสัญญาเข้าพัก</span>
            </span>
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { reactive, ref, computed, watch } from 'vue';
import api from '@/utils/api';
import { showSuccess, showError } from '@/utils/swal';
import {
  X,
  UserPlus,
  User,
  DoorOpen,
  FileText,
  CheckCircle
} from 'lucide-vue-next';

const props = defineProps({
  show: { type: Boolean, default: false },
  preSelectedRoomId: { type: String, default: '' },
  rooms: { type: Array, default: () => [] }
});

const emit = defineEmits(['close', 'created']);

const submitting = ref(false);

const form = reactive({
  firstName: '',
  lastName: '',
  phone: '',
  idCard: '',
  roomId: '',
  startDate: new Date().toISOString().split('T')[0],
  expectedEndDate: '',
  depositAmount: 0,
  adminNote: ''
});

// Calculate default 1 year end date
const setDefaultEndDate = () => {
  const d = new Date();
  d.setFullYear(d.getFullYear() + 1);
  form.expectedEndDate = d.toISOString().split('T')[0];
};

watch(
  () => props.show,
  (isShowing) => {
    if (isShowing) {
      if (props.preSelectedRoomId) {
        form.roomId = props.preSelectedRoomId;
        handleRoomSelect();
      }
      setDefaultEndDate();
    }
  }
);

const availableRooms = computed(() => {
  return props.rooms.filter((r) => r.status === 'available' || r.id === props.preSelectedRoomId);
});

const handleRoomSelect = () => {
  const selected = props.rooms.find((r) => r.id === form.roomId);
  if (selected && !form.depositAmount) {
    form.depositAmount = Number(selected.price || 0); // ค่ามัดจำเริ่มต้นเท่ากับค่าเช่า 1 เดือน
  }
};

const getUnitIcon = (type) => {
  switch (type) {
    case 'commercial_shop': return '🏪';
    case 'vending_spot': return '☕';
    case 'parking': return '🚗';
    case 'storage': return '📦';
    case 'billboard_rooftop': return '📡';
    default: return '🚪';
  }
};

const closeModal = () => {
  emit('close');
};

const handleSubmit = async () => {
  submitting.value = true;
  try {
    const res = await api.post('/api/admin/tenants/manual', form);
    await showSuccess('สำเร็จ!', res.data?.message || 'ลงทะเบียนผู้เช่าและบันทึกสัญญาเข้าพักเรียบร้อยแล้ว');
    emit('created', res.data?.data);
    closeModal();
    // Reset form
    form.firstName = '';
    form.lastName = '';
    form.phone = '';
    form.idCard = '';
    form.roomId = '';
    form.depositAmount = 0;
    form.adminNote = '';
  } catch (error) {
    showError('เกิดข้อผิดพลาด', error.response?.data?.message || 'Failed to onboard tenant');
  } finally {
    submitting.value = false;
  }
};
</script>
