<template>
  <div class="space-y-4">
    <!-- Card แสดงข้อมูล LINE Profile ของผู้เช่า -->
    <div class="bg-white rounded-2xl p-5 shadow-sm border border-slate-200 text-center space-y-3">
      <div v-if="liffStore.isLoggedIn" class="space-y-3">
        <img
          :src="liffStore.pictureUrl || 'https://via.placeholder.com/100'"
          alt="LINE Profile"
          class="w-20 h-20 rounded-full mx-auto shadow-md ring-4 ring-[#06C755]/20 object-cover"
        />
        <div>
          <h3 class="font-bold text-lg text-slate-900">{{ liffStore.displayName }}</h3>
          <p class="text-xs text-slate-500 font-mono mt-0.5">LINE ID: {{ liffStore.lineUserId }}</p>
        </div>
        <div class="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-600 rounded-full text-xs font-semibold">
          <span>✓ LINE Verified Tenant</span>
        </div>
      </div>

      <!-- Loading State ขณะรอนิชิเอต LIFF -->
      <div v-else-if="loading" class="py-8 space-y-2">
        <div class="animate-spin w-8 h-8 border-4 border-[#06C755] border-t-transparent rounded-full mx-auto"></div>
        <p class="text-xs text-slate-500 font-medium">กำลังเชื่อมต่อ LINE LIFF SDK...</p>
      </div>

      <!-- Demo / Mock State กรณีทดสอบนอกแอป LINE -->
      <div v-else class="py-4 space-y-3">
        <p class="text-xs text-slate-500">
          {{ liffStore.liffError || 'เปิดอยู่นอกแอป LINE (Mock Data สำหรับการทดสอบ)' }}
        </p>
        <button
          @click="simulateMockLogin"
          class="w-full py-2 bg-[#06C755] hover:bg-[#05b34c] text-white font-bold text-xs rounded-xl shadow-md transition-colors"
        >
          จำลองการล็อกอินผ่าน LINE
        </button>
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
    // 1. เรียกใช้ liff.init() เมื่อ Component ถือกำเนิด
    // ใส่ LIFF ID ที่รับได้จาก LINE Developers Console (ตัวอย่าง: MY_LIFF_ID)
    const liffId = import.meta.env.VITE_LINE_LIFF_ID || '1234567890-XXXXXXXX';
    
    await liff.init({ liffId });
    liffStore.setInitialized(true);

    // 2. หากผู้ใช้อยู่ในแอป LINE และล็อกอินอยู่ ให้ดึงข้อมูล Profile
    if (liff.isLoggedIn()) {
      const profile = await liff.getProfile();
      liffStore.setLineProfile(profile);
    } else {
      // หากยังไม่ได้ล็อกอิน ให้สั่งเปิดหน้า Login ของ LINE (กรณีเปิดผ่าน External Browser)
      if (liff.isInClient()) {
        liff.login();
      }
    }
  } catch (error) {
    console.warn('LIFF Initialization Error:', error);
    liffStore.setError(error.message || 'ไม่สามารถเปิดผ่าน LIFF SDK ได้');
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
