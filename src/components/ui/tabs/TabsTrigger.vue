<template>
  <button
    type="button"
    @click="changeTab(value)"
    :class="
      cn(
        'inline-flex items-center justify-center whitespace-nowrap rounded-lg px-4 py-2 text-xs sm:text-sm font-semibold transition-all duration-200 cursor-pointer focus-visible:outline-hidden',
        activeTab === value
          ? activeClass
          : 'text-slate-600 hover:text-slate-900 hover:bg-slate-300/50',
        $attrs.class
      )
    "
  >
    <slot />
  </button>
</template>

<script setup>
import { inject } from 'vue';
import { cn } from '@/lib/utils';

const props = defineProps({
  value: {
    type: String,
    required: true
  },
  activeClass: {
    type: String,
    default: 'bg-white text-cyan-700 shadow-sm shadow-cyan-600/10 font-bold'
  }
});

const activeTab = inject('activeTab');
const changeTab = inject('changeTab');
</script>
