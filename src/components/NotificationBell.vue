<template>
  <div class="relative" ref="rootEl">
    <button
      @click="toggleOpen"
      class="relative w-9 h-9 rounded-xl flex items-center justify-center text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer"
      aria-label="การแจ้งเตือน"
    >
      <Bell class="w-4.5 h-4.5" />
      <span
        v-if="unreadCount > 0"
        class="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 px-1 rounded-full bg-rose-500 text-white text-[9px] font-bold flex items-center justify-center leading-none"
      >
        {{ unreadCount > 99 ? '99+' : unreadCount }}
      </span>
    </button>

    <transition
      enter-active-class="transition duration-150 ease-out"
      enter-from-class="opacity-0 -translate-y-1"
      enter-to-class="opacity-100 translate-y-0"
      leave-active-class="transition duration-100 ease-in"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div
        v-if="isOpen"
        class="absolute right-0 mt-2 w-80 sm:w-96 max-h-[70vh] overflow-hidden bg-white rounded-2xl border border-slate-200 shadow-xl z-50 flex flex-col"
      >
        <div class="px-4 py-3 border-b border-slate-100 flex items-center justify-between shrink-0">
          <h3 class="font-bold text-sm text-slate-800">การแจ้งเตือน</h3>
          <button
            v-if="unreadCount > 0"
            @click="markAllRead"
            class="text-[11px] font-semibold text-teal-700 hover:text-teal-800 cursor-pointer"
          >
            อ่านทั้งหมด
          </button>
        </div>

        <div class="overflow-y-auto flex-1">
          <div v-if="isLoading" class="py-10 text-center text-xs text-slate-400">กำลังโหลด...</div>
          <div v-else-if="items.length === 0" class="py-10 text-center text-xs text-slate-400">ไม่มีการแจ้งเตือน</div>
          <button
            v-for="item in items"
            :key="item.id"
            @click="handleItemClick(item)"
            class="w-full text-left px-4 py-3 border-b border-slate-50 last:border-0 hover:bg-slate-50 transition-colors flex items-start gap-2.5 cursor-pointer"
            :class="!item.readAt && 'bg-teal-50/60'"
          >
            <span class="w-1.5 h-1.5 rounded-full mt-1.5 shrink-0" :class="item.readAt ? 'bg-transparent' : 'bg-teal-600'"></span>
            <div class="min-w-0">
              <div class="text-[10px] font-bold text-teal-700 uppercase tracking-wide">{{ typeLabel(item.notificationType) }}</div>
              <div class="text-xs text-slate-700 leading-snug break-words">{{ item.messagePreview }}</div>
              <div class="text-[10px] text-slate-400 mt-0.5">{{ formatTime(item.sentAt) }}</div>
            </div>
          </button>
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';
import { Bell } from 'lucide-vue-next';
import notificationService from '@/services/notificationService';

// mode: 'admin' ต้องมี buildingId, 'tenant' ใช้ตัวตนจาก LIFF token เอง
const props = defineProps({
  mode: { type: String, required: true },
  buildingId: { type: String, default: null }
});

const router = useRouter();
const rootEl = ref(null);
const isOpen = ref(false);
const isLoading = ref(false);
const items = ref([]);
const unreadCount = ref(0);
let pollTimer = null;

