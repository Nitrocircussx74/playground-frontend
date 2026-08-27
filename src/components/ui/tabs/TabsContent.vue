<template>
  <div v-show="activeTab === value" class="mt-4 focus-visible:outline-hidden">
    <slot />
  </div>
</template>

<script setup>
import { inject } from 'vue';

const props = defineProps({
  value: {
    type: String,
    required: true
  }
});

const activeTab = inject('activeTab');
</script>
