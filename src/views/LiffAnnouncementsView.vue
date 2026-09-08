<template>
  <div class="space-y-5 pb-6 font-sans text-slate-800">
    <!-- Header -->
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-lg font-bold text-slate-900 tracking-tight">ข่าวสาร & ประกาศ</h1>
        <p class="text-xs text-slate-500 mt-0.5">ประกาศและข่าวสารสำคัญจากหอพัก</p>
      </div>

      <button
        @click="fetchAnnouncements"
        class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-50/80 hover:bg-amber-100 text-xs font-semibold text-amber-700 transition-colors cursor-pointer"
      >
        <RotateCw class="w-3.5 h-3.5" :class="{ 'animate-spin': loading }" />
        <span>รีเฟรช</span>
      </button>
    </div>

    <!-- Loading Skeleton State -->
    <div v-if="loading" class="space-y-3 animate-pulse">
      <div v-for="i in 2" :key="i" class="bg-white rounded-2xl border border-slate-100/90 shadow-xs overflow-hidden space-y-3">
        <div class="w-full h-36 bg-slate-100 skeleton-shimmer"></div>
        <div class="p-4 space-y-2">
          <div class="h-4 w-40 bg-slate-100 skeleton-shimmer rounded-md"></div>
          <div class="h-3 w-full bg-slate-100 skeleton-shimmer rounded-md"></div>
          <div class="h-3 w-2/3 bg-slate-100 skeleton-shimmer rounded-md"></div>
        </div>
      </div>
    </div>

    <!-- Announcement List Feed Cards -->
    <div v-else class="space-y-3.5">
      <div
        v-for="item in announcements"
        :key="item.id"
        @click="openDetail(item)"
        class="bg-white rounded-2xl border border-slate-100 shadow-xs overflow-hidden transition-all hover:border-emerald-200 hover:shadow-md cursor-pointer active:scale-[0.99] group"
      >
        <!-- Cover Banner Image -->
        <div v-if="item.imageUrl" class="w-full h-44 overflow-hidden bg-slate-100 relative">
          <img
            :src="item.imageUrl"
            :alt="item.title"
            class="w-full h-full object-cover group-hover:scale-102 transition-transform duration-300"
          />
          <div class="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent"></div>
        </div>

        <div class="p-4 sm:p-5 space-y-3">
          <div class="flex items-start justify-between gap-3">
            <div class="flex items-center gap-2 flex-wrap min-w-0">
              <span v-if="!isRead(item.id)" class="px-2 py-0.5 text-[9px] font-bold rounded-full bg-rose-500 text-white shrink-0 shadow-2xs animate-pulse">
                ใหม่
              </span>
              <h2 class="font-bold text-slate-800 text-sm sm:text-base leading-snug group-hover:text-emerald-700 transition-colors truncate">
                {{ item.title }}
              </h2>
            </div>
            <span class="text-[11px] text-slate-400 font-mono shrink-0 bg-slate-50 px-2 py-0.5 rounded-lg border border-slate-100">
              {{ formatDate(item.createdAt) }}
            </span>
          </div>

          <p class="text-xs text-slate-600 leading-relaxed line-clamp-2">
            {{ item.content }}
          </p>

          <div class="pt-2 flex items-center justify-between text-[11px] text-slate-400 font-medium border-t border-slate-100/80">
            <div class="flex items-center gap-2">
              <span class="inline-flex items-center gap-1 text-slate-500">
                <Building2 class="w-3 h-3 text-slate-400" />
                <span>{{ item.building?.name || 'ประกาศทั่วไป' }}</span>
              </span>
              <span class="text-slate-300">•</span>
              <span class="inline-flex items-center gap-1 text-slate-500">
                <User class="w-3 h-3 text-slate-400" />
                <span>{{ item.createdBy || 'ผู้ดูแลหอพัก' }}</span>
              </span>
            </div>

            <span class="text-emerald-600 font-semibold inline-flex items-center gap-1 text-[11px] group-hover:translate-x-0.5 transition-transform">
              <span>อ่านรายละเอียด</span>
              <ChevronRight class="w-3.5 h-3.5" />
            </span>
          </div>
        </div>
      </div>

      <!-- Empty State -->
      <div v-if="announcements.length === 0" class="p-10 bg-white rounded-2xl border border-slate-100/80 text-center space-y-2 shadow-xs">
        <div class="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto">
          <Megaphone class="w-6 h-6" />
        </div>
        <h3 class="text-sm font-bold text-slate-800">ยังไม่มีประกาศข่าวสาร</h3>
        <p class="text-xs text-slate-400">เมื่อมีข่าวสารใหม่จากหอพัก ข้อมูลจะปรากฏที่นี่ครับ</p>
      </div>
    </div>

    <!-- Announcement Detail Modal Popup -->
    <Teleport to="body">
      <div
        v-if="selectedAnnouncement"
        class="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-200"
        @click.self="closeDetail"
      >
        <div
          class="bg-white w-full sm:max-w-lg rounded-t-[2rem] sm:rounded-3xl shadow-2xl max-h-[90dvh] flex flex-col overflow-hidden animate-in slide-in-from-bottom-6 sm:zoom-in-95 duration-200"
        >
          <!-- Modal Top Header Bar -->
          <div class="shrink-0 px-5 py-4 border-b border-slate-100 flex items-center justify-between bg-white/95 backdrop-blur-md sticky top-0 z-10">
            <div class="flex items-center gap-2">
              <span class="px-2.5 py-0.5 text-[11px] font-bold rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200/80">
                {{ selectedAnnouncement.building?.name || 'ประกาศทั่วไป' }}
              </span>
              <span class="text-xs text-slate-400 font-mono">
                {{ formatDate(selectedAnnouncement.createdAt) }}
              </span>
            </div>

            <button
              @click="closeDetail"
              class="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center transition-colors cursor-pointer"
            >
              <X class="w-4 h-4" />
            </button>
          </div>

          <!-- Scrollable Modal Content -->
          <div class="flex-1 overflow-y-auto p-5 sm:p-6 space-y-4">
            <!-- Full Cover Image -->
            <div v-if="selectedAnnouncement.imageUrl" class="w-full rounded-2xl overflow-hidden bg-slate-100 border border-slate-100 shadow-xs">
              <img
                :src="selectedAnnouncement.imageUrl"
                :alt="selectedAnnouncement.title"
                class="w-full max-h-72 object-cover object-center"
              />
            </div>

            <!-- Title -->
            <h2 class="text-lg sm:text-xl font-bold text-slate-900 leading-snug">
              {{ selectedAnnouncement.title }}
            </h2>

            <!-- Author & Metadata Pill -->
            <div class="flex items-center gap-3 p-3 bg-slate-50/80 rounded-2xl border border-slate-100 text-xs text-slate-600">
              <div class="w-7 h-7 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                <User class="w-3.5 h-3.5" />
              </div>
              <div>
                <div class="text-[10px] text-slate-400">ผู้ประกาศ</div>
                <div class="font-semibold text-slate-800">{{ selectedAnnouncement.createdBy || 'ผู้ดูแลหอพัก' }}</div>
              </div>
            </div>

            <!-- Content Body -->
            <div class="prose prose-sm text-slate-700 leading-relaxed whitespace-pre-line text-sm pt-2 border-t border-slate-100">
              {{ selectedAnnouncement.content }}
            </div>
          </div>

          <!-- Modal Footer -->
          <div class="shrink-0 p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-end">
            <button
              @click="closeDetail"
              class="w-full sm:w-auto px-6 py-2.5 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-bold transition-all cursor-pointer shadow-xs"
            >
              ปิดหน้าต่าง
            </button>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { Megaphone, RotateCw, Building2, User, ChevronRight, X, Sparkles } from 'lucide-vue-next';
