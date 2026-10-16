<template>
  <Card class="p-12 text-center text-slate-500">
    <div class="animate-spin w-8 h-8 border-4 border-cyan-600 border-t-transparent rounded-full mx-auto mb-3"></div>
    <p class="text-xs text-slate-500 font-medium">{{ message }}</p>
  </Card>
</template>

<script setup>
import { Card } from '@/components/ui/card';

defineProps({
  message: { type: String, default: 'กำลังโหลดข้อมูล...' }
});
</script>
