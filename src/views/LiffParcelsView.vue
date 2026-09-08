<template>
  <div class="space-y-5 pb-6 font-sans text-slate-800">
    <!-- Feature Disabled State -->
    <div v-if="!isParcelFeatureEnabled" class="p-8 bg-white rounded-2xl border border-slate-100/80 shadow-xs text-center space-y-3">
      <div class="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto">
        <Package class="w-6 h-6" />
      </div>
      <h2 class="text-sm font-bold text-slate-800">ฟีเจอร์พัสดุไม่พร้อมใช้งาน</h2>
      <p class="text-xs text-slate-500">ขออภัย ฟีเจอร์แจ้งเตือนพัสดุถูกปิดการใช้งานชั่วคราว</p>
    </div>

    <!-- Feature Enabled View -->
    <template v-else>
      <!-- Header -->
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-lg font-bold text-slate-900 tracking-tight">พัสดุของฉัน</h1>
          <p class="text-xs text-slate-500 mt-0.5">ตรวจสอบรายการพัสดุและรหัสรับของ</p>
        </div>

        <button
          @click="fetchParcels"
          class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-orange-50/80 hover:bg-orange-100 text-xs font-semibold text-orange-700 transition-colors"
        >
          <RotateCw class="w-3.5 h-3.5" :class="{ 'animate-spin': loading }" />
          <span>รีเฟรช</span>
        </button>
      </div>

      <!-- Tenant Pickup QR Code Verification Card -->
      <div class="bg-gradient-to-br from-amber-500 to-orange-500 p-4 sm:p-5 rounded-2xl text-white shadow-xs space-y-3 relative overflow-hidden">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-2">
            <QrCode class="w-4 h-4 text-amber-100" />
            <span class="font-semibold text-xs tracking-wide text-amber-50">QR Code สำหรับรับพัสดุ</span>
          </div>
          <span class="text-[11px] bg-white/20 px-2.5 py-0.5 rounded-full font-medium">ห้อง {{ tenantRoomNumber || 'N/A' }}</span>
        </div>

        <div class="bg-white p-3.5 rounded-xl flex items-center justify-between text-slate-800 shadow-xs">
          <div>
            <div class="text-[10px] font-semibold text-slate-400">แสดง QR Code นี้ให้นิติบุคคล</div>
            <div class="text-sm font-bold text-slate-900 mt-0.5">{{ tenantName || 'ผู้เช่าห้องพัก' }}</div>
            <div class="text-xs text-orange-600 font-semibold mt-1">
              รอรับพัสดุ {{ pendingParcels.length }} รายการ
            </div>
          </div>

          <!-- Profile / Room QR Code -->
          <div class="w-16 h-16 bg-slate-50 rounded-xl border border-slate-100 p-1 shrink-0 flex items-center justify-center">
            <img v-if="pickupQrUrl" :src="pickupQrUrl" alt="Pickup QR" class="w-full h-full object-contain rounded-lg" />
            <QrCode v-else class="w-8 h-8 text-slate-300" />
          </div>
        </div>
      </div>

      <!-- Loading State -->
      <div v-if="loading" class="p-8 bg-white rounded-2xl border border-slate-100/80 shadow-xs text-center text-slate-400 text-xs">
        <div class="animate-spin w-6 h-6 border-2 border-orange-400 border-t-transparent rounded-full mx-auto mb-2.5"></div>
        <p class="text-xs">กำลังโหลดรายการพัสดุ...</p>
      </div>

      <!-- Parcels Card List -->
      <div v-else class="space-y-3">
        <div
          v-for="item in parcels"
          :key="item.id"
          class="bg-white rounded-2xl border border-slate-100/90 shadow-xs p-4 space-y-3 transition-all hover:border-slate-200"
          :class="{ 'border-l-4 border-l-amber-400': item.status === 'PENDING' }"
        >
          <div class="flex items-start justify-between gap-2">
            <div class="flex items-center gap-3">
              <div class="w-9 h-9 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center shrink-0">
                <Truck class="w-4 h-4" />
              </div>
              <div>
                <div class="flex items-center gap-1.5">
                  <span class="font-bold text-slate-800 text-sm leading-tight">{{ item.courier }}</span>
                  <span v-if="item.room?.roomNumber" class="px-2 py-0.5 bg-slate-100 text-slate-600 font-medium text-[10px] rounded-full">
                    ห้อง {{ item.room.roomNumber }}
                  </span>
                </div>
                <div class="text-xs font-mono text-slate-500 font-medium mt-0.5">{{ item.trackingNumber || 'ไม่ระบุเลขแทรคกิ้ง' }}</div>
              </div>
            </div>

            <!-- Status Badge -->
            <span
              class="text-[11px] font-semibold px-2.5 py-1 rounded-full border inline-flex items-center gap-1 shrink-0"
              :class="{
                'bg-amber-50 border-amber-200/70 text-amber-700': item.status === 'PENDING',
                'bg-emerald-50 border-emerald-200/70 text-emerald-700': item.status === 'PICKED_UP'
              }"
            >
              <Clock v-if="item.status === 'PENDING'" class="w-3 h-3" />
              <CheckCircle2 v-else class="w-3 h-3" />
              <span>{{ item.status === 'PENDING' ? 'รอรับที่นิติฯ' : 'รับแล้ว' }}</span>
            </span>
          </div>

          <!-- Parcel Box Image -->
          <div v-if="item.photoUrl" class="w-full h-32 rounded-xl overflow-hidden bg-slate-50 border border-slate-100">
            <a :href="item.photoUrl" target="_blank" class="inline-block w-full h-full">
              <img :src="item.photoUrl" class="w-full h-full object-cover" />
            </a>
          </div>

          <!-- Timestamps -->
          <div class="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400 font-medium">
            <span>รับเข้า: {{ formatDate(item.receivedAt) }}</span>
            <span v-if="item.pickedUpAt" class="text-emerald-700 font-medium">รับแล้ว: {{ formatDate(item.pickedUpAt) }}</span>
          </div>
        </div>

        <!-- Empty State -->
        <div v-if="parcels.length === 0" class="p-10 bg-white rounded-2xl border border-slate-100/80 text-center space-y-2 shadow-xs">
          <div class="w-10 h-10 rounded-2xl bg-slate-50 text-slate-400 flex items-center justify-center mx-auto">
            <Inbox class="w-5 h-5" />
          </div>
          <p class="text-xs font-medium text-slate-500">ไม่มีรายการพัสดุในขณะนี้</p>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import {
  Package,
  RotateCw,
  QrCode,
  Truck,
  Clock,
  CheckCircle2,
  Inbox
} from 'lucide-vue-next';
import { initLiff, isLiffLoggedIn, getLiffProfile } from '@/utils/liff';
import QRCode from 'qrcode';
import { useFeatureStore } from '@/stores/useFeatureStore';
import api from '@/utils/api';

