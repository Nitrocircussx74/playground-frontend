<template>
  <!-- App Shell: Fully Responsive Container -->
  <div class="min-h-screen w-full bg-slate-50 flex flex-col font-sans text-slate-800 selection:bg-indigo-500 selection:text-white">
    <!-- 1. Top Navigation Bar (Header) -->
    <header class="h-14 bg-white/90 backdrop-blur-md border-b border-slate-100 z-30 sticky top-0 px-4 sm:px-6 shadow-2xs">
      <div class="max-w-4xl mx-auto h-full flex items-center justify-between">
        <!-- Left: Back Button or Logo -->
        <div class="flex items-center gap-2">
          <button
            v-if="showBackButton"
            @click="handleBack"
            class="w-8 h-8 rounded-xl bg-slate-100/80 hover:bg-slate-200 text-slate-600 flex items-center justify-center transition-colors cursor-pointer"
            aria-label="ย้อนกลับ"
          >
            <ChevronLeft class="w-4 h-4" />
          </button>
          
          <div v-else class="flex items-center gap-2">
            <img
              v-if="logoUrl"
              :src="logoUrl"
              alt="App Logo"
              class="w-7 h-7 rounded-xl object-contain border border-slate-200/60 bg-white p-0.5"
            />
            <div
              v-else
              class="w-7 h-7 rounded-xl bg-emerald-500 flex items-center justify-center text-white shadow-xs"
              title="LINE LIFF"
            >
              <svg class="w-3.5 h-3.5 fill-current text-white" viewBox="0 0 24 24">
                <path d="M19.365 9.863c.349 0 .63.285.63.631 0 .345-.281.63-.63.63H17.61v1.125h1.755c.349 0 .63.283.63.63 0 .344-.281.629-.63.629h-2.386c-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.627-.63h2.386c.349 0 .63.285.63.63 0 .349-.281.63-.63.63H17.61v1.125h1.755zm-3.855 3.016c0 .27-.174.51-.432.596-.064.021-.133.031-.199.031-.211 0-.391-.09-.51-.25l-2.443-3.317v2.94c0 .344-.279.629-.631.629-.346 0-.626-.285-.626-.629V8.108c0-.27.173-.51.43-.595.06-.023.136-.033.194-.033.195 0 .375.104.477.254l2.486 3.37V8.108c0-.345.282-.63.63-.63.345 0 .624.285.624.63v4.771zm-5.741 0c0 .344-.282.629-.631.629-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.627-.63.349 0 .631.285.631.63v4.771zm-2.466.629H4.917c-.345 0-.63-.285-.63-.629V8.108c0-.345.285-.63.63-.63.348 0 .63.285.63.63v4.141h1.756c.348 0 .629.283.629.63 0 .344-.281.629-.629.629M24 10.314C24 4.943 18.615.572 12 .572S0 4.943 0 10.314c0 4.811 4.27 8.842 10.035 9.608.391.082.923.258 1.058.59.12.301.079.766.038 1.08l-.164 1.02c-.045.301-.24 1.186 1.049.645 1.291-.539 6.916-4.078 9.436-6.975C23.176 14.393 24 12.458 24 10.314" />
              </svg>
            </div>
          </div>
        </div>

        <!-- Center: Dynamic Page Title -->
        <div class="flex-1 text-center truncate px-2">
          <h1 class="font-bold text-sm sm:text-base text-slate-800 tracking-tight truncate">
            {{ pageTitle }}
          </h1>
        </div>

        <!-- Right: Badge LINE LIFF -->
        <div class="flex items-center justify-end">
          <span class="text-[10px] font-semibold px-2 py-0.5 rounded-full border bg-emerald-50 border-emerald-200/80 text-emerald-700">
            LIFF
          </span>
        </div>
      </div>
    </header>

    <!-- 2. Main Fluid Content Area -->
    <main
      class="flex-1 w-full max-w-4xl mx-auto px-4 sm:px-6 py-4 sm:py-6"
      :class="showBottomNav ? 'pb-24 sm:pb-20' : ''"
    >
      <router-view v-slot="{ Component }">
        <transition name="page-fade" mode="out-in">
          <component :is="Component" />
        </transition>
      </router-view>
    </main>

    <!-- 3. Bottom Navigation (Fixed immovable footer) -->
    <nav
      v-if="showBottomNav"
      class="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200/80 shadow-lg pb-[max(0.25rem,env(safe-area-inset-bottom))]"
    >
      <div class="max-w-4xl mx-auto h-16 flex items-center justify-around px-2">
        <router-link
          v-for="tab in navTabs"
          :key="tab.path"
          :to="tab.path"
          class="flex-1 flex flex-col items-center justify-center py-1 group text-decoration-none transition-all duration-200 cursor-pointer"
          :class="isTabActive(tab.path) ? 'font-bold' : 'text-slate-400 hover:text-slate-600 font-medium'"
          :style="isTabActive(tab.path) ? { color: themeColor } : {}"
        >
          <div class="relative flex items-center justify-center w-8 h-8 rounded-xl transition-colors" :class="isTabActive(tab.path) ? 'bg-slate-100' : ''">
            <component :is="tab.icon" class="w-4 h-4 transition-transform duration-200 group-hover:scale-105" />
          </div>
          <span class="text-[10px] mt-0.5 tracking-tight font-medium">{{ tab.name }}</span>
        </router-link>
      </div>
    </nav>
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

