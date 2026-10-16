<template>
  <DialogTitlePrimitive :class="cn('text-base font-semibold text-foreground', $attrs.class)">
    <slot />
  </DialogTitlePrimitive>
</template>

<script setup>
import { DialogTitle as DialogTitlePrimitive } from 'radix-vue';
import { cn } from '@/lib/utils';
</script>
