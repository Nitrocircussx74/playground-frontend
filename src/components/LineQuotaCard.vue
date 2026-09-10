<template>
  <div class="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden transition-all duration-300">
    <!-- Header Section -->
    <div class="p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-gradient-to-r from-emerald-50/50 via-teal-50/20 to-white">
      <div class="flex items-center gap-3">
        <div class="w-10 h-10 rounded-xl bg-[#06C755]/10 border border-[#06C755]/30 flex items-center justify-center shrink-0 shadow-2xs">
          <!-- LINE Brand Icon -->
          <svg class="w-6 h-6 text-[#06C755]" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2C6.48 2 2 5.82 2 10.53c0 2.92 1.74 5.51 4.41 6.99-.19.67-.69 2.45-.79 2.83-.13.48.18.47.37.35.15-.1 2.38-1.62 3.35-2.28.85.16 1.74.25 2.66.25 5.52 0 10-3.82 10-8.53S17.52 2 12 2z"/>
          </svg>
        </div>
        <div>
          <h3 class="text-sm sm:text-base font-bold text-slate-900 flex items-center gap-2">
            <span>โควต้าข้อความ LINE OA ประจำเดือน</span>
            <!-- Status Badge -->
            <span
              v-if="!isLoading && quotaData?.configured"
              class="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full border"
              :class="statusBadgeClass"
            >
              <span class="w-1.5 h-1.5 rounded-full" :class="statusDotClass"></span>
              <span>{{ statusLabel }}</span>
            </span>
          </h3>
          <p class="text-xs text-slate-500 mt-0.5">
            LINE Messaging API Quota Monitor (เช็คจำนวนข้อความ Push แจ้งเตือนในรอบเดือนนี้)
          </p>
        </div>
      </div>

      <!-- Action Button -->
      <div class="flex items-center gap-2 self-end sm:self-auto">
        <button
          @click="fetchQuota"
          :disabled="isLoading"
          class="px-3 py-1.5 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-2xs transition-all active:scale-95 disabled:opacity-60 cursor-pointer"
          title="รีเฟรชข้อมูลโควต้าล่าสุดจาก LINE"
        >
          <svg
            class="w-3.5 h-3.5 text-slate-500"
            :class="{ 'animate-spin': isLoading }"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/>
            <path d="M3 3v5h5"/>
            <path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16"/>
            <path d="M16 21h5v-5"/>
          </svg>
          <span>{{ isLoading ? 'กำลังดึงข้อมูล...' : 'เช็คโควต้าล่าสุด' }}</span>
        </button>
      </div>
    </div>

    <!-- Body Content -->
    <div class="p-5 space-y-4">
      <!-- 1. Loading State Skeleton -->
      <div v-if="isLoading" class="py-6 flex flex-col items-center justify-center space-y-3">
        <div class="w-8 h-8 border-3 border-[#06C755] border-t-transparent rounded-full animate-spin"></div>
        <p class="text-xs text-slate-500 font-medium">กำลังตรวจสอบโควต้าข้อความกับ LINE API Server...</p>
      </div>

      <!-- 2. Unconfigured State -->
      <div
        v-else-if="quotaData && !quotaData.configured"
        class="p-4 bg-slate-50 border border-slate-200 rounded-xl flex items-start gap-3 text-slate-700"
      >
        <div class="w-8 h-8 rounded-lg bg-slate-200/80 flex items-center justify-center text-slate-600 shrink-0 font-bold">
          ℹ️
        </div>
        <div class="space-y-1 text-xs">
          <p class="font-bold text-slate-900">ยังไม่ได้ตั้งค่า LINE Messaging API Token</p>
          <p class="text-slate-500 leading-relaxed">
            กรุณากรอก <strong>Channel Access Token (Long-Lived)</strong> ในส่วนการตั้งค่า LINE Official Account ด้านล่างเพื่อเริ่มใช้งานระบบส่งแจ้งเตือนและตรวจสอบโควต้า
          </p>
        </div>
      </div>

      <!-- 3. Invalid Token Error State (401) -->
      <div
        v-else-if="quotaData?.error === 'INVALID_TOKEN' || quotaData?.status === 'invalid_token'"
        class="p-4 bg-rose-50 border border-rose-200 rounded-xl flex items-start gap-3 text-rose-800"
      >
        <div class="w-8 h-8 rounded-lg bg-rose-100 flex items-center justify-center text-rose-600 shrink-0 font-bold">
          ⚠️
        </div>
        <div class="space-y-1 text-xs">
          <p class="font-bold text-rose-950">LINE Channel Access Token ไม่ถูกต้องหรือหมดอายุ</p>
          <p class="text-rose-700 leading-relaxed">
            ระบบไม่สามารถเชื่อมต่อกับ LINE Messaging API ได้เนื่องจาก Token ไม่ถูกต้อง กรุณา Re-issue Token ใหม่จาก LINE Developers Console แล้วนำมาอัปเดต
          </p>
        </div>
      </div>

      <!-- 4. General Error State -->
      <div
        v-else-if="quotaData?.error"
        class="p-4 bg-amber-50 border border-amber-200 rounded-xl flex items-start gap-3 text-amber-800 text-xs"
      >
        <span class="text-lg">⚠️</span>
        <div>
          <p class="font-bold">เกิดข้อผิดพลาดในการตรวจสอบโควต้า</p>
          <p class="mt-0.5 text-amber-700">{{ quotaData.message || 'ไม่สามารถติดต่อ LINE API ได้ในขณะนี้' }}</p>
        </div>
      </div>

      <!-- 5. Active Quota Display (Unlimited / Limited) -->
      <div v-else-if="quotaData" class="space-y-4">
        <!-- Progress Bar Section (Only for limited plans) -->
        <div v-if="!quotaData.isUnlimited" class="space-y-2">
          <div class="flex items-center justify-between text-xs">
            <span class="font-bold text-slate-700 flex items-center gap-1.5">
              <span>โควต้าที่ใช้งานไปในเดือนนี้</span>
              <span class="text-slate-500 font-normal">({{ quotaData.totalUsage.toLocaleString() }} / {{ quotaData.quota.toLocaleString() }} ข้อความ)</span>
            </span>
            <span class="font-extrabold text-sm" :class="percentageTextColor">
              {{ quotaData.percentage }}%
            </span>
          </div>

          <!-- Shadcn Progress Bar -->
          <Progress
            :model-value="quotaData.percentage"
            :max="100"
            class="h-3 bg-slate-100 shadow-inner"
            :indicator-class="progressIndicatorColor"
          />

          <div class="flex items-center justify-between text-[11px] text-slate-400 font-medium">
            <span>0 ข้อความ</span>
            <span>โควต้าสูงสุด {{ quotaData.quota.toLocaleString() }} ข้อความ/เดือน</span>
          </div>
        </div>

        <!-- Metric Grid Stats -->
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <!-- Card 1: โควต้าทั้งหมด -->
          <div class="p-3.5 bg-slate-50/90 rounded-xl border border-slate-100">
            <span class="text-[11px] font-semibold text-slate-500 block">โควต้ารวมประจำเดือน</span>
            <div class="mt-1 flex items-baseline gap-1.5">
              <span class="text-lg sm:text-xl font-extrabold text-slate-800">
                {{ quotaData.isUnlimited ? 'ไม่จำกัด' : quotaData.quota?.toLocaleString() }}
              </span>
              <span class="text-xs text-slate-500 font-medium">
                {{ quotaData.isUnlimited ? '(Unlimited)' : 'ข้อความ' }}
              </span>
            </div>
          </div>

          <!-- Card 2: ยอดที่ใช้ไปแล้ว -->
          <div class="p-3.5 bg-slate-50/90 rounded-xl border border-slate-100">
            <span class="text-[11px] font-semibold text-slate-500 block">ส่งไปแล้วในเดือนนี้</span>
            <div class="mt-1 flex items-baseline gap-1.5">
              <span class="text-lg sm:text-xl font-extrabold" :class="usageTextColor">
                {{ quotaData.totalUsage?.toLocaleString() }}
              </span>
              <span class="text-xs text-slate-500 font-medium">ข้อความ</span>
            </div>
          </div>

          <!-- Card 3: โควต้าคงเหลือ -->
          <div class="p-3.5 bg-slate-50/90 rounded-xl border border-slate-100">
            <span class="text-[11px] font-semibold text-slate-500 block">โควต้าที่เหลือส่งได้</span>
            <div class="mt-1 flex items-baseline gap-1.5">
              <span class="text-lg sm:text-xl font-extrabold" :class="remainingTextColor">
                {{ quotaData.isUnlimited ? '∞' : quotaData.remaining?.toLocaleString() }}
              </span>
              <span class="text-xs text-slate-500 font-medium">
                {{ quotaData.isUnlimited ? 'ไม่จำกัด' : 'ข้อความ' }}
              </span>
            </div>
          </div>
        </div>

        <!-- ⚠️ Danger Alert Callout (Usage > 90%) -->
        <div
          v-if="!quotaData.isUnlimited && quotaData.percentage >= 90"
          class="p-4 bg-rose-50 border border-rose-300 rounded-xl flex items-start gap-3 shadow-2xs animate-pulse-subtle"
        >
          <div class="w-8 h-8 rounded-lg bg-rose-500 text-white flex items-center justify-center shrink-0 text-base shadow-sm">
            🚨
          </div>
          <div class="space-y-1 text-xs text-rose-950">
            <h4 class="font-bold text-rose-900">
              แจ้งเตือน: โควต้าข้อความ LINE OA ของตึกนี้ใกล้หมดแล้ว (ใช้ไป {{ quotaData.percentage }}%)
            </h4>
            <p class="text-rose-800 leading-relaxed">
              หากโควต้าเต็ม (ครบ 100%) ระบบจะไม่สามารถส่ง Flex Message แจ้งเตือนบิล ใบเสร็จรับเงิน หรือพัสดุไปยังลูกบ้านได้ 
              แนะนำให้เจ้าของตึกเข้าสู่ระบบ <strong>LINE Official Account Manager</strong> เพื่อพิจารณาอัปเกรดแพ็กเกจ (Basic / Pro Plan) ให้เพียงพอต่อการใช้งาน
            </p>
          </div>
        </div>

        <!-- ⚠️ Warning Alert Callout (Usage 70% - 89%) -->
        <div
          v-else-if="!quotaData.isUnlimited && quotaData.percentage >= 70"
          class="p-3.5 bg-amber-50 border border-amber-200 rounded-xl flex items-start gap-2.5 text-xs text-amber-900"
        >
          <span class="text-base text-amber-600">⚡</span>
          <div>
            <span class="font-bold">เริ่มมีการใช้งานโควต้าเกิน 70%: </span>
            <span>เหลือส่งได้อีก {{ quotaData.remaining?.toLocaleString() }} ข้อความในรอบเดือนนี้</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import api from '@/utils/api';
