<template>
  <div v-if="isCustomLayout" class="min-h-screen bg-slate-100 font-sans selection:bg-purple-600 selection:text-white">
    <router-view />
  </div>

  <div v-else class="min-h-screen bg-slate-100 text-slate-900 flex font-sans relative overflow-x-hidden selection:bg-purple-600 selection:text-white">
    <!-- Backdrop สำหรับ Mobile Drawer -->
    <div
      v-if="isMobileMenuOpen"
      @click="isMobileMenuOpen = false"
      class="fixed inset-0 bg-slate-950/60 backdrop-blur-xs z-40 md:hidden transition-opacity duration-300"
    ></div>

    <!-- 👈 Left Sidebar Navigation Menu (Permanent on Desktop, Drawer on Mobile) -->
    <aside
      v-if="authStore.isAuthenticated"
      :class="[
        'fixed md:static inset-y-0 left-0 z-50 w-64 bg-slate-900 text-slate-100 flex flex-col shrink-0 shadow-2xl md:shadow-xl transition-transform duration-300 ease-in-out',
        isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
      ]"
    >
      <!-- Sidebar Header / Brand Logo -->
      <div class="h-16 flex items-center justify-between px-6 border-b border-slate-800">
        <router-link to="/" class="flex items-center gap-3 group text-decoration-none">
          <div class="w-8 h-8 rounded-lg bg-gradient-to-tr from-purple-600 to-indigo-600 flex items-center justify-center text-white font-bold shadow-md shadow-purple-600/30 group-hover:scale-105 transition-transform duration-200">
            🏢
          </div>
          <span class="font-bold text-base tracking-tight text-white">Dorm Portal</span>
        </router-link>

        <button
          @click="isMobileMenuOpen = false"
          class="md:hidden text-slate-400 hover:text-white p-1 rounded-lg"
        >
          ✕
        </button>
      </div>

      <!-- Left Sidebar Navigation Menu Items -->
      <nav class="flex-1 px-3 py-4 space-y-5 overflow-y-auto">
        <!-- 1. ภาพรวมระบบ (Overview) -->
        <div>
          <div class="px-3 text-[10px] font-bold tracking-wider text-slate-400 uppercase mb-1.5">
            Overview
          </div>
          <router-link
            to="/dashboard"
            @click="isMobileMenuOpen = false"
            class="flex items-center gap-3 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all"
            :class="route.path === '/dashboard' ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30' : 'text-slate-400 hover:text-white hover:bg-slate-800/80'"
          >
            <span class="text-base">📊</span>
            <span>Dashboard</span>
          </router-link>
        </div>

        <!-- 2. จัดการตึก & ห้องพัก (Building & Rooms) -->
        <div>
          <div class="px-3 text-[10px] font-bold tracking-wider text-slate-400 uppercase mb-1.5">
            Building & Rooms
          </div>
          <div class="space-y-1">
            <router-link
              to="/buildings"
              @click="isMobileMenuOpen = false"
              class="flex items-center gap-3 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all"
              :class="route.path === '/buildings' ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30' : 'text-slate-400 hover:text-white hover:bg-slate-800/80'"
            >
              <span class="text-base">🏢</span>
              <span>จัดการตึก/อาคาร</span>
            </router-link>

            <router-link
              to="/building-settings"
              @click="isMobileMenuOpen = false"
              class="flex items-center gap-3 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all"
              :class="route.path === '/building-settings' ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30' : 'text-slate-400 hover:text-white hover:bg-slate-800/80'"
            >
              <span class="text-base">⚙️</span>
              <span>ตั้งค่าตึก</span>
            </router-link>

            <router-link
              to="/rooms"
              @click="isMobileMenuOpen = false"
              class="flex items-center gap-3 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all"
              :class="route.path === '/rooms' ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30' : 'text-slate-400 hover:text-white hover:bg-slate-800/80'"
            >
              <span class="text-base">🚪</span>
              <span>จัดการห้องพัก</span>
            </router-link>
          </div>
        </div>

        <!-- 3. การเงิน & มิเตอร์ (Billing & Utilities) -->
        <div>
          <div class="px-3 text-[10px] font-bold tracking-wider text-slate-400 uppercase mb-1.5">
            Billing & Utilities
          </div>
          <div class="space-y-1">
            <router-link
              to="/meter-readings"
              @click="isMobileMenuOpen = false"
              class="flex items-center gap-3 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all"
              :class="route.path === '/meter-readings' ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30' : 'text-slate-400 hover:text-white hover:bg-slate-800/80'"
            >
              <span class="text-base">⚡</span>
              <span>จดมิเตอร์น้ำ-ไฟ</span>
            </router-link>

            <router-link
              to="/invoices"
              @click="isMobileMenuOpen = false"
              class="flex items-center gap-3 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all"
              :class="route.path === '/invoices' ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30' : 'text-slate-400 hover:text-white hover:bg-slate-800/80'"
            >
              <span class="text-base">🧾</span>
              <span>จัดการใบแจ้งหนี้</span>
            </router-link>
          </div>
        </div>

        <!-- 4. บริการผู้เช่า (Tenant Services) -->
        <div>
          <div class="px-3 text-[10px] font-bold tracking-wider text-slate-400 uppercase mb-1.5">
            Tenant Services
          </div>
          <div class="space-y-1">
            <router-link
              to="/maintenance"
              @click="isMobileMenuOpen = false"
              class="flex items-center gap-3 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all"
              :class="route.path === '/maintenance' ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30' : 'text-slate-400 hover:text-white hover:bg-slate-800/80'"
            >
              <span class="text-base">🔧</span>
              <span>แจ้งซ่อม & ติดตาม</span>
            </router-link>

            <router-link
              to="/announcements"
              @click="isMobileMenuOpen = false"
              class="flex items-center gap-3 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all"
              :class="route.path === '/announcements' ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30' : 'text-slate-400 hover:text-white hover:bg-slate-800/80'"
            >
              <span class="text-base">📢</span>
              <span>ข่าวสาร & ประกาศ</span>
            </router-link>
          </div>
        </div>

        <!-- 5. ตั้งค่าระบบ (System Settings) -->
        <div>
          <div class="px-3 text-[10px] font-bold tracking-wider text-slate-400 uppercase mb-1.5">
            System Settings
          </div>
          <router-link
            to="/features"
            @click="isMobileMenuOpen = false"
            class="flex items-center gap-3 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all"
            :class="route.path === '/features' ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30' : 'text-slate-400 hover:text-white hover:bg-slate-800/80'"
          >
            <span class="text-base">🚩</span>
            <span>ตั้งค่าฟีเจอร์</span>
          </router-link>
        </div>
      </nav>

      <!-- Sidebar Footer -->
      <div class="p-4 border-t border-slate-800 space-y-3">
        <div class="px-2">
          <div class="text-[11px] text-slate-400 font-mono">Logged in as:</div>
          <div class="text-xs font-semibold text-white truncate">{{ authStore.currentUser?.email }}</div>
        </div>

        <button
          @click="handleLogout"
          class="w-full flex items-center justify-center gap-2 px-4 py-2 text-xs font-semibold bg-rose-950/60 text-rose-300 hover:bg-rose-900 border border-rose-800/50 rounded-xl transition-colors"
        >
          <span>🚪</span>
          <span>ออกจากระบบ</span>
        </button>
      </div>
    </aside>

    <!-- Main Content Area -->
    <div class="flex-1 flex flex-col min-w-0 overflow-hidden">
      <!-- Navbar บนพร้อม Building Switcher Dropdown (Global Context Switcher) -->
      <header class="h-16 bg-white border-b border-slate-200/80 px-4 sm:px-6 flex items-center justify-between shadow-xs shrink-0 z-30">
        <div class="flex items-center gap-3">
          <button
            v-if="authStore.isAuthenticated"
            @click="isMobileMenuOpen = !isMobileMenuOpen"
            class="md:hidden p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg focus:outline-hidden"
            aria-label="Toggle Mobile Menu"
          >
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"></path>
            </svg>
          </button>

          <h2 class="font-bold text-slate-800 text-sm sm:text-base truncate">
            ระบบจัดการหอพัก (Dormitory Management System)
          </h2>
        </div>

        <!-- Right Side: Building Switcher Dropdown -->
        <div v-if="authStore.isAuthenticated" class="flex items-center gap-3">
          <div class="flex items-center gap-2 bg-purple-50 border border-purple-200 px-3 py-1.5 rounded-xl shadow-2xs">
            <span class="text-xs font-bold text-purple-900 hidden sm:inline">🏢 เลือกตึก:</span>
            <select
              :value="buildingStore.activeBuildingId"
              @change="handleBuildingChange"
              class="bg-white border border-purple-300 text-purple-900 font-bold text-xs rounded-lg px-2 py-1 focus:outline-hidden cursor-pointer"
            >
              <option v-for="b in buildingStore.buildings" :key="b.id" :value="b.id">
                {{ b.name }}
              </option>
            </select>
          </div>
        </div>

        <div v-else-if="!authStore.loading">
          <router-link to="/login">
            <Button class="bg-purple-600 hover:bg-purple-700 text-white font-semibold text-xs h-9 px-4">
              Sign In
            </Button>
          </router-link>
        </div>
      </header>

      <!-- Main Page Content -->
      <main class="flex-1 p-4 sm:p-6 overflow-y-auto">
        <router-view />
      </main>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useAuthStore } from '@/stores/auth';
import { useBuildingStore } from '@/stores/useBuildingStore';
import { useRouter, useRoute } from 'vue-router';
import { Button } from '@/components/ui/button';

const authStore = useAuthStore();
const buildingStore = useBuildingStore();
const router = useRouter();
const route = useRoute();

const isMobileMenuOpen = ref(false);

onMounted(() => {
  if (authStore.isAuthenticated) {
    buildingStore.fetchBuildings();
  }
});

const isCustomLayout = computed(() => {
  return route.path.startsWith('/admin') || route.path.startsWith('/liff');
});

const handleBuildingChange = (e) => {
  buildingStore.setActiveBuildingId(e.target.value);
};

const handleLogout = async () => {
  await authStore.logout();
  router.push('/login');
};
</script>