// ปลายทางที่คลิกแล้วพาไปดูรายละเอียด — ครอบคลุมเฉพาะ type ที่มีหน้าปลายทางชัดเจน ที่เหลือแค่ปิดเป็นอ่านแล้วเฉยๆ
const ADMIN_LINKS = {
  MAINTENANCE_NEW: '/maintenance',
  SLIP_UPLOADED: '/invoices',
  FACILITY_BOOKING_NEW: '/facility-bookings',
  VEHICLE_NEW: '/vehicles',
  TENANT_ONBOARDED: '/tenants'
};
const TENANT_LINKS = {
  INVOICE: '/liff/invoices',
  PARCEL: '/liff/parcels',
  MAINTENANCE: '/liff/issues',
  FACILITY_BOOKING: '/liff/facility-bookings',
  VEHICLE: '/liff/vehicles',
  POLL: '/liff/polls'
};
const ADMIN_LABELS = {
  MAINTENANCE_NEW: 'แจ้งซ่อมใหม่',
  SLIP_UPLOADED: 'สลิปรอตรวจสอบ',
  FACILITY_BOOKING_NEW: 'ขอจองพื้นที่',
  VEHICLE_NEW: 'ขอจดทะเบียนรถ',
  TENANT_ONBOARDED: 'ลูกบ้านใหม่'
};
const TENANT_LABELS = {
  INVOICE: 'บิลค่าเช่า',
  PARCEL: 'พัสดุ',
  MAINTENANCE: 'แจ้งซ่อม',
  FACILITY_BOOKING: 'จองพื้นที่ส่วนกลาง',
  VEHICLE: 'ยานพาหนะ',
  POLL: 'โหวต/แบบสำรวจ'
};

const typeLabel = (type) => (props.mode === 'admin' ? ADMIN_LABELS[type] : TENANT_LABELS[type]) || 'ทั่วไป';

const formatTime = (iso) => new Date(iso).toLocaleString('th-TH', { dateStyle: 'short', timeStyle: 'short' });

async function fetchUnreadCount() {
  try {
    const res = props.mode === 'admin'
      ? await notificationService.getAdminNotifications(props.buildingId, { unread: true })
      : await notificationService.getTenantNotifications({ unread: true });
    unreadCount.value = res.unreadCount || 0;
  } catch (_) {
    // ponytail: เงียบไว้พอ ไม่ให้ polling พังทั้งหน้าถ้า network สะดุดชั่วคราว
  }
}

async function fetchList() {
  isLoading.value = true;
  try {
    const res = props.mode === 'admin'
      ? await notificationService.getAdminNotifications(props.buildingId)
      : await notificationService.getTenantNotifications();
    items.value = res.data || [];
    unreadCount.value = res.unreadCount || 0;
  } finally {
    isLoading.value = false;
  }
}

function toggleOpen() {
  isOpen.value = !isOpen.value;
  if (isOpen.value) fetchList();
}
function close() {
  isOpen.value = false;
}

async function handleItemClick(item) {
  if (!item.readAt) {
    const mark = props.mode === 'admin'
      ? notificationService.markAdminNotificationRead(props.buildingId, item.id)
      : notificationService.markTenantNotificationRead(item.id);
    mark.then(() => {
      item.readAt = new Date().toISOString();
      unreadCount.value = Math.max(0, unreadCount.value - 1);
    }).catch(() => {});
  }
  const target = (props.mode === 'admin' ? ADMIN_LINKS : TENANT_LINKS)[item.notificationType];
  if (target) {
    close();
    router.push(target);
  }
}

async function markAllRead() {
  const req = props.mode === 'admin'
    ? notificationService.markAllAdminNotificationsRead(props.buildingId)
    : notificationService.markAllTenantNotificationsRead();
  await req.catch(() => {});
  items.value = items.value.map((i) => ({ ...i, readAt: i.readAt || new Date().toISOString() }));
  unreadCount.value = 0;
}

function handleOutsideClick(e) {
  if (isOpen.value && rootEl.value && !rootEl.value.contains(e.target)) close();
}

onMounted(() => {
  fetchUnreadCount();
  // ponytail: polling ทุก 45s พอสำหรับสเกลหอพัก ไม่ทำ WebSocket/SSE จนกว่าจะรู้สึกหน่วงจริง
  pollTimer = setInterval(fetchUnreadCount, 45000);
  document.addEventListener('mousedown', handleOutsideClick);
});
onUnmounted(() => {
  if (pollTimer) clearInterval(pollTimer);
  document.removeEventListener('mousedown', handleOutsideClick);
});
</script>
