<template>
  <div class="space-y-4 pb-8 font-sans text-slate-800 max-w-lg mx-auto">
    <!-- Header -->
    <div class="flex items-center justify-between pt-1">
      <div>
        <h1 class="text-lg font-bold text-slate-900 tracking-tight">ประวัติการแจ้งเหตุ</h1>
        <p class="text-xs text-slate-500">ติดตามสถานะการแจ้งซ่อมและข้อร้องเรียนของคุณ</p>
      </div>

      <div class="flex items-center gap-1.5">
        <button
          type="button"
          @click="fetchIssues"
          class="w-9 h-9 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center transition-colors cursor-pointer"
          title="รีเฟรชข้อมูล"
        >
          <RotateCw class="w-4 h-4" :class="{ 'animate-spin': loading }" />
        </button>

        <router-link
          to="/liff/issues/report"
          class="inline-flex items-center gap-1.5 px-3.5 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-xl text-xs font-bold shadow-md shadow-indigo-600/20 transition-all cursor-pointer active:scale-95"
        >
          <Plus class="w-3.5 h-3.5" />
          <span>แจ้งเรื่องใหม่</span>
        </router-link>
      </div>
    </div>

    <!-- Filter Tabs -->
    <div class="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none text-xs">
      <button
        v-for="tab in filterTabs"
        :key="tab.value"
        type="button"
        @click="activeTab = tab.value"
        class="px-3 py-1.5 rounded-xl font-semibold transition-all shrink-0 cursor-pointer flex items-center gap-1.5"
        :class="activeTab === tab.value
          ? 'bg-slate-900 text-white shadow-xs'
          : 'bg-white hover:bg-slate-100 text-slate-600 border border-slate-200/80'"
      >
        <span>{{ tab.label }}</span>
        <span
          v-if="tab.count > 0"
          class="px-1.5 py-0.2 rounded-full text-[10px]"
          :class="activeTab === tab.value ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'"
        >
          {{ tab.count }}
        </span>
      </button>
    </div>

    <!-- Loading Skeleton -->
    <div v-if="loading" class="space-y-3 animate-pulse">
      <div v-for="i in 3" :key="i" class="p-5 bg-white rounded-3xl border border-slate-100 shadow-xs space-y-3">
        <div class="flex justify-between items-center">
          <div class="h-4 w-28 bg-slate-100 skeleton-shimmer rounded-md"></div>
          <div class="h-4 w-20 bg-slate-100 skeleton-shimmer rounded-full"></div>
        </div>
        <div class="h-3 w-full bg-slate-100 skeleton-shimmer rounded-md"></div>
        <div class="h-3 w-3/4 bg-slate-100 skeleton-shimmer rounded-md"></div>
      </div>
    </div>

    <!-- Issues List -->
    <div v-else-if="filteredIssues.length > 0" class="space-y-3.5">
      <div
        v-for="issue in filteredIssues"
        :key="issue.id"
        class="p-5 bg-white rounded-3xl border border-slate-100 shadow-xs space-y-3 transition-all hover:shadow-md"
      >
        <!-- Card Top Bar: Category & Status Badge -->
        <div class="flex items-center justify-between gap-2 flex-wrap">
          <div class="flex items-center gap-2">
            <span
              class="w-7 h-7 rounded-xl flex items-center justify-center text-xs font-bold"
              :class="getCategoryIconBg(issue.category)"
            >
              <component :is="getCategoryIcon(issue.category)" class="w-3.5 h-3.5" />
            </span>

            <div>
              <span class="text-xs font-bold text-slate-800">
                {{ getCategoryLabel(issue.category) }}
              </span>
              <div class="text-[10px] text-slate-400 font-mono">
                ห้อง {{ issue.room?.roomNumber || '-' }} • {{ formatDate(issue.createdAt) }}
              </div>
            </div>
          </div>

          <!-- Status Badge -->
          <span
            class="px-2.5 py-0.5 rounded-full text-[11px] font-bold border shadow-2xs inline-flex items-center gap-1"
            :class="getStatusBadgeClass(issue.status)"
          >
            <span class="w-1.5 h-1.5 rounded-full" :class="getStatusDotClass(issue.status)"></span>
            <span>{{ getStatusLabel(issue.status) }}</span>
          </span>
        </div>

        <!-- Description Content -->
        <p class="text-xs text-slate-700 leading-relaxed whitespace-pre-line pt-1">
          {{ issue.description }}
        </p>

        <!-- Attached Images Preview Thumbnails -->
        <div v-if="getParsedImages(issue.imageUrls).length > 0" class="pt-1">
          <div class="flex items-center gap-2 overflow-x-auto pb-1">
            <img
              v-for="(imgUrl, idx) in getParsedImages(issue.imageUrls)"
              :key="idx"
              :src="resolveImageUrl(imgUrl)"
              alt="Attached Image"
              @click="openImageModal(resolveImageUrl(imgUrl))"
              class="w-16 h-16 sm:w-20 sm:h-20 object-cover rounded-xl border border-slate-200 shrink-0 cursor-pointer hover:opacity-90 transition-opacity shadow-2xs"
            />
          </div>
        </div>

        <!-- Admin Reply Box (if present) -->
        <div
          v-if="issue.adminReply"
          class="p-3.5 bg-indigo-50/70 border border-indigo-100 rounded-2xl space-y-1.5 text-xs shadow-2xs"
        >
          <div class="flex items-center gap-1.5 text-indigo-900 font-bold text-[11px]">
            <CheckCircle2 class="w-3.5 h-3.5 text-indigo-600 shrink-0" />
            <span>ข้อความตอบกลับจากแอดมิน / ช่างซ่อม</span>
          </div>
          <p class="text-indigo-950 text-xs leading-relaxed whitespace-pre-line pl-5 font-medium">
            {{ issue.adminReply }}
          </p>
        </div>
      </div>
    </div>

    <!-- Empty State -->
    <div v-else class="p-10 bg-white rounded-3xl border border-slate-100 text-center space-y-3 shadow-xs">
      <div class="w-14 h-14 rounded-3xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto shadow-xs">
        <ClipboardList class="w-7 h-7" />
      </div>
      <div>
        <h3 class="text-sm font-bold text-slate-800">ไม่พบรายการแจ้งเหตุ</h3>
        <p class="text-xs text-slate-400 mt-0.5">
          {{ activeTab === 'ALL' ? 'คุณยังไม่เคยส่งเรื่องแจ้งซ่อมหรือร้องเรียน' : 'ไม่มีรายการในหมวดหมู่นี้' }}
        </p>
      </div>

      <div class="pt-1">
        <router-link
          to="/liff/issues/report"
          class="inline-flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-indigo-600/20 cursor-pointer"
        >
          <Plus class="w-3.5 h-3.5" />
          <span>แจ้งซ่อม / ร้องเรียนเรื่องแรก</span>
        </router-link>
      </div>
    </div>

    <!-- Lightbox Image Modal -->
    <Teleport to="body">
      <div
        v-if="previewModalImage"
        class="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200"
        @click.self="previewModalImage = null"
      >
        <div class="relative max-w-lg w-full">
          <button
            type="button"
            @click="previewModalImage = null"
            class="absolute -top-10 right-0 w-8 h-8 rounded-full bg-white/20 hover:bg-white/40 text-white flex items-center justify-center cursor-pointer transition-colors"
          >
            <X class="w-5 h-5" />
          </button>
          <img
            :src="previewModalImage"
            alt="Full Image"
            class="w-full max-h-[80vh] object-contain rounded-2xl shadow-2xl mx-auto"
          />
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import {
  Plus,
  RotateCw,
  Wrench,
  MessageSquareWarning,
  HelpCircle,
  CheckCircle2,
  ClipboardList,
  X
} from 'lucide-vue-next';
import { initLiff, isLiffLoggedIn, getLiffProfile } from '@/utils/liff';
import api from '@/utils/api';

