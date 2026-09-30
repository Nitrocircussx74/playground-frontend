<template>
  <div class="space-y-5 pb-6 font-sans text-slate-800">
    <!-- Feature Disabled State -->
    <Card v-if="!isFeatureEnabled" class="p-8 text-center space-y-3">
      <div class="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto">
        <Vote class="w-6 h-6" />
      </div>
      <h2 class="text-sm font-bold text-slate-800">ฟีเจอร์โหวตไม่พร้อมใช้งาน</h2>
      <p class="text-xs text-slate-500">ขออภัย ฟีเจอร์นี้ถูกปิดการใช้งานชั่วคราว</p>
    </Card>

    <template v-else>
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-lg font-bold text-slate-900 tracking-tight">โหวต/แบบสำรวจ</h1>
          <p class="text-xs text-slate-500 mt-0.5">ร่วมแสดงความเห็นในโพลของหอพัก</p>
        </div>
        <Button variant="ghost" size="sm" class="bg-primary/10 hover:bg-primary/20 text-primary" @click="fetchPolls">
          <RotateCw class="w-3.5 h-3.5" :class="{ 'animate-spin': loading }" />
          <span>รีเฟรช</span>
        </Button>
      </div>

      <div class="space-y-3">
        <Card v-for="poll in polls" :key="poll.id" class="p-4 space-y-3">
          <div class="font-bold text-slate-800 text-sm">{{ poll.question }}</div>

          <!-- ยังไม่ได้โหวต: แสดงตัวเลือกให้กด -->
          <div v-if="!poll.hasVoted" class="space-y-2">
            <button
              v-for="(opt, idx) in poll.options"
              :key="idx"
              @click="handleVote(poll.id, idx)"
              :disabled="votingPollId === poll.id"
              class="w-full text-left px-3.5 py-2.5 bg-slate-50 hover:bg-primary/10 hover:text-primary rounded-xl text-xs font-semibold text-slate-700 transition-colors disabled:opacity-50"
            >
              {{ opt }}
            </button>
          </div>

          <!-- โหวตแล้ว -->
          <div v-else class="p-3 bg-emerald-50 rounded-xl text-xs text-emerald-700 font-semibold flex items-center gap-2">
            <CheckCircle2 class="w-4 h-4 shrink-0" />
            <span>คุณโหวต "{{ poll.options[poll.myOptionIndex] }}" แล้ว ขอบคุณที่ร่วมแสดงความเห็น</span>
          </div>
        </Card>

        <Card v-if="!loading && polls.length === 0" class="p-10 text-center space-y-2">
          <p class="text-xs font-medium text-slate-500">ยังไม่มีโพลให้โหวตในตอนนี้</p>
        </Card>
      </div>
    </template>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { Vote, RotateCw, CheckCircle2 } from 'lucide-vue-next';
import { useFeatureStore } from '@/stores/useFeatureStore';
import { showError } from '@/utils/swal';
import api from '@/utils/api';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

const featureStore = useFeatureStore();
const loading = ref(true);
const votingPollId = ref(null);
const polls = ref([]);

const isFeatureEnabled = computed(() => featureStore.isEnabled('ENABLE_VOTING'));

onMounted(async () => {
  if (featureStore.features.length === 0) {
    await featureStore.fetchFeatures();
  }
  await fetchPolls();
});

const fetchPolls = async () => {
  loading.value = true;
  try {
    const res = await api.get('/api/v1/liff/polls');
    polls.value = res.data.data;
  } catch (error) {
    console.error('Failed to fetch polls:', error);
  } finally {
    loading.value = false;
  }
};

const handleVote = async (pollId, optionIndex) => {
  votingPollId.value = pollId;
  try {
    await api.post(`/api/v1/liff/polls/${pollId}/vote`, { optionIndex });
    await fetchPolls();
  } catch (error) {
    showError('เกิดข้อผิดพลาด', error.response?.data?.message || 'ไม่สามารถโหวตได้');
  } finally {
    votingPollId.value = null;
  }
};
</script>
