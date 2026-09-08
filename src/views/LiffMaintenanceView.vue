<template>
  <div class="space-y-5 pb-6 font-sans text-slate-800">
    <!-- Header -->
    <div>
      <h1 class="text-lg font-bold text-slate-900 tracking-tight">แจ้งซ่อม & ติดตามงาน</h1>
      <p class="text-xs text-slate-500 mt-0.5">แจ้งปัญหาห้องพักและติดตามสถานะการดำเนินงานของช่าง</p>
    </div>

    <!-- Navigation Tabs -->
    <div class="flex p-1 bg-slate-100/90 rounded-2xl border border-slate-200/50">
      <button
        @click="activeTab = 'new'"
        class="flex-1 py-2.5 rounded-xl text-xs font-semibold transition-all flex items-center justify-center gap-1.5"
        :class="activeTab === 'new' ? 'bg-white text-indigo-600 shadow-xs' : 'text-slate-500 hover:text-slate-800'"
      >
        <Plus class="w-3.5 h-3.5" />
        <span>แจ้งซ่อมใหม่</span>
      </button>
      <button
        @click="activeTab = 'tracking'"
        class="flex-1 py-2.5 rounded-xl text-xs font-semibold transition-all flex items-center justify-center gap-1.5"
        :class="activeTab === 'tracking' ? 'bg-white text-indigo-600 shadow-xs' : 'text-slate-500 hover:text-slate-800'"
      >
        <ClipboardList class="w-3.5 h-3.5" />
        <span>ติดตามสถานะ</span>
      </button>
    </div>

    <!-- Tab 1: New Maintenance Request Form -->
    <div v-if="activeTab === 'new'" class="p-5 bg-white rounded-2xl border border-slate-100/90 shadow-xs space-y-4">
      <!-- Room Selector for Multi-room Tenants -->
      <div v-if="tenantRooms && tenantRooms.length > 1" class="space-y-1.5">
        <label class="block text-xs font-medium text-slate-700">เลือกห้องพัก <span class="text-rose-500">*</span></label>
        <select
          v-model="form.roomId"
          required
          class="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 focus:outline-hidden focus:border-indigo-400 font-medium"
        >
          <option v-for="room in tenantRooms" :key="room.id" :value="room.id">
            ห้อง {{ room.roomNumber }} {{ room.buildingName ? `(อาคาร ${room.buildingName})` : '' }}
          </option>
        </select>
      </div>

      <!-- Quick Category Select -->
      <div class="space-y-2">
        <label class="block text-xs font-medium text-slate-700">หมวดหมู่อุปกรณ์ที่ชำรุด</label>
        <div class="grid grid-cols-2 gap-2">
          <button
            type="button"
            @click="selectCategory('เครื่องปรับอากาศ / แอร์ไม่เย็น')"
            class="p-3 rounded-xl border text-left text-xs transition-all flex items-center gap-2.5 cursor-pointer"
            :class="form.title.includes('เครื่องปรับอากาศ') ? 'bg-indigo-50 border-indigo-200 text-indigo-700 font-semibold' : 'bg-slate-50/70 border-slate-100 text-slate-600 hover:bg-slate-100/70'"
          >
            <div class="w-7 h-7 rounded-lg bg-sky-50 text-sky-600 flex items-center justify-center shrink-0">
              <Snowflake class="w-3.5 h-3.5" />
            </div>
            <span class="truncate">แอร์ / ความเย็น</span>
          </button>
          <button
            type="button"
            @click="selectCategory('ระบบประปา / ก๊อกน้ำ / ท่อน้ำอุดตัน')"
            class="p-3 rounded-xl border text-left text-xs transition-all flex items-center gap-2.5 cursor-pointer"
            :class="form.title.includes('ประปา') ? 'bg-indigo-50 border-indigo-200 text-indigo-700 font-semibold' : 'bg-slate-50/70 border-slate-100 text-slate-600 hover:bg-slate-100/70'"
          >
            <div class="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
              <Droplets class="w-3.5 h-3.5" />
            </div>
            <span class="truncate">ประปา / ท่อน้ำ</span>
          </button>
          <button
            type="button"
            @click="selectCategory('ระบบไฟฟ้า / หลอดไฟ / ปลั๊กไฟ')"
            class="p-3 rounded-xl border text-left text-xs transition-all flex items-center gap-2.5 cursor-pointer"
            :class="form.title.includes('ไฟฟ้า') ? 'bg-indigo-50 border-indigo-200 text-indigo-700 font-semibold' : 'bg-slate-50/70 border-slate-100 text-slate-600 hover:bg-slate-100/70'"
          >
            <div class="w-7 h-7 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
              <Zap class="w-3.5 h-3.5" />
            </div>
            <span class="truncate">ไฟฟ้า / แสงสว่าง</span>
          </button>
          <button
            type="button"
            @click="selectCategory('เฟอร์นิเจอร์ / ประตู / อุปกรณ์ชำรุด')"
            class="p-3 rounded-xl border text-left text-xs transition-all flex items-center gap-2.5 cursor-pointer"
            :class="form.title.includes('เฟอร์นิเจอร์') ? 'bg-indigo-50 border-indigo-200 text-indigo-700 font-semibold' : 'bg-slate-50/70 border-slate-100 text-slate-600 hover:bg-slate-100/70'"
          >
            <div class="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
              <DoorClosed class="w-3.5 h-3.5" />
            </div>
            <span class="truncate">เฟอร์นิเจอร์ / ประตู</span>
          </button>
        </div>
      </div>

      <form @submit.prevent="handleSubmit" class="space-y-3.5">
        <div class="space-y-1">
          <label class="block text-xs font-medium text-slate-700">หัวข้อเรื่องแจ้งซ่อม <span class="text-rose-500">*</span></label>
          <input
            v-model="form.title"
            type="text"
            placeholder="เช่น หลังคารั่ว, แอร์ไม่เย็น, ท่อน้ำตัน"
            required
            class="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-hidden focus:border-indigo-400"
          />
        </div>

        <div class="space-y-1">
          <label class="block text-xs font-medium text-slate-700">รายละเอียดปัญหา <span class="text-rose-500">*</span></label>
          <textarea
            v-model="form.description"
            rows="3"
            placeholder="ระบุรายละเอียดอาการหรือตำแหน่งที่พบปัญหา..."
            required
            class="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-hidden focus:border-indigo-400 leading-relaxed"
          ></textarea>
        </div>

        <div class="space-y-1">
          <label class="block text-xs font-medium text-slate-700">รูปถ่ายประกอบ (ถ้ามี)</label>
          <input
            type="file"
            accept="image/*"
            @change="handleFileChange"
            class="block w-full text-xs text-slate-500 file:mr-3 file:py-2 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-medium file:bg-indigo-50 file:text-indigo-600 hover:file:bg-indigo-100 cursor-pointer"
          />
        </div>

        <div v-if="previewUrl" class="text-center pt-1">
          <img :src="previewUrl" class="h-32 mx-auto object-cover rounded-xl border border-slate-200 shadow-xs" />
        </div>

        <button
          type="submit"
          :disabled="submitting"
          class="w-full py-3 bg-indigo-500 hover:bg-indigo-600 text-white rounded-xl font-semibold text-xs transition-colors shadow-xs disabled:opacity-50 cursor-pointer flex items-center justify-center gap-1.5"
        >
          <Wrench class="w-4 h-4" />
          <span>{{ submitting ? 'กำลังบันทึกข้อมูล...' : 'ส่งข้อมูลแจ้งซ่อม' }}</span>
        </button>
      </form>
    </div>

    <!-- Tab 2: Status Tracking Timeline List -->
    <div v-else class="space-y-3">
      <div v-if="loading" class="p-8 bg-white rounded-2xl border border-slate-100/80 text-center text-slate-400 text-xs shadow-xs">
        <div class="animate-spin w-6 h-6 border-2 border-indigo-400 border-t-transparent rounded-full mx-auto mb-2.5"></div>
        กำลังโหลดรายการแจ้งซ่อม...
      </div>

      <div v-else class="space-y-3">
        <div
          v-for="item in requests"
          :key="item.id"
          class="p-4 sm:p-5 bg-white rounded-2xl border border-slate-100/90 shadow-xs space-y-3"
        >
          <div class="flex items-start justify-between gap-3">
            <div class="space-y-1">
              <div class="font-bold text-slate-800 text-sm">
                {{ item.title }}
              </div>
              <span v-if="item.room?.roomNumber" class="inline-block px-2 py-0.5 bg-slate-100 text-slate-600 font-medium text-[11px] rounded-full">
                ห้อง {{ item.room.roomNumber }}
              </span>
            </div>
            <span
              class="text-[11px] font-semibold px-2.5 py-1 rounded-full border shrink-0 inline-flex items-center gap-1"
              :class="{
                'bg-amber-50 border-amber-200/70 text-amber-700': item.status === 'pending',
                'bg-sky-50 border-sky-200/70 text-sky-700': item.status === 'in_progress',
                'bg-emerald-50 border-emerald-200/70 text-emerald-700': item.status === 'resolved' || item.status === 'completed'
              }"
            >
              <Clock v-if="item.status === 'pending'" class="w-3 h-3" />
              <Wrench v-else-if="item.status === 'in_progress'" class="w-3 h-3" />
              <CheckCircle2 v-else class="w-3 h-3" />
              {{ formatStatus(item.status) }}
            </span>
          </div>

          <p class="text-xs text-slate-600 leading-relaxed">{{ item.description }}</p>

          <div v-if="item.imageUrl || item.photoUrl" class="pt-1">
            <a :href="item.imageUrl || item.photoUrl" target="_blank" class="inline-block">
              <img :src="item.imageUrl || item.photoUrl" class="h-24 rounded-xl object-cover border border-slate-100" />
            </a>
          </div>

          <!-- Technician & Cost Info Box -->
          <div v-if="item.technicianName || Number(item.repairCost || 0) > 0" class="p-3 bg-slate-50 rounded-xl border border-slate-100 text-xs space-y-1">
            <div v-if="item.technicianName" class="text-slate-700 flex items-center gap-1.5">
              <UserCheck class="w-3.5 h-3.5 text-slate-400" />
              <span>ช่างผู้รับผิดชอบ: <strong class="font-medium text-slate-800">{{ item.technicianName }}</strong></span>
            </div>
            <div v-if="Number(item.repairCost || 0) > 0" class="text-emerald-700 flex items-center gap-1.5 font-medium">
              <DollarSign class="w-3.5 h-3.5 text-emerald-500" />
              <span>ค่าซ่อม/อุปกรณ์: ฿{{ Number(item.repairCost).toLocaleString() }}</span>
            </div>
          </div>

          <!-- Admin Reply Note Box -->
          <div v-if="item.adminNote" class="p-3 bg-indigo-50/60 border border-indigo-100/70 rounded-xl text-xs space-y-1">
            <div class="font-medium text-indigo-700 flex items-center gap-1.5">
              <MessageSquare class="w-3.5 h-3.5" />
              <span>การตอบกลับจากเจ้าหน้าที่:</span>
            </div>
            <p class="text-slate-600 leading-normal pl-5">{{ item.adminNote }}</p>
          </div>

          <div class="text-[10px] text-slate-400 text-right pt-2 border-t border-slate-100">
            แจ้งเมื่อ: {{ new Date(item.createdAt).toLocaleString('th-TH', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) }}
          </div>
        </div>

        <div v-if="requests.length === 0" class="p-10 bg-white rounded-2xl border border-slate-100/80 text-center space-y-2 shadow-xs">
          <div class="w-10 h-10 rounded-2xl bg-slate-50 text-slate-400 flex items-center justify-center mx-auto">
            <Wrench class="w-5 h-5" />
          </div>
          <p class="text-xs font-medium text-slate-500">ยังไม่มีรายการแจ้งซ่อมในระบบ</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, watch } from 'vue';
