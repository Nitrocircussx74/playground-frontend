<template>
  <div class="flex justify-center py-6">
    <Card class="w-full max-w-lg border-slate-800/80 bg-slate-900/60 backdrop-blur-xl shadow-xl">
      <CardHeader class="flex flex-col items-center text-center pb-6">
        <div class="w-20 h-20 rounded-full bg-gradient-to-tr from-purple-600 to-indigo-500 flex items-center justify-center text-2xl font-bold text-white mb-4 shadow-lg shadow-purple-600/30 ring-4 ring-purple-500/10">
          {{ userInitials }}
        </div>
        <CardTitle class="text-2xl font-bold text-white">User Profile</CardTitle>
        <CardDescription class="text-purple-400 font-medium text-xs">
          Authenticated Session (JWT Dual Tokens)
        </CardDescription>
      </CardHeader>

      <CardContent class="space-y-4">
        <div class="space-y-3 p-4 rounded-xl bg-slate-950/60 border border-slate-800/80 text-sm">
          <div class="flex justify-between items-center py-1.5 border-b border-slate-800/60">
            <span class="text-slate-400">Email Address</span>
            <span class="font-semibold text-slate-100">{{ authStore.currentUser?.email || 'N/A' }}</span>
          </div>

          <div class="flex justify-between items-center py-1.5 border-b border-slate-800/60">
            <span class="text-slate-400">User ID</span>
            <code class="px-2 py-0.5 rounded bg-slate-900 font-mono text-xs text-purple-400 border border-slate-800">
              {{ authStore.currentUser?.id || 'N/A' }}
            </code>
          </div>

          <div class="flex justify-between items-center py-1.5 border-b border-slate-800/60">
            <span class="text-slate-400">Role</span>
            <span class="uppercase tracking-wider text-xs font-bold text-indigo-400">
              {{ authStore.currentUser?.role || 'user' }}
            </span>
          </div>

          <div class="flex justify-between items-center py-1.5">
            <span class="text-slate-400">Auth Security</span>
            <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              HTTP-Only Cookie Protected
            </span>
          </div>
        </div>
      </CardContent>

      <CardFooter class="flex justify-center pt-2">
        <Button
          @click="refreshProfile"
          variant="outline"
          class="w-full border-slate-700 bg-slate-800/50 hover:bg-slate-800 text-slate-200"
          :disabled="loading"
        >
          Reload Profile (GET /auth/me)
        </Button>
      </CardFooter>
    </Card>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useAuthStore } from '@/stores/auth';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter
} from '@/components/ui/card';

const authStore = useAuthStore();
const loading = ref(false);

const userInitials = computed(() => {
  const email = authStore.currentUser?.email || '';
  return email ? email.slice(0, 2).toUpperCase() : 'US';
});

const refreshProfile = async () => {
  loading.value = true;
  try {
    await authStore.fetchProfile();
  } finally {
    loading.value = false;
  }
};
</script>
