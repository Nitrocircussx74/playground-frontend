<template>
  <div class="flex justify-center py-6">
    <Card class="w-full max-w-lg border-slate-200 bg-white shadow-xl shadow-slate-200/50">
      <CardHeader class="flex flex-col items-center text-center pb-6">
        <div class="w-20 h-20 rounded-full bg-gradient-to-tr from-purple-600 to-indigo-600 flex items-center justify-center text-2xl font-bold text-white mb-4 shadow-lg shadow-purple-600/30 ring-4 ring-purple-100">
          {{ userInitials }}
        </div>
        <CardTitle class="text-2xl font-bold text-slate-900">User Profile</CardTitle>
        <CardDescription class="text-purple-700 font-semibold text-xs mt-1">
          Authenticated Session (JWT Dual Tokens)
        </CardDescription>
      </CardHeader>

      <CardContent class="space-y-4">
        <div class="space-y-3 p-4 rounded-xl bg-slate-50 border border-slate-200/80 text-sm">
          <div class="flex justify-between items-center py-1.5 border-b border-slate-200/60">
            <span class="text-slate-600 font-medium">Email Address</span>
            <span class="font-bold text-slate-900">{{ authStore.currentUser?.email || 'N/A' }}</span>
          </div>

          <div class="flex justify-between items-center py-1.5 border-b border-slate-200/60">
            <span class="text-slate-600 font-medium">User ID</span>
            <code class="px-2 py-0.5 rounded bg-white font-mono text-xs text-purple-700 border border-slate-300 font-bold">
              {{ authStore.currentUser?.id || 'N/A' }}
            </code>
          </div>

          <div class="flex justify-between items-center py-1.5 border-b border-slate-200/60">
            <span class="text-slate-600 font-medium">Role</span>
            <span class="uppercase tracking-wider text-xs font-extrabold text-indigo-600">
              {{ authStore.currentUser?.role || 'user' }}
            </span>
          </div>

          <div class="flex justify-between items-center py-1.5">
            <span class="text-slate-600 font-medium">Auth Security</span>
            <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
              HTTP-Only Cookie Protected
            </span>
          </div>
        </div>
      </CardContent>

      <CardFooter class="flex justify-center pt-2">
        <Button
          @click="refreshProfile"
          variant="outline"
          class="w-full border-slate-300 bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold"
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
