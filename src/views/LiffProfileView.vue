<template>
  <div class="space-y-6 pb-6 font-sans text-slate-900 selection:bg-indigo-600 selection:text-white relative">
    <!-- Ambient Glassmorphism Soft Accent Blurs -->
    <div class="absolute inset-0 overflow-hidden pointer-events-none z-0">
      <div class="absolute -top-24 -left-24 w-80 h-80 bg-indigo-200/50 rounded-full blur-3xl"></div>
      <div class="absolute top-1/3 -right-24 w-80 h-80 bg-purple-200/50 rounded-full blur-3xl"></div>
    </div>

    <div class="space-y-6 relative z-10">
      <!-- Session Expired / Not Verified Warning Card -->
      <div v-if="sessionExpired" class="p-4 bg-amber-50 border border-amber-200/90 rounded-3xl space-y-3 shadow-md">
        <div class="flex items-center justify-between text-xs font-bold text-amber-900">
          <div class="flex items-center gap-2">
            <span>🔑</span>
            <span>เซสชัน LINE หมดอายุ หรือยังไม่ได้ยืนยันตัวตน</span>
          </div>
          <span class="text-[10px] bg-amber-200/80 text-amber-900 px-2 py-0.5 rounded-full font-bold">
            Session Expired
          </span>
        </div>
        <p class="text-[11px] text-amber-800 leading-relaxed">
          ไม่พบการเข้าสู่ระบบ LINE หรือ Token หมดอายุ กรุณากดปุ่มด้านล่างเพื่อยืนยันตัวตนผ่าน LINE บัญชีของคุณ
        </p>
        <button
          @click="loginLiff()"
          class="w-full py-3 px-4 bg-[#06C755] hover:bg-[#05B34C] active:bg-[#049B42] text-white rounded-2xl text-xs font-extrabold transition-all shadow-md shadow-emerald-600/30 flex items-center justify-center gap-2 cursor-pointer"
        >
          <span class="text-sm">💬</span>
          <span>เข้าสู่ระบบด้วย LINE เพื่อต่ออายุเซสชัน (Verify LINE)</span>
        </button>
      </div>

      <!-- 1. Header Section: Profile & Digital ID Card -->
      <div
        class="p-6 text-white rounded-3xl shadow-xl relative overflow-hidden transition-all duration-500"
        :style="{
          background: `linear-gradient(135deg, ${themeColor}, ${adjustBrightness(themeColor, -25)})`,
          boxShadow: `0 20px 25px -5px ${themeColor}33, 0 8px 10px -6px ${themeColor}33`
        }"
      >
        <!-- Background Pattern Decor -->
        <div class="absolute -right-8 -bottom-8 w-36 h-36 bg-white/10 rounded-full blur-xl pointer-events-none"></div>

        <!-- Quick Logout button on Profile Card -->
        <button
          @click.stop="handleTenantLogout"
          class="absolute top-3.5 right-3.5 px-2.5 py-1 bg-white/15 hover:bg-rose-600 active:bg-rose-700 text-white rounded-xl text-[11px] font-bold transition-all border border-white/20 flex items-center gap-1 backdrop-blur-xs cursor-pointer shadow-xs active:scale-95 z-10"
          title="ออกจากระบบ"
        >
          <LogOut class="w-3.5 h-3.5" />
          <span>ออกจากระบบ</span>
        </button>

        <div class="flex items-start gap-4">
          <!-- Avatar จาก LINE Profile -->
          <div class="relative shrink-0">
            <img
              v-if="tenantProfile.avatarUrl && !imageLoadError"
              :src="tenantProfile.avatarUrl"
              alt="Tenant Avatar"
              class="w-16 h-16 rounded-full object-cover border-2 border-white/80 shadow-md bg-white/20"
              @error="handleAvatarError"
            />
            <div
              v-else
              class="w-16 h-16 rounded-full bg-white/20 backdrop-blur-xs border-2 border-white/80 shadow-md flex items-center justify-center text-2xl font-black text-white select-none"
            >
              {{ tenantInitial }}
            </div>
            <span class="absolute bottom-0 right-0 w-4 h-4 bg-emerald-400 border-2 border-white rounded-full"></span>
          </div>

          <!-- ข้อมูลชื่อ และ Badge หมายเลขห้องพัก -->
          <div class="space-y-1.5 flex-1 min-w-0">
            <h1 class="font-extrabold text-lg sm:text-xl truncate text-white">
              {{ tenantProfile.firstName }} {{ tenantProfile.lastName }}
            </h1>
            <p class="text-xs text-indigo-100 font-mono">{{ tenantProfile.phone || '081-234-5678' }}</p>

            <!-- Room Badges (Interactive Switcher) -->
            <div class="flex flex-wrap gap-1.5 pt-1">
              <template v-if="tenantProfile.rooms && tenantProfile.rooms.length > 0">
                <button
                  v-for="room in tenantProfile.rooms"
                  :key="room.id"
                  @click.stop="selectRoom(room)"
                  class="px-2.5 py-1 text-[11px] font-black rounded-full shadow-xs inline-flex items-center gap-1.5 shrink-0 transition-all cursor-pointer"
                  :class="room.id === selectedRoomId ? 'bg-yellow-400 text-slate-950 ring-2 ring-white scale-105 shadow-md' : 'bg-white/20 hover:bg-white/30 text-white backdrop-blur-xs'"
                >
                  <span class="w-1.5 h-1.5 rounded-full" :class="room.id === selectedRoomId ? 'bg-emerald-600' : 'bg-white/70'"></span>
                  <span>ห้อง {{ room.roomNumber }}</span>
                  <span v-if="room.buildingName" class="font-normal text-[10px]" :class="room.id === selectedRoomId ? 'text-slate-800' : 'text-indigo-100'">({{ room.buildingName }})</span>
                </button>
              </template>
              <span v-else class="px-2.5 py-0.5 bg-yellow-400 text-slate-950 font-black text-[11px] rounded-full shadow-xs shrink-0">
                ห้อง {{ tenantProfile.roomNumber || '-' }}
              </span>
            </div>
          </div>
        </div>

        <!-- Action Bar: Digital ID & Link More Rooms -->
        <div class="mt-5 pt-4 border-t border-white/20 flex items-center justify-between gap-2 flex-wrap">
          <button
            @click="showLinkRoomModal = true"
            class="px-3 py-1.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl text-xs font-bold transition-all border border-emerald-400/50 flex items-center gap-1.5 shadow-xs cursor-pointer"
          >
            <PlusCircle class="w-4 h-4" />
            <span>ผูกห้องพักเพิ่ม</span>
          </button>

          <button
            @click="showQrModal = true"
            class="px-3.5 py-1.5 bg-white/20 hover:bg-white/30 text-white rounded-xl text-xs font-bold transition-all border border-white/30 flex items-center gap-1.5 shadow-xs cursor-pointer"
          >
            <QrCode class="w-4 h-4" />
            <span>Digital ID Card</span>
          </button>
        </div>
      </div>

      <!-- 2. Multi-Room Summary Card & Interactive Switcher (Shown if > 1 room) -->
      <div v-if="tenantProfile.rooms && tenantProfile.rooms.length > 1" class="p-4 bg-white rounded-3xl border border-slate-200/90 shadow-sm space-y-3">
        <div class="flex items-center justify-between">
          <div>
            <h2 class="text-xs font-extrabold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
              <span>🏢</span>
              <span>ห้องพักที่คุณครอบครอง ({{ tenantProfile.rooms.length }} ห้อง)</span>
            </h2>
            <p class="text-[11px] text-slate-500 mt-0.5">แตะที่การ์ดเพื่อสลับห้องและเปลี่ยนธีมประจำตึกอัตโนมัติ</p>
          </div>
          <button
            @click="showLinkRoomModal = true"
            class="text-xs text-indigo-600 font-extrabold hover:text-indigo-800 transition-colors flex items-center gap-1 cursor-pointer"
          >
            <span>+ ผูกห้องเพิ่ม</span>
          </button>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          <div
            v-for="room in tenantProfile.rooms"
            :key="room.id"
            @click="selectRoom(room)"
            class="p-3.5 rounded-2xl border transition-all duration-200 cursor-pointer flex flex-col justify-between space-y-2.5 relative overflow-hidden active:scale-[0.99]"
            :class="room.id === selectedRoomId
              ? 'bg-gradient-to-br from-indigo-50/90 via-white to-indigo-50/50 border-2 border-indigo-500 shadow-md ring-2 ring-indigo-200/50'
              : 'bg-slate-50/70 hover:bg-slate-100/80 border border-slate-200/80 hover:border-slate-300 shadow-2xs'"
          >
            <!-- Card Header: Room number on left, Status badge on right -->
            <div class="flex items-center justify-between gap-2">
              <div class="font-extrabold text-sm text-slate-900 flex items-center gap-1.5 min-w-0 truncate">
                <span
                  class="w-2.5 h-2.5 rounded-full shrink-0"
                  :class="room.id === selectedRoomId ? 'bg-indigo-600 ring-2 ring-indigo-300 animate-pulse' : 'bg-slate-300'"
                ></span>
                <span class="truncate">ห้อง {{ room.roomNumber }}</span>
              </div>

              <!-- Active Status Badge (Prevent wrap & perfectly aligned) -->
              <span
                v-if="room.id === selectedRoomId"
                class="px-2 py-0.5 bg-indigo-600 text-white font-extrabold text-[10px] rounded-full shadow-2xs shrink-0 whitespace-nowrap inline-flex items-center gap-1"
              >
                <span>✓</span>
                <span>กำลังเลือก</span>
              </span>
              <span
                v-else
                class="text-[10px] font-semibold text-slate-400 shrink-0 whitespace-nowrap"
              >
                แตะเพื่อเลือก
              </span>
            </div>

            <!-- Card Body: Building info & Floor -->
            <div class="text-[11px] text-slate-600 font-medium truncate">
              <span v-if="room.buildingName" class="font-semibold text-slate-700">ตึก {{ room.buildingName }} • </span>ชั้น {{ room.floor || '1' }}
            </div>

            <!-- Card Footer: Rent price -->
            <div class="pt-2 border-t border-slate-200/60 flex items-center justify-between">
              <span class="text-[10px] text-slate-400 font-medium">ค่าเช่ารายเดือน</span>
              <div class="text-right font-mono">
                <span class="text-sm font-black text-indigo-600">฿{{ Number(room.price || 0).toLocaleString() }}</span>
                <span class="text-[10px] text-slate-400 font-sans ml-0.5">/เดือน</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 3. Dynamic Quick Actions Grid (เมนูด่วนใช้งานบ่อย 2x2 Grid) -->
      <div class="space-y-2.5" v-if="availableQuickActions.length > 0">
        <h2 class="text-xs font-extrabold text-slate-400 uppercase tracking-wider px-1">
          เมนูด่วน (Quick Actions)
        </h2>

        <div class="grid grid-cols-2 gap-3">
          <button
            v-for="menu in availableQuickActions"
            :key="menu.id"
            @click="handleMenuClick(menu)"
            class="p-4 bg-white hover:bg-slate-50/90 rounded-3xl border border-slate-200/80 shadow-xs text-left transition-all duration-200 group flex flex-col justify-between h-28 space-y-2 cursor-pointer hover:-translate-y-0.5 hover:shadow-md active:scale-[0.98]"
          >
            <div
              class="w-10 h-10 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform shadow-2xs"
              :class="menu.bgClass"
            >
              <component :is="menu.icon" class="w-5 h-5" :class="menu.iconClass" />
            </div>
            <div>
              <div class="font-extrabold text-sm text-slate-900 group-hover:text-indigo-600 transition-colors">
                {{ menu.title }}
              </div>
              <div class="text-[11px] text-slate-500 font-medium truncate">{{ menu.subtitle }}</div>
            </div>
          </button>
        </div>
      </div>

      <!-- 4. Personal Profile & Settings Banner / Card -->
      <router-link
        to="/liff/settings"
        class="p-4 bg-white hover:bg-slate-50 active:bg-slate-100 rounded-3xl border border-slate-200/90 shadow-xs flex items-center justify-between transition-all group cursor-pointer block"
      >
        <div class="flex items-center gap-3.5 min-w-0">
          <div class="w-11 h-11 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center group-hover:scale-105 transition-transform shadow-2xs shrink-0">
            <User class="w-5 h-5" />
          </div>
          <div class="min-w-0 flex-1">
            <div class="font-extrabold text-xs sm:text-sm text-slate-900 group-hover:text-indigo-600 transition-colors flex items-center gap-1.5 flex-wrap">
              <span>โปรไฟล์และการตั้งค่าส่วนตัว</span>
              <span class="px-2 py-0.5 text-[9px] font-extrabold bg-indigo-100 text-indigo-700 rounded-full">Profile & Settings</span>
            </div>
            <div class="text-[11px] text-slate-400 font-medium mt-0.5 truncate">
              เปลี่ยน PIN, ตั้งรหัสเว็บ, ข้อมูลผู้เช่า, ประวัติใบเสร็จ
            </div>
          </div>
        </div>
        <div class="w-8 h-8 rounded-full bg-slate-100 group-hover:bg-indigo-100 group-hover:text-indigo-600 flex items-center justify-center transition-all text-slate-400 shrink-0 ml-2">
          <ChevronRight class="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
        </div>
      </router-link>
    </div>

    <!-- 5. Digital ID QR Code Modal Pop-up -->
    <div v-if="showQrModal" class="fixed inset-0 z-50 bg-slate-950/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div class="bg-white rounded-3xl p-6 max-w-sm w-full shadow-2xl space-y-4 border border-slate-200 text-center relative">
        <button @click="showQrModal = false" class="absolute top-4 right-4 text-slate-400 hover:text-slate-700">
          <X class="w-5 h-5" />
        </button>

        <div class="space-y-1 pt-2">
          <h3 class="text-lg font-bold text-slate-900">Digital Tenant ID</h3>
          <p class="text-xs text-slate-500">แสดง QR Code นี้แก่เจ้าหน้าที่รักษาความปลอดภัย</p>
        </div>

        <div class="py-3">
          <img :src="digitalIdQrUrl" alt="Digital ID QR" class="w-52 h-52 mx-auto rounded-2xl border border-slate-200 shadow-xs" />
        </div>

        <div class="p-3 bg-slate-50 rounded-2xl text-xs space-y-1 text-slate-600 font-mono">
          <div>ผู้เช่า: <span class="font-bold text-slate-900">{{ tenantProfile.firstName }} {{ tenantProfile.lastName }}</span></div>
          <div>ห้องพัก: <span class="font-bold text-indigo-600">{{ formattedRooms }}</span></div>
        </div>

        <button
          @click="showQrModal = false"
          class="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-2xl text-xs font-bold transition-all shadow-sm"
        >
          ปิดหน้าต่าง (Close)
        </button>
      </div>
    </div>

    <!-- 6. Link Another Room Modal Pop-up -->
    <div v-if="showLinkRoomModal" class="fixed inset-0 z-50 bg-slate-950/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div class="bg-white rounded-3xl p-6 max-w-sm w-full shadow-2xl space-y-4 border border-slate-200 relative">
        <button @click="showLinkRoomModal = false" class="absolute top-4 right-4 text-slate-400 hover:text-slate-700">
          <X class="w-5 h-5" />
        </button>

        <div class="space-y-1 pt-2 text-center">
          <div class="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto text-xl font-bold">
            🔑
          </div>
          <h3 class="text-base font-bold text-slate-900">ผูกห้องพักเพิ่มเติม</h3>
          <p class="text-xs text-slate-500">กรอกรหัสเชิญ (Invite Code) จากผู้ดูแลหอพักเพื่อผูกห้องเข้ากับ LINE ของคุณ</p>
        </div>

        <form @submit.prevent="handleLinkRoom" class="space-y-3">
          <div>
            <label class="block text-xs font-bold text-slate-700 mb-1">รหัสเชิญห้องพัก (Invite Code)</label>
            <input
              v-model="inviteCodeInput"
              type="text"
              placeholder="e.g. ROOM-A102-XYZ"
              required
              class="w-full bg-slate-50 border border-slate-300 rounded-2xl px-4 py-2.5 text-sm text-slate-900 font-mono tracking-wider text-center focus:outline-hidden focus:border-indigo-600"
            />
          </div>

          <div class="p-3 bg-amber-50 rounded-2xl border border-amber-200 text-[11px] text-amber-800 leading-relaxed">
            💡 คุณสามารถขอรับ Invite Code สำหรับห้องพักใหม่ได้จากเจ้าหน้าที่นิติบุคคล
          </div>

          <div class="flex gap-2 pt-2">
            <button
              type="button"
              @click="showLinkRoomModal = false"
              class="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-2xl text-xs font-bold transition-all"
            >
              ยกเลิก
            </button>
            <button
              type="submit"
              :disabled="linkingRoom"
              class="flex-1 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl text-xs font-bold transition-all disabled:opacity-50"
            >
              {{ linkingRoom ? 'กำลังผูกห้อง...' : 'ยืนยันผูกห้อง' }}
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- 7. Setup Web Password Modal Pop-up -->
    <div v-if="showPasswordModal" class="fixed inset-0 z-50 bg-slate-950/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div class="bg-white rounded-3xl p-6 max-w-sm w-full shadow-2xl space-y-4 border border-slate-200 relative">
        <button @click="showPasswordModal = false" class="absolute top-4 right-4 text-slate-400 hover:text-slate-700">
          <X class="w-5 h-5" />
        </button>

        <div class="space-y-1 pt-2 text-center">
          <div class="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto text-xl font-bold">
            <Lock class="w-6 h-6" />
          </div>
          <h3 class="text-base font-bold text-slate-900">ตั้งรหัสผ่านสำหรับเบราว์เซอร์</h3>
          <p class="text-xs text-slate-500">ใช้เบอร์โทรศัพท์ของคุณคู่กับรหัสผ่านนี้เพื่อล็อกอินบนคอมพิวเตอร์หรือเบราว์เซอร์ทั่วไป</p>
        </div>

        <form @submit.prevent="handleSavePassword" class="space-y-3">
          <div>
            <label class="block text-xs font-bold text-slate-700 mb-1">รหัสผ่านใหม่ (อย่างน้อย 6 ตัวอักษร)</label>
            <input
              v-model="newPasswordInput"
              type="password"
              placeholder="••••••••"
              minlength="6"
              required
              class="w-full bg-slate-50 border border-slate-300 rounded-2xl px-4 py-2.5 text-sm text-slate-900 focus:outline-hidden focus:border-indigo-600 focus:bg-white"
            />
          </div>

          <div>
            <label class="block text-xs font-bold text-slate-700 mb-1">ยืนยันรหัสผ่านใหม่อีกครั้ง</label>
            <input
              v-model="confirmPasswordInput"
              type="password"
              placeholder="••••••••"
              minlength="6"
              required
              class="w-full bg-slate-50 border border-slate-300 rounded-2xl px-4 py-2.5 text-sm text-slate-900 focus:outline-hidden focus:border-indigo-600 focus:bg-white"
            />
          </div>

          <div class="p-3 bg-indigo-50/70 rounded-2xl border border-indigo-100 text-[11px] text-indigo-900 leading-relaxed">
            📱 เบอร์โทรสำหรับล็อกอินของคุณคือ: <span class="font-bold">{{ tenantProfile.phone || 'เบอร์ที่ลงทะเบียนไว้' }}</span>
          </div>

          <div class="flex gap-2 pt-2">
            <button
              type="button"
              @click="showPasswordModal = false"
              class="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-2xl text-xs font-bold transition-all"
            >
              ยกเลิก
            </button>
            <button
              type="submit"
              :disabled="savingPassword"
              class="flex-1 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl text-xs font-bold transition-all disabled:opacity-50"
            >
              {{ savingPassword ? 'กำลังบันทึก...' : 'บันทึกรหัสผ่าน' }}
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
import api from '@/utils/api';
import { initLiff, isLiffLoggedIn, getLiffProfile, loginLiff } from '@/utils/liff';
import QRCode from 'qrcode';
import { useAuthStore } from '@/stores/auth';
import { useFeatureStore } from '@/stores/useFeatureStore';
import { useDynamicTheme } from '@/composables/useDynamicTheme';
import { showSuccess, showError, showWarning, showConfirm } from '@/utils/swal';

