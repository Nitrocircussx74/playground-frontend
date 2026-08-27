<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-bold text-slate-900 tracking-tight">🏢 บริหารจัดการตึก / อาคาร (Building Management)</h1>
        <p class="text-sm text-slate-500">จัดการข้อมูลตึก/สาขา และตั้งค่า PromptPay QR Code ชำระเงินแยกตามตึก</p>
      </div>

      <button
        @click="showCreateModal = true"
        class="px-4 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-sm font-semibold transition-all shadow-sm shadow-purple-600/20 flex items-center gap-1.5"
      >
        <span>+ เพิ่มตึกใหม่ (Add Building)</span>
      </button>
    </div>

    <!-- Building Cards Grid -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
      <div
        v-for="b in buildingStore.buildings"
        :key="b.id"
        class="bg-white border rounded-2xl p-5 shadow-xs space-y-4 transition-all hover:shadow-md"
        :class="b.id === buildingStore.activeBuildingId ? 'border-purple-500 ring-2 ring-purple-500/20' : 'border-slate-200'"
      >
        <div class="flex items-start justify-between">
          <div>
            <div class="flex items-center gap-2">
              <span class="text-xl">🏢</span>
              <h3 class="font-bold text-slate-900 text-base">{{ b.name }}</h3>
            </div>
            <p class="text-xs text-slate-500 mt-0.5">{{ b.address || 'ไม่ได้ระบุที่อยู่' }}</p>
          </div>

          <span
            v-if="b.id === buildingStore.activeBuildingId"
            class="text-[10px] font-bold px-2 py-0.5 bg-purple-100 text-purple-700 rounded-full border border-purple-200"
          >
            ACTIVE
          </span>
        </div>

        <!-- Room count info -->
        <div class="p-3 bg-slate-50 rounded-xl text-xs flex items-center justify-between text-slate-600">
          <span>จำนวนห้องพักทั้งหมด:</span>
          <span class="font-bold text-slate-900 font-mono">{{ b._count?.rooms || 0 }} ห้อง</span>
        </div>

        <!-- Building Settings & Payment Info -->
        <div class="p-3 bg-slate-950 text-slate-100 rounded-xl space-y-2 text-xs">
          <div class="flex items-center justify-between text-slate-400 border-b border-slate-800 pb-1.5">
            <span>บัญชีพร้อมเพย์ประจำตึก:</span>
            <span class="font-mono font-bold text-emerald-400">{{ b.setting?.promptpayNum || 'ไม่ได้ตั้งค่า' }}</span>
          </div>

          <div class="flex items-center justify-between">
            <span>PromptPay QR Code:</span>
            <a
              v-if="b.setting?.paymentQrUrl"
              :href="b.setting.paymentQrUrl"
              target="_blank"
              class="text-purple-300 hover:underline font-semibold"
            >
              ดูรูป QR Code
            </a>
            <span v-else class="text-slate-500">ยังไม่มี QR Code</span>
          </div>
        </div>

        <!-- Actions -->
        <div class="pt-2 flex items-center justify-between gap-2 border-t border-slate-100">
          <button
            @click="buildingStore.setActiveBuildingId(b.id)"
            class="flex-1 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-semibold transition-all"
            :class="{ 'opacity-50 pointer-events-none': b.id === buildingStore.activeBuildingId }"
          >
            {{ b.id === buildingStore.activeBuildingId ? 'กำลังใช้งานตึกนี้' : 'สลับมาตึกนี้' }}
          </button>

          <button
            @click="openEditSettingModal(b)"
            class="px-3 py-2 bg-purple-50 hover:bg-purple-100 text-purple-700 rounded-xl text-xs font-semibold transition-all"
          >
            ⚙️ ตั้งค่า QR Code
          </button>
        </div>
      </div>
    </div>

    <!-- Create Building Modal -->
    <div v-if="showCreateModal" class="fixed inset-0 z-50 bg-slate-950/40 backdrop-blur-xs flex items-center justify-center p-4">
      <div class="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-5 border border-slate-200">
        <div class="flex items-center justify-between border-b border-slate-100 pb-3">
          <h3 class="text-lg font-bold text-slate-900">🏢 เพิ่มตึก/อาคารใหม่</h3>
          <button @click="showCreateModal = false" class="text-slate-400 hover:text-slate-600 font-bold">✕</button>
        </div>

        <form @submit.prevent="handleCreateBuilding" class="space-y-4 text-xs">
          <div>
            <label class="block font-semibold text-slate-700 mb-1">ชื่อตึก/อาคาร <span class="text-rose-500">*</span></label>
            <input
              v-model="createForm.name"
              type="text"
              placeholder="e.g. อาคาร C (East Wing)"
              required
              class="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 focus:outline-hidden"
            />
          </div>

          <div>
            <label class="block font-semibold text-slate-700 mb-1">ที่อยู่หรือรายละเอียดตึก</label>
            <textarea
              v-model="createForm.address"
              rows="2"
              placeholder="e.g. 123/3 ถนนสุขุมวิท"
              class="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 focus:outline-hidden"
            ></textarea>
          </div>

          <div>
            <label class="block font-semibold text-slate-700 mb-1">เบอร์/หมายเลข PromptPay ประจำตึก</label>
            <input
              v-model="createForm.promptpayNum"
              type="text"
              placeholder="e.g. 0812345678"
              class="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 font-mono text-slate-900 focus:outline-hidden"
            />
          </div>

          <div class="flex items-center justify-end gap-2 pt-2">
            <button
              type="button"
              @click="showCreateModal = false"
              class="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-semibold transition-all"
            >
              ยกเลิก
            </button>
            <button
              type="submit"
              :disabled="submitting"
              class="px-5 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-bold transition-all disabled:opacity-50"
            >
              {{ submitting ? 'กำลังบันทึก...' : 'สร้างตึกใหม่' }}
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Edit Building Setting Modal -->
    <div v-if="showEditModal" class="fixed inset-0 z-50 bg-slate-950/40 backdrop-blur-xs flex items-center justify-center p-4">
      <div class="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-5 border border-slate-200">
        <div class="flex items-center justify-between border-b border-slate-100 pb-3">
          <h3 class="text-lg font-bold text-slate-900">⚙️ ตั้งค่าบัญชีและ QR Code {{ selectedBuilding?.name }}</h3>
          <button @click="showEditModal = false" class="text-slate-400 hover:text-slate-600 font-bold">✕</button>
        </div>

        <form @submit.prevent="handleUpdateSetting" class="space-y-4 text-xs">
          <div>
            <label class="block font-semibold text-slate-700 mb-1">หมายเลข PromptPay ประจำตึก</label>
            <input
              v-model="editForm.promptpayNum"
              type="text"
              placeholder="e.g. 0891112222"
              class="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 font-mono text-slate-900 focus:outline-hidden"
            />
          </div>

          <div>
            <label class="block font-semibold text-slate-700 mb-1">อัปโหลด PromptPay QR Code</label>
            <input
              type="file"
              accept="image/*"
              @change="handleFileUpload"
              class="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 focus:outline-hidden"
            />
          </div>

          <div v-if="editForm.paymentQrUrl" class="p-3 bg-slate-50 rounded-2xl border border-slate-200 text-center">
            <div class="text-[11px] text-slate-500 mb-1 font-semibold">ตัวอย่าง QR Code ชำระเงิน:</div>
            <img :src="editForm.paymentQrUrl" alt="PromptPay QR" class="w-36 h-36 object-contain mx-auto rounded-xl border border-slate-300 shadow-xs" />
          </div>

          <div class="flex items-center justify-end gap-2 pt-2">
            <button
              type="button"
              @click="showEditModal = false"
              class="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-semibold transition-all"
            >
              ยกเลิก
            </button>
            <button
              type="submit"
              :disabled="submitting"
              class="px-5 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-bold transition-all disabled:opacity-50"
            >
              {{ submitting ? 'กำลังบันทึก...' : 'บันทึกการตั้งค่า' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue';
import { useBuildingStore } from '@/stores/useBuildingStore';
import uploadService from '@/services/uploadService';

const buildingStore = useBuildingStore();

const showCreateModal = ref(false);
const showEditModal = ref(false);
const submitting = ref(false);
const selectedBuilding = ref(null);

const createForm = reactive({
  name: '',
  address: '',
  promptpayNum: ''
});

const editForm = reactive({
  promptpayNum: '',
  paymentQrUrl: ''
});

onMounted(() => {
  buildingStore.fetchBuildings();
});

const openEditSettingModal = (b) => {
  selectedBuilding.value = b;
  editForm.promptpayNum = b.setting?.promptpayNum || '';
  editForm.paymentQrUrl = b.setting?.paymentQrUrl || '';
  showEditModal.value = true;
};

const handleFileUpload = async (event) => {
  const file = event.target.files[0];
  if (!file) return;

  try {
    const res = await uploadService.uploadFile(file);
    editForm.paymentQrUrl = res.data.url;
    alert('อัปโหลดไฟล์ QR Code เรียบร้อยแล้ว!');
  } catch (error) {
    alert(error.response?.data?.message || 'ไม่สามารถอัปโหลดไฟล์ได้');
  }
};

const handleCreateBuilding = async () => {
  submitting.value = true;
  try {
    await buildingStore.createBuilding({ ...createForm });
    alert('สร้างตึกใหม่เรียบร้อยแล้ว!');
    showCreateModal.value = false;
    createForm.name = '';
    createForm.address = '';
    createForm.promptpayNum = '';
  } catch (error) {
    alert(error.response?.data?.message || 'เกิดข้อผิดพลาดในการสร้างตึก');
  } finally {
    submitting.value = false;
  }
};

const handleUpdateSetting = async () => {
  if (!selectedBuilding.value) return;
  submitting.value = true;
  try {
    await buildingStore.updateBuildingSetting(selectedBuilding.value.id, { ...editForm });
    alert('อัปเดตการตั้งค่าประจำตึกเรียบร้อยแล้ว!');
    showEditModal.value = false;
  } catch (error) {
    alert(error.response?.data?.message || 'เกิดข้อผิดพลาดในการบันทึกการตั้งค่า');
  } finally {
    submitting.value = false;
  }
};
</script>
