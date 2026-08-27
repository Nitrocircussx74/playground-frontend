<template>
  <div class="flex items-center justify-center min-h-[75vh] px-4 py-8">
    <Card class="w-full max-w-md border-slate-200 bg-white/95 backdrop-blur-xl shadow-2xl shadow-purple-900/10">
      <CardHeader class="space-y-2 text-center pb-6">
        <div class="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-purple-50 border border-purple-200 text-purple-600 mx-auto mb-2 shadow-sm">
          <svg xmlns="http://www.w3.org/2000/svg" class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
        </div>
        <CardTitle class="text-2xl font-bold tracking-tight text-slate-900">Sign In to Portal</CardTitle>
        <CardDescription class="text-slate-500 text-sm">
          Enter credentials to authenticate with JWT & HTTP-Only Cookie
        </CardDescription>
      </CardHeader>

      <CardContent>
        <form @submit.prevent="handleLogin" class="space-y-4">
          <div class="space-y-1.5">
            <label for="email" class="text-xs font-bold uppercase tracking-wider text-slate-600">Email Address</label>
            <Input
              id="email"
              v-model="email"
              type="email"
              placeholder="developer@example.com"
              required
              data-testid="email-input"
              :disabled="authStore.loading"
            />
          </div>

          <div class="space-y-1.5">
            <label for="password" class="text-xs font-bold uppercase tracking-wider text-slate-600">Password</label>
            <Input
              id="password"
              v-model="password"
              type="password"
              placeholder="••••••••"
              required
              data-testid="password-input"
              :disabled="authStore.loading"
            />
          </div>

          <div v-if="errorMessage" data-testid="error-message" class="p-3.5 text-xs text-rose-700 bg-rose-50 border border-rose-200 rounded-lg text-center font-medium shadow-sm">
            {{ errorMessage }}
          </div>

          <Button
            type="submit"
            data-testid="login-button"
            class="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-semibold shadow-lg shadow-purple-600/25 h-10 mt-2 transition-all duration-200"
            :disabled="authStore.loading"
          >
            <span v-if="authStore.loading" class="flex items-center justify-center gap-2">
              <svg class="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Authenticating...
            </span>
            <span v-else>Sign In</span>
          </Button>
        </form>
      </CardContent>

      <CardFooter>
        <div class="w-full p-3.5 rounded-lg bg-slate-50 border border-slate-200/80 text-xs space-y-2">
          <div class="flex items-center gap-1.5 text-purple-700 font-bold">
            <span>💡 Demo Credentials & Security</span>
          </div>
          <ul class="space-y-1 text-slate-600 pl-4 list-disc">
            <li><strong>Access Token:</strong> Saved strictly in Pinia State (Memory ONLY)</li>
            <li><strong>Refresh Token:</strong> Set as HTTP-Only Cookie by Backend</li>
          </ul>
        </div>
      </CardFooter>
    </Card>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useAuthStore } from '@/stores/auth';
import { useRouter, useRoute } from 'vue-router';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter
} from '@/components/ui/card';

const authStore = useAuthStore();
const router = useRouter();
const route = useRoute();

const email = ref('developer@example.com');
const password = ref('password123');
const errorMessage = ref('');

const handleLogin = async () => {
  errorMessage.value = '';
  try {
    await authStore.login(email.value, password.value);
    const redirectPath = route.query.redirect || '/dashboard';
    router.push(redirectPath);
  } catch (error) {
    errorMessage.value =
      error.response?.data?.message || 'Login failed. Please check your network connection.';
  }
};
</script>
