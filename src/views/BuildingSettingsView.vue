<template>
  <div class="max-w-5xl mx-auto space-y-6 pb-24">
    <!-- Header Section -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
      <div>
        <h1 class="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2.5">
          <span>⚙️</span>
          <span>ตั้งค่าตึกและอาคาร (Building Settings)</span>
        </h1>
        <p class="text-xs sm:text-sm text-slate-500 mt-1">
          กำหนดข้อมูลทั่วไป บัญชีรับเงิน อัตราค่าน้ำ-ไฟ และกฎระเบียบประจำตึก
        </p>
      </div>

      <!-- RBAC Status Badge -->
      <div>
        <span
          v-if="!isReadOnly"
          class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200"
        >
          <span class="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          <span>สิทธิ์สแกนแก้ไข: OWNER / Super Admin</span>
        </span>
        <span
          v-else
          class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200"
        >
          <span>🔒</span>
          <span>สิทธิ์ดูอย่างเดียว: MANAGER / Admin</span>
        </span>
      </div>
    </div>

    <!-- Read-Only Banner Warning for MANAGER -->
    <div
      v-if="isReadOnly"
      class="p-4 bg-amber-50 border border-amber-200/80 rounded-2xl flex items-start gap-3 text-amber-800 text-xs sm:text-sm shadow-2xs"
    >
      <span class="text-lg">🔒</span>
      <div>
        <h4 class="font-bold">โหมดดูได้อย่างเดียว (View-only Mode)</h4>
        <p class="mt-0.5 text-amber-700">
          บัญชีของคุณได้รับสิทธิ์ระดับ MANAGER / Admin สามารถดูตั้งค่าของตึกได้เท่านั้น เฉพาะสิทธิ์ OWNER / Super Admin จึงจะสามารถแก้ไขได้
        </p>
      </div>
    </div>

    <!-- Feedback Alerts -->
    <div v-if="successMessage" class="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl text-xs sm:text-sm font-semibold flex items-center gap-2">
      <span>✅</span>
      <span>{{ successMessage }}</span>
    </div>
    <div v-if="errorMessage" class="p-4 bg-rose-50 border border-rose-200 text-rose-800 rounded-2xl text-xs sm:text-sm font-semibold flex items-center gap-2">
      <span>❌</span>
      <span>{{ errorMessage }}</span>
    </div>

    <!-- Loading Skeleton -->
    <div v-if="isLoading" class="p-12 text-center text-slate-500 bg-white rounded-2xl border border-slate-200 shadow-xs">
      <div class="animate-spin inline-block w-8 h-8 border-3 border-purple-600 border-t-transparent rounded-full mb-3"></div>
      <p class="text-sm font-semibold">กำลังโหลดข้อมูลการตั้งค่าตึก...</p>
    </div>

    <!-- Main Settings Form & Shadcn Tabs -->
    <div v-else>
      <Tabs v-model="activeTab" class="w-full">
        <!-- Tab List Headers -->
        <TabsList class="w-full justify-start overflow-x-auto bg-slate-200/60 p-1.5 rounded-2xl">
          <TabsTrigger value="general" class="flex items-center gap-2">
            <span>🏢</span>
            <span>ข้อมูลทั่วไป</span>
          </TabsTrigger>
          <TabsTrigger value="payment" class="flex items-center gap-2">
            <span>💰</span>
            <span>การชำระเงิน & QR Code</span>
          </TabsTrigger>
          <TabsTrigger value="billing" class="flex items-center gap-2">
            <span>⚡</span>
            <span>ค่าบริการและรอบบิล</span>
          </TabsTrigger>
          <TabsTrigger value="rules" class="flex items-center gap-2">
            <span>📝</span>
            <span>กฎระเบียบ</span>
          </TabsTrigger>
        </TabsList>

        <!-- 🏢 Tab 1: ข้อมูลทั่วไป (General Info) -->
        <TabsContent value="general">
          <Card class="border-slate-200 shadow-xs rounded-2xl">
            <CardHeader>
              <CardTitle class="text-base sm:text-lg flex items-center gap-2">
                <span>🏢</span>
                <span>ข้อมูลทั่วไปของตึก (General Information)</span>
              </CardTitle>
              <CardDescription>
                ชื่อ ที่อยู่ เบอร์โทรศัพท์ติดต่อ และรูปภาพหน้าปกประจำตึก
              </CardDescription>
            </CardHeader>
            <CardContent class="space-y-4">
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div class="space-y-1.5">
                  <label class="text-xs font-bold text-slate-700">ชื่ออาคาร/ตึก <span class="text-rose-500">*</span></label>
                  <Input
                    v-model="form.name"
                    :disabled="isReadOnly"
                    placeholder="เช่น อาคาร A (Main Building)"
                    class="bg-white"
                  />
                </div>

                <div class="space-y-1.5">
                  <label class="text-xs font-bold text-slate-700">เบอร์โทรศัพท์ติดต่อ</label>
                  <Input
                    v-model="form.phone"
                    :disabled="isReadOnly"
                    placeholder="เช่น 02-123-4567"
                    class="bg-white"
                  />
                </div>
              </div>

              <div class="space-y-1.5">
                <label class="text-xs font-bold text-slate-700">ที่อยู่หรือสถานที่ตั้ง</label>
                <Input
                  v-model="form.address"
                  :disabled="isReadOnly"
                  placeholder="เช่น 123/1 ถนนสุขุมวิท เขตวัฒนา กรุงเทพมหานคร"
                  class="bg-white"
                />
              </div>

              <div class="space-y-1.5">
                <label class="text-xs font-bold text-slate-700">URL รูปภาพหน้าปกตึก (Cover Image URL)</label>
                <Input
                  v-model="form.coverImageUrl"
                  :disabled="isReadOnly"
                  placeholder="https://example.com/cover.jpg"
                  class="bg-white"
                />
              </div>

              <!-- Cover Image Preview -->
              <div v-if="form.coverImageUrl" class="mt-3">
                <label class="text-xs font-bold text-slate-500 block mb-1">ตัวอย่างรูปภาพหน้าปก:</label>
                <img
                  :src="form.coverImageUrl"
                  alt="Building Cover Preview"
                  class="w-full h-48 object-cover rounded-xl border border-slate-200 shadow-2xs"
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <!-- 💰 Tab 2: การชำระเงิน (Payment Options & Real QR Code) -->
        <TabsContent value="payment">
          <Card class="border-slate-200 shadow-xs rounded-2xl">
            <CardHeader>
              <CardTitle class="text-base sm:text-lg flex items-center gap-2">
                <span>💰</span>
                <span>ช่องทางชำระเงินและพร้อมเพย์ (Payment Options)</span>
              </CardTitle>
              <CardDescription>
                กำหนด PromptPay QR Code บัญชีธนาคารรับโอนเงิน และคำอธิบายการชำระเงิน
              </CardDescription>
            </CardHeader>
            <CardContent class="space-y-5">
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div class="space-y-1.5">
                  <label class="text-xs font-bold text-slate-700">หมายเลข PromptPay <span class="text-rose-500">*</span></label>
                  <Input
                    v-model="form.promptpayNum"
                    :disabled="isReadOnly"
                    placeholder="เช่น 0812345678 หรือ เลขประจำตัวผู้เสียภาษี"
                    class="bg-white font-mono font-semibold"
                  />
                </div>

                <div class="space-y-1.5">
                  <label class="text-xs font-bold text-slate-700">ชื่อธนาคารผู้รับโอน</label>
                  <Input
                    v-model="form.bankName"
                    :disabled="isReadOnly"
                    placeholder="เช่น ธนาคารกสิกรไทย (KBANK)"
                    class="bg-white"
                  />
                </div>
              </div>

              <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div class="space-y-1.5">
                  <label class="text-xs font-bold text-slate-700">ชื่อบัญชีธนาคาร</label>
                  <Input
                    v-model="form.bankAccountName"
                    :disabled="isReadOnly"
                    placeholder="เช่น บริษัท หอพักสุขสบาย จำกัด"
                    class="bg-white"
                  />
                </div>

                <div class="space-y-1.5">
                  <label class="text-xs font-bold text-slate-700">เลขที่บัญชีธนาคาร</label>
                  <Input
                    v-model="form.bankAccountNo"
                    :disabled="isReadOnly"
                    placeholder="เช่น 123-4-56789-0"
                    class="bg-white font-mono"
                  />
                </div>
              </div>

              <!-- PromptPay QR Code Control Bar -->
              <div class="space-y-2 p-4 bg-slate-50 rounded-2xl border border-slate-200">
                <label class="text-xs font-bold text-slate-800 flex items-center justify-between">
                  <span>📱 รูปภาพ PromptPay QR Code ประจำตึก</span>
                  <span class="text-[11px] text-purple-700 font-semibold">อัปโหลดรูปภาพ หรือสร้าง QR Code อัตโนมัติ</span>
                </label>

                <div class="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                  <Input
                    v-model="form.paymentQrUrl"
                    :disabled="isReadOnly"
                    placeholder="https://example.com/qr.png หรือ Data URL"
                    class="bg-white flex-1 font-mono text-xs"
                  />

                  <label
                    v-if="!isReadOnly"
                    class="cursor-pointer inline-flex items-center justify-center gap-1.5 px-3.5 py-2 bg-slate-200 hover:bg-slate-300 border border-slate-300 text-slate-800 text-xs font-bold rounded-xl shrink-0 transition-colors"
                  >
                    <span>📷</span>
                    <span>{{ isUploadingQr ? 'กำลังอัปโหลด...' : 'อัปโหลดรูป QR' }}</span>
                    <input type="file" accept="image/png, image/jpeg, image/jpg" class="hidden" @change="handleQrUpload" :disabled="isUploadingQr" />
                  </label>

                  <Button
                    v-if="!isReadOnly"
                    type="button"
                    @click="generatePromptPayQr"
                    :disabled="isGeneratingQr || !form.promptpayNum"
                    variant="outline"
                    class="text-xs font-bold border-purple-300 text-purple-700 hover:bg-purple-100 shrink-0 shadow-2xs"
                  >
                    <span>⚡</span>
                    <span>{{ isGeneratingQr ? 'กำลังสร้าง...' : 'สร้าง QR อัตโนมัติ' }}</span>
                  </Button>
                </div>
              </div>

              <div class="space-y-1.5">
                <label class="text-xs font-bold text-slate-700">คำอธิบาย/หมายเหตุการชำระเงิน</label>
                <textarea
                  v-model="form.paymentNote"
                  :disabled="isReadOnly"
                  rows="3"
                  placeholder="เช่น ชำระเงินภายในวันที่ 5 ของทุกเดือน ชำระแล้วกรุณาแนบสลิปผ่านทางระบบ LIFF"
                  class="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-purple-600 disabled:bg-slate-100 disabled:text-slate-500"
                ></textarea>
              </div>

              <!-- 📲 Authentic PromptPay QR Code Preview Box -->
              <div class="mt-4 p-6 bg-slate-900 text-white rounded-3xl shadow-lg border border-slate-800 text-center space-y-4 max-w-sm mx-auto">
                <div class="inline-flex items-center gap-2 bg-purple-500/20 text-purple-300 text-xs font-bold px-3 py-1 rounded-full border border-purple-500/30">
                  <span>📲 PromptPay QR Code ประจำตึก</span>
                </div>

                <div class="p-3 bg-white rounded-2xl border border-slate-200 inline-block shadow-inner">
                  <img
                    :src="displayQrUrl"
                    alt="PromptPay QR Code Preview"
                    class="w-56 h-56 object-contain mx-auto rounded-lg"
                  />
                </div>

                <div class="text-xs space-y-1 text-slate-300">
                  <div>หมายเลขพร้อมเพย์: <span class="font-bold text-emerald-400 font-mono text-sm">{{ form.promptpayNum || 'ยังไม่ได้ระบุ' }}</span></div>
                  <div v-if="form.bankAccountName" class="text-[11px] text-slate-400">ชื่อบัญชี: {{ form.bankAccountName }}</div>
                  <div v-if="form.bankName" class="text-[11px] text-slate-400">ธนาคาร: {{ form.bankName }} ({{ form.bankAccountNo }})</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <!-- ⚡ Tab 3: ค่าบริการและรอบบิล (Billing & Utilities) -->
        <TabsContent value="billing">
          <Card class="border-slate-200 shadow-xs rounded-2xl">
            <CardHeader>
              <CardTitle class="text-base sm:text-lg flex items-center gap-2">
                <span>⚡</span>
                <span>อัตราค่าบริการและรอบบิล (Billing & Utility Rates)</span>
              </CardTitle>
              <CardDescription>
                กำหนดอัตราค่าน้ำ ค่าไฟ วันครบกำหนดชำระ และค่าปรับกรณีชำระล่าช้า
              </CardDescription>
            </CardHeader>
            <CardContent class="space-y-4">
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div class="space-y-1.5">
                  <label class="text-xs font-bold text-slate-700">อัตราค่าน้ำ (บาท / หน่วย)</label>
                  <Input
                    type="number"
                    step="0.5"
                    v-model="form.waterRate"
                    :disabled="isReadOnly"
                    placeholder="18.00"
                    class="bg-white"
                  />
                </div>

                <div class="space-y-1.5">
                  <label class="text-xs font-bold text-slate-700">อัตราค่าไฟ (บาท / หน่วย)</label>
                  <Input
                    type="number"
                    step="0.5"
                    v-model="form.electricRate"
                    :disabled="isReadOnly"
                    placeholder="7.00"
                    class="bg-white"
                  />
                </div>
              </div>

              <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div class="space-y-1.5">
                  <label class="text-xs font-bold text-slate-700">วันกำหนดชำระเงินของเดือน (1 - 31)</label>
                  <Input
                    type="number"
                    min="1"
                    max="31"
                    v-model="form.dueDateDay"
                    :disabled="isReadOnly"
                    placeholder="5"
                    class="bg-white"
                  />
                  <span class="text-[11px] text-slate-500">เช่น ใส่เลข 5 หมายถึง วันที่ 5 ของทุกเดือน</span>
                </div>

                <div class="space-y-1.5">
                  <label class="text-xs font-bold text-slate-700">ค่าปรับชำระเกินกำหนด (บาท / วัน หรือ ครั้ง)</label>
                  <Input
                    type="number"
                    step="10"
                    v-model="form.latePenalty"
                    :disabled="isReadOnly"
                    placeholder="50.00"
                    class="bg-white"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <!-- 📝 Tab 4: กฎระเบียบ (Rules & Contracts) -->
        <TabsContent value="rules">
          <Card class="border-slate-200 shadow-xs rounded-2xl">
            <CardHeader>
              <CardTitle class="text-base sm:text-lg flex items-center gap-2">
                <span>📝</span>
                <span>กฎระเบียบและสัญญาเช่า (Rules & Contracts)</span>
              </CardTitle>
              <CardDescription>
                กำหนดเงินมัดจำ ค่าเช่าล่วงหน้า และเงื่อนไขข้อตกลงสัญญาเช่าประจำตึก
              </CardDescription>
            </CardHeader>
            <CardContent class="space-y-4">
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div class="space-y-1.5">
                  <label class="text-xs font-bold text-slate-700">เงินมัดจำ/ประกัน (จำนวนเดือน)</label>
                  <Input
                    type="number"
                    min="0"
                    v-model="form.depositMonths"
                    :disabled="isReadOnly"
                    placeholder="2"
                    class="bg-white"
                  />
                </div>

                <div class="space-y-1.5">
                  <label class="text-xs font-bold text-slate-700">ค่าเช่าล่วงหน้า (จำนวนเดือน)</label>
                  <Input
                    type="number"
                    min="0"
                    v-model="form.advanceMonths"
                    :disabled="isReadOnly"
                    placeholder="1"
                    class="bg-white"
                  />
                </div>
              </div>

              <div class="space-y-1.5">
                <label class="text-xs font-bold text-slate-700">กฎระเบียบและข้อตกลงสัญญาเช่า (Terms & Conditions)</label>
                <textarea
                  v-model="form.termsAndConditions"
                  :disabled="isReadOnly"
                  rows="6"
                  placeholder="1. ห้ามส่งเสียงดังหลังเวลา 22:00 น.&#10;2. ห้ามเลี้ยงสัตว์เลี้ยงทุกชนิด&#10;3. ห้ามสูบบุหรี่ภายในห้องพักและระเบียง"
                  class="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-purple-600 disabled:bg-slate-100 disabled:text-slate-500 font-sans"
                ></textarea>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>

    <!-- Sticky Bottom Save Action Bar (Shown ONLY for OWNER / Super Admin) -->
    <div
      v-if="!isReadOnly && !isLoading"
      class="fixed bottom-0 inset-x-0 bg-white/90 backdrop-blur-md border-t border-slate-200 p-4 shadow-lg z-40"
    >
      <div class="max-w-5xl mx-auto flex items-center justify-between">
        <div class="text-xs text-slate-500 hidden sm:block">
          <span>สิทธิ์ปัจจุบัน: <strong class="text-purple-700">OWNER / Super Admin</strong> (สามารถบันทึกการเปลี่ยนแปลงได้)</span>
        </div>

        <Button
          @click="saveSettings"
          :disabled="isSaving"
          class="w-full sm:w-auto bg-purple-600 hover:bg-purple-700 text-white font-bold px-6 py-2.5 rounded-xl shadow-md shadow-purple-600/30 flex items-center justify-center gap-2 cursor-pointer"
        >
          <span v-if="isSaving" class="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full"></span>
          <span v-else>💾</span>
          <span>{{ isSaving ? 'กำลังบันทึกข้อมูล...' : 'บันทึกการตั้งค่า (Save Changes)' }}</span>
        </Button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import QRCode from 'qrcode';
