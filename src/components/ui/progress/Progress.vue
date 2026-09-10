<template>
  <ProgressRoot
    :class="cn('relative h-2.5 w-full overflow-hidden rounded-full bg-slate-100', props.class)"
    v-bind="delegatedProps"
  >
    <ProgressIndicator
      :class="cn('h-full w-full flex-1 transition-all duration-500 ease-in-out', indicatorClass)"
      :style="`transform: translateX(-${100 - (props.modelValue || 0)}%);`"
    />
  </ProgressRoot>
</template>

<script setup>
import { computed } from 'vue';
import { ProgressRoot, ProgressIndicator } from 'radix-vue';
import { cn } from '@/lib/utils';

const props = defineProps({
  modelValue: { type: [Number, null], default: 0 },
  max: { type: Number, default: 100 },
  getValueLabel: { type: Function, default: undefined },
  asChild: { type: Boolean, default: false },
  as: { type: null, default: undefined },
  class: { type: null, default: '' },
  indicatorClass: { type: String, default: 'bg-emerald-500' }
});

const delegatedProps = computed(() => {
  const { class: _, indicatorClass: __, ...delegated } = props;
  return delegated;
});
</script>