import {
  CreditCard,
  Wrench,
  Package,
  Megaphone,
  User,
  Car,
  Receipt,
  LogOut,
  DoorOpen,
  QrCode,
  ChevronRight,
  PlusCircle,
  Lock,
  KeyRound,
  X
} from 'lucide-vue-next';

const router = useRouter();
const route = useRoute();
const authStore = useAuthStore();
const featureStore = useFeatureStore();
const { themeColor, applyTheme, adjustBrightness } = useDynamicTheme();

const showQrModal = ref(false);
const showLinkRoomModal = ref(false);
const showPasswordModal = ref(false);
const newPasswordInput = ref('');
const confirmPasswordInput = ref('');
const savingPassword = ref(false);
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
  return '👤';
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

      // ตรวจสอบและเลือกห้องที่ Active
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
    if (err.response?.status === 401 || !isLiffLoggedIn()) {
      sessionExpired.value = true;
    }
  }
};

const handleLinkRoom = async () => {
  if (!inviteCodeInput.value.trim()) return;
  linkingRoom.value = true;
  try {
    const rawName = tenantProfile.name || `${tenantProfile.firstName || ''} ${tenantProfile.lastName || ''}`.trim() || 'ลูกบ้าน';
    const nameParts = rawName.split(' ');
    const firstName = tenantProfile.firstName || nameParts[0] || 'ลูกบ้าน';
    const lastName = tenantProfile.lastName || (nameParts.length > 1 ? nameParts.slice(1).join(' ') : '-');

    const payload = {
      inviteCode: inviteCodeInput.value.trim().toUpperCase(),
      firstName,
      lastName,
      phone: tenantProfile.phone || '0800000000',
      lineDisplayName: tenantProfile.lineDisplayName || firstName,
      linePictureUrl: tenantProfile.linePictureUrl || undefined
    };

    const res = await api.post('/api/v1/liff/register/invite', payload);
    if (res.data?.success) {
      await showSuccess('ผูกห้องพักสำเร็จ!', `เพิ่มห้องพักใหม่เข้าสู่บัญชีของคุณเรียบร้อยแล้ว`);
      showLinkRoomModal.value = false;
      inviteCodeInput.value = '';
      await fetchTenantProfile(currentLineUserId.value);
    }
  } catch (err) {
    showError('เกิดข้อผิดพลาด', err.response?.data?.message || 'ไม่สามารถผูกห้องพักได้ โปรดตรวจสอบรหัสเชิญ');
  } finally {
    linkingRoom.value = false;
  }
};

