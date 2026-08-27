<template>
  <div class="space-y-6">
    <!-- Top Hero Banner & Actions -->
    <div class="bg-gradient-to-r from-purple-900 via-indigo-900 to-slate-900 rounded-3xl p-6 text-white shadow-xl flex flex-col md:flex-row md:items-center md:justify-between gap-6 border border-purple-800/40">
      <div class="space-y-1">
        <div class="flex items-center gap-2">
          <span class="px-2.5 py-0.5 rounded-full text-[11px] font-extrabold uppercase bg-purple-500/30 text-purple-200 border border-purple-400/40">
            System Administration
          </span>
          <span class="text-xs text-purple-300 font-medium">RBAC Security Center</span>
        </div>
        <h1 class="text-2xl font-black tracking-tight text-white flex items-center gap-2.5">
          <span>👑 Admin User & Role Management</span>
        </h1>
        <p class="text-xs text-purple-200 max-w-xl">
          ศูนย์กลางบริหารจัดการผู้ใช้งานระบบหลังบ้าน กำหนดระดับสิทธิ์ (OWNER / MANAGER) และควบคุมสิทธิ์การเข้าถึงตึก
        </p>
      </div>

      <div class="flex items-center gap-3 shrink-0">
        <button
          @click="openCreateModal"
          class="px-4 py-2.5 bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600 text-white rounded-xl text-xs font-bold transition-all shadow-lg shadow-purple-950/50 hover:shadow-purple-500/30 flex items-center gap-2 border border-purple-400/30 active:scale-98 cursor-pointer"
        >
          <span class="text-base">➕</span>
          <span>เพิ่มแอดมินใหม่ (Add User)</span>
        </button>

        <button
          @click="fetchUsers"
          :disabled="loading"
          class="px-3.5 py-2.5 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-semibold backdrop-blur-md border border-white/15 transition-all shadow-xs flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
        >
          <span :class="{ 'animate-spin': loading }">🔄</span>
          <span class="hidden sm:inline">รีเฟรช</span>
        </button>
      </div>
    </div>

    <!-- 📊 KPI Summary Stats Bar -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <!-- Stat 1: Total Admins -->
      <div class="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs flex items-center justify-between">
        <div>
          <div class="text-[11px] font-bold text-slate-500 uppercase tracking-wider">แอดมินทั้งหมด (Total Admins)</div>
          <div class="text-2xl font-black text-slate-900 mt-1 font-mono">{{ users.length }} <span class="text-xs font-semibold text-slate-400">คน</span></div>
        </div>
        <div class="w-12 h-12 rounded-2xl bg-purple-50 border border-purple-100 text-purple-600 flex items-center justify-center text-xl font-bold">
          👥
        </div>
      </div>

      <!-- Stat 2: Owners / Executive Admins -->
      <div class="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs flex items-center justify-between">
        <div>
          <div class="text-[11px] font-bold text-slate-500 uppercase tracking-wider">ผู้บริหาร (Owners / Super)</div>
          <div class="text-2xl font-black text-rose-600 mt-1 font-mono">{{ ownerCount }} <span class="text-xs font-semibold text-slate-400">คน</span></div>
        </div>
        <div class="w-12 h-12 rounded-2xl bg-rose-50 border border-rose-100 text-rose-600 flex items-center justify-center text-xl font-bold">
          👑
        </div>
      </div>

      <!-- Stat 3: Managers -->
      <div class="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs flex items-center justify-between">
        <div>
          <div class="text-[11px] font-bold text-slate-500 uppercase tracking-wider">ผู้จัดการประจำตึก (Managers)</div>
          <div class="text-2xl font-black text-indigo-600 mt-1 font-mono">{{ managerCount }} <span class="text-xs font-semibold text-slate-400">คน</span></div>
        </div>
        <div class="w-12 h-12 rounded-2xl bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center text-xl font-bold">
          👔
        </div>
      </div>

      <!-- Stat 4: Buildings Count -->
      <div class="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs flex items-center justify-between">
        <div>
          <div class="text-[11px] font-bold text-slate-500 uppercase tracking-wider">จำนวนหอพักในระบบ</div>
          <div class="text-2xl font-black text-emerald-600 mt-1 font-mono">{{ buildings.length }} <span class="text-xs font-semibold text-slate-400">ตึก</span></div>
        </div>
        <div class="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-100 text-emerald-600 flex items-center justify-center text-xl font-bold">
          🏢
        </div>
      </div>
    </div>

    <!-- 🔍 Search & Filter Toolbar -->
    <div class="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <!-- Search Input -->
      <div class="relative flex-1 max-w-md">
        <span class="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400 text-sm">🔍</span>
        <input
          v-model="searchQuery"
          type="text"
          placeholder="ค้นหาตามชื่อ หรืออีเมล..."
          class="w-full bg-slate-50 border border-slate-300 rounded-xl pl-9 pr-3.5 py-2 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all"
        />
        <button
          v-if="searchQuery"
          @click="searchQuery = ''"
          class="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 text-xs"
        >
          ✕
        </button>
      </div>

      <!-- Role Filter Buttons -->
      <div class="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
        <button
          v-for="filterOption in roleFilterOptions"
          :key="filterOption.value"
          @click="selectedRoleFilter = filterOption.value"
          class="px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer"
          :class="selectedRoleFilter === filterOption.value ? 'bg-purple-600 text-white shadow-xs' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'"
        >
          {{ filterOption.label }}
        </button>
      </div>
    </div>

    <!-- Error Alert -->
    <div v-if="error" class="p-4 bg-rose-50 border border-rose-200 rounded-2xl text-rose-700 text-xs font-medium flex items-center justify-between shadow-2xs">
      <span class="flex items-center gap-2">⚠️ {{ error }}</span>
      <button @click="error = ''" class="text-rose-500 hover:text-rose-700 font-bold">✕</button>
    </div>

    <!-- User Management Table Panel -->
    <div class="bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden">
      <div v-if="loading && users.length === 0" class="p-12 text-center text-slate-500">
        <div class="animate-spin w-8 h-8 border-4 border-purple-600 border-t-transparent rounded-full mx-auto mb-3"></div>
        กำลังโหลดรายการผู้ใช้งานระบบหลังบ้าน...
      </div>

      <div v-else-if="filteredUsers.length === 0" class="p-12 text-center text-slate-400">
        <div class="text-4xl mb-2">🔍</div>
        <div class="text-sm font-bold text-slate-700">ไม่พบรายชื่อผู้ใช้งานตามเงื่อนไข</div>
        <p class="text-xs text-slate-400 mt-1">ลองเปลี่ยนคำค้นหาหรือเลือกสิทธิ์ในตัวกรองใหม่</p>
      </div>

      <div v-else class="overflow-x-auto">
        <table class="w-full text-left text-xs">
          <thead class="bg-slate-50/90 text-slate-700 uppercase font-extrabold border-b border-slate-200 tracking-wider">
            <tr>
              <th class="px-6 py-4">ผู้ดูแลระบบ (Admin User)</th>
              <th class="px-6 py-4">ระดับสิทธิ์ (Role)</th>
              <th class="px-6 py-4">ตึกที่ได้รับมอบหมาย (Building Permissions)</th>
              <th class="px-6 py-4">วันที่สร้าง (Created Date)</th>
              <th class="px-6 py-4 text-right">จัดการบัญชี</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100">
            <tr v-for="user in filteredUsers" :key="user.id" class="hover:bg-slate-50/80 transition-colors group">
              <!-- Name & Email -->
              <td class="px-6 py-4">
                <div class="flex items-center gap-3">
                  <div
                    class="w-10 h-10 rounded-2xl flex items-center justify-center font-black text-white shadow-sm shrink-0 ring-2 ring-white"
                    :class="getUserRoleBadgeClass(user.role).bgGradient"
                  >
                    {{ user.name?.slice(0, 2).toUpperCase() || 'AD' }}
                  </div>
                  <div>
                    <div class="font-bold text-slate-900 text-sm group-hover:text-purple-700 transition-colors flex items-center gap-1.5">
                      <span>{{ user.name }}</span>
                      <span v-if="user.id === authStore.currentUser?.id" class="px-1.5 py-0.2 bg-emerald-100 text-emerald-800 rounded-md text-[10px] font-extrabold">คุณ</span>
                    </div>
                    <div class="text-slate-500 text-[11px] font-mono">{{ user.email }}</div>
                  </div>
                </div>
              </td>

              <!-- Role Badge -->
              <td class="px-6 py-4">
                <span
                  class="px-3 py-1 rounded-full text-[11px] font-black uppercase border shadow-2xs inline-flex items-center gap-1.5"
                  :class="getUserRoleBadgeClass(user.role).badge"
                >
                  <span>{{ isOwnerRole(user.role) ? '👑' : '👔' }}</span>
                  <span>{{ user.role }}</span>
                </span>
              </td>

              <!-- Assigned Buildings Tags -->
              <td class="px-6 py-4">
                <div v-if="isOwnerRole(user.role)" class="inline-flex items-center gap-1.5 px-3 py-1 bg-gradient-to-r from-purple-50 to-indigo-50 text-purple-800 border border-purple-200 rounded-xl text-[11px] font-bold shadow-2xs">
                  <span>🌐</span>
                  <span>ทุกตึกในระบบ (Full System Access)</span>
                </div>

                <div v-else-if="user.buildingPermissions?.length > 0" class="flex flex-wrap gap-1.5">
                  <span
                    v-for="p in user.buildingPermissions"
                    :key="p.id"
                    class="px-2.5 py-1 bg-slate-100 text-slate-800 border border-slate-200/80 rounded-xl text-[11px] font-bold shadow-2xs flex items-center gap-1"
                  >
                    <span>🏢</span>
                    <span>{{ p.building?.name || 'Building' }}</span>
                  </span>
                </div>

                <div v-else class="inline-flex items-center gap-1 px-2.5 py-1 bg-amber-50 text-amber-800 border border-amber-200 rounded-xl text-[11px] font-semibold">
                  <span>⚠️</span>
                  <span>ยังไม่ได้เลือกตึก</span>
                </div>
              </td>

              <!-- Created At -->
              <td class="px-6 py-4 text-slate-500 font-mono text-[11px]">
                {{ formatDate(user.createdAt) }}
              </td>

              <!-- Action Buttons -->
              <td class="px-6 py-4 text-right space-x-2">
                <button
                  @click="openEditModal(user)"
                  class="px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 rounded-xl text-xs font-bold transition-all shadow-2xs active:scale-95 cursor-pointer"
                >
                  ⚙️ แก้ไขสิทธิ์
                </button>

                <button
                  v-if="user.id !== authStore.currentUser?.id"
                  @click="confirmDeleteUser(user)"
                  class="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-xl text-xs font-bold transition-all shadow-2xs active:scale-95 cursor-pointer"
                >
                  🗑️ ลบ
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Add / Edit User Modal Dialog -->
    <div v-if="showModal" class="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div class="bg-white rounded-3xl border border-slate-200 shadow-2xl w-full max-w-xl overflow-hidden flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95 duration-150">
        <!-- Modal Header -->
        <div class="px-6 py-4 bg-gradient-to-r from-purple-900 via-indigo-900 to-slate-900 text-white flex items-center justify-between">
          <div class="flex items-center gap-2">
            <span class="text-xl">{{ isEditing ? '⚙️' : '➕' }}</span>
            <h3 class="font-bold text-base text-white">
              {{ isEditing ? `แก้ไขสิทธิ์ผู้ใช้งาน: ${form.name}` : 'เพิ่มผู้ดูแลระบบใหม่ (Add Admin User)' }}
            </h3>
          </div>
          <button @click="showModal = false" class="text-purple-300 hover:text-white p-1.5 rounded-lg transition-colors cursor-pointer">✕</button>
        </div>

        <!-- Modal Body -->
        <form @submit.prevent="handleSubmit" class="p-6 overflow-y-auto space-y-4 flex-1">
          <!-- Name & Email -->
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label class="block text-xs font-bold text-slate-700 mb-1">ชื่อ-นามสกุล (Name)</label>
              <input
                v-model="form.name"
                type="text"
                required
                placeholder="e.g. สมชาย ใจดี"
                class="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500"
              />
            </div>

            <div>
              <label class="block text-xs font-bold text-slate-700 mb-1">อีเมลเข้าใช้งาน (Email)</label>
              <input
                v-model="form.email"
                type="email"
                required
                :disabled="isEditing"
                placeholder="manager@dorm.com"
                class="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 disabled:opacity-60 font-mono"
              />
            </div>
          </div>

          <!-- Password (Required on Create, Optional on Edit) -->
          <div>
            <label class="block text-xs font-bold text-slate-700 mb-1">
              {{ isEditing ? 'รหัสผ่านใหม่ (เว้นว่างไว้หากไม่ต้องการเปลี่ยน)' : 'รหัสผ่านเข้าสู่ระบบ (Password)' }}
            </label>
            <input
              v-model="form.password"
              type="password"
              :required="!isEditing"
              minlength="6"
              placeholder="••••••••"
              class="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 font-mono"
            />
          </div>

          <!-- Role Select -->
          <div>
            <label class="block text-xs font-bold text-slate-700 mb-1">เลือกระดับสิทธิ์ (Role)</label>
            <select
              v-model="form.role"
              required
              class="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2 text-xs text-slate-900 font-extrabold focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500"
            >
              <option value="MANAGER">👔 MANAGER (ผู้จัดการหอพักประจำตึก)</option>
              <option value="OWNER">👑 OWNER (เจ้าของหอพัก - สิทธิ์สูงสุดดูได้ทุกตึก)</option>
            </select>
          </div>

          <!-- 📌 CONDITIONAL LOGIC: Building Access Selector for MANAGER -->
          <div v-if="form.role === 'MANAGER'" class="space-y-2 pt-2 border-t border-slate-100">
            <label class="block text-xs font-bold text-slate-900 flex items-center justify-between">
              <span>🏢 มอบหมายตึกที่ดูแล (Multi-Select Building Access)</span>
              <span class="text-[11px] text-purple-600 font-bold">เลือกได้หลายตึก</span>
            </label>

            <div v-if="buildings.length === 0" class="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-800">
              ⚠️ ไม่พบข้อมูลตึกในระบบ กรุณาเพิ่มตึกก่อนมอบหมายสิทธิ์
            </div>

            <div v-else class="grid grid-cols-1 sm:grid-cols-2 gap-2 bg-slate-50 p-3 rounded-2xl border border-slate-200">
              <label
                v-for="b in buildings"
                :key="b.id"
                class="flex items-center gap-2.5 p-2.5 rounded-xl border transition-all cursor-pointer select-none"
                :class="form.buildingIds.includes(b.id) ? 'bg-purple-50/80 border-purple-400 text-purple-950 font-bold shadow-2xs' : 'bg-white border-slate-200 text-slate-700 hover:border-slate-300'"
              >
                <input
                  type="checkbox"
                  :value="b.id"
                  v-model="form.buildingIds"
                  class="w-4 h-4 text-purple-600 rounded border-slate-300 focus:ring-purple-500 cursor-pointer"
                />
                <span class="text-xs font-semibold">🏢 {{ b.name }}</span>
              </label>
            </div>
          </div>

          <div v-else-if="isOwnerRole(form.role)" class="p-3 bg-purple-50 border border-purple-200 rounded-2xl text-xs text-purple-950 font-semibold flex items-center gap-2">
            <span>🔑</span>
            <span>ระดับสิทธิ์ <span class="font-black text-purple-700">{{ form.role }}</span> สามารถเข้าถึงและจัดการข้อมูลทุกตึกในระบบได้โดยอัตโนมัติ</span>
          </div>

          <!-- Modal Footer -->
          <div class="pt-4 flex justify-end gap-3 border-t border-slate-100">
            <button
              type="button"
              @click="showModal = false"
              class="px-4 py-2 border border-slate-300 text-slate-700 hover:bg-slate-100 rounded-xl text-xs font-bold transition-all cursor-pointer"
            >
              ยกเลิก
            </button>

            <button
              type="submit"
              :disabled="submitting"
              class="px-6 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white rounded-xl text-xs font-bold shadow-md shadow-purple-600/20 disabled:opacity-50 transition-all cursor-pointer"
            >
              <span>{{ submitting ? 'กำลังบันทึก...' : (isEditing ? '💾 บันทึกการแก้ไข' : '🚀 สร้างผู้ใช้งานใหม่') }}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue';
