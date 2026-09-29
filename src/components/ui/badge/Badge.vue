<template>
  <span :class="cn(badgeVariants({ variant }), $attrs.class)">
    <slot />
  </span>
</template>

<script setup>
import { cva } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const badgeVariants = cva(
  'inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium',
  {
    variants: {
      variant: {
        neutral: 'bg-slate-100 text-slate-700',
        success: 'bg-emerald-100 text-emerald-700',
        warning: 'bg-amber-100 text-amber-700',
        danger: 'bg-rose-100 text-rose-700'
      }
    },
    defaultVariants: {
      variant: 'neutral'
    }
  }
);

defineProps({
  variant: { type: String, default: 'neutral' }
});
</script>