const handleSavePassword = async () => {
  if (!newPasswordInput.value) {
    showError('ข้อผิดพลาด', 'กรุณาระบุรหัสผ่าน');
    return;
  }
  if (newPasswordInput.value.length < 6) {
    showError('ข้อผิดพลาด', 'รหัสผ่านต้องมีความยาวอย่างน้อย 6 ตัวอักษร');
    return;
  }
  if (newPasswordInput.value !== confirmPasswordInput.value) {
    showError('ข้อผิดพลาด', 'รหัสผ่านทั้งสองช่องไม่ตรงกัน');
    return;
  }

  savingPassword.value = true;
  try {
    const res = await authStore.setupPassword(newPasswordInput.value);
    if (res.success) {
      await showSuccess('บันทึกสำเร็จ!', 'คุณสามารถใช้เบอร์โทรศัพท์และรหัสผ่านนี้เพื่อเข้าสู่ระบบผ่านเบราว์เซอร์ได้ทันที');
      showPasswordModal.value = false;
      newPasswordInput.value = '';
      confirmPasswordInput.value = '';
    } else {
      showError('ไม่สำเร็จ', res.message || 'ไม่สามารถตั้งรหัสผ่านได้');
    }
  } catch (err) {
    showError('เกิดข้อผิดพลาด', err.response?.data?.message || 'ไม่สามารถตั้งรหัสผ่านได้');
  } finally {
    savingPassword.value = false;
  }
};

