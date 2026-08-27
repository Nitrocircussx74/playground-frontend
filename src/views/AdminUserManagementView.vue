<template>
  <div class="space-y-6">
    <!-- Header Toolbar -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div>
        <h1 class="text-2xl font-bold text-slate-900 tracking-tight">Admin User & Role Management</h1>
        <p class="text-sm text-slate-500">จัดการบัญชีผู้ดูแลระบบ กำหนดระดับสิทธิ์ (OWNER / MANAGER) และมอบหมายตึกที่ดูแล</p>
      </div>

      <div class="flex items-center gap-3">
        <button
          @click="openCreateModal"
          class="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-sm font-semibold transition-all shadow-sm shadow-purple-600/20 flex items-center gap-1.5"
        >
          <span>➕ เพิ่มแอดมินใหม่ (Add User)</span>
        </button>

        <button
          @click="fetchUsers"
          class="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-sm font-semibold transition-all border border-slate-200 flex items-center gap-1.5"
        >
          <span>🔄 Refresh List</span>
        </button>
      </div>
    </div>

    <!-- Error Alert -->
    <div v-if="error" class="p-4 bg-rose-50 border border-rose-200 rounded-2xl text-rose-700 text-xs font-medium flex items-center justify-between">
      <span>⚠️ {{ error }}</span>
      <button @click="error = ''" class="text-rose-500 hover:text-rose-700 font-bold">✕</button>
    </div>

    <!-- User Management Table Panel -->
    <div class="bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden">
      <div v-if="loading && users.length === 0" class="p-12 text-center text-slate-500">
        <div class="animate-spin w-8 h-8 border-4 border-purple-600 border-t-transparent rounded-full mx-auto mb-3"></div>
        กำลังโหลดรายการผู้ใช้งาน...
      </div>

      <div v-else class="overflow-x-auto">
        <table class="w-full text-left text-xs">
          <thead class="bg-slate-50 text-slate-700 uppercase font-bold border-b border-slate-200 tracking-wider">
            <tr>
              <th class="px-6 py-3.5">ผู้ดูแลระบบ (Admin Name & Email)</th>
              <th class="px-6 py-3.5">ระดับสิทธิ์ (Role)</th>
              <th class="px-6 py-3.5">ตึกที่ได้รับมอบหมาย (Assigned Buildings)</th>
              <th class="px-6 py-3.5">วันที่สร้าง</th>
              <th class="px-6 py-3.5 text-right">การจัดการ</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100">
            <tr v-for="user in users" :key="user.id" class="hover:bg-slate-50/80 transition-colors">
              <!-- Name & Email -->
              <td class="px-6 py-4">
                <div class="flex items-center gap-3">
                  <div
                    class="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-white shadow-xs shrink-0"
                    :class="getUserRoleBadgeClass(user.role).bgGradient"
                  >
                    {{ user.name?.slice(0, 2).toUpperCase() || 'AD' }}
                  </div>
                  <div>
                    <div class="font-bold text-slate-900 text-sm">{{ user.name }}</div>
                    <div class="text-slate-500 text-[11px] font-mono">{{ user.email }}</div>
                  </div>
                </div>
              </td>

              <!-- Role Badge -->
              <td class="px-6 py-4">
                <span
                  class="px-3 py-1 rounded-full text-[11px] font-extrabold uppercase border shadow-2xs inline-flex items-center gap-1"
                  :class="getUserRoleBadgeClass(user.role).badge"
                >
                  <span>{{ isOwnerRole(user.role) ? '👑' : '👔' }}</span>
                  <span>{{ user.role }}</span>
                </span>
              </td>

              <!-- Assigned Buildings Tags -->
              <td class="px-6 py-4">
                <div v-if="isOwnerRole(user.role)" class="inline-flex items-center gap-1 px-2.5 py-1 bg-purple-50 text-purple-700 border border-purple-200 rounded-xl text-[11px] font-bold">
                  <span>🌐 ทุกตึกในระบบ (Full Owner Access)</span>
                </div>

                <div v-else-if="user.buildingPermissions?.length > 0" class="flex flex-wrap gap-1.5">
                  <span
                    v-for="p in user.buildingPermissions"
                    :key="p.id"
                    class="px-2.5 py-0.5 bg-slate-100 text-slate-800 border border-slate-200 rounded-lg text-[11px] font-semibold"
                  >
                    🏢 {{ p.building?.name || 'Building' }}
                  </span>
                </div>

                <div v-else class="text-amber-600 italic text-[11px]">
                  ⚠️ ยังไม่ผูกตึก
                </div>
              </td>

              <!-- Created At -->
              <td class="px-6 py-4 text-slate-500 font-mono text-[11px]">
                {{ new Date(user.createdAt).toLocaleDateString('th-TH') }}
              </td>

              <!-- Action Buttons -->
              <td class="px-6 py-4 text-right space-x-2">
                <button
                  @click="openEditModal(user)"
                  class="px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 rounded-xl text-xs font-semibold transition-all"
                >
                  ⚙️ แก้ไขสิทธิ์
                </button>

                <button
                  v-if="user.id !== authStore.currentUser?.id"
                  @click="confirmDeleteUser(user)"
                  class="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-xl text-xs font-semibold transition-all"
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
      <div class="bg-white rounded-3xl border border-slate-200 shadow-2xl w-full max-w-xl overflow-hidden flex flex-col max-h-[90vh]">
        <!-- Modal Header -->
        <div class="px-6 py-4 bg-gradient-to-r from-purple-900 to-slate-900 text-white flex items-center justify-between">
          <h3 class="font-bold text-base text-white">
            {{ isEditing ? `แก้ไขสิทธิ์ผู้ใช้งาน: ${form.name}` : 'เพิ่มผู้ดูแลระบบใหม่ (Add Admin User)' }}
          </h3>
          <button @click="showModal = false" class="text-slate-400 hover:text-white p-1 rounded-lg">✕</button>
        </div>

        <!-- Modal Body -->
        <form @submit.prevent="handleSubmit" class="p-6 overflow-y-auto space-y-4 flex-1">
          <!-- Name & Email -->
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label class="block text-xs font-semibold text-slate-700 mb-1">ชื่อ-นามสกุล (Name)</label>
              <input
                v-model="form.name"
                type="text"
                required
                placeholder="e.g. สมชาย ใจดี"
                class="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-500/20"
              />
            </div>

            <div>
              <label class="block text-xs font-semibold text-slate-700 mb-1">อีเมลเข้าใช้งาน (Email)</label>
              <input
                v-model="form.email"
                type="email"
                required
                :disabled="isEditing"
                placeholder="manager@dorm.com"
                class="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-500/20 disabled:opacity-60"
              />
            </div>
          </div>

          <!-- Password (Required on Create, Optional on Edit) -->
          <div>
            <label class="block text-xs font-semibold text-slate-700 mb-1">
              {{ isEditing ? 'รหัสผ่านใหม่ (เว้นว่างไว้หากไม่ต้องการเปลี่ยน)' : 'รหัสผ่านเข้าสู่ระบบ (Password)' }}
            </label>
            <input
              v-model="form.password"
              type="password"
              :required="!isEditing"
              minlength="6"
              placeholder="••••••••"
              class="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-500/20"
            />
          </div>

          <!-- Role Select -->
          <div>
            <label class="block text-xs font-semibold text-slate-700 mb-1">เลือกระดับสิทธิ์ (Role)</label>
            <select
              v-model="form.role"
              required
              class="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2 text-xs text-slate-900 font-bold focus:outline-none focus:ring-2 focus:ring-purple-500/20"
            >
              <option value="MANAGER">👔 MANAGER (ผู้จัดการหอพักประจำตึก)</option>
              <option value="OWNER">👑 OWNER (เจ้าของหอพัก - เข้าถึงทุกตึก)</option>
            </select>
          </div>

          <!-- 📌 CONDITIONAL LOGIC: Building Access Selector for MANAGER -->
          <div v-if="form.role === 'MANAGER'" class="space-y-2 pt-2 border-t border-slate-100">
            <label class="block text-xs font-bold text-slate-900 flex items-center justify-between">
              <span>🏢 มอบหมายตึกที่ดูแล (Multi-Select Building Access)</span>
              <span class="text-[11px] text-purple-600 font-normal">เลือกได้หลายตึก</span>
            </label>

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-2 bg-slate-50 p-3 rounded-2xl border border-slate-200">
              <label
                v-for="b in buildings"
                :key="b.id"
                class="flex items-center gap-2 p-2 rounded-xl bg-white border border-slate-200/80 hover:border-purple-300 cursor-pointer transition-all"
              >
                <input
                  type="checkbox"
                  :value="b.id"
                  v-model="form.buildingIds"
                  class="w-4 h-4 text-purple-600 rounded border-slate-300 focus:ring-purple-500"
                />
                <span class="text-xs font-semibold text-slate-800">🏢 {{ b.name }}</span>
              </label>
            </div>
          </div>

          <div v-else-if="form.role === 'OWNER'" class="p-3 bg-purple-50 border border-purple-200 rounded-2xl text-xs text-purple-900 font-medium">
            🔑 ระดับสิทธิ์ <span class="font-bold">OWNER</span> สามารถเข้าถึงและจัดการข้อมูลตึกทั้งหมดในระบบโดยอัตโนมัติ (ไม่ต้องเลือกผูกตึก)
          </div>

          <!-- Modal Footer -->
          <div class="pt-4 flex justify-end gap-3 border-t border-slate-100">
            <button
              type="button"
              @click="showModal = false"
              class="px-4 py-2 border border-slate-300 text-slate-700 hover:bg-slate-100 rounded-xl text-xs font-semibold"
            >
              ยกเลิก
            </button>

            <button
              type="submit"
              :disabled="submitting"
              class="px-6 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold shadow-md shadow-purple-600/20 disabled:opacity-50 transition-all"
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
import { ref, reactive, onMounted } from 'vue';
import { useAuthStore } from '@/stores/auth';
import { useBuildingStore } from '@/stores/useBuildingStore';
import adminService from '@/services/adminService';
import api from '@/utils/api';
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
  return ['OWNER', 'SUPERADMIN', 'super_admin', 'owner'].includes((role || '').toUpperCase());
};

const getUserRoleBadgeClass = (role) => {
  if (isOwnerRole(role)) {
    return {
      badge: 'bg-rose-100 text-rose-700 border-rose-200',
      bgGradient: 'bg-gradient-to-tr from-rose-600 to-amber-600'
    };
  }
  return {
    badge: 'bg-indigo-100 text-indigo-700 border-indigo-200',
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
</script>
