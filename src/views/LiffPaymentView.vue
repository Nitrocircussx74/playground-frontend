<template>
  <div class="space-y-4 pb-6 font-sans text-slate-800">
    <div class="space-y-4">
      <!-- Loading State -->
      <div v-if="loading" class="p-8 bg-white rounded-2xl shadow-xs border border-slate-100 text-center text-slate-400 text-xs">
        <div class="animate-spin w-6 h-6 border-2 border-indigo-600 border-t-transparent rounded-full mx-auto mb-2.5"></div>
        กำลังโหลดข้อมูลชำระเงิน...
      </div>

      <!-- Error State -->
      <div v-else-if="errorMessage" class="p-4 bg-rose-50 border border-rose-100 text-rose-700 rounded-2xl text-xs text-center font-medium">
        {{ errorMessage }}
      </div>

      <!-- Invoice & Payment Details Card -->
      <div v-else class="space-y-4">
        <!-- Verification Success Banner -->
        <div v-if="verificationResult" class="p-5 rounded-2xl border text-center space-y-2 shadow-xs"
          :class="verificationResult.autoApproved ? 'bg-emerald-50/70 border-emerald-200 text-emerald-950' : 'bg-amber-50/70 border-amber-200 text-amber-950'"
        >
          <div class="w-10 h-10 rounded-full flex items-center justify-center text-lg mx-auto font-bold"
            :class="verificationResult.autoApproved ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'"
          >
            {{ verificationResult.autoApproved ? '✓' : '!' }}
          </div>

          <h3 class="text-sm font-bold">
            {{ verificationResult.autoApproved ? 'ชำระเงินสำเร็จแล้ว (Paid)' : 'แนบสลิปเรียบร้อยแล้ว' }}
          </h3>

          <p class="text-xs text-slate-600 leading-relaxed">
            {{ verificationResult.message }}
          </p>

          <div class="pt-2">
            <router-link
              to="/liff/profile"
              class="inline-block px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-semibold transition-all shadow-xs"
            >
              กลับสู่หน้าหลัก
            </router-link>
          </div>
        </div>

        <template v-else>
          <!-- Header Info -->
          <div class="p-5 bg-gradient-to-br from-indigo-600 via-indigo-700 to-purple-700 text-white rounded-2xl shadow-md space-y-2">
            <div class="flex items-center justify-between text-xs text-indigo-100">
              <span>{{ invoice.billingCycle }}</span>
              <span class="font-mono bg-white/20 px-2 py-0.5 rounded-md text-[10px]">{{ invoice.invoiceNumber }}</span>
            </div>
            <div class="text-xl font-bold">ห้อง {{ invoice.room?.roomNumber }}</div>
            <div class="mt-3 pt-2.5 border-t border-white/20 flex items-center justify-between">
              <span class="text-xs text-indigo-100/90 font-medium">ยอดชำระสุทธิ</span>
              <span class="text-xl font-bold font-mono">฿{{ Number(invoice.grandTotal).toLocaleString() }}</span>
            </div>
          </div>

          <!-- Breakdown Details -->
          <div class="p-4 bg-white rounded-2xl border border-slate-100 shadow-xs space-y-2.5">
            <h3 class="text-xs font-bold text-slate-400 uppercase tracking-wider">รายละเอียดค่าใช้จ่าย</h3>

            <div class="space-y-2 text-xs divide-y divide-slate-100">
              <div class="flex justify-between text-slate-600 pt-1">
                <span>ค่าเช่าห้องพัก</span>
                <span class="font-mono text-slate-800 font-bold">฿{{ Number(invoice.roomPrice).toLocaleString() }}</span>
              </div>
              <div class="flex justify-between text-slate-600 pt-2">
                <span>ค่าน้ำประปา</span>
                <span class="font-mono text-slate-800 font-bold">฿{{ Number(invoice.waterTotal).toLocaleString() }}</span>
              </div>
              <div class="flex justify-between text-slate-600 pt-2">
                <span>ค่าไฟฟ้า</span>
                <span class="font-mono text-slate-800 font-bold">฿{{ Number(invoice.electricTotal).toLocaleString() }}</span>
              </div>
              <div class="flex justify-between text-slate-600 pt-2">
                <span>ค่าส่วนกลาง</span>
                <span class="font-mono text-slate-800 font-bold">฿{{ Number(invoice.commonFee).toLocaleString() }}</span>
              </div>
            </div>
          </div>

          <!-- PromptPay QR Code Box -->
          <div class="p-5 bg-white rounded-2xl border border-slate-100 shadow-xs text-center space-y-2.5">
            <div class="inline-flex items-center gap-1.5 bg-indigo-50 text-indigo-700 text-xs font-semibold px-3 py-1 rounded-full border border-indigo-100">
              <span>PromptPay QR Code</span>
            </div>

            <div class="py-1">
              <img :src="qrData.qrDataUrl" alt="PromptPay QR Code" class="w-48 h-48 mx-auto rounded-xl border border-slate-100 shadow-2xs" />
            </div>

            <div class="text-xs text-slate-600 space-y-0.5 font-mono">
              <div>พร้อมเพย์: <span class="font-bold text-slate-800">{{ qrData.promptpayNumber }}</span></div>
              <div>ยอดชำระ: <span class="font-bold text-emerald-600 text-sm">฿{{ Number(qrData.amount).toLocaleString() }}</span></div>
            </div>
          </div>

          <!-- Upload Slip Form -->
          <div class="p-5 bg-white rounded-2xl border border-slate-100 shadow-xs space-y-3">
            <h3 class="text-xs font-bold text-slate-800">แนบสลิปโอนเงิน (Upload Slip)</h3>

            <form @submit.prevent="handleUploadSlip" class="space-y-3">
              <div>
                <input
                  type="file"
                  accept="image/png, image/jpeg, image/jpg"
                  required
                  @change="handleFileChange"
                  class="block w-full text-xs text-slate-500 file:mr-3 file:py-2 file:px-3.5 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-indigo-50 file:text-indigo-600 hover:file:bg-indigo-100 cursor-pointer"
                />
              </div>

              <!-- Optional Amount Override for Testing Auto Verification -->
              <div>
                <label class="block text-[11px] font-medium text-slate-400 mb-1">ยอดเงินในสลิป (ระบุเพื่อทดสอบ Auto Verification)</label>
                <input
                  v-model="declaredAmount"
                  type="number"
                  step="0.01"
                  :placeholder="`฿${invoice.grandTotal}`"
                  class="w-full bg-slate-50 border border-slate-200/80 rounded-xl px-3 py-2 text-xs font-mono text-slate-800 focus:outline-hidden focus:bg-white focus:ring-1 focus:ring-indigo-400"
                />
              </div>

              <div v-if="previewUrl" class="text-center">
                <img :src="previewUrl" class="h-40 mx-auto object-cover rounded-xl border border-slate-100 shadow-xs" />
              </div>

              <button
                type="submit"
                :disabled="submitting || !selectedFile"
                class="w-full py-2.5 bg-emerald-500 hover:bg-emerald-600 active:bg-emerald-700 text-white rounded-xl font-bold text-xs transition-all shadow-xs disabled:opacity-50 cursor-pointer active:scale-[0.99]"
              >
                {{ submitting ? 'กำลังตรวจสอบสลิป...' : 'ส่งสลิป & ยืนยันการชำระเงิน' }}
              </button>
            </form>
          </div>
        </template>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { initLiff } from '@/utils/liff';
