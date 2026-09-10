<template>
  <div class="space-y-6 max-w-6xl mx-auto font-sans">
    <!-- Top Header Banner -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs">
      <div class="space-y-1">
        <h1 class="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2.5">
          <div class="w-10 h-10 rounded-2xl bg-teal-50 text-teal-600 flex items-center justify-center shadow-xs">
            <ToggleLeft class="w-5 h-5" />
          </div>
          <span>ตั้งค่าการเปิด-ปิดฟีเจอร์ (Feature Settings)</span>
        </h1>
        <p class="text-xs sm:text-sm text-slate-500">
          เปิดหรือปิดการทำงานของแต่ละเมนูใน LINE LIFF ของลูกบ้านแยกรายตึกได้ทันที
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
        <div class="flex items-center gap-2 text-xs font-bold text-slate-700 shrink-0">
          <Building2 class="w-4 h-4 text-teal-600" />
          <span>เลือกอาคารที่ต้องการตั้งค่า:</span>
        </div>
        <select
          v-model="buildingStore.activeBuildingId"
          class="bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-800 font-medium focus:outline-hidden focus:border-teal-400 cursor-pointer w-full sm:w-auto min-w-[240px]"
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
          placeholder="ค้นหาชื่อฟีเจอร์..."
          class="w-full text-xs text-slate-800 placeholder:text-slate-400 bg-transparent focus:outline-hidden"
        />
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="featureStore.isLoading" class="p-12 text-center text-slate-500 bg-white rounded-3xl border border-slate-200/80 shadow-xs space-y-3">
      <div class="animate-spin w-8 h-8 border-4 border-teal-600 border-t-transparent rounded-full mx-auto"></div>
      <div class="text-xs font-medium">กำลังโหลดสถานะฟีเจอร์...</div>
    </div>

    <!-- Error State -->
    <div v-else-if="featureStore.errorMessage" class="p-4 bg-rose-50 border border-rose-200 text-rose-700 rounded-2xl text-xs font-medium flex items-center gap-2">
      <AlertCircle class="w-4 h-4 shrink-0" />
      <span>{{ featureStore.errorMessage }}</span>
    </div>

    <!-- Features List Grid -->
    <div v-else class="space-y-4">
      <div class="flex items-center justify-between px-1">
        <div class="flex items-center gap-2">
          <div class="w-6 h-6 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <Smartphone class="w-3.5 h-3.5" />
          </div>
          <h2 class="text-sm font-bold text-slate-800">
            ฟีเจอร์สำหรับลูกบ้านบน LINE LIFF (Tenant Features)
          </h2>
        </div>
        <span class="text-xs text-slate-400 font-mono">{{ displayFeatures.length }} ฟีเจอร์</span>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div
          v-for="item in displayFeatures"
          :key="item.key"
          class="p-5 bg-white border border-slate-200/80 rounded-3xl shadow-xs hover:shadow-md transition-all space-y-3 flex flex-col justify-between"
        >
          <div class="space-y-3">
            <!-- Card Header: Icon + Title + Status + Switch -->
            <div class="flex items-start justify-between gap-3">
              <div class="flex items-center gap-3 min-w-0">
                <div
                  class="w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 shadow-2xs"
                  :class="getFeatureIconBg(item.key)"
                >
                  <component :is="getFeatureIcon(item.key)" class="w-5 h-5" />
                </div>
                <div class="min-w-0">
                  <div class="flex items-center gap-2 flex-wrap">
                    <h3 class="font-bold text-slate-900 text-sm">
                      {{ item.title || getFeatureTitle(item.key) }}
                    </h3>
                  </div>
                  <div class="flex items-center gap-1.5 mt-0.5">
                    <span
                      class="text-[10px] font-bold px-2 py-0.5 rounded-full inline-flex items-center gap-1"
                      :class="item.isActive ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/70' : 'bg-slate-100 text-slate-500 border border-slate-200'"
                    >
                      <span class="w-1.5 h-1.5 rounded-full" :class="item.isActive ? 'bg-emerald-500' : 'bg-slate-400'"></span>
                      <span>{{ item.isActive ? 'เปิดใช้งานอยู่' : 'ปิดใช้งาน' }}</span>
                    </span>

                    <span
                      v-if="buildingStore.activeBuildingId && item.isBuildingOverride"
                      class="text-[9px] font-semibold px-2 py-0.5 rounded-full bg-teal-50 text-teal-700 border border-teal-100"
                    >
                      เฉพาะอาคารนี้
                    </span>
                  </div>
                </div>
              </div>

              <!-- Switch Component (Toggle) -->
              <button
                @click="handleToggle(item.key, !item.isActive)"
                type="button"
                class="relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-hidden focus:ring-2 focus:ring-teal-500/20 shadow-2xs mt-0.5"
                :class="item.isActive ? 'bg-emerald-500' : 'bg-slate-200'"
              >
                <span
                  class="pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out"
                  :class="item.isActive ? 'translate-x-5' : 'translate-x-0'"
                ></span>
              </button>
            </div>

            <!-- Card Body: Clear Thai Description -->
            <p class="text-xs text-slate-600 leading-relaxed pl-1 pt-1">
              {{ item.description }}
            </p>
          </div>

          <!-- Card Footer: Key info -->
          <div class="pt-2 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-400 font-mono">
            <span>KEY: {{ item.key }}</span>
            <span class="text-slate-400 font-sans">มีผลทันทีใน LINE</span>
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
  ENABLE_MAINTENANCE_REQUEST: 'ระบบแจ้งซ่อมและร้องเรียน',
  ENABLE_LINE_PAYMENT: 'ระบบบิลค่าเช่า & ชำระเงินออนไลน์',
  ENABLE_PARCEL_NOTIFY: 'ระบบแจ้งเตือนและรับพัสดุ',
  ENABLE_ANNOUNCEMENTS: 'ข่าวสาร & ประกาศหอพัก',
  ENABLE_DIGITAL_ID: 'บัตรประจำตัวผู้เช่าดิจิทัล (Digital ID)',
  ENABLE_RECEIPT_HISTORY: 'ประวัติใบเสร็จรับเงิน E-Receipt',
  ENABLE_VEHICLE_MANAGEMENT: 'จัดการยานพาหนะและทะเบียนรถ'
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
      return 'bg-teal-50 text-teal-600';
    case 'ENABLE_PARCEL_NOTIFY':
      return 'bg-orange-50 text-orange-600';
    case 'ENABLE_ANNOUNCEMENTS':
      return 'bg-sky-50 text-sky-600';
    case 'ENABLE_DIGITAL_ID':
      return 'bg-emerald-50 text-emerald-600';
    case 'ENABLE_RECEIPT_HISTORY':
      return 'bg-teal-50 text-teal-600';
    case 'ENABLE_VEHICLE_MANAGEMENT':
      return 'bg-cyan-50 text-cyan-600';
    default:
      return 'bg-slate-50 text-slate-600';
  }
};

