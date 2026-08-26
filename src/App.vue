<template>
  <div class="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-purple-500 selection:text-white flex flex-col">
    <!-- Background Gradient Orbs -->
    <div class="fixed inset-0 overflow-hidden pointer-events-none z-0">
      <div class="absolute -top-40 -left-40 w-96 h-96 bg-purple-600/15 rounded-full blur-3xl"></div>
      <div class="absolute top-1/2 -right-40 w-96 h-96 bg-indigo-600/15 rounded-full blur-3xl"></div>
    </div>

    <!-- Navigation Bar -->
    <header class="sticky top-0 z-50 border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-md">
      <div class="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        <router-link to="/" class="flex items-center gap-2.5 group text-decoration-none">
          <div class="w-8 h-8 rounded-lg bg-gradient-to-tr from-purple-600 to-indigo-500 flex items-center justify-center text-white shadow-md shadow-purple-600/30 group-hover:scale-105 transition-transform duration-200">
            ⚡
          </div>
          <span class="font-bold text-lg tracking-tight bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
            Vue3 Auth Portal
          </span>
        </router-link>

        <nav class="flex items-center gap-4" v-if="authStore.isAuthenticated">
          <router-link
            to="/dashboard"
            class="text-sm font-medium px-3 py-1.5 rounded-lg transition-colors"
            :class="route.path === '/dashboard' ? 'bg-purple-500/10 text-purple-400 border border-purple-500/20' : 'text-slate-400 hover:text-slate-200'"
          >
            Dashboard
          </router-link>
          <router-link
            to="/profile"
            class="text-sm font-medium px-3 py-1.5 rounded-lg transition-colors"
            :class="route.path === '/profile' ? 'bg-purple-500/10 text-purple-400 border border-purple-500/20' : 'text-slate-400 hover:text-slate-200'"
          >
            Profile
          </router-link>

          <div class="flex items-center gap-3 pl-3 border-l border-slate-800">
            <span class="text-xs text-slate-400 hidden sm:inline-block font-mono">
              {{ authStore.currentUser?.email }}
            </span>
            <Button
              @click="handleLogout"
              variant="destructive"
              size="sm"
              class="h-8 px-3 text-xs bg-rose-950/50 text-rose-300 hover:bg-rose-900/60 border border-rose-800/40"
              :disabled="authStore.loading"
            >
              Logout
            </Button>
          </div>
        </nav>

        <div v-else-if="!authStore.loading" class="flex items-center gap-3">
          <router-link to="/login">
            <Button class="bg-purple-600 hover:bg-purple-500 text-white font-medium shadow-md shadow-purple-600/20 text-xs h-9 px-4">
              Sign In
            </Button>
          </router-link>
        </div>
      </div>
    </header>

    <!-- Main Content Body -->
    <main class="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-8 relative z-10">
      <router-view />
    </main>

    <!-- Footer -->
    <footer class="border-t border-slate-800/80 bg-slate-950/60 py-6 relative z-10">
      <div class="max-w-6xl mx-auto px-4 sm:px-6 text-center text-xs text-slate-500">
        <p>Vue 3 + Vite + Tailwind CSS + Shadcn Vue + Pinia + Axios (HTTP-Only Cookie Auth)</p>
      </div>
    </footer>
  </div>
</template>

<script setup>
import { useAuthStore } from '@/stores/auth';
import { useRouter, useRoute } from 'vue-router';
import { Button } from '@/components/ui/button';

const authStore = useAuthStore();
const router = useRouter();
const route = useRoute();

const handleLogout = async () => {
  await authStore.logout();
  router.push('/login');
};
</script>
