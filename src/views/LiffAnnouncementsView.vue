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
        class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-50/80 hover:bg-amber-100 text-xs font-semibold text-amber-700 transition-colors"
      >
        <RotateCw class="w-3.5 h-3.5" :class="{ 'animate-spin': loading }" />
        <span>รีเฟรช</span>
      </button>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="p-8 bg-white rounded-2xl border border-slate-100/80 text-center text-slate-400 text-xs shadow-xs">
      <div class="animate-spin w-6 h-6 border-2 border-amber-400 border-t-transparent rounded-full mx-auto mb-2.5"></div>
      <p class="text-xs">กำลังโหลดประกาศ...</p>
    </div>

    <!-- Announcement List Feed Cards -->
    <div v-else class="space-y-3">
      <div
        v-for="item in announcements"
        :key="item.id"
        class="bg-white rounded-2xl border border-slate-100/90 shadow-xs overflow-hidden transition-all hover:border-slate-200"
      >
        <!-- Cover Banner Image -->
        <div v-if="item.imageUrl" class="w-full h-40 overflow-hidden bg-slate-100">
          <img :src="item.imageUrl" class="w-full h-full object-cover" />
        </div>

        <div class="p-4 sm:p-5 space-y-2.5">
          <div class="flex items-start justify-between gap-3">
            <h2 class="font-bold text-slate-800 text-sm sm:text-base leading-snug">{{ item.title }}</h2>
            <span class="text-[11px] text-slate-400 font-mono shrink-0">
              {{ new Date(item.createdAt).toLocaleDateString('th-TH', { year: 'numeric', month: 'short', day: 'numeric' }) }}
            </span>
          </div>

          <p class="text-xs text-slate-600 whitespace-pre-line leading-relaxed pt-1 border-t border-slate-100">
            {{ item.content }}
          </p>

          <div class="pt-2 flex items-center justify-between text-[11px] text-slate-400 font-medium">
            <span class="inline-flex items-center gap-1 text-slate-500">
              <Building2 class="w-3 h-3 text-slate-400" />
              <span>{{ item.building?.name || 'ประกาศทั่วไป' }}</span>
            </span>
            <span class="inline-flex items-center gap-1 text-slate-500">
              <User class="w-3 h-3 text-slate-400" />
              <span>{{ item.createdBy || 'ผู้ดูแลหอพัก' }}</span>
            </span>
          </div>
        </div>
      </div>

      <!-- Empty State -->
      <div v-if="announcements.length === 0" class="p-10 bg-white rounded-2xl border border-slate-100/80 text-center space-y-2 shadow-xs">
        <div class="w-10 h-10 rounded-2xl bg-slate-50 text-slate-400 flex items-center justify-center mx-auto">
          <Megaphone class="w-5 h-5" />
        </div>
        <p class="text-xs font-medium text-slate-500">ยังไม่มีประกาศข่าวสารในขณะนี้</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { Megaphone, RotateCw, Building2, User } from 'lucide-vue-next';
import { initLiff, isLiffLoggedIn, getLiffProfile } from '@/utils/liff';
import api from '@/utils/api';

const loading = ref(true);
const announcements = ref([]);
const lineUserId = ref('');

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

  fetchAnnouncements();
});

const fetchAnnouncements = async () => {
  loading.value = true;
  try {
    const params = {};
    if (lineUserId.value) params.lineUserId = lineUserId.value;

    const res = await api.get('/api/v1/liff/announcements', { params });
    announcements.value = res.data.data;
  } catch (error) {
    console.error('Failed to fetch LIFF announcements:', error);
  } finally {
    loading.value = false;
  }
};
</script>
