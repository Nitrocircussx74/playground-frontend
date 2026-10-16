<template>
  <Card class="p-12 text-center text-slate-400 space-y-2">
    <div class="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center mx-auto text-slate-400 mb-2">
      <component :is="icon" class="w-6 h-6" />
    </div>
    <div class="text-sm font-bold text-slate-700">{{ title }}</div>
    <p class="text-xs">{{ description }}</p>
  </Card>
</template>

<script setup>
import { Card } from '@/components/ui/card';

defineProps({
  icon: { type: [Object, Function], required: true },
  title: { type: String, required: true },
  description: { type: String, default: '' }
});
</script>
