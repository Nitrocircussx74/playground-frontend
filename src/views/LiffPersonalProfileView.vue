<template>
  <div class="space-y-5 pb-6 font-sans text-slate-900 selection:bg-indigo-600 selection:text-white relative">
    <!-- Ambient Light Background Ornaments -->
    <div class="absolute inset-0 overflow-hidden pointer-events-none z-0">
      <div class="absolute -top-24 -left-24 w-80 h-80 bg-indigo-100/30 rounded-full blur-3xl"></div>
      <div class="absolute top-1/2 -right-24 w-80 h-80 bg-emerald-100/25 rounded-full blur-3xl"></div>
    </div>

    <div class="space-y-4 relative z-10">
      <!-- Loading Skeleton State -->
      <div v-if="loading" class="space-y-4 animate-pulse">
        <div class="p-5 bg-white rounded-2xl border border-slate-100 shadow-xs flex items-center gap-3.5">
          <div class="w-14 h-14 rounded-full bg-slate-100 skeleton-shimmer shrink-0"></div>
          <div class="space-y-2 flex-1">
            <div class="h-4 w-32 bg-slate-100 skeleton-shimmer rounded-md"></div>
            <div class="h-3 w-24 bg-slate-100 skeleton-shimmer rounded-md"></div>
          </div>
        </div>

        <div class="p-4 bg-white rounded-2xl border border-slate-100 shadow-xs space-y-3">
          <div v-for="i in 4" :key="i" class="flex items-center justify-between py-2 border-b border-slate-50 last:border-0">
            <div class="flex items-center gap-3">
              <div class="w-8 h-8 rounded-xl bg-slate-100 skeleton-shimmer"></div>
              <div class="h-3.5 w-28 bg-slate-100 skeleton-shimmer rounded-md"></div>
            </div>
            <div class="h-4 w-4 bg-slate-100 skeleton-shimmer rounded-full"></div>
          </div>
        </div>
      </div>

      <template v-else>
        <!-- 1. Profile Header Card -->
        <div
          class="p-5 text-white rounded-3xl shadow-lg relative overflow-hidden transition-all duration-500"
          :style="{
            background: `linear-gradient(135deg, ${themeColor}, ${adjustBrightness(themeColor, -25)})`,
            boxShadow: `0 14px 20px -5px ${themeColor}25, 0 6px 8px -6px ${themeColor}25`
          }"
        >
          <div class="absolute -right-8 -bottom-8 w-36 h-36 bg-white/10 rounded-full blur-xl pointer-events-none"></div>

          <div class="flex items-center gap-3.5">
            <!-- Avatar จาก LINE หรือ Initials -->
            <div class="relative w-16 h-16 shrink-0">
              <img
                v-if="tenantProfile.avatarUrl && !imageLoadError"
                :src="tenantProfile.avatarUrl"
                alt="Tenant Avatar"
                class="w-16 h-16 rounded-full object-cover border-2 border-white/80 shadow-xs bg-white/20"
                @error="imageLoadError = true"
              />
              <div
                v-else
                class="w-16 h-16 rounded-full bg-white/20 backdrop-blur-xs border-2 border-white/80 shadow-xs flex items-center justify-center text-xl font-bold text-white select-none"
              >
                {{ tenantInitial }}
              </div>
              <span class="absolute bottom-0 right-0 w-4 h-4 bg-emerald-400 border-2 border-white rounded-full shadow-2xs" title="LINE Verified"></span>
            </div>

            <!-- ชื่อ และ เบอร์โทร -->
            <div class="space-y-1 flex-1 min-w-0">
              <div class="flex items-center gap-1.5 flex-wrap">
                <h1 class="font-bold text-base sm:text-lg truncate text-white">
                  {{ tenantProfile.firstName }} {{ tenantProfile.lastName }}
                </h1>
                <span class="px-2 py-0.5 text-[10px] font-semibold bg-white/20 text-white rounded-full backdrop-blur-xs border border-white/30">
                  ลูกบ้าน
                </span>
              </div>
              <p class="text-xs text-indigo-100/90 font-mono">{{ tenantProfile.phone || '081-234-5678' }}</p>
              <div class="flex items-center gap-2 pt-0.5">
                <span class="text-[11px] font-semibold text-yellow-300">
                  ห้อง {{ tenantProfile.roomNumber || '-' }}
                </span>
                <span v-if="tenantProfile.buildingName" class="text-[11px] text-indigo-100/80">
                  • ตึก {{ tenantProfile.buildingName }}
                </span>
              </div>
            </div>
          </div>

          <!-- Digital ID & Quick Status -->
          <div class="mt-4 pt-3.5 border-t border-white/20 flex items-center justify-between gap-2">
            <div class="flex items-center gap-1.5 text-xs text-indigo-100/90">
              <span class="w-2 h-2 rounded-full bg-emerald-400"></span>
              <span>LINE Verified</span>
            </div>
            <button
              @click="showQrModal = true"
              class="px-3 py-1 bg-white/20 hover:bg-white/30 text-white rounded-xl text-xs font-semibold transition-all border border-white/30 flex items-center gap-1.5 backdrop-blur-xs cursor-pointer active:scale-95"
            >
              <QrCode class="w-3.5 h-3.5" />
              <span>Digital ID</span>
            </button>
          </div>
        </div>
      </template>

      <!-- 2. เมนูทั่วไป (GENERAL SETTINGS) - Minimal iOS Group List -->
      <div class="space-y-2">
        <h2 class="text-xs font-bold text-slate-400 uppercase tracking-wider px-1">
          เมนูทั่วไป (General Settings)
        </h2>

        <div class="bg-white rounded-2xl border border-slate-100 shadow-xs overflow-hidden divide-y divide-slate-100">
          <button
            v-for="menu in availableGeneralMenus"
            :key="menu.id"
            @click="handleMenuClick(menu)"
            class="w-full p-3.5 flex items-center justify-between hover:bg-slate-50/80 active:bg-slate-100/80 transition-colors text-left group cursor-pointer"
          >
            <div class="flex items-center gap-3">
              <div
                class="w-8.5 h-8.5 rounded-xl flex items-center justify-center transition-transform group-hover:scale-105 shrink-0 bg-slate-50 text-slate-600 group-hover:bg-indigo-50 group-hover:text-indigo-600"
              >
                <component :is="menu.icon" class="w-4 h-4" />
              </div>
              <div class="min-w-0 flex-1">
                <div class="text-xs font-semibold leading-snug text-slate-800">
                  {{ menu.title }}
                </div>
                <div v-if="menu.subtitle" class="text-[10px] text-slate-400 mt-0.5 truncate font-normal">
                  {{ menu.subtitle }}
                </div>
              </div>
            </div>
            <ChevronRight
              class="w-4 h-4 text-slate-300 group-hover:text-slate-500 group-hover:translate-x-0.5 transition-all shrink-0"
            />
          </button>
        </div>
      </div>

      <!-- 3. Big Standalone Logout Button at Bottom -->
      <div class="pt-2 pb-2">
        <button
          @click="handleTenantLogout"
          class="w-full py-3 bg-rose-50/80 hover:bg-rose-100/80 active:bg-rose-200/80 text-rose-600 border border-rose-100 rounded-2xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer shadow-2xs active:scale-[0.99]"
        >
          <LogOut class="w-4 h-4" />
          <span>ออกจากระบบ (Logout)</span>
        </button>
      </div>
    </div>

    <!-- 4. Digital ID QR Code Modal Pop-up -->
    <div v-if="showQrModal" class="fixed inset-0 z-50 bg-slate-950/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div class="bg-white rounded-3xl p-6 max-w-sm w-full shadow-2xl space-y-4 border border-slate-200 text-center relative">
        <button @click="showQrModal = false" class="absolute top-4 right-4 text-slate-400 hover:text-slate-700 cursor-pointer">
          <X class="w-5 h-5" />
        </button>

        <div class="space-y-1 pt-2">
          <h3 class="text-lg font-bold text-slate-900">Digital Tenant ID</h3>
          <p class="text-xs text-slate-500">แสดง QR Code นี้แก่เจ้าหน้าที่รักษาความปลอดภัย</p>
        </div>

        <div class="py-3">
          <img :src="digitalIdQrUrl" alt="Digital ID QR" class="w-48 h-48 mx-auto rounded-2xl border border-slate-200 shadow-xs" />
        </div>

        <div class="p-3 bg-slate-50 rounded-2xl text-xs space-y-1 text-slate-600 font-mono">
          <div>ผู้เช่า: <span class="font-bold text-slate-900">{{ tenantProfile.firstName }} {{ tenantProfile.lastName }}</span></div>
          <div>ห้องพัก: <span class="font-bold text-indigo-600">ห้อง {{ tenantProfile.roomNumber || '-' }}</span></div>
        </div>

        <button
          @click="showQrModal = false"
          class="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-2xl text-xs font-bold transition-all shadow-sm cursor-pointer"
        >
          ปิดหน้าต่าง (Close)
        </button>
      </div>
    </div>

    <!-- 5. Setup Web Password Modal Pop-up -->
    <div v-if="showPasswordModal" class="fixed inset-0 z-50 bg-slate-950/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div class="bg-white rounded-3xl p-6 max-w-sm w-full shadow-2xl space-y-4 border border-slate-200 relative">
        <button @click="showPasswordModal = false" class="absolute top-4 right-4 text-slate-400 hover:text-slate-700 cursor-pointer">
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
              class="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-2xl text-xs font-bold transition-all cursor-pointer"
            >
              ยกเลิก
            </button>
            <button
              type="submit"
              :disabled="savingPassword"
              class="flex-1 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl text-xs font-bold transition-all disabled:opacity-50 cursor-pointer"
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
import { initLiff, isLiffLoggedIn, getLiffProfile } from '@/utils/liff';
import QRCode from 'qrcode';
import { useAuthStore } from '@/stores/auth';
import { useFeatureStore } from '@/stores/useFeatureStore';
import { useDynamicTheme } from '@/composables/useDynamicTheme';
import { showSuccess, showError, showWarning, showConfirm } from '@/utils/swal';

