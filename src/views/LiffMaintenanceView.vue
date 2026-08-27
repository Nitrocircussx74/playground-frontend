<template>
  <div class="min-h-screen bg-slate-100 py-6 px-4 font-sans text-slate-900">
    <div class="max-w-md mx-auto space-y-5">
      <!-- Header -->
      <div class="text-center space-y-1">
        <h1 class="text-xl font-bold text-slate-900 tracking-tight">🛠️ ระบบแจ้งซ่อม & ติดตามสถานะ</h1>
        <p class="text-xs text-slate-500">แจ้งซ่อมสิ่งอำนวยความสะดวกและติดตามการแก้ไขของช่าง</p>
      </div>

      <!-- Navigation Tabs -->
      <div class="flex p-1 bg-slate-200/80 rounded-2xl">
        <button
          @click="activeTab = 'new'"
          class="flex-1 py-2 rounded-xl text-xs font-bold transition-all"
          :class="activeTab === 'new' ? 'bg-white text-indigo-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'"
        >
          + แจ้งซ่อมใหม่ (New)
        </button>
        <button
          @click="activeTab = 'tracking'"
          class="flex-1 py-2 rounded-xl text-xs font-bold transition-all"
          :class="activeTab === 'tracking' ? 'bg-white text-indigo-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'"
        >
          📋 ติดตามสถานะ (Tracking)
        </button>
      </div>

      <!-- Tab 1: New Maintenance Request Form -->
      <div v-if="activeTab === 'new'" class="p-6 bg-white rounded-3xl border border-slate-200 shadow-sm space-y-4">
        <form @submit.prevent="handleSubmit" class="space-y-4">
          <div>
            <label class="block text-xs font-bold text-slate-700 mb-1">หัวข้อเรื่องที่แจ้งซ่อม <span class="text-rose-500">*</span></label>
            <input
              v-model="form.title"
              type="text"
              placeholder="e.g. หลังคารั่ว, แอร์ไม่เย็น, ท่อน้ำตัน"
              required
              class="w-full bg-slate-50 border border-slate-300 rounded-2xl px-4 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
            />
          </div>

          <div>
            <label class="block text-xs font-bold text-slate-700 mb-1">รายละเอียดปัญหา <span class="text-rose-500">*</span></label>
            <textarea
              v-model="form.description"
              rows="3"
              placeholder="e.g. มีน้ำหยดลงมาตรงที่จอดรถมอเตอร์ไซค์บิ๊กไบค์"
              required
              class="w-full bg-slate-50 border border-slate-300 rounded-2xl p-3 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
            ></textarea>
          </div>

          <div>
            <label class="block text-xs font-bold text-slate-700 mb-1">แนบรูปถ่ายประกอบปัญหาสภาพจริง</label>
            <input
              type="file"
              accept="image/*"
              @change="handleFileChange"
              class="block w-full text-xs text-slate-500 file:mr-3 file:py-2 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
            />
          </div>

          <div v-if="previewUrl" class="text-center">
            <img :src="previewUrl" class="h-36 mx-auto object-cover rounded-2xl border border-slate-200 shadow-xs" />
          </div>

          <button
            type="submit"
            :disabled="submitting"
            class="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-bold text-sm transition-all shadow-md shadow-indigo-600/20 disabled:opacity-50"
          >
            {{ submitting ? 'กำลังบันทึกข้อมูล...' : 'ส่งรายการแจ้งซ่อม (Submit Request)' }}
          </button>
        </form>
      </div>

      <!-- Tab 2: Status Tracking Timeline List -->
      <div v-else class="space-y-4">
        <div v-if="loading" class="p-8 bg-white rounded-3xl text-center text-slate-500">
          <div class="animate-spin w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full mx-auto mb-3"></div>
          กำลังโหลดสถานะแจ้งซ่อม...
        </div>

        <div v-else class="space-y-3">
          <div
            v-for="item in requests"
            :key="item.id"
            class="p-5 bg-white rounded-3xl border border-slate-200 shadow-xs space-y-3"
          >
            <div class="flex items-center justify-between">
              <span class="font-bold text-slate-900 text-base">{{ item.title }}</span>
              <span
                class="text-xs font-bold px-2.5 py-1 rounded-full border"
                :class="{
                  'bg-amber-50 border-amber-300 text-amber-800': item.status === 'pending',
                  'bg-blue-50 border-blue-300 text-blue-800': item.status === 'in_progress',
                  'bg-emerald-50 border-emerald-300 text-emerald-800': item.status === 'resolved' || item.status === 'completed'
                }"
              >
                {{ formatStatus(item.status) }}
              </span>
            </div>

            <p class="text-xs text-slate-600 leading-relaxed">{{ item.description }}</p>

            <div v-if="item.imageUrl" class="py-1">
              <a :href="item.imageUrl" target="_blank">
                <img :src="item.imageUrl" class="h-28 rounded-xl object-cover border border-slate-200" />
              </a>
            </div>

            <!-- Admin Reply Note Box -->
            <div v-if="item.adminNote" class="p-3 bg-indigo-50/70 border border-indigo-100 rounded-2xl text-xs text-indigo-900 space-y-1">
              <div class="font-bold flex items-center gap-1">
                <span>💬 การตอบกลับจากแอดมิน/ช่าง:</span>
              </div>
              <p class="text-slate-700 leading-normal">{{ item.adminNote }}</p>
            </div>

            <div class="text-[10px] text-slate-400 font-mono text-right">
              {{ new Date(item.createdAt).toLocaleString('th-TH') }}
            </div>
          </div>

          <div v-if="requests.length === 0" class="p-8 bg-white rounded-3xl text-center text-slate-400 text-xs">
            ยังไม่มีประวัติการแจ้งซ่อมในระบบ
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, watch } from 'vue';
import api from '@/utils/api';
import { showSuccess, showError } from '@/utils/swal';

