<template>
  <div class="min-h-screen bg-slate-100/90 pb-12 font-sans text-slate-900 selection:bg-indigo-600 selection:text-white">
    <!-- Ambient Glassmorphism Soft Accent Blurs -->
    <div class="fixed inset-0 overflow-hidden pointer-events-none z-0">
      <div class="absolute -top-24 -left-24 w-80 h-80 bg-indigo-200/50 rounded-full blur-3xl"></div>
      <div class="absolute top-1/3 -right-24 w-80 h-80 bg-purple-200/50 rounded-full blur-3xl"></div>
    </div>

    <div class="max-w-md mx-auto px-4 py-6 space-y-6 relative z-10">
      <!-- 1. Header Section: Profile & Digital ID Card -->
      <div class="p-6 bg-gradient-to-br from-indigo-600 via-indigo-700 to-purple-800 text-white rounded-3xl shadow-xl shadow-indigo-600/20 relative overflow-hidden">
        <!-- Background Pattern Decor -->
        <div class="absolute -right-8 -bottom-8 w-36 h-36 bg-white/10 rounded-full blur-xl pointer-events-none"></div>

        <div class="flex items-center gap-4">
          <!-- Avatar จาก LINE Profile -->
          <div class="relative">
            <img
              :src="tenantProfile.avatarUrl || defaultAvatar"
              alt="Tenant Avatar"
              class="w-16 h-16 rounded-full object-cover border-2 border-white/80 shadow-md"
            />
            <span class="absolute bottom-0 right-0 w-4 h-4 bg-emerald-400 border-2 border-white rounded-full"></span>
          </div>

          <!-- ข้อมูลชื่อ และ Badge หมายเลขห้องพัก -->
          <div class="space-y-1 flex-1 min-w-0">
            <div class="flex items-center gap-2">
              <h1 class="font-extrabold text-lg sm:text-xl truncate text-white">
                {{ tenantProfile.firstName }} {{ tenantProfile.lastName }}
              </h1>
              <span class="px-2.5 py-0.5 bg-yellow-400 text-slate-950 font-black text-[11px] rounded-full shadow-xs shrink-0">
                ห้อง {{ tenantProfile.roomNumber }}
              </span>
            </div>
            <p class="text-xs text-indigo-100 font-mono">{{ tenantProfile.phone || '081-234-5678' }}</p>
          </div>
        </div>

        <!-- ปุ่มกดเปิด Modal QR Code สำหรับยืนยันตัวตนกับ รปภ. -->
        <div class="mt-5 pt-4 border-t border-white/20 flex items-center justify-between">
          <span class="text-xs text-indigo-100 font-medium">Digital ID สำหรับยืนยันตัวตนกับ รปภ.</span>
          <button
            @click="showQrModal = true"
            class="px-3.5 py-1.5 bg-white/20 hover:bg-white/30 text-white rounded-xl text-xs font-bold transition-all border border-white/30 flex items-center gap-1.5 shadow-xs"
          >
            <QrCode class="w-4 h-4" />
            <span>QR Code ของฉัน</span>
          </button>
        </div>
      </div>

      <!-- 2. Dynamic Quick Actions Grid (เมนูด่วนใช้งานบ่อย 2x2 Grid) -->
      <div class="space-y-2" v-if="availableQuickActions.length > 0">
        <h2 class="text-xs font-extrabold text-slate-400 uppercase tracking-wider px-1">
          เมนูด่วน (Quick Actions - Dynamic Enabled)
        </h2>

        <div class="grid grid-cols-2 gap-3.5">
          <button
            v-for="menu in availableQuickActions"
            :key="menu.id"
            @click="handleMenuClick(menu)"
            class="p-4 bg-white hover:bg-slate-50/80 rounded-3xl border border-slate-200/80 shadow-xs text-left transition-all duration-200 group flex flex-col justify-between h-28 space-y-2"
          >
            <div
              class="w-10 h-10 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform"
              :class="menu.bgClass"
            >
              <component :is="menu.icon" class="w-5 h-5" :class="menu.iconClass" />
            </div>
            <div>
              <div class="font-bold text-sm text-slate-900 group-hover:text-indigo-600 transition-colors">
                {{ menu.title }}
              </div>
              <div class="text-[11px] text-slate-500 font-medium truncate">{{ menu.subtitle }}</div>
            </div>
          </button>
        </div>
      </div>

      <!-- 3. Dynamic General Menus (List แนวตั้ง สไตล์ iOS Settings) -->
      <div class="space-y-2" v-if="availableGeneralMenus.length > 0">
        <h2 class="text-xs font-extrabold text-slate-400 uppercase tracking-wider px-1">
          เมนูทั่วไป (General Settings)
        </h2>

        <div class="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden divide-y divide-slate-100">
          <button
            v-for="menu in availableGeneralMenus"
            :key="menu.id"
            @click="handleMenuClick(menu)"
            class="w-full p-4 flex items-center justify-between hover:bg-slate-50 transition-colors text-left group"
            :class="menu.isDanger ? 'text-rose-600' : 'text-slate-800'"
          >
            <div class="flex items-center gap-3">
              <div
                class="w-9 h-9 rounded-xl flex items-center justify-center transition-colors"
                :class="menu.isDanger ? 'bg-rose-50 text-rose-600' : 'bg-slate-100 text-slate-700 group-hover:bg-indigo-50 group-hover:text-indigo-600'"
              >
                <component :is="menu.icon" class="w-4 h-4" />
              </div>
              <span class="text-sm font-semibold">{{ menu.title }}</span>
            </div>
            <ChevronRight
              class="w-4 h-4 transition-transform group-hover:translate-x-0.5"
              :class="menu.isDanger ? 'text-rose-400' : 'text-slate-400'"
            />
          </button>
        </div>
      </div>
    </div>

    <!-- 4. Digital ID QR Code Modal Pop-up -->
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
          <div>ห้องพัก: <span class="font-bold text-indigo-600">ห้อง {{ tenantProfile.roomNumber }}</span></div>
        </div>

        <button
          @click="showQrModal = false"
          class="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-2xl text-xs font-bold transition-all shadow-sm"
        >
          ปิดหน้าต่าง (Close)
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import liff from '@line/liff';
import QRCode from 'qrcode';
import { useAuthStore } from '@/stores/auth';
import { useFeatureStore } from '@/stores/useFeatureStore';
import { showWarning } from '@/utils/swal';

