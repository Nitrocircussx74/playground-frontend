<template>
  <div v-if="show" class="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
    <div class="bg-white rounded-3xl border border-slate-200 shadow-2xl w-full max-w-2xl overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-150">
      <!-- Modal Header -->
      <div class="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
        <div class="flex items-center gap-2">
          <span class="text-xl">📜</span>
          <div>
            <h3 class="font-bold text-base text-white leading-tight">
              ประวัติการเข้าอยู่และสัญญาเช่า (ห้อง {{ room?.roomNumber }})
            </h3>
            <p class="text-xs text-slate-400">
              {{ room?.building?.name || 'หอพัก' }} | ชั้น {{ room?.floor }} | สถานะ: {{ room?.status === 'occupied' ? 'มีผู้เช่า' : 'ห้องว่าง' }}
            </p>
          </div>
        </div>
        <button @click="emit('close')" class="text-slate-400 hover:text-white p-1 rounded-lg cursor-pointer">✕</button>
      </div>

      <!-- Tab Navigation -->
      <div class="px-6 border-b border-slate-200 flex gap-4 bg-slate-50 text-xs font-bold">
        <button
          @click="activeTab = 'current'"
          class="py-3 border-b-2 transition-all cursor-pointer"
          :class="activeTab === 'current' ? 'border-cyan-600 text-cyan-700 font-extrabold' : 'border-transparent text-slate-500 hover:text-slate-800'"
        >
          👤 ผู้เช่าปัจจุบัน & การย้ายออก
        </button>
        <button
          @click="activeTab = 'history'"
          class="py-3 border-b-2 transition-all cursor-pointer"
          :class="activeTab === 'history' ? 'border-cyan-600 text-cyan-700 font-extrabold' : 'border-transparent text-slate-500 hover:text-slate-800'"
        >
          📜 ประวัติสัญญาเช่าทั้งหมด ({{ leases.length }})
        </button>
      </div>

      <div class="p-6 space-y-6">
        <!-- Tab 1: Current Tenant, Room Owner & Occupants -->
        <div v-if="activeTab === 'current'" class="space-y-4">
          <!-- Room Owner Card -->
          <div class="bg-teal-50/60 border border-teal-100 p-4 rounded-2xl text-xs space-y-2">
            <div class="flex items-center justify-between gap-3">
              <div class="flex items-center gap-2.5">
                <span class="text-base">👑</span>
                <div>
                  <div class="font-bold text-slate-800">
                    เจ้าของห้อง (Owner): {{ currentRoomOwnerName }}
                  </div>
                  <div v-if="room?.owner" class="text-[11px] text-slate-500 font-mono">
                    {{ room?.owner?.phone || '-' }} | {{ room?.owner?.email || '-' }}
                  </div>
                </div>
              </div>
              <div class="flex items-center gap-2">
                <span class="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-teal-100 text-teal-700">
                  {{ room?.owner ? 'มีกรรมสิทธิ์' : 'กรรมสิทธิ์โครงการ' }}
                </span>
                <button
                  v-if="!isEditingOwner"
                  type="button"
                  @click="openEditOwner"
                  class="px-2 py-1 bg-white hover:bg-teal-100 text-teal-700 border border-teal-200 rounded-lg text-[11px] font-bold transition-all shadow-2xs cursor-pointer flex items-center gap-1"
                >
                  <span>✏️ เปลี่ยน</span>
                </button>
              </div>
            </div>

            <!-- Inline Owner Selector -->
            <div v-if="isEditingOwner" class="pt-2 border-t border-teal-100/80 flex flex-col sm:flex-row items-center gap-2">
              <select
                v-model="selectedOwnerId"
                class="w-full sm:flex-1 bg-white border border-teal-200 rounded-xl px-3 py-1.5 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500/20"
              >
                <option :value="null">🏢 ไม่มี (หอพัก/โครงการเป็นเจ้าของเอง)</option>
                <option v-for="owner in roomOwners" :key="owner.id" :value="owner.id">
                  👑 {{ owner.name }} ({{ owner.phone || owner.email }})
                </option>
              </select>
              <div class="flex items-center gap-1.5 w-full sm:w-auto justify-end">
                <button
                  type="button"
                  @click="isEditingOwner = false"
                  class="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold cursor-pointer"
                >
                  ยกเลิก
                </button>
                <button
                  type="button"
                  :disabled="savingOwner"
                  @click="handleSaveOwner"
                  class="px-3.5 py-1.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer disabled:opacity-50"
                >
                  {{ savingOwner ? 'กำลังบันทึก...' : '💾 บันทึก' }}
                </button>
              </div>
            </div>
          </div>

          <!-- Active Lease Card -->
          <div v-if="activeLease" class="bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200 p-5 rounded-2xl space-y-3">
            <div class="flex items-center justify-between border-b border-emerald-200/60 pb-3">
              <div>
                <span class="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-100 text-emerald-800 border border-emerald-300">
                  🟢 สัญญาปัจจุบัน (Active Lease)
                </span>
                <div class="text-lg font-black text-slate-900 mt-1">
                  {{ activeLease.tenant ? `${activeLease.tenant.firstName} ${activeLease.tenant.lastName}` : 'ผู้เช่าปัจจุบัน' }}
                </div>
                <div class="text-xs text-slate-600">โทร: {{ activeLease.tenant?.phone || '-' }}</div>
              </div>

              <div class="text-right font-mono text-xs">
                <div class="text-[10px] text-slate-400 font-bold uppercase">เงินประกัน / มัดจำ</div>
                <div class="text-base font-black text-emerald-700">฿{{ Number(activeLease.depositAmount || 0).toLocaleString() }}</div>
              </div>
            </div>

            <div class="grid grid-cols-2 gap-3 text-xs">
              <div>
                <span class="text-slate-400 font-bold">วันเริ่มสัญญา:</span>
                <span class="font-bold text-slate-800 ml-1 font-mono">{{ formatDate(activeLease.startDate) }}</span>
              </div>
              <div class="text-right">
                <span class="text-slate-400 font-bold">วันหมดสัญญาตามกำหนด:</span>
                <span class="font-bold text-slate-800 ml-1 font-mono">{{ formatDate(activeLease.expectedEndDate) }}</span>
              </div>
            </div>

            <div v-if="activeLease.adminNote" class="bg-white p-3 rounded-xl border border-emerald-200 text-xs text-slate-600">
              <span class="font-bold text-emerald-800">💡 หมายเหตุสัญญา:</span> {{ activeLease.adminNote }}
            </div>

            <!-- Terminate Lease Button -->
            <div class="pt-3 border-t border-emerald-200/60 flex justify-end">
              <button
                @click="openTerminateModal(activeLease)"
                class="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-rose-600/20 flex items-center gap-1.5 cursor-pointer"
              >
                <span>🚨 แจ้งย้ายออก / สิ้นสุดสัญญา (Terminate Lease)</span>
              </button>
            </div>
          </div>

          <!-- Room Residents Section (สมาชิกในห้องพัก) -->
          <div v-if="room?.status === 'occupied' || residents.length > 0" class="bg-white border border-slate-200 p-4 rounded-2xl space-y-3">
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-2">
                <span class="text-base">👥</span>
                <span class="text-xs font-bold text-slate-800">สมาชิกผู้อยู่อาศัยในห้อง ({{ residents.length }} คน)</span>
              </div>
              <button
                @click="showAddResidentModal = true"
                class="px-2.5 py-1 bg-cyan-50 hover:bg-cyan-100 text-cyan-700 border border-cyan-200 rounded-lg text-xs font-bold transition-colors cursor-pointer flex items-center gap-1"
              >
                <span>➕ เพิ่มรูมเมท</span>
              </button>
            </div>

            <div v-if="residents.length > 0" class="space-y-2">
              <div
                v-for="res in residents"
                :key="res.id"
                class="p-2.5 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between text-xs"
              >
                <div class="flex items-center gap-2.5">
                  <div class="w-7 h-7 rounded-full bg-slate-200 text-slate-700 font-bold text-xs flex items-center justify-center">
                    {{ (res.tenant?.firstName || 'U').charAt(0) }}
                  </div>
                  <div>
                    <div class="font-bold text-slate-800">
                      {{ res.tenant?.firstName }} {{ res.tenant?.lastName }}
                    </div>
                    <div class="text-[10px] text-slate-400 font-mono">{{ res.tenant?.phone || '-' }}</div>
                  </div>
                </div>
                <div class="flex items-center gap-2">
                  <span
                    class="px-2 py-0.5 rounded-full text-[10px] font-bold"
                    :class="res.role === 'PRIMARY' ? 'bg-amber-100 text-amber-800 border border-amber-200' : 'bg-sky-100 text-sky-800 border border-sky-200'"
                  >
                    {{ res.role === 'PRIMARY' ? '👑 ผู้เช่าหลัก' : '👥 ผู้อยู่อาศัยร่วม' }}
                  </span>
                  <button
                    v-if="res.role !== 'PRIMARY'"
                    @click="handleRemoveResident(res.tenantId)"
                    class="text-rose-500 hover:text-rose-700 p-1 text-xs cursor-pointer"
                    title="นำออกจากห้อง"
                  >
                    🗑️
                  </button>
                </div>
              </div>
            </div>
            <div v-else class="text-center py-3 text-xs text-slate-400">
              ยังไม่มีข้อมูลผู้อยู่อาศัยในห้องนี้
            </div>
          </div>

          <div v-else class="p-8 text-center bg-slate-50 border border-slate-200 rounded-2xl text-slate-500 space-y-2">
            <div class="text-3xl">🔑</div>
            <div class="text-sm font-bold text-slate-700">ห้องนี้เป็นห้องว่าง (Vacant Room)</div>
            <p class="text-xs text-slate-400">ยังไม่มีผู้เช่าในปัจจุบัน หรือสัญญาล่าสุดย้ายออกแล้ว</p>
          </div>
        </div>

        <!-- Tab 2: Tenancy History Timeline -->
        <div v-else-if="activeTab === 'history'" class="space-y-3">
          <div v-if="loading" class="text-center p-8 text-xs text-slate-500 font-semibold animate-pulse">
            กำลังโหลดประวัติสัญญาเช่า...
          </div>

          <div v-else-if="leases.length > 0" class="space-y-3">
            <div
              v-for="item in leases"
              :key="item.id"
              class="p-4 bg-white border border-slate-200 rounded-2xl shadow-2xs space-y-2 relative"
              :class="{ 'border-l-4 border-l-emerald-500': item.status === 'ACTIVE', 'border-l-4 border-l-slate-400': item.status === 'ENDED' }"
            >
              <div class="flex items-start justify-between">
                <div>
                  <span
                    class="text-[10px] font-extrabold px-2.5 py-0.5 rounded-full border shadow-2xs inline-flex items-center gap-1"
                    :class="{
                      'bg-emerald-100 border-emerald-300 text-emerald-800': item.status === 'ACTIVE',
                      'bg-slate-100 border-slate-300 text-slate-600': item.status === 'ENDED',
                      'bg-rose-100 border-rose-300 text-rose-800': item.status === 'CANCELLED'
                    }"
                  >
                    <span>{{ item.status === 'ACTIVE' ? '🟢 กำลังเช่าอยู่' : (item.status === 'ENDED' ? '⚪ ย้ายออกแล้ว' : '🔴 ยกเลิกสัญญา') }}</span>
                  </span>

                  <h4 class="font-bold text-slate-900 text-sm mt-1">
                    {{ item.tenant ? `${item.tenant.firstName} ${item.tenant.lastName}` : 'ผู้เช่า' }}
                  </h4>
                  <div class="text-xs text-slate-500 font-mono">โทร: {{ item.tenant?.phone || '-' }}</div>
                </div>

                <div class="text-right font-mono text-xs">
                  <div class="text-[10px] text-slate-400 font-bold uppercase">มัดจำ</div>
                  <div class="font-bold text-slate-800">฿{{ Number(item.depositAmount || 0).toLocaleString() }}</div>
                </div>
              </div>

              <div class="grid grid-cols-2 gap-2 text-xs font-mono text-slate-600 pt-1">
                <div>📅 วันเริ่มสัญญา: {{ formatDate(item.startDate) }}</div>
                <div class="text-right">
                  📅 วันย้ายออกจริง: <span class="font-bold text-slate-900">{{ item.actualEndDate ? formatDate(item.actualEndDate) : formatDate(item.expectedEndDate) }}</span>
                </div>
              </div>

              <!-- Notes & Move-out reason -->
              <div v-if="item.moveOutReason || item.adminNote" class="mt-2 p-2.5 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-1 text-slate-600">
                <div v-if="item.moveOutReason" class="flex items-center gap-1 text-slate-700">
                  <span class="font-bold text-slate-800">📌 เหตุผลย้ายออก:</span> {{ item.moveOutReason }}
                </div>
                <div v-if="item.adminNote" class="text-slate-500 italic">
                  <span class="font-semibold text-slate-700">📝 หมายเหตุแอดมิน:</span> {{ item.adminNote }}
                </div>
              </div>
            </div>
          </div>

          <div v-else class="text-center p-8 text-xs text-slate-400">
            ยังไม่มีประวัติการเช่าในห้องนี้
          </div>
        </div>

        <!-- Terminate Lease Dialog Modal -->
        <div v-if="showTerminateModal" class="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div class="bg-white rounded-3xl border border-slate-200 shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div class="px-6 py-4 bg-gradient-to-r from-rose-700 to-red-800 text-white flex items-center justify-between">
              <div class="flex items-center gap-2">
                <span class="text-xl">🚨</span>
                <h3 class="font-bold text-base text-white">แจ้งย้ายออก & สิ้นสุดสัญญา</h3>
              </div>
              <button @click="showTerminateModal = false" class="text-rose-200 hover:text-white p-1 rounded-lg cursor-pointer">✕</button>
            </div>

            <form @submit.prevent="handleTerminateSubmit" class="p-6 space-y-4">
              <div>
                <label class="block text-xs font-bold text-slate-700 mb-1">วันที่ย้ายออกจริง (Actual Move-out Date)</label>
                <input
                  v-model="terminateForm.actualEndDate"
                  type="date"
                  required
                  class="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2 text-xs font-mono text-slate-900 focus:outline-none focus:ring-2 focus:ring-rose-500/20"
                />
              </div>

              <div>
                <label class="block text-xs font-bold text-slate-700 mb-1">เหตุผลการย้ายออก (Move-out Reason)</label>
                <input
                  v-model="terminateForm.moveOutReason"
                  type="text"
                  placeholder="เช่น สิ้นสุดสัญญาตามกำหนด / ย้ายไปต่างจังหวัด"
                  class="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-rose-500/20"
                />
              </div>

              <div>
                <label class="block text-xs font-bold text-slate-700 mb-1">หมายเหตุแอดมิน / บันทึกภายใน (Admin Note / Blacklist)</label>
                <textarea
                  v-model="terminateForm.adminNote"
                  rows="2"
                  placeholder="เช่น คืนมัดจำเรียบร้อย / หักค่าน้ำไฟค้างชำระ 500 บาท"
                  class="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-rose-500/20"
                ></textarea>
              </div>

              <div class="pt-3 flex gap-3">
                <button
                  type="button"
                  @click="showTerminateModal = false"
                  class="w-1/2 py-2.5 border border-slate-300 text-slate-700 hover:bg-slate-100 rounded-xl text-xs font-bold transition-all cursor-pointer"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  :disabled="terminating"
                  class="w-1/2 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-rose-600/20 disabled:opacity-50 cursor-pointer"
                >
                  {{ terminating ? 'กำลังแจ้งย้ายออก...' : '🚨 ยืนยันย้ายออก' }}
                </button>
              </div>
            </form>
          </div>
        </div>
        <!-- Move-Out Refund Accounting Wizard Modal -->
        <MoveOutWizardModal
          :show="showMoveOutWizard"
          :lease="selectedLease"
          :room="room"
          @close="showMoveOutWizard = false"
          @completed="handleMoveOutCompleted"
        />

        <!-- Add Resident Modal -->
        <div v-if="showAddResidentModal" class="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div class="bg-white rounded-3xl p-6 max-w-sm w-full shadow-2xl border border-slate-200 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div class="flex items-center justify-between">
              <h3 class="font-bold text-sm text-slate-900 flex items-center gap-1.5">
                <span>👥</span>
                <span>เพิ่มผู้อยู่อาศัยร่วม (ห้อง {{ room?.roomNumber }})</span>
              </h3>
              <button @click="showAddResidentModal = false" class="text-slate-400 hover:text-slate-700 text-sm">✕</button>
            </div>

            <form @submit.prevent="handleAddResident" class="space-y-3">
              <div>
                <label class="block text-[11px] font-bold text-slate-700 mb-1">ชื่อจริง <span class="text-rose-500">*</span></label>
                <input
                  v-model="newResidentForm.firstName"
                  type="text"
                  placeholder="เช่น สมศักดิ์"
                  required
                  class="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-cyan-500/20"
                />
              </div>

              <div>
                <label class="block text-[11px] font-bold text-slate-700 mb-1">นามสกุล <span class="text-rose-500">*</span></label>
                <input
                  v-model="newResidentForm.lastName"
                  type="text"
                  placeholder="เช่น มั่นคง"
                  required
                  class="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-cyan-500/20"
                />
              </div>

              <div>
                <label class="block text-[11px] font-bold text-slate-700 mb-1">เบอร์โทรศัพท์ <span class="text-rose-500">*</span></label>
                <input
                  v-model="newResidentForm.phone"
                  type="tel"
                  placeholder="เช่น 0812345678"
                  required
                  class="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-mono text-slate-900 focus:outline-none focus:ring-2 focus:ring-cyan-500/20"
                />
              </div>

              <div>
                <label class="block text-[11px] font-bold text-slate-700 mb-1">เลขบัตรประชาชน (ไม่บังคับ)</label>
                <input
                  v-model="newResidentForm.idCard"
                  type="text"
                  placeholder="13 หลัก"
                  class="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-mono text-slate-900 focus:outline-none focus:ring-2 focus:ring-cyan-500/20"
                />
              </div>

              <div class="pt-2 flex gap-2">
                <button
                  type="button"
                  @click="showAddResidentModal = false"
                  class="flex-1 py-2 border border-slate-300 text-slate-700 hover:bg-slate-100 rounded-xl text-xs font-bold transition-all cursor-pointer"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  :disabled="addingResident"
                  class="flex-1 py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-cyan-600/20 disabled:opacity-50 cursor-pointer"
                >
                  {{ addingResident ? 'กำลังบันทึก...' : 'บันทึก' }}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, watch } from 'vue';
