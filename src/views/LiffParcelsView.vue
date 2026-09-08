<template>
  <div class="space-y-5 pb-6 font-sans text-slate-800">
    <!-- Feature Disabled State -->
    <div v-if="!isParcelFeatureEnabled" class="p-8 bg-white rounded-2xl border border-slate-100/80 shadow-xs text-center space-y-3">
      <div class="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto">
        <Package class="w-6 h-6" />
      </div>
      <h2 class="text-sm font-bold text-slate-800">ฟีเจอร์พัสดุไม่พร้อมใช้งาน</h2>
      <p class="text-xs text-slate-500">ขออภัย ฟีเจอร์แจ้งเตือนพัสดุถูกปิดการใช้งานชั่วคราว</p>
    </div>

    <!-- Feature Enabled View -->
    <template v-else>
      <!-- Header -->
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-lg font-bold text-slate-900 tracking-tight">พัสดุของฉัน</h1>
          <p class="text-xs text-slate-500 mt-0.5">ตรวจสอบรายการพัสดุและรหัสรับของ</p>
        </div>

        <button
          @click="fetchParcels"
          class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-orange-50/80 hover:bg-orange-100 text-xs font-semibold text-orange-700 transition-colors"
        >
          <RotateCw class="w-3.5 h-3.5" :class="{ 'animate-spin': loading }" />
          <span>รีเฟรช</span>
        </button>
      </div>

      <!-- Tenant Pickup QR Code Verification Card -->
      <div class="bg-gradient-to-br from-amber-500 to-orange-500 p-4 sm:p-5 rounded-2xl text-white shadow-xs space-y-3 relative overflow-hidden">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-2">
            <QrCode class="w-4 h-4 text-amber-100" />
            <span class="font-semibold text-xs tracking-wide text-amber-50">QR Code สำหรับรับพัสดุ</span>
          </div>
          <span class="text-[11px] bg-white/20 px-2.5 py-0.5 rounded-full font-medium">ห้อง {{ tenantRoomNumber || 'N/A' }}</span>
        </div>

        <div class="bg-white p-3.5 rounded-xl flex items-center justify-between text-slate-800 shadow-xs">
          <div>
            <div class="text-[10px] font-semibold text-slate-400">แสดง QR Code นี้ให้นิติบุคคล</div>
            <div class="text-sm font-bold text-slate-900 mt-0.5">{{ tenantName || 'ผู้เช่าห้องพัก' }}</div>
            <div class="text-xs text-orange-600 font-semibold mt-1">
              รอรับพัสดุ {{ pendingParcels.length }} รายการ
            </div>
          </div>

          <!-- Profile / Room QR Code -->
          <div class="w-16 h-16 bg-slate-50 rounded-xl border border-slate-100 p-1 shrink-0 flex items-center justify-center">
            <img v-if="pickupQrUrl" :src="pickupQrUrl" alt="Pickup QR" class="w-full h-full object-contain rounded-lg" />
            <QrCode v-else class="w-8 h-8 text-slate-300" />
          </div>
        </div>
      </div>

      <!-- Loading Skeleton State -->
      <div v-if="loading" class="space-y-3 animate-pulse">
        <div v-for="i in 2" :key="i" class="bg-white rounded-2xl border border-slate-100/90 shadow-xs p-4 space-y-3">
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-2.5">
              <div class="w-9 h-9 bg-slate-100 skeleton-shimmer rounded-xl"></div>
              <div class="space-y-1">
                <div class="h-3.5 w-24 bg-slate-100 skeleton-shimmer rounded-md"></div>
                <div class="h-2.5 w-32 bg-slate-100 skeleton-shimmer rounded-md"></div>
              </div>
            </div>
            <div class="h-6 w-20 bg-slate-100 skeleton-shimmer rounded-full"></div>
          </div>
          <div class="h-24 w-full bg-slate-100 skeleton-shimmer rounded-xl"></div>
        </div>
      </div>

      <!-- Parcels Card List -->
      <div v-else class="space-y-3">
        <div
          v-for="item in parcels"
          :key="item.id"
          @click="openParcelDetail(item)"
          class="bg-white rounded-2xl border border-slate-100/90 shadow-xs p-4 space-y-3 transition-all hover:border-orange-200 hover:shadow-md cursor-pointer active:scale-[0.99] group relative"
          :class="{ 'border-l-4 border-l-amber-400': item.status === 'PENDING' }"
        >
          <div class="flex items-start justify-between gap-2">
            <div class="flex items-center gap-3 min-w-0">
              <div class="w-9 h-9 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                <Truck class="w-4 h-4" />
              </div>
              <div class="min-w-0">
                <div class="flex items-center gap-1.5 flex-wrap">
                  <span class="font-bold text-slate-800 text-sm leading-tight group-hover:text-orange-600 transition-colors truncate">
                    {{ item.courier }}
                  </span>
                  <span v-if="item.room?.roomNumber" class="px-2 py-0.5 bg-slate-100 text-slate-600 font-medium text-[10px] rounded-full shrink-0">
                    ห้อง {{ item.room.roomNumber }}
                  </span>
                </div>
                <div class="text-xs font-mono text-slate-500 font-medium mt-0.5 truncate">
                  {{ item.trackingNumber || 'ไม่ระบุเลขแทรคกิ้ง' }}
                </div>
              </div>
            </div>

            <!-- Status Badge -->
            <div class="flex items-center gap-1.5 shrink-0">
              <span
                class="text-[11px] font-semibold px-2.5 py-1 rounded-full border inline-flex items-center gap-1"
                :class="{
                  'bg-amber-50 border-amber-200/70 text-amber-700': item.status === 'PENDING',
                  'bg-emerald-50 border-emerald-200/70 text-emerald-700': item.status === 'PICKED_UP'
                }"
              >
                <Clock v-if="item.status === 'PENDING'" class="w-3 h-3" />
                <CheckCircle2 v-else class="w-3 h-3" />
                <span>{{ item.status === 'PENDING' ? 'รอรับที่นิติฯ' : 'รับแล้ว' }}</span>
              </span>
              <ChevronRight class="w-4 h-4 text-slate-300 group-hover:text-orange-500 group-hover:translate-x-0.5 transition-all" />
            </div>
          </div>

          <!-- Parcel Box Image Preview -->
          <div v-if="item.photoUrl" class="w-full h-32 rounded-xl overflow-hidden bg-slate-50 border border-slate-100 relative group/img">
            <img :src="item.photoUrl" class="w-full h-full object-cover group-hover/img:scale-102 transition-transform duration-300" />
            <div class="absolute bottom-2 right-2 px-2 py-1 bg-black/60 backdrop-blur-xs text-white rounded-lg text-[10px] font-medium flex items-center gap-1">
              <Maximize2 class="w-2.5 h-2.5" />
              <span>แตะดูรูป</span>
            </div>
          </div>

          <!-- Timestamps -->
          <div class="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400 font-medium">
            <span>รับเข้า: {{ formatDate(item.receivedAt) }}</span>
            <span v-if="item.pickedUpAt" class="text-emerald-700 font-medium">รับแล้ว: {{ formatDate(item.pickedUpAt) }}</span>
            <span v-else class="text-orange-600 font-semibold text-[10px] flex items-center gap-0.5">
              <span>ดูรายละเอียด</span>
              <ChevronRight class="w-3 h-3" />
            </span>
          </div>
        </div>

        <!-- Empty State -->
        <div v-if="parcels.length === 0" class="p-10 bg-white rounded-2xl border border-slate-100/80 text-center space-y-2 shadow-xs">
          <div class="w-10 h-10 rounded-2xl bg-slate-50 text-slate-400 flex items-center justify-center mx-auto">
            <Inbox class="w-5 h-5" />
          </div>
          <p class="text-xs font-medium text-slate-500">ไม่มีรายการพัสดุในขณะนี้</p>
        </div>
      </div>

      <!-- Parcel Detail Modal Popup -->
      <Teleport to="body">
        <div
          v-if="selectedParcel"
          class="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-200"
          @click.self="closeParcelDetail"
        >
          <div
            class="bg-white w-full sm:max-w-lg rounded-t-[2rem] sm:rounded-3xl shadow-2xl max-h-[90dvh] flex flex-col overflow-hidden animate-in slide-in-from-bottom-6 sm:zoom-in-95 duration-200"
          >
            <!-- Modal Header -->
            <div class="shrink-0 px-5 py-4 border-b border-slate-100 flex items-center justify-between bg-white/95 backdrop-blur-md sticky top-0 z-10">
              <div class="flex items-center gap-2">
                <div class="w-8 h-8 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center">
                  <Package class="w-4 h-4" />
                </div>
                <div>
                  <h2 class="text-sm font-bold text-slate-900 leading-tight">รายละเอียดพัสดุ</h2>
                  <p class="text-[10px] text-slate-400 font-mono">{{ selectedParcel.id }}</p>
                </div>
              </div>

              <div class="flex items-center gap-2">
                <span
                  class="text-[10px] font-bold px-2.5 py-0.5 rounded-full border"
                  :class="{
                    'bg-amber-50 border-amber-200 text-amber-700': selectedParcel.status === 'PENDING',
                    'bg-emerald-50 border-emerald-200 text-emerald-700': selectedParcel.status === 'PICKED_UP'
                  }"
                >
                  {{ selectedParcel.status === 'PENDING' ? 'รอรับที่นิติฯ' : 'รับแล้ว' }}
                </span>

                <button
                  @click="closeParcelDetail"
                  class="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center transition-colors cursor-pointer"
                >
                  <X class="w-4 h-4" />
                </button>
              </div>
            </div>

            <!-- Modal Content (Scrollable) -->
            <div class="flex-1 overflow-y-auto p-5 space-y-4 text-left">
              <!-- Parcel Box Photo Showcase -->
              <div
                v-if="selectedParcel.photoUrl"
                @click="showLightbox = true"
                class="w-full rounded-2xl overflow-hidden bg-slate-100 border border-slate-100 shadow-xs relative group cursor-pointer"
              >
                <img
                  :src="selectedParcel.photoUrl"
                  :alt="selectedParcel.courier"
                  class="w-full max-h-64 object-cover object-center group-hover:scale-102 transition-transform duration-300"
                />
                <div class="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent flex items-end justify-between p-3 text-white">
                  <span class="text-xs font-medium backdrop-blur-xs bg-black/40 px-2.5 py-1 rounded-lg">
                    รูปถ่ายหน้ากล่องพัสดุ
                  </span>
                  <div class="px-2.5 py-1 bg-white/25 backdrop-blur-md rounded-lg text-xs font-semibold flex items-center gap-1.5 hover:bg-white/40 transition-colors">
                    <Maximize2 class="w-3.5 h-3.5" />
                    <span>แตะเพื่อขยายรูปเต็มจอ</span>
                  </div>
                </div>
              </div>

              <!-- Courier & Tracking Number Card -->
              <div class="p-4 bg-slate-50/90 rounded-2xl border border-slate-100/90 space-y-3">
                <div class="flex items-center justify-between">
                  <span class="text-xs font-medium text-slate-500">บริษัทขนส่ง</span>
                  <span class="text-xs font-bold text-slate-800 px-2.5 py-0.5 rounded-lg bg-white border border-slate-200/80 shadow-2xs">
                    {{ selectedParcel.courier }}
                  </span>
                </div>

                <div class="pt-2 border-t border-slate-200/60 flex items-center justify-between gap-2">
                  <div class="min-w-0">
                    <div class="text-[10px] font-semibold text-slate-400">หมายเลขพัสดุ (Tracking Number)</div>
                    <div class="text-sm font-mono font-bold text-slate-900 truncate mt-0.5">
                      {{ selectedParcel.trackingNumber || 'ไม่ระบุเลขแทรคกิ้ง' }}
                    </div>
                  </div>

                  <button
                    v-if="selectedParcel.trackingNumber"
                    @click="copyTrackingNumber(selectedParcel.trackingNumber)"
                    class="px-3 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer shrink-0 border"
                    :class="copiedTracking ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-white hover:bg-slate-100 text-slate-700 border-slate-200 shadow-2xs'"
                  >
                    <Check v-if="copiedTracking" class="w-3.5 h-3.5 text-emerald-600" />
                    <Copy v-else class="w-3.5 h-3.5 text-slate-500" />
                    <span>{{ copiedTracking ? 'คัดลอกแล้ว' : 'คัดลอก' }}</span>
                  </button>
                </div>
              </div>

              <!-- Location & Recipient Info -->
              <div class="grid grid-cols-2 gap-3">
                <div class="p-3.5 bg-slate-50/90 rounded-2xl border border-slate-100 space-y-1">
                  <div class="text-[10px] font-medium text-slate-400 flex items-center gap-1">
                    <DoorClosed class="w-3 h-3" />
                    <span>ห้องพักผู้รับ</span>
                  </div>
                  <div class="text-xs font-bold text-slate-900">
                    ห้อง {{ selectedParcel.room?.roomNumber || tenantRoomNumber || '-' }}
                  </div>
                </div>

                <div class="p-3.5 bg-slate-50/90 rounded-2xl border border-slate-100 space-y-1">
                  <div class="text-[10px] font-medium text-slate-400 flex items-center gap-1">
                    <Building2 class="w-3 h-3" />
                    <span>อาคารที่ตั้ง</span>
                  </div>
                  <div class="text-xs font-bold text-slate-900 truncate">
                    {{ selectedParcel.building?.name || selectedParcel.room?.buildingName || 'อาคารหลัก' }}
                  </div>
                </div>
              </div>

              <!-- Timestamps Details -->
              <div class="p-4 bg-slate-50/90 rounded-2xl border border-slate-100 space-y-2.5 text-xs">
                <div class="flex items-center justify-between text-slate-600">
                  <span class="flex items-center gap-1.5 text-slate-400">
                    <Calendar class="w-3.5 h-3.5" />
                    <span>วันเวลาที่พัสดุมาถึง:</span>
                  </span>
                  <span class="font-medium font-mono text-slate-800">
                    {{ formatDate(selectedParcel.receivedAt) }}
                  </span>
                </div>

                <div v-if="selectedParcel.pickedUpAt" class="flex items-center justify-between text-slate-600 pt-2 border-t border-slate-200/60">
                  <span class="flex items-center gap-1.5 text-slate-400">
                    <CheckCircle2 class="w-3.5 h-3.5 text-emerald-600" />
                    <span>วันเวลาที่มารับพัสดุ:</span>
                  </span>
                  <span class="font-medium font-mono text-emerald-700">
                    {{ formatDate(selectedParcel.pickedUpAt) }}
                  </span>
                </div>
              </div>

              <!-- Pickup Instructions Notice -->
              <div
                class="p-4 rounded-2xl border text-xs leading-relaxed flex items-start gap-3"
                :class="selectedParcel.status === 'PENDING' ? 'bg-amber-50/80 border-amber-200/80 text-amber-800' : 'bg-emerald-50/80 border-emerald-200/80 text-emerald-800'"
              >
                <div
                  class="w-6 h-6 rounded-lg flex items-center justify-center shrink-0 mt-0.5"
                  :class="selectedParcel.status === 'PENDING' ? 'bg-amber-200/70 text-amber-800' : 'bg-emerald-200/70 text-emerald-800'"
                >
                  <Clock v-if="selectedParcel.status === 'PENDING'" class="w-3.5 h-3.5" />
                  <CheckCircle2 v-else class="w-3.5 h-3.5" />
                </div>
                <div class="space-y-0.5">
                  <div class="font-bold">
                    {{ selectedParcel.status === 'PENDING' ? 'คำแนะนำการรับพัสดุ' : 'สถานะการรับของ' }}
                  </div>
                  <div class="text-[11px] opacity-90">
                    {{ selectedParcel.status === 'PENDING'
                      ? 'กรุณาแสดง QR Code ด้านบน หรือแจ้งหมายเลขห้องพักแก่เจ้าหน้าที่นิติบุคคลเพื่อขอรับพัสดุ'
                      : 'พัสดุรายการนี้ได้รับการยืนยันการรับมอบของเรียบร้อยแล้ว' }}
                  </div>
                </div>
              </div>
            </div>

            <!-- Modal Footer -->
            <div class="shrink-0 p-4 border-t border-slate-100 bg-white">
              <button
                @click="closeParcelDetail"
                class="w-full py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-2xl text-xs font-semibold transition-colors cursor-pointer"
              >
                ปิดหน้าต่าง
              </button>
            </div>
          </div>
        </div>
      </Teleport>

      <!-- Full-screen Photo Lightbox Modal -->
      <Teleport to="body">
        <div
          v-if="showLightbox && selectedParcel?.photoUrl"
          class="fixed inset-0 z-60 bg-black/95 backdrop-blur-md flex flex-col justify-between p-4 animate-in fade-in duration-200 select-none"
          @click.self="showLightbox = false"
        >
          <!-- Lightbox Top Controls -->
          <div class="flex items-center justify-between text-white p-2">
            <div class="space-y-0.5">
              <div class="text-xs font-bold">{{ selectedParcel.courier }}</div>
              <div class="text-[10px] text-white/70 font-mono">{{ selectedParcel.trackingNumber || 'หน้ากล่องพัสดุ' }}</div>
            </div>
            <button
              @click="showLightbox = false"
              class="w-9 h-9 rounded-full bg-white/20 hover:bg-white/30 text-white flex items-center justify-center transition-colors cursor-pointer"
            >
              <X class="w-5 h-5" />
            </button>
          </div>

          <!-- Centered Full Image -->
          <div class="flex-1 flex items-center justify-center p-2 overflow-hidden" @click.self="showLightbox = false">
            <img
              :src="selectedParcel.photoUrl"
              :alt="selectedParcel.courier"
              class="max-w-full max-h-[80dvh] object-contain rounded-2xl shadow-2xl animate-in zoom-in-95 duration-200"
            />
          </div>

          <!-- Lightbox Bottom Actions -->
          <div class="p-2 text-center">
            <a
              :href="selectedParcel.photoUrl"
              target="_blank"
              class="inline-flex items-center gap-1.5 px-4 py-2 bg-white/20 hover:bg-white/30 text-white rounded-xl text-xs font-medium transition-colors"
            >
              <Maximize2 class="w-3.5 h-3.5" />
              <span>เปิดภาพต้นฉบับในแท็บใหม่</span>
            </a>
          </div>
        </div>
      </Teleport>
    </template>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import {
  Package,
  RotateCw,
  QrCode,
  Truck,
  Clock,
  CheckCircle2,
  Inbox,
  X,
  Copy,
  Check,
  Maximize2,
  ChevronRight,
  Building2,
  DoorClosed,
  Calendar
} from 'lucide-vue-next';
import { initLiff, isLiffLoggedIn, getLiffProfile } from '@/utils/liff';
import QRCode from 'qrcode';
import { useFeatureStore } from '@/stores/useFeatureStore';
import api from '@/utils/api';