import { useBuildingStore } from '@/stores/useBuildingStore';
import { Progress } from '@/components/ui/progress';

const props = defineProps({
  buildingId: {
    type: String,
    default: ''
  }
});

const buildingStore = useBuildingStore();
const isLoading = ref(false);
const quotaData = ref(null);

const targetBuildingId = computed(() => {
  return props.buildingId || buildingStore.activeBuildingId || '';
});

/**
 * ดึงข้อมูลโควต้าข้อความ LINE OA จาก Backend API
 */
const fetchQuota = async () => {
  const bId = targetBuildingId.value;
  if (!bId) return;

  isLoading.value = true;
  try {
    const res = await api.get(`/api/admin/buildings/${bId}/line-quota`);
    if (res.data?.success && res.data?.data) {
      quotaData.value = res.data.data;
    } else {
      quotaData.value = res.data?.data || null;
    }
  } catch (error) {
    quotaData.value = {
      configured: true,
      error: 'API_REQUEST_FAILED',
      message: error.response?.data?.message || error.message || 'ไม่สามารถติดต่อเซิร์ฟเวอร์ได้'
    };
  } finally {
    isLoading.value = false;
  }
};

/**
 * Computed Dynamic Styling
 */
const statusBadgeClass = computed(() => {
  if (quotaData.value?.isUnlimited) {
    return 'bg-blue-50 text-blue-700 border-blue-200';
  }
  const pct = quotaData.value?.percentage || 0;
  if (pct >= 90) return 'bg-rose-50 text-rose-700 border-rose-200';
  if (pct >= 70) return 'bg-amber-50 text-amber-700 border-amber-200';
  return 'bg-emerald-50 text-emerald-700 border-emerald-200';
});

