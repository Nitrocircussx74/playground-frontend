<template>
  <!-- 1. Custom Fullscreen Layout (For LIFF, Login, 403) -->
  <div v-if="isCustomLayout" class="h-full w-full min-h-screen bg-slate-100 font-sans selection:bg-purple-600 selection:text-white">
    <router-view />
  </div>

  <!-- 2. Admin Backoffice App Shell -->
  <div v-else class="h-screen w-screen overflow-hidden bg-slate-50 text-slate-900 flex font-sans selection:bg-purple-600 selection:text-white">
    <!-- Backdrop สำหรับ Mobile Drawer -->
    <transition
      enter-active-class="transition-opacity duration-300"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      leave-active-class="transition-opacity duration-200"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div
        v-if="isMobileMenuOpen"
        @click="isMobileMenuOpen = false"
        class="fixed inset-0 bg-slate-950/60 backdrop-blur-xs z-40 md:hidden"
      ></div>
    </transition>

    <!-- 👈 Left Sidebar Navigation Menu (Permanent on Desktop, Drawer on Mobile) -->
    <aside
      v-if="authStore.isAuthenticated"
      :class="[
        'fixed md:static inset-y-0 left-0 z-50 w-72 h-full bg-slate-900 text-slate-100 flex flex-col shrink-0 border-r border-slate-800/80 shadow-2xl md:shadow-none backdrop-blur-xl transition-transform duration-300 ease-in-out',
        isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
      ]"
    >
      <!-- Sidebar Header / Brand Logo -->
      <div class="h-16 flex items-center justify-between px-5 border-b border-slate-800/90 shrink-0 bg-slate-950/40">
        <router-link to="/dashboard" class="flex items-center gap-3 group text-decoration-none">
          <div class="w-10 h-10 rounded-2xl bg-white/95 p-1 flex items-center justify-center shadow-lg shadow-purple-600/30 ring-2 ring-purple-500/20 group-hover:scale-105 transition-transform duration-200 overflow-hidden shrink-0">
            <img src="/horhub-app-icon.png" alt="HorHub Logo" class="w-full h-full object-contain rounded-xl" />
          </div>
          <div>
            <div class="font-bold text-sm tracking-tight text-white flex items-center gap-1.5">
              <span>HorHub (หอฮับ)</span>
              <span class="text-[10px] px-1.5 py-0.2 bg-purple-500/20 text-purple-300 font-mono rounded border border-purple-500/30">PRO</span>
            </div>
            <div class="text-[11px] text-slate-400 font-medium">ระบบบริหารจัดการหอพัก</div>
          </div>
        </router-link>

        <button
          @click="isMobileMenuOpen = false"
          class="md:hidden text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
          aria-label="Close menu"
        >
          <X class="w-5 h-5" />
        </button>
      </div>

      <!-- Left Sidebar Navigation Menu Items -->
      <nav class="flex-1 px-3 py-4 space-y-5 overflow-y-auto">
        <!-- 1. ภาพรวมระบบ (Overview) -->
        <div>
          <div class="px-3 text-[10px] font-extrabold tracking-wider text-slate-400 uppercase mb-1.5">
            Overview
          </div>
          <router-link
            to="/dashboard"
            @click="isMobileMenuOpen = false"
            class="flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs sm:text-sm font-medium transition-all duration-200 group"
            :class="route.path === '/dashboard' ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-semibold shadow-md shadow-purple-600/25' : 'text-slate-300 hover:text-white hover:bg-slate-800/70'"
          >
            <LayoutDashboard class="w-4 h-4 shrink-0 transition-transform group-hover:scale-110" :class="route.path === '/dashboard' ? 'text-white' : 'text-purple-400'" />
            <span>Dashboard ภาพรวม</span>
          </router-link>
        </div>

        <!-- 2. ผังอาคาร & ยูนิต (Buildings & Units) -->
        <div>
          <div class="px-3 text-[10px] font-extrabold tracking-wider text-slate-400 uppercase mb-1.5">
            {{ isRoomOwnerRole ? 'My Units & Tenants' : 'Buildings & Units' }}
          </div>
          <div class="space-y-1">
            <router-link
              v-if="!isRoomOwnerRole"
              to="/buildings"
              @click="isMobileMenuOpen = false"
              class="flex items-center gap-3 px-3 py-2 rounded-xl text-xs sm:text-sm font-medium transition-all duration-200 group"
              :class="route.path === '/buildings' ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-semibold shadow-md shadow-purple-600/25' : 'text-slate-300 hover:text-white hover:bg-slate-800/70'"
            >
              <Building class="w-4 h-4 shrink-0 transition-transform group-hover:scale-110" :class="route.path === '/buildings' ? 'text-white' : 'text-indigo-400'" />
              <span>จัดการตึก/อาคาร</span>
            </router-link>

            <router-link
              v-if="!isRoomOwnerRole"
              to="/building-settings"
              @click="isMobileMenuOpen = false"
              class="flex items-center gap-3 px-3 py-2 rounded-xl text-xs sm:text-sm font-medium transition-all duration-200 group"
              :class="route.path === '/building-settings' ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-semibold shadow-md shadow-purple-600/25' : 'text-slate-300 hover:text-white hover:bg-slate-800/70'"
            >
              <SlidersHorizontal class="w-4 h-4 shrink-0 transition-transform group-hover:scale-110" :class="route.path === '/building-settings' ? 'text-white' : 'text-indigo-400'" />
              <span>ตั้งค่าตึก & ค่าน้ำไฟ</span>
            </router-link>

            <router-link
              to="/rooms"
              @click="isMobileMenuOpen = false"
              class="flex items-center gap-3 px-3 py-2 rounded-xl text-xs sm:text-sm font-medium transition-all duration-200 group"
              :class="route.path === '/rooms' ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-semibold shadow-md shadow-purple-600/25' : 'text-slate-300 hover:text-white hover:bg-slate-800/70'"
            >
              <DoorOpen class="w-4 h-4 shrink-0 transition-transform group-hover:scale-110" :class="route.path === '/rooms' ? 'text-white' : 'text-indigo-400'" />
              <span>{{ isRoomOwnerRole ? 'ห้องพักของฉัน (My Rooms)' : 'จัดการห้องพัก' }}</span>
            </router-link>

            <router-link
              to="/leases"
              @click="isMobileMenuOpen = false"
              class="flex items-center gap-3 px-3 py-2 rounded-xl text-xs sm:text-sm font-medium transition-all duration-200 group"
              :class="route.path === '/leases' ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-semibold shadow-md shadow-purple-600/25' : 'text-slate-300 hover:text-white hover:bg-slate-800/70'"
            >
              <FileText class="w-4 h-4 shrink-0 transition-transform group-hover:scale-110" :class="route.path === '/leases' ? 'text-white' : 'text-indigo-400'" />
              <span>สัญญาเช่า & ประวัติ</span>
            </router-link>

            <router-link
              to="/tenants"
              @click="isMobileMenuOpen = false"
              class="flex items-center gap-3 px-3 py-2 rounded-xl text-xs sm:text-sm font-medium transition-all duration-200 group"
              :class="route.path.startsWith('/tenants') ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-semibold shadow-md shadow-purple-600/25' : 'text-slate-300 hover:text-white hover:bg-slate-800/70'"
            >
              <Users class="w-4 h-4 shrink-0 transition-transform group-hover:scale-110" :class="route.path.startsWith('/tenants') ? 'text-white' : 'text-indigo-400'" />
              <span>ทะเบียนผู้เช่า (CRM)</span>
            </router-link>
          </div>
        </div>

        <!-- 3. การเงิน & มิเตอร์ (Billing & Utilities) -->
        <div>
          <div class="px-3 text-[10px] font-extrabold tracking-wider text-slate-400 uppercase mb-1.5">
            {{ isRoomOwnerRole ? 'Financial & Billing' : 'Billing & Utilities' }}
          </div>
          <div class="space-y-1">
            <router-link
              v-if="!isRoomOwnerRole"
              to="/meter-readings"
              @click="isMobileMenuOpen = false"
              class="flex items-center gap-3 px-3 py-2 rounded-xl text-xs sm:text-sm font-medium transition-all duration-200 group"
              :class="route.path === '/meter-readings' ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-semibold shadow-md shadow-purple-600/25' : 'text-slate-300 hover:text-white hover:bg-slate-800/70'"
            >
              <Zap class="w-4 h-4 shrink-0 transition-transform group-hover:scale-110" :class="route.path === '/meter-readings' ? 'text-white' : 'text-amber-400'" />
              <span>จดมิเตอร์น้ำ-ไฟ</span>
            </router-link>

            <router-link
              to="/invoices"
              @click="isMobileMenuOpen = false"
              class="flex items-center gap-3 px-3 py-2 rounded-xl text-xs sm:text-sm font-medium transition-all duration-200 group"
              :class="route.path === '/invoices' ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-semibold shadow-md shadow-purple-600/25' : 'text-slate-300 hover:text-white hover:bg-slate-800/70'"
            >
              <Receipt class="w-4 h-4 shrink-0 transition-transform group-hover:scale-110" :class="route.path === '/invoices' ? 'text-white' : 'text-emerald-400'" />
              <span>{{ isRoomOwnerRole ? 'บิล & รายได้ค่าเช่า' : 'จัดการใบแจ้งหนี้ & บิล' }}</span>
            </router-link>
          </div>
        </div>

        <!-- 4. บริการผู้เช่า (Tenant Services) -->
        <div>
          <div class="px-3 text-[10px] font-extrabold tracking-wider text-slate-400 uppercase mb-1.5">
            Tenant Services
          </div>
          <div class="space-y-1">
            <router-link
              to="/maintenance"
              @click="isMobileMenuOpen = false"
              class="flex items-center gap-3 px-3 py-2 rounded-xl text-xs sm:text-sm font-medium transition-all duration-200 group"
              :class="route.path === '/maintenance' ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-semibold shadow-md shadow-purple-600/25' : 'text-slate-300 hover:text-white hover:bg-slate-800/70'"
            >
              <Wrench class="w-4 h-4 shrink-0 transition-transform group-hover:scale-110" :class="route.path === '/maintenance' ? 'text-white' : 'text-sky-400'" />
              <span>แจ้งซ่อม & ติดตาม</span>
            </router-link>

            <router-link
              v-if="!isRoomOwnerRole"
              to="/announcements"
              @click="isMobileMenuOpen = false"
              class="flex items-center gap-3 px-3 py-2 rounded-xl text-xs sm:text-sm font-medium transition-all duration-200 group"
              :class="route.path === '/announcements' ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-semibold shadow-md shadow-purple-600/25' : 'text-slate-300 hover:text-white hover:bg-slate-800/70'"
            >
              <Megaphone class="w-4 h-4 shrink-0 transition-transform group-hover:scale-110" :class="route.path === '/announcements' ? 'text-white' : 'text-purple-400'" />
              <span>ข่าวสาร & ประกาศ</span>
            </router-link>

            <router-link
              v-if="!isRoomOwnerRole"
              to="/parcels"
              @click="isMobileMenuOpen = false"
              class="flex items-center gap-3 px-3 py-2 rounded-xl text-xs sm:text-sm font-medium transition-all duration-200 group"
              :class="route.path === '/parcels' || route.path === '/admin/parcels' ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-semibold shadow-md shadow-purple-600/25' : 'text-slate-300 hover:text-white hover:bg-slate-800/70'"
            >
              <Package class="w-4 h-4 shrink-0 transition-transform group-hover:scale-110" :class="(route.path === '/parcels' || route.path === '/admin/parcels') ? 'text-white' : 'text-amber-400'" />
              <span>จัดการพัสดุ</span>
            </router-link>
          </div>
        </div>

        <!-- 5. ตั้งค่าระบบ (System Settings) -->
        <div>
          <div class="px-3 text-[10px] font-extrabold tracking-wider text-slate-400 uppercase mb-1.5">
            System Settings
          </div>
          <div class="space-y-1">
            <router-link
              v-if="isOwnerRole"
              to="/admin/users"
              @click="isMobileMenuOpen = false"
              class="flex items-center gap-3 px-3 py-2 rounded-xl text-xs sm:text-sm font-medium transition-all duration-200 group"
              :class="route.path === '/admin/users' ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-semibold shadow-md shadow-purple-600/25' : 'text-slate-300 hover:text-white hover:bg-slate-800/70'"
            >
              <ShieldCheck class="w-4 h-4 shrink-0 transition-transform group-hover:scale-110" :class="route.path === '/admin/users' ? 'text-white' : 'text-rose-400'" />
              <span>จัดการแอดมิน</span>
            </router-link>

            <router-link
              v-if="isOwnerRole"
              to="/admin/audit-logs"
              @click="isMobileMenuOpen = false"
              class="flex items-center gap-3 px-3 py-2 rounded-xl text-xs sm:text-sm font-medium transition-all duration-200 group"
              :class="route.path === '/admin/audit-logs' ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-semibold shadow-md shadow-purple-600/25' : 'text-slate-300 hover:text-white hover:bg-slate-800/70'"
            >
              <History class="w-4 h-4 shrink-0 transition-transform group-hover:scale-110" :class="route.path === '/admin/audit-logs' ? 'text-white' : 'text-slate-400'" />
              <span>ประวัติการใช้งาน</span>
            </router-link>

            <router-link
              v-if="!isRoomOwnerRole"
              to="/features"
              @click="isMobileMenuOpen = false"
              class="flex items-center gap-3 px-3 py-2 rounded-xl text-xs sm:text-sm font-medium transition-all duration-200 group"
              :class="route.path === '/features' ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-semibold shadow-md shadow-purple-600/25' : 'text-slate-300 hover:text-white hover:bg-slate-800/70'"
            >
              <Sparkles class="w-4 h-4 shrink-0 transition-transform group-hover:scale-110" :class="route.path === '/features' ? 'text-white' : 'text-amber-400'" />
              <span>ตั้งค่าฟีเจอร์</span>
            </router-link>

            <router-link
              to="/profile"
              @click="isMobileMenuOpen = false"
              class="flex items-center gap-3 px-3 py-2 rounded-xl text-xs sm:text-sm font-medium transition-all duration-200 group"
              :class="route.path === '/profile' ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-semibold shadow-md shadow-purple-600/25' : 'text-slate-300 hover:text-white hover:bg-slate-800/70'"
            >
              <User class="w-4 h-4 shrink-0 transition-transform group-hover:scale-110" :class="route.path === '/profile' ? 'text-white' : 'text-indigo-400'" />
              <span>โปรไฟล์ของฉัน</span>
            </router-link>
          </div>
        </div>
      </nav>

      <!-- Sidebar Footer / User Info Card -->
      <div class="p-3 border-t border-slate-800/80 shrink-0 bg-slate-950/40 space-y-2.5">
        <div class="px-2 py-1.5 bg-slate-800/50 rounded-xl border border-slate-700/50 flex items-center justify-between">
          <div class="flex items-center gap-2 min-w-0">
            <div class="w-7 h-7 rounded-lg bg-gradient-to-tr from-purple-600 to-indigo-600 text-white font-bold flex items-center justify-center text-xs shadow-xs">
              {{ (authStore.currentUser?.email || 'A')[0].toUpperCase() }}
            </div>
            <div class="min-w-0">
              <div class="text-[10px] text-slate-400 font-medium">เข้าสู่ระบบโดย</div>
              <div class="text-xs font-semibold text-white truncate">{{ authStore.currentUser?.email }}</div>
            </div>
          </div>
          <span class="text-[9px] font-bold px-1.5 py-0.5 bg-purple-500/20 text-purple-300 border border-purple-500/30 rounded-full font-mono uppercase">
            {{ (authStore.currentUser?.role || 'Admin').toUpperCase() }}
          </span>
        </div>

        <button
          @click="handleLogout"
          class="w-full flex items-center justify-center gap-2 px-3 py-2 text-xs font-semibold bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/30 rounded-xl transition-all cursor-pointer"
        >
          <LogOut class="w-3.5 h-3.5" />
          <span>ออกจากระบบ</span>
        </button>
      </div>
    </aside>

    <!-- Main Content Area -->
    <div class="flex-1 flex flex-col h-full min-w-0 overflow-hidden">
      <!-- 🌟 Modern Frosted Top Header -->
      <header class="h-16 bg-white/85 backdrop-blur-md border-b border-slate-200/80 px-4 sm:px-6 flex items-center justify-between shadow-2xs shrink-0 z-30">
        <div class="flex items-center gap-3 min-w-0">
          <button
            v-if="authStore.isAuthenticated"
            @click="isMobileMenuOpen = !isMobileMenuOpen"
            class="md:hidden p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
            aria-label="Toggle Mobile Menu"
          >
            <Menu class="w-5 h-5" />
          </button>

          <div class="min-w-0">
            <h2 class="font-extrabold text-slate-900 text-sm sm:text-base tracking-tight truncate flex items-center gap-2">
              <span>HorHub (หอฮับ)</span>
              <span class="hidden lg:inline text-xs font-normal text-slate-400">|</span>
              <span class="hidden lg:inline text-xs font-medium text-slate-500 truncate">ระบบจัดการหอพักและอพาร์ตเมนต์</span>
            </h2>
          </div>
        </div>

        <!-- Right Side: Building Switcher Dropdown & Guided Tour Help Button -->
        <div v-if="authStore.isAuthenticated" class="flex items-center gap-2 sm:gap-3 shrink-0">
          <!-- Help Tour Button -->
          <button
            id="btn-help-tour"
            @click="triggerHelpTour"
            title="แนะนำการใช้งานหน้านี้ (Guided Tour)"
            class="px-3 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-800 rounded-xl border border-amber-300/80 text-xs font-bold transition-all shadow-2xs flex items-center gap-1.5 cursor-pointer active:scale-95"
          >
            <CircleHelp class="w-4 h-4 text-amber-600 shrink-0" />
            <span class="hidden sm:inline">คู่มือแนะนำ</span>
          </button>

          <!-- Building Switcher Capsule -->
          <div id="tour-building-selector" class="flex items-center gap-2 bg-gradient-to-r from-purple-50 to-indigo-50 border border-purple-200/90 px-3 py-1.5 rounded-xl shadow-2xs">
            <Building2 class="w-4 h-4 text-purple-700 shrink-0" />
            <select
              :value="buildingStore.activeBuildingId"
              @change="handleBuildingChange"
              class="bg-white/90 border border-purple-200 text-purple-950 font-bold text-xs rounded-lg px-2.5 py-1 focus:outline-hidden focus:ring-2 focus:ring-purple-500/20 cursor-pointer min-w-[150px] sm:min-w-[180px]"
            >
              <option value="">🌐 ภาพรวมทั้งหมด (ทุกหอพัก)</option>
              <option v-if="buildingStore.buildings.length === 0" value="" disabled>
                {{ buildingStore.isLoading ? 'กำลังโหลดข้อมูลตึก...' : 'ไม่พบข้อมูลตึก' }}
              </option>
              <option v-for="b in buildingStore.buildings" :key="b.id" :value="b.id">
                🏢 {{ b.name }}
              </option>
            </select>
          </div>

          <!-- System Online Status Dot -->
          <div class="hidden xl:flex items-center gap-1.5 text-[11px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-full">
            <span class="w-2 h-2 rounded-full bg-emerald-500 animate-soft-pulse"></span>
            <span>ระบบพร้อมใช้งาน</span>
          </div>
        </div>

        <div v-else-if="!authStore.loading">
          <router-link to="/login">
            <Button class="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-bold text-xs h-9 px-4 rounded-xl shadow-md shadow-purple-600/20">
              เข้าสู่ระบบ
            </Button>
          </router-link>
        </div>
      </header>

      <!-- Main Page Content -->
      <main class="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto bg-slate-50/50">
        <router-view v-slot="{ Component }">
          <transition name="page-fade" mode="out-in">
            <component :is="Component" />
          </transition>
        </router-view>
      </main>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import { useAuthStore } from '@/stores/auth';