import { useAuthStore } from '@/stores/auth';
import { useBuildingStore } from '@/stores/useBuildingStore';
import uploadService from '@/services/uploadService';
import api from '@/utils/api';

import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';

const authStore = useAuthStore();
const buildingStore = useBuildingStore();

const activeTab = ref('general');
const isLoading = ref(false);
const isSaving = ref(false);
const isGeneratingQr = ref(false);
const isUploadingQr = ref(false);
const successMessage = ref('');
const errorMessage = ref('');

// Reactive Form Data
const form = ref({
  name: '',
  address: '',
  phone: '',
  coverImageUrl: '',
  paymentQrUrl: '',
  promptpayNum: '',
  bankName: '',
  bankAccountName: '',
  bankAccountNo: '',
  paymentNote: '',
  waterRate: 18.00,
  electricRate: 7.00,
  dueDateDay: 5,
  latePenalty: 50.00,
  depositMonths: 2,
  advanceMonths: 1,
  termsAndConditions: ''
});

/**
 * Dynamic PromptPay QR Code Image Display Computation
 */
const displayQrUrl = computed(() => {
  if (form.value.paymentQrUrl && !form.value.paymentQrUrl.includes('unsplash.com')) {
    return form.value.paymentQrUrl;
  }

  const num = form.value.promptpayNum ? form.value.promptpayNum.replace(/[^0-9]/g, '') : '0812345678';
  return `https://api.qrserver.com/v1/create-qr-code/?size=350x350&data=PromptPay_${num}`;
});

