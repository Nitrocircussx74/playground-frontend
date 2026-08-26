<template>
  <input
    :value="modelValue"
    @input="$emit('update:modelValue', $event.target.value)"
    :class="
      cn(
        'flex h-10 w-full rounded-md border border-slate-800 bg-slate-900/60 px-3.5 py-2 text-sm text-slate-100 ring-offset-slate-950 file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-slate-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-500/50 focus-visible:border-purple-500 disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-200',
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
