<template>
  <Dialog :open="open" @update:open="$emit('update:open', $event)">
    <DialogContent class="max-w-md">
      <DialogHeader>
        <DialogTitle class="flex items-center gap-2">
          <Building2 v-if="mode === 'create'" class="w-5 h-5 text-cyan-600" />
          <Settings v-else class="w-5 h-5 text-cyan-600" />
          <span>{{ mode === 'create' ? 'เพิ่มตึก/อาคารใหม่' : `ตั้งค่าธีม & บัญชี ${building?.name}` }}</span>
        </DialogTitle>
      </DialogHeader>

      <form @submit.prevent="handleSubmit" class="space-y-4 text-xs">
        <template v-if="mode === 'create'">
          <div>
            <label class="block font-semibold text-slate-700 mb-1">ชื่อตึก/อาคาร <span class="text-rose-500">*</span></label>
            <Input v-model="form.name" type="text" placeholder="e.g. อาคาร C (East Wing)" required />
          </div>

          <div>
            <label class="block font-semibold text-slate-700 mb-1">ที่อยู่หรือรายละเอียดตึก</label>
            <textarea
              v-model="form.address"
              rows="2"
              placeholder="e.g. 123/3 ถนนสุขุมวิท"
              class="flex w-full rounded-md border border-input bg-background px-3.5 py-2 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/30 focus-visible:border-ring"
            ></textarea>
          </div>
        </template>

        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="block font-semibold text-slate-700 mb-1">ธีมสีประจำตึก (Hex)</label>
            <div class="flex items-center gap-2">
              <input
                type="color"
                v-model="form.themeColor"
                class="w-8 h-8 rounded-lg cursor-pointer border border-input p-0.5 bg-background shrink-0"
              />
              <Input v-model="form.themeColor" type="text" placeholder="#0E7490" class="font-mono uppercase" />
            </div>
          </div>

          <div>
            <label class="block font-semibold text-slate-700 mb-1">โลโก้ประจำตึก (Logo)</label>
            <div class="flex items-center gap-2">
              <div class="w-8 h-8 rounded-lg border border-input bg-slate-50 flex items-center justify-center overflow-hidden shrink-0">
                <img v-if="form.logoUrl" :src="form.logoUrl" alt="Logo" class="w-full h-full object-contain" />
                <Building2 v-else class="w-4 h-4 text-slate-400" />
              </div>
              <label class="cursor-pointer flex-1 inline-flex items-center justify-center gap-1 px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 border border-slate-300 text-slate-700 text-xs font-semibold rounded-xl transition-all">
                <span>{{ isUploadingLogo ? 'กำลังอัปโหลด...' : (form.logoUrl ? 'เปลี่ยนรูป' : 'อัปโหลดรูป') }}</span>
                <input type="file" accept="image/png, image/jpeg, image/jpg, image/webp" class="hidden" @change="handleLogoUpload" :disabled="isUploadingLogo" />
              </label>
              <button v-if="form.logoUrl" type="button" @click="form.logoUrl = ''" class="text-rose-500 hover:text-rose-700 font-bold px-1" title="ลบรูป">
                <X class="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

        <div>
          <label class="block font-semibold text-slate-700 mb-1">{{ mode === 'create' ? 'เบอร์/หมายเลข PromptPay ประจำตึก' : 'หมายเลข PromptPay ประจำตึก' }}</label>
          <Input v-model="form.promptpayNum" type="text" placeholder="e.g. 0812345678" class="font-mono" />
        </div>

        <template v-if="mode === 'edit'">
          <div>
            <label class="block font-semibold text-slate-700 mb-1">อัปโหลด PromptPay QR Code</label>
            <Input type="file" accept="image/*" @change="handleQrUpload" />
          </div>

          <div v-if="form.paymentQrUrl" class="p-3 bg-slate-50 rounded-xl border border-slate-200 text-center">
            <div class="text-xs text-slate-500 mb-1 font-semibold">ตัวอย่าง QR Code ชำระเงิน:</div>
            <img :src="form.paymentQrUrl" alt="PromptPay QR" class="w-36 h-36 object-contain mx-auto rounded-xl border border-slate-300 shadow-xs" />
            <button type="button" @click="form.paymentQrUrl = ''" class="mt-2 text-xs text-rose-600 hover:underline font-semibold">
              ลบรูป QR Code
            </button>
          </div>
        </template>

        <DialogFooter class="pt-2" :class="mode === 'edit' ? 'sm:justify-between' : ''">
          <Button
            v-if="mode === 'edit'"
            type="button"
            variant="outline"
            class="text-rose-600 hover:text-rose-700 border-rose-200 hover:bg-rose-50 sm:mr-auto"
            @click="$emit('delete')"
          >
            <Trash2 class="w-3.5 h-3.5" />
            <span>ลบตึกนี้</span>
          </Button>

          <Button type="button" variant="outline" @click="$emit('update:open', false)">ยกเลิก</Button>
          <Button type="submit" :disabled="submitting">
            {{ submitting ? 'กำลังบันทึก...' : (mode === 'create' ? 'สร้างตึกใหม่' : 'บันทึกการตั้งค่า') }}
          </Button>
        </DialogFooter>
      </form>
    </DialogContent>
  </Dialog>