const activeTab = ref('new');
const loading = ref(false);
const submitting = ref(false);
const requests = ref([]);
const lineUserId = ref('');
const selectedFile = ref(null);
const previewUrl = ref('');

const form = reactive({
  title: 'หลังคารั่ว',
  description: 'มีน้ำหยดลงมาตรงที่จอดรถมอเตอร์ไซค์บิ๊กไบค์'
});

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

  fetchRequests();
});

watch(activeTab, (newTab) => {
  if (newTab === 'tracking') {
    fetchRequests();
  }
});

const fetchRequests = async () => {
  loading.value = true;
  try {
    const params = {};
    if (lineUserId.value) params.lineUserId = lineUserId.value;

    const res = await api.get('/api/v1/liff/maintenance', { params });
    requests.value = res.data.data;
  } catch (err) {
    console.error('Failed to fetch maintenance requests:', err);
  } finally {
    loading.value = false;
  }
};

const handleFileChange = (e) => {
  const file = e.target.files[0];
  if (!file) return;
  selectedFile.value = file;
  previewUrl.value = URL.createObjectURL(file);
};

const handleSubmit = async () => {
  submitting.value = true;
  try {
    const formData = new FormData();
    formData.append('title', form.title);
    formData.append('description', form.description);
    if (selectedFile.value) {
      formData.append('file', selectedFile.value);
    }
    if (lineUserId.value) {
      formData.append('lineUserId', lineUserId.value);
    }

    await api.post('/api/v1/liff/maintenance', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });

    await showSuccess('สำเร็จ!', 'บันทึกข้อมูลการแจ้งซ่อมเรียบร้อยแล้ว!');
    form.title = '';
    form.description = '';
    selectedFile.value = null;
    previewUrl.value = '';
    activeTab.value = 'tracking';
  } catch (err) {
    showError('เกิดข้อผิดพลาด', err.response?.data?.message || 'ไม่สามารถบันทึกข้อมูลการแจ้งซ่อมได้');
  } finally {
    submitting.value = false;
  }
};

const formatStatus = (status) => {
  const map = {
    pending: '⏳ รอดำเนินการ',
    in_progress: '🔧 กำลังดำเนินการซ่อม',
    resolved: '✅ ซ่อมเสร็จสิ้น',
    completed: '✅ ซ่อมเสร็จสิ้น'
  };
  return map[status] || status;
};
</script>
