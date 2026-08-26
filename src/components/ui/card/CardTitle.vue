<template>
  <h3 :class="cn('font-semibold leading-none tracking-tight text-xl', $attrs.class)">
    <slot />
  </h3>
</template>

<script setup>
import { cn } from '@/lib/utils';
</script>
