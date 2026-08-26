<template>
  <div class="space-y-8">
    <!-- Header Section -->
    <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-slate-200 pb-6">
      <div>
        <h1 class="text-3xl font-bold tracking-tight text-slate-900">API Dashboard</h1>
        <p class="text-slate-500 text-sm mt-1">
          Test JWT authorization headers & silent refresh interceptor
        </p>
      </div>

      <div class="flex items-center gap-2">
        <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
          <span class="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          Backend API Online
        </span>
      </div>
    </div>

    <!-- Grid Section -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
      <!-- Auth Status Card -->
      <Card class="border-slate-200 bg-white shadow-xl shadow-slate-200/50">
        <CardHeader>
          <CardTitle class="text-lg font-bold flex items-center gap-2 text-slate-900">
            <span>🔑 Auth Status (Memory State)</span>
          </CardTitle>
          <CardDescription class="text-slate-500">Real-time security tokens state in Pinia store</CardDescription>
        </CardHeader>
        <CardContent class="space-y-4">
          <div class="flex justify-between items-center text-sm py-2 border-b border-slate-100">
            <span class="text-slate-600 font-medium">Access Token Status</span>
            <span v-if="authStore.accessToken" class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
              Active in Pinia State
            </span>
            <span v-else class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200">
              Missing
            </span>
          </div>

          <div class="flex justify-between items-center text-sm py-2 border-b border-slate-100">
            <span class="text-slate-600 font-medium">Refresh Token Storage</span>
            <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
              HTTP-Only Cookie
            </span>
          </div>

          <div class="flex justify-between items-center text-sm py-2 border-b border-slate-100">
            <span class="text-slate-600 font-medium">User ID</span>
            <code class="px-2 py-1 rounded bg-slate-100 font-mono text-xs text-purple-700 border border-slate-200 font-bold">
              {{ authStore.currentUser?.id || 'N/A' }}
            </code>
          </div>

          <div v-if="authStore.accessToken" class="space-y-1.5 pt-2">
            <span class="text-xs font-bold text-slate-600">Access Token Preview (Truncated):</span>
            <div class="p-3 rounded-lg bg-slate-900 font-mono text-xs text-purple-300 border border-slate-800 break-all shadow-inner">
              {{ truncatedToken }}
            </div>
          </div>
        </CardContent>
      </Card>

      <!-- Action & Test Card -->
      <Card class="border-slate-200 bg-white shadow-xl shadow-slate-200/50">
        <CardHeader>
          <CardTitle class="text-lg font-bold flex items-center gap-2 text-slate-900">
            <span>🚀 Test Protected Endpoints</span>
          </CardTitle>
          <CardDescription class="text-slate-500">Execute API calls to backend requiring Authorization header</CardDescription>
        </CardHeader>
        <CardContent class="space-y-4">
          <div class="flex flex-wrap gap-3">
            <Button
              @click="fetchApiOverview"
              class="bg-purple-600 hover:bg-purple-700 text-white font-semibold shadow-md shadow-purple-600/20"
              :disabled="loading"
            >
              GET /api (Overview)
            </Button>
            <Button
              @click="triggerManualRefresh"
              variant="outline"
              class="border-slate-300 bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold"
              :disabled="loading"
            >
              Silent Refresh Token
            </Button>
          </div>

          <div v-if="apiResponse" class="rounded-xl border border-slate-800 bg-slate-950 overflow-hidden shadow-inner">
            <div class="flex items-center justify-between px-4 py-2.5 bg-slate-900 border-b border-slate-800 text-xs font-semibold text-slate-300">
              <span>API Response Output</span>
              <span class="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold bg-emerald-500/20 text-emerald-400">
                HTTP 200 OK
              </span>
            </div>
            <pre class="p-4 text-xs font-mono text-emerald-400 overflow-x-auto">{{ JSON.stringify(apiResponse, null, 2) }}</pre>
          </div>

          <div v-if="apiError" class="p-3.5 text-xs text-rose-700 bg-rose-50 border border-rose-200 rounded-lg text-center font-semibold">
            {{ apiError }}
          </div>
        </CardContent>
      </Card>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useAuthStore } from '@/stores/auth';
import api from '@/utils/api';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent
} from '@/components/ui/card';

const authStore = useAuthStore();
const loading = ref(false);
const apiResponse = ref(null);
const apiError = ref(null);

const truncatedToken = computed(() => {
  if (!authStore.accessToken) return '';
  return `${authStore.accessToken.slice(0, 20)}...${authStore.accessToken.slice(-20)}`;
});

const fetchApiOverview = async () => {
  loading.value = true;
  apiResponse.value = null;
  apiError.value = null;
  try {
    const res = await api.get('/api');
    apiResponse.value = res.data;
  } catch (err) {
    apiError.value = err.response?.data?.message || 'Failed to fetch API overview';
  } finally {
    loading.value = false;
  }
};

const triggerManualRefresh = async () => {
  loading.value = true;
  apiError.value = null;
  try {
    const success = await authStore.silentRefresh();
    if (success) {
      apiResponse.value = { message: 'Token rotated successfully via HTTP-Only cookie!' };
    }
  } catch (err) {
    apiError.value = 'Manual refresh failed.';
  } finally {
    loading.value = false;
  }
};
</script>
