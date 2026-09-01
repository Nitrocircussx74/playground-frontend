<template>
  <div class="space-y-6 max-w-7xl mx-auto pb-12">
    <!-- Header Toolbar -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <h1 class="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
          <span>👥</span>
          <span>ทะเบียนผู้เช่า & ระบบ CRM (Tenant CRM & History)</span>
        </h1>
        <p class="text-xs sm:text-sm text-slate-500">
          ค้นหา ตรวจสอบประวัติ 360 องศา และจัดการบันทึกภายในสำหรับผู้เช่าทุกคน
        </p>
      </div>

      <div class="flex items-center gap-2">
        <button
          @click="fetchTenants"
          class="px-4 py-2 bg-white hover:bg-slate-100 text-slate-700 rounded-xl text-xs font-semibold border border-slate-200 transition-all shadow-2xs flex items-center gap-1.5 cursor-pointer"
        >
          <span>🔄</span>
          <span>รีเฟรชข้อมูล</span>
        </button>
      </div>
    </div>

    <!-- Summary Stats Bar -->
    <div class="grid grid-cols-2 sm:grid-cols-4 gap-4">
      <div class="bg-white p-4 sm:p-5 rounded-3xl border border-slate-200/90 shadow-2xs space-y-1">
        <div class="text-[11px] font-bold text-slate-500 uppercase tracking-wider">ผู้เช่าทั้งหมด</div>
        <div class="text-2xl font-extrabold text-slate-900">{{ tenants.length }} คน</div>
        <div class="text-[10px] text-slate-400">ในฐานข้อมูล</div>
      </div>

      <div class="bg-white p-4 sm:p-5 rounded-3xl border border-slate-200/90 shadow-2xs space-y-1">
        <div class="text-[11px] font-bold text-slate-500 uppercase tracking-wider">กำลังเช่าอยู่</div>
        <div class="text-2xl font-extrabold text-emerald-600">{{ activeTenantsCount }} คน</div>
        <div class="text-[10px] text-slate-400">มีสัญญา Active / อยู่ในห้อง</div>
      </div>

      <div class="bg-white p-4 sm:p-5 rounded-3xl border border-slate-200/90 shadow-2xs space-y-1">
        <div class="text-[11px] font-bold text-slate-500 uppercase tracking-wider">ย้ายออกแล้ว</div>
        <div class="text-2xl font-extrabold text-slate-600">{{ endedTenantsCount }} คน</div>
        <div class="text-[10px] text-slate-400">สิ้นสุดสัญญาแล้ว</div>
      </div>

      <div class="bg-white p-4 sm:p-5 rounded-3xl border border-slate-200/90 shadow-2xs space-y-1">
        <div class="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Blacklist</div>
        <div class="text-2xl font-extrabold text-rose-600">{{ blacklistedTenantsCount }} คน</div>
        <div class="text-[10px] text-slate-400">บันทึกเตือนความเสี่ยง</div>
      </div>
    </div>

    <!-- Search & Filter Controls -->
    <div class="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs flex flex-col md:flex-row items-center justify-between gap-4">
      <!-- Status Filter Tabs -->
      <div class="flex items-center bg-slate-100 p-1 rounded-xl text-xs font-bold w-full md:w-auto">
        <button
          @click="selectedFilter = 'ALL'"
          class="flex-1 md:flex-none px-3.5 py-1.5 rounded-lg transition-all cursor-pointer"
          :class="selectedFilter === 'ALL' ? 'bg-white text-slate-900 shadow-2xs font-extrabold' : 'text-slate-500 hover:text-slate-800'"
        >
          ทั้งหมด ({{ tenants.length }})
        </button>
        <button
          @click="selectedFilter = 'ACTIVE'"
          class="flex-1 md:flex-none px-3.5 py-1.5 rounded-lg transition-all cursor-pointer"
          :class="selectedFilter === 'ACTIVE' ? 'bg-emerald-600 text-white shadow-2xs font-extrabold' : 'text-slate-500 hover:text-slate-800'"
        >
          🟢 กำลังเช่า ({{ activeTenantsCount }})
        </button>
        <button
          @click="selectedFilter = 'ENDED'"
          class="flex-1 md:flex-none px-3.5 py-1.5 rounded-lg transition-all cursor-pointer"
          :class="selectedFilter === 'ENDED' ? 'bg-slate-700 text-white shadow-2xs font-extrabold' : 'text-slate-500 hover:text-slate-800'"
        >
          ⚪ ย้ายออก ({{ endedTenantsCount }})
        </button>
        <button
          @click="selectedFilter = 'BLACKLIST'"
          class="flex-1 md:flex-none px-3.5 py-1.5 rounded-lg transition-all cursor-pointer"
          :class="selectedFilter === 'BLACKLIST' ? 'bg-rose-600 text-white shadow-2xs font-extrabold' : 'text-slate-500 hover:text-slate-800'"
        >
          🔴 Blacklist ({{ blacklistedTenantsCount }})
        </button>
      </div>

      <!-- Search Input -->
      <div class="w-full md:w-80 relative">
        <input
          v-model="searchQuery"
          type="text"
          placeholder="ค้นหาชื่อ, เบอร์โทร, เลขบัตร..."
          class="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2 text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-500/20"
        />
        <span class="absolute left-3 top-2.5 text-slate-400 text-xs">🔍</span>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="p-16 text-center bg-white border border-slate-200 rounded-3xl shadow-xs space-y-3">
      <div class="w-8 h-8 border-3 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
      <p class="text-xs text-slate-500 font-medium">กำลังโหลดข้อมูลทะเบียนผู้เช่า...</p>
    </div>

    <!-- Tenants Grid / Cards -->
    <div v-else-if="filteredTenants.length > 0" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
      <div
        v-for="t in filteredTenants"
        :key="t.id"
        class="bg-white rounded-3xl border border-slate-200/90 shadow-2xs hover:shadow-md hover:border-purple-300 transition-all p-5 flex flex-col justify-between space-y-4 group"
      >
        <!-- Card Header with Avatar & Badges -->
        <div class="space-y-3">
          <div class="flex items-start justify-between gap-3">
            <div class="flex items-center gap-3">
              <img
                v-if="t.linePictureUrl"
                :src="t.linePictureUrl"
                :alt="t.firstName"
                class="w-12 h-12 rounded-2xl object-cover ring-2 ring-purple-500/30 shadow-2xs shrink-0"
              />
              <div
                v-else
                class="w-12 h-12 rounded-2xl bg-gradient-to-tr from-purple-600 to-indigo-600 text-white font-extrabold text-lg flex items-center justify-center ring-2 ring-purple-500/30 shadow-2xs shrink-0"
              >
                {{ t.firstName ? t.firstName.charAt(0).toUpperCase() : '👤' }}
              </div>

              <div>
                <div class="text-sm font-bold text-slate-900 group-hover:text-purple-700 transition-colors">
                  {{ t.firstName }} {{ t.lastName }}
                </div>
                <div class="text-xs text-slate-500 flex items-center gap-1 font-mono">
                  <span>📞</span>
                  <span>{{ t.phone || '-' }}</span>
                </div>
              </div>
            </div>

            <!-- Status Badge -->
            <div class="shrink-0">
              <span
                v-if="t.isBlacklisted"
                class="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-700 border border-rose-200"
              >
                🔴 Blacklist
              </span>
              <span
                v-else-if="isTenantActive(t)"
                class="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-700 border border-emerald-200"
              >
                🟢 กำลังเช่า
              </span>
              <span
                v-else
                class="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-600 border border-slate-200"
              >
                ⚪ ย้ายออก
              </span>
            </div>
          </div>

          <!-- Room and Additional Info -->
          <div class="bg-slate-50 p-3 rounded-2xl border border-slate-200/70 text-xs space-y-1.5">
            <div class="flex items-center justify-between">
              <span class="text-slate-500 text-[11px]">ห้องพักปัจจุบัน:</span>
              <span v-if="t.rooms && t.rooms.length > 0" class="font-bold text-purple-800">
                🏠 ห้อง {{ t.rooms.map(r => r.roomNumber).join(', ') }}
              </span>
              <span v-else class="text-slate-400 italic text-[11px]">ไม่มีห้องพักผูกอยู่</span>
            </div>

            <div v-if="t.lineDisplayName" class="flex items-center justify-between text-[11px]">
              <span class="text-slate-500">LINE:</span>
              <span class="text-emerald-600 font-medium truncate max-w-[150px]">@{{ t.lineDisplayName }}</span>
            </div>
          </div>
        </div>

        <!-- Action Button: Open 360 Profile -->
        <router-link
          :to="`/tenants/${t.id}`"
          class="w-full py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-1.5 cursor-pointer"
        >
          <span>👤 ดูโปรไฟล์ & ประวัติ 360°</span>
          <span>→</span>
        </router-link>
      </div>
    </div>

    <!-- Empty State -->
    <div v-else class="p-12 text-center bg-white border border-slate-200 rounded-3xl text-slate-400 space-y-2">
      <div class="text-4xl">👥</div>
      <div class="text-sm font-bold text-slate-700">ไม่พบรายชื่อผู้เช่า</div>
      <p class="text-xs">ลองค้นหาด้วยคำค้นอื่น หรือสลับตัวกรองสถานะ</p>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import tenantService from '@/services/tenantService';
