<template>
  <div class="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-purple-600 selection:text-white flex flex-col">
    <!-- Ambient Background Accents -->
    <div class="fixed inset-0 overflow-hidden pointer-events-none z-0">
      <div class="absolute -top-40 -left-40 w-96 h-96 bg-purple-200/40 rounded-full blur-3xl"></div>
      <div class="absolute top-1/2 -right-40 w-96 h-96 bg-indigo-200/40 rounded-full blur-3xl"></div>
    </div>

    <!-- Light Navigation Bar -->
    <header class="sticky top-0 z-50 border-b border-slate-200/80 bg-white/80 backdrop-blur-md shadow-sm">
      <div class="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        <router-link to="/" class="flex items-center gap-2.5 group text-decoration-none">
          <div class="w-8 h-8 rounded-lg bg-gradient-to-tr from-purple-600 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-purple-600/30 group-hover:scale-105 transition-transform duration-200">
            ⚡
          </div>
          <span class="font-bold text-lg tracking-tight text-slate-900">
            Vue3 Auth Portal
          </span>
        </router-link>

        <nav class="flex items-center gap-4" v-if="authStore.isAuthenticated">
          <router-link
            to="/dashboard"
            class="text-sm font-semibold px-3 py-1.5 rounded-lg transition-colors"
            :class="route.path === '/dashboard' ? 'bg-purple-50 text-purple-700 border border-purple-200' : 'text-slate-600 hover:text-slate-900'"
          >
            Dashboard
          </router-link>
          <router-link
            to="/profile"
            class="text-sm font-semibold px-3 py-1.5 rounded-lg transition-colors"
            :class="route.path === '/profile' ? 'bg-purple-50 text-purple-700 border border-purple-200' : 'text-slate-600 hover:text-slate-900'"
          >
            Profile
          </router-link>

          <div class="flex items-center gap-3 pl-3 border-l border-slate-200">
            <span class="text-xs text-slate-600 hidden sm:inline-block font-mono font-medium">
              {{ authStore.currentUser?.email }}
            </span>
            <Button
              @click="handleLogout"
              variant="destructive"
              size="sm"
              class="h-8 px-3 text-xs bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200 font-semibold"
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
    <main class="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-8 relative z-10">
      <router-view />
    </main>

    <!-- Footer -->
    <footer class="border-t border-slate-200 bg-white/60 py-6 relative z-10">
      <div class="max-w-6xl mx-auto px-4 sm:px-6 text-center text-xs text-slate-500 font-medium">
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
