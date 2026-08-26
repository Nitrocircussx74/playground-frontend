<template>
  <div
    class="p-5 rounded-2xl border transition-all duration-300 shadow-sm hover:shadow-md"
    :class="{
      'bg-emerald-900/20 border-emerald-500/30 text-emerald-100': room.status === 'occupied',
      'bg-slate-800/40 border-slate-700/50 text-slate-200': room.status === 'available',
      'bg-amber-900/20 border-amber-500/30 text-amber-100': room.status === 'maintenance'
    }"
  >
    <div class="flex items-center justify-between mb-3">
      <span class="text-xs uppercase tracking-wider font-semibold px-2.5 py-1 rounded-full bg-slate-900/50 border border-current">
        Floor {{ room.floor }}
      </span>
      <span
        class="text-xs font-medium px-2 py-0.5 rounded-full"
        :class="{
          'bg-emerald-500/20 text-emerald-300': room.status === 'occupied',
          'bg-slate-700/50 text-slate-300': room.status === 'available',
          'bg-amber-500/20 text-amber-300': room.status === 'maintenance'
        }"
      >
        {{ room.status.toUpperCase() }}
      </span>
    </div>

    <div class="text-3xl font-bold mb-1">Room {{ room.roomNumber }}</div>
    <div class="text-sm opacity-80 mb-4">฿{{ Number(room.price).toLocaleString() }} / month</div>

    <div class="pt-3 border-t border-slate-700/40 flex items-center justify-between text-xs opacity-90">
      <span>Tenant:</span>
      <span class="font-semibold">{{ room.tenant ? `${room.tenant.firstName} ${room.tenant.lastName}` : 'No Tenant' }}</span>
    </div>
  </div>
</template>

<script setup>
defineProps({
  room: {
    type: Object,
    required: true
  }
});
</script>
