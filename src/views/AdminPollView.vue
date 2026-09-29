<template>
  <div class="space-y-6 font-sans">
    <!-- Header Banner -->
    <div class="bg-gradient-to-r from-cyan-600 via-teal-600 to-slate-900 p-6 rounded-xl text-white shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
      <div>
        <div class="inline-flex items-center gap-2 mb-1.5">
          <Vote class="w-6 h-6 text-cyan-200" />
          <h1 class="text-2xl font-black tracking-tight text-white">โหวต & แบบสำรวจความเห็น (Polls)</h1>
        </div>
        <p class="text-xs text-cyan-100/80 mt-1 max-w-xl">สร้างโพลสอบถามความเห็นลูกบ้าน และดูผลโหวตแบบเรียลไทม์</p>
      </div>
      <Button variant="ghost" class="bg-white/15 hover:bg-white/25 border border-white/30 text-white shrink-0" @click="openCreateModal">
        <Plus class="w-4 h-4" />
        <span>สร้างโพลใหม่</span>
      </Button>
    </div>

    <div class="grid grid-cols-1 gap-4">
      <Card v-for="poll in polls" :key="poll.id" class="p-5 space-y-3">
        <div class="flex items-start justify-between gap-3">
          <div>
            <h3 class="font-bold text-slate-900 text-sm">{{ poll.question }}</h3>
            <div class="text-xs text-slate-400 mt-0.5">{{ poll._count?.votes || 0 }} โหวต</div>
          </div>
          <Badge :variant="poll.isActive ? 'success' : 'neutral'" class="shrink-0">
            {{ poll.isActive ? 'เปิดรับโหวต' : 'ปิดแล้ว' }}
          </Badge>
        </div>

        <div v-if="results[poll.id]" class="space-y-1.5">
          <div v-for="r in results[poll.id].results" :key="r.optionIndex" class="text-xs">
            <div class="flex items-center justify-between text-slate-600 mb-0.5">
              <span>{{ r.label }}</span>
              <span class="font-mono font-bold">{{ r.votes }}</span>
            </div>
            <div class="h-1.5 bg-slate-100 rounded-full overflow-hidden">
              <div
                class="h-full bg-cyan-500"
                :style="{ width: (results[poll.id].totalVotes ? (r.votes / results[poll.id].totalVotes) * 100 : 0) + '%' }"
              ></div>
            </div>
          </div>
        </div>

        <div class="pt-2 border-t border-slate-100 flex items-center gap-2">
          <Button variant="outline" size="sm" @click="fetchResults(poll.id)">
            <RotateCw class="w-3.5 h-3.5" />
            <span>ดูผลโหวต</span>
          </Button>
          <Button
            v-if="poll.isActive"
            variant="outline"
            size="sm"
            class="text-amber-700 border-amber-200 hover:bg-amber-50"
            @click="handleClosePoll(poll.id)"
          >
            <Lock class="w-3.5 h-3.5" />
            <span>ปิดรับโหวต</span>
          </Button>
          <Button
            variant="outline"
            size="sm"
            class="text-rose-700 border-rose-200 hover:bg-rose-50 ml-auto"
            @click="handleDeletePoll(poll.id)"
          >
            <Trash2 class="w-3.5 h-3.5" />
            <span>ลบ</span>
          </Button>
        </div>
      </Card>

      <Card v-if="polls.length === 0" class="p-10 text-center text-slate-400 text-xs">
        ยังไม่มีโพลในตึกนี้
      </Card>
    </div>

    <!-- Create Poll Modal -->
    <Dialog :open="showModal" @update:open="showModal = $event">
      <DialogContent class="max-w-md p-0 overflow-hidden">
        <div class="px-6 py-4 bg-gradient-to-r from-cyan-600 to-teal-600 text-white">
          <DialogHeader class="pr-6">
            <DialogTitle class="text-white">สร้างโพลใหม่</DialogTitle>
          </DialogHeader>
        </div>
        <form @submit.prevent="handleCreatePoll" class="p-6 space-y-4">
          <div>
            <label class="block text-xs font-bold text-slate-700 mb-1">คำถาม</label>
            <Input
              v-model="form.question"
              required
              type="text"
              placeholder="เช่น เห็นด้วยกับการปรับปรุงสระว่ายน้ำหรือไม่?"
              class="font-bold"
            />
          </div>
          <div>
            <label class="block text-xs font-bold text-slate-700 mb-1">ตัวเลือก (อย่างน้อย 2 ตัวเลือก)</label>
            <div v-for="(opt, idx) in form.options" :key="idx" class="flex items-center gap-2 mb-2">
              <Input v-model="form.options[idx]" type="text" required />
              <button v-if="form.options.length > 2" type="button" @click="form.options.splice(idx, 1)" class="text-rose-500 hover:text-rose-700 p-1 cursor-pointer">
                <X class="w-4 h-4" />
              </button>
            </div>
            <button type="button" @click="form.options.push('')" class="text-xs text-cyan-600 font-semibold hover:underline cursor-pointer flex items-center gap-1">
              <Plus class="w-3.5 h-3.5" />
              <span>เพิ่มตัวเลือก</span>
            </button>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" @click="showModal = false">ยกเลิก</Button>
            <Button type="submit" :disabled="submitting">
              <CheckCircle2 class="w-4 h-4" />
              <span>{{ submitting ? 'กำลังสร้าง...' : 'สร้างโพล' }}</span>
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, watch } from 'vue';
import { useBuildingStore } from '@/stores/useBuildingStore';
import { showSuccess, showError, showConfirm } from '@/utils/swal';
import api from '@/utils/api';
import { Vote, Plus, RotateCw, Lock, Trash2, X, CheckCircle2 } from 'lucide-vue-next';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';

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