const loading = ref(true);
const issues = ref([]);
const lineUserId = ref('');
const activeTab = ref('ALL');
const previewModalImage = ref(null);

const filterTabs = computed(() => {
  const allCount = issues.value.length;
  const pendingCount = issues.value.filter((i) => (i.status || '').toUpperCase() === 'PENDING').length;
  const inProgressCount = issues.value.filter((i) => (i.status || '').toUpperCase() === 'IN_PROGRESS').length;
  const resolvedCount = issues.value.filter((i) => (i.status || '').toUpperCase() === 'RESOLVED').length;

  return [
    { value: 'ALL', label: 'ทั้งหมด', count: allCount },
    { value: 'PENDING', label: 'รอรับเรื่อง', count: pendingCount },
    { value: 'IN_PROGRESS', label: 'กำลังดำเนินการ', count: inProgressCount },
    { value: 'RESOLVED', label: 'แก้ไขแล้ว', count: resolvedCount }
  ];
});

const filteredIssues = computed(() => {
  if (activeTab.value === 'ALL') {
    return issues.value;
  }
  return issues.value.filter((i) => (i.status || '').toUpperCase() === activeTab.value);
});

const getCategoryLabel = (category) => {
  const map = {
    REPAIR: 'แจ้งซ่อมบำรุง',
    COMPLAINT: 'ร้องเรียน/แจ้งปัญหา',
    OTHER: 'เรื่องอื่นๆ'
  };
  return map[(category || '').toUpperCase()] || 'แจ้งเหตุทั่วไป';
};

