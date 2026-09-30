<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
      <div>
        <h1 class="text-lg font-bold text-slate-900 tracking-tight flex items-center gap-2">
          <Megaphone class="w-5 h-5 text-primary" />
          <span>ประกาศข่าวสาร</span>
        </h1>
        <p class="text-xs text-slate-500 mt-0.5">ส่งข้อความแจ้งลูกบ้านผ่าน LINE ตามกลุ่มเป้าหมายที่เลือก</p>
      </div>

      <Button @click="showCreateModal = !showCreateModal">
        <component :is="showCreateModal ? X : Plus" class="w-4 h-4" />
        <span>{{ showCreateModal ? 'ปิดฟอร์ม' : 'สร้างประกาศใหม่' }}</span>
      </Button>
    </div>

    <!-- Create Announcement Form Panel -->
    <Card v-if="showCreateModal" class="p-5 sm:p-6 space-y-5">
      <div class="flex items-center justify-between border-b border-slate-100 pb-3">
        <h2 class="text-sm font-bold text-slate-900 flex items-center gap-2">
          <Smartphone class="w-4 h-4 text-slate-400" />
          <span>เขียนประกาศและเลือกกลุ่มเป้าหมาย</span>
        </h2>
      </div>

      <form @submit.prevent="handleConfirmAndSend" class="space-y-4">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <!-- Title -->
          <div class="md:col-span-2">
            <label class="block text-xs font-bold text-slate-700 mb-1">หัวข้อประกาศ</label>
            <Input v-model="form.title" type="text" placeholder="เช่น แจ้งปิดปรับปรุงระบบน้ำประปาชั่วคราว หรือ แจ้งกำหนดชำระค่าเช่าประจำเดือน" required class="font-semibold" />
          </div>

          <!-- Target Type Selector -->
          <div>
            <label class="block text-xs font-bold text-slate-700 mb-1">กลุ่มเป้าหมาย</label>
            <Select v-model="form.targetType" class="font-bold" @change="handleTargetTypeChange">
              <option value="ALL">ลูกบ้านทุกตึกทั้งหมด</option>
              <option value="BUILDING">เฉพาะตึกที่ระบุ</option>
              <option value="FLOOR">เฉพาะชั้นที่ระบุ</option>
            </Select>
          </div>

          <!-- Dynamic Building Selector -->
          <div v-if="form.targetType === 'BUILDING' || form.targetType === 'FLOOR'">
            <label class="block text-xs font-bold text-slate-700 mb-1">เลือกหอพัก/อาคาร</label>
            <Select v-model="form.buildingId" required class="font-bold">
              <option value="" disabled>-- เลือกหอพัก --</option>
              <option v-for="b in buildingStore.buildings" :key="b.id" :value="b.id">
                {{ b.name }}
              </option>
            </Select>
          </div>

          <!-- Dynamic Floor Selector -->
          <div v-if="form.targetType === 'FLOOR'">
            <label class="block text-xs font-bold text-slate-700 mb-1">เลือกชั้น</label>
            <Select v-model="form.floor" required class="font-bold">
              <option value="" disabled>-- เลือกชั้น --</option>
              <option v-for="f in 10" :key="f" :value="f">ชั้น {{ f }}</option>
            </Select>
          </div>
        </div>

        <!-- Recipient Reach Preview: บอกจำนวนคนที่จะได้รับข้อความก่อนกดส่งจริง -->
        <div class="flex items-center gap-2">
          <Badge v-if="loadingRecipientCount" variant="neutral">
            <RotateCw class="w-3 h-3 animate-spin" />
            <span>กำลังนับจำนวนผู้รับ...</span>
          </Badge>
          <Badge v-else-if="recipientCount === 0" variant="warning">
            <Users class="w-3 h-3" />
            <span>ยังไม่มีลูกบ้านในกลุ่มเป้าหมายนี้</span>
          </Badge>
          <Badge v-else variant="success">
            <Users class="w-3 h-3" />
            <span>จะส่งถึงลูกบ้าน {{ recipientCount }} คน</span>
          </Badge>
        </div>

        <!-- Optional Image Upload -->
        <div>
          <label class="block text-xs font-bold text-slate-700 mb-1">รูปภาพประกอบ (ไม่บังคับ)</label>
          <div class="flex items-center gap-3">
            <input
              type="file"
              accept="image/*"
              @change="handleImageUpload"
              class="text-xs text-slate-500 file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-slate-100 file:text-slate-700 hover:file:bg-slate-200 cursor-pointer"
            />
            <div v-if="uploadingImage" class="text-xs text-slate-500 font-semibold animate-pulse">กำลังอัปโหลดรูปภาพ...</div>
          </div>

          <!-- Image Preview -->
          <div v-if="form.imageUrl" class="mt-2 relative inline-block">
            <img :src="form.imageUrl" class="h-28 rounded-xl object-cover border border-slate-200 shadow-xs" />
            <button
              type="button"
              @click="form.imageUrl = ''"
              class="absolute -top-2 -right-2 bg-slate-900 text-white rounded-full w-6 h-6 text-xs flex items-center justify-center font-bold shadow-md hover:bg-slate-700"
            >
              <X class="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        <!-- Content Details -->
        <div>
          <label class="block text-xs font-bold text-slate-700 mb-1">เนื้อหาประกาศ</label>
          <textarea
            v-model="form.content"
            rows="4"
            placeholder="พิมพ์รายละเอียดประกาศข่าวสารที่ต้องการส่งหาลูกบ้านทาง LINE..."
            required
            class="w-full bg-slate-50 border border-slate-300 rounded-xl p-3.5 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-ring/30 focus:border-ring"
          ></textarea>
        </div>

        <!-- Submit Button -->
        <div class="flex justify-end pt-2">
          <Button type="submit" size="lg" :disabled="submitting || uploadingImage">
            <Send class="w-4 h-4" />
            <span>{{ submitting ? 'กำลังส่ง...' : 'ตรวจสอบและส่ง' }}</span>
          </Button>
        </div>
      </form>
    </Card>

    <!-- Announcement History List -->
    <Card class="p-0 overflow-hidden">
      <div class="p-5 border-b border-slate-200 flex items-center justify-between">
        <div>
          <h3 class="font-bold text-slate-900 text-sm">ประวัติการส่งประกาศ</h3>
          <p class="text-xs text-slate-400">รายการข่าวสารที่เคยส่งไปหาลูกบ้านย้อนหลัง</p>
        </div>
        <Button variant="link" size="sm" class="h-auto p-0" @click="fetchAnnouncements">
          <RotateCw class="w-3.5 h-3.5" />
          <span>รีเฟรช</span>
        </Button>
      </div>

      <div v-if="announcements.length > 0" class="px-5 pt-4">
        <Tabs v-model="historyFilter">
          <TabsList>
            <TabsTrigger value="all">ทั้งหมด ({{ announcements.length }})</TabsTrigger>
            <TabsTrigger value="ALL">ทุกตึก ({{ countByTargetType('ALL') }})</TabsTrigger>
            <TabsTrigger value="BUILDING">เฉพาะตึก ({{ countByTargetType('BUILDING') }})</TabsTrigger>
            <TabsTrigger value="FLOOR">เฉพาะชั้น ({{ countByTargetType('FLOOR') }})</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <div class="divide-y divide-slate-100">
        <div v-for="item in filteredAnnouncements" :key="item.id" class="p-5 hover:bg-slate-50/60 transition-colors space-y-3">
          <div class="flex flex-col md:flex-row md:items-center justify-between gap-2">
            <div class="flex items-center gap-2.5 flex-wrap">
              <span class="font-bold text-slate-900 text-base">{{ item.title }}</span>
              <Badge :variant="targetBadgeVariant(item.targetType)" class="font-bold">
                <Globe v-if="isTargetType(item, 'ALL')" class="w-3.5 h-3.5" />
                <Layers v-else-if="isTargetType(item, 'FLOOR')" class="w-3.5 h-3.5" />
                <Building2 v-else class="w-3.5 h-3.5" />
                <span>{{ targetLabel(item) }}</span>
              </Badge>
            </div>

            <div class="flex items-center gap-3">
              <span class="text-xs text-slate-400 font-mono">{{ formatDateTime(item.createdAt) }}</span>
              <Button variant="outline" size="sm" class="text-rose-700 border-rose-200 hover:bg-rose-50" @click="handleDeleteAnnouncement(item.id, item.title)">
                <Trash2 class="w-3.5 h-3.5" />
                <span>ลบ</span>
              </Button>
            </div>
          </div>

          <!-- Cover Image Thumbnail -->
          <div v-if="item.imageUrl" class="max-w-md">
            <img :src="item.imageUrl" class="h-36 rounded-xl object-cover border border-slate-200 shadow-2xs" />
          </div>

          <p class="text-xs text-slate-600 whitespace-pre-line leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-100">{{ item.content }}</p>

          <div class="text-xs text-slate-400 font-medium flex items-center gap-1.5">
            <User class="w-3.5 h-3.5 text-slate-400" />
            <span>ผู้ส่ง: {{ item.createdBy || 'Admin' }}</span>
          </div>
        </div>

        <div v-if="announcements.length === 0" class="p-12 text-center text-slate-400 text-xs">
          ยังไม่มีประวัติการส่งประกาศข่าวสารในระบบ
        </div>
        <div v-else-if="filteredAnnouncements.length === 0" class="p-12 text-center text-slate-400 text-xs">
          ไม่มีประกาศในกลุ่มนี้
        </div>
      </div>
    </Card>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, watch } from 'vue';