import { useBuildingStore } from '@/stores/useBuildingStore';
import { useRouter, useRoute } from 'vue-router';
import { Button } from '@/components/ui/button';
import {
  Building2,
  Building,
  LayoutDashboard,
  DoorOpen,
  FileText,
  Users,
  Zap,
  Receipt,
  Wrench,
  Megaphone,
  Package,
  ShieldCheck,
  History,
  SlidersHorizontal,
  User,
  LogOut,
  Menu,
  X,
  CircleHelp,
  Sparkles
} from 'lucide-vue-next';
import { startTour } from '@/utils/tours';

const authStore = useAuthStore();
const buildingStore = useBuildingStore();
const router = useRouter();
const route = useRoute();

const triggerHelpTour = () => {
  const path = route.path;
  let tourKey = 'dashboard';
  if (path.includes('meter')) tourKey = 'meter';
  else if (path.includes('lease')) tourKey = 'leases';
  else if (path.includes('maintenance')) tourKey = 'maintenance';
  else tourKey = 'dashboard';

  startTour(tourKey, true);
};

const isMobileMenuOpen = ref(false);

const isRoomOwnerRole = computed(() => {
  const role = (authStore.currentUser?.role || authStore.user?.role || '').toLowerCase();
  return ['room_owner', 'investor'].includes(role);
});

const isOwnerRole = computed(() => {
  const role = (authStore.currentUser?.role || authStore.user?.role || '').toLowerCase();
  return ['owner', 'super_admin', 'superadmin', 'admin'].includes(role);
});

onMounted(() => {
  if (authStore.isAuthenticated) {
    buildingStore.fetchBuildings();
  }
});

watch(
  () => authStore.isAuthenticated,
  (isAuth) => {
    if (isAuth && buildingStore.buildings.length === 0) {
      buildingStore.fetchBuildings();
    }
  },
  { immediate: true }
);

const isCustomLayout = computed(() => {
  if (!authStore.isAuthenticated) return true;
  // route.meta?.isLiff ครอบคลุมหน้า PIN (/liff/pin-login, /liff/setup-pin, /liff/change-pin) อยู่แล้ว
  return (
    route.meta?.isLiff ||
    route.path.startsWith('/liff') ||
    route.path === '/login' ||
    route.path === '/403'
  );
});

const handleBuildingChange = (e) => {
  buildingStore.setActiveBuildingId(e.target.value);
};

const handleLogout = async () => {
  await authStore.logout();
  router.push('/login');
};
</script>
