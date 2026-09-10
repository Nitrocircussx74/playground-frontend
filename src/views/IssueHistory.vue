<template>
  <div class="space-y-4 pb-8 font-sans text-slate-800 max-w-lg mx-auto">
    <!-- Header -->
    <div class="flex items-center justify-between gap-3 pt-1">
      <div class="min-w-0 flex-1">
        <h1 class="text-lg sm:text-xl font-extrabold text-slate-900 tracking-tight truncate">
          ประวัติการแจ้งเหตุ
        </h1>
        <p class="text-xs text-slate-500 truncate">
          ติดตามสถานะการแจ้งซ่อมและข้อร้องเรียนของคุณ
        </p>
      </div>

      <div class="flex items-center gap-2 shrink-0">
        <!-- Refresh Button -->
        <button
          type="button"
          @click="fetchIssues"
          class="w-10 h-10 rounded-2xl bg-white hover:bg-slate-100 active:scale-95 text-slate-600 border border-slate-200/80 shadow-2xs flex items-center justify-center transition-all cursor-pointer"
          title="รีเฟรชข้อมูล"
        >
          <RotateCw class="w-4 h-4 transition-transform" :class="{ 'animate-spin': loading }" />
        </button>

        <!-- New Issue Button -->
        <router-link
          v-if="featureStore.isEnabled('ENABLE_MAINTENANCE_REQUEST')"
          to="/liff/issues/report"
          class="inline-flex items-center gap-1.5 px-4 py-2.5 bg-gradient-to-r from-cyan-600 via-teal-600 to-cyan-600 hover:from-cyan-700 hover:to-teal-700 active:scale-95 text-white rounded-2xl text-xs font-extrabold shadow-md shadow-cyan-600/25 transition-all cursor-pointer"
        >
          <Plus class="w-4 h-4" />
          <span>แจ้งเรื่องใหม่</span>
        </router-link>
      </div>
    </div>

    <!-- Feature Disabled Notice (Admin ปิดใช้งานระบบแจ้งซ่อม/ร้องเรียนไว้) -->
    <div
      v-if="!featureStore.isEnabled('ENABLE_MAINTENANCE_REQUEST')"
      class="p-5 bg-amber-50 border border-amber-200 rounded-3xl text-amber-900 space-y-2 shadow-xs"
    >
      <div class="flex items-center gap-2 font-bold text-xs">
        <AlertTriangle class="w-4 h-4 text-amber-600 shrink-0" />
        <span>ระบบแจ้งซ่อมและร้องเรียนถูกปิดใช้งานชั่วคราว</span>
      </div>
      <p class="text-[11px] text-amber-700 leading-relaxed">
        ผู้ดูแลหอพักได้ปิดการรับเรื่องแจ้งซ่อมหรือร้องเรียนผ่านระบบออนไลน์ชั่วคราว หากมีเหตุฉุกเฉินกรุณาติดต่อเจ้าหน้าที่โดยตรง
      </p>
    </div>

    <template v-else>
      <!-- Filter Tabs (Horizontal Scrollable with no-scrollbar) -->
      <div class="flex items-center gap-2 overflow-x-auto pb-1.5 pt-0.5 no-scrollbar touch-pan-x select-none text-xs">
        <button
          v-for="tab in filterTabs"
          :key="tab.value"
          type="button"
          @click="activeTab = tab.value"
          class="px-3.5 py-2 rounded-2xl font-bold transition-all shrink-0 cursor-pointer flex items-center gap-1.5 active:scale-95"
          :class="activeTab === tab.value
            ? 'bg-slate-900 text-white shadow-xs'
            : 'bg-white hover:bg-slate-100 text-slate-600 border border-slate-200/80'"
        >
          <span>{{ tab.label }}</span>
          <span
            class="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold"
            :class="activeTab === tab.value ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'"
          >
            {{ tab.count }}
          </span>
        </button>
      </div>

      <!-- Loading Skeleton -->
      <div v-if="loading" class="space-y-3.5 animate-pulse">
        <div v-for="i in 3" :key="i" class="p-5 bg-white rounded-3xl border border-slate-100 shadow-xs space-y-3">
          <div class="flex justify-between items-start">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 rounded-2xl bg-slate-100"></div>
              <div class="space-y-1.5">
                <div class="h-4 w-28 bg-slate-200 rounded-md"></div>
                <div class="h-3 w-36 bg-slate-100 rounded-md"></div>
              </div>
            </div>
            <div class="h-6 w-24 bg-slate-100 rounded-full"></div>
          </div>
          <div class="h-12 w-full bg-slate-50 rounded-2xl"></div>
        </div>
      </div>

      <!-- Issues List -->
      <div v-else-if="filteredIssues.length > 0" class="space-y-3.5">
        <div
          v-for="issue in filteredIssues"
          :key="issue.id"
          class="p-5 bg-white rounded-3xl border border-slate-100/90 shadow-2xs space-y-3.5 transition-all hover:shadow-md"
        >
          <!-- Card Top Bar: Category & Fixed Status Badge -->
          <div class="flex items-start justify-between gap-3">
            <div class="flex items-center gap-3 min-w-0 flex-1">
              <span
                class="w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 shadow-2xs text-sm font-bold"
                :class="getCategoryIconBg(issue.category)"
              >
                <component :is="getCategoryIcon(issue.category)" class="w-4 h-4" />
              </span>

              <div class="min-w-0 flex-1">
                <span class="text-xs sm:text-sm font-extrabold text-slate-900 block truncate">
                  {{ getCategoryLabel(issue.category) }}
                </span>
                <div class="text-[11px] text-slate-400 font-mono flex items-center gap-1.5 pt-0.5 truncate">
                  <span>ห้อง {{ issue.room?.roomNumber || '-' }}</span>
                  <span>•</span>
                  <span>{{ formatDate(issue.createdAt) }}</span>
                </div>
              </div>
            </div>

            <!-- Status Badge (Aligned top-right) -->
            <span
              class="px-2.5 py-1 rounded-full text-[11px] font-extrabold border shadow-2xs inline-flex items-center gap-1.5 shrink-0"
              :class="getStatusBadgeClass(issue.status)"
            >
              <span class="w-1.5 h-1.5 rounded-full" :class="getStatusDotClass(issue.status)"></span>
              <span>{{ getStatusLabel(issue.status) }}</span>
            </span>
          </div>

          <!-- Description Content Box -->
          <div class="bg-slate-50/70 p-3.5 rounded-2xl border border-slate-100/80">
            <p class="text-xs sm:text-[13px] text-slate-700 leading-relaxed whitespace-pre-line font-normal">
              {{ issue.description }}
            </p>
          </div>

          <!-- Attached Images Preview Thumbnails -->
          <div v-if="getParsedImages(issue.imageUrls).length > 0" class="pt-0.5">
            <div class="flex items-center gap-2.5 overflow-x-auto pb-1 no-scrollbar">
              <div
                v-for="(imgUrl, idx) in getParsedImages(issue.imageUrls)"
                :key="idx"
                class="relative group w-16 h-16 sm:w-20 sm:h-20 rounded-2xl overflow-hidden border border-slate-200/80 shrink-0 bg-slate-100 shadow-2xs cursor-pointer active:scale-95 transition-all"
                @click="openImageModal(resolveImageUrl(imgUrl))"
              >
                <img
                  :src="resolveImageUrl(imgUrl)"
                  alt="รูปหลักฐานแนบ"
                  class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                  @error="handleImgError($event)"
                />
              </div>
            </div>
          </div>

          <!-- Admin Reply Box (if present) -->
          <div
            v-if="issue.adminReply"
            class="p-4 bg-gradient-to-br from-teal-50/80 to-cyan-50/40 border border-teal-100/80 rounded-2xl space-y-2 text-xs shadow-2xs"
          >
            <div class="flex items-center gap-2 text-teal-900 font-extrabold text-xs">
              <span class="w-5 h-5 rounded-full bg-teal-600 text-white flex items-center justify-center text-[10px] shrink-0 font-bold shadow-2xs">
                ✓
              </span>
              <span>ข้อความตอบกลับจากแอดมิน / ช่างซ่อม</span>
            </div>
            <p class="text-slate-700 text-xs sm:text-[13px] leading-relaxed whitespace-pre-line pl-7 font-medium">
              {{ issue.adminReply }}
            </p>
          </div>
        </div>
      </div>

      <!-- Empty State -->
      <div v-else class="p-10 bg-white rounded-3xl border border-slate-100 text-center space-y-3 shadow-xs">
        <div class="w-14 h-14 rounded-3xl bg-teal-50 text-teal-600 flex items-center justify-center mx-auto shadow-xs">
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
            class="inline-flex items-center gap-1.5 px-4 py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-teal-600/20 cursor-pointer active:scale-95"
          >
            <Plus class="w-3.5 h-3.5" />
            <span>แจ้งซ่อม / ร้องเรียนเรื่องแรก</span>
          </router-link>
        </div>
      </div>
    </template>

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
  AlertTriangle,
  X
} from 'lucide-vue-next';
import { initLiff, isLiffLoggedIn, getLiffProfile } from '@/utils/liff';
import { useFeatureStore } from '@/stores/useFeatureStore';
import api from '@/utils/api';
import { formatDateTime as formatDate } from '@/utils/formatters';

