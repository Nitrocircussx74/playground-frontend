<template>
  <div class="min-h-screen bg-slate-100 py-6 px-4 font-sans text-slate-900">
    <div class="max-w-md mx-auto space-y-5">
      <!-- Loading State -->
      <div v-if="loading" class="p-8 bg-white rounded-3xl shadow-sm text-center text-slate-500">
        <div class="animate-spin w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full mx-auto mb-3"></div>
        กำลังโหลดข้อมูลชำระเงิน LIFF...
      </div>

      <!-- Error State -->
      <div v-else-if="errorMessage" class="p-5 bg-rose-50 border border-rose-200 text-rose-700 rounded-3xl text-sm text-center font-medium">
        {{ errorMessage }}
      </div>

      <!-- Invoice & Payment Details Card -->
      <div v-else class="space-y-5">
        <!-- Verification Success Banner -->
        <div v-if="verificationResult" class="p-5 rounded-3xl border text-center space-y-2 shadow-md"
          :class="verificationResult.autoApproved ? 'bg-emerald-50 border-emerald-200 text-emerald-950' : 'bg-amber-50 border-amber-200 text-amber-950'"
        >
          <div class="w-12 h-12 rounded-full flex items-center justify-center text-2xl mx-auto"
            :class="verificationResult.autoApproved ? 'bg-emerald-100 text-emerald-600' : 'bg-amber-100 text-amber-600'"
          >
            {{ verificationResult.autoApproved ? '✓' : '⏳' }}
          </div>

          <h3 class="text-base font-bold">
            {{ verificationResult.autoApproved ? 'ชำระเงินสำเร็จแล้ว (PAID)' : 'แนบสลิปเรียบร้อยแล้ว' }}
          </h3>

          <p class="text-xs text-slate-600 leading-relaxed">
            {{ verificationResult.message }}
          </p>

          <div class="pt-2">
            <router-link
              to="/liff/profile"
              class="inline-block px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-2xl text-xs font-bold transition-all"
            >
              กลับสู่หน้าหลักผู้เช่า (Tenant Hub)
            </router-link>
          </div>
        </div>

        <template v-else>
          <!-- Header Info -->
          <div class="p-6 bg-gradient-to-br from-indigo-600 to-purple-700 text-white rounded-3xl shadow-md">
            <div class="flex items-center justify-between text-xs opacity-80 mb-1">
              <span>{{ invoice.billingCycle }}</span>
              <span class="font-mono">{{ invoice.invoiceNumber }}</span>
            </div>
            <div class="text-2xl font-bold">ห้อง {{ invoice.room?.roomNumber }}</div>
            <div class="mt-4 pt-3 border-t border-white/20 flex items-center justify-between">
              <span class="text-xs opacity-90">ยอดชำระสุทธิ</span>
              <span class="text-2xl font-extrabold">฿{{ Number(invoice.grandTotal).toLocaleString() }}</span>
            </div>
          </div>

          <!-- Breakdown Details -->
          <div class="p-5 bg-white rounded-3xl border border-slate-200 shadow-2xs space-y-3">
            <h3 class="text-xs uppercase font-bold text-slate-400 tracking-wider">รายละเอียดค่าใช้จ่าย</h3>

            <div class="space-y-2 text-sm">
              <div class="flex justify-between text-slate-600">
                <span>ค่าเช่าห้องพัก</span>
                <span class="font-mono text-slate-900">฿{{ Number(invoice.roomPrice).toLocaleString() }}</span>
              </div>
              <div class="flex justify-between text-slate-600">
                <span>ค่าน้ำประปา</span>
                <span class="font-mono text-slate-900">฿{{ Number(invoice.waterTotal).toLocaleString() }}</span>
              </div>
              <div class="flex justify-between text-slate-600">
                <span>ค่าไฟฟ้า</span>
                <span class="font-mono text-slate-900">฿{{ Number(invoice.electricTotal).toLocaleString() }}</span>
              </div>
              <div class="flex justify-between text-slate-600">
                <span>ค่าส่วนกลาง</span>
                <span class="font-mono text-slate-900">฿{{ Number(invoice.commonFee).toLocaleString() }}</span>
              </div>
            </div>
          </div>

          <!-- PromptPay QR Code Box -->
          <div class="p-6 bg-white rounded-3xl border border-slate-200 shadow-2xs text-center space-y-3">
            <div class="inline-flex items-center gap-2 bg-blue-50 text-blue-800 text-xs font-bold px-3 py-1 rounded-full border border-blue-200">
              <span>📲 Dynamic PromptPay QR Code</span>
            </div>

            <div class="py-2">
              <img :src="qrData.qrDataUrl" alt="PromptPay QR Code" class="w-56 h-56 mx-auto rounded-2xl border border-slate-200 shadow-2xs" />
            </div>

            <div class="text-xs text-slate-600 space-y-1">
              <div>พร้อมเพย์: <span class="font-bold text-slate-900 font-mono">{{ qrData.promptpayNumber }}</span></div>
              <div>ยอดชำระตามบิล: <span class="font-bold text-emerald-600 font-mono text-sm">฿{{ Number(qrData.amount).toLocaleString() }}</span></div>
            </div>
          </div>

          <!-- Upload Slip Form -->
          <div class="p-6 bg-white rounded-3xl border border-slate-200 shadow-2xs space-y-4">
            <h3 class="text-sm font-bold text-slate-900">แนบสลิปโอนเงิน (Upload Payment Slip)</h3>

            <form @submit.prevent="handleUploadSlip" class="space-y-4">
              <div>
                <input
                  type="file"
                  accept="image/png, image/jpeg, image/jpg"
                  required
                  @change="handleFileChange"
                  class="block w-full text-xs text-slate-500 file:mr-4 file:py-2.5 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
                />
              </div>

              <!-- Optional Amount Override for Testing Auto Verification -->
              <div>
                <label class="block text-[11px] font-semibold text-slate-500 mb-1">ยอดเงินในสลิป (ระบุเพื่อทดสอบ Auto Verification)</label>
                <input
                  v-model="declaredAmount"
                  type="number"
                  step="0.01"
                  :placeholder="`฿${invoice.grandTotal}`"
                  class="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-mono text-slate-900 focus:outline-hidden"
                />
              </div>

              <div v-if="previewUrl" class="text-center">
                <img :src="previewUrl" class="h-40 mx-auto object-cover rounded-2xl border border-slate-200 shadow-2xs" />
              </div>

              <button
                type="submit"
                :disabled="submitting || !selectedFile"
                class="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl font-bold text-sm transition-all shadow-md shadow-emerald-600/20 disabled:opacity-50"
              >
                {{ submitting ? 'กำลังตรวจสอบสลิปอัตโนมัติ...' : '⚡ ส่งสลิป & ตรวจสอบการชำระเงิน' }}
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
import liff from '@line/liff';
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
const lineUserId = ref('');
const declaredAmount = ref('');
const verificationResult = ref(null);

onMounted(async () => {
  try {
    const liffId = import.meta.env.VITE_LINE_LIFF_ID || '2000000000-mockliffid';
    try {
      await liff.init({ liffId });
      if (liff.isLoggedIn()) {
        const profile = await liff.getProfile();
        lineUserId.value = profile.userId;
      }
    } catch (liffError) {
      console.warn('LIFF init fallback mode:', liffError.message);
    }

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
    if (lineUserId.value) {
      formData.append('lineUserId', lineUserId.value);
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
