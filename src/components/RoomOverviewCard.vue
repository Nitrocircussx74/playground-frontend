<template>
  <div
    class="p-5 rounded-2xl border transition-all duration-200 shadow-2xs hover:shadow-md card-hover relative overflow-hidden flex flex-col justify-between"
    :class="{
      'bg-emerald-50/60 border-emerald-200/80 text-emerald-950': room.status === 'occupied',
      'bg-white border-slate-200 text-slate-900': room.status === 'available',
      'bg-amber-50/60 border-amber-200/80 text-amber-950': room.status === 'maintenance'
    }"
  >
    <div>
      <!-- Card Top Bar: Unit Type Badge & Status Badge with Pulse Dot -->
      <div class="flex items-center justify-between mb-3 gap-2">
        <span
          class="text-[11px] font-bold px-2.5 py-0.5 rounded-full border flex items-center gap-1 shadow-2xs shrink-0"
          :class="getUnitTypeClass(room.unitType)"
        >
          <span>{{ getUnitTypeIcon(room.unitType) }}</span>
          <span>{{ getUnitTypeLabel(room.unitType) }}</span>
        </span>

        <span
          class="text-xs font-bold px-2.5 py-1 rounded-full border flex items-center gap-1.5 shadow-2xs shrink-0"
          :class="{
            'bg-emerald-100/80 border-emerald-300 text-emerald-800': room.status === 'occupied',
            'bg-purple-50 border-purple-200 text-purple-700': room.status === 'available',
            'bg-amber-100/80 border-amber-300 text-amber-800': room.status === 'maintenance'
          }"
        >
          <span
            class="w-2 h-2 rounded-full"
            :class="{
              'bg-emerald-500 animate-soft-pulse': room.status === 'occupied',
              'bg-purple-500': room.status === 'available',
              'bg-amber-500 animate-soft-pulse': room.status === 'maintenance'
            }"
          ></span>
          <span>
            {{ room.status === 'occupied' ? 'มีผู้เช่า' : room.status === 'available' ? 'ว่าง' : 'ซ่อมบำรุง' }}
          </span>
        </span>
      </div>

      <!-- Room Number & Location / Area -->
      <div class="space-y-1 mb-3">
        <div class="flex items-baseline justify-between gap-2">
          <div class="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight font-mono">
            {{ getUnitPrefix(room.unitType) }} {{ room.roomNumber }}
          </div>
          <span v-if="room.areaSqm" class="text-xs font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-lg border border-slate-200/80">
            📐 {{ Number(room.areaSqm) }} ตร.ม.
          </span>
        </div>

        <div class="flex items-center gap-2 text-xs font-medium text-slate-500">
          <span class="bg-slate-100 px-2 py-0.5 rounded-md border border-slate-200/60 font-mono">
            ชั้น {{ room.floor }}
          </span>
          <span v-if="room.locationZone" class="truncate text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md border border-indigo-100">
            📍 {{ room.locationZone }}
          </span>
        </div>
      </div>

      <!-- Price & Billing Model -->
      <div class="mb-3 pt-2 border-t border-slate-100">
        <div class="flex items-center justify-between">
          <span class="text-xs text-slate-400">ค่าเช่า:</span>
          <div class="text-right">
            <span class="text-base font-extrabold text-purple-700 font-mono">
              ฿{{ Number(room.price).toLocaleString() }}
            </span>
            <span class="text-[11px] font-normal text-slate-400">/เดือน</span>
          </div>
        </div>

        <!-- Revenue Share Badge if applicable -->
        <div v-if="room.billingModel === 'revenue_share'" class="mt-1 flex items-center justify-between text-[11px] text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
          <span>โมเดลส่วนแบ่ง (GP):</span>
          <span class="font-bold">{{ Number(room.revSharePercent || 0) }}% ของยอดขาย</span>
        </div>
      </div>
    </div>

    <!-- Tenant & Room Owner Details Info Bar -->
    <div class="pt-3 border-t border-slate-200/80 space-y-1 text-xs text-slate-600">
      <div v-if="room.owner" class="flex items-center justify-between">
        <span class="text-slate-400 flex items-center gap-1"><span>👑</span> เจ้าของ:</span>
        <span class="font-bold text-indigo-700 truncate max-w-[150px]">
          {{ room.owner.name }}
        </span>
      </div>
      <div class="flex items-center justify-between">
        <span class="text-slate-400">ผู้เช่า:</span>
        <span class="font-bold text-slate-900 truncate max-w-[150px]">
          {{ room.tenant ? `${room.tenant.firstName} ${room.tenant.lastName}` : '— ว่าง —' }}
        </span>
      </div>
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

const getUnitPrefix = (type) => {
  switch (type) {
    case 'commercial_shop': return 'ร้าน/ล็อค';
    case 'vending_spot': return 'จุดวางตู้';
    case 'parking': return 'ช่องจอด';
    case 'storage': return 'สต็อก/ล็อกเกอร์';
    case 'billboard_rooftop': return 'ดาดฟ้า/ป้าย';
    default: return 'ห้อง';
  }
};

const getUnitTypeIcon = (type) => {
  switch (type) {
    case 'commercial_shop': return '🏪';
    case 'vending_spot': return '☕';
    case 'parking': return '🚗';
    case 'storage': return '📦';
    case 'billboard_rooftop': return '📡';
    default: return '🚪';
  }
};

const getUnitTypeLabel = (type) => {
  switch (type) {
    case 'commercial_shop': return 'ร้านค้า/ล็อค';
    case 'vending_spot': return 'จุดวางตู้เต่าบิน/บริการ';
    case 'parking': return 'ที่จอดรถ';
    case 'storage': return 'ห้องเก็บของ';
    case 'billboard_rooftop': return 'ป้าย/ดาดฟ้า';
    default: return 'ห้องพักอาศัย';
  }
};

const getUnitTypeClass = (type) => {
  switch (type) {
    case 'commercial_shop': return 'bg-sky-50 text-sky-700 border-sky-200';
    case 'vending_spot': return 'bg-amber-50 text-amber-700 border-amber-200';
    case 'parking': return 'bg-indigo-50 text-indigo-700 border-indigo-200';
    case 'storage': return 'bg-orange-50 text-orange-700 border-orange-200';
    case 'billboard_rooftop': return 'bg-purple-50 text-purple-700 border-purple-200';
    default: return 'bg-slate-100 text-slate-700 border-slate-200';
  }
};
</script>