import api from '@/utils/api';
import { showError } from '@/utils/swal';

const route = useRoute();
const invoiceId = route.params.invoiceId;

const loading = ref(true);
const submitting = ref(false);
const errorMessage = ref('');
const invoice = ref({});
const qrData = ref({});
const selectedFile = ref(null);
const previewUrl = ref('');
const declaredAmount = ref('');
const verificationResult = ref(null);

onMounted(async () => {
  try {
    await initLiff();

    const response = await api.get(`/api/v1/liff/invoices/${invoiceId}`);
    invoice.value = response.data.data.invoice;
    qrData.value = response.data.data.qrData;
    declaredAmount.value = invoice.value.grandTotal;
  } catch (error) {
    errorMessage.value = error.response?.data?.message || 'ไม่สามารถดึงข้อมูลบิลได้';
  } finally {
    loading.value = false;
  }
});

const handleFileChange = (e) => {
  const file = e.target.files[0];
  if (!file) return;

  selectedFile.value = file;
  previewUrl.value = URL.createObjectURL(file);
};

const handleUploadSlip = async () => {
  if (!selectedFile.value) return;

  submitting.value = true;
  try {
    const formData = new FormData();
    formData.append('file', selectedFile.value);
    if (declaredAmount.value) {
      formData.append('declaredAmount', declaredAmount.value);
    }

    const res = await api.post(`/api/v1/liff/invoices/${invoiceId}/slip`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });

    verificationResult.value = {
      autoApproved: res.data.data.autoApproved,
      message: res.data.message
    };
  } catch (error) {
    showError('เกิดข้อผิดพลาด', error.response?.data?.message || 'เกิดข้อผิดพลาดในการแนบสลิป');
  } finally {
    submitting.value = false;
  }
};
</script>