// 1. เมนูด่วน (Quick Actions Grid)
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
    subtitle: 'ตรวจสอบรายการพัสดุ',
    icon: Package,
    bgClass: 'bg-emerald-50',
    iconClass: 'text-emerald-600',
    route: '/liff/parcels',
    featureKey: 'ENABLE_PARCEL_NOTIFY'
  },
  {
    id: 'announcements',
    title: 'ข่าวสารหอพัก',
    subtitle: 'อ่านประกาศย้อนหลัง',
    icon: Megaphone,
    bgClass: 'bg-rose-50',
    iconClass: 'text-rose-600',
    route: '/liff/announcements',
    featureKey: null
  }
];

// 2. เมนูทั่วไป (General Settings List)
const generalMenusConfig = [
  {
    id: 'change-pin',
    title: 'เปลี่ยนรหัส PIN 6 หลัก (Change PIN)',
    icon: KeyRound,
    route: '/liff/change-pin',
    featureKey: null
  },
  {
    id: 'password',
    title: 'ตั้งรหัสผ่านเข้าใช้งานบนเว็บ (Web Password)',
    icon: Lock,
    action: () => {
      showPasswordModal.value = true;
    },
    featureKey: null
  },
  {
    id: 'profile',
    title: 'จัดการข้อมูลส่วนตัว (เบอร์โทร, บัตรประชาชน)',
    icon: User,
    route: '/liff/profile/edit',
    featureKey: null
  },
  {
    id: 'vehicles',
    title: 'ยานพาหนะของฉัน (ป้ายทะเบียนรถ)',
    icon: Car,
    route: '/liff/profile/edit',
    featureKey: 'ENABLE_VEHICLE_MANAGEMENT'
  },
  {
    id: 'receipts',
    title: 'ประวัติใบเสร็จรับเงิน (E-Receipt)',
    icon: Receipt,
    route: '/liff/receipts',
    featureKey: null
  },
  {
    id: 'moveout',
    title: 'แจ้งย้ายออกล่วงหน้า',
    icon: DoorOpen,
    isDanger: false,
    action: () => showWarning('แจ้งย้ายออก', 'กรุณาติดต่อแอดมินล่วงหน้าอย่างน้อย 30 วันก่อนวันย้ายออก'),
    featureKey: null
  },
  {
    id: 'logout',
    title: 'ออกจากระบบ (Logout)',
    icon: LogOut,
    isDanger: true,
    action: () => handleTenantLogout(),
    featureKey: null
  }
];

