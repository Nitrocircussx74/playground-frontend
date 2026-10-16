<template>
  <DropdownMenuPortal>
    <DropdownMenuContentPrimitive
      :align="align"
      :side-offset="4"
      :class="
        cn(
          'z-50 min-w-40 rounded-xl border border-border bg-card p-1 text-card-foreground shadow-lg',
          $attrs.class
        )
      "
    >
      <slot />
    </DropdownMenuContentPrimitive>
  </DropdownMenuPortal>
</template>

<script setup>
import { DropdownMenuPortal, DropdownMenuContent as DropdownMenuContentPrimitive } from 'radix-vue';
import { cn } from '@/lib/utils';

defineProps({
  align: { type: String, default: 'end' }
});
</script>
