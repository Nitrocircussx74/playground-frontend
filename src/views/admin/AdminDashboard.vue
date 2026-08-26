<template>
  <div class="space-y-6">
    <div class="flex justify-between items-center">
      <h1 class="text-2xl font-bold text-slate-900">Admin Overview</h1>
      <span class="text-xs font-semibold px-3 py-1 bg-purple-50 text-purple-700 rounded-full border border-purple-200">
        System Status: Normal
      </span>
    </div>

    <!-- Summary Metrics -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div class="p-6 bg-white rounded-xl border border-slate-200 shadow-sm space-y-1">
        <span class="text-xs font-bold text-slate-500 uppercase tracking-wider">ห้องพักทั้งหมด</span>
        <div class="text-3xl font-extrabold text-slate-900">40 ห้อง</div>
        <p class="text-xs text-emerald-600 font-semibold">เข้าพักแล้ว 32 ห้อง (80%)</p>
      </div>

      <div class="p-6 bg-white rounded-xl border border-slate-200 shadow-sm space-y-1">
        <span class="text-xs font-bold text-slate-500 uppercase tracking-wider">ยอดจัดเก็บเดือนนี้</span>
        <div class="text-3xl font-extrabold text-purple-600">163,200 ฿</div>
        <p class="text-xs text-slate-500">รอชำระอีก 8 ห้อง</p>
      </div>

      <div class="p-6 bg-white rounded-xl border border-slate-200 shadow-sm space-y-1">
        <span class="text-xs font-bold text-slate-500 uppercase tracking-wider">รายการแจ้งซ่อมรอดำเนินการ</span>
        <div class="text-3xl font-extrabold text-amber-600">3 เรื่อง</div>
        <p class="text-xs text-amber-600 font-semibold">ต้องจัดช่างเข้าซ่อมแซม</p>
      </div>
    </div>
  </div>
</template>

<script setup>
</script>