/**
 * Generate Real PromptPay EMVCo QR Code Data URL
 */
const generatePromptPayQr = async () => {
  const num = form.value.promptpayNum ? form.value.promptpayNum.replace(/[^0-9]/g, '') : '0812345678';
  if (!num) return;

  isGeneratingQr.value = true;
  try {
    const targetNum = num.length === 10 ? `0066${num.substring(1)}` : num;
    const qrPayload = `00020101021129370016A0000006770101110115${targetNum}53037645802TH5912DORMITORY6007BANGKOK6304`;
    const dataUrl = await QRCode.toDataURL(qrPayload, { width: 400, margin: 2 });
    form.value.paymentQrUrl = dataUrl;
  } catch (err) {
    form.value.paymentQrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=350x350&data=PromptPay_${num}`;
  } finally {
    isGeneratingQr.value = false;
  }
};

/**
 * Handle Direct File Upload for PromptPay QR Code Image
 */
const handleQrUpload = async (e) => {
  const file = e.target.files[0];
  if (!file) return;

  isUploadingQr.value = true;
  try {
    const res = await uploadService.uploadFile(file);
    if (res.fileUrl) {
      form.value.paymentQrUrl = res.fileUrl;
    }
  } catch (err) {
    errorMessage.value = 'ไม่สามารถอัปโหลดไฟล์ QR Code ได้';
  } finally {
    isUploadingQr.value = false;
  }
};

/**
 * UI Guard & Security Check
 */
const isReadOnly = computed(() => {
  const userRole = (
    authStore.currentUser?.role ||
    authStore.user?.role ||
    ''
  ).toLowerCase();

  if (userRole === 'manager' || userRole === 'tenant') {
    return true;
  }

  return false;
});

/**
 * Fetch Building Settings from API
 */
const fetchBuildingSettings = async () => {
  if (!buildingStore.activeBuildingId) return;

  isLoading.value = true;
  errorMessage.value = '';

  try {
    const res = await api.get(`/api/v1/buildings/${buildingStore.activeBuildingId}/settings`);
    const buildingData = res.data.data;
    const settingData = buildingData.setting || {};

    form.value = {
      name: buildingData.name || '',
      address: buildingData.address || '',
      phone: settingData.phone || '',
      coverImageUrl: settingData.coverImageUrl || '',
      paymentQrUrl: settingData.paymentQrUrl || '',
      promptpayNum: settingData.promptpayNum || '',
      bankName: settingData.bankName || '',
      bankAccountName: settingData.bankAccountName || '',
      bankAccountNo: settingData.bankAccountNo || '',
      paymentNote: settingData.paymentNote || '',
      waterRate: settingData.waterRate ? parseFloat(settingData.waterRate) : 18.00,
      electricRate: settingData.electricRate ? parseFloat(settingData.electricRate) : 7.00,
      dueDateDay: settingData.dueDateDay ? parseInt(settingData.dueDateDay, 10) : 5,
      latePenalty: settingData.latePenalty ? parseFloat(settingData.latePenalty) : 50.00,
      depositMonths: settingData.depositMonths ? parseInt(settingData.depositMonths, 10) : 2,
      advanceMonths: settingData.advanceMonths ? parseInt(settingData.advanceMonths, 10) : 1,
      termsAndConditions: settingData.termsAndConditions || ''
    };
  } catch (err) {
    errorMessage.value = err.response?.data?.message || 'ไม่สามารถดึงข้อมูลการตั้งค่าตึกได้';
  } finally {
    isLoading.value = false;
  }
};

/**
 * Save Settings API Call
 */
const saveSettings = async () => {
  if (isReadOnly.value) return;

  isSaving.value = true;
  successMessage.value = '';
  errorMessage.value = '';

  try {
    await api.put(
      `/api/v1/buildings/${buildingStore.activeBuildingId}/settings`,
      form.value
    );

    successMessage.value = 'บันทึกข้อมูลการตั้งค่าตึกสำเร็จเรียบร้อยแล้ว!';
    await buildingStore.fetchBuildings();

    setTimeout(() => {
      successMessage.value = '';
    }, 4000);
  } catch (err) {
    errorMessage.value = err.response?.data?.message || 'เกิดข้อผิดพลาดในการบันทึกข้อมูล';
  } finally {
    isSaving.value = false;
  }
};

onMounted(() => {
  if (buildingStore.buildings.length === 0) {
    buildingStore.fetchBuildings().then(() => {
      fetchBuildingSettings();
    });
  } else {
    fetchBuildingSettings();
  }
});

watch(
  () => buildingStore.activeBuildingId,
  () => {
    fetchBuildingSettings();
  }
);
</script>
