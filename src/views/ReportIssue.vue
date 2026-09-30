<template>
  <div class="space-y-4 pb-8 font-sans text-slate-800">
    <!-- Header with Back Button -->
    <div class="flex items-center justify-between pt-1">
      <div class="flex items-center gap-2.5">
        <Button type="button" variant="secondary" size="icon" @click="goBack">
          <ArrowLeft class="w-4 h-4" />
        </Button>
        <div>
          <h1 class="text-base sm:text-lg font-bold text-slate-900 leading-tight">แจ้งซ่อม & ร้องเรียน</h1>
          <p class="text-xs text-slate-500">ส่งเรื่องแจ้งซ่อม หรือแจ้งปัญหาให้เจ้าหน้าที่หอพัก</p>
        </div>
      </div>

      <Button as-child variant="outline" size="sm" class="bg-teal-50 hover:bg-teal-100 text-teal-700 border-teal-100">
        <router-link to="/liff/issues">
          <History class="w-3.5 h-3.5" />
          <span>ประวัติแจ้งเหตุ</span>
        </router-link>
      </Button>
    </div>

    <!-- Tenant & Room Info Banner -->
    <div v-if="tenantProfile?.rooms?.length" class="p-3.5 bg-gradient-to-r from-teal-50/80 to-cyan-50/60 rounded-xl border border-teal-100/80 flex items-center justify-between text-xs shadow-2xs">
      <div class="flex items-center gap-2.5">
        <div class="w-8 h-8 rounded-xl bg-teal-600 text-white flex items-center justify-center font-bold text-xs shadow-xs">
          <DoorClosed class="w-4 h-4" />
        </div>
        <div>
          <div class="font-bold text-slate-800">
            ห้อง {{ currentRoom?.roomNumber || '-' }}
          </div>
          <div class="text-xs text-slate-500">
            {{ currentRoom?.building?.name || 'อาคารหลัก' }}
          </div>
        </div>
      </div>

      <Badge variant="success" class="font-bold border border-emerald-200">
        ผู้เช่าปัจจุบัน
      </Badge>
    </div>

    <!-- Disabled Feature Notice Banner -->
    <div
      v-if="!featureStore.isEnabled('ENABLE_MAINTENANCE_REQUEST')"
      class="p-5 bg-amber-50 border border-amber-200 rounded-xl text-amber-900 space-y-2 shadow-xs"
    >
      <div class="flex items-center gap-2 font-bold text-xs">
        <AlertTriangle class="w-4 h-4 text-amber-600 shrink-0" />
        <span>ระบบแจ้งซ่อมและร้องเรียนถูกปิดใช้งานชั่วคราว</span>
      </div>
      <p class="text-xs text-amber-700 leading-relaxed">
        ผู้ดูแลหอพักได้ปิดการรับเรื่องแจ้งซ่อมหรือร้องเรียนผ่านระบบออนไลน์ชั่วคราว หากมีเหตุฉุกเฉินกรุณาติดต่อเจ้าหน้าที่โดยตรง
      </p>
    </div>

    <!-- Main Issue Report Form Card -->
    <Card v-else class="p-5 sm:p-6 space-y-5">
      <form @submit.prevent="handleSubmit" class="space-y-4">
        <!-- 1. Category Selection -->
        <div class="space-y-2">
          <label class="block text-xs font-bold text-slate-700">
            หมวดหมู่การแจ้งเรื่อง <span class="text-rose-500">*</span>
          </label>

          <div class="grid grid-cols-3 gap-2">
            <button
              type="button"
              v-for="cat in categories"
              :key="cat.value"
              @click="form.category = cat.value"
              class="p-2.5 rounded-xl border text-center transition-all cursor-pointer flex flex-col items-center gap-1.5"
              :class="form.category === cat.value
                ? 'bg-teal-50 border-teal-500 text-teal-900 font-bold ring-2 ring-teal-500/20 shadow-xs'
                : 'bg-slate-50/70 hover:bg-slate-100 border-slate-200 text-slate-600 font-medium'"
            >
              <component :is="cat.icon" class="w-4 h-4" :class="form.category === cat.value ? 'text-teal-600' : 'text-slate-400'" />
              <span class="text-xs leading-tight">{{ cat.label }}</span>
            </button>
          </div>
        </div>

        <!-- 2. Description Field -->
        <div class="space-y-1.5">
          <div class="flex items-center justify-between">
            <label for="description" class="block text-xs font-bold text-slate-700">
              รายละเอียดปัญหา / ข้อร้องเรียน <span class="text-rose-500">*</span>
            </label>
            <span class="text-xs text-slate-400 font-mono">{{ form.description.length }}/500</span>
          </div>

          <textarea
            id="description"
            v-model="form.description"
            rows="4"
            maxlength="500"
            required
            :placeholder="categoryPlaceholder"
            class="w-full text-xs bg-slate-50/70 border border-slate-200 rounded-xl p-3.5 text-slate-800 placeholder:text-slate-400 focus:outline-hidden focus:bg-white focus:ring-2 focus:ring-ring/30 focus:border-ring transition-all resize-none leading-relaxed"
          ></textarea>
        </div>

        <!-- 3. Image Upload Field -->
        <div class="space-y-2">
          <label class="block text-xs font-bold text-slate-700">
            รูปภาพประกอบ (สูงสุด 5 รูป)
          </label>

          <!-- Image Previews Grid -->
          <div v-if="previewImages.length > 0" class="grid grid-cols-3 sm:grid-cols-4 gap-2.5 pb-1">
            <div
              v-for="(img, idx) in previewImages"
              :key="idx"
              class="relative aspect-square rounded-xl overflow-hidden border border-slate-200 shadow-2xs group"
            >
              <img :src="img.url" alt="Preview" class="w-full h-full object-cover" />
              <button
                type="button"
                @click="removeImage(idx)"
                class="absolute top-1.5 right-1.5 w-6 h-6 rounded-full bg-black/60 hover:bg-rose-600 text-white flex items-center justify-center transition-colors shadow-xs cursor-pointer"
                title="ลบรูปภาพ"
              >
                <X class="w-3.5 h-3.5" />
              </button>
            </div>

            <!-- Add More Button (if < 5) -->
            <button
              v-if="previewImages.length < 5"
              type="button"
              @click="triggerFileInput"
              class="aspect-square rounded-xl border-2 border-dashed border-slate-200 hover:border-teal-400 bg-slate-50 hover:bg-teal-50/50 flex flex-col items-center justify-center gap-1 text-slate-400 hover:text-teal-600 transition-colors cursor-pointer"
            >
              <Plus class="w-5 h-5" />
              <span class="text-xs font-medium">เพิ่มรูป</span>
            </button>
          </div>

          <!-- Upload Dropzone (if 0 images) -->
          <div
            v-else
            @click="triggerFileInput"
            class="p-5 rounded-xl border-2 border-dashed border-slate-200 hover:border-teal-400 bg-slate-50/80 hover:bg-teal-50/40 text-center transition-all cursor-pointer space-y-1.5 group"
          >
            <div class="w-10 h-10 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center mx-auto group-hover:scale-105 transition-transform">
              <Camera class="w-5 h-5" />
            </div>
            <div class="text-xs font-semibold text-slate-700">
              แตะเพื่อเลือกรูปภาพจากเครื่อง หรือถ่ายรูปใหม่
            </div>
            <p class="text-xs text-slate-400">
              รองรับไฟล์ JPG, PNG, WEBP ขนาดไม่เกิน 5MB ต่อรูป
            </p>
          </div>

          <!-- Hidden Native File Input -->
          <input
            ref="fileInputRef"
            type="file"
            accept="image/png, image/jpeg, image/jpg, image/webp"
            multiple
            class="hidden"
            @change="handleFileChange"
          />
        </div>

        <!-- Submit Button -->
        <div class="pt-2">
          <Button
            type="submit"
            :disabled="submitting || !form.description.trim()"
            class="w-full py-3 h-auto text-xs sm:text-sm bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-700 hover:to-cyan-700 active:scale-[0.99] shadow-md shadow-teal-600/20"
          >
            <span v-if="submitting" class="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full"></span>
            <Send v-else class="w-4 h-4" />
            <span>{{ submitting ? 'กำลังส่งข้อมูล...' : 'ส่งเรื่องแจ้งเหตุ' }}</span>
          </Button>
        </div>
      </form>
    </Card>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useFeatureStore } from '@/stores/useFeatureStore';
