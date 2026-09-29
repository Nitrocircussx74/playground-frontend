<template>
  <DialogPortal>
    <DialogOverlay class="fixed inset-0 z-50 bg-slate-900/50" />
    <DialogContentPrimitive
      :class="
        cn(
          'fixed left-1/2 top-1/2 z-50 grid w-full max-w-lg -translate-x-1/2 -translate-y-1/2 gap-4 rounded-xl border border-border bg-card p-6 text-card-foreground shadow-lg max-h-[90vh] overflow-y-auto',
          $attrs.class
        )
      "
    >
      <slot />
      <DialogClose
        class="absolute right-4 top-4 rounded-sm text-muted-foreground hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        <X class="h-4 w-4" />
        <span class="sr-only">ปิด</span>
      </DialogClose>
    </DialogContentPrimitive>
  </DialogPortal>
</template>

<script setup>
import { DialogPortal, DialogOverlay, DialogContent as DialogContentPrimitive, DialogClose } from 'radix-vue';
import { X } from 'lucide-vue-next';
import { cn } from '@/lib/utils';
</script>