import { useAuthStore } from '@/stores/auth';
import { useBuildingStore } from '@/stores/useBuildingStore';
import adminService from '@/services/adminService';
import { showSuccess, showError, showConfirm } from '@/utils/swal';

const authStore = useAuthStore();
const buildingStore = useBuildingStore();
const users = ref([]);
const buildings = ref([]);
const loading = ref(false);
const submitting = ref(false);
const error = ref('');
const showModal = ref(false);
const isEditing = ref(false);
const editingUserId = ref(null);

const searchQuery = ref('');
const selectedRoleFilter = ref('ALL');

const roleFilterOptions = [
  { label: 'ทั้งหมด', value: 'ALL' },
  { label: '👑 Owners', value: 'OWNER' },
  { label: '👔 Managers', value: 'MANAGER' }
];

const form = reactive({
  name: '',
  email: '',
  password: '',
  role: 'MANAGER',
  buildingIds: []
});

onMounted(() => {
  fetchUsers();
  fetchBuildingsList();
});

const fetchUsers = async () => {
  loading.value = true;
  error.value = '';
  try {
    const res = await adminService.getAdminUsers();
    users.value = res.data || [];
  } catch (err) {
    error.value = err.response?.data?.message || 'ไม่สามารถดึงรายชื่อผู้ใช้ได้';
  } finally {
    loading.value = false;
  }
};

