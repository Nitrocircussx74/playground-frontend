<template>
  <div class="min-h-screen bg-slate-100/90 py-6 px-4 font-sans text-slate-900">
    <div class="max-w-md mx-auto space-y-5">
      <!-- Loading State -->
      <div v-if="loading" class="p-8 bg-white rounded-3xl shadow-sm text-center text-slate-500">
        <div class="animate-spin w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full mx-auto mb-3"></div>
        กำลังโหลดรายละเอียดบิล...
      </div>

      <!-- Error State -->
      <div v-else-if="errorMessage" class="p-5 bg-rose-50 border border-rose-200 text-rose-700 rounded-3xl text-sm text-center font-medium">
        {{ errorMessage }}
      </div>

      <div v-else class="space-y-5">
        <!-- 1. Header Card (ยอดสุทธิ & สถานะบิล) -->
        <div class="p-6 bg-gradient-to-br from-indigo-600 via-indigo-700 to-purple-800 text-white rounded-3xl shadow-xl relative overflow-hidden space-y-3">
          <div class="flex items-center justify-between text-xs opacity-90">
            <span>รอบบิล {{ invoice.billingCycle }}</span>
            <span class="font-mono bg-white/20 px-2 py-0.5 rounded-md text-[11px]">{{ invoice.invoiceNumber }}</span>
          </div>

          <div>
            <div class="text-xs text-indigo-100">ห้องพักหมายเลข</div>
            <div class="text-2xl font-black">ห้อง {{ invoice.room?.roomNumber }}</div>
          </div>

          <div class="pt-3 border-t border-white/20 flex items-center justify-between">
            <div>
              <div class="text-[10px] text-indigo-100">สถานะชำระเงิน</div>
              <span
                class="inline-block mt-0.5 text-xs font-bold px-2.5 py-0.5 rounded-full border shadow-2xs"
                :class="statusBadgeClass"
              >
                {{ statusBadgeText }}
              </span>
            </div>

            <div class="text-right">
              <div class="text-[10px] text-indigo-100">ยอดชำระสุทธิ</div>
              <div class="text-2xl font-black font-mono">฿{{ Number(invoice.grandTotal).toLocaleString() }}</div>
            </div>
          </div>
        </div>

        <!-- 2. Bill Breakdown Table (แจกแจงค่าเช่า, ค่าน้ำ, ค่าไฟ, ค่าส่วนกลาง) -->
        <div class="p-5 bg-white rounded-3xl border border-slate-200/80 shadow-xs space-y-3">
          <h3 class="text-xs uppercase font-extrabold text-slate-400 tracking-wider">แจกแจงรายละเอียดค่าใช้จ่าย (Bill Breakdown)</h3>

          <div class="space-y-2.5 text-sm divide-y divide-slate-100">
            <div class="flex justify-between items-center pt-1">
              <span class="text-slate-600">ค่าเช่าห้องพัก</span>
              <span class="font-bold text-slate-900 font-mono">฿{{ Number(invoice.roomPrice).toLocaleString() }}</span>
            </div>

            <div class="pt-2 space-y-1">
              <div class="flex justify-between items-center">
                <span class="text-slate-600">ค่าน้ำประปา</span>
                <span class="font-bold text-slate-900 font-mono">฿{{ Number(invoice.waterTotal).toLocaleString() }}</span>
              </div>
              <div class="text-[11px] text-slate-400 font-mono pl-2">
                มิเตอร์: {{ invoice.waterPrevious || 100 }} ➔ {{ invoice.waterCurrent || 115 }} (ใช้ไป {{ (invoice.waterCurrent || 115) - (invoice.waterPrevious || 100) }} หน่วย)
              </div>
            </div>

            <div class="pt-2 space-y-1">
              <div class="flex justify-between items-center">
                <span class="text-slate-600">ค่าไฟฟ้า</span>
                <span class="font-bold text-slate-900 font-mono">฿{{ Number(invoice.electricTotal).toLocaleString() }}</span>
              </div>
              <div class="text-[11px] text-slate-400 font-mono pl-2">
                มิเตอร์: {{ invoice.electricPrevious || 1000 }} ➔ {{ invoice.electricCurrent || 1080 }} (ใช้ไป {{ (invoice.electricCurrent || 1080) - (invoice.electricPrevious || 1000) }} หน่วย)
              </div>
            </div>

            <div class="flex justify-between items-center pt-2">
              <span class="text-slate-600">ค่าส่วนกลาง</span>
              <span class="font-bold text-slate-900 font-mono">฿{{ Number(invoice.commonFee).toLocaleString() }}</span>
            </div>
          </div>
        </div>

        <!-- 3. Payment Section: PromptPay QR Code & Slip Upload (แสดงเฉพาะเมื่อ status = pending หรือ overdue) -->
        <div v-if="invoice.status === 'pending' || invoice.status === 'overdue'" class="space-y-4">
          <!-- PromptPay QR Box -->
          <div class="p-6 bg-white rounded-3xl border border-slate-200 shadow-xs text-center space-y-3">
            <div class="inline-flex items-center gap-1.5 bg-blue-50 text-blue-800 text-xs font-bold px-3 py-1 rounded-full border border-blue-200">
              <span>📲 PromptPay QR Code (สแกนชำระเงิน)</span>
            </div>

            <div class="py-2">
              <img :src="qrData.qrDataUrl || mockQrUrl" alt="PromptPay QR Code" class="w-56 h-56 mx-auto rounded-2xl border border-slate-200 shadow-xs" />
            </div>

            <div class="text-xs text-slate-600 space-y-1 font-mono">
              <div>หมายเลขพร้อมเพย์: <span class="font-bold text-slate-900">{{ qrData.promptpayNumber || '081-234-5678' }}</span></div>
              <div>ยอดเงิน: <span class="font-bold text-emerald-600 text-sm">฿{{ Number(invoice.grandTotal).toLocaleString() }}</span></div>
            </div>
          </div>

          <!-- Slip Upload Form -->
          <div class="p-6 bg-white rounded-3xl border border-slate-200 shadow-xs space-y-4">
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

              <div v-if="previewUrl" class="text-center">
                <img :src="previewUrl" class="h-44 mx-auto object-cover rounded-2xl border border-slate-200 shadow-xs" />
              </div>

              <button
                type="submit"
                :disabled="submitting || !selectedFile"
                class="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl font-bold text-sm transition-all shadow-md shadow-emerald-600/20 disabled:opacity-50"
              >
                {{ submitting ? 'กำลังส่งข้อมูลสลิป...' : 'ส่งสลิปโอนเงิน (Submit Slip)' }}
              </button>
            </form>
          </div>
        </div>

        <!-- 4. Reviewing State Message Box (แสดงเมื่ออัปโหลดสลิปแล้ว รอแอดมินอนุมัติ) -->
        <div v-else-if="invoice.status === 'reviewing'" class="p-6 bg-blue-50 border border-blue-200 rounded-3xl text-center space-y-2">
          <div class="text-2xl">🔍</div>
          <h3 class="text-sm font-bold text-blue-900">กำลังอยู่ระหว่างการตรวจสอบสลิปโอนเงิน</h3>
          <p class="text-xs text-blue-700 leading-relaxed">
            ระบบได้รับสลิปโอนเงินเรียบร้อยแล้ว แอดมินกำลังทำการตรวจสอบยอดเงินครับ
          </p>
        </div>

        <!-- 5. Paid State Message Box (ชำระแล้วเรียบร้อยพร้อมปุ่มโหลด E-Receipt PDF) -->
        <div v-else-if="invoice.status === 'paid'" class="p-6 bg-emerald-50 border border-emerald-200 rounded-3xl text-center space-y-3">
          <div class="text-2xl">✅</div>
          <h3 class="text-sm font-bold text-emerald-900">ชำระเงินเรียบร้อยแล้ว (PAID)</h3>
          <button
            @click="downloadReceiptPdf"
            class="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs"
          >
            📄 ดาวน์โหลดใบเสร็จรับเงิน (E-Receipt PDF)
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import liff from '@line/liff';
import api from '@/utils/api';
import { showSuccess, showError } from '@/utils/swal';

