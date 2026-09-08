<template>
  <div class="min-h-screen flex items-center justify-center px-4 py-12 relative overflow-hidden bg-slate-900 font-sans selection:bg-purple-600 selection:text-white">
    <!-- Ambient Glow Background Meshes -->
    <div class="absolute inset-0 pointer-events-none overflow-hidden z-0">
      <div class="absolute -top-40 -left-40 w-96 h-96 bg-purple-600/30 rounded-full blur-[100px]"></div>
      <div class="absolute top-1/2 -right-40 w-[30rem] h-[30rem] bg-indigo-600/25 rounded-full blur-[120px]"></div>
      <div class="absolute -bottom-40 left-1/3 w-96 h-96 bg-pink-600/20 rounded-full blur-[100px]"></div>
    </div>

    <!-- Login Card Container -->
    <div class="w-full max-w-md relative z-10">
      <Card class="border-slate-800/80 bg-slate-900/80 backdrop-blur-2xl shadow-2xl shadow-purple-950/50 rounded-3xl overflow-hidden text-slate-100">
        <CardHeader class="space-y-3 text-center pb-6 pt-8 px-6 sm:px-8 border-b border-slate-800/60 bg-gradient-to-b from-slate-800/40 to-transparent">
          <div class="relative mx-auto inline-flex">
            <div class="w-14 h-14 rounded-2xl bg-gradient-to-tr from-purple-600 via-indigo-600 to-purple-500 flex items-center justify-center text-white shadow-xl shadow-purple-600/40">
              <Building2 class="w-7 h-7" />
            </div>
            <span class="absolute -top-1 -right-1 flex h-3.5 w-3.5">
              <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-purple-400 opacity-75"></span>
              <span class="relative inline-flex rounded-full h-3.5 w-3.5 bg-purple-500 border-2 border-slate-900"></span>
            </span>
          </div>

          <div>
            <CardTitle class="text-2xl font-extrabold tracking-tight text-white">
              HorHub (หอฮับ)
            </CardTitle>
            <p class="text-xs font-medium text-purple-300 mt-1">
              ระบบจัดการหอพักและอพาร์ตเมนต์
            </p>
          </div>
          <CardDescription class="text-slate-400 text-xs">
            เข้าสู่ระบบสำหรับลูกบ้าน ผู้ดูแลระบบ และเจ้าของหอพัก
          </CardDescription>
        </CardHeader>

        <CardContent class="px-6 sm:px-8 pt-6 space-y-5">
          <!-- SECTION 1: LINE SSO Login (Top Primary Button) -->
          <div class="space-y-2">
            <button
              type="button"
              @click="handleLineSSO"
              :disabled="authStore.loading || isLineLoggingIn"
              class="w-full py-3.5 px-4 bg-[#06C755] hover:bg-[#05B34C] active:bg-[#049B42] text-white rounded-2xl text-xs font-extrabold transition-all shadow-lg shadow-emerald-600/30 flex items-center justify-between cursor-pointer hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50"
            >
              <div class="flex items-center gap-2.5">
                <div class="w-7 h-7 rounded-full bg-white flex items-center justify-center text-sm font-black text-[#06C755] shadow-xs">
                  💬
                </div>
                <div class="text-left">
                  <div class="font-extrabold">{{ isLineLoggingIn ? 'กำลังเชื่อมต่อ LINE...' : 'ล็อกอินด้วย LINE (LINE SSO)' }}</div>
                  <div class="text-[10px] text-white/80 font-normal">สำหรับลูกบ้านที่ผูกบัญชี LINE ไว้แล้ว</div>
                </div>
              </div>
              <span class="text-base font-extrabold">➔</span>
            </button>
          </div>

          <!-- Divider -->
          <div class="relative flex py-1 items-center">
            <div class="flex-grow border-t border-slate-800"></div>
            <span class="flex-shrink mx-3 text-[10px] text-slate-400 font-bold uppercase tracking-wider">หรือ เข้าสู่ระบบด้วยรหัสผ่าน</span>
            <div class="flex-grow border-t border-slate-800"></div>
          </div>

          <!-- SECTION 2: Local Password Login (Phone Number / Email + Password) -->
          <form @submit.prevent="handleLocalLogin" class="space-y-4">
            <div class="space-y-1.5">
              <label for="identifier" class="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center justify-between">
                <div class="flex items-center gap-1.5">
                  <User class="w-3.5 h-3.5 text-purple-400" />
                  <span>เบอร์โทรศัพท์ หรือ อีเมล</span>
                </div>
              </label>
              <Input
                id="identifier"
                v-model="identifier"
                type="text"
                placeholder="เช่น 0898765432 หรือ email@example.com"
                required
                data-testid="identifier-input"
                :disabled="authStore.loading"
                class="bg-slate-950/60 border-slate-800 text-white placeholder:text-slate-500 rounded-xl focus:ring-2 focus:ring-purple-500/30 focus:border-purple-500 h-11 transition-all text-xs"
              />
            </div>

            <div class="space-y-1.5">
              <label for="password" class="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                <Lock class="w-3.5 h-3.5 text-purple-400" />
                <span>รหัสผ่าน (Password)</span>
              </label>
              <Input
                id="password"
                v-model="password"
                type="password"
                placeholder="••••••••"
                required
                data-testid="password-input"
                :disabled="authStore.loading"
                class="bg-slate-950/60 border-slate-800 text-white placeholder:text-slate-500 rounded-xl focus:ring-2 focus:ring-purple-500/30 focus:border-purple-500 h-11 transition-all text-xs"
              />
            </div>

            <div v-if="errorMessage" data-testid="error-message" class="p-3.5 text-xs text-rose-300 bg-rose-950/50 border border-rose-800/60 rounded-xl text-center font-medium shadow-sm flex items-center justify-center gap-2">
              <AlertCircle class="w-4 h-4 text-rose-400 shrink-0" />
              <span>{{ errorMessage }}</span>
            </div>

            <!-- Quick Demo Credential Autofill Helper -->
            <div class="pt-1 flex items-center justify-between gap-2">
              <span class="text-[11px] text-slate-400">กรอกข้อมูลทดสอบ:</span>
              <button
                type="button"
                @click="fillDemoAccount"
                class="text-[11px] font-bold text-purple-400 hover:text-purple-300 underline underline-offset-2 transition-colors cursor-pointer"
              >
                ⚡ แอดมิน Demo
              </button>
            </div>

            <Button
              type="submit"
              data-testid="login-button"
              class="w-full bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold rounded-xl shadow-lg shadow-purple-600/30 h-11 transition-all duration-200 cursor-pointer active:scale-[0.99]"
              :disabled="authStore.loading"
            >
              <span v-if="authStore.loading" class="flex items-center justify-center gap-2">
                <Loader2 class="w-4 h-4 animate-spin" />
                กำลังตรวจสอบสิทธิ์...
              </span>
              <span v-else class="flex items-center justify-center gap-2">
                <LogIn class="w-4 h-4" />
                <span>เข้าสู่ระบบ (Sign In)</span>
              </span>
            </Button>
          </form>
        </CardContent>

        <CardFooter class="px-6 sm:px-8 pb-8 pt-2">
          <div class="w-full p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800/80 text-[11px] space-y-2">
            <div class="flex items-center gap-1.5 text-purple-300 font-bold">
              <ShieldCheck class="w-4 h-4 text-purple-400 shrink-0" />
              <span>Hybrid Authentication Security</span>
            </div>
            <div class="text-slate-400 leading-relaxed">
              รองรับทั้ง LINE Single Sign-On (SSO) สำหรับลูกบ้าน และรหัสผ่านที่เข้ารหัสด้วย Bcrypt สำหรับการเข้าใช้งานผ่านเบราว์เซอร์
            </div>
          </div>
        </CardFooter>
      </Card>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useAuthStore } from '@/stores/auth';
