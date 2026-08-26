<template>
  <div class="space-y-6">
    <div class="flex justify-between items-center">
      <h1 class="text-2xl font-bold text-slate-900">การจัดการห้องพัก (Room Management)</h1>
      <button class="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs rounded-lg shadow-md transition-colors">
        + เพิ่มห้องพักใหม่
      </button>
    </div>

    <!-- Table -->
    <div class="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
      <table class="w-full text-left text-xs text-slate-600">
        <thead class="bg-slate-50 border-b border-slate-200 text-slate-700 font-bold uppercase tracking-wider">
          <tr>
            <th class="p-4">เลขห้อง</th>
            <th class="p-4">ชั้น</th>
            <th class="p-4">ประเภท</th>
            <th class="p-4">ราคาเช่า/เดือน</th>
            <th class="p-4">สถานะ</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-slate-100">
          <tr class="hover:bg-slate-50">
            <td class="p-4 font-bold text-slate-900">101</td>
            <td class="p-4">1</td>
            <td class="p-4">ห้องแอร์</td>
            <td class="p-4 font-semibold text-slate-800">4,000 บาท</td>
            <td class="p-4">
              <span class="px-2.5 py-0.5 rounded-full font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                OCCUPIED
              </span>
            </td>
          </tr>
          <tr class="hover:bg-slate-50">
            <td class="p-4 font-bold text-slate-900">102</td>
            <td class="p-4">1</td>
            <td class="p-4">ห้องพัดลม</td>
            <td class="p-4 font-semibold text-slate-800">3,200 บาท</td>
            <td class="p-4">
              <span class="px-2.5 py-0.5 rounded-full font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
                VACANT
              </span>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup>
</script>
