<template>
  <Teleport to="body">
    <div
      v-if="isOpen"
      class="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 select-none overflow-y-auto"
      @click.self="closeModal"
    >
      <div class="bg-white rounded-3xl p-6 sm:p-7 max-w-lg w-full shadow-2xl border border-slate-100 space-y-5 my-8 relative animate-scale-up">
        <!-- Close Button -->
        <button
          @click="closeModal"
          class="absolute top-4 right-4 text-slate-400 hover:text-slate-700 p-1.5 rounded-full hover:bg-slate-100 transition-colors cursor-pointer"
        >
          <X class="w-5 h-5" />
        </button>

        <!-- Header -->
        <div class="space-y-1">
          <div class="inline-flex items-center gap-1.5 px-3 py-1 bg-purple-50 border border-purple-200/80 rounded-full text-purple-700 text-xs font-bold">
            <MessageSquareQuote class="w-3.5 h-3.5" />
            <span>Developer & Product Feedback</span>
          </div>
          <h2 class="text-xl font-black text-slate-900 tracking-tight">
            ส่งความคิดเห็นถึงทีมผู้พัฒนา
          </h2>
          <p class="text-xs text-slate-500">
            พบปัญหาการใช้งาน มีข้อเสนอแนะ หรือต้องการฟีเจอร์เพิ่มเติม สามารถแจ้งทีมงานได้โดยตรง
          </p>
        </div>

        <!-- Form -->
        <form @submit.prevent="handleSubmit" class="space-y-4">
          <!-- 1. Category Selector -->
          <div class="space-y-1.5">
            <label class="text-xs font-bold text-slate-700">หมวดหมู่ความคิดเห็น</label>
            <div class="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <button
                v-for="cat in categories"
                :key="cat.value"
                type="button"
                @click="form.category = cat.value"
                class="p-2.5 rounded-2xl border text-center transition-all flex flex-col items-center justify-center gap-1 cursor-pointer"
                :class="form.category === cat.value
                  ? 'bg-purple-600 text-white border-purple-600 shadow-xs font-bold'
                  : 'bg-slate-50 hover:bg-slate-100 text-slate-600 border-slate-200/80 font-medium'"
              >
                <component :is="cat.icon" class="w-4 h-4" />
                <span class="text-[11px] leading-tight">{{ cat.label }}</span>
              </button>
            </div>
          </div>

          <!-- 2. Rating Stars -->
          <div class="space-y-1.5">
            <label class="text-xs font-bold text-slate-700 flex items-center justify-between">
              <span>ความพึงพอใจโดยรวม</span>
              <span v-if="form.rating > 0" class="text-xs text-purple-600 font-extrabold">
                {{ ratingLabels[form.rating] }}
              </span>
            </label>
            <div class="flex items-center gap-2 p-2 bg-slate-50 rounded-2xl border border-slate-200/80 justify-center">
              <button
                v-for="star in 5"
                :key="star"
                type="button"
                @click="form.rating = star"
                class="p-1 transition-transform hover:scale-125 cursor-pointer"
              >
                <Star
                  class="w-6 h-6 transition-colors"
                  :class="star <= form.rating ? 'text-amber-400 fill-amber-400' : 'text-slate-300'"
                />
              </button>
            </div>
          </div>

          <!-- 3. Title (Optional) -->
          <div class="space-y-1.5">
            <label class="text-xs font-bold text-slate-700">หัวข้อ (สั้นๆ ได้ใจความ)</label>
            <input
              v-model="form.title"
              type="text"
              placeholder="เช่น ขอเพิ่มปุ่มดาวน์โหลดรายงานแบบ Excel..."
              class="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-purple-500 focus:bg-white transition-all placeholder:text-slate-400"
            />
          </div>

          <!-- 4. Content / Description -->
          <div class="space-y-1.5">
            <label class="text-xs font-bold text-slate-700 flex items-center justify-between">
              <span>รายละเอียดความคิดเห็น / ปัญหาที่พบ <span class="text-rose-500">*</span></span>
              <span class="text-[10px] text-slate-400 font-normal">ข้อมูลที่ชัดเจนช่วยให้แก้ปัญหาได้ตรงจุด</span>
            </label>
            <textarea
              v-model="form.content"
              rows="4"
              required
              placeholder="กรุณาอธิบายปัญหาหรือข้อเสนอแนะของคุณ..."
              class="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-purple-500 focus:bg-white transition-all placeholder:text-slate-400 leading-relaxed"
            ></textarea>
          </div>

          <!-- 5. Image Attachment Upload -->
          <div class="space-y-1.5">
            <label class="text-xs font-bold text-slate-700 flex items-center justify-between">
              <span>แนบรูปภาพหน้าจอ (Screenshots)</span>
              <span class="text-[10px] text-slate-400">ถ้ามี</span>
            </label>
            <div class="flex items-center gap-2">
              <input
                ref="fileInput"
                type="file"
                accept="image/*"
                multiple
                class="hidden"
                @change="handleFileUpload"
              />
              <button
                type="button"
                :disabled="uploadingImage"
                @click="$refs.fileInput.click()"
                class="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                <Upload class="w-3.5 h-3.5" />
                <span>{{ uploadingImage ? 'กำลังอัปโหลด...' : 'เลือกรูปภาพแนบ' }}</span>
              </button>

              <div v-if="form.imageUrls.length > 0" class="text-xs text-emerald-600 font-bold flex items-center gap-1">
                <Check class="w-3.5 h-3.5" />
                <span>แนบแล้ว {{ form.imageUrls.length }} รูป</span>
              </div>
            </div>

            <!-- Uploaded Previews -->
            <div v-if="form.imageUrls.length > 0" class="flex items-center gap-2 overflow-x-auto pt-1">
              <div
                v-for="(url, idx) in form.imageUrls"
                :key="idx"
                class="relative w-14 h-14 rounded-xl overflow-hidden border border-slate-200 shrink-0 group"
              >
                <img :src="resolveImageUrl(url)" alt="Attached" class="w-full h-full object-cover" />
                <button
                  type="button"
                  @click="removeImage(idx)"
                  class="absolute inset-0 bg-black/50 text-white opacity-0 group-hover:opacity-100 flex items-center justify-center text-xs transition-opacity cursor-pointer"
                >
                  <X class="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          <!-- Auto Context Preview -->
          <div class="p-3 bg-slate-50/80 rounded-2xl border border-slate-100 text-[10px] text-slate-400 space-y-1 font-mono">
            <div class="flex items-center justify-between gap-2">
              <span class="flex items-center gap-1 text-slate-500">
                <MapPin class="w-3 h-3" />
                <span>หน้าปัจจุบัน:</span>
              </span>
              <span class="text-slate-600 font-bold truncate max-w-[200px]">{{ currentRoute }}</span>
            </div>
            <div class="flex items-center justify-between gap-2">
              <span class="flex items-center gap-1 text-slate-500">
                <Laptop class="w-3 h-3" />
                <span>ระบบ/อุปกรณ์:</span>
              </span>
              <span class="text-slate-600 font-bold">{{ deviceSummary }}</span>
            </div>
          </div>

          <!-- Submit Buttons -->
          <div class="flex gap-2.5 pt-2">
            <button
              type="submit"
              :disabled="submitting || !form.content.trim()"
              class="flex-1 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 active:scale-95 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-purple-600/25 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <Send class="w-4 h-4" />
              <span>{{ submitting ? 'กำลังส่งข้อมูล...' : 'ส่งความคิดเห็น' }}</span>
            </button>
            <button
              type="button"
              @click="closeModal"
              class="py-3 px-5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-all cursor-pointer"
            >
              ยกเลิก
            </button>
          </div>
        </form>
      </div>
    </div>
  </Teleport>