import {
  User,
  Car,
  Receipt,
  LogOut,
  DoorOpen,
  QrCode,
  ChevronRight,
  Lock,
  KeyRound,
  X
} from 'lucide-vue-next';

const router = useRouter();
const route = useRoute();
const authStore = useAuthStore();
const featureStore = useFeatureStore();
const { themeColor, adjustBrightness } = useDynamicTheme();

const loading = ref(true);
const imageLoadError = ref(false);
const showQrModal = ref(false);
const showPasswordModal = ref(false);
const newPasswordInput = ref('');
const confirmPasswordInput = ref('');
const savingPassword = ref(false);
const digitalIdQrUrl = ref('');

const tenantProfile = reactive({
  id: '',
  firstName: '',
  lastName: '',
  roomNumber: '',
  buildingName: '',
  phone: '',
  avatarUrl: ''
});

const tenantInitial = computed(() => {
  if (tenantProfile.firstName) {
    return tenantProfile.firstName.charAt(0).toUpperCase();
  }
  return 'T';
});

// เมนูทั่วไป (General Settings List) ตามที่ผู้ใช้ระบุ
const generalMenusConfig = [
  {
    id: 'change-pin',
    title: 'เปลี่ยนรหัส PIN 6 หลัก (Change PIN)',
    subtitle: 'เปลี่ยนรหัสความปลอดภัยสำหรับเข้าใช้งาน LIFF',
    icon: KeyRound,
    route: '/liff/change-pin',
    featureKey: null
  },
  {
    id: 'password',
    title: 'ตั้งรหัสผ่านเข้าใช้งานบนเว็บ (Web Password)',
    subtitle: 'สำหรับล็อกอินผ่าน Web Browser ทั่วไป',
    icon: Lock,
    action: () => {
      showPasswordModal.value = true;
    },
    featureKey: null
  },
  {
    id: 'profile',
    title: 'จัดการข้อมูลส่วนตัว (เบอร์โทร, บัตรประชาชน)',
    subtitle: 'อัปเดตเบอร์ติดต่อและข้อมูลผู้เช่า',
    icon: User,
    route: '/liff/profile/edit',
    featureKey: null
  },
  {
    id: 'vehicles',
    title: 'ยานพาหนะของฉัน (ป้ายทะเบียนรถ)',
    subtitle: 'ลงทะเบียนรถยนต์ / มอเตอร์ไซค์',
    icon: Car,
    route: '/liff/profile/edit',
    featureKey: 'ENABLE_VEHICLE_MANAGEMENT'
  },
  {
    id: 'receipts',
    title: 'ประวัติใบเสร็จรับเงิน (E-Receipt)',
    subtitle: 'ดูประวัติใบเสร็จและการชำระเงินย้อนหลัง',
    icon: Receipt,
    route: '/liff/receipts',
    featureKey: null
  },
  {
    id: 'moveout',
    title: 'แจ้งย้ายออกล่วงหน้า',
    subtitle: 'แจ้งเรื่องย้ายออกล่วงหน้าอย่างน้อย 30 วัน',
    icon: DoorOpen,
    isDanger: false,
    action: () => showWarning('แจ้งย้ายออก', 'กรุณาติดต่อแอดมินหรือสำนักงานหอพักล่วงหน้าอย่างน้อย 30 วันก่อนวันย้ายออก'),
    featureKey: null
  }
];

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
    router.push(menu.route);
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

