<template>
  <div class="space-y-6">
    <!-- Header Title Banner -->
    <div class="bg-gradient-to-r from-rose-900 via-purple-900 to-slate-900 p-6 rounded-3xl text-white shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
      <div>
        <div class="flex items-center gap-2">
          <span class="px-3 py-1 bg-rose-500/30 border border-rose-400/40 rounded-full text-xs font-bold tracking-wider uppercase text-rose-200">
            Targeted LINE Broadcast Engine
          </span>
        </div>
        <h1 class="text-2xl font-black tracking-tight text-white mt-1">📢 ประกาศข่าวสารเฉพาะกลุ่ม (Targeted Broadcast)</h1>
        <p class="text-xs text-rose-200/80 mt-1 max-w-xl">
          ส่ง LINE Flex Message แจ้งเตือนข่าวสารตรงไปยังลูกบ้านเฉพาะตึก หรือเฉพาะชั้นได้ทันที (รองรับ Multicast Array Chunking 500 UIDs/Request)
        </p>
      </div>

      <button
        @click="showCreateModal = !showCreateModal"
        class="px-5 py-2.5 bg-gradient-to-r from-rose-500 to-purple-600 hover:from-rose-600 hover:to-purple-700 text-white rounded-xl text-xs sm:text-sm font-bold transition-all shadow-lg shadow-rose-600/30 flex items-center gap-2 shrink-0 cursor-pointer"
      >
        <span>{{ showCreateModal ? '✕ ปิดฟอร์ม' : '➕ บรอดแคสต์ประกาศใหม่ (New Broadcast)' }}</span>
      </button>
    </div>

    <!-- Create Announcement Form Panel -->
    <div v-if="showCreateModal" class="p-6 bg-white border border-slate-200 rounded-3xl shadow-lg space-y-5 animate-in fade-in zoom-in-95 duration-150">
      <div class="flex items-center justify-between border-b border-slate-100 pb-3">
        <h2 class="text-base font-bold text-slate-900 flex items-center gap-2">
          <span>📱</span>
          <span>สร้างข้อความและเลือกกลุ่มเป้าหมาย (Create & Target Broadcast)</span>
        </h2>
        <span class="text-xs text-slate-400 font-medium">LINE Messaging API Multicast Engine</span>
      </div>

      <form @submit.prevent="handleConfirmAndSend" class="space-y-4">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <!-- Title -->
          <div class="md:col-span-2">
            <label class="block text-xs font-bold text-slate-700 mb-1">หัวข้อประกาศ (Announcement Title)</label>
            <input
              v-model="form.title"
              type="text"
              placeholder="เช่น แจ้งปิดปรับปรุงระบบน้ำประปาชั่วคราว หรือ แจ้งกำหนดชำระค่าเช่าประจำเดือน"
              required
              class="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 font-semibold focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500"
            />
          </div>

          <!-- Target Type Selector -->
          <div>
            <label class="block text-xs font-bold text-slate-700 mb-1">กลุ่มเป้าหมาย (Target Audience)</label>
            <select
              v-model="form.targetType"
              @change="handleTargetTypeChange"
              class="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500"
            >
              <option value="ALL">🌐 ลูกบ้านทุกตึกทั้งหมด (All Buildings)</option>
              <option value="BUILDING">🏢 เฉพาะตึกที่ระบุ (Specific Building)</option>
              <option value="FLOOR">🚪 เฉพาะชั้นที่ระบุ (Specific Floor)</option>
            </select>
          </div>

          <!-- Dynamic Building Selector -->
          <div v-if="form.targetType === 'BUILDING' || form.targetType === 'FLOOR'">
            <label class="block text-xs font-bold text-slate-700 mb-1">เลือกหอพัก/อาคาร (Select Building)</label>
            <select
              v-model="form.buildingId"
              required
              class="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500"
            >
              <option value="" disabled>-- เลือกหอพัก --</option>
              <option v-for="b in buildingStore.buildings" :key="b.id" :value="b.id">
                🏢 {{ b.name }}
              </option>
            </select>
          </div>

          <!-- Dynamic Floor Selector -->
          <div v-if="form.targetType === 'FLOOR'">
            <label class="block text-xs font-bold text-slate-700 mb-1">เลือกชั้น (Select Floor)</label>
            <select
              v-model="form.floor"
              required
              class="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500"
            >
              <option value="" disabled>-- เลือกชั้น --</option>
              <option v-for="f in 10" :key="f" :value="f">Floor {{ f }} (ชั้น {{ f }})</option>
            </select>
          </div>
        </div>

        <!-- Optional Image Upload -->
        <div>
          <label class="block text-xs font-bold text-slate-700 mb-1">รูปภาพประกอบ (Optional Banner Image)</label>
          <div class="flex items-center gap-3">
            <input
              type="file"
              accept="image/*"
              @change="handleImageUpload"
              class="text-xs text-slate-500 file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-rose-50 file:text-rose-700 hover:file:bg-rose-100 cursor-pointer"
            />
            <div v-if="uploadingImage" class="text-xs text-rose-600 font-semibold animate-pulse">กำลังอัปโหลดรูปภาพ...</div>
          </div>

          <!-- Image Preview -->
          <div v-if="form.imageUrl" class="mt-2 relative inline-block">
            <img :src="form.imageUrl" class="h-28 rounded-2xl object-cover border border-slate-200 shadow-xs" />
            <button
              type="button"
              @click="form.imageUrl = ''"
              class="absolute -top-2 -right-2 bg-rose-600 text-white rounded-full w-6 h-6 text-xs flex items-center justify-center font-bold shadow-md hover:bg-rose-700"
            >
              ✕
            </button>
          </div>
        </div>

        <!-- Content Details -->
        <div>
          <label class="block text-xs font-bold text-slate-700 mb-1">เนื้อหาประกาศ (Content Details)</label>
          <textarea
            v-model="form.content"
            rows="4"
            placeholder="พิมพ์รายละเอียดประกาศข่าวสารที่ต้องการส่งหาลูกบ้านทาง LINE..."
            required
            class="w-full bg-slate-50 border border-slate-300 rounded-xl p-3.5 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500"
          ></textarea>
        </div>

        <!-- Submit Button -->
        <div class="flex justify-end pt-2">
          <button
            type="submit"
            :disabled="submitting || uploadingImage"
            class="px-6 py-3 bg-gradient-to-r from-rose-600 to-purple-600 hover:from-rose-700 hover:to-purple-700 text-white rounded-xl text-xs sm:text-sm font-bold transition-all shadow-md shadow-rose-600/20 disabled:opacity-50 flex items-center gap-2 cursor-pointer"
          >
            <span>🚀 ตรวจสอบและส่ง LINE Broadcast</span>
          </button>
        </div>
      </form>
    </div>

    <!-- Announcement History List -->
    <div class="bg-white border border-slate-200 rounded-3xl shadow-xs overflow-hidden">
      <div class="p-5 border-b border-slate-200 flex items-center justify-between">
        <div>
          <h3 class="font-bold text-slate-900 text-sm">ประวัติการบรอดแคสต์ทั้งหมด (Broadcast History)</h3>
          <p class="text-xs text-slate-400">รายการข่าวสารที่เคยบรอดแคสต์ไปหาลูกบ้านย้อนหลัง</p>
        </div>
        <button @click="fetchAnnouncements" class="text-xs text-rose-600 hover:underline font-semibold cursor-pointer">🔄 รีเฟรชประวัติ</button>
      </div>

      <div class="divide-y divide-slate-100">
        <div v-for="item in announcements" :key="item.id" class="p-5 hover:bg-slate-50/60 transition-colors space-y-3">
          <div class="flex flex-col md:flex-row md:items-center justify-between gap-2">
            <div class="flex items-center gap-2.5 flex-wrap">
              <span class="font-bold text-slate-900 text-base">{{ item.title }}</span>
              <span
                class="text-[11px] font-extrabold px-3 py-1 rounded-full border shadow-2xs inline-flex items-center gap-1"
                :class="{
                  'bg-purple-50 border-purple-200 text-purple-800': item.targetType === 'ALL' || item.targetType === 'all',
                  'bg-indigo-50 border-indigo-200 text-indigo-800': item.targetType === 'BUILDING' || item.targetType === 'building',
                  'bg-amber-50 border-amber-200 text-amber-800': item.targetType === 'FLOOR' || item.targetType === 'floor'
                }"
              >
                <span>{{ item.targetType === 'ALL' || item.targetType === 'all' ? '🌐 ทุกตึก' : item.targetType === 'FLOOR' || item.targetType === 'floor' ? '🚪 ชั้น ' + item.targetValue : '🏢 ตึก: ' + (item.building?.name || 'ระบุตึก') }}</span>
              </span>
            </div>

            <div class="flex items-center gap-3">
              <span class="text-xs text-slate-400 font-mono">{{ new Date(item.createdAt).toLocaleString('th-TH') }}</span>
              <button
                @click="handleDeleteAnnouncement(item.id, item.title)"
                class="px-2.5 py-1 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-lg text-xs font-semibold border border-rose-200 cursor-pointer"
              >
                🗑️ ลบ
              </button>
            </div>
          </div>

          <!-- Cover Image Thumbnail -->
          <div v-if="item.imageUrl" class="max-w-md">
            <img :src="item.imageUrl" class="h-36 rounded-2xl object-cover border border-slate-200 shadow-2xs" />
          </div>

          <p class="text-xs text-slate-600 whitespace-pre-line leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-100">{{ item.content }}</p>

          <div class="text-[11px] text-slate-400 font-medium flex items-center gap-2">
            <span>👤 ผู้ส่ง: {{ item.createdBy || 'Admin' }}</span>
          </div>
        </div>

        <div v-if="announcements.length === 0" class="p-12 text-center text-slate-400 text-xs">
          ยังไม่มีประวัติการส่งประกาศข่าวสารในระบบ
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, watch } from 'vue';
import { useBuildingStore } from '@/stores/useBuildingStore';
import uploadService from '@/services/uploadService';
import { showSuccess, showError, showConfirm } from '@/utils/swal';
import api from '@/utils/api';

const buildingStore = useBuildingStore();
const showCreateModal = ref(false);
const submitting = ref(false);
const uploadingImage = ref(false);
const announcements = ref([]);

const form = reactive({
  title: '',
  content: '',
  imageUrl: '',
  targetType: 'ALL',
  buildingId: '',
  floor: 1
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