const statusDotClass = computed(() => {
  if (quotaData.value?.isUnlimited) return 'bg-blue-500';
  const pct = quotaData.value?.percentage || 0;
  if (pct >= 90) return 'bg-rose-500 animate-ping';
  if (pct >= 70) return 'bg-amber-500';
  return 'bg-emerald-500';
});

const statusLabel = computed(() => {
  if (quotaData.value?.isUnlimited) return 'Unlimited Plan (ไม่จำกัด)';
  const pct = quotaData.value?.percentage || 0;
  if (pct >= 90) return 'โควต้าใกล้เต็ม (วิกฤต)';
  if (pct >= 70) return 'ใช้งานปานกลาง';
  return 'โควต้าปกติ';
});

const progressIndicatorColor = computed(() => {
  const pct = quotaData.value?.percentage || 0;
  if (pct >= 90) return 'bg-rose-500';
  if (pct >= 70) return 'bg-amber-500';
  return 'bg-emerald-500';
});

const percentageTextColor = computed(() => {
  const pct = quotaData.value?.percentage || 0;
  if (pct >= 90) return 'text-rose-600';
  if (pct >= 70) return 'text-amber-600';
  return 'text-emerald-600';
});

const usageTextColor = computed(() => {
  const pct = quotaData.value?.percentage || 0;
  if (pct >= 90) return 'text-rose-600';
  if (pct >= 70) return 'text-amber-600';
  return 'text-slate-800';
});

const remainingTextColor = computed(() => {
  if (quotaData.value?.isUnlimited) return 'text-blue-600';
  const pct = quotaData.value?.percentage || 0;
  if (pct >= 90) return 'text-rose-600';
  if (pct >= 70) return 'text-amber-600';
  return 'text-emerald-600';
});

onMounted(() => {
  fetchQuota();
});

watch(
  () => targetBuildingId.value,
  (newVal) => {
    if (newVal) {
      fetchQuota();
    }
  }
);

defineExpose({
  fetchQuota
});
</script>