import {
  ArrowLeft,
  Wrench,
  MessageSquareWarning,
  HelpCircle,
  Camera,
  Plus,
  X,
  Send,
  History,
  DoorClosed,
  AlertTriangle
} from 'lucide-vue-next';
import { initLiff, isLiffLoggedIn, getLiffProfile } from '@/utils/liff';
import api from '@/utils/api';
import { showSuccess, showError } from '@/utils/swal';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

const router = useRouter();
const featureStore = useFeatureStore();

const submitting = ref(false);
const fileInputRef = ref(null);
const lineUserId = ref('');
const tenantProfile = ref(null);

const form = ref({
  category: 'REPAIR',
  description: '',
  roomId: ''
});

const selectedFiles = ref([]);
const previewImages = ref([]);

const categories = [
  { value: 'REPAIR', label: 'แจ้งซ่อมบำรุง', icon: Wrench },
  { value: 'COMPLAINT', label: 'ร้องเรียน/แจ้งปัญหา', icon: MessageSquareWarning },
  { value: 'OTHER', label: 'เรื่องอื่นๆ', icon: HelpCircle }
];

const categoryPlaceholder = computed(() => {
  if (form.value.category === 'REPAIR') {
    return 'ระบุสิ่งที่ต้องการให้ซ่อม เช่น แอร์ไม่เย็น, ก๊อกน้ำรั่ว, หลอดไฟเสีย...';
  }
  if (form.value.category === 'COMPLAINT') {
    return 'ระบุปัญหาที่ต้องการร้องเรียน เช่น เสียงดังยามวิกาล, กลิ่นรบกวน, ที่จอดรถ...';
  }
  return 'ระบุรายละเอียดเรื่องที่ต้องการแจ้งเจ้าหน้าที่...';
});