import { showSuccess, showError } from '@/utils/swal';
import api from '@/utils/api';
import { formatDate } from '@/utils/formatters';
import MoveOutWizardModal from '@/components/MoveOutWizardModal.vue';

const props = defineProps({
  show: Boolean,
  room: Object
});

const emit = defineEmits(['close', 'updated']);

const activeTab = ref('current');
const loading = ref(false);
const leases = ref([]);
const residents = ref([]);
const roomOwners = ref([]);
const isEditingOwner = ref(false);
const savingOwner = ref(false);
const selectedOwnerId = ref(null);
const localRoomOwner = ref(null);

const currentRoomOwnerName = computed(() => {
  if (localRoomOwner.value !== undefined) {
    return localRoomOwner.value?.name || 'หอพักดูแลเอง (ไม่มีเจ้าของร่วม)';
  }
  return props.room?.owner?.name || 'หอพักดูแลเอง (ไม่มีเจ้าของร่วม)';
});

const showMoveOutWizard = ref(false);
const showAddResidentModal = ref(false);
const addingResident = ref(false);
const newResidentForm = reactive({
  firstName: '',
  lastName: '',
  phone: '',
  idCard: ''
});
const selectedLease = ref(null);

const activeLease = computed(() => leases.value.find((l) => l.status === 'ACTIVE'));