const featureStore = useFeatureStore();
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
  return 'bg-teal-100 text-teal-700';
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

const handleImgError = (event) => {
  if (event?.target?.parentElement) {
    event.target.parentElement.style.display = 'none';
  }
};

/**
 * แปลงข้อมูลจากระบบ Maintenance เดิม (ก่อน Unify) ให้อยู่ในรูปแบบเดียวกับ Issue
 * เพื่อให้ลูกบ้านยังเห็นประวัติแจ้งซ่อมเก่าครบถ้วน แม้ระบบเขียนใหม่จะย้ายไปที่ Issues แล้ว
 */
const normalizeMaintenanceItem = (item) => {
  const statusMap = {
    pending: 'PENDING',
    in_progress: 'IN_PROGRESS',
    assigned: 'IN_PROGRESS',
    resolved: 'RESOLVED',
    completed: 'RESOLVED',
    cancelled: 'CANCELLED'
  };

  const extraNotes = [];
  if (item.technicianName) extraNotes.push(`ช่างผู้รับผิดชอบ: ${item.technicianName}`);
  if (Number(item.repairCost || 0) > 0) {
    extraNotes.push(`ค่าซ่อม/อุปกรณ์: ฿${Number(item.repairCost).toLocaleString()}`);
    extraNotes.push(
      item.payer === 'TENANT'
        ? (item.billedInvoiceId ? 'ค่าใช้จ่าย: รวมอยู่ในบิลค่าเช่าแล้ว' : 'ค่าใช้จ่าย: ลูกบ้านชำระเอง (จะรวมในบิลค่าเช่ารอบถัดไปอัตโนมัติ)')
        : 'ค่าใช้จ่าย: นิติบุคคลออกให้'
    );
  }
  const adminReply = [item.adminNote, ...extraNotes].filter(Boolean).join('\n') || null;

  return {
    id: `maintenance-${item.id}`,
    category: 'REPAIR',
    description: item.title ? `${item.title}${item.description ? `\n${item.description}` : ''}` : item.description,
    status: statusMap[(item.status || '').toLowerCase()] || 'PENDING',
    room: item.room,
    imageUrls: item.imageUrl || item.photoUrl ? [item.imageUrl || item.photoUrl] : [],
    adminReply,
    createdAt: item.createdAt
  };
};

const fetchIssues = async () => {
  loading.value = true;
  try {
    const params = {};
    if (lineUserId.value) params.lineUserId = lineUserId.value;

    // รวมข้อมูลจาก 2 ระบบหลังบ้าน (issues ระบบปัจจุบัน + maintenance ระบบเดิมที่ถูก unify) เข้าเป็นประวัติเดียว
    const [issuesRes, maintenanceRes] = await Promise.allSettled([
      api.get('/api/v1/liff/issues', { params }),
      api.get('/api/v1/liff/maintenance', { params })
    ]);

    const issueList = issuesRes.status === 'fulfilled' ? (issuesRes.value.data?.data || []) : [];
    const maintenanceList = maintenanceRes.status === 'fulfilled' ? (maintenanceRes.value.data?.data || []) : [];

    issues.value = [...issueList, ...maintenanceList.map(normalizeMaintenanceItem)].sort(
      (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
    );
  } catch (err) {
    console.error('Failed to fetch issues:', err);
  } finally {
    loading.value = false;
  }
};

onMounted(async () => {
  featureStore.fetchFeatures();

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
