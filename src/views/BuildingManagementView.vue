<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-bold text-slate-900 tracking-tight">🏢 บริหารจัดการตึก / อาคาร (Building Management)</h1>
        <p class="text-sm text-slate-500">จัดการข้อมูลตึก/สาขา ธีมสี โลโก้ LIFF และตั้งค่า PromptPay QR Code ชำระเงินแยกตามตึก</p>
      </div>

      <button
        @click="showCreateModal = true"
        class="px-4 py-2.5 bg-cyan-600 hover:bg-cyan-700 text-white rounded-xl text-sm font-semibold transition-all shadow-sm shadow-cyan-600/20 flex items-center gap-1.5"
      >
        <span>+ เพิ่มตึกใหม่ (Add Building)</span>
      </button>
    </div>

    <!-- Building Cards Grid -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
      <div
        v-for="b in buildingStore.buildings"
        :key="b.id"
        class="bg-white border rounded-2xl p-5 shadow-xs space-y-4 transition-all hover:shadow-md relative overflow-hidden"
        :class="b.id === buildingStore.activeBuildingId ? 'border-cyan-500 ring-2 ring-cyan-500/20' : 'border-slate-200'"
      >
        <!-- Top color accent stripe -->
        <div class="absolute top-0 left-0 right-0 h-1.5" :style="{ backgroundColor: b.themeColor || '#0E7490' }"></div>

        <div class="flex items-start justify-between gap-2 pt-1">
          <div class="flex items-center gap-3">
            <img
              v-if="b.logoUrl"
              :src="b.logoUrl"
              alt="Logo"
              class="w-10 h-10 rounded-xl object-contain border border-slate-200 bg-white p-0.5 shadow-2xs shrink-0"
            />
            <div
              v-else
              class="w-10 h-10 rounded-xl flex items-center justify-center text-white text-base font-bold shadow-2xs shrink-0"
              :style="{ backgroundColor: b.themeColor || '#0E7490' }"
            >
              🏢
            </div>
            <div>
              <h3 class="font-bold text-slate-900 text-base">{{ b.name }}</h3>
              <p class="text-xs text-slate-500 mt-0.5">{{ b.address || 'ไม่ได้ระบุที่อยู่' }}</p>
            </div>
          </div>

          <span
            v-if="b.id === buildingStore.activeBuildingId"
            class="text-[10px] font-bold px-2 py-0.5 bg-cyan-100 text-cyan-700 rounded-full border border-cyan-200 shrink-0"
          >
            ACTIVE
          </span>
        </div>

        <!-- Room count & LIFF theme info -->
        <div class="grid grid-cols-2 gap-2">
          <div class="p-2.5 bg-slate-50 rounded-xl text-xs flex flex-col justify-between text-slate-600">
            <span class="text-[10px] text-slate-400 font-bold uppercase">จำนวนห้องพัก:</span>
            <span class="font-bold text-slate-900 font-mono mt-0.5">{{ b._count?.rooms || 0 }} ห้อง</span>
          </div>
          <div class="p-2.5 bg-slate-50 rounded-xl text-xs flex flex-col justify-between text-slate-600">
            <span class="text-[10px] text-slate-400 font-bold uppercase">ธีมสี LIFF:</span>
            <div class="flex items-center gap-1.5 mt-0.5">
              <span class="w-3 h-3 rounded-full border border-slate-300" :style="{ backgroundColor: b.themeColor || '#0E7490' }"></span>
              <span class="font-mono font-bold text-slate-900 text-[11px]">{{ b.themeColor || '#0E7490' }}</span>
            </div>
          </div>
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
              class="text-cyan-300 hover:underline font-semibold"
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
            class="px-3 py-2 bg-cyan-50 hover:bg-cyan-100 text-cyan-700 rounded-xl text-xs font-semibold transition-all"
          >
            ⚙️ แก้ไขธีม & QR
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

          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block font-semibold text-slate-700 mb-1">ธีมสีประจำตึก (Hex)</label>
              <div class="flex items-center gap-2">
                <input
                  type="color"
                  v-model="createForm.themeColor"
                  class="w-8 h-8 rounded-lg cursor-pointer border border-slate-300 p-0.5 bg-white shrink-0"
                />
                <input
                  v-model="createForm.themeColor"
                  type="text"
                  placeholder="#0E7490"
                  class="w-full bg-slate-50 border border-slate-300 rounded-xl px-2.5 py-1.5 font-mono text-slate-900 focus:outline-hidden uppercase"
                />
              </div>
            </div>

            <div>
              <label class="block font-semibold text-slate-700 mb-1">โลโก้ประจำตึก (Logo)</label>
              <div class="flex items-center gap-2">
                <div class="w-8 h-8 rounded-lg border border-slate-300 bg-slate-50 flex items-center justify-center overflow-hidden shrink-0">
                  <img v-if="createForm.logoUrl" :src="createForm.logoUrl" alt="Logo" class="w-full h-full object-contain" />
                  <span v-else class="text-xs">🏢</span>
                </div>
                <label class="cursor-pointer flex-1 inline-flex items-center justify-center gap-1 px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 border border-slate-300 text-slate-700 text-xs font-semibold rounded-xl transition-all">
                  <span>{{ isUploadingCreateLogo ? 'กำลังอัปโหลด...' : (createForm.logoUrl ? 'เปลี่ยนรูป' : 'อัปโหลดรูป') }}</span>
                  <input type="file" accept="image/png, image/jpeg, image/jpg, image/webp" class="hidden" @change="handleCreateLogoUpload" :disabled="isUploadingCreateLogo" />
                </label>
                <button
                  v-if="createForm.logoUrl"
                  type="button"
                  @click="createForm.logoUrl = ''"
                  class="text-rose-500 hover:text-rose-700 font-bold px-1"
                  title="ลบรูป"
                >
                  ✕
                </button>
              </div>
            </div>
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
              class="px-5 py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded-xl font-bold transition-all disabled:opacity-50 cursor-pointer"
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
          <h3 class="text-lg font-bold text-slate-900">⚙️ ตั้งค่าธีม & บัญชี {{ selectedBuilding?.name }}</h3>
          <button @click="showEditModal = false" class="text-slate-400 hover:text-slate-600 font-bold">✕</button>
        </div>

        <form @submit.prevent="handleUpdateSetting" class="space-y-4 text-xs">
          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block font-semibold text-slate-700 mb-1">ธีมสีประจำตึก (Theme)</label>
              <div class="flex items-center gap-2">
                <input
                  type="color"
                  v-model="editForm.themeColor"
                  class="w-8 h-8 rounded-lg cursor-pointer border border-slate-300 p-0.5 bg-white shrink-0"
                />
                <input
                  v-model="editForm.themeColor"
                  type="text"
                  placeholder="#0E7490"
                  class="w-full bg-slate-50 border border-slate-300 rounded-xl px-2.5 py-1.5 font-mono text-slate-900 focus:outline-hidden uppercase"
                />
              </div>
            </div>

            <div>
              <label class="block font-semibold text-slate-700 mb-1">โลโก้ประจำตึก (Logo)</label>
              <div class="flex items-center gap-2">
                <div class="w-8 h-8 rounded-lg border border-slate-300 bg-slate-50 flex items-center justify-center overflow-hidden shrink-0">
                  <img v-if="editForm.logoUrl" :src="editForm.logoUrl" alt="Logo" class="w-full h-full object-contain" />
                  <span v-else class="text-xs">🏢</span>
                </div>
                <label class="cursor-pointer flex-1 inline-flex items-center justify-center gap-1 px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 border border-slate-300 text-slate-700 text-xs font-semibold rounded-xl transition-all">
                  <span>{{ isUploadingEditLogo ? 'กำลังอัปโหลด...' : (editForm.logoUrl ? 'เปลี่ยนรูป' : 'อัปโหลดรูป') }}</span>
                  <input type="file" accept="image/png, image/jpeg, image/jpg, image/webp" class="hidden" @change="handleEditLogoUpload" :disabled="isUploadingEditLogo" />
                </label>
                <button
                  v-if="editForm.logoUrl"
                  type="button"
                  @click="editForm.logoUrl = ''"
                  class="text-rose-500 hover:text-rose-700 font-bold px-1"
                  title="ลบรูป"
                >
                  ✕
                </button>
              </div>
            </div>
          </div>

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

          <div v-if="editForm.paymentQrUrl" class="p-3 bg-slate-50 rounded-2xl border border-slate-200 text-center relative group">
            <div class="text-[11px] text-slate-500 mb-1 font-semibold">ตัวอย่าง QR Code ชำระเงิน:</div>
            <img :src="editForm.paymentQrUrl" alt="PromptPay QR" class="w-36 h-36 object-contain mx-auto rounded-xl border border-slate-300 shadow-xs" />
            <button
              type="button"
              @click="editForm.paymentQrUrl = ''"
              class="mt-2 text-xs text-rose-600 hover:underline font-semibold"
            >
              ลบรูป QR Code
            </button>
          </div>

          <div class="flex items-center justify-end gap-2 pt-2">
            <button
              type="button"
              @click="showEditModal = false"
              class="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-semibold transition-all cursor-pointer"
            >
              ยกเลิก
            </button>
            <button
              type="submit"
              :disabled="submitting"
              class="px-5 py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded-xl font-bold transition-all disabled:opacity-50 cursor-pointer"
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
import { showSuccess, showError, showToast } from '@/utils/swal';

