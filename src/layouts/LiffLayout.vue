<template>
  <!-- App Shell: Mobile-first Container (จำกัดขนาดหน้าจอมือถือ max-w-md พร้อมเงาสมจริง) -->
  <div class="min-h-screen bg-slate-100/90 text-slate-900 font-sans max-w-md mx-auto relative shadow-2xl overflow-x-hidden border-x border-slate-200/80 flex flex-col">
    
    <!-- 1. Top App Bar (Header Fixed ชิดขอบบน) -->
    <header class="fixed top-0 left-1/2 -translate-x-1/2 max-w-md w-full h-14 bg-white/90 backdrop-blur-md border-b border-slate-200/80 z-40 flex items-center justify-between px-4 shadow-xs transition-all">
      <!-- ฝั่งซ้าย: ปุ่มย้อนกลับ (Back Button) -->
      <div class="w-10 flex items-center">
        <button
          v-if="showBackButton"
          @click="handleBack"
          class="w-9 h-9 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center transition-colors active:scale-95"
          aria-label="ย้อนกลับ"
        >
          <ChevronLeft class="w-5 h-5" />
        </button>
      </div>

      <!-- ตรงกลาง: ชื่อหัวข้อหน้าจอ (Dynamic Page Title) -->
      <div class="flex-1 text-center truncate px-2">
        <h1 class="font-extrabold text-sm sm:text-base text-slate-900 tracking-tight truncate">
          {{ pageTitle }}
        </h1>
      </div>

      <!-- ฝั่งขวา: Badge สถานะ LIFF -->
      <div class="w-10 flex items-center justify-end">
        <span class="text-[10px] font-bold px-2 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full font-mono">
          LIFF
        </span>
      </div>
    </header>

    <!-- 2. Main Content Area (ส่วนเนื้อหาตรงกลาง Scrollable พร้อม Padding เว้น Header/Footer) -->
    <main class="flex-1 pt-14 pb-20 px-4">
      <router-view v-slot="{ Component }">
        <transition name="fade" mode="out-in">
          <component :is="Component" />
        </transition>
      </router-view>
    </main>

    <!-- 3. Bottom Navigation (Footer Fixed ชิดขอบล่าง สไตล์ Mobile App) -->
    <nav class="fixed bottom-0 left-1/2 -translate-x-1/2 max-w-md w-full h-16 bg-white/90 backdrop-blur-md border-t border-slate-200/80 z-40 flex items-center justify-around px-2 shadow-lg">
      <router-link
        v-for="tab in navTabs"
        :key="tab.path"
        :to="tab.path"
        class="flex-1 flex flex-col items-center justify-center py-1 group text-decoration-none transition-all duration-200"
        :class="isTabActive(tab.path) ? 'text-indigo-600 font-bold scale-105' : 'text-slate-500 hover:text-slate-800 font-medium'"
      >
        <div class="relative">
          <component :is="tab.icon" class="w-5 h-5 transition-transform group-hover:scale-110" />
          <!-- Active Dot Indicator -->
          <span
            v-if="isTabActive(tab.path)"
            class="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-indigo-600 rounded-full"
          ></span>
        </div>
        <span class="text-[11px] mt-1 tracking-tight">{{ tab.name }}</span>
      </router-link>
    </nav>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import {
  ChevronLeft,
  User,
  Receipt,
  Wrench,
  Megaphone
} from 'lucide-vue-next';

const route = useRoute();
const router = useRouter();

/**
 * 1. Dynamic Page Title
 * ดึงชื่อหน้าจาก `route.meta.title` ถ้าไม่มีให้ใช้ค่าเริ่มต้น 'Dormitory Portal'
 */
const pageTitle = computed(() => {
  return route.meta?.title || 'Dormitory Portal';
});

/**
 * 2. Logic แสดงปุ่ม Back
 * แสดงปุ่มย้อนกลับเฉพาะเมื่อไม่ได้อยู่หน้าหลัก (เช่น แสดงในหน้าย่อย แต่ซ่อนเมื่ออยู่ /liff/profile หรือ /liff)
 */
const showBackButton = computed(() => {
  const mainTabPaths = ['/liff', '/liff/profile', '/liff/receipts', '/liff/maintenance', '/liff/announcements'];
  return !mainTabPaths.includes(route.path);
});

/**
 * 3. ฟังก์ชันสำหรับย้อนกลับหน้าเดิม
 */
const handleBack = () => {
  if (window.history.length > 1) {
    router.back();
  } else {
    router.push('/liff/profile');
  }
};

/**
 * 4. เมนูของ Bottom Navigation Bar
 */
const navTabs = [
  { name: 'หน้าแรก', path: '/liff/profile', icon: User },
  { name: 'ใบเสร็จ', path: '/liff/receipts', icon: Receipt },
  { name: 'แจ้งซ่อม', path: '/liff/maintenance', icon: Wrench },
  { name: 'ข่าวสาร', path: '/liff/announcements', icon: Megaphone }
];

/**
 * ตรวจสอบว่าแอนิเมชัน/ไฮไลต์แท็บปัจจุบันถูกเปิดอยู่หรือไม่
 */
const isTabActive = (path) => {
  return route.path === path || route.path.startsWith(path + '/');
};
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.15s ease, transform 0.15s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: translateY(4px);
}
</style>
