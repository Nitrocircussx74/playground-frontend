<template>
  <input
    :value="modelValue"
    @input="$emit('update:modelValue', $event.target.value)"
    :class="
      cn(
        'flex h-10 w-full rounded-md border border-input bg-background px-3.5 py-2 text-sm text-foreground ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/30 focus-visible:border-ring disabled:cursor-not-allowed disabled:opacity-50 transition-colors shadow-xs',
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