import { useRoute } from 'vue-router';
import {
  Wrench,
  ClipboardList,
  Plus,
  Snowflake,
  Droplets,
  Zap,
  DoorClosed,
  Clock,
  CheckCircle2,
  UserCheck,
  DollarSign,
  MessageSquare
} from 'lucide-vue-next';
import api from '@/utils/api';
import { initLiff, isLiffLoggedIn, getLiffProfile } from '@/utils/liff';
import { showSuccess, showError } from '@/utils/swal';

const route = useRoute();
const activeTab = ref('new');
const loading = ref(false);
const submitting = ref(false);
const requests = ref([]);
const tenantRooms = ref([]);
const lineUserId = ref('');
const selectedFile = ref(null);
const previewUrl = ref('');

const form = reactive({
  title: 'เครื่องปรับอากาศ / แอร์ไม่เย็น',
  description: '',
  roomId: ''
});

onMounted(async () => {
  try {
    await initLiff();
    if (isLiffLoggedIn()) {
      const profile = await getLiffProfile();
      if (profile?.userId) {
        lineUserId.value = profile.userId;
      }
    }
  } catch (err) {
    console.warn('LIFF init fallback mode:', err.message);
  }

  await fetchTenantProfile();
  fetchRequests();
});

watch(activeTab, (newTab) => {
  if (newTab === 'tracking') {
    fetchRequests();
  }
});