const handleTenantLogout = async () => {
  const isConfirmed = await showConfirm(
    'ยืนยันออกจากระบบ',
    'คุณต้องการออกจากระบบและลบเซสชันการใช้งานในอุปกรณ์นี้ใช่หรือไม่?',
    'ออกจากระบบ',
    'ยกเลิก'
  );
  if (!isConfirmed) return;

  try {
    await authStore.logout();
    await showSuccess('ออกจากระบบสำเร็จ', 'ลบข้อมูลการเข้าใช้งานเรียบร้อยแล้ว');

    const liffModule = await import('@/utils/liff');
    if (liffModule?.default && typeof liffModule.default.isInClient === 'function' && liffModule.default.isInClient()) {
      liffModule.default.closeWindow();
    } else {
      router.replace('/liff');
    }
  } catch (err) {
    console.error('Tenant logout error:', err);
    router.replace('/liff');
  }
};

const availableQuickActions = computed(() => {
  return quickActionsConfig.filter((menu) => {
    if (!menu.featureKey) return true;
    return featureStore.isEnabled(menu.featureKey);
  });
});

const availableGeneralMenus = computed(() => {
  return generalMenusConfig.filter((menu) => {
    if (!menu.featureKey) return true;
    return featureStore.isEnabled(menu.featureKey);
  });
});

const handleMenuClick = (menu) => {
  if (menu.action) {
    menu.action();
  } else if (menu.route) {
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
    }
  } catch (err) {
    console.warn('LIFF init fallback mode:', err.message);
  }

  await fetchTenantProfile(currentLineUserId.value);

  // Auto-sync LINE profile in background with tenant info
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

