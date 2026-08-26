<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div>
        <h1 class="text-xl sm:text-2xl font-bold text-slate-900">การจัดการห้องพัก (Room Management)</h1>
        <p class="text-xs sm:text-sm text-slate-500 mt-0.5">จัดการสถานะห้องพัก อาคาร และราคาเช่าประจำเดือน</p>
      </div>

      <button class="w-full sm:w-auto px-4 py-2.5 bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs rounded-xl shadow-md shadow-purple-600/20 transition-all flex items-center justify-center gap-1.5 shrink-0">
        <span>➕</span>
        <span>เพิ่มห้องพักใหม่</span>
      </button>
    </div>

    <!-- Responsive Table Container -->
    <div class="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
      <div class="overflow-x-auto">
        <table class="w-full text-left text-xs text-slate-600 min-w-[500px]">
          <thead class="bg-slate-50 border-b border-slate-200 text-slate-700 font-bold uppercase tracking-wider">
            <tr>
              <th class="p-4">เลขห้อง</th>
              <th class="p-4">ชั้น</th>
              <th class="p-4">ประเภทห้อง</th>
              <th class="p-4">ราคาเช่า/เดือน</th>
              <th class="p-4">สถานะ</th>
              <th class="p-4 text-right">การจัดการ</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100">
            <tr class="hover:bg-slate-50/80 transition-colors">
              <td class="p-4 font-bold text-slate-900 text-sm">101</td>
              <td class="p-4">ชั้น 1</td>
              <td class="p-4">
                <span class="inline-flex items-center gap-1 font-medium text-slate-800">
                  ❄️ ห้องปรับอากาศ
                </span>
              </td>
              <td class="p-4 font-bold text-slate-900">4,000 บาท</td>
              <td class="p-4">
                <span class="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full font-bold text-[11px] bg-emerald-50 text-emerald-700 border border-emerald-200">
                  <span class="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                  OCCUPIED
                </span>
              </td>
              <td class="p-4 text-right space-x-2">
                <button class="px-2.5 py-1 text-[11px] font-semibold text-purple-700 bg-purple-50 hover:bg-purple-100 border border-purple-200 rounded-lg">
                  แก้ไข
                </button>
              </td>
            </tr>

            <tr class="hover:bg-slate-50/80 transition-colors">
              <td class="p-4 font-bold text-slate-900 text-sm">102</td>
              <td class="p-4">ชั้น 1</td>
              <td class="p-4">
                <span class="inline-flex items-center gap-1 font-medium text-slate-800">
                  🌀 ห้องพัดลม
                </span>
              </td>
              <td class="p-4 font-bold text-slate-900">3,200 บาท</td>
              <td class="p-4">
                <span class="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full font-bold text-[11px] bg-indigo-50 text-indigo-700 border border-indigo-200">
                  <span class="w-1.5 h-1.5 rounded-full bg-indigo-500"></span>
                  VACANT
                </span>
              </td>
              <td class="p-4 text-right space-x-2">
                <button class="px-2.5 py-1 text-[11px] font-semibold text-purple-700 bg-purple-50 hover:bg-purple-100 border border-purple-200 rounded-lg">
                  แก้ไข
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup>
</script>
