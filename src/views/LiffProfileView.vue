<template>
  <div class="space-y-5 pb-6 font-sans text-slate-800 selection:bg-indigo-500 selection:text-white">
    <!-- Loading Skeleton State -->
    <div v-if="loading" class="space-y-4 animate-pulse">
      <!-- Header Skeleton -->
      <div class="p-5 sm:p-6 rounded-2xl bg-slate-200/70 skeleton-shimmer space-y-3.5">
        <div class="flex items-start gap-3.5">
          <div class="w-14 h-14 rounded-full bg-slate-300/80 shrink-0"></div>
          <div class="space-y-2 flex-1 pt-1">
            <div class="h-4 w-32 bg-slate-300/80 rounded-lg"></div>
            <div class="h-3 w-24 bg-slate-300/60 rounded-md"></div>
            <div class="h-5 w-20 bg-slate-300/60 rounded-full"></div>
          </div>
        </div>
        <div class="pt-3 border-t border-slate-300/40 flex justify-between">
          <div class="h-7 w-24 bg-slate-300/60 rounded-xl"></div>
          <div class="h-7 w-24 bg-slate-300/60 rounded-xl"></div>
        </div>
      </div>

      <!-- Quick Actions Skeleton (Grid responsive) -->
      <div class="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div v-for="i in 4" :key="i" class="p-4 rounded-2xl bg-white border border-slate-100 shadow-xs space-y-2.5">
          <div class="w-9 h-9 rounded-xl bg-slate-100 skeleton-shimmer"></div>
          <div class="h-3.5 w-20 bg-slate-100 rounded-md skeleton-shimmer"></div>
          <div class="h-2.5 w-28 bg-slate-100 rounded-md skeleton-shimmer"></div>
        </div>
      </div>
    </div>

    <!-- Loaded Content -->
    <div v-else class="space-y-5">
      <!-- Session Expired / Not Verified Warning Card -->
      <div v-if="sessionExpired" class="p-4 bg-amber-50 border border-amber-200/70 rounded-2xl space-y-3 shadow-xs">
        <div class="flex items-center justify-between text-xs font-semibold text-amber-900">
          <span>เซสชัน LINE หมดอายุ หรือยังไม่ได้ยืนยันตัวตน</span>
          <span class="text-[10px] bg-amber-200/70 text-amber-900 px-2 py-0.5 rounded-full font-semibold">
            Expired
          </span>
        </div>
        <p class="text-xs text-amber-800 leading-relaxed">
          ไม่พบการเข้าสู่ระบบ LINE หรือ Token หมดอายุ กรุณากดปุ่มด้านล่างเพื่อยืนยันตัวตนผ่าน LINE
        </p>
        <button
          @click="loginLiff()"
          class="w-full py-2.5 px-4 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl text-xs font-semibold transition-colors shadow-xs flex items-center justify-center gap-2 cursor-pointer"
        >
          <span>เข้าสู่ระบบด้วย LINE เพื่อต่ออายุเซสชัน</span>
        </button>
      </div>

      <!-- 1. Header Section: Profile & Digital ID Card -->
      <div
        class="p-5 sm:p-6 text-white rounded-2xl shadow-xs relative overflow-hidden transition-all duration-500"
        :style="{
          background: `linear-gradient(135deg, ${themeColor}, ${adjustBrightness(themeColor, -25)})`
        }"
      >
        <div class="flex items-start justify-between gap-3.5 flex-wrap sm:flex-nowrap">
          <div class="flex items-center gap-3.5">
            <!-- Avatar จาก LINE Profile -->
            <div class="relative shrink-0">
              <img
                v-if="tenantProfile.avatarUrl && !imageLoadError"
                :src="tenantProfile.avatarUrl"
                alt="Tenant Avatar"
                class="w-14 h-14 rounded-full object-cover border-2 border-white/80 shadow-xs bg-white/20"
                @error="handleAvatarError"
              />
              <div
                v-else
                class="w-14 h-14 rounded-full bg-white/20 backdrop-blur-xs border-2 border-white/80 shadow-xs flex items-center justify-center text-xl font-bold text-white select-none"
              >
                {{ tenantInitial }}
              </div>
              <span class="absolute bottom-0 right-0 w-3 h-3 bg-emerald-400 border-2 border-white rounded-full"></span>
            </div>

            <!-- ข้อมูลชื่อ และ Badge หมายเลขห้องพัก -->
            <div class="space-y-1">
              <h1 class="font-bold text-base sm:text-lg truncate text-white">
                {{ tenantProfile.firstName }} {{ tenantProfile.lastName }}
              </h1>
              <p class="text-xs text-indigo-100/90 font-mono">{{ tenantProfile.phone || '-' }}</p>

              <!-- Current Active Room Badge -->
              <div class="pt-0.5">
                <span class="px-2.5 py-0.5 bg-white/20 backdrop-blur-xs text-white font-medium text-[11px] rounded-full border border-white/30 inline-flex items-center gap-1.5">
                  <span class="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                  <span>ห้อง {{ selectedRoom?.roomNumber || tenantProfile.roomNumber || '-' }}</span>
                  <span v-if="selectedRoom?.buildingName || tenantProfile.buildingName" class="text-[10px] text-white/80">
                    ({{ selectedRoom?.buildingName || tenantProfile.buildingName }})
                  </span>
                </span>
              </div>
            </div>
          </div>

          <!-- Action Bar: Digital ID & Link More Rooms -->
          <div class="flex items-center gap-2 self-end sm:self-center w-full sm:w-auto pt-2 sm:pt-0 border-t sm:border-t-0 border-white/20 justify-end">
            <button
              @click="showLinkRoomModal = true"
              class="px-3 py-1.5 bg-white/15 hover:bg-white/25 text-white rounded-xl text-xs font-medium transition-colors border border-white/20 flex items-center gap-1.5 cursor-pointer"
            >
              <PlusCircle class="w-3.5 h-3.5" />
              <span>ผูกห้องเพิ่ม</span>
            </button>

            <button
              @click="showQrModal = true"
              class="px-3.5 py-1.5 bg-white/20 hover:bg-white/30 text-white rounded-xl text-xs font-semibold transition-colors border border-white/30 flex items-center gap-1.5 cursor-pointer"
            >
              <QrCode class="w-3.5 h-3.5" />
              <span>Digital ID</span>
            </button>
          </div>
        </div>
      </div>

      <!-- 2. Multi-Room Selector (Shown if > 1 room) -->
      <div v-if="tenantProfile.rooms && tenantProfile.rooms.length > 1" class="p-4 sm:p-5 bg-white rounded-2xl border border-slate-100 shadow-xs space-y-3">
        <div class="flex items-center justify-between">
          <div>
            <h2 class="text-xs font-bold text-slate-700">
              ห้องพักของคุณ ({{ tenantProfile.rooms.length }} ห้อง)
            </h2>
            <p class="text-[11px] text-slate-400 mt-0.5">แตะที่ห้องเพื่อสลับดูข้อมูล</p>
          </div>
          <button
            @click="showLinkRoomModal = true"
            class="text-xs font-semibold hover:opacity-80 transition-opacity cursor-pointer flex items-center gap-1 text-indigo-600"
            :style="{ color: themeColor }"
          >
            <PlusCircle class="w-3.5 h-3.5" />
            <span>ผูกห้องเพิ่ม</span>
          </button>
        </div>

        <!-- Room Selector Buttons Grid -->
        <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
          <button
            v-for="room in tenantProfile.rooms"
            :key="room.id"
            @click="selectRoom(room)"
            class="p-3 sm:p-3.5 rounded-2xl border text-left transition-all duration-200 flex items-center justify-between gap-3 cursor-pointer relative overflow-hidden active:scale-[0.99]"
            :class="selectedRoomId === room.id 
              ? 'bg-indigo-50/60 border-indigo-200 shadow-2xs' 
              : 'bg-slate-50/60 hover:bg-slate-100/70 border-slate-100/90 text-slate-600'"
          >
            <!-- Left: Room Icon & Room Details -->
            <div class="flex items-center gap-3 min-w-0 flex-1">
              <div
                class="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 transition-all duration-200"
                :class="selectedRoomId === room.id 
                  ? 'bg-indigo-600 text-white shadow-xs' 
                  : 'bg-white text-slate-500 border border-slate-200/60'"
                :style="selectedRoomId === room.id ? { backgroundColor: themeColor } : {}"
              >
                <DoorClosed class="w-4.5 h-4.5" />
              </div>
              
              <div class="min-w-0 flex-1">
                <div class="flex items-center gap-1.5 flex-wrap">
                  <span
                    class="text-xs font-bold truncate"
                    :class="selectedRoomId === room.id ? 'text-slate-900' : 'text-slate-700'"
                  >
                    ห้อง {{ room.roomNumber }}
                  </span>
                  <span
                    v-if="selectedRoomId === room.id"
                    class="px-1.5 py-0.5 text-[9px] font-bold rounded-md bg-indigo-100 text-indigo-700"
                    :style="{ backgroundColor: `${themeColor}18`, color: themeColor }"
                  >
                    ใช้งานอยู่
                  </span>
                </div>
                <div class="text-[10px] text-slate-400 truncate mt-0.5 font-medium">
                  {{ room.buildingName || 'อาคารหลัก' }}
                </div>
              </div>
            </div>

            <!-- Right: Check Indicator -->
            <div
              v-if="selectedRoomId === room.id"
              class="w-5 h-5 rounded-full flex items-center justify-center text-white shrink-0 shadow-2xs"
              :style="{ backgroundColor: themeColor }"
            >
              <Check class="w-3 h-3 stroke-[3]" />
            </div>
            <div
              v-else
              class="w-5 h-5 rounded-full border border-slate-200/80 shrink-0"
            ></div>
          </button>
        </div>
      </div>

      <!-- 3. Dynamic Quick Actions Grid (Responsive 2 to 4 cols) -->
      <div class="space-y-2.5" v-if="availableQuickActions.length > 0">
        <h2 class="text-xs font-semibold text-slate-400 uppercase tracking-wider px-0.5">
          เมนูด่วน
        </h2>

        <div class="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <button
            v-for="menu in availableQuickActions"
            :key="menu.id"
            @click="handleMenuClick(menu)"
            class="p-4 bg-white hover:bg-slate-50/80 rounded-2xl border border-slate-100 shadow-xs text-left transition-all group flex flex-col justify-between h-28 cursor-pointer active:scale-[0.99]"
          >
            <div
              class="w-9 h-9 rounded-xl flex items-center justify-center transition-transform group-hover:scale-105"
              :class="menu.bgClass"
            >
              <component :is="menu.icon" class="w-4.5 h-4.5" :class="menu.iconClass" />
            </div>
            <div>
              <div class="font-bold text-xs text-slate-800 group-hover:text-indigo-600 transition-colors">
                {{ menu.title }}
              </div>
              <div class="text-[10px] text-slate-400 font-medium truncate mt-0.5">{{ menu.subtitle }}</div>
            </div>
          </button>
        </div>
      </div>

      <!-- 4. Personal Profile & Settings Link Card -->
      <router-link
        to="/liff/settings"
        class="p-4 bg-white hover:bg-slate-50 rounded-2xl border border-slate-100 shadow-xs flex items-center justify-between transition-all group cursor-pointer block"
      >
        <div class="flex items-center gap-3 min-w-0">
          <div class="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center group-hover:scale-105 transition-transform shrink-0">
            <User class="w-4.5 h-4.5" />
          </div>
          <div class="min-w-0 flex-1">
            <div class="font-bold text-xs text-slate-800 group-hover:text-indigo-600 transition-colors flex items-center gap-1.5 flex-wrap">
              <span>โปรไฟล์และการตั้งค่า</span>
              <span class="px-2 py-0.5 text-[10px] font-semibold bg-indigo-50 text-indigo-600 rounded-full border border-indigo-100">Settings</span>
            </div>
            <div class="text-[11px] text-slate-400 font-medium mt-0.5 truncate">
              เปลี่ยนรหัส PIN, ข้อมูลผู้เช่า, รถยนต์/มอเตอร์ไซค์
            </div>
          </div>
        </div>
        <div class="w-7 h-7 rounded-xl bg-slate-50 group-hover:bg-indigo-50 group-hover:text-indigo-600 flex items-center justify-center transition-all text-slate-400 shrink-0 ml-2">
          <ChevronRight class="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
        </div>
      </router-link>
    </div>

    <!-- Digital ID QR Code Modal -->
    <div v-if="showQrModal" class="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
      <div class="bg-white rounded-2xl p-6 max-w-sm w-full shadow-lg space-y-4 border border-slate-100 text-center relative">
        <button @click="showQrModal = false" class="absolute top-4 right-4 text-slate-400 hover:text-slate-700 p-1">
          <X class="w-5 h-5" />
        </button>

        <div class="space-y-1 pt-2">
          <h3 class="text-base font-bold text-slate-900">Digital Tenant ID</h3>
          <p class="text-xs text-slate-500">แสดง QR Code นี้แก่เจ้าหน้าที่หอพัก</p>
        </div>

        <div class="py-2">
          <img :src="digitalIdQrUrl" alt="Digital ID QR" class="w-48 h-48 mx-auto rounded-xl border border-slate-100 p-1 bg-white" />
        </div>

        <div class="p-3 bg-slate-50 rounded-xl text-xs space-y-1 text-slate-600 font-mono">
          <div>ผู้เช่า: <span class="font-bold text-slate-800">{{ tenantProfile.firstName }} {{ tenantProfile.lastName }}</span></div>
          <div>ห้องพัก: <span class="font-bold text-indigo-600">{{ formattedRooms }}</span></div>
        </div>

        <button
          @click="showQrModal = false"
          class="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition-colors"
        >
          ปิดหน้าต่าง
        </button>
      </div>
    </div>

    <!-- Link Room Modal -->
    <div v-if="showLinkRoomModal" class="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
      <div class="bg-white rounded-2xl p-6 max-w-sm w-full shadow-lg space-y-4 border border-slate-100 relative">
        <button @click="showLinkRoomModal = false" class="absolute top-4 right-4 text-slate-400 hover:text-slate-700 p-1">
          <X class="w-5 h-5" />
        </button>

        <div class="space-y-1 pt-2 text-center">
          <h3 class="text-base font-bold text-slate-900">ผูกห้องพักเพิ่มเติม</h3>
          <p class="text-xs text-slate-500">กรอกรหัสเชิญ (Invite Code) ที่ได้รับจากเจ้าหน้าที่หอพัก</p>
        </div>

        <form @submit.prevent="handleLinkRoom" class="space-y-3">
          <div class="space-y-1">
            <label class="block text-xs font-medium text-slate-700">รหัสเชิญห้องพัก</label>
            <input
              v-model="inviteCodeInput"
              type="text"
              placeholder="เช่น ROOM-A102-XYZ"
              required
              class="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 font-mono text-center uppercase focus:outline-hidden focus:border-indigo-400"
            />
          </div>

          <div class="flex gap-2 pt-2">
            <button
              type="button"
              @click="showLinkRoomModal = false"
              class="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-medium text-xs transition-colors"
            >
              ยกเลิก
            </button>
            <button
              type="submit"
              :disabled="linkingRoom"
              class="flex-1 py-2.5 bg-indigo-500 hover:bg-indigo-600 text-white rounded-xl font-semibold text-xs transition-colors disabled:opacity-50"
            >
              {{ linkingRoom ? 'กำลังผูกห้อง...' : 'ยืนยันผูกห้อง' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useAuthStore } from '@/stores/auth';
import { useFeatureStore } from '@/stores/useFeatureStore';
import { useDynamicTheme } from '@/composables/useDynamicTheme';
import { initLiff, isLiffLoggedIn, getLiffProfile, loginLiff } from '@/utils/liff';
import api from '@/utils/api';
import { showSuccess, showError } from '@/utils/swal';
import QRCode from 'qrcode';
import {
  CreditCard,
  Wrench,
  Package,
  Megaphone,
  User,
  QrCode,
  ChevronRight,
  PlusCircle,
  X,
  DoorClosed,
  Check
} from 'lucide-vue-next';

const router = useRouter();
const route = useRoute();
const authStore = useAuthStore();
const featureStore = useFeatureStore();
const { themeColor, applyTheme, adjustBrightness } = useDynamicTheme();

const loading = ref(true);
const showQrModal = ref(false);
const showLinkRoomModal = ref(false);
const sessionExpired = ref(false);
const imageLoadError = ref(false);
const inviteCodeInput = ref('');
const linkingRoom = ref(false);
const digitalIdQrUrl = ref('');
const currentLineUserId = ref('');

const tenantProfile = reactive({
  firstName: '',
  lastName: '',
  roomNumber: '',
  rooms: [],
  phone: '',
  avatarUrl: ''
});

const tenantInitial = computed(() => {
  if (tenantProfile.firstName && tenantProfile.firstName.trim()) {
    return tenantProfile.firstName.trim().charAt(0).toUpperCase();
  }
  return 'U';
});

const handleAvatarError = () => {
  imageLoadError.value = true;
};

const selectedRoomId = ref('');

const selectedRoom = computed(() => {
  if (!tenantProfile.rooms || tenantProfile.rooms.length === 0) return null;
  return tenantProfile.rooms.find((r) => r.id === selectedRoomId.value) || tenantProfile.rooms[0];
});

const selectRoom = (room) => {
  if (!room) return;
  selectedRoomId.value = room.id;
  localStorage.setItem('active_tenant_room_id', room.id);
  tenantProfile.roomNumber = room.roomNumber;
  applyTheme(room);
};

const formattedRooms = computed(() => {
  if (tenantProfile.rooms && tenantProfile.rooms.length > 0) {
    return tenantProfile.rooms.map((r) => `ห้อง ${r.roomNumber}`).join(', ');
  }
  return `ห้อง ${tenantProfile.roomNumber || '-'}`;
});

const fetchTenantProfile = async (lineUserId = '') => {
  try {
    const params = {};
    if (lineUserId) params.lineUserId = lineUserId;
    if (route.query.room) params.room = route.query.room;
    if (route.query.roomNumber) params.roomNumber = route.query.roomNumber;
    if (route.query.tenantId) params.tenantId = route.query.tenantId;

    const res = await api.get('/api/v1/liff/profile', { params });
    if (res.data?.success && res.data?.data) {
      sessionExpired.value = false;
      const data = res.data.data;
      tenantProfile.firstName = data.firstName || 'ผู้เช่า';
      tenantProfile.lastName = data.lastName || '';
      tenantProfile.roomNumber = data.roomNumber || '-';
      tenantProfile.rooms = data.rooms || [];
      tenantProfile.phone = data.phone || '';
      if (data.linePictureUrl) {
        tenantProfile.avatarUrl = data.linePictureUrl;
      }

      if (tenantProfile.rooms.length > 0) {
        const storedRoomId = localStorage.getItem('active_tenant_room_id');
        const matched = tenantProfile.rooms.find((r) => r.id === storedRoomId) || tenantProfile.rooms[0];
        selectedRoomId.value = matched.id;
        tenantProfile.roomNumber = matched.roomNumber;
        applyTheme(matched);
      } else {
        applyTheme(data);
      }
    }
  } catch (err) {
    console.warn('Failed to fetch tenant profile from API:', err.message);
    if (err.response?.status === 401 || err.response?.status === 403 || !isLiffLoggedIn()) {
      sessionExpired.value = true;
      authStore.clearLiffAuth();
      router.replace('/liff');
      return;
    }
  } finally {
    loading.value = false;
  }
};

const handleLinkRoom = async () => {
  if (!inviteCodeInput.value.trim()) return;
  linkingRoom.value = true;
  try {
    const rawName = `${tenantProfile.firstName || ''} ${tenantProfile.lastName || ''}`.trim() || 'ลูกบ้าน';
    const nameParts = rawName.split(' ');
    const firstName = tenantProfile.firstName || nameParts[0] || 'ลูกบ้าน';
    const lastName = tenantProfile.lastName || (nameParts.length > 1 ? nameParts.slice(1).join(' ') : '-');

    const payload = {
      inviteCode: inviteCodeInput.value.trim().toUpperCase(),
      firstName,
      lastName,
      phone: tenantProfile.phone || '0800000000',
      lineDisplayName: firstName,
      linePictureUrl: tenantProfile.avatarUrl || undefined
    };

    const res = await api.post('/api/v1/liff/register/invite', payload);
    if (res.data?.success) {
      await showSuccess('สำเร็จ', 'เพิ่มห้องพักใหม่เข้าสู่บัญชีของคุณเรียบร้อยแล้ว');
      showLinkRoomModal.value = false;
      inviteCodeInput.value = '';
      await fetchTenantProfile(currentLineUserId.value);
    }
  } catch (err) {
    showError('เกิดข้อผิดพลาด', err.response?.data?.message || 'ไม่สามารถผูกห้องพักได้');
  } finally {
    linkingRoom.value = false;
  }
};

// Quick Actions Grid Config
const quickActionsConfig = [
  {
    id: 'invoices',
    title: 'บิลค่าเช่า',
    subtitle: 'ชำระเงิน & ดูยอดเงิน',
    icon: CreditCard,
    bgClass: 'bg-indigo-50',
    iconClass: 'text-indigo-600',
    route: '/liff/invoices',
    featureKey: 'ENABLE_LINE_PAYMENT'
  },
  {
    id: 'maintenance',
    title: 'แจ้งซ่อม',
    subtitle: 'ส่งเรื่อง & ติดตามสถานะ',
    icon: Wrench,
    bgClass: 'bg-amber-50',
    iconClass: 'text-amber-600',
    route: '/liff/maintenance',
    featureKey: 'ENABLE_MAINTENANCE_REQUEST'
  },
  {
    id: 'parcels',
    title: 'พัสดุของฉัน',
    subtitle: 'แจ้งเตือน & สแกนรับของ',
    icon: Package,
    bgClass: 'bg-orange-50',
    iconClass: 'text-orange-600',
    route: '/liff/parcels',
    featureKey: 'ENABLE_PARCEL_NOTIFY'
  },
  {
    id: 'announcements',
    title: 'ข่าวสาร & ประกาศ',
    subtitle: 'ประกาศสำคัญจากหอพัก',
    icon: Megaphone,
    bgClass: 'bg-sky-50',
    iconClass: 'text-sky-600',
    route: '/liff/announcements',
    featureKey: 'ENABLE_TENANT_PORTAL'
  }
];

const availableQuickActions = computed(() => {
  return quickActionsConfig.filter((menu) => {
    if (!menu.featureKey) return true;
    return featureStore.isEnabled(menu.featureKey);
  });
});

const handleMenuClick = (menu) => {
  if (menu.route) {
    const query = {};
    if (selectedRoom.value?.roomNumber) query.room = selectedRoom.value.roomNumber;
    if (selectedRoom.value?.id) query.roomId = selectedRoom.value.id;
    router.push({ path: menu.route, query });
  }
};

onMounted(async () => {
  featureStore.fetchFeatures();

  try {
    await initLiff();
    if (isLiffLoggedIn()) {
      const profile = await getLiffProfile();
      if (profile?.userId) {
        currentLineUserId.value = profile.userId;
        if (profile.pictureUrl) {
          tenantProfile.avatarUrl = profile.pictureUrl;
          imageLoadError.value = false;
        }
      }
    } else if (!authStore.liffToken && !localStorage.getItem('dev_line_user_id')) {
      authStore.clearLiffAuth();
      router.replace('/liff');
      return;
    }
  } catch (err) {
    console.warn('LIFF init fallback mode:', err.message);
  }

  await fetchTenantProfile(currentLineUserId.value);

  if (currentLineUserId.value || tenantProfile.phone) {
    api.patch('/api/v1/liff/auth/sync-profile', {
      lineUserId: currentLineUserId.value || undefined,
      lineDisplayName: tenantProfile.firstName,
      linePictureUrl: tenantProfile.avatarUrl,
      phone: tenantProfile.phone || undefined,
      roomNumber: tenantProfile.roomNumber || undefined
    }).catch(() => {});
  }

  const payload = `TENANT-ID:${tenantProfile.firstName}-ROOMS-${tenantProfile.roomNumber}-${Date.now()}`;
  digitalIdQrUrl.value = await QRCode.toDataURL(payload, { margin: 1, width: 260 });
});
</script>