const currentRoom = computed(() => {
  return tenantProfile.value?.rooms?.[0] || null;
});

const goBack = () => {
  if (window.history.length > 1) {
    router.back();
  } else {
    router.push('/liff/issues');
  }
};

const triggerFileInput = () => {
  fileInputRef.value?.click();
};

const handleFileChange = (e) => {
  const files = Array.from(e.target.files || []);
  if (!files.length) return;

  const maxTotal = 5;
  const remainingSlots = maxTotal - selectedFiles.value.length;

  if (files.length > remainingSlots) {
    showError('รูปภาพเกินกำหนด', `คุณสามารถแนบรูปภาพได้สูงสุด ${maxTotal} รูปเท่านั้น`);
  }

  const allowedFiles = files.slice(0, remainingSlots);

  for (const file of allowedFiles) {
    if (file.size > 5 * 1024 * 1024) {
      showError('ขนาดไฟล์เกินกำหนด', `ไฟล์ "${file.name}" มีขนาดเกิน 5MB กรุณาเลือกรูปภาพใหม่`);
      continue;
    }

    selectedFiles.value.push(file);
    previewImages.value.push({
      file,
      url: URL.createObjectURL(file)
    });
  }

  // Reset input value so re-selecting same file triggers change
  if (fileInputRef.value) {
    fileInputRef.value.value = '';
  }
};

const removeImage = (index) => {
  const removed = previewImages.value.splice(index, 1);
  if (removed[0]?.url) {
    URL.revokeObjectURL(removed[0].url);
  }
  selectedFiles.value.splice(index, 1);
};

onMounted(async () => {
  featureStore.fetchFeatures();
  try {
    await initLiff();
    if (isLiffLoggedIn()) {
      const profile = await getLiffProfile();
      if (profile?.userId) {
        lineUserId.value = profile.userId;
      }
    }
  } catch (err) {
    console.warn('LIFF init fallback:', err.message);
  }

  // Fetch tenant profile to get room & building info
  try {
    const params = {};
    if (lineUserId.value) params.lineUserId = lineUserId.value;
    const res = await api.get('/api/v1/liff/profile', { params });
    tenantProfile.value = res.data?.data?.tenant || null;
    if (tenantProfile.value?.rooms?.length) {
      form.value.roomId = tenantProfile.value.rooms[0].id;
    }
  } catch (err) {
    console.warn('Could not fetch tenant profile for issues:', err.message);
  }
});

const handleSubmit = async () => {
  if (!form.value.description.trim()) {
    showError('ข้อมูลไม่ครบถ้วน', 'กรุณาระบุรายละเอียดการแจ้งเรื่อง');
    return;
  }

  submitting.value = true;
  try {
    const formData = new FormData();
    formData.append('category', form.value.category);
    formData.append('description', form.value.description.trim());
    if (form.value.roomId) {
      formData.append('roomId', form.value.roomId);
    }
    if (lineUserId.value) {
      formData.append('lineUserId', lineUserId.value);
    }

    selectedFiles.value.forEach((file) => {
      formData.append('files', file);
    });

    const res = await api.post('/api/v1/liff/issues', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });

    await showSuccess('ส่งเรื่องสำเร็จ!', res.data?.message || 'ส่งเรื่องแจ้งซ่อม/ร้องเรียนเรียบร้อยแล้ว');
    router.push('/liff/issues');
  } catch (error) {
    console.error('Submit issue error:', error);
    showError(
      'เกิดข้อผิดพลาด',
      error.response?.data?.message || 'ไม่สามารถส่งเรื่องแจ้งเหตุได้ กรุณาลองใหม่อีกครั้ง'
    );
  } finally {
    submitting.value = false;
  }
};
</script>
