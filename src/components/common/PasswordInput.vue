<template>
  <div class="relative">
    <Input
      :type="visible ? 'text' : 'password'"
      :model-value="modelValue"
      @update:model-value="$emit('update:modelValue', $event)"
      v-bind="attrsWithoutClass"
      :class="cn('pr-10', attrs.class)"
    />
    <button
      type="button"
      tabindex="-1"
      @click="visible = !visible"
      class="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400 hover:opacity-70 transition-opacity cursor-pointer"
      :aria-label="visible ? 'ซ่อนรหัสผ่าน' : 'แสดงรหัสผ่าน'"
      :title="visible ? 'ซ่อนรหัสผ่าน' : 'แสดงรหัสผ่าน'"
    >
      <component :is="visible ? EyeOff : Eye" class="w-4 h-4" />
    </button>
  </div>
</template>

<script setup>
import { ref, computed, useAttrs } from 'vue';
import { Eye, EyeOff } from 'lucide-vue-next';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

defineOptions({ inheritAttrs: false });
defineProps({ modelValue: { type: [String, Number], default: '' } });
defineEmits(['update:modelValue']);

const attrs = useAttrs();
const attrsWithoutClass = computed(() => {
  const { class: _class, ...rest } = attrs;
  return rest;
});

const visible = ref(false);
</script>
