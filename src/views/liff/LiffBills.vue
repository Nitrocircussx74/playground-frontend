<template>
  <div class="space-y-4">
    <div class="flex items-center justify-between">
      <h2 class="text-base font-bold text-slate-900">รายการบิลประจำเดือน</h2>
      <span class="text-xs text-slate-500 font-medium">ห้อง 101</span>
    </div>

    <!-- Sample Bill Card -->
    <div class="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-4">
      <div class="flex justify-between items-start border-b border-slate-100 pb-3">
        <div>
          <span class="text-xs font-bold text-purple-600 uppercase tracking-wider">ใบแจ้งหนี้</span>
          <h3 class="font-bold text-base text-slate-900">ประจำเดือน 08/2026</h3>
          <p class="text-xs text-slate-500 mt-0.5">กำหนดชำระ: 05 ก.ย. 2026</p>
        </div>
        <span class="px-2.5 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-600 border border-amber-200">
          รอชำระเงิน
        </span>
      </div>

      <div class="space-y-2 text-xs">
        <div class="flex justify-between text-slate-600">
          <span>ค่าเช่าห้องพัก</span>
          <span class="font-semibold">4,000.00 บาท</span>
        </div>
        <div class="flex justify-between text-slate-600">
          <span>ค่าน้ำประปา (10 หน่วย)</span>
          <span class="font-semibold">180.00 บาท</span>
        </div>
        <div class="flex justify-between text-slate-600">
          <span>ค่าไฟฟ้า (100 หน่วย)</span>
          <span class="font-semibold">800.00 บาท</span>
        </div>
        <div class="flex justify-between text-slate-600">
          <span>ค่าส่วนกลางและค่าขยะ</span>
          <span class="font-semibold">100.00 บาท</span>
        </div>
        <div class="flex justify-between text-sm font-bold text-slate-900 pt-2 border-t border-slate-100">
          <span>ยอดรวมทั้งสิ้น</span>
          <span class="text-emerald-600 text-base">5,080.00 บาท</span>
        </div>
      </div>

      <button class="w-full py-2.5 bg-[#06C755] hover:bg-[#05b34c] text-white font-bold text-xs rounded-xl shadow-md transition-colors flex items-center justify-center gap-2">
        <span>📤</span>
        <span>แนบสลิปโอนเงิน</span>
      </button>
    </div>
  </div>
</template>

<script setup>
</script>
