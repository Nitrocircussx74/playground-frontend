<template>
  <DropdownMenuTriggerPrimitive as-child>
    <slot />
  </DropdownMenuTriggerPrimitive>
</template>

<script setup>
import { DropdownMenuTrigger as DropdownMenuTriggerPrimitive } from 'radix-vue';
</script>
