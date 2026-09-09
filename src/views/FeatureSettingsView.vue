<template>
  <div class="space-y-6 max-w-6xl mx-auto font-sans">
    <!-- Top Header Banner -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs">
      <div class="space-y-1">
        <h1 class="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2.5">
          <div class="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center shadow-xs">
            <ToggleLeft class="w-5 h-5" />
          </div>
          <span>ตั้งค่าฟีเจอร์ของระบบ (Feature Flags & Toggles)</span>
        </h1>
        <p class="text-xs sm:text-sm text-slate-500">
          เปิด-ปิดสวิตช์ฟีเจอร์ของระบบ LINE LIFF และ Backoffice แยกตามอาคารได้แบบเรียลไทม์
        </p>
      </div>

      <div class="flex items-center gap-2">
        <button
          @click="loadData"
          class="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs"
        >
          <RotateCw class="w-3.5 h-3.5" :class="{ 'animate-spin': featureStore.isLoading }" />
          <span>รีเฟรชข้อมูล</span>
        </button>
      </div>
    </div>

    <!-- Building Selector & Search Filter Bar -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
      <!-- Building Selection -->
      <div class="md:col-span-2 bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div class="flex items-center gap-2 text-xs font-bold text-slate-700">
          <Building2 class="w-4 h-4 text-indigo-600" />
          <span>เลือกอาคารที่ต้องการตั้งค่า:</span>
        </div>
        <select
          v-model="buildingStore.activeBuildingId"
          class="bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-800 font-medium focus:outline-hidden focus:border-indigo-400 cursor-pointer"
        >
          <option :value="null">🌐 ค่าเริ่มต้นทุกอาคาร (Global Default)</option>
          <option v-for="b in buildingStore.buildings" :key="b.id" :value="b.id">
            🏢 {{ b.name }}
          </option>
        </select>
      </div>

      <!-- Search Input -->
      <div class="relative bg-white rounded-2xl border border-slate-200/80 shadow-xs flex items-center px-3.5 py-2">
        <Search class="w-4 h-4 text-slate-400 shrink-0 mr-2" />
        <input
          v-model="searchQuery"
          type="text"
          placeholder="ค้นหาชื่อหรือคีย์ฟีเจอร์..."
          class="w-full text-xs text-slate-800 placeholder:text-slate-400 bg-transparent focus:outline-hidden"
        />
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="featureStore.isLoading" class="p-12 text-center text-slate-500 bg-white rounded-3xl border border-slate-200/80 shadow-xs space-y-3">
      <div class="animate-spin w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full mx-auto"></div>
      <div class="text-xs font-medium">กำลังโหลดสถานะ Feature Flags...</div>
    </div>

    <!-- Error State -->
    <div v-else-if="featureStore.errorMessage" class="p-4 bg-rose-50 border border-rose-200 text-rose-700 rounded-2xl text-xs font-medium flex items-center gap-2">
      <AlertCircle class="w-4 h-4 shrink-0" />
      <span>{{ featureStore.errorMessage }}</span>
    </div>

    <!-- Features Grouped By Category -->
    <div v-else class="space-y-6">
      <!-- Group 1: LINE LIFF Tenant Features -->
      <div class="space-y-3">
        <div class="flex items-center justify-between px-1">
          <div class="flex items-center gap-2">
            <div class="w-6 h-6 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Smartphone class="w-3.5 h-3.5" />
            </div>
            <h2 class="text-sm font-bold text-slate-800">
              ฟีเจอร์สำหรับผู้เช่าผ่าน LINE LIFF (Tenant Portal)
            </h2>
          </div>
          <span class="text-xs text-slate-400 font-mono">{{ liffFeatures.length }} ฟีเจอร์</span>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div
            v-for="item in liffFeatures"
            :key="item.key"
            class="p-5 bg-white border border-slate-200/80 rounded-3xl shadow-xs hover:shadow-md transition-all space-y-3 relative overflow-hidden"
          >
            <div class="flex items-start justify-between gap-4">
              <div class="flex items-start gap-3 min-w-0">
                <div
                  class="w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 shadow-2xs"
                  :class="getFeatureIconBg(item.key)"
                >
                  <component :is="getFeatureIcon(item.key)" class="w-5 h-5" />
                </div>
                <div class="space-y-1 min-w-0">
                  <div class="flex items-center gap-2 flex-wrap">
                    <span class="font-bold text-slate-900 text-xs sm:text-sm truncate">{{ getFeatureTitle(item.key) }}</span>
                    <span
                      class="text-[9px] font-extrabold px-2 py-0.5 rounded-full uppercase"
                      :class="item.isActive ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-500'"
                    >
                      {{ item.isActive ? 'เปิดใช้งาน' : 'ปิดใช้งาน' }}
                    </span>
                  </div>
                  <div class="font-mono text-[10px] text-indigo-600 bg-indigo-50/70 px-1.5 py-0.5 rounded-md inline-block">
                    {{ item.key }}
                  </div>
                  <p class="text-xs text-slate-500 leading-relaxed pt-0.5">{{ item.description }}</p>
                </div>
              </div>

              <!-- Switch Component (Toggle) -->
              <button
                @click="handleToggle(item.key, !item.isActive)"
                type="button"
                class="relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 shadow-2xs mt-1"
                :class="item.isActive ? 'bg-emerald-500' : 'bg-slate-200'"
              >
                <span
                  class="pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out"
                  :class="item.isActive ? 'translate-x-5' : 'translate-x-0'"
                ></span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Group 2: Other Features (if any) -->
      <div v-if="otherFeatures.length > 0" class="space-y-3">
        <div class="flex items-center justify-between px-1">
          <div class="flex items-center gap-2">
            <div class="w-6 h-6 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <ShieldCheck class="w-3.5 h-3.5" />
            </div>
            <h2 class="text-sm font-bold text-slate-800">
              ฟีเจอร์อื่นๆ ของระบบ (Other System Features)
            </h2>
          </div>
          <span class="text-xs text-slate-400 font-mono">{{ otherFeatures.length }} ฟีเจอร์</span>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div
            v-for="item in otherFeatures"
            :key="item.key"
            class="p-5 bg-white border border-slate-200/80 rounded-3xl shadow-xs hover:shadow-md transition-all space-y-3"
          >
            <div class="flex items-start justify-between gap-4">
              <div class="flex items-start gap-3 min-w-0">
                <div class="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
                  <component :is="getFeatureIcon(item.key)" class="w-5 h-5" />
                </div>
                <div class="space-y-1 min-w-0">
                  <div class="flex items-center gap-2 flex-wrap">
                    <span class="font-bold text-slate-900 text-xs sm:text-sm truncate">{{ getFeatureTitle(item.key) }}</span>
                    <span
                      class="text-[9px] font-extrabold px-2 py-0.5 rounded-full uppercase"
                      :class="item.isActive ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-500'"
                    >
                      {{ item.isActive ? 'เปิดใช้งาน' : 'ปิดใช้งาน' }}
                    </span>
                  </div>
                  <div class="font-mono text-[10px] text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded-md inline-block">
                    {{ item.key }}
                  </div>
                  <p class="text-xs text-slate-500 leading-relaxed pt-0.5">{{ item.description }}</p>
                </div>
              </div>

              <!-- Switch Component (Toggle) -->
              <button
                @click="handleToggle(item.key, !item.isActive)"
                type="button"
                class="relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 shadow-2xs mt-1"
                :class="item.isActive ? 'bg-emerald-500' : 'bg-slate-200'"
              >
                <span
                  class="pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out"
                  :class="item.isActive ? 'translate-x-5' : 'translate-x-0'"
                ></span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import { useFeatureStore } from '@/stores/useFeatureStore';
