<template>
  <div class="relative inline-flex items-center">
    <VueDatePicker
      v-model="internalDate"
      month-picker
      auto-apply
      :teleport="true"
      :clearable="false"
      input-class-name="cycle-datepicker-input"
      @update:model-value="handleDateChange"
    />
  </div>
</template>

<script setup>
import { ref, watch, onMounted } from 'vue';
import { VueDatePicker } from '@vuepic/vue-datepicker';
import '@vuepic/vue-datepicker/dist/main.css';

const props = defineProps({
  modelValue: {
    type: String,
    default: ''
  }
});

const emit = defineEmits(['update:modelValue', 'change']);

const internalDate = ref({
  month: new Date().getMonth(),
  year: new Date().getFullYear()
});

const parseCycleString = (cycleStr) => {
  if (!cycleStr) return { month: new Date().getMonth(), year: new Date().getFullYear() };
  const parts = cycleStr.split('-');
  if (parts.length === 2) {
    const month = parseInt(parts[0], 10) - 1;
    const year = parseInt(parts[1], 10);
    if (!isNaN(month) && !isNaN(year)) {
      return { month, year };
    }
  }
  return { month: new Date().getMonth(), year: new Date().getFullYear() };
};

const formatToCycleString = (val) => {
  if (!val) return '';
  if (typeof val === 'object' && val.month !== undefined && val.year !== undefined) {
    const m = String(val.month + 1).padStart(2, '0');
    return `${m}-${val.year}`;
  }
  return '';
};

onMounted(() => {
  internalDate.value = parseCycleString(props.modelValue);
});

watch(
  () => props.modelValue,
  (newVal) => {
    internalDate.value = parseCycleString(newVal);
  }
);

const handleDateChange = (val) => {
  const formatted = formatToCycleString(val);
  emit('update:modelValue', formatted);
  emit('change', formatted);
};
</script>

<style>
.cycle-datepicker-input {
  background-color: transparent !important;
  border: none !important;
  font-family: monospace !important;
  font-size: 0.75rem !important;
  font-weight: 700 !important;
  color: #1e293b !important;
  padding: 0 0.5rem !important;
  height: 2.2rem !important;
  width: 7.5rem !important;
  box-shadow: none !important;
}
.dp__theme_light {
  --dp-primary-color: #9333ea;
}
</style>
