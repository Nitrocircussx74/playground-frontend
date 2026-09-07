<template>
  <!-- App Shell: Viewport-locked Container with ambient background -->
  <div class="h-[100dvh] w-full bg-slate-900/5 sm:bg-gradient-to-br sm:from-slate-100 sm:via-slate-50 sm:to-slate-100 flex justify-center items-center overflow-hidden font-sans selection:bg-primary selection:text-white relative">
    <!-- Desktop Background Ambience with Dynamic Theme Color Accent -->
    <div class="hidden sm:block absolute inset-0 overflow-hidden pointer-events-none z-0">
      <div
        class="absolute -top-32 -left-32 w-96 h-96 rounded-full blur-3xl opacity-25 transition-colors duration-500"
        :style="{ backgroundColor: themeColor }"
      ></div>
      <div
        class="absolute -bottom-32 -right-32 w-96 h-96 rounded-full blur-3xl opacity-20 transition-colors duration-500"
        :style="{ backgroundColor: themeColor }"
      ></div>
    </div>

    <!-- Mobile App Container Shell (กว้างสุด max-w-md สำหรับมือถือและมีกรอบจำลองสวยงามบน Desktop) -->
    <div class="w-full max-w-md h-full sm:h-[94dvh] sm:max-h-[890px] bg-slate-50 text-slate-900 relative shadow-2xl flex flex-col overflow-hidden sm:rounded-3xl sm:border border-slate-200/80 z-10">
      
      <!-- 1. Top App Bar (Header Locked Pinned ชิดขอบบน ไม่เลื่อนหลุดจอ) -->
      <header class="h-14 shrink-0 bg-white/90 backdrop-blur-md border-b border-slate-200/80 z-30 flex items-center justify-between px-4 shadow-2xs select-none sticky top-0">
        <!-- ฝั่งซ้าย: ปุ่มย้อนกลับ (Back Button) หรือ Building Logo -->
        <div class="flex items-center gap-2">
          <button
            v-if="showBackButton"
            @click="handleBack"
            class="w-9 h-9 rounded-full bg-slate-100/80 hover:bg-slate-200/80 text-slate-700 flex items-center justify-center transition-all active:scale-90 cursor-pointer"
            aria-label="ย้อนกลับ"
          >
            <ChevronLeft class="w-5 h-5" />
          </button>
          
          <!-- Dynamic Building Logo / Icon -->
          <div v-else class="flex items-center gap-2">
            <img
              v-if="logoUrl"
              :src="logoUrl"
              alt="Building Logo"
              class="w-8 h-8 rounded-xl object-contain border border-slate-200 shadow-2xs bg-white p-0.5"
            />
            <div
              v-else
              class="w-8 h-8 rounded-xl flex items-center justify-center text-white text-xs font-black shadow-2xs transition-colors duration-300"
              :style="{ backgroundColor: themeColor }"
            >
              🏢
            </div>
          </div>
        </div>

        <!-- ตรงกลาง: ชื่อหัวข้อหน้าจอ (Dynamic Page Title) -->
        <div class="flex-1 text-center truncate px-2">
          <h1 class="font-extrabold text-sm sm:text-base text-slate-900 tracking-tight truncate">
            {{ pageTitle }}
          </h1>
        </div>

        <!-- ฝั่งขวา: Badge ชื่อตึก / LIFF -->
        <div class="flex items-center justify-end">
          <span
            class="text-[10px] font-bold px-2 py-0.5 rounded-full font-sans shadow-2xs border transition-colors duration-300"
            :style="{
              backgroundColor: `${themeColor}15`,
              borderColor: `${themeColor}40`,
              color: themeColor
            }"
          >
            {{ buildingName || 'LIFF' }}
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
      <nav
        v-if="showBottomNav"
        class="h-16 shrink-0 bg-white/95 backdrop-blur-md border-t border-slate-200/80 z-30 flex items-center justify-around px-2 shadow-lg select-none sticky bottom-0 pb-[max(0.25rem,env(safe-area-inset-bottom))]"
      >
        <router-link
          v-for="tab in navTabs"
          :key="tab.path"
          :to="tab.path"
          class="flex-1 flex flex-col items-center justify-center py-1 group text-decoration-none transition-all duration-200 cursor-pointer"
          :class="isTabActive(tab.path) ? 'font-bold scale-105' : 'text-slate-400 hover:text-slate-700 font-medium'"
          :style="isTabActive(tab.path) ? { color: themeColor } : {}"
        >
          <div class="relative">
            <component :is="tab.icon" class="w-5 h-5 transition-transform duration-200 group-hover:scale-110" />
            <!-- Active Indicator Pill -->
            <span
              v-if="isTabActive(tab.path)"
              class="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-2 h-1 rounded-full transition-colors duration-300"
              :style="{ backgroundColor: themeColor }"
            ></span>
          </div>
          <span class="text-[11px] mt-1.5 tracking-tight">{{ tab.name }}</span>
        </router-link>
      </nav>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useDynamicTheme } from '@/composables/useDynamicTheme';
import {
  ChevronLeft,
  User,
  Receipt,
  Wrench,
  Megaphone
} from 'lucide-vue-next';

const route = useRoute();
const router = useRouter();
const { themeColor, logoUrl, buildingName, fetchAndApplyTheme } = useDynamicTheme();

/**
 * 1. Dynamic Page Title
 */
const pageTitle = computed(() => {
  return route.meta?.title || 'ศูนย์กลางลูกบ้าน (Tenant Hub)';
});

/**
 * 2. Logic แสดงปุ่ม Back
 */
const showBackButton = computed(() => {
  const mainTabPaths = ['/liff', '/liff/profile', '/liff/receipts', '/liff/maintenance', '/liff/announcements'];
  return !mainTabPaths.includes(route.path);
});

/**
 * 2.1 Logic แสดงแถบ Bottom Navigation Bar
 */
const showBottomNav = computed(() => {
  const noNavPaths = ['/liff', '/liff/register', '/liff/onboarding'];
  return !noNavPaths.includes(route.path);
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

onMounted(() => {
  fetchAndApplyTheme();
});
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

