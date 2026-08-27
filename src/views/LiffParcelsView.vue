<template>
  <div class="min-h-screen bg-slate-100 py-6 px-4 font-sans text-slate-900">
    <div class="max-w-md mx-auto space-y-5">
      <!-- Feature Disabled State -->
      <div v-if="!isParcelFeatureEnabled" class="p-8 bg-white rounded-3xl border border-slate-200 shadow-sm text-center space-y-3">
        <div class="w-16 h-16 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center text-2xl mx-auto font-bold">
          🚫
        </div>
        <h2 class="text-base font-bold text-slate-900">ฟีเจอร์พัสดุไม่พร้อมใช้งาน</h2>
        <p class="text-xs text-slate-500">ขออภัย ฟีเจอร์แจ้งเตือนพัสดุถูกปิดการใช้งานโดยแอดมินหอพักในขณะนี้</p>
      </div>

      <!-- Feature Enabled View -->
      <template v-else>
        <!-- Header -->
        <div class="flex items-center justify-between">
          <div>
            <h1 class="text-xl font-bold text-slate-900 tracking-tight">📦 พัสดุของฉัน (My Parcels)</h1>
            <p class="text-xs text-slate-500">ตรวจสอบรายการพัสดุและยื่น QR Code เพื่อรับของ</p>
          </div>

          <button @click="fetchParcels" class="text-xs text-orange-600 font-semibold hover:underline cursor-pointer">
            🔄 รีเฟรช
          </button>
        </div>

        <!-- Tenant Pickup QR Code Verification Card -->
        <div class="bg-gradient-to-r from-orange-600 to-amber-600 p-5 rounded-3xl text-white shadow-lg space-y-3 relative overflow-hidden">
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-2">
              <span class="text-lg">🪪</span>
              <span class="font-bold text-xs uppercase tracking-wider">Pickup Verification QR</span>
            </div>
            <span class="text-[10px] bg-white/20 px-2.5 py-0.5 rounded-full font-semibold">ห้อง {{ tenantRoomNumber || 'N/A' }}</span>
          </div>

          <div class="bg-white p-3.5 rounded-2xl flex items-center justify-between text-slate-900">
            <div>
              <div class="text-[11px] font-bold text-slate-400 uppercase">ยื่น QR Code นี้ให้นิติฯ ตอนรับของ</div>
              <div class="text-sm font-black text-slate-900 mt-0.5">{{ tenantName || 'ผู้เช่าห้องพัก' }}</div>
              <div class="text-xs text-orange-600 font-bold mt-0.5">รอรับพัสดุ {{ pendingParcels.length }} รายการ</div>
            </div>

            <!-- Profile / Room QR Code Placeholder -->
            <div class="w-16 h-16 bg-slate-900 text-white rounded-xl flex items-center justify-center p-1 font-mono text-[10px] text-center font-bold shrink-0">
              <div class="text-2xl">📱</div>
            </div>
          </div>
        </div>

        <!-- Loading State -->
        <div v-if="loading" class="p-8 bg-white rounded-3xl shadow-sm text-center text-slate-500">
          <div class="animate-spin w-8 h-8 border-4 border-orange-600 border-t-transparent rounded-full mx-auto mb-3"></div>
          <p class="text-xs font-semibold">กำลังโหลดรายการพัสดุ...</p>
        </div>

        <!-- Parcels Card List -->
        <div v-else class="space-y-3">
          <div
            v-for="item in parcels"
            :key="item.id"
            class="bg-white rounded-3xl border border-slate-200 shadow-sm p-4 space-y-3 relative overflow-hidden transition-all"
            :class="{ 'border-l-4 border-l-amber-500': item.status === 'PENDING', 'opacity-80': item.status === 'PICKED_UP' }"
          >
            <div class="flex items-start justify-between gap-2">
              <div class="flex items-center gap-2">
                <span class="w-9 h-9 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center font-bold text-base">
                  🚚
                </span>
                <div>
                  <div class="font-bold text-slate-900 text-sm leading-tight">{{ item.courier }}</div>
                  <div class="text-xs font-mono text-indigo-700 font-semibold">{{ item.trackingNumber || 'ไม่ระบุเลขแทรคกิ้ง' }}</div>
                </div>
              </div>

              <!-- Status Badge -->
              <span
                class="text-[10px] font-extrabold px-2.5 py-1 rounded-full border shadow-2xs inline-flex items-center gap-1 shrink-0"
                :class="{
                  'bg-amber-100 border-amber-300 text-amber-800': item.status === 'PENDING',
                  'bg-slate-100 border-slate-300 text-slate-600': item.status === 'PICKED_UP'
                }"
              >
                <span>{{ item.status === 'PENDING' ? '🟠' : '⚪' }}</span>
                <span>{{ item.status === 'PENDING' ? 'รอรับที่นิติฯ' : 'รับแล้ว' }}</span>
              </span>
            </div>

            <!-- Parcel Box Image -->
            <div v-if="item.photoUrl" class="w-full h-36 rounded-2xl overflow-hidden bg-slate-100 border border-slate-200">
              <a :href="item.photoUrl" target="_blank">
                <img :src="item.photoUrl" class="w-full h-full object-cover" />
              </a>
            </div>

            <!-- Timestamps -->
            <div class="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500 font-medium">
              <span>📥 รับเข้า: {{ formatDate(item.receivedAt) }}</span>
              <span v-if="item.pickedUpAt" class="text-emerald-700 font-semibold">✅ รับไปแล้ว: {{ formatDate(item.pickedUpAt) }}</span>
            </div>
          </div>

          <div v-if="parcels.length === 0" class="p-10 bg-white rounded-3xl text-center text-slate-400 text-xs space-y-1">
            <div class="text-2xl">📭</div>
            <div>ไม่มีรายการพัสดุในขณะนี้</div>
          </div>
        </div>
      </template>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import liff from '@line/liff';
import { useFeatureStore } from '@/stores/useFeatureStore';
import api from '@/utils/api';

const featureStore = useFeatureStore();
const loading = ref(true);
const parcels = ref([]);
const lineUserId = ref('');
const tenantName = ref('');
const tenantRoomNumber = ref('');

const isParcelFeatureEnabled = computed(() => {
  return featureStore.isEnabled('ENABLE_PARCEL_NOTIFY');
});

const pendingParcels = computed(() => parcels.value.filter((p) => p.status === 'PENDING'));

onMounted(async () => {
  if (featureStore.features.length === 0) {
    await featureStore.fetchFeatures();
  }

  const liffId = import.meta.env.VITE_LINE_LIFF_ID || '2000000000-mockliffid';
  try {
    await liff.init({ liffId });
    if (liff.isLoggedIn()) {
      const profile = await liff.getProfile();
      lineUserId.value = profile.userId;
      tenantName.value = profile.displayName;
    }
  } catch (err) {
    console.warn('LIFF init fallback mode:', err.message);
  }

  fetchParcels();
});

const fetchParcels = async () => {
  loading.value = true;
  try {
    const params = {};
    if (lineUserId.value) params.lineUserId = lineUserId.value;

    const res = await api.get('/api/v1/liff/parcels', { params });
    parcels.value = res.data.data;
    if (parcels.value.length > 0) {
      tenantRoomNumber.value = parcels.value[0].room?.roomNumber || '';
    }
  } catch (error) {
    console.error('Failed to fetch LIFF parcels:', error);
  } finally {
    loading.value = false;
  }
};

const formatDate = (dateStr) => {
  if (!dateStr) return '-';
  return new Date(dateStr).toLocaleString('th-TH');
};
</script>
