<template>
  <select
    :value="modelValue"
    @change="$emit('update:modelValue', $event.target.value)"
    :class="
      cn(
        'flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/30 focus-visible:border-ring disabled:cursor-not-allowed disabled:opacity-50 transition-colors shadow-xs',
        $attrs.class
      )
    "
  >
    <slot />
  </select>
</template>

<script setup>
import { cn } from '@/lib/utils';

defineProps({
  modelValue: { type: [String, Number], default: '' }
});

defineEmits(['update:modelValue']);
</script>
