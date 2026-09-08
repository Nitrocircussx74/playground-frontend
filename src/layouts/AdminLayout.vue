<template>
  <div class="h-screen w-screen overflow-hidden bg-slate-50 text-slate-900 flex font-sans selection:bg-purple-600 selection:text-white">
    <!-- Backdrop สำหรับ Mobile Drawer -->
    <div
      v-if="isMobileMenuOpen"
      @click="isMobileMenuOpen = false"
      class="fixed inset-0 bg-slate-950/60 backdrop-blur-xs z-40 md:hidden transition-opacity duration-300"
    ></div>

    <!-- Sidebar สำหรับ Admin -->
    <aside
      :class="[
        'fixed md:static inset-y-0 left-0 z-50 w-72 h-full bg-slate-900 text-slate-100 flex flex-col shrink-0 border-r border-slate-800/80 shadow-2xl md:shadow-none backdrop-blur-xl transition-transform duration-300 ease-in-out',
        isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
      ]"
    >
      <!-- Sidebar Header -->
      <div class="h-16 flex items-center justify-between px-4 border-b border-slate-800/90 shrink-0 bg-slate-950/40">
        <div class="flex items-center gap-2.5">
          <div class="w-10 h-10 rounded-xl bg-white/95 p-1 flex items-center justify-center shadow-md shadow-purple-600/20 shrink-0 overflow-hidden ring-2 ring-purple-500/20">
            <img src="/horhub-app-icon.png" alt="HorHub Logo" class="w-full h-full object-contain rounded-lg" />
          </div>
          <div class="min-w-0">
            <div class="font-extrabold text-sm tracking-tight text-white flex items-center gap-1.5 truncate">
              <span>HorHub</span>
              <span class="text-purple-400 text-xs font-bold">(หอฮับ)</span>
            </div>
            <div class="text-[10px] text-emerald-400 font-semibold truncate tracking-tight">Admin Backoffice</div>
          </div>
        </div>

        <button
          @click="isMobileMenuOpen = false"
          class="md:hidden text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
        >
          <X class="w-5 h-5" />
        </button>
      </div>

      <!-- Sidebar Navigation Menu -->
      <nav class="flex-1 px-3 py-4 space-y-1.5 overflow-y-auto">
        <router-link
          to="/dashboard"
          @click="isMobileMenuOpen = false"
          class="flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs sm:text-sm font-medium transition-all group"
          :class="route.path === '/dashboard' ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-semibold shadow-md shadow-purple-600/25' : 'text-slate-300 hover:text-white hover:bg-slate-800/70'"
        >
          <LayoutDashboard class="w-4 h-4 shrink-0" />
          <span>Dashboard ภาพรวม</span>
        </router-link>

        <router-link
          to="/buildings"
          @click="isMobileMenuOpen = false"
          class="flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs sm:text-sm font-medium transition-all group"
          :class="route.path === '/buildings' ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-semibold shadow-md shadow-purple-600/25' : 'text-slate-300 hover:text-white hover:bg-slate-800/70'"
        >
          <Building class="w-4 h-4 shrink-0" />
          <span>จัดการตึก/อาคาร</span>
        </router-link>

        <router-link
          to="/rooms"
          @click="isMobileMenuOpen = false"
          class="flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs sm:text-sm font-medium transition-all group"
          :class="route.path === '/rooms' ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-semibold shadow-md shadow-purple-600/25' : 'text-slate-300 hover:text-white hover:bg-slate-800/70'"
        >
          <DoorOpen class="w-4 h-4 shrink-0" />
          <span>จัดการห้องพัก</span>
        </router-link>

        <router-link
          to="/tenants"
          @click="isMobileMenuOpen = false"
          class="flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs sm:text-sm font-medium transition-all group"
          :class="route.path.startsWith('/tenants') ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-semibold shadow-md shadow-purple-600/25' : 'text-slate-300 hover:text-white hover:bg-slate-800/70'"
        >
          <Users class="w-4 h-4 shrink-0" />
          <span>ทะเบียนผู้เช่า (CRM)</span>
        </router-link>

        <router-link
          to="/meter-readings"
          @click="isMobileMenuOpen = false"
          class="flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs sm:text-sm font-medium transition-all group"
          :class="route.path === '/meter-readings' ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-semibold shadow-md shadow-purple-600/25' : 'text-slate-300 hover:text-white hover:bg-slate-800/70'"
        >
          <Zap class="w-4 h-4 shrink-0" />
          <span>จดมิเตอร์น้ำ-ไฟ</span>
        </router-link>

        <router-link
          to="/invoices"
          @click="isMobileMenuOpen = false"
          class="flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs sm:text-sm font-medium transition-all group"
          :class="route.path === '/invoices' ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-semibold shadow-md shadow-purple-600/25' : 'text-slate-300 hover:text-white hover:bg-slate-800/70'"
        >
          <Receipt class="w-4 h-4 shrink-0" />
          <span>จัดการใบแจ้งหนี้</span>
        </router-link>
      </nav>

      <!-- Sidebar Footer -->
      <div class="p-3 border-t border-slate-800/80 shrink-0 bg-slate-950/40 space-y-2">
        <button
          @click="handleAdminLogout"
          class="w-full flex items-center justify-center gap-2 px-3 py-2 text-xs font-semibold bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/30 rounded-xl transition-all cursor-pointer"
        >
          <LogOut class="w-3.5 h-3.5" />
          <span>ออกจากระบบ Admin</span>
        </button>
        <div class="text-center">
          <span class="text-[10px] text-slate-500 font-medium">HorHub Platform © 2026</span>
        </div>
      </div>
    </aside>

    <!-- Main Content Area -->
    <div class="flex-1 flex flex-col h-full min-w-0 overflow-hidden">
      <!-- Navbar บน -->
      <header class="h-16 bg-white/90 backdrop-blur-md border-b border-slate-200/80 px-4 sm:px-6 flex items-center justify-between shadow-2xs shrink-0 z-30">
        <div class="flex items-center gap-3">
          <button
            @click="isMobileMenuOpen = !isMobileMenuOpen"
            class="md:hidden p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
            aria-label="Toggle Mobile Menu"
          >
            <Menu class="w-5 h-5" />
          </button>

          <div class="flex items-center gap-2.5">
            <div class="w-8 h-8 rounded-xl bg-white border border-slate-200/80 p-0.5 shadow-xs flex items-center justify-center overflow-hidden shrink-0">
              <img src="/horhub-building-icon.png" alt="HorHub Building Icon" class="w-full h-full object-contain rounded-lg" />
            </div>
            <div>
              <h2 class="font-extrabold text-slate-900 text-sm sm:text-base tracking-tight truncate flex items-center gap-2">
                <span>HorHub CMS</span>
                <span class="text-[10px] px-2 py-0.5 font-bold text-purple-700 bg-purple-50 border border-purple-200/80 rounded-md hidden sm:inline">ระบบผู้ดูแลหอพัก</span>
              </h2>
            </div>
          </div>
        </div>

        <!-- Right Side: Building Switcher Dropdown -->
        <div class="flex items-center gap-3">
          <div class="flex items-center gap-2 bg-gradient-to-r from-purple-50 to-indigo-50 border border-purple-200 px-3 py-1.5 rounded-xl shadow-2xs">
            <Building2 class="w-4 h-4 text-purple-700 shrink-0" />
            <span class="text-xs font-bold text-purple-900 hidden sm:inline">เลือกตึก:</span>
            <select
              :value="buildingStore.activeBuildingId"
              @change="handleBuildingChange"
              class="bg-white/90 border border-purple-200 text-purple-950 font-bold text-xs rounded-lg px-2.5 py-1 focus:outline-hidden cursor-pointer"
            >
              <option v-for="b in buildingStore.buildings" :key="b.id" :value="b.id">
                🏢 {{ b.name }}
              </option>
            </select>
          </div>

          <div class="flex items-center gap-1.5 text-xs font-medium text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full shrink-0">
            <span class="w-2 h-2 rounded-full bg-emerald-500 animate-soft-pulse"></span>
            <span class="hidden sm:inline">Admin Online</span>
          </div>
        </div>
      </header>

      <!-- Page Content -->
      <main class="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto bg-slate-50/50">
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
import {
  Building2,
  Building,
  LayoutDashboard,
  DoorOpen,
  Users,
  Zap,
  Receipt,
  LogOut,
  Menu,
  X
} from 'lucide-vue-next';

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