import {
  CreditCard,
  Wrench,
  Package,
  Megaphone,
  User,
  Car,
  Receipt,
  LogOut,
  QrCode,
  ChevronRight,
  X
} from 'lucide-vue-next';

const router = useRouter();
const authStore = useAuthStore();
const featureStore = useFeatureStore();

const showQrModal = ref(false);
const digitalIdQrUrl = ref('');
const defaultAvatar = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80';

const tenantProfile = reactive({
  firstName: 'ผู้เช่า',
  lastName: '',
  roomNumber: '101',
  phone: '',
  avatarUrl: ''
});

const fetchTenantProfile = async (lineUserId = '') => {
  try {
    const res = await api.get('/api/v1/liff/profile', {
      params: lineUserId ? { lineUserId } : {}
    });
    if (res.data?.success && res.data?.data) {
      const data = res.data.data;
      tenantProfile.firstName = data.firstName || '';
      tenantProfile.lastName = data.lastName || '';
      tenantProfile.roomNumber = data.roomNumber || '101';
      tenantProfile.phone = data.phone || '';
      if (data.linePictureUrl) {
        tenantProfile.avatarUrl = data.linePictureUrl;
      }
    }
  } catch (err) {
    console.warn('Failed to fetch tenant profile from API:', err.message);
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
    action: () => showWarning('ระบบพัสดุ', 'มีพัสดุรอรับที่ป้อม รปภ. 1 รายการ'),
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
    id: 'profile',
    title: 'จัดการข้อมูลส่วนตัว (เบอร์โทร, บัตรประชาชน)',
    icon: User,
    route: '/liff/profile/edit', // 📌 Route ตรงไปยัง LiffUpdateProfileView.vue
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
    icon: LogOut,
    isDanger: true,
    action: () => showWarning('แจ้งย้ายออก', 'กรุณาติดต่อแอดมินล่วงหน้าอย่างน้อย 30 วันก่อนวันย้ายออก'),
    featureKey: null
  }
];

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
    router.push(menu.route);
  }
};

onMounted(async () => {
  featureStore.fetchFeatures();
  await fetchTenantProfile();

  const liffId = import.meta.env.VITE_LIFF_ID || import.meta.env.VITE_LINE_LIFF_ID || '';
  if (liffId) {
    try {
      await liff.init({ liffId });
      if (liff.isLoggedIn()) {
        const profile = await liff.getProfile();
        if (profile.userId) {
          await fetchTenantProfile(profile.userId);
        }
        if (profile.pictureUrl) tenantProfile.avatarUrl = profile.pictureUrl;

        // Auto-sync LINE profile in background to database
        api.patch('/api/v1/liff/auth/sync-profile', {
          lineUserId: profile.userId,
          lineDisplayName: profile.displayName,
          linePictureUrl: profile.pictureUrl,
          lineStatusMessage: profile.statusMessage
        }).catch(() => {});
      }
    } catch (err) {
      console.warn('LIFF init fallback mode:', err.message);
    }
  }

  const payload = `TENANT-ID:${tenantProfile.firstName}-ROOM-${tenantProfile.roomNumber}-${Date.now()}`;
  digitalIdQrUrl.value = await QRCode.toDataURL(payload, { margin: 1, width: 260 });
});
</script>