</template>

<script setup>
import { ref, reactive, computed } from 'vue';
import { useRoute } from 'vue-router';
import {
  X,
  Upload,
  Send,
  Bug,
  Lightbulb,
  Palette,
  Sparkles,
  Star,
  MessageSquareQuote,
  MapPin,
  Laptop,
  Check
} from 'lucide-vue-next';
import api from '@/utils/api';
import { showSuccess, showError } from '@/utils/swal';
import { useAuthStore } from '@/stores/auth';

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false
  },
  platform: {
    type: String,
    default: 'CMS_ADMIN'
  }
});

const emit = defineEmits(['update:modelValue', 'submitted']);

const route = useRoute();
const authStore = useAuthStore();
const fileInput = ref(null);
const uploadingImage = ref(false);
const submitting = ref(false);

const isOpen = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val)
});

const categories = [
  { value: 'BUG', label: 'แจ้งบั๊ก/ปัญหา', icon: Bug },
  { value: 'FEATURE_REQUEST', label: 'ขอฟีเจอร์ใหม่', icon: Lightbulb },
  { value: 'UI_UX', label: 'ความสะดวก/UI', icon: Palette },
  { value: 'GENERAL', label: 'ทั่วไป/ข้อเสนอแนะ', icon: Sparkles }
];

