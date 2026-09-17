<template>
  <div
    class="p-4 sm:p-5 rounded-2xl bg-white border border-slate-100 shadow-xs space-y-3 transition-all hover:shadow-md relative overflow-hidden"
  >
    <!-- Top Row: Title & Icon Badge -->
    <div class="flex items-center justify-between gap-2">
      <span class="text-xs font-semibold text-slate-500 truncate">
        {{ title }}
      </span>
      <div
        class="w-8 h-8 rounded-xl flex items-center justify-center shrink-0"
        :class="iconBgClass"
      >
        <component :is="icon" class="w-4 h-4" :class="iconColorClass" />
      </div>
    </div>

    <!-- Value Row & Skeleton Loading -->
    <div v-if="loading" class="space-y-1.5 animate-pulse">
      <div class="h-6 w-28 bg-slate-200 rounded-lg"></div>
      <div class="h-3.5 w-20 bg-slate-100 rounded-md"></div>
    </div>
    <div v-else class="space-y-1">
      <div class="text-xl sm:text-2xl font-black tracking-tight" :class="valueColorClass">
        {{ value }}
      </div>
      <div v-if="subtitle || trend !== undefined" class="flex items-center gap-1.5 text-[11px] text-slate-400">
        <span v-if="subtitle">{{ subtitle }}</span>
        <span
          v-if="trend !== undefined && trend !== null"
          class="font-semibold inline-flex items-center gap-0.5 px-1.5 py-0.2 rounded-md text-[10px]"
          :class="trend >= 0 ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'"
        >
          <span>{{ trend >= 0 ? '+' : '' }}{{ trend }}%</span>
          <span class="text-[9px]">MoM</span>
        </span>
      </div>
    </div>

    <!-- Subtle accent bar at bottom -->
    <div
      class="absolute bottom-0 left-0 right-0 h-1"
      :class="accentBarClass"
    ></div>
  </div>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  title: {
    type: String,
    required: true
  },
  value: {
    type: [String, Number],
    required: true
  },
  subtitle: {
    type: String,
    default: ''
  },
  trend: {
    type: Number,
    default: undefined
  },
  icon: {
    type: Object,
    required: true
  },
  variant: {
    type: String,
    default: 'indigo', // 'emerald', 'rose', 'indigo', 'amber', 'slate'
    validator: (v) => ['emerald', 'rose', 'indigo', 'amber', 'slate', 'teal'].includes(v)
  },
  loading: {
    type: Boolean,
    default: false
  }
});

const iconBgClass = computed(() => {
  switch (props.variant) {
    case 'emerald':
    case 'teal':
      return 'bg-emerald-50 text-emerald-600';
    case 'rose':
      return 'bg-rose-50 text-rose-600';
    case 'amber':
      return 'bg-amber-50 text-amber-600';
    case 'slate':
      return 'bg-slate-100 text-slate-600';
    case 'indigo':
    default:
      return 'bg-indigo-50 text-indigo-600';
  }
});

const iconColorClass = computed(() => {
  switch (props.variant) {
    case 'emerald':
    case 'teal':
      return 'text-emerald-600';
    case 'rose':
      return 'text-rose-600';
    case 'amber':
      return 'text-amber-600';
    case 'slate':
      return 'text-slate-600';
    case 'indigo':
    default:
      return 'text-indigo-600';
  }
});

const valueColorClass = computed(() => {
  switch (props.variant) {
    case 'emerald':
    case 'teal':
      return 'text-emerald-700';
    case 'rose':
      return 'text-rose-700';
    case 'amber':
      return 'text-amber-700';
    case 'slate':
      return 'text-slate-800';
    case 'indigo':
    default:
      return 'text-slate-900';
  }
});

const accentBarClass = computed(() => {
  switch (props.variant) {
    case 'emerald':
    case 'teal':
      return 'bg-emerald-500';
    case 'rose':
      return 'bg-rose-500';
    case 'amber':
      return 'bg-amber-500';
    case 'slate':
      return 'bg-slate-300';
    case 'indigo':
    default:
      return 'bg-indigo-500';
  }
});
</script>