const selectCategory = (catName) => {
  form.title = catName;
};

const fetchTenantProfile = async () => {
  try {
    const params = {};
    if (lineUserId.value) params.lineUserId = lineUserId.value;
    const res = await api.get('/api/v1/liff/profile', { params });
    if (res.data?.success && res.data?.data) {
      tenantRooms.value = res.data.data.rooms || [];
      const targetRoomId = route.query.roomId || localStorage.getItem('active_tenant_room_id');
      const matched = tenantRooms.value.find((r) => r.id === targetRoomId || r.roomNumber === route.query.room);
      if (matched) {
        form.roomId = matched.id;
      } else if (tenantRooms.value.length > 0 && !form.roomId) {
        form.roomId = tenantRooms.value[0].id;
      }
    }
  } catch (err) {
    console.warn('Could not fetch tenant profile for maintenance rooms:', err.message);
  }
};

const fetchRequests = async () => {
  loading.value = true;
  try {
    const params = {};
    if (lineUserId.value) params.lineUserId = lineUserId.value;

    const res = await api.get('/api/v1/liff/maintenance', { params });
    requests.value = res.data.data || [];
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
    if (form.roomId) {
      formData.append('roomId', form.roomId);
    }
    if (selectedFile.value) {
      formData.append('file', selectedFile.value);
    }
    if (lineUserId.value) {
      formData.append('lineUserId', lineUserId.value);
    }

    await api.post('/api/v1/liff/maintenance', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });

    await showSuccess('สำเร็จ', 'บันทึกข้อมูลการแจ้งซ่อมเรียบร้อยแล้ว');
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
    pending: 'รอดำเนินการ',
    in_progress: 'กำลังดำเนินการ',
    resolved: 'เสร็จสิ้น',
    completed: 'เสร็จสิ้น'
  };
  return map[status] || status;
};
</script>