import { useBuildingStore } from '@/stores/useBuildingStore';
import { showError, showToast } from '@/utils/swal';
import {
  ToggleLeft,
  RotateCw,
  Building2,
  Search,
  AlertCircle,
  Smartphone,
  ShieldCheck,
  Wrench,
  CreditCard,
  Package,
  Megaphone,
  Car,
  QrCode,
  ReceiptText,
  HelpCircle
} from 'lucide-vue-next';

const featureStore = useFeatureStore();
const buildingStore = useBuildingStore();
const searchQuery = ref('');

const loadData = () => {
  featureStore.fetchFeatures(buildingStore.activeBuildingId);
};

onMounted(async () => {
  await buildingStore.fetchBuildings();
  loadData();
});

watch(
  () => buildingStore.activeBuildingId,
  () => {
    loadData();
  }
);

const featureTitles = {
  ENABLE_MAINTENANCE_REQUEST: 'ระบบแจ้งซ่อมและร้องเรียน (Issues & Maintenance)',
  ENABLE_LINE_PAYMENT: 'ระบบบิลค่าเช่า & ชำระเงินออนไลน์ (LIFF Invoices & Payment)',
  ENABLE_PARCEL_NOTIFY: 'ระบบพัสดุและแจ้งเตือนพัสดุมาถึง (My Parcels)',
  ENABLE_ANNOUNCEMENTS: 'ระบบข่าวสารและประกาศหอพัก (Announcements & News)',
  ENABLE_DIGITAL_ID: 'บัตรประจำตัวผู้เช่าดิจิทัล (Digital Tenant ID QR Code)',
  ENABLE_RECEIPT_HISTORY: 'ดูประวัติใบเสร็จรับเงินอิเล็กทรอนิกส์ (E-Receipt History)',
  ENABLE_VEHICLE_MANAGEMENT: 'จัดการยานพาหนะและทะเบียนรถลูกบ้าน (Vehicle Management)'
};

