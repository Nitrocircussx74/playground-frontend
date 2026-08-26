<template>
  <!-- LiffLayout: Blank Clean Mobile View เหมาะสำหรับการแสดงผลในแอป LINE (ไม่มี Sidebar/Navbar ของ Admin มาปน) -->
  <div class="min-h-screen bg-slate-50 text-slate-900 font-sans max-w-md mx-auto relative shadow-2xl overflow-hidden border-x border-slate-200">
    <!-- Top Green Header Bar สไตล์ LINE -->
    <header class="bg-[#06C755] text-white px-4 py-3 shadow-md flex items-center justify-between">
      <div class="flex items-center gap-2 font-bold text-sm">
        <span>💬</span>
        <span>LINE Tenant Portal</span>
      </div>
      <span class="text-[10px] bg-white/20 px-2 py-0.5 rounded-full font-mono">LIFF v2</span>
    </header>

    <!-- Content Area สำหรับหน้าย่อยของ LIFF (เช่น ดูบิล, แจ้งซ่อม) -->
    <main class="p-4 pb-20">
      <router-view />
    </main>

    <!-- Bottom Navigation Bar สำหรับมือถือ -->
    <nav class="fixed bottom-0 left-1/2 -translate-x-1/2 max-w-md w-full bg-white border-t border-slate-200 flex justify-around py-2 shadow-lg z-50">
      <router-link
        to="/liff"
        class="flex flex-col items-center gap-1 text-[11px] font-medium"
        :class="route.path === '/liff' ? 'text-[#06C755] font-bold' : 'text-slate-500'"
      >
        <span class="text-base">🏠</span>
        <span>หน้าหลัก</span>
      </router-link>

      <router-link
        to="/liff/bills"
        class="flex flex-col items-center gap-1 text-[11px] font-medium"
        :class="route.path === '/liff/bills' ? 'text-[#06C755] font-bold' : 'text-slate-500'"
      >
        <span class="text-base">🧾</span>
        <span>บิลค่าเช่า</span>
      </router-link>
    </nav>
  </div>
</template>

<script setup>
import { useRoute } from 'vue-router';
const route = useRoute();
</script>
