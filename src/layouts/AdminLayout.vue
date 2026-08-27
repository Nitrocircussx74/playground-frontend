<template>
  <div class="min-h-screen bg-slate-100 text-slate-900 flex font-sans relative overflow-x-hidden">
    <!-- Backdrop สำหรับ Mobile Drawer -->
    <div
      v-if="isMobileMenuOpen"
      @click="isMobileMenuOpen = false"
      class="fixed inset-0 bg-slate-950/60 backdrop-blur-xs z-40 md:hidden transition-opacity duration-300"
    ></div>

    <!-- Sidebar สำหรับ Admin (Desktop: Permanent, Mobile: Slide-over Drawer) -->
    <aside
      :class="[
        'fixed md:static inset-y-0 left-0 z-50 w-64 bg-slate-900 text-slate-100 flex flex-col shrink-0 shadow-2xl md:shadow-xl transition-transform duration-300 ease-in-out',
        isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
      ]"
    >
      <!-- Sidebar Header -->
      <div class="h-16 flex items-center justify-between px-6 border-b border-slate-800">
        <div class="flex items-center gap-3">
          <div class="w-8 h-8 rounded-lg bg-gradient-to-tr from-purple-600 to-indigo-600 flex items-center justify-center text-white font-bold shadow-md">
            🏢
          </div>
          <span class="font-bold text-base tracking-tight text-white">Dorm Admin</span>
        </div>

        <!-- ปุ่ม X ปิดเมนูบน Mobile -->
        <button
          @click="isMobileMenuOpen = false"
          class="md:hidden text-slate-400 hover:text-white p-1 rounded-lg"
        >
          ✕
        </button>
      </div>

      <!-- Sidebar Navigation Menu -->
      <nav class="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto">
        <router-link
          to="/dashboard"
          @click="isMobileMenuOpen = false"
          class="flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-semibold transition-colors"
          :class="route.path === '/dashboard' ? 'bg-purple-600 text-white shadow-md' : 'text-slate-400 hover:text-white hover:bg-slate-800'"
        >
          <span>📊</span>
          <span>Dashboard</span>
        </router-link>

        <router-link
          to="/buildings"
          @click="isMobileMenuOpen = false"
          class="flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-semibold transition-colors"
          :class="route.path === '/buildings' ? 'bg-purple-600 text-white shadow-md' : 'text-slate-400 hover:text-white hover:bg-slate-800'"
        >
          <span>🏢</span>
          <span>จัดการตึก/อาคาร</span>
        </router-link>

        <router-link
          to="/rooms"
          @click="isMobileMenuOpen = false"
          class="flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-semibold transition-colors"
          :class="route.path === '/rooms' ? 'bg-purple-600 text-white shadow-md' : 'text-slate-400 hover:text-white hover:bg-slate-800'"
        >
          <span>🚪</span>
          <span>จัดการห้องพัก</span>
        </router-link>

        <router-link
          to="/meter-readings"
          @click="isMobileMenuOpen = false"
          class="flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-semibold transition-colors"
          :class="route.path === '/meter-readings' ? 'bg-purple-600 text-white shadow-md' : 'text-slate-400 hover:text-white hover:bg-slate-800'"
        >
          <span>⚡</span>
          <span>จดมิเตอร์น้ำ-ไฟ</span>
        </router-link>

        <router-link
          to="/invoices"
          @click="isMobileMenuOpen = false"
          class="flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-semibold transition-colors"
          :class="route.path === '/invoices' ? 'bg-purple-600 text-white shadow-md' : 'text-slate-400 hover:text-white hover:bg-slate-800'"
        >
          <span>🧾</span>
          <span>จัดการใบแจ้งหนี้</span>
        </router-link>
      </nav>

      <!-- Sidebar Footer -->
      <div class="p-4 border-t border-slate-800">
        <button
          @click="handleAdminLogout"
          class="w-full flex items-center justify-center gap-2 px-4 py-2 text-xs font-semibold bg-rose-950/60 text-rose-300 hover:bg-rose-900 border border-rose-800/50 rounded-lg transition-colors"
        >
          Logout Admin
        </button>
      </div>
    </aside>

    <!-- Main Content Area -->
    <div class="flex-1 flex flex-col min-w-0 overflow-hidden">
      <!-- Navbar บนพร้อม Building Switcher Dropdown (Global Context Switcher) -->
      <header class="h-16 bg-white border-b border-slate-200/80 px-4 sm:px-6 flex items-center justify-between shadow-xs shrink-0">
        <div class="flex items-center gap-3">
          <!-- ปุ่ม Hamburger สำหรับ Mobile -->
          <button
            @click="isMobileMenuOpen = !isMobileMenuOpen"
            class="md:hidden p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg focus:outline-hidden"
            aria-label="Toggle Mobile Menu"
          >
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"></path>
            </svg>
          </button>

          <h2 class="font-bold text-slate-800 text-sm sm:text-base truncate">
            ระบบผู้ดูแลหอพัก (Admin Management)
          </h2>
        </div>

        <!-- Right Side: Building Switcher Dropdown -->
        <div class="flex items-center gap-3">
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

          <div class="flex items-center gap-2 text-xs font-medium text-slate-600 bg-slate-100 px-3 py-1.5 rounded-full shrink-0">
            <span class="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span class="hidden sm:inline">Admin Online</span>
          </div>
        </div>
      </header>

      <!-- Page Content -->
      <main class="flex-1 p-4 sm:p-6 overflow-y-auto">
        <router-view />
      </main>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth';
import { useBuildingStore } from '@/stores/useBuildingStore';

const route = useRoute();
const router = useRouter();
const authStore = useAuthStore();
const buildingStore = useBuildingStore();

const isMobileMenuOpen = ref(false);

onMounted(() => {
  buildingStore.fetchBuildings();
});

const handleBuildingChange = (event) => {
  const newBuildingId = event.target.value;
  buildingStore.setActiveBuildingId(newBuildingId);
};

const handleAdminLogout = async () => {
  await authStore.logout();
  router.push('/login');
};
</script>