import { useRouter, useRoute } from 'vue-router';
import { initLiff, isLiffLoggedIn, loginLiff, getLiffIdToken } from '@/utils/liff';
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
import {
  Building2,
  User,
  Lock,
  LogIn,
  Loader2,
  AlertCircle,
  ShieldCheck
} from 'lucide-vue-next';

const authStore = useAuthStore();
const router = useRouter();
const route = useRoute();

const identifier = ref('developer@example.com');
const password = ref('password123');
const errorMessage = ref('');
const isLineLoggingIn = ref(false);

onMounted(async () => {
  try {
    await initLiff();
  } catch (err) {
    console.warn('LIFF init on login view:', err);
  }
});

const fillDemoAccount = () => {
  identifier.value = 'developer@example.com';
  password.value = 'password123';
};

const handleLineSSO = async () => {
  errorMessage.value = '';
  isLineLoggingIn.value = true;
  try {
    await initLiff();

    if (isLiffLoggedIn()) {
      const idToken = getLiffIdToken();
      if (idToken) {
        const res = await authStore.loginLine(idToken);
        if (res.user?.role === 'tenant') {
          router.push('/liff/profile');
        } else {
          router.push('/dashboard');
        }
        return;
      }
    }

    // หากยังไม่ได้ล็อกอิน LINE ให้เรียก loginLiff()
    const redirectUri = window.location.origin + (route.query.redirect || '/liff/profile');
    await loginLiff(redirectUri);
  } catch (error) {
    console.error('LINE SSO Error:', error);
    errorMessage.value = error.response?.data?.message || 'ไม่สามารถเข้าสู่ระบบด้วย LINE ได้';
  } finally {
    isLineLoggingIn.value = false;
  }
};

const handleLocalLogin = async () => {
  errorMessage.value = '';
  try {
    const rawInput = identifier.value.trim();
    const isEmail = rawInput.includes('@');

    let res;
    if (isEmail) {
      res = await authStore.login(rawInput, password.value);
    } else {
      res = await authStore.loginLocal(rawInput, password.value);
    }

    const redirectPath = route.query.redirect || (res.user?.role === 'tenant' ? '/liff/profile' : '/dashboard');
    router.push(redirectPath);
  } catch (error) {
    errorMessage.value =
      error.response?.data?.message || 'เข้าสู่ระบบไม่สำเร็จ โปรดตรวจสอบข้อมูลและรหัสผ่าน';
  }
};
</script>
