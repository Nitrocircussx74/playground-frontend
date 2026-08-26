<template>
  <div
    class="p-5 rounded-2xl border transition-all duration-300 shadow-xs hover:shadow-md"
    :class="{
      'bg-emerald-50/70 border-emerald-200 text-emerald-950': room.status === 'occupied',
      'bg-white border-slate-200 text-slate-900': room.status === 'available',
      'bg-amber-50/70 border-amber-200 text-amber-950': room.status === 'maintenance'
    }"
  >
    <div class="flex items-center justify-between mb-3">
      <span class="text-xs uppercase tracking-wider font-semibold px-2.5 py-1 rounded-full bg-slate-100 border border-slate-200 text-slate-700">
        Floor {{ room.floor }}
      </span>
      <span
        class="text-xs font-semibold px-2.5 py-1 rounded-full border"
        :class="{
          'bg-emerald-100 border-emerald-300 text-emerald-800': room.status === 'occupied',
          'bg-slate-100 border-slate-300 text-slate-700': room.status === 'available',
          'bg-amber-100 border-amber-300 text-amber-800': room.status === 'maintenance'
        }"
      >
        {{ room.status.toUpperCase() }}
      </span>
    </div>

    <div class="text-3xl font-bold mb-1 text-slate-900">Room {{ room.roomNumber }}</div>
    <div class="text-sm text-slate-600 mb-4 font-medium">฿{{ Number(room.price).toLocaleString() }} / month</div>

    <div class="pt-3 border-t border-slate-200 flex items-center justify-between text-xs text-slate-600">
      <span>Tenant:</span>
      <span class="font-semibold text-slate-900">{{ room.tenant ? `${room.tenant.firstName} ${room.tenant.lastName}` : 'No Tenant' }}</span>
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