const fetchProfile = async () => {
  try {
    await initLiff();
    if (isLiffLoggedIn()) {
      const lineProfile = await getLiffProfile();
      if (lineProfile) {
        tenantProfile.avatarUrl = lineProfile.pictureUrl || '';
      }
    } else if (!authStore.liffToken && !localStorage.getItem('dev_line_user_id')) {
      authStore.clearLiffAuth();
      router.replace('/liff');
      return;
    }

    const res = await api.get('/api/v1/liff/profile');
    if (res.data?.success && res.data.data) {
      const data = res.data.data;
      tenantProfile.id = data.id || '';
      tenantProfile.firstName = data.firstName || 'ลูกบ้าน';
      tenantProfile.lastName = data.lastName || '';
      tenantProfile.phone = data.phone || '';
      tenantProfile.roomNumber = data.roomNumber || data.rooms?.[0]?.roomNumber || '-';
      tenantProfile.buildingName = data.buildingName || data.rooms?.[0]?.buildingName || '';
      if (!tenantProfile.avatarUrl && data.linePictureUrl) {
        tenantProfile.avatarUrl = data.linePictureUrl;
      }

      // Generate Digital ID QR
      const qrData = JSON.stringify({
        tenantId: tenantProfile.id,
        name: `${tenantProfile.firstName} ${tenantProfile.lastName}`,
        room: tenantProfile.roomNumber,
        timestamp: Date.now()
      });
      digitalIdQrUrl.value = await QRCode.toDataURL(qrData, { width: 300, margin: 2 });
    }
  } catch (err) {
    console.error('Fetch profile error:', err);
    if (err.response?.status === 401 || err.response?.status === 403 || !isLiffLoggedIn()) {
      authStore.clearLiffAuth();
      router.replace('/liff');
    }
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  fetchProfile();
});
</script>