import {
  Megaphone,
  Plus,
  X,
  Smartphone,
  Send,
  RotateCw,
  Trash2,
  User,
  Users,
  Globe,
  Building2,
  Layers
} from 'lucide-vue-next';
import { useBuildingStore } from '@/stores/useBuildingStore';
import uploadService from '@/services/uploadService';
import { showSuccess, showError, showConfirm } from '@/utils/swal';
import { formatDateTime } from '@/utils/formatters';
import api from '@/utils/api';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';

const buildingStore = useBuildingStore();
const showCreateModal = ref(false);
const submitting = ref(false);
const uploadingImage = ref(false);
const announcements = ref([]);
const historyFilter = ref('all');

const form = reactive({
  title: '',
  content: '',
  imageUrl: '',
  targetType: 'ALL',
  buildingId: '',
  floor: 1
});

const recipientCount = ref(0);
const loadingRecipientCount = ref(false);
let recipientCountTimer = null;

const fetchRecipientCount = async () => {
  if (form.targetType !== 'ALL' && !form.buildingId) return;

  loadingRecipientCount.value = true;
  try {
    const res = await api.get('/api/admin/broadcasts/recipients-count', {
      params: { targetType: form.targetType, buildingId: form.buildingId, floor: form.floor }
    });
    recipientCount.value = res.data.recipientCount || 0;
  } catch {
    // เงียบไว้: แค่ preview ก่อนส่ง ไม่ใช่ขั้นตอนสำคัญ ถ้านับพลาดปล่อยให้ตอนกดส่งจริงเป็นตัวเช็คสุดท้าย
  } finally {
    loadingRecipientCount.value = false;
  }
};