const ratingLabels = {
  1: '1/5 ต้องปรับปรุงอย่างมาก',
  2: '2/5 พอใช้ได้ แต่ติดปัญหาบ่อย',
  3: '3/5 ปานกลาง ใช้งานได้',
  4: '4/5 ดี พึงพอใจ',
  5: '5/5 ยอดเยี่ยม ชอบมาก'
};

const form = reactive({
  category: 'GENERAL',
  title: '',
  content: '',
  rating: 5,
  imageUrls: []
});

const currentRoute = computed(() => {
  if (typeof window !== 'undefined') {
    return route?.fullPath || window.location.pathname;
  }
  return '/';
});

const deviceSummary = computed(() => {
  if (typeof window !== 'undefined' && typeof navigator !== 'undefined') {
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    const screen = `${window.innerWidth}x${window.innerHeight}`;
    return `${isMobile ? 'Mobile' : 'Desktop'} (${screen})`;
  }
  return 'Web Client';
});

const closeModal = () => {
  isOpen.value = false;
};

const resolveImageUrl = (path) => {
  if (!path) return '';
  if (path.startsWith('http://') || path.startsWith('https://')) return path;
  const baseUrl = import.meta.env.VITE_API_BASE_URL || '';
  const cleanBase = baseUrl.replace(/\/+$/, '');
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  return `${cleanBase}${cleanPath}`;
};

const handleFileUpload = async (e) => {
  const files = e.target.files;
  if (!files || files.length === 0) return;

  uploadingImage.value = true;
  try {
    for (const file of Array.from(files)) {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('folder', 'feedback');

      const res = await api.post('/api/v1/uploads', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      if (res.data?.success && (res.data?.data?.url || res.data?.url)) {
        form.imageUrls.push(res.data?.data?.url || res.data?.url);
      }
    }
  } catch (err) {
    console.warn('Upload feedback image failed:', err);
    showError('อัปโหลดรูปภาพไม่สำเร็จ', 'กรุณาลองใหม่อีกครั้ง');
  } finally {
    uploadingImage.value = false;
    if (fileInput.value) fileInput.value.value = '';
  }
};

const removeImage = (index) => {
  form.imageUrls.splice(index, 1);
};

const handleSubmit = async () => {
  if (!form.content.trim()) return;

  submitting.value = true;
  try {
    const deviceContext = {
      browser: typeof navigator !== 'undefined' ? navigator.userAgent : '',
      screenResolution: typeof window !== 'undefined' ? `${window.innerWidth}x${window.innerHeight}` : '',
      platform: typeof navigator !== 'undefined' ? navigator.platform : '',
      language: typeof navigator !== 'undefined' ? navigator.language : 'th'
    };

    const payload = {
      platform: props.platform,
      category: form.category,
      title: form.title.trim() || undefined,
      content: form.content.trim(),
      rating: form.rating,
      imageUrls: form.imageUrls,
      currentRoute: currentRoute.value,
      deviceContext,
      senderName: authStore.user?.name || authStore.tenant?.firstName || undefined,
      senderRole: authStore.user?.role || (authStore.tenant ? 'TENANT' : 'GUEST'),
      senderPhone: authStore.user?.phone || authStore.tenant?.phone || undefined
    };

    const res = await api.post('/api/v1/feedback', payload);
    if (res.data?.success) {
      await showSuccess('ส่งความคิดเห็นสำเร็จ', 'ขอบคุณสำหรับข้อเสนอแนะเพื่อพัฒนาแพลตฟอร์ม');
      form.title = '';
      form.content = '';
      form.imageUrls = [];
      closeModal();
      emit('submitted');
    }
  } catch (err) {
    console.error('Submit feedback error:', err);
    showError('ส่งความคิดเห็นไม่สำเร็จ', err.response?.data?.message || err.message);
  } finally {
    submitting.value = false;
  }
};
</script>
