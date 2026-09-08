<template>
  <!-- App Shell: Viewport-locked Container with ambient background -->
  <div class="h-[100dvh] w-full bg-slate-50/60 sm:bg-gradient-to-br sm:from-emerald-50/30 sm:via-slate-50 sm:to-indigo-50/30 flex justify-center items-center overflow-hidden font-sans selection:bg-indigo-500 selection:text-white relative">
    <!-- Desktop Background Ambience with Dynamic Theme Color Accent -->
    <div class="hidden sm:block absolute inset-0 overflow-hidden pointer-events-none z-0">
      <div
        class="absolute -top-32 -left-32 w-96 h-96 rounded-full blur-3xl opacity-15 transition-colors duration-500"
        :style="{ backgroundColor: themeColor }"
      ></div>
      <div
        class="absolute -bottom-32 -right-32 w-96 h-96 rounded-full blur-3xl opacity-15 transition-colors duration-500"
        :style="{ backgroundColor: themeColor }"
      ></div>
    </div>

    <!-- Mobile App Container Shell (กว้างสุด max-w-md สำหรับมือถือและมีกรอบจำลองสวยงามบน Desktop) -->
    <div class="w-full max-w-md h-full sm:h-[94dvh] sm:max-h-[890px] bg-slate-50/80 text-slate-800 relative shadow-xl flex flex-col overflow-hidden sm:rounded-3xl sm:border border-slate-200/60 z-10">
      
      <!-- 1. Top App Bar (Header Locked Pinned ชิดขอบบน ไม่เลื่อนหลุดจอ) -->
      <header class="h-14 shrink-0 bg-white/80 backdrop-blur-md border-b border-slate-100 z-30 flex items-center justify-between px-4 shadow-2xs select-none sticky top-0">
        <!-- ฝั่งซ้าย: ปุ่มย้อนกลับ (Back Button) หรือ Building Logo -->
        <div class="flex items-center gap-2">
          <button
            v-if="showBackButton"
            @click="handleBack"
            class="w-8.5 h-8.5 rounded-full bg-slate-100/70 hover:bg-slate-200/70 text-slate-600 flex items-center justify-center transition-all active:scale-95 cursor-pointer"
            aria-label="ย้อนกลับ"
          >
            <ChevronLeft class="w-4.5 h-4.5" />
          </button>
          
          <!-- Dynamic LINE / App Logo -->
          <div v-else class="flex items-center gap-2">
            <img
              v-if="logoUrl"
              :src="logoUrl"
              alt="App Logo"
              class="w-7.5 h-7.5 rounded-xl object-contain border border-slate-200/60 shadow-2xs bg-white p-0.5"
            />
            <div
              v-else
              class="w-7.5 h-7.5 rounded-xl bg-emerald-500 flex items-center justify-center text-white shadow-xs"
              title="LINE LIFF"
            >
              <svg class="w-4 h-4 fill-current text-white" viewBox="0 0 24 24">
                <path d="M19.365 9.863c.349 0 .63.285.63.631 0 .345-.281.63-.63.63H17.61v1.125h1.755c.349 0 .63.283.63.63 0 .344-.281.629-.63.629h-2.386c-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.627-.63h2.386c.349 0 .63.285.63.63 0 .349-.281.63-.63.63H17.61v1.125h1.755zm-3.855 3.016c0 .27-.174.51-.432.596-.064.021-.133.031-.199.031-.211 0-.391-.09-.51-.25l-2.443-3.317v2.94c0 .344-.279.629-.631.629-.346 0-.626-.285-.626-.629V8.108c0-.27.173-.51.43-.595.06-.023.136-.033.194-.033.195 0 .375.104.477.254l2.486 3.37V8.108c0-.345.282-.63.63-.63.345 0 .624.285.624.63v4.771zm-5.741 0c0 .344-.282.629-.631.629-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.627-.63.349 0 .631.285.631.63v4.771zm-2.466.629H4.917c-.345 0-.63-.285-.63-.629V8.108c0-.345.285-.63.63-.63.348 0 .63.285.63.63v4.141h1.756c.348 0 .629.283.629.63 0 .344-.281.629-.629.629M24 10.314C24 4.943 18.615.572 12 .572S0 4.943 0 10.314c0 4.811 4.27 8.842 10.035 9.608.391.082.923.258 1.058.59.12.301.079.766.038 1.08l-.164 1.02c-.045.301-.24 1.186 1.049.645 1.291-.539 6.916-4.078 9.436-6.975C23.176 14.393 24 12.458 24 10.314" />
              </svg>
            </div>
          </div>
        </div>

        <!-- ตรงกลาง: ชื่อหัวข้อหน้าจอ (Dynamic Page Title) -->
        <div class="flex-1 text-center truncate px-2">
          <h1 class="font-bold text-sm sm:text-base text-slate-800 tracking-tight truncate">
            {{ pageTitle }}
          </h1>
        </div>

        <!-- ฝั่งขวา: Badge LINE LIFF -->
        <div class="flex items-center justify-end gap-1.5">
          <span
            class="text-[10px] font-bold px-2 py-0.5 rounded-full font-sans border bg-emerald-50 border-emerald-200 text-emerald-700"
          >
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
      <nav
        v-if="showBottomNav"
        class="h-16 shrink-0 bg-white/90 backdrop-blur-md border-t border-slate-100 z-30 flex items-center justify-around px-2 shadow-sm select-none sticky bottom-0 pb-[max(0.25rem,env(safe-area-inset-bottom))]"
      >
        <router-link
          v-for="tab in navTabs"
          :key="tab.path"
          :to="tab.path"
          class="flex-1 flex flex-col items-center justify-center py-1 group text-decoration-none transition-all duration-200 cursor-pointer"
          :class="isTabActive(tab.path) ? 'font-bold' : 'text-slate-400 hover:text-slate-600 font-medium'"
          :style="isTabActive(tab.path) ? { color: themeColor } : {}"
        >
          <div class="relative flex items-center justify-center w-8 h-8 rounded-full transition-colors" :class="isTabActive(tab.path) ? 'bg-slate-100/70' : ''">
            <component :is="tab.icon" class="w-4.5 h-4.5 transition-transform duration-200 group-hover:scale-105" />
          </div>
          <span class="text-[10px] mt-0.5 tracking-tight font-medium">{{ tab.name }}</span>
        </router-link>
      </nav>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth';