watch(
  () => [form.targetType, form.buildingId, form.floor],
  () => {
    clearTimeout(recipientCountTimer);
    recipientCountTimer = setTimeout(fetchRecipientCount, 400);
  },
  { immediate: true }
);

const targetBadgeVariant = (targetType) => {
  const type = String(targetType).toUpperCase();
  if (type === 'FLOOR') return 'warning';
  if (type === 'ALL') return 'neutral';
  return 'success';
};

const isTargetType = (item, targetType) => String(item.targetType).toUpperCase() === targetType;

const targetLabel = (item) => {
  if (isTargetType(item, 'ALL')) return 'ทุกตึก';
  if (isTargetType(item, 'FLOOR')) return `ชั้น ${item.targetValue}`;
  return `ตึก: ${item.building?.name || 'ระบุตึก'}`;
};

const countByTargetType = (targetType) =>
  announcements.value.filter((item) => isTargetType(item, targetType)).length;

const filteredAnnouncements = computed(() => {
  if (historyFilter.value === 'all') return announcements.value;
  return announcements.value.filter((item) => isTargetType(item, historyFilter.value));
});

const loadData = async () => {
  if (buildingStore.buildings.length === 0) {
    await buildingStore.fetchBuildings();
  }
  fetchAnnouncements();
};

