<template>
  <div class="space-y-6">
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
      <div>
        <h1 class="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
          <span>🚩</span>
          <span>ตั้งค่าฟีเจอร์ของระบบ (Feature Flags & Toggles)</span>
        </h1>
        <p class="text-xs sm:text-sm text-slate-500 mt-1">
          เปิด-ปิดสวิตช์ฟีเจอร์ของระบบแยกตามตึกได้แบบเรียลไทม์
        </p>
      </div>

      <button
        @click="loadData"
        class="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition-all border border-slate-200"
      >
        🔄 รีเฟรชสวิตช์ฟีเจอร์
      </button>
    </div>

    <!-- Loading State -->
    <div v-if="featureStore.isLoading" class="p-12 text-center text-slate-500 bg-white rounded-2xl border border-slate-200 shadow-xs">
      <div class="animate-spin w-8 h-8 border-4 border-purple-600 border-t-transparent rounded-full mx-auto mb-3"></div>
      กำลังโหลดข้อมูล Feature Toggles...
    </div>

    <div v-else-if="featureStore.errorMessage" class="p-4 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-sm font-medium">
      {{ featureStore.errorMessage }}
    </div>

    <!-- Feature Toggles List -->
    <div v-else class="grid grid-cols-1 md:grid-cols-2 gap-5">
      <div
        v-for="item in featureStore.features"
        :key="item.id || item.key"
        class="p-6 bg-white border border-slate-200 rounded-2xl shadow-xs space-y-4 transition-all hover:shadow-md"
      >
        <div class="flex items-start justify-between gap-4">
          <div class="space-y-1">
            <div class="flex items-center gap-2">
              <span class="font-bold text-slate-900 font-mono text-sm sm:text-base">{{ item.key }}</span>
              <span
                class="text-[10px] font-extrabold px-2 py-0.5 rounded-full uppercase"
                :class="item.isActive ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-500'"
              >
                {{ item.isActive ? 'ACTIVE (ON)' : 'DISABLED (OFF)' }}
              </span>
            </div>
            <p class="text-xs text-slate-500 leading-relaxed">{{ item.description }}</p>
          </div>

          <!-- Switch Component (Toggle) -->
          <button
            @click="handleToggle(item.key, !item.isActive)"
            type="button"
            class="relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-hidden focus:ring-2 focus:ring-purple-500/20"
            :class="item.isActive ? 'bg-purple-600' : 'bg-slate-200'"
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
</template>

<script setup>
import { onMounted, watch } from 'vue';
import { useFeatureStore } from '@/stores/useFeatureStore';
import { useBuildingStore } from '@/stores/useBuildingStore';
import { showError, showToast } from '@/utils/swal';

const featureStore = useFeatureStore();
const buildingStore = useBuildingStore();

const loadData = () => {
  featureStore.fetchFeatures(buildingStore.activeBuildingId);
};

onMounted(() => {
  loadData();
});

watch(
  () => buildingStore.activeBuildingId,
  () => {
    loadData();
  }
);

const handleToggle = async (key, newValue) => {
  try {
    await featureStore.toggleFeature(key, newValue, buildingStore.activeBuildingId);
    showToast(`อัปเดตฟีเจอร์ ${key} เรียบร้อยแล้ว`);
  } catch (error) {
    showError('เกิดข้อผิดพลาด', error.response?.data?.message || 'Failed to toggle feature');
  }
};
</script>