import { useBuildingStore } from '@/stores/useBuildingStore';

const buildingStore = useBuildingStore();

const loading = ref(true);
const tenants = ref([]);
const searchQuery = ref('');
const selectedFilter = ref('ALL');

onMounted(() => {
  fetchTenants();
});

// Re-fetch automatically when admin changes the selected building
watch(
  () => buildingStore.activeBuildingId,
  () => {
    fetchTenants();
  }
);

const fetchTenants = async () => {
  loading.value = true;
  try {
    const params = {};
    if (buildingStore.activeBuildingId) {
      params.buildingId = buildingStore.activeBuildingId;
    }
    const res = await tenantService.getAllTenants(params);
    if (res.success && res.data) {
      tenants.value = res.data;
    }
  } catch (err) {
    console.error('Failed to fetch tenants:', err);
  } finally {
    loading.value = false;
  }
};

const isTenantActive = (tenant) => {
  if (tenant.rooms && tenant.rooms.length > 0) return true;
  if (tenant.leaseContracts && tenant.leaseContracts.some(l => l.status === 'ACTIVE')) return true;
  return false;
};

const activeTenantsCount = computed(() => {
  return tenants.value.filter(t => isTenantActive(t)).length;
});

const endedTenantsCount = computed(() => {
  return tenants.value.filter(t => !isTenantActive(t) && !t.isBlacklisted).length;
});

const blacklistedTenantsCount = computed(() => {
  return tenants.value.filter(t => t.isBlacklisted).length;
});

const filteredTenants = computed(() => {
  return tenants.value.filter(t => {
    // 1. Status Filter
    if (selectedFilter.value === 'ACTIVE' && !isTenantActive(t)) return false;
    if (selectedFilter.value === 'ENDED' && isTenantActive(t)) return false;
    if (selectedFilter.value === 'BLACKLIST' && !t.isBlacklisted) return false;

    // 2. Search Query
    if (searchQuery.value.trim()) {
      const q = searchQuery.value.toLowerCase();
      const fullName = `${t.firstName || ''} ${t.lastName || ''}`.toLowerCase();
      const phone = (t.phone || '').toLowerCase();
      const idCard = (t.idCard || '').toLowerCase();
      const line = (t.lineDisplayName || '').toLowerCase();
      const rooms = (t.rooms || []).map(r => r.roomNumber.toLowerCase()).join(' ');

      return fullName.includes(q) || phone.includes(q) || idCard.includes(q) || line.includes(q) || rooms.includes(q);
    }

    return true;
  });
});
</script>