const openEditOwner = async () => {
  selectedOwnerId.value = props.room?.ownerId || props.room?.owner?.id || null;
  isEditingOwner.value = true;
  if (roomOwners.value.length === 0) {
    try {
      const res = await api.get('/api/admin/room-owners');
      roomOwners.value = res.data.data || [];
    } catch (err) {
      console.error('Failed to load room owners:', err);
    }
  }
};

const handleSaveOwner = async () => {
  if (!props.room?.id) return;
  savingOwner.value = true;
  try {
    const res = await api.put(`/api/v1/rooms/${props.room.id}`, {
      ownerId: selectedOwnerId.value
    });
    const updated = res.data.data;
    localRoomOwner.value = updated.owner;
    isEditingOwner.value = false;
    await showSuccess('สำเร็จ!', 'อัปเดตเจ้าของห้องเรียบร้อยแล้ว');
    emit('updated');
  } catch (err) {
    showError('เกิดข้อผิดพลาด', err.response?.data?.message || 'ไม่สามารถเปลี่ยนเจ้าของห้องได้');
  } finally {
    savingOwner.value = false;
  }
};

const fetchHistory = async () => {
  if (!props.room?.id) return;

  loading.value = true;
  try {
    const [historyRes, residentsRes] = await Promise.allSettled([
      api.get(`/api/admin/rooms/${props.room.id}/history`),
      api.get(`/api/admin/rooms/${props.room.id}/residents`)
    ]);

    if (historyRes.status === 'fulfilled') {
      leases.value = historyRes.value.data.data;
    }
    if (residentsRes.status === 'fulfilled') {
      residents.value = residentsRes.value.data.data || [];
    }
  } catch (err) {
    console.error('Failed to fetch room history:', err);
  } finally {
    loading.value = false;
  }
};

