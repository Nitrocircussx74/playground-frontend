<template>
  <div class="min-h-screen bg-slate-100 py-6 px-4 font-sans text-slate-900">
    <div class="max-w-md mx-auto space-y-5">
      <!-- Header -->
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-xl font-bold text-slate-900 tracking-tight">📢 ข่าวสาร & ประกาศหอพัก</h1>
          <p class="text-xs text-slate-500">รวมประกาศข่าวสารย้อนหลังทั้งหมดสำหรับคุณ</p>
        </div>

        <button @click="fetchAnnouncements" class="text-xs text-rose-600 font-semibold hover:underline cursor-pointer">
          🔄 รีเฟรช
        </button>
      </div>

      <!-- Loading State -->
      <div v-if="loading" class="p-8 bg-white rounded-3xl shadow-sm text-center text-slate-500">
        <div class="animate-spin w-8 h-8 border-4 border-rose-600 border-t-transparent rounded-full mx-auto mb-3"></div>
        <p class="text-xs font-semibold">กำลังโหลดประกาศ...</p>
      </div>

      <!-- Announcement List Feed Cards -->
      <div v-else class="space-y-4">
        <div
          v-for="item in announcements"
          :key="item.id"
          class="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden relative"
        >
          <!-- Cover Banner Image -->
          <div v-if="item.imageUrl" class="w-full h-44 overflow-hidden bg-slate-100">
            <img :src="item.imageUrl" class="w-full h-full object-cover" />
          </div>

          <div class="p-5 space-y-2 relative">
            <div class="w-1.5 h-full bg-rose-500 absolute left-0 top-0"></div>

            <div class="flex items-start justify-between gap-2 pl-2">
              <h2 class="font-bold text-slate-900 text-base leading-snug">{{ item.title }}</h2>
              <span class="text-[10px] text-slate-400 font-mono shrink-0">
                {{ new Date(item.createdAt).toLocaleDateString('th-TH') }}
              </span>
            </div>

            <p class="text-xs text-slate-600 whitespace-pre-line leading-relaxed pl-2 pt-1 border-t border-slate-100">
              {{ item.content }}
            </p>

            <div class="pl-2 pt-2 flex items-center justify-between text-[10px] text-slate-400 font-medium">
              <span>📍 {{ item.building?.name || 'ประกาศทั่วไป' }}</span>
              <span>👤 {{ item.createdBy || 'Dorm Admin' }}</span>
            </div>
          </div>
        </div>

        <div v-if="announcements.length === 0" class="p-10 bg-white rounded-3xl text-center text-slate-400 text-xs">
          ยังไม่มีประกาศข่าวสารในขณะนี้
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import liff from '@line/liff';
import api from '@/utils/api';

const loading = ref(true);
const announcements = ref([]);
const lineUserId = ref('');

onMounted(async () => {
  const liffId = import.meta.env.VITE_LINE_LIFF_ID || '2000000000-mockliffid';
  try {
    await liff.init({ liffId });
    if (liff.isLoggedIn()) {
      const profile = await liff.getProfile();
      lineUserId.value = profile.userId;
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
