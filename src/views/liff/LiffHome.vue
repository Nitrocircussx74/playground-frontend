<template>
  <div class="space-y-4">
    <!-- Dev Banner กรณีเปิดผ่าน Browser ทั่วไปแบบยังไม่ได้ต่อ LIFF ID จริง -->
    <div v-if="!liffStore.isLoggedIn" class="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs space-y-2">
      <div class="flex items-center justify-between text-amber-800 font-bold">
        <span>⚡ Mock Mode (สำหรับทดสอบนอกแอป LINE)</span>
      </div>
      <p class="text-amber-700 leading-relaxed">
        ขณะนี้เปิดผ่านเว็บเบราว์เซอร์ทั่วไป คุณสามารถกดปุ่มจำลองล็อกอินเพื่อทดสอบ UI และ Flow การทำงานของผู้เช่าได้ทันที
      </p>
      <button
        @click="simulateMockLogin"
        class="w-full py-2 bg-[#06C755] hover:bg-[#05b34c] text-white font-bold text-xs rounded-lg shadow-sm transition-all"
      >
        🟢 โหลดข้อมูลผู้เช่าจำลอง (Somchai ห้อง 101)
      </button>
    </div>

    <!-- Card แสดงข้อมูล LINE Profile ของผู้เช่า -->
    <div class="bg-white rounded-2xl p-5 shadow-sm border border-slate-200 text-center space-y-3">
      <div v-if="liffStore.isLoggedIn" class="space-y-3">
        <img
          :src="liffStore.pictureUrl || 'https://api.dicebear.com/7.x/avataaars/svg?seed=Somchai'"
          alt="LINE Profile"
          class="w-20 h-20 rounded-full mx-auto shadow-md ring-4 ring-[#06C755]/20 object-cover"
        />
        <div>
          <h3 class="font-bold text-lg text-slate-900">{{ liffStore.displayName }}</h3>
          <p class="text-xs text-slate-500 font-mono mt-0.5">LINE ID: {{ liffStore.lineUserId }}</p>
        </div>
        <div class="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-600 rounded-full text-xs font-semibold">
          <span>✓ LINE Verified Tenant (ห้อง 101)</span>
        </div>
      </div>

      <!-- Loading State ขณะรอนิชิเอต LIFF -->
      <div v-else-if="loading" class="py-6 space-y-2">
        <div class="animate-spin w-8 h-8 border-4 border-[#06C755] border-t-transparent rounded-full mx-auto"></div>
        <p class="text-xs text-slate-500 font-medium">กำลังตรวจสอบการเชื่อมต่อ LINE LIFF SDK...</p>
      </div>

      <!-- State ยังไม่ได้กดจำลอง -->
      <div v-else class="py-2 text-xs text-slate-400">
        รอการเชื่อมต่อกับ LINE Profile...
      </div>
    </div>

    <!-- Quick Services Menu -->
    <div class="grid grid-cols-2 gap-3">
      <router-link to="/liff/bills" class="p-4 bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col items-center gap-2 hover:border-[#06C755] transition-colors">
        <span class="text-2xl">🧾</span>
        <span class="text-xs font-bold text-slate-800">เช็กบิลค่าเช่า</span>
      </router-link>

      <div class="p-4 bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col items-center gap-2 hover:border-[#06C755] transition-colors cursor-pointer">
        <span class="text-2xl">🛠️</span>
        <span class="text-xs font-bold text-slate-800">แจ้งซ่อมอุปกรณ์</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import liff from '@line/liff';
import { useLiffAuthStore } from '@/stores/liffAuth';

const liffStore = useLiffAuthStore();
const loading = ref(true);

onMounted(async () => {
  try {
    const liffId = import.meta.env.VITE_LINE_LIFF_ID;
    
    // หากมี LIFF ID จริงใน .env ค่อยเรียก liff.init()
    if (liffId && liffId !== 'MY_LIFF_ID') {
      await liff.init({ liffId });
      liffStore.setInitialized(true);

      if (liff.isLoggedIn()) {
        const profile = await liff.getProfile();
        liffStore.setLineProfile(profile);
      } else if (liff.isInClient()) {
        liff.login();
      }
    } else {
      // หากยังไม่มี LIFF ID ในโหมดพัฒนา ให้ใช้อัตโนมัติในโหมด Mock
      simulateMockLogin();
    }
  } catch (error) {
    console.warn('LIFF Initialization Error (Using Mock Fallback):', error);
    simulateMockLogin();
  } finally {
    loading.value = false;
  }
});

const simulateMockLogin = () => {
  liffStore.setLineProfile({
    userId: 'U1234567890abcdef1234567890abcdef',
    displayName: 'ผู้เช่าห้อง 101 (Somchai)',
    pictureUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Somchai',
    statusMessage: 'ผู้เช่าหอพักระบบ LINE'
  });
};
</script>