import { useDynamicTheme } from '@/composables/useDynamicTheme';
import { showConfirm, showSuccess } from '@/utils/swal';
import {
  ChevronLeft,
  Home,
  User,
  Receipt,
  Wrench,
  Megaphone
} from 'lucide-vue-next';

const route = useRoute();
const router = useRouter();
const authStore = useAuthStore();
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
  const mainTabPaths = ['/liff', '/liff/profile', '/liff/receipts', '/liff/maintenance', '/liff/announcements', '/liff/settings'];
  return !mainTabPaths.includes(route.path);
});

/**
 * 2.1 Logic แสดงแถบ Bottom Navigation Bar
 */
const showBottomNav = computed(() => {
  if (route.meta?.hideBottomNav) return false;
  const noNavPaths = [
    '/liff',
    '/liff/register',
    '/liff/onboarding',
    '/liff/pin-login',
    '/liff/setup-pin',
    '/liff/change-pin',
    '/pin-login',
    '/setup-pin',
    '/change-pin'
  ];
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
 * 4. เมนูของ Bottom Navigation Bar (5 แท็บหลักครบครัน)
 */
const navTabs = [
  { name: 'หน้าแรก', path: '/liff/profile', icon: Home },
  { name: 'ใบเสร็จ', path: '/liff/receipts', icon: Receipt },
  { name: 'แจ้งซ่อม', path: '/liff/maintenance', icon: Wrench },
  { name: 'ข่าวสาร', path: '/liff/announcements', icon: Megaphone },
  { name: 'โปรไฟล์', path: '/liff/settings', icon: User }
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

