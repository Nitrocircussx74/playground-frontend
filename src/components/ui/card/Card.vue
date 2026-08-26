<template>
  <div :class="cn('rounded-xl border border-slate-200/80 bg-white/90 text-slate-900 shadow-xl shadow-slate-200/50 backdrop-blur-md', $attrs.class)">
    <slot />
  </div>
</template>

<script setup>
import { cn } from '@/lib/utils';
</script>