onMounted(() => {
  loadData();
});

watch(
  () => buildingStore.activeBuildingId,
  () => {
    fetchAnnouncements();
  }
);

const handleTargetTypeChange = () => {
  if (form.targetType === 'BUILDING' || form.targetType === 'FLOOR') {
    if (!form.buildingId && buildingStore.buildings.length > 0) {
      form.buildingId = buildingStore.activeBuildingId || buildingStore.buildings[0].id;
    }
  }
};

const handleImageUpload = async (event) => {
  const file = event.target.files[0];
  if (!file) return;

  uploadingImage.value = true;
  try {
    const res = await uploadService.uploadFile(file);
    form.imageUrl = res.data.url;
    await showSuccess('สำเร็จ!', 'อัปโหลดรูปภาพประกอบเรียบร้อยแล้ว');
  } catch (err) {
    showError('เกิดข้อผิดพลาด', err.response?.data?.message || 'ไม่สามารถอัปโหลดรูปภาพได้');
  } finally {
    uploadingImage.value = false;
  }
};

const fetchAnnouncements = async () => {
  try {
    const res = await api.get('/api/admin/broadcasts', {
      params: { buildingId: buildingStore.activeBuildingId }
    });
    announcements.value = res.data.data;
  } catch (error) {
    console.error('Failed to fetch announcements:', error);
  }
};

const handleConfirmAndSend = async () => {
  try {
    // 1. Fetch recipient count first for SweetAlert2 confirmation
    const countRes = await api.get('/api/admin/broadcasts/recipients-count', {
      params: {
        targetType: form.targetType,
        buildingId: form.buildingId,
        floor: form.floor
      }
    });

    const recipientCount = countRes.data.recipientCount || 0;
    const targetText = form.targetType === 'ALL'
      ? 'ลูกบ้านทุกตึกในระบบ'
      : form.targetType === 'FLOOR'
        ? `ชั้น ${form.floor}`
        : 'ตึกที่เลือก';

    // 2. SweetAlert2 Confirmation Prompt
    const confirmed = await showConfirm(
      'ยืนยันการส่ง LINE Broadcast?',
      `ระบบกำลังจะส่งข้อความหาลูกบ้านจำนวน ${recipientCount} คน ในกลุ่มเป้าหมาย "${targetText}" ยืนยันหรือไม่?`
    );

    if (!confirmed) return;

    submitting.value = true;
    const res = await api.post('/api/admin/broadcasts', {
      title: form.title,
      content: form.content,
      imageUrl: form.imageUrl,
      targetType: form.targetType,
      buildingId: form.buildingId,
      floor: form.floor
    });

    await showSuccess('สำเร็จ!', `บรอดแคสต์ประกาศข่าวสารสำเร็จไปยังลูกบ้าน ${res.data.data.recipientCount} คนเรียบร้อยแล้ว`);
    form.title = '';
    form.content = '';
    form.imageUrl = '';
    form.targetType = 'ALL';
    showCreateModal.value = false;
    fetchAnnouncements();
  } catch (error) {
    showError('เกิดข้อผิดพลาด', error.response?.data?.message || 'ไม่สามารถส่งประกาศข่าวสารได้');
  } finally {
    submitting.value = false;
  }
};

const handleDeleteAnnouncement = async (id, title) => {
  const confirmed = await showConfirm('ยืนยันลบประกาศ', `คุณต้องการลบประกาศ "${title}" ใช่หรือไม่?`);
  if (!confirmed) return;

  try {
    await api.delete(`/api/v1/announcements/${id}`);
    await showSuccess('สำเร็จ!', 'ลบประกาศข่าวสารเรียบร้อยแล้ว');
    fetchAnnouncements();
  } catch (error) {
    showError('เกิดข้อผิดพลาด', error.response?.data?.message || 'ไม่สามารถลบประกาศได้');
  }
};
</script>