const buildingStore = useBuildingStore();

const showCreateModal = ref(false);
const showEditModal = ref(false);
const submitting = ref(false);
const isUploadingCreateLogo = ref(false);
const isUploadingEditLogo = ref(false);
const selectedBuilding = ref(null);

const createForm = reactive({
  name: '',
  address: '',
  themeColor: '#0E7490',
  logoUrl: '',
  promptpayNum: ''
});

const editForm = reactive({
  themeColor: '#0E7490',
  logoUrl: '',
  promptpayNum: '',
  paymentQrUrl: ''
});

onMounted(() => {
  buildingStore.fetchBuildings();
});

const openEditSettingModal = (b) => {
  selectedBuilding.value = b;
  editForm.themeColor = b.themeColor || '#0E7490';
  editForm.logoUrl = b.logoUrl || '';
  editForm.promptpayNum = b.setting?.promptpayNum || '';
  editForm.paymentQrUrl = b.setting?.paymentQrUrl || '';
  showEditModal.value = true;
};

const handleCreateLogoUpload = async (event) => {
  const file = event.target.files[0];
  if (!file) return;

  isUploadingCreateLogo.value = true;
  try {
    const res = await uploadService.uploadFile(file);
    const url = res.data?.url || res.fileUrl || res.url;
    if (url) {
      createForm.logoUrl = url;
      showToast('อัปโหลดรูปโลโก้เรียบร้อยแล้ว!');
    }
  } catch (error) {
    showError('เกิดข้อผิดพลาด', error.response?.data?.message || 'ไม่สามารถอัปโหลดไฟล์รูปภาพได้');
  } finally {
    isUploadingCreateLogo.value = false;
    event.target.value = '';
  }
};