const handleAddResident = async () => {
  if (!newResidentForm.firstName || !newResidentForm.lastName || !newResidentForm.phone) return;
  addingResident.value = true;
  try {
    await api.post(`/api/admin/rooms/${props.room.id}/residents`, {
      firstName: newResidentForm.firstName,
      lastName: newResidentForm.lastName,
      phone: newResidentForm.phone,
      idCard: newResidentForm.idCard || undefined,
      role: 'CO_RESIDENT'
    });
    await showSuccess('สำเร็จ', 'เพิ่มผู้อยู่อาศัยร่วมเรียบร้อยแล้ว');
    showAddResidentModal.value = false;
    newResidentForm.firstName = '';
    newResidentForm.lastName = '';
    newResidentForm.phone = '';
    newResidentForm.idCard = '';
    fetchHistory();
    emit('updated');
  } catch (err) {
    showError('เกิดข้อผิดพลาด', err.response?.data?.message || 'ไม่สามารถเพิ่มผู้อยู่อาศัยร่วมได้');
  } finally {
    addingResident.value = false;
  }
};

const handleRemoveResident = async (tenantId) => {
  try {
    await api.delete(`/api/admin/rooms/${props.room.id}/residents/${tenantId}`);
    await showSuccess('สำเร็จ', 'นำผู้อยู่อาศัยออกจากห้องเรียบร้อยแล้ว');
    fetchHistory();
    emit('updated');
  } catch (err) {
    showError('เกิดข้อผิดพลาด', err.response?.data?.message || 'ไม่สามารถนำผู้อยู่อาศัยออกได้');
  }
};