const featureStore = useFeatureStore();
const loading = ref(true);
const parcels = ref([]);
const lineUserId = ref('');
const tenantName = ref('');
const tenantRoomNumber = ref('');
const pickupQrUrl = ref('');

const isParcelFeatureEnabled = computed(() => {
  return featureStore.isEnabled('ENABLE_PARCEL_NOTIFY');
});

const pendingParcels = computed(() => parcels.value.filter((p) => p.status === 'PENDING'));

const generatePickupQr = async () => {
  const qrText = `PARCEL-PICKUP:${tenantName.value || 'TENANT'}:${tenantRoomNumber.value || 'ROOM'}:${Date.now()}`;
  try {
    pickupQrUrl.value = await QRCode.toDataURL(qrText, { margin: 1, width: 200 });
  } catch (err) {
    console.warn('Could not generate pickup QR:', err);
  }
};

onMounted(async () => {
  if (featureStore.features.length === 0) {
    await featureStore.fetchFeatures();
  }

  try {
    await initLiff();
    if (isLiffLoggedIn()) {
      const profile = await getLiffProfile();
      if (profile?.userId) {
        lineUserId.value = profile.userId;
        tenantName.value = profile.displayName;
      }
    }
  } catch (err) {
    console.warn('LIFF init fallback mode:', err.message);
  }

  await fetchParcels();
  await generatePickupQr();
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
  return new Date(dateStr).toLocaleString('th-TH', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
};
</script>
