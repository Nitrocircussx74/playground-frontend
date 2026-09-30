<template>
  <DropdownMenuItemPrimitive
    :class="
      cn(
        'flex items-center gap-2 rounded-lg px-2.5 py-2 text-xs font-medium text-slate-700 outline-none cursor-pointer transition-colors hover:bg-slate-100 focus:bg-slate-100 data-[disabled]:pointer-events-none data-[disabled]:opacity-50',
        $attrs.class
      )
    "
  >
    <slot />
  </DropdownMenuItemPrimitive>
</template>

<script setup>
import { DropdownMenuItem as DropdownMenuItemPrimitive } from 'radix-vue';
import { cn } from '@/lib/utils';
</script>