const fetchPolls = async (buildingId) => {
  try {
    const res = await api.get(`/api/v1/buildings/${buildingId}/polls`);
    polls.value = res.data.data;
  } catch (err) {
    console.error(err);
  }
};

const fetchResults = async (pollId) => {
  try {
    const res = await api.get(`/api/v1/polls/${pollId}/results`);
    results.value[pollId] = res.data.data;
  } catch (err) {
    showError('ข้อผิดพลาด', 'ไม่สามารถดึงผลโหวตได้');
  }
};

const openCreateModal = () => {
  form.question = '';
  form.options = ['', ''];
  showModal.value = true;
};

const handleCreatePoll = async () => {
  const bId = buildingStore.activeBuildingId || buildingStore.buildings[0]?.id;
  if (!bId) {
    showError('ข้อผิดพลาด', 'กรุณาเลือกตึกก่อน');
    return;
  }
  const validOpts = form.options.filter(o => o.trim());
  if (validOpts.length < 2) {
    showError('ข้อผิดพลาด', 'ต้องมีอย่างน้อย 2 ตัวเลือก');
    return;
  }
  submitting.value = true;
  try {
    await api.post(`/api/v1/buildings/${bId}/polls`, {
      question: form.question,
      options: validOpts
    });
    showSuccess('สำเร็จ', 'สร้างโพลเรียบร้อยแล้ว');
    showModal.value = false;
    loadData();
  } catch (err) {
    showError('ข้อผิดพลาด', err.response?.data?.message || 'ไม่สามารถสร้างโพลได้');
  } finally {
    submitting.value = false;
  }
};

const handleClosePoll = async (pollId) => {
  const isConfirm = await showConfirm('ยืนยันปิดรับโหวต?', 'ลูกบ้านจะไม่สามารถโหวตโพลนี้ได้อีก');
  if (!isConfirm) return;
  try {
    await api.patch(`/api/v1/polls/${pollId}`, { isActive: false });
    showSuccess('สำเร็จ', 'ปิดรับโหวตแล้ว');
    loadData();
  } catch (err) {
    showError('ข้อผิดพลาด', 'ไม่สามารถปิดโพลได้');
  }
};

const handleDeletePoll = async (pollId) => {
  const isConfirm = await showConfirm('ยืนยันการลบ?', 'โพลและผลโหวตทั้งหมดจะถูกลบถาวร');
  if (!isConfirm) return;
  try {
    await api.delete(`/api/v1/polls/${pollId}`);
    showSuccess('สำเร็จ', 'ลบโพลเรียบร้อยแล้ว');
    loadData();
  } catch (err) {
    showError('ข้อผิดพลาด', 'ไม่สามารถลบโพลได้');
  }
};
</script>
