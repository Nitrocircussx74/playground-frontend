<template>
  <div class="min-h-screen bg-slate-100 text-slate-900 flex font-sans">
    <!-- Sidebar สำหรับ Admin หลังบ้าน -->
    <aside class="w-64 bg-slate-900 text-slate-100 flex flex-col shrink-0 shadow-xl">
      <div class="h-16 flex items-center gap-3 px-6 border-b border-slate-800">
        <div class="w-8 h-8 rounded-lg bg-purple-600 flex items-center justify-center text-white font-bold">
          🏢
        </div>
        <span class="font-bold text-base tracking-tight">Dorm Admin</span>
      </div>

      <nav class="flex-1 px-4 py-6 space-y-1.5">
        <router-link
          to="/admin/dashboard"
          class="flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-semibold transition-colors"
          :class="route.path === '/admin/dashboard' ? 'bg-purple-600 text-white shadow-md' : 'text-slate-400 hover:text-white hover:bg-slate-800'"
        >
          <span>📊</span>
          <span>Dashboard</span>
        </router-link>

        <router-link
          to="/admin/rooms"
          class="flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-semibold transition-colors"
          :class="route.path === '/admin/rooms' ? 'bg-purple-600 text-white shadow-md' : 'text-slate-400 hover:text-white hover:bg-slate-800'"
        >
          <span>🚪</span>
          <span>จัดการห้องพัก</span>
        </router-link>
      </nav>

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
      <!-- Navbar บน -->
      <header class="h-16 bg-white border-b border-slate-200/80 px-6 flex items-center justify-between shadow-sm">
        <h2 class="font-bold text-slate-800 text-base">ระบบผู้ดูแลหอพัก (Admin Management)</h2>
        <div class="flex items-center gap-2 text-xs font-medium text-slate-600 bg-slate-100 px-3 py-1.5 rounded-full">
          <span class="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          <span>Admin Online</span>
        </div>
      </header>

      <!-- Page Content -->
      <main class="flex-1 p-6 overflow-y-auto">
        <router-view />
      </main>
    </div>
  </div>
</template>

<script setup>
import { useRoute, useRouter } from 'vue-router';
import { useAdminAuthStore } from '@/stores/adminAuth';

const route = useRoute();
const router = useRouter();
const adminAuthStore = useAdminAuthStore();

const handleAdminLogout = () => {
  adminAuthStore.logout();
  router.push('/login');
};
</script>