const getCategoryIcon = (category) => {
  const cat = (category || '').toUpperCase();
  if (cat === 'REPAIR') return Wrench;
  if (cat === 'COMPLAINT') return MessageSquareWarning;
  return HelpCircle;
};

const getCategoryIconBg = (category) => {
  const cat = (category || '').toUpperCase();
  if (cat === 'REPAIR') return 'bg-amber-100 text-amber-700';
  if (cat === 'COMPLAINT') return 'bg-rose-100 text-rose-700';
  return 'bg-indigo-100 text-indigo-700';
};

const getStatusLabel = (status) => {
  const map = {
    PENDING: 'รอรับเรื่อง',
    IN_PROGRESS: 'กำลังดำเนินการ',
    RESOLVED: 'แก้ไขเสร็จสิ้น',
    CANCELLED: 'ยกเลิก'
  };
  return map[(status || '').toUpperCase()] || status;
};

const getStatusBadgeClass = (status) => {
  const s = (status || '').toUpperCase();
  switch (s) {
    case 'PENDING':
      return 'bg-amber-50 text-amber-800 border-amber-200';
    case 'IN_PROGRESS':
      return 'bg-sky-50 text-sky-800 border-sky-200';
    case 'RESOLVED':
      return 'bg-emerald-50 text-emerald-800 border-emerald-200';
    case 'CANCELLED':
      return 'bg-rose-50 text-rose-700 border-rose-200';
    default:
      return 'bg-slate-50 text-slate-700 border-slate-200';
  }
};

const getStatusDotClass = (status) => {
  const s = (status || '').toUpperCase();
  switch (s) {
    case 'PENDING':
      return 'bg-amber-500 animate-pulse';
    case 'IN_PROGRESS':
      return 'bg-sky-500 animate-pulse';
    case 'RESOLVED':
      return 'bg-emerald-500';
    case 'CANCELLED':
      return 'bg-rose-500';
    default:
      return 'bg-slate-400';
  }
};

const getParsedImages = (imageUrls) => {
  if (!imageUrls) return [];
  if (Array.isArray(imageUrls)) return imageUrls;
  try {
    const parsed = JSON.parse(imageUrls);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [imageUrls];
  }
};

const resolveImageUrl = (path) => {
  if (!path) return '';
  if (path.startsWith('http://') || path.startsWith('https://')) return path;
  const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';
  const cleanBase = baseUrl.replace(/\/+$/, '');
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  return `${cleanBase}${cleanPath}`;
};

const openImageModal = (url) => {
  previewModalImage.value = url;
};

const formatDate = (dateStr) => {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return dateStr;
  return d.toLocaleDateString('th-TH', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

const fetchIssues = async () => {
  loading.value = true;
  try {
    const params = {};
    if (lineUserId.value) params.lineUserId = lineUserId.value;

    const res = await api.get('/api/v1/liff/issues', { params });
    issues.value = res.data?.data || [];
  } catch (err) {
    console.error('Failed to fetch issues:', err);
  } finally {
    loading.value = false;
  }
};

onMounted(async () => {
  try {
    await initLiff();
    if (isLiffLoggedIn()) {
      const profile = await getLiffProfile();
      if (profile?.userId) {
        lineUserId.value = profile.userId;
      }
    }
  } catch (err) {
    console.warn('LIFF init fallback:', err.message);
  }

  await fetchIssues();
});
</script>
