<template>
  <div class="space-y-6">
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-bold text-slate-900 tracking-tight">Announcements & Broadcasts</h1>
        <p class="text-sm text-slate-500">Send LINE Flex Message announcements to tenants (All, Floor, or specific Room)</p>
      </div>

      <button
        @click="showCreateModal = !showCreateModal"
        class="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-sm font-semibold transition-all shadow-sm shadow-rose-600/20 flex items-center gap-1.5"
      >
        <span>{{ showCreateModal ? 'Cancel' : '📢 Broadcast New Announcement' }}</span>
      </button>
    </div>

    <!-- Create Announcement Form Panel -->
    <div v-if="showCreateModal" class="p-6 bg-white border border-slate-200 rounded-2xl shadow-sm space-y-4">
      <h2 class="text-lg font-semibold text-slate-900">Create & Broadcast Announcement (สร้างประกาศข่าวสาร)</h2>

      <form @submit.prevent="handleCreateAnnouncement" class="space-y-4">
        <div>
          <label class="block text-xs font-semibold text-slate-700 mb-1">Title (หัวข้อประกาศ)</label>
          <input
            v-model="form.title"
            type="text"
            placeholder="e.g. แจ้งปิดปรับปรุงระบบน้ำประปาชั่วคราว"
            required
            class="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500"
          />
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label class="block text-xs font-semibold text-slate-700 mb-1">Target Audience (กลุ่มเป้าหมาย)</label>
            <select
              v-model="form.targetType"
              class="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500"
            >
              <option value="all">🌐 ผู้เช่าทุกคนทั้งหมด (All Tenants)</option>
              <option value="floor">🏢 ระบุตามชั้น (By Floor)</option>
              <option value="room">🚪 ระบุตามห้อง (By Specific Room)</option>
            </select>
          </div>

          <!-- Floor Selector -->
          <div v-if="form.targetType === 'floor'">
            <label class="block text-xs font-semibold text-slate-700 mb-1">Select Floor (เลือกชั้น)</label>
            <select
              v-model="form.targetValue"
              required
              class="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500"
            >
              <option value="" disabled>-- Select Floor --</option>
              <option value="1">Floor 1 (ชั้น 1)</option>
              <option value="2">Floor 2 (ชั้น 2)</option>
              <option value="3">Floor 3 (ชั้น 3)</option>
              <option value="4">Floor 4 (ชั้น 4)</option>
              <option value="5">Floor 5 (ชั้น 5)</option>
            </select>
          </div>

          <!-- Room Selector -->
          <div v-if="form.targetType === 'room'">
            <label class="block text-xs font-semibold text-slate-700 mb-1">Select Room (เลือกห้อง)</label>
            <select
              v-model="form.targetValue"
              required
              class="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500"
            >
              <option value="" disabled>-- Select Room --</option>
              <option v-for="room in roomStore.rooms" :key="room.id" :value="room.id">
                Room {{ room.roomNumber }} (Floor {{ room.floor }})
              </option>
            </select>
          </div>
        </div>

        <div>
          <label class="block text-xs font-semibold text-slate-700 mb-1">Content Details (รายละเอียดประกาศ - ขึ้นบรรทัดใหม่ได้)</label>
          <textarea
            v-model="form.content"
            rows="4"
            placeholder="พิมพ์รายละเอียดประกาศข่าวสารที่ต้องการส่งหาลูกบ้าน..."
            required
            class="w-full bg-slate-50 border border-slate-300 rounded-xl p-3 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500"
          ></textarea>
        </div>

        <div class="flex justify-end pt-2">
          <button
            type="submit"
            :disabled="submitting"
            class="px-6 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-sm font-semibold transition-all shadow-sm shadow-rose-600/20 disabled:opacity-50 flex items-center gap-1.5"
          >
            <span>{{ submitting ? 'Broadcasting...' : '🚀 Send LINE Broadcast' }}</span>
          </button>
        </div>
      </form>
    </div>

    <!-- Announcement History List -->
    <div class="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
      <div class="p-4 border-b border-slate-200 flex items-center justify-between">
        <h3 class="font-semibold text-slate-900">Broadcast History</h3>
        <button @click="fetchAnnouncements" class="text-xs text-indigo-600 hover:underline font-semibold">Refresh History</button>
      </div>

      <div class="divide-y divide-slate-100">
        <div v-for="item in announcements" :key="item.id" class="p-5 hover:bg-slate-50/60 transition-colors space-y-2">
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-2">
              <span class="font-bold text-slate-900 text-base">{{ item.title }}</span>
              <span
                class="text-xs font-semibold px-2.5 py-0.5 rounded-full border"
                :class="{
                  'bg-blue-50 border-blue-200 text-blue-800': item.targetType === 'all',
                  'bg-amber-50 border-amber-200 text-amber-800': item.targetType === 'floor',
                  'bg-purple-50 border-purple-200 text-purple-800': item.targetType === 'room'
                }"
              >
                TARGET: {{ item.targetType.toUpperCase() }} {{ item.targetValue ? `(${item.targetValue})` : '' }}
              </span>
            </div>
            <span class="text-xs text-slate-400 font-mono">{{ new Date(item.createdAt).toLocaleString('th-TH') }}</span>
          </div>

          <p class="text-sm text-slate-600 whitespace-pre-line leading-relaxed">{{ item.content }}</p>

          <div class="text-xs text-slate-400 font-medium">Created by: {{ item.createdBy || 'Admin' }}</div>
        </div>

        <div v-if="announcements.length === 0" class="p-8 text-center text-slate-400">
          No announcements created yet.
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, watch } from 'vue';
import { useRoomStore } from '@/stores/useRoomStore';
import { useBuildingStore } from '@/stores/useBuildingStore';
import { showSuccess, showError } from '@/utils/swal';
import api from '@/utils/api';

const roomStore = useRoomStore();
const buildingStore = useBuildingStore();
const showCreateModal = ref(false);
const submitting = ref(false);
const announcements = ref([]);

const form = reactive({
  title: '',
  content: '',
  targetType: 'all',
  targetValue: ''
});

const loadData = () => {
  const bId = buildingStore.activeBuildingId;
  roomStore.fetchRooms(bId);
  fetchAnnouncements();
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

const fetchAnnouncements = async () => {
  try {
    const res = await api.get('/api/v1/announcements');
    announcements.value = res.data.data;
  } catch (error) {
    console.error('Failed to fetch announcements:', error);
  }
};

const handleCreateAnnouncement = async () => {
  submitting.value = true;
  try {
    const res = await api.post('/api/v1/announcements', { ...form });
    await showSuccess('สำเร็จ!', `บรอดแคสต์ประกาศข่าวสารเรียบร้อยแล้ว (ส่งถึงลูกบ้าน ${res.data.data.recipientCount} ราย)`);
    form.title = '';
    form.content = '';
    form.targetType = 'all';
    form.targetValue = '';
    showCreateModal.value = false;
    fetchAnnouncements();
  } catch (error) {
    showError('เกิดข้อผิดพลาด', error.response?.data?.message || 'Failed to send announcement');
  } finally {
    submitting.value = false;
  }
};
</script>
