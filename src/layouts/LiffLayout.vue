<template>
  <!-- App Shell: Viewport-locked Container (Header และ Footer ล็อกตำแหน่งคงที่ เลื่อนเฉพาะเนื้อหาตรงกลาง) -->
  <div class="h-[100dvh] w-full bg-slate-900/5 sm:bg-slate-200/60 flex justify-center items-center overflow-hidden font-sans selection:bg-indigo-600 selection:text-white">
    
    <!-- Mobile App Container Shell (กว้างสุด max-w-md สำหรับมือถือและมีกรอบจำลองสวยงามบน Desktop) -->
    <div class="w-full max-w-md h-full sm:h-[94dvh] sm:max-h-[890px] bg-slate-100/95 text-slate-900 relative shadow-2xl flex flex-col overflow-hidden sm:rounded-3xl sm:border border-slate-200/80">
      
      <!-- 1. Top App Bar (Header Locked Pinned ชิดขอบบน ไม่เลื่อนหลุดจอ) -->
      <header class="h-14 shrink-0 bg-white/95 backdrop-blur-md border-b border-slate-200/80 z-30 flex items-center justify-between px-4 shadow-xs select-none sticky top-0">
        <!-- ฝั่งซ้าย: ปุ่มย้อนกลับ (Back Button) -->
        <div class="w-10 flex items-center">
          <button
            v-if="showBackButton"
            @click="handleBack"
            class="w-9 h-9 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center transition-colors active:scale-95 cursor-pointer"
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

      <!-- 2. Main Scrollable Content Area (ส่วนเนื้อหาตรงกลางที่เลื่อนได้เท่านั้น) -->
      <main class="flex-1 overflow-y-auto overscroll-y-contain px-4 py-4 scroll-smooth focus:outline-hidden">
        <router-view v-slot="{ Component }">
          <transition name="fade" mode="out-in">
            <component :is="Component" />
          </transition>
        </router-view>
      </main>

      <!-- 3. Bottom Navigation (Footer Locked Pinned ชิดขอบล่าง สไตล์ Mobile App) -->
      <nav class="h-16 shrink-0 bg-white/95 backdrop-blur-md border-t border-slate-200/80 z-30 flex items-center justify-around px-2 shadow-lg select-none sticky bottom-0 pb-[max(0.25rem,env(safe-area-inset-bottom))]">
        <router-link
          v-for="tab in navTabs"
          :key="tab.path"
          :to="tab.path"
          class="flex-1 flex flex-col items-center justify-center py-1 group text-decoration-none transition-all duration-200 cursor-pointer"
          :class="isTabActive(tab.path) ? 'text-indigo-600 font-bold scale-105' : 'text-slate-500 hover:text-slate-800 font-medium'"
        >
          <div class="relative">
            <component :is="tab.icon" class="w-5 h-5 transition-transform group-hover:scale-110" />
            <!-- Active Dot Indicator -->
            <span
              v-if="isTabActive(tab.path)"
              class="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-indigo-600 rounded-full"
            ></span>
          </div>
          <span class="text-[11px] mt-1 tracking-tight">{{ tab.name }}</span>
        </router-link>
      </nav>
    </div>
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
  return route.meta?.title || 'ศูนย์กลางลูกบ้าน (Tenant Hub)';
});

/**
 * 2. Logic แสดงปุ่ม Back
 * แสดงปุ่มย้อนกลับเฉพาะเมื่อไม่ได้อยู่หน้าหลัก
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
