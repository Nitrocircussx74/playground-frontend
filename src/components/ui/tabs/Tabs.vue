<template>
  <div class="space-y-4">
    <slot />
  </div>
</template>

<script setup>
import { provide, toRef } from 'vue';

const props = defineProps({
  modelValue: {
    type: String,
    required: true
  }
});

const emit = defineEmits(['update:modelValue']);

provide('activeTab', toRef(props, 'modelValue'));
provide('changeTab', (val) => emit('update:modelValue', val));
</script>
