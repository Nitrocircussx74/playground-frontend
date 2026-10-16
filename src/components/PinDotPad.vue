<template>
  <div>
    <div class="flex items-center justify-center py-1" :class="[dotGapClass, { 'animate-shake': shaking }]" role="group" aria-label="รหัส PIN 6 หลัก">
      <div
        v-for="index in length"
        :key="index"
        class="w-3 h-3 sm:w-3.5 sm:h-3.5 rounded-full transition-all duration-200"
        :class="index <= modelValue.length ? activeDotClass : 'bg-slate-200/60 border border-slate-200'"
      ></div>
    </div>
    <span class="sr-only" aria-live="polite">กรอกรหัส PIN แล้ว {{ modelValue.length }} จาก {{ length }} หลัก</span>

    <slot />

    <div class="grid grid-cols-3 gap-y-2.5 sm:gap-y-3.5 gap-x-4 sm:gap-x-6 justify-items-center max-w-[260px] sm:max-w-[280px] mx-auto mt-2">
      <button
        v-for="num in [1, 2, 3, 4, 5, 6, 7, 8, 9]"
        :key="num"
        type="button"
        :disabled="disabled"
        @click="pressKey(num)"
        class="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-white hover:bg-slate-50 active:bg-slate-100 border border-slate-100 text-slate-700 text-xl font-semibold shadow-2xs transition-all duration-150 active:scale-95 flex items-center justify-center cursor-pointer disabled:opacity-40 touch-manipulation"
      >
        {{ num }}
      </button>

      <button
        type="button"
        :disabled="disabled || modelValue.length === 0"
        @click="clearPin"
        class="w-14 h-14 sm:w-16 sm:h-16 rounded-full flex items-center justify-center text-xs font-bold text-slate-400 hover:text-slate-600 active:scale-95 transition-all cursor-pointer disabled:opacity-0 touch-manipulation"
      >
        {{ clearLabel }}
      </button>

      <button
        type="button"
        :disabled="disabled"
        @click="pressKey(0)"
        class="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-white hover:bg-slate-50 active:bg-slate-100 border border-slate-100 text-slate-700 text-xl font-semibold shadow-2xs transition-all duration-150 active:scale-95 flex items-center justify-center cursor-pointer disabled:opacity-40 touch-manipulation"
      >
        0
      </button>

      <button
        type="button"
        :disabled="disabled || modelValue.length === 0"
        @click="deleteLastKey"
        class="w-14 h-14 sm:w-16 sm:h-16 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-600 active:scale-95 transition-all cursor-pointer disabled:opacity-30 touch-manipulation"
        aria-label="ลบตัวเลข"
      >
        <Delete class="w-5 h-5 sm:w-6 sm:h-6" />
      </button>
    </div>
  </div>
</template>

<script setup>
import { onMounted, onUnmounted } from 'vue';
import { Delete } from 'lucide-vue-next';

const props = defineProps({
  modelValue: { type: String, default: '' },
  length: { type: Number, default: 6 },
  disabled: { type: Boolean, default: false },
  shaking: { type: Boolean, default: false },
  activeDotClass: { type: String, default: 'bg-teal-500 scale-110 shadow-xs ring-4 ring-teal-50' },
  dotGapClass: { type: String, default: 'gap-3 sm:gap-3.5' },
  clearLabel: { type: String, default: 'ล้าง' }
});

const emit = defineEmits(['update:modelValue']);

const triggerHaptic = (pattern = 25) => {
  if (typeof navigator !== 'undefined' && typeof navigator.vibrate === 'function') {
    try {
      navigator.vibrate(pattern);
    } catch {}
  }
};

const pressKey = (num) => {
  if (props.disabled || props.modelValue.length >= props.length) return;
  emit('update:modelValue', props.modelValue + String(num));
  triggerHaptic();
};

const deleteLastKey = () => {
  if (props.disabled || props.modelValue.length === 0) return;
  emit('update:modelValue', props.modelValue.slice(0, -1));
  triggerHaptic();
};

const clearPin = () => {
  if (props.disabled) return;
  emit('update:modelValue', '');
};

const handleKeyDown = (e) => {
  if (props.disabled) return;
  if (/^[0-9]$/.test(e.key)) {
    pressKey(Number(e.key));
  } else if (e.key === 'Backspace') {
    deleteLastKey();
  } else if (e.key === 'Escape') {
    clearPin();
  }
};

onMounted(() => {
  window.addEventListener('keydown', handleKeyDown);
});

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeyDown);
});
</script>