const fetchBuildingsList = async () => {
  try {
    await buildingStore.fetchBuildings();
    buildings.value = buildingStore.buildings || [];
  } catch (err) {
    console.error('Failed to fetch buildings list:', err);
  }
};

const isOwnerRole = (role) => {
  return ['OWNER', 'SUPERADMIN', 'SUPER_ADMIN', 'owner', 'super_admin', 'superadmin'].includes((role || '').toUpperCase());
};

const ownerCount = computed(() => {
  return users.value.filter((u) => isOwnerRole(u.role)).length;
});

const managerCount = computed(() => {
  return users.value.filter((u) => !isOwnerRole(u.role)).length;
});

const filteredUsers = computed(() => {
  return users.value.filter((u) => {
    // 1. Role Filter
    if (selectedRoleFilter.value === 'OWNER' && !isOwnerRole(u.role)) return false;
    if (selectedRoleFilter.value === 'MANAGER' && isOwnerRole(u.role)) return false;

    // 2. Search Query Filter
    if (searchQuery.value.trim()) {
      const q = searchQuery.value.trim().toLowerCase();
      const matchName = u.name?.toLowerCase().includes(q);
      const matchEmail = u.email?.toLowerCase().includes(q);
      return matchName || matchEmail;
    }

    return true;
  });
});

