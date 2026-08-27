<template>
  <button
    type="button"
    @click="changeTab(value)"
    :class="[
      'inline-flex items-center justify-center whitespace-nowrap rounded-lg px-4 py-2 text-xs sm:text-sm font-semibold transition-all duration-200 cursor-pointer focus-visible:outline-hidden',
      activeTab === value
        ? 'bg-white text-purple-700 shadow-sm shadow-purple-600/10 font-bold'
        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-300/50'
    ]"
  >
    <slot />
  </button>
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
const changeTab = inject('changeTab');
</script>
