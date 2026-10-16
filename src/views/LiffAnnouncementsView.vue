<template>
  <div class="space-y-5 pb-6 font-sans text-slate-800">
    <!-- Header -->
    <div class="flex items-center justify-between gap-2">
      <div>
        <div class="flex items-center gap-2">
          <h1 class="text-lg font-bold text-slate-900 tracking-tight">ข่าวสาร & ประกาศ</h1>
          <Badge v-if="unreadCount > 0" variant="danger" class="shrink-0 animate-pulse">
            {{ unreadCount }} ใหม่
          </Badge>
        </div>
        <p class="text-xs text-slate-500 mt-0.5">ประกาศและข่าวสารสำคัญจากหอพัก</p>
      </div>

      <div class="flex items-center gap-1.5 shrink-0">
        <!-- ปุ่มทำเครื่องหมายว่าอ่านทั้งหมด -->
        <Button v-if="unreadCount > 0" variant="outline" size="sm" class="text-primary border-primary/20 bg-primary/5 hover:bg-primary/10" title="ทำเครื่องหมายว่าอ่านทั้งหมด" @click="handleMarkAllAsRead">
          <CheckCheck class="w-3.5 h-3.5" />
          <span class="hidden sm:inline">อ่านทั้งหมด</span>
        </Button>

        <Button v-if="featureStore.isEnabled('ENABLE_ANNOUNCEMENTS')" variant="secondary" size="sm" @click="fetchAnnouncements">
          <RotateCw class="w-3.5 h-3.5" :class="{ 'animate-spin': loading }" />
          <span class="hidden sm:inline">รีเฟรช</span>
        </Button>
      </div>
    </div>

    <!-- Feature Disabled Notice (Admin ปิดใช้งานระบบประกาศข่าวสารไว้) -->
    <Card v-if="!featureStore.isEnabled('ENABLE_ANNOUNCEMENTS')" class="p-5 bg-amber-50 border-amber-200 text-amber-900 space-y-2 shadow-xs">
      <div class="flex items-center gap-2 font-bold text-xs">
        <AlertTriangle class="w-4 h-4 text-amber-600 shrink-0" />
        <span>ระบบข่าวสาร & ประกาศถูกปิดใช้งานชั่วคราว</span>
      </div>
      <p class="text-xs text-amber-700 leading-relaxed">
        ผู้ดูแลหอพักได้ปิดการแจ้งข่าวสารผ่านระบบออนไลน์ชั่วคราว ติดตามประกาศสำคัญได้ที่ป้ายประชาสัมพันธ์หรือติดต่อเจ้าหน้าที่โดยตรง
      </p>
    </Card>

    <template v-else>
      <!-- Loading Skeleton State -->
      <div v-if="loading" class="space-y-3 animate-pulse">
        <Card v-for="i in 2" :key="i" class="overflow-hidden space-y-3">
          <div class="w-full h-36 bg-slate-100 skeleton-shimmer"></div>
          <div class="p-4 space-y-2">
            <div class="h-4 w-40 bg-slate-100 skeleton-shimmer rounded-md"></div>
            <div class="h-3 w-full bg-slate-100 skeleton-shimmer rounded-md"></div>
            <div class="h-3 w-2/3 bg-slate-100 skeleton-shimmer rounded-md"></div>
          </div>
        </Card>
      </div>

      <!-- Announcement List Feed Cards -->
      <div v-else class="space-y-3.5">
        <Card
          v-for="item in announcements"
          :key="item.id"
          @click="openDetail(item)"
          class="p-0 overflow-hidden transition-all hover:shadow-md cursor-pointer active:scale-[0.99] group"
          :class="!isRead(item.id) ? 'bg-white border-primary/30 ring-1 ring-primary/10' : 'bg-slate-50/70 border-slate-200/70 hover:bg-white'"
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
                <!-- สถานะ: ยังไม่อ่าน (ใหม่) vs อ่านแล้ว -->
                <Badge v-if="!isRead(item.id)" variant="danger" class="shrink-0 animate-pulse">
                  <Sparkles class="w-2.5 h-2.5" />
                  <span>ใหม่</span>
                </Badge>
                <Badge v-else variant="neutral" class="shrink-0">
                  <Check class="w-2.5 h-2.5 text-emerald-600 stroke-[2.5]" />
                  <span>อ่านแล้ว</span>
                </Badge>

                <h2
                  class="font-bold text-sm sm:text-base leading-snug transition-colors truncate"
                  :class="!isRead(item.id) ? 'text-slate-900 group-hover:text-primary' : 'text-slate-600 group-hover:text-slate-800'"
                >
                  {{ item.title }}
                </h2>
              </div>
              <span class="text-xs text-slate-400 font-mono shrink-0 bg-white/80 px-2 py-0.5 rounded-lg border border-slate-100">
                {{ formatDate(item.createdAt) }}
              </span>
            </div>

            <p
              class="text-xs leading-relaxed line-clamp-2"
              :class="!isRead(item.id) ? 'text-slate-700 font-normal' : 'text-slate-500'"
            >
              {{ item.content }}
            </p>

            <div class="pt-2 flex items-center justify-between text-xs text-slate-400 font-medium border-t border-slate-100">
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

              <span
                class="font-semibold inline-flex items-center gap-1 text-xs group-hover:translate-x-0.5 transition-transform"
                :class="!isRead(item.id) ? 'text-primary' : 'text-slate-500'"
              >
                <span>อ่านรายละเอียด</span>
                <ChevronRight class="w-3.5 h-3.5" />
              </span>
            </div>
          </div>
        </Card>

        <!-- Empty State -->
        <Card v-if="announcements.length === 0" class="p-10 text-center space-y-2">
          <div class="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center mx-auto">
            <Megaphone class="w-6 h-6" />
          </div>
          <h3 class="text-sm font-bold text-slate-800">ยังไม่มีประกาศข่าวสาร</h3>
          <p class="text-xs text-slate-400">เมื่อมีข่าวสารใหม่จากหอพัก ข้อมูลจะปรากฏที่นี่ครับ</p>
        </Card>
      </div>
    </template>

    <!-- Announcement Detail Modal Popup -->
    <Teleport to="body">
      <div
        v-if="selectedAnnouncement"
        class="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-200"
        @click.self="closeDetail"
      >
        <div
          class="bg-white w-full sm:max-w-lg rounded-t-[2rem] sm:rounded-xl shadow-2xl max-h-[90dvh] flex flex-col overflow-hidden animate-in slide-in-from-bottom-6 sm:zoom-in-95 duration-200"
        >
          <!-- Modal Top Header Bar -->
          <div class="shrink-0 px-5 py-4 border-b border-slate-100 flex items-center justify-between bg-white/95 backdrop-blur-md sticky top-0 z-10">
            <div class="flex items-center gap-2">
              <Badge variant="neutral" class="bg-primary/10 text-primary border border-primary/20">
                {{ selectedAnnouncement.building?.name || 'ประกาศทั่วไป' }}
              </Badge>
              <span class="text-xs text-slate-400 font-mono">
                {{ formatDate(selectedAnnouncement.createdAt) }}
              </span>
            </div>

            <Button variant="ghost" size="icon" class="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600" @click="closeDetail">
              <X class="w-4 h-4" />
            </Button>
          </div>

          <!-- Scrollable Modal Content -->
          <div class="flex-1 overflow-y-auto p-5 sm:p-6 space-y-4">
            <!-- Full Cover Image -->
            <div v-if="selectedAnnouncement.imageUrl" class="w-full rounded-xl overflow-hidden bg-slate-100 border border-slate-100 shadow-xs">
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

            <!-- Author & Read Receipt Pill -->
            <div class="flex items-center justify-between gap-3 p-3 bg-slate-50/80 rounded-xl border border-slate-100 text-xs text-slate-600">
              <div class="flex items-center gap-2.5">
                <div class="w-7 h-7 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                  <User class="w-3.5 h-3.5" />
                </div>
                <div>
                  <div class="text-xs text-slate-400">ผู้ประกาศ</div>
                  <div class="font-semibold text-slate-800">{{ selectedAnnouncement.createdBy || 'ผู้ดูแลหอพัก' }}</div>
                </div>
              </div>

              <!-- Read Status Badge -->
              <Badge variant="success">
                <Check class="w-3 h-3 stroke-[2.5]" />
                <span>บันทึกว่าอ่านแล้ว</span>
              </Badge>
            </div>

            <!-- Content Body -->
            <div class="prose prose-sm text-slate-700 leading-relaxed whitespace-pre-line text-sm pt-2 border-t border-slate-100">
              {{ selectedAnnouncement.content }}
            </div>
          </div>

          <!-- Modal Footer -->
          <div class="shrink-0 p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-end">
            <Button class="w-full sm:w-auto bg-slate-800 hover:bg-slate-900" @click="closeDetail">
              ปิดหน้าต่าง
            </Button>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { Megaphone, RotateCw, Building2, User, ChevronRight, X, Sparkles, Check, CheckCheck, AlertTriangle } from 'lucide-vue-next';
import { initLiff, isLiffLoggedIn, getLiffProfile } from '@/utils/liff';
import { useAnnouncements } from '@/composables/useAnnouncements';
import { useFeatureStore } from '@/stores/useFeatureStore';
import api from '@/utils/api';
import { formatShortDate as formatDate } from '@/utils/formatters';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

const { markAsRead, markAllAsRead, isRead, checkUnread, unreadCount } = useAnnouncements();
const featureStore = useFeatureStore();

const loading = ref(true);
const announcements = ref([]);
const lineUserId = ref('');
const selectedAnnouncement = ref(null);

const openDetail = (item) => {
  selectedAnnouncement.value = item;
  if (item?.id) {
    markAsRead(item.id, lineUserId.value);
  }
};

const handleMarkAllAsRead = async () => {
  await markAllAsRead(announcements.value.map((a) => a.id), lineUserId.value);
};

const closeDetail = () => {
  selectedAnnouncement.value = null;
};

onMounted(async () => {
  await featureStore.fetchFeatures();
  loading.value = false;

  if (!featureStore.isEnabled('ENABLE_ANNOUNCEMENTS')) return;
  loading.value = true;

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
