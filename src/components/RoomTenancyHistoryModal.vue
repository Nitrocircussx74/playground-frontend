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
          :class="activeTab === 'current' ? 'border-purple-600 text-purple-700 font-extrabold' : 'border-transparent text-slate-500 hover:text-slate-800'"
        >
          👤 ผู้เช่าปัจจุบัน & การย้ายออก
        </button>
        <button
          @click="activeTab = 'history'"
          class="py-3 border-b-2 transition-all cursor-pointer"
          :class="activeTab === 'history' ? 'border-purple-600 text-purple-700 font-extrabold' : 'border-transparent text-slate-500 hover:text-slate-800'"
        >
          📜 ประวัติสัญญาเช่าทั้งหมด ({{ leases.length }})
        </button>
      </div>

      <div class="p-6 space-y-6">
        <!-- Tab 1: Current Tenant & Move-Out Action -->
        <div v-if="activeTab === 'current'" class="space-y-4">
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
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, watch } from 'vue';
import { showSuccess, showError } from '@/utils/swal';
import api from '@/utils/api';
import MoveOutWizardModal from '@/components/MoveOutWizardModal.vue';

const props = defineProps({
  show: Boolean,
  room: Object
});

const emit = defineEmits(['close', 'updated']);

const activeTab = ref('current');
const loading = ref(false);
const leases = ref([]);
const showMoveOutWizard = ref(false);
const selectedLease = ref(null);

const activeLease = computed(() => leases.value.find((l) => l.status === 'ACTIVE'));

const fetchHistory = async () => {
  if (!props.room?.id) return;

  loading.value = true;
  try {
    const res = await api.get(`/api/admin/rooms/${props.room.id}/history`);
    leases.value = res.data.data;
  } catch (err) {
    console.error('Failed to fetch room history:', err);
  } finally {
    loading.value = false;
  }
};

watch(
  () => props.show,
  (isShown) => {
    if (isShown && props.room?.id) {
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

const formatDate = (dateStr) => {
  if (!dateStr) return '-';
  return new Date(dateStr).toLocaleDateString('th-TH');
};
</script>