const route = useRoute();
const invoiceId = route.params.id;

const loading = ref(true);
const submitting = ref(false);
const errorMessage = ref('');
const invoice = ref({});
const qrData = ref({});
const selectedFile = ref(null);
const previewUrl = ref('');
const lineUserId = ref('');

const mockQrUrl = 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?auto=format&fit=crop&w=400&q=80';

onMounted(async () => {
  try {
    const liffId = import.meta.env.VITE_LINE_LIFF_ID || '2000000000-mockliffid';
    try {
      await liff.init({ liffId });
      if (liff.isLoggedIn()) {
        const profile = await liff.getProfile();
        lineUserId.value = profile.userId;
      }
    } catch (liffErr) {
      console.warn('LIFF init fallback mode:', liffErr.message);
    }

    const res = await api.get(`/api/v1/liff/invoices/${invoiceId}`);
    invoice.value = res.data.data.invoice;
    qrData.value = res.data.data.qrData || {};
  } catch (err) {
    errorMessage.value = err.response?.data?.message || 'ไม่สามารถดึงข้อมูลบิลค่าเช่าได้';
  } finally {
    loading.value = false;
  }
});

const statusBadgeText = computed(() => {
  const map = {
    pending: '⏳ รอชำระเงิน',
    overdue: '🚨 เกินกำหนดชำระ',
    reviewing: '🔍 กำลังตรวจสอบสลิป',
    paid: '✓ PAID (ชำระแล้ว)'
  };
  return map[invoice.value.status] || invoice.value.status;
});

const statusBadgeClass = computed(() => {
  const map = {
    pending: 'bg-amber-100 border-amber-300 text-amber-900',
    overdue: 'bg-rose-100 border-rose-300 text-rose-900',
    reviewing: 'bg-blue-100 border-blue-300 text-blue-900',
    paid: 'bg-emerald-100 border-emerald-300 text-emerald-900'
  };
  return map[invoice.value.status] || 'bg-slate-100 border-slate-300 text-slate-800';
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
    if (lineUserId.value) {
      formData.append('lineUserId', lineUserId.value);
    }

    await api.post(`/api/v1/liff/invoices/${invoiceId}/slip`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });

    // อัปเดตสถานะเป็๋น reviewing ทันทีโดยไม่ต้องโหลดใหม่
    invoice.value.status = 'reviewing';
    await showSuccess('สำเร็จ!', 'ส่งสลิปโอนเงินเรียบร้อยแล้ว! แอดมินกำลังทำการตรวจสอบยอดเงินครับ');
  } catch (err) {
    showError('เกิดข้อผิดพลาด', err.response?.data?.message || 'เกิดข้อผิดพลาดในการแนบสลิป');
  } finally {
    submitting.value = false;
  }
};

const downloadReceiptPdf = async () => {
  try {
    const res = await api.get(`/api/v1/liff/invoices/${invoiceId}/receipt-pdf`, {
      responseType: 'blob'
    });
    const blob = new Blob([res.data], { type: 'application/pdf' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `Official-Receipt-REC-${invoice.value.invoiceNumber}.pdf`);
    document.body.appendChild(link);
    link.click();
    link.remove();
  } catch (err) {
    showError('เกิดข้อผิดพลาด', 'ไม่สามารถดาวน์โหลดใบเสร็จรับเงินได้');
  }
};
</script>