const getUserRoleBadgeClass = (role) => {
  if (isOwnerRole(role)) {
    return {
      badge: 'bg-rose-100 text-rose-800 border-rose-200',
      bgGradient: 'bg-gradient-to-tr from-rose-600 to-amber-600'
    };
  }
  return {
    badge: 'bg-indigo-100 text-indigo-800 border-indigo-200',
    bgGradient: 'bg-gradient-to-tr from-purple-600 to-indigo-600'
  };
};

const openCreateModal = () => {
  isEditing.value = false;
  editingUserId.value = null;
  form.name = '';
  form.email = '';
  form.password = '';
  form.role = 'MANAGER';
  form.buildingIds = [];
  showModal.value = true;
};

const openEditModal = (user) => {
  isEditing.value = true;
  editingUserId.value = user.id;
  form.name = user.name;
  form.email = user.email;
  form.password = '';
  form.role = isOwnerRole(user.role) ? 'OWNER' : 'MANAGER';
  form.buildingIds = user.buildingPermissions ? user.buildingPermissions.map((p) => p.buildingId) : [];
  showModal.value = true;
};

const handleSubmit = async () => {
  submitting.value = true;
  try {
    if (isEditing.value) {
      const res = await adminService.updateUserPermissions(editingUserId.value, {
        name: form.name,
        role: form.role,
        buildingIds: form.role === 'MANAGER' ? form.buildingIds : []
      });
      await showSuccess('สำเร็จ!', res.message || 'อัปเดตสิทธิ์เรียบร้อยแล้ว');
    } else {
      const res = await adminService.createAdminUser({
        name: form.name,
        email: form.email,
        password: form.password,
        role: form.role,
        buildingIds: form.role === 'MANAGER' ? form.buildingIds : []
      });
      await showSuccess('สำเร็จ!', res.message || 'สร้างแอดมินใหม่เรียบร้อยแล้ว');
    }
    showModal.value = false;
    fetchUsers();
  } catch (err) {
    showError('เกิดข้อผิดพลาด', err.response?.data?.message || 'ไม่สามารถบันทึกข้อมูลได้');
  } finally {
    submitting.value = false;
  }
};

const confirmDeleteUser = async (user) => {
  const confirmed = await showConfirm(
    'ยืนยันการลบบัญชี',
    `คุณต้องการลบบัญชีแอดมิน "${user.name}" (${user.email}) ใช่หรือไม่?`
  );

  if (!confirmed) return;

  try {
    const res = await adminService.deleteAdminUser(user.id);
    await showSuccess('สำเร็จ!', res.message || 'ลบบัญชีเรียบร้อยแล้ว');
    fetchUsers();
  } catch (err) {
    showError('เกิดข้อผิดพลาด', err.response?.data?.message || 'ไม่สามารถลบบัญชีได้');
  }
};

const formatDate = (dateStr) => {
  if (!dateStr) return '';
  return new Date(dateStr).toLocaleDateString('th-TH');
};
</script>