</template>

<script setup>
import { reactive, watch } from 'vue';
import { Building2, Settings, X, Trash2 } from 'lucide-vue-next';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useBuildingStore } from '@/stores/useBuildingStore';
import uploadService from '@/services/uploadService';
import { showSuccess, showError, showToast } from '@/utils/swal';
import { ref } from 'vue';

const props = defineProps({
  open: { type: Boolean, default: false },
  mode: { type: String, default: 'create' }, // 'create' | 'edit'
  building: { type: Object, default: null }
});

const emit = defineEmits(['update:open', 'saved', 'delete']);

const buildingStore = useBuildingStore();
const submitting = ref(false);
const isUploadingLogo = ref(false);

const defaultForm = () => ({
  name: '',
  address: '',
  themeColor: '#0E7490',
  logoUrl: '',
  promptpayNum: '',
  paymentQrUrl: ''
});

const form = reactive(defaultForm());

watch(
  () => [props.open, props.building],
  ([isOpen]) => {
    if (!isOpen) return;
    if (props.mode === 'edit' && props.building) {
      form.name = props.building.name || '';
      form.address = props.building.address || '';
      form.themeColor = props.building.themeColor || '#0E7490';
      form.logoUrl = props.building.logoUrl || '';
      form.promptpayNum = props.building.setting?.promptpayNum || '';
      form.paymentQrUrl = props.building.setting?.paymentQrUrl || '';
    } else {
      Object.assign(form, defaultForm());
    }
  },
  { immediate: true }
);

const uploadAndAssign = async (event, field) => {
  const file = event.target.files[0];
  if (!file) return null;
  try {
    const res = await uploadService.uploadFile(file);
    const url = res.data?.url || res.fileUrl || res.url;
    if (url) {
      form[field] = url;
      showToast('อัปโหลดไฟล์เรียบร้อยแล้ว!');
    }
  } catch (error) {
    showError('เกิดข้อผิดพลาด', error.response?.data?.message || 'ไม่สามารถอัปโหลดไฟล์ได้');
  } finally {
    event.target.value = '';
  }
};

const handleLogoUpload = async (event) => {
  isUploadingLogo.value = true;
  await uploadAndAssign(event, 'logoUrl');
  isUploadingLogo.value = false;
};

const handleQrUpload = (event) => uploadAndAssign(event, 'paymentQrUrl');

const handleSubmit = async () => {
  submitting.value = true;
  try {
    if (props.mode === 'create') {
      await buildingStore.createBuilding({
        name: form.name,
        address: form.address,
        themeColor: form.themeColor,
        logoUrl: form.logoUrl,
        promptpayNum: form.promptpayNum
      });
      await showSuccess('สำเร็จ!', 'สร้างตึกใหม่เรียบร้อยแล้ว');
    } else {
      await buildingStore.updateBuildingSetting(props.building.id, {
        themeColor: form.themeColor,
        logoUrl: form.logoUrl,
        promptpayNum: form.promptpayNum,
        paymentQrUrl: form.paymentQrUrl
      });
      await showSuccess('สำเร็จ!', 'อัปเดตการตั้งค่าประจำตึกเรียบร้อยแล้ว');
    }
    emit('saved');
    emit('update:open', false);
  } catch (error) {
    showError('เกิดข้อผิดพลาด', error.response?.data?.message || 'เกิดข้อผิดพลาดในการบันทึกข้อมูล');
  } finally {
    submitting.value = false;
  }
};
</script>
