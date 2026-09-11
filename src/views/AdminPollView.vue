<template>
  <div class="space-y-6 font-sans">
    <!-- Header Banner -->
    <div class="bg-gradient-to-r from-violet-600 via-purple-600 to-slate-900 p-6 rounded-3xl text-white shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
      <div>
        <h1 class="text-2xl font-black tracking-tight text-white">🗳️ โหวต & แบบสำรวจความเห็น (Polls)</h1>
        <p class="text-xs text-violet-100/80 mt-1 max-w-xl">สร้างโพลสอบถามความเห็นลูกบ้าน และดูผลโหวตแบบเรียลไทม์</p>
      </div>
      <button
        @click="openCreateModal"
        class="px-5 py-2.5 bg-white/15 hover:bg-white/25 border border-white/30 text-white rounded-xl text-xs sm:text-sm font-bold transition-all shrink-0 cursor-pointer"
      >
        ➕ สร้างโพลใหม่
      </button>
    </div>

    <div class="grid grid-cols-1 gap-4">
      <div v-for="poll in polls" :key="poll.id" class="bg-white border border-slate-200 rounded-3xl shadow-xs p-5 space-y-3">
        <div class="flex items-start justify-between gap-3">
          <div>
            <h3 class="font-bold text-slate-900 text-sm">{{ poll.question }}</h3>
            <div class="text-xs text-slate-400 mt-0.5">{{ poll._count?.votes || 0 }} โหวต</div>
          </div>
          <span
            class="text-[11px] font-extrabold px-2.5 py-1 rounded-full border shrink-0"
            :class="poll.isActive ? 'bg-emerald-100 border-emerald-300 text-emerald-800' : 'bg-slate-100 border-slate-300 text-slate-500'"
          >
            {{ poll.isActive ? 'เปิดรับโหวต' : 'ปิดแล้ว' }}
          </span>
        </div>

        <div v-if="results[poll.id]" class="space-y-1.5">
          <div v-for="r in results[poll.id].results" :key="r.optionIndex" class="text-xs">
            <div class="flex items-center justify-between text-slate-600 mb-0.5">
              <span>{{ r.label }}</span>
              <span class="font-mono font-bold">{{ r.votes }}</span>
            </div>
            <div class="h-1.5 bg-slate-100 rounded-full overflow-hidden">
              <div
                class="h-full bg-violet-500"
                :style="{ width: (results[poll.id].totalVotes ? (r.votes / results[poll.id].totalVotes) * 100 : 0) + '%' }"
              ></div>
            </div>
          </div>
        </div>

        <div class="pt-2 border-t border-slate-100 flex items-center gap-2">
          <button @click="fetchResults(poll.id)" class="px-3 py-1.5 bg-slate-50 hover:bg-slate-100 text-slate-700 rounded-xl text-xs font-semibold border border-slate-200 cursor-pointer">
            🔄 ดูผลโหวต
          </button>
          <button
            v-if="poll.isActive"
            @click="handleClosePoll(poll.id)"
            class="px-3 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-700 rounded-xl text-xs font-semibold border border-amber-200 cursor-pointer"
          >
            ปิดรับโหวต
          </button>
          <button
            @click="handleDeletePoll(poll.id)"
            class="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-xl text-xs font-semibold border border-rose-200 cursor-pointer ml-auto"
          >
            🗑️ ลบ
          </button>
        </div>
      </div>

      <div v-if="polls.length === 0" class="p-10 bg-white rounded-3xl border border-slate-200 text-center text-slate-400 text-xs">
        ยังไม่มีโพลในตึกนี้
      </div>
    </div>

    <!-- Create Poll Modal -->
    <div v-if="showModal" class="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div class="bg-white rounded-3xl border border-slate-200 shadow-2xl w-full max-w-md overflow-hidden">
        <div class="px-6 py-4 bg-gradient-to-r from-violet-600 to-purple-600 text-white flex items-center justify-between">
          <h3 class="font-bold text-base text-white">สร้างโพลใหม่</h3>
          <button @click="showModal = false" class="text-violet-100 hover:text-white p-1 rounded-lg cursor-pointer">✕</button>
        </div>
        <form @submit.prevent="handleCreatePoll" class="p-6 space-y-4">
          <div>
            <label class="block text-xs font-bold text-slate-700 mb-1">คำถาม</label>
            <input
              v-model="form.question"
              required
              type="text"
              placeholder="เช่น เห็นด้วยกับการปรับปรุงสระว่ายน้ำหรือไม่?"
              class="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500"
            />
          </div>
          <div>
            <label class="block text-xs font-bold text-slate-700 mb-1">ตัวเลือก (อย่างน้อย 2 ตัวเลือก)</label>
            <div v-for="(opt, idx) in form.options" :key="idx" class="flex items-center gap-2 mb-2">
              <input
                v-model="form.options[idx]"
                type="text"
                required
                class="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2 text-xs"
              />
              <button v-if="form.options.length > 2" type="button" @click="form.options.splice(idx, 1)" class="text-rose-500 text-xs shrink-0">✕</button>
            </div>
            <button type="button" @click="form.options.push('')" class="text-xs text-violet-600 font-semibold hover:underline">
              + เพิ่มตัวเลือก
            </button>
          </div>
          <div class="pt-3 flex gap-3">
            <button type="button" @click="showModal = false" class="w-1/2 py-2.5 border border-slate-300 text-slate-700 hover:bg-slate-100 rounded-xl text-xs font-bold cursor-pointer">
              ยกเลิก
            </button>
            <button type="submit" :disabled="submitting" class="w-1/2 py-2.5 bg-violet-600 hover:bg-violet-700 text-white rounded-xl text-xs font-bold disabled:opacity-50 cursor-pointer">
              {{ submitting ? 'กำลังสร้าง...' : '✅ สร้างโพล' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, watch } from 'vue';
import { useBuildingStore } from '@/stores/useBuildingStore';
import { showSuccess, showError, showConfirm } from '@/utils/swal';
import api from '@/utils/api';

const buildingStore = useBuildingStore();

const polls = ref([]);
const results = ref({});
const showModal = ref(false);
const submitting = ref(false);
const form = reactive({ question: '', options: ['', ''] });

const loadData = () => {
  const bId = buildingStore.activeBuildingId || buildingStore.buildings[0]?.id;
  if (!bId) return;
  fetchPolls(bId);
};

onMounted(loadData);
watch(() => buildingStore.activeBuildingId, loadData);

const fetchPolls = async (bId) => {
  try {
    const res = await api.get(`/api/admin/buildings/${bId}/polls`);
    polls.value = res.data.data;
  } catch (error) {
    console.error('Failed to fetch polls:', error);
  }
};

const fetchResults = async (pollId) => {
  try {
    const res = await api.get(`/api/admin/polls/${pollId}/results`);
    results.value = { ...results.value, [pollId]: res.data.data };
  } catch (error) {
    showError('เกิดข้อผิดพลาด', error.response?.data?.message || 'ไม่สามารถดึงผลโหวตได้');
  }
};

const openCreateModal = () => {
  form.question = '';
  form.options = ['', ''];
  showModal.value = true;
};

const handleCreatePoll = async () => {
  submitting.value = true;
  try {
    const bId = buildingStore.activeBuildingId || buildingStore.buildings[0]?.id;
    const res = await api.post(`/api/admin/buildings/${bId}/polls`, {
      question: form.question,
      options: form.options.filter((o) => o.trim())
    });
    await showSuccess('สำเร็จ!', res.data.message);
    showModal.value = false;
    loadData();
  } catch (error) {
    showError('เกิดข้อผิดพลาด', error.response?.data?.message || 'ไม่สามารถสร้างโพลได้');
  } finally {
    submitting.value = false;
  }
};

const handleClosePoll = async (id) => {
  try {
    await api.patch(`/api/admin/polls/${id}`, { isActive: false });
    loadData();
  } catch (error) {
    showError('เกิดข้อผิดพลาด', error.response?.data?.message || 'ไม่สามารถปิดโพลได้');
  }
};

const handleDeletePoll = async (id) => {
  const confirmed = await showConfirm('ยืนยันลบ', 'ต้องการลบโพลนี้ใช่หรือไม่?');
  if (!confirmed) return;
  try {
    await api.delete(`/api/admin/polls/${id}`);
    loadData();
  } catch (error) {
    showError('เกิดข้อผิดพลาด', error.response?.data?.message || 'ไม่สามารถลบได้');
  }
};
</script>
