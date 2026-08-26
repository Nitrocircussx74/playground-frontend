<template>
  <div class="billing-datepicker-container">
    <VueDatePicker
      v-model="selectedDate"
      month-picker
      auto-apply
      :format="formatMonthYear"
      class="custom-datepicker"
    />
  </div>
</template>

<script setup>
import { ref, watch } from 'vue';
import { VueDatePicker } from '@vuepic/vue-datepicker';
import '@vuepic/vue-datepicker/dist/main.css';

const props = defineProps({
  modelValue: {
    type: String,
    default: '08-2026'
  }
});

const emit = defineEmits(['update:modelValue']);

// แปลงค่าเริ่มต้น '08-2026' เป็น Object { month: 7, year: 2026 }
const parseCycle = (cycleStr) => {
  if (!cycleStr || typeof cycleStr !== 'string' || !cycleStr.includes('-')) {
    const d = new Date();
    return { month: d.getMonth(), year: d.getFullYear() };
  }
  const [m, y] = cycleStr.split('-');
  return { month: Number(m) - 1, year: Number(y) };
};

const selectedDate = ref(parseCycle(props.modelValue));

const formatMonthYear = (date) => {
  if (!date) return '';
  const thaiMonths = [
    'มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน',
    'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม'
  ];

  let mIndex = 0;
  let year = new Date().getFullYear();

  if (typeof date.month === 'number') {
    mIndex = date.month;
    year = date.year;
  } else if (date instanceof Date) {
    mIndex = date.getMonth();
    year = date.getFullYear();
  }

  return `${thaiMonths[mIndex]} ${year + 543}`;
};

watch(selectedDate, (newVal) => {
  if (newVal && typeof newVal.month === 'number' && typeof newVal.year === 'number') {
    const formattedMonth = String(newVal.month + 1).padStart(2, '0');
    const cycle = `${formattedMonth}-${newVal.year}`;
    emit('update:modelValue', cycle);
  }
});
</script>

<style scoped>
.billing-datepicker-container :deep(.dp__input) {
  background-color: #f8fafc;
  border-color: #cbd5e1;
  border-radius: 0.75rem;
  font-size: 0.875rem;
  color: #0f172a;
  padding: 0.5rem 0.75rem;
}
.billing-datepicker-container :deep(.dp__input:focus) {
  border-color: #6366f1;
  box-shadow: 0 0 0 2px rgba(99, 102, 241, 0.1);
}
</style>