import { initLiff, isLiffLoggedIn, getLiffProfile } from '@/utils/liff';
import { useAnnouncements } from '@/composables/useAnnouncements';
import api from '@/utils/api';

const { markAsRead, isRead, checkUnread } = useAnnouncements();

const loading = ref(true);
const announcements = ref([]);
const lineUserId = ref('');
const selectedAnnouncement = ref(null);

const formatDate = (dateString) => {
  if (!dateString) return '';
  return new Date(dateString).toLocaleDateString('th-TH', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

const openDetail = (item) => {
  selectedAnnouncement.value = item;
  if (item?.id) {
    markAsRead(item.id);
  }
};

const closeDetail = () => {
  selectedAnnouncement.value = null;
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
    console.warn('LIFF init fallback mode:', err.message);
  }

  await fetchAnnouncements();
  if (lineUserId.value) {
    checkUnread(lineUserId.value);
  }
});

const fetchAnnouncements = async () => {
  loading.value = true;
  try {
    const params = {};
    if (lineUserId.value) params.lineUserId = lineUserId.value;

    const res = await api.get('/api/v1/liff/announcements', { params });
    announcements.value = res.data.data || [];
  } catch (error) {
    console.error('Failed to fetch LIFF announcements:', error);
  } finally {
    loading.value = false;
  }
};
</script>
