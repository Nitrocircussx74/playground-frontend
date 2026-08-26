<template>
  <input
    :value="modelValue"
    @input="$emit('update:modelValue', $event.target.value)"
    :class="
      cn(
        'flex h-10 w-full rounded-md border border-slate-300 bg-white px-3.5 py-2 text-sm text-slate-900 ring-offset-white file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-slate-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-600/30 focus-visible:border-purple-600 disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-200 shadow-sm',
        $attrs.class
      )
    "
  />
</template>

<script setup>
import { cn } from '@/lib/utils';

defineProps({
  modelValue: { type: [String, Number], default: '' }
});

defineEmits(['update:modelValue']);
</script>
