<template>
  <div :class="cn('rounded-xl border border-border bg-card text-card-foreground shadow-xs', $attrs.class)">
    <slot />
  </div>
</template>

<script setup>
import { cn } from '@/lib/utils';
</script>