const handleEditLogoUpload = async (event) => {
  const file = event.target.files[0];
  if (!file) return;

  isUploadingEditLogo.value = true;
  try {
    const res = await uploadService.uploadFile(file);
    const url = res.data?.url || res.fileUrl || res.url;
    if (url) {
      editForm.logoUrl = url;
      showToast('อัปโหลดรูปโลโก้เรียบร้อยแล้ว!');
    }
  } catch (error) {
    showError('เกิดข้อผิดพลาด', error.response?.data?.message || 'ไม่สามารถอัปโหลดไฟล์รูปภาพได้');
  } finally {
    isUploadingEditLogo.value = false;
    event.target.value = '';
  }
};

const handleFileUpload = async (event) => {
  const file = event.target.files[0];
  if (!file) return;

  try {
    const res = await uploadService.uploadFile(file);
    const url = res.data?.url || res.fileUrl || res.url;
    if (url) {
      editForm.paymentQrUrl = url;
      showToast('อัปโหลดไฟล์ QR Code เรียบร้อยแล้ว!');
    }
  } catch (error) {
    showError('เกิดข้อผิดพลาด', error.response?.data?.message || 'ไม่สามารถอัปโหลดไฟล์ได้');
  } finally {
    event.target.value = '';
  }
};

const handleCreateBuilding = async () => {
  submitting.value = true;
  try {
    await buildingStore.createBuilding({ ...createForm });
    await showSuccess('สำเร็จ!', 'สร้างตึกใหม่เรียบร้อยแล้ว');
    showCreateModal.value = false;
    createForm.name = '';
    createForm.address = '';
    createForm.themeColor = '#0E7490';
    createForm.logoUrl = '';
    createForm.promptpayNum = '';
  } catch (error) {
    showError('เกิดข้อผิดพลาด', error.response?.data?.message || 'เกิดข้อผิดพลาดในการสร้างตึก');
  } finally {
    submitting.value = false;
  }
};

const handleUpdateSetting = async () => {
  if (!selectedBuilding.value) return;
  submitting.value = true;
  try {
    await buildingStore.updateBuildingSetting(selectedBuilding.value.id, { ...editForm });
    await showSuccess('สำเร็จ!', 'อัปเดตการตั้งค่าประจำตึกเรียบร้อยแล้ว');
    showEditModal.value = false;
    await buildingStore.fetchBuildings();
  } catch (error) {
    showError('เกิดข้อผิดพลาด', error.response?.data?.message || 'เกิดข้อผิดพลาดในการบันทึกการตั้งค่า');
  } finally {
    submitting.value = false;
  }
};
</script>