watch(
  () => props.show,
  (isShown) => {
    if (isShown && props.room?.id) {
      isEditingOwner.value = false;
      localRoomOwner.value = props.room?.owner;
      selectedOwnerId.value = props.room?.ownerId || props.room?.owner?.id || null;
      fetchHistory();
    }
  }
);

const openTerminateModal = (lease) => {
  selectedLease.value = lease;
  showMoveOutWizard.value = true;
};

const handleMoveOutCompleted = () => {
  fetchHistory();
  emit('updated');
};

const handleTerminateSubmit = async () => {
  if (!selectedLease.value?.id) return;

  terminating.value = true;
  try {
    const res = await api.post(`/api/admin/leases/${selectedLease.value.id}/terminate`, {
      actualEndDate: terminateForm.actualEndDate,
      moveOutReason: terminateForm.moveOutReason,
      adminNote: terminateForm.adminNote
    });

    await showSuccess('แจ้งย้ายออกสำเร็จ!', res.data.message || 'แจ้งย้ายออกและคืนห้องว่างเรียบร้อยแล้ว');
    showTerminateModal.value = false;
    fetchHistory();
    emit('updated');
  } catch (err) {
    showError('เกิดข้อผิดพลาด', err.response?.data?.message || 'ไม่สามารถดำเนินการแจ้งย้ายออกได้');
  } finally {
    terminating.value = false;
  }
};


</script>