const featureStore = useFeatureStore();
const loading = ref(true);
const parcels = ref([]);
const lineUserId = ref('');
const tenantName = ref('');
const tenantRoomNumber = ref('');
const pickupQrUrl = ref('');
const selectedParcel = ref(null);
const showLightbox = ref(false);
const copiedTracking = ref(false);

const isParcelFeatureEnabled = computed(() => {
  return featureStore.isEnabled('ENABLE_PARCEL_NOTIFY');
});

const pendingParcels = computed(() => parcels.value.filter((p) => p.status === 'PENDING'));

const generatePickupQr = async () => {
  const qrText = `PARCEL-PICKUP:${tenantName.value || 'TENANT'}:${tenantRoomNumber.value || 'ROOM'}:${Date.now()}`;
  try {
    pickupQrUrl.value = await QRCode.toDataURL(qrText, { margin: 1, width: 200 });
  } catch (err) {
    console.warn('Could not generate pickup QR:', err);
  }
};

const openParcelDetail = (parcel) => {
  selectedParcel.value = parcel;
  copiedTracking.value = false;
};

const closeParcelDetail = () => {
  selectedParcel.value = null;
  showLightbox.value = false;
  copiedTracking.value = false;
};

const copyTrackingNumber = async (code) => {
  if (!code) return;
  try {
    if (navigator?.clipboard?.writeText) {
      await navigator.clipboard.writeText(code);
    } else {
      const el = document.createElement('textarea');
      el.value = code;
      document.body.appendChild(el);
      el.select();
      document.execCommand('copy');
      document.body.removeChild(el);
    }
    copiedTracking.value = true;
    setTimeout(() => {
      copiedTracking.value = false;
    }, 2000);
  } catch (e) {
    console.warn('Copy tracking number failed:', e);
  }
};

onMounted(async () => {
  if (featureStore.features.length === 0) {
    await featureStore.fetchFeatures();
  }

  try {
    await initLiff();
    if (isLiffLoggedIn()) {
      const profile = await getLiffProfile();
      if (profile?.userId) {
        lineUserId.value = profile.userId;
        tenantName.value = profile.displayName;
      }
    }
  } catch (err) {
    console.warn('LIFF init fallback mode:', err.message);
  }

  await fetchParcels();
  await generatePickupQr();
});

const fetchParcels = async () => {
  loading.value = true;
  try {
    const params = {};
    if (lineUserId.value) params.lineUserId = lineUserId.value;

    const res = await api.get('/api/v1/liff/parcels', { params });
    parcels.value = res.data.data;
    if (parcels.value.length > 0) {
      tenantRoomNumber.value = parcels.value[0].room?.roomNumber || '';
    }
  } catch (error) {
    console.error('Failed to fetch LIFF parcels:', error);
  } finally {
    loading.value = false;
  }
};

const formatDate = (dateStr) => {
  if (!dateStr) return '-';
  return new Date(dateStr).toLocaleString('th-TH', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
};
</script>