const getFeatureTitle = (key) => {
  return featureTitles[key] || key;
};

const getFeatureIcon = (key) => {
  switch (key) {
    case 'ENABLE_MAINTENANCE_REQUEST':
      return Wrench;
    case 'ENABLE_LINE_PAYMENT':
      return CreditCard;
    case 'ENABLE_PARCEL_NOTIFY':
      return Package;
    case 'ENABLE_ANNOUNCEMENTS':
      return Megaphone;
    case 'ENABLE_DIGITAL_ID':
      return QrCode;
    case 'ENABLE_RECEIPT_HISTORY':
      return ReceiptText;
    case 'ENABLE_VEHICLE_MANAGEMENT':
      return Car;
    default:
      return HelpCircle;
  }
};

const getFeatureIconBg = (key) => {
  switch (key) {
    case 'ENABLE_MAINTENANCE_REQUEST':
      return 'bg-amber-50 text-amber-600';
    case 'ENABLE_LINE_PAYMENT':
      return 'bg-indigo-50 text-indigo-600';
    case 'ENABLE_PARCEL_NOTIFY':
      return 'bg-orange-50 text-orange-600';
    case 'ENABLE_ANNOUNCEMENTS':
      return 'bg-sky-50 text-sky-600';
    case 'ENABLE_DIGITAL_ID':
      return 'bg-emerald-50 text-emerald-600';
    case 'ENABLE_RECEIPT_HISTORY':
      return 'bg-teal-50 text-teal-600';
    case 'ENABLE_VEHICLE_MANAGEMENT':
      return 'bg-purple-50 text-purple-600';
    default:
      return 'bg-slate-50 text-slate-600';
  }
};

const filteredFeatures = computed(() => {
  if (!searchQuery.value.trim()) return featureStore.features;
  const q = searchQuery.value.toLowerCase().trim();
  return featureStore.features.filter(
    (f) =>
      f.key.toLowerCase().includes(q) ||
      (f.description && f.description.toLowerCase().includes(q)) ||
      (featureTitles[f.key] && featureTitles[f.key].toLowerCase().includes(q))
  );
});

const liffKeys = [
  'ENABLE_MAINTENANCE_REQUEST',
  'ENABLE_LINE_PAYMENT',
  'ENABLE_PARCEL_NOTIFY',
  'ENABLE_ANNOUNCEMENTS',
  'ENABLE_DIGITAL_ID',
  'ENABLE_RECEIPT_HISTORY',
  'ENABLE_VEHICLE_MANAGEMENT'
];

const liffFeatures = computed(() => {
  return filteredFeatures.value.filter((f) => liffKeys.includes(f.key));
});

const otherFeatures = computed(() => {
  return filteredFeatures.value.filter((f) => !liffKeys.includes(f.key));
});

const handleToggle = async (key, newValue) => {
  try {
    await featureStore.toggleFeature(key, newValue, buildingStore.activeBuildingId);
    showToast(`อัปเดตสถานะฟีเจอร์ ${getFeatureTitle(key)} เรียบร้อยแล้ว`);
  } catch (error) {
    showError('เกิดข้อผิดพลาด', error.response?.data?.message || 'Failed to toggle feature');
  }
};
</script>