// Deduplicate features by key to guarantee no duplicates ever render in UI
const displayFeatures = computed(() => {
  const rawList = featureStore.features || [];
  const uniqueMap = new Map();

  rawList.forEach((f) => {
    if (!uniqueMap.has(f.key) || f.isBuildingOverride) {
      uniqueMap.set(f.key, f);
    }
  });

  const list = Array.from(uniqueMap.values());

  if (!searchQuery.value.trim()) return list;
  const q = searchQuery.value.toLowerCase().trim();
  return list.filter(
    (f) =>
      f.key.toLowerCase().includes(q) ||
      (f.title && f.title.toLowerCase().includes(q)) ||
      (f.description && f.description.toLowerCase().includes(q)) ||
      (featureTitles[f.key] && featureTitles[f.key].toLowerCase().includes(q))
  );
});

const handleToggle = async (key, newValue) => {
  try {
    await featureStore.toggleFeature(key, newValue, buildingStore.activeBuildingId);
    showToast(`อัปเดตฟีเจอร์ "${getFeatureTitle(key)}" เป็น ${newValue ? 'เปิดใช้งาน' : 'ปิดใช้งาน'} เรียบร้อยแล้ว`);
  } catch (error) {
    showError('เกิดข้อผิดพลาด', error.response?.data?.message || 'Failed to toggle feature');
  }
};
</script>
