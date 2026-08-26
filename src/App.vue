<template>
  <div v-if="isCustomLayout" class="min-h-screen bg-slate-100 font-sans selection:bg-purple-600 selection:text-white">
    <router-view />
  </div>

  <div v-else class="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-purple-600 selection:text-white flex flex-col">
    <!-- Ambient Background Accents -->
    <div class="fixed inset-0 overflow-hidden pointer-events-none z-0">
      <div class="absolute -top-40 -left-40 w-96 h-96 bg-purple-900/20 rounded-full blur-3xl"></div>
      <div class="absolute top-1/2 -right-40 w-96 h-96 bg-indigo-900/20 rounded-full blur-3xl"></div>
    </div>

    <!-- Navigation Bar -->
    <header class="sticky top-0 z-50 border-b border-slate-800 bg-slate-900/80 backdrop-blur-md shadow-sm">
      <div class="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        <router-link to="/" class="flex items-center gap-2.5 group text-decoration-none">
          <div class="w-8 h-8 rounded-lg bg-gradient-to-tr from-purple-600 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-purple-600/30 group-hover:scale-105 transition-transform duration-200">
            🏢
          </div>
          <span class="font-bold text-base sm:text-lg tracking-tight text-slate-100">
            Dormitory Portal
          </span>
        </router-link>

        <nav class="flex items-center gap-2 sm:gap-4" v-if="authStore.isAuthenticated">
          <router-link
            to="/dashboard"
            class="text-xs sm:text-sm font-semibold px-2.5 py-1.5 rounded-lg transition-colors"
            :class="route.path === '/dashboard' ? 'bg-purple-900/40 text-purple-300 border border-purple-500/30' : 'text-slate-400 hover:text-slate-100'"
          >
            Dashboard
          </router-link>
          <router-link
            to="/rooms"
            class="text-xs sm:text-sm font-semibold px-2.5 py-1.5 rounded-lg transition-colors"
            :class="route.path === '/rooms' ? 'bg-purple-900/40 text-purple-300 border border-purple-500/30' : 'text-slate-400 hover:text-slate-100'"
          >
            Rooms
          </router-link>
          <router-link
            to="/meter-readings"
            class="text-xs sm:text-sm font-semibold px-2.5 py-1.5 rounded-lg transition-colors"
            :class="route.path === '/meter-readings' ? 'bg-purple-900/40 text-purple-300 border border-purple-500/30' : 'text-slate-400 hover:text-slate-100'"
          >
            Meters
          </router-link>
          <router-link
            to="/invoices"
            class="text-xs sm:text-sm font-semibold px-2.5 py-1.5 rounded-lg transition-colors"
            :class="route.path === '/invoices' ? 'bg-purple-900/40 text-purple-300 border border-purple-500/30' : 'text-slate-400 hover:text-slate-100'"
          >
            Invoices
          </router-link>
          <router-link
            to="/profile"
            class="text-xs sm:text-sm font-semibold px-2.5 py-1.5 rounded-lg transition-colors"
            :class="route.path === '/profile' ? 'bg-purple-900/40 text-purple-300 border border-purple-500/30' : 'text-slate-400 hover:text-slate-100'"
          >
            Profile
          </router-link>

          <div class="flex items-center gap-2 sm:gap-3 pl-2 sm:pl-3 border-l border-slate-800">
            <span class="text-xs text-slate-400 hidden md:inline-block font-mono font-medium">
              {{ authStore.currentUser?.email }}
            </span>
            <Button
              @click="handleLogout"
              variant="destructive"
              size="sm"
              class="h-8 px-2.5 text-xs bg-rose-900/30 text-rose-300 hover:bg-rose-900/50 border border-rose-700/40 font-semibold"
              :disabled="authStore.loading"
            >
              Logout
            </Button>
          </div>
        </nav>

        <div v-else-if="!authStore.loading" class="flex items-center gap-3">
          <router-link to="/login">
            <Button class="bg-purple-600 hover:bg-purple-700 text-white font-semibold shadow-md shadow-purple-600/20 text-xs h-9 px-4">
              Sign In
            </Button>
          </router-link>
        </div>
      </div>
    </header>

    <!-- Main Content Body -->
    <main class="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-8 relative z-10">
      <router-view />
    </main>

    <!-- Footer -->
    <footer class="border-t border-slate-800 bg-slate-900/40 py-6 relative z-10">
      <div class="max-w-6xl mx-auto px-4 sm:px-6 text-center text-xs text-slate-500 font-medium">
        <p>Dormitory Management System — Node.js (Express + Prisma) + Vue 3 (Pinia + Tailwind CSS)</p>
      </div>
    </footer>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { useAuthStore } from '@/stores/auth';
import { useRouter, useRoute } from 'vue-router';
import { Button } from '@/components/ui/button';

const authStore = useAuthStore();
const router = useRouter();
const route = useRoute();

const isCustomLayout = computed(() => {
  return route.path.startsWith('/admin') || route.path.startsWith('/liff');
});

const handleLogout = async () => {
  await authStore.logout();
  router.push('/login');
};
</script>
