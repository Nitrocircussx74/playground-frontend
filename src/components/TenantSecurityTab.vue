<template>
  <div class="space-y-6">
    <!-- ========================================================================= -->
    <!-- 1. Section 1: สถานะช่องทางการเข้าใช้งานและความปลอดภัย (Access Channels & Security Status) -->
    <!-- ========================================================================= -->
    <div class="bg-white p-6 rounded-3xl border border-slate-200/90 shadow-2xs space-y-5">
      <div class="flex items-center justify-between border-b border-slate-100 pb-4">
        <div>
          <h3 class="text-base font-bold text-slate-900 flex items-center gap-2">
            <span>🛡️</span>
            <span>สถานะช่องทางการเข้าใช้งานและความปลอดภัย (Access Channels & Security Status)</span>
          </h3>
          <p class="text-xs text-slate-500">
            ภาพรวมการเชื่อมต่อ LINE LIFF, การเข้าใช้งานผ่าน Web Portal (เบอร์ + PIN 6 หลัก) และประวัติความปลอดภัย
          </p>
        </div>
      </div>

      <!-- 3-Column Grid Status Cards -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <!-- Card 1: ช่องทาง LINE Integration (LINE In-App LIFF) -->
        <div
          class="p-4 rounded-2xl border transition-all space-y-3"
          :class="isLineLinked ? 'bg-emerald-50/50 border-emerald-200/90' : 'bg-amber-50/50 border-amber-200/90'"
        >
          <div class="flex items-center justify-between">
            <span class="text-xs font-bold text-slate-600 flex items-center gap-1.5">
              <span>💬</span>
              <span>ช่องทาง LINE LIFF</span>
            </span>
            <span
              class="px-2.5 py-0.5 rounded-full text-[11px] font-extrabold flex items-center gap-1 shadow-2xs"
              :class="isLineLinked ? 'bg-[#06C755] text-white' : 'bg-amber-500 text-white'"
            >
              <span class="w-1.5 h-1.5 rounded-full bg-white" :class="{ 'animate-pulse': isLineLinked }"></span>
              {{ isLineLinked ? 'เชื่อมต่อแล้ว' : 'รอการเชื่อมต่อ' }}
            </span>
          </div>

          <div v-if="isLineLinked" class="space-y-2 pt-1">
            <div class="flex items-center gap-3">
              <img
                v-if="localTenant.linePictureUrl"
                :src="localTenant.linePictureUrl"
                :alt="localTenant.lineDisplayName || 'LINE User'"
                class="w-11 h-11 rounded-xl object-cover border-2 border-emerald-400 shadow-2xs shrink-0"
              />
              <div
                v-else
                class="w-11 h-11 rounded-xl bg-emerald-600 text-white font-black text-lg flex items-center justify-center shrink-0 shadow-2xs"
              >
                {{ (localTenant.lineDisplayName || localTenant.firstName || 'L').charAt(0).toUpperCase() }}
              </div>
              <div class="min-w-0 flex-1">
                <div class="font-bold text-xs text-slate-900 truncate">
                  {{ localTenant.lineDisplayName || 'ไม่ระบุชื่อ LINE' }}
                </div>
                <div class="text-[10px] font-mono text-slate-400 truncate" :title="localTenant.lineUserId">
                  UID: {{ localTenant.lineUserId }}
                </div>
              </div>
            </div>

            <!-- Multi-building LINE Links if any -->
            <div v-if="localTenant.lineAccounts && localTenant.lineAccounts.length > 1" class="text-[10px] text-emerald-800 bg-emerald-100/60 p-1.5 rounded-lg">
              ผูกกับ LINE OA ทั้งหมด {{ localTenant.lineAccounts.length }} อาคาร
            </div>
          </div>

          <div v-else class="space-y-1 pt-1">
            <p class="text-xs font-semibold text-amber-900">ยังไม่ผูกบัญชี LINE OA</p>
            <p class="text-[11px] text-amber-700/90 leading-relaxed">
              ลูกบ้านยังไม่เคยเปิด LIFF หรือลงทะเบียนแบบ Walk-in สามารถสร้าง Invite Code ให้ลูกบ้านสแกนผูกได้
            </p>
          </div>
        </div>

        <!-- Card 2: ช่องทาง Web Portal Access (Dual-Mode Phone + PIN) -->
        <div
          class="p-4 rounded-2xl border transition-all space-y-3"
          :class="hasPin ? 'bg-teal-50/50 border-teal-200/90' : 'bg-slate-50 border-slate-200/90'"
        >
          <div class="flex items-center justify-between">
            <span class="text-xs font-bold text-slate-600 flex items-center gap-1.5">
              <span>🌐</span>
              <span>ช่องทาง Web Portal</span>
            </span>
            <span
              class="px-2.5 py-0.5 rounded-full text-[11px] font-extrabold flex items-center gap-1 shadow-2xs"
              :class="hasPin ? 'bg-teal-600 text-white' : 'bg-slate-300 text-slate-700'"
            >
              {{ hasPin ? 'พร้อมใช้งาน' : 'ยังไม่ตั้ง PIN' }}
            </span>
          </div>

          <div class="space-y-2 pt-1">
            <div class="flex items-center justify-between text-xs">
              <span class="text-slate-500">Username (เบอร์):</span>
              <span class="font-mono font-bold text-slate-800">{{ localTenant.phone || 'ยังไม่มีเบอร์' }}</span>
            </div>

            <div class="flex items-center justify-between text-xs">
              <span class="text-slate-500">รหัส PIN 6 หลัก:</span>
              <span v-if="hasPin" class="font-mono font-black tracking-widest text-teal-700">•••••• (ตั้งแล้ว)</span>
              <span v-else class="text-slate-400 font-medium">ยังไม่ตั้ง</span>
            </div>

            <p class="text-[11px] text-slate-500 leading-relaxed">
              {{ hasPin ? 'เข้าสู่ระบบผ่านเว็บเบราว์เซอร์ด้วย เบอร์โทร + PIN 6 หลัก ได้ทันที' : 'ลูกบ้านจะถูกแจ้งให้ตั้ง PIN 6 หลักเมื่อเปิดใช้งานระบบครั้งแรก' }}
            </p>
          </div>
        </div>

        <!-- Card 3: สรุปความพร้อมการเข้าถึงและกิจกรรมล่าสุด (Access Overview & Last Activity) -->
        <div class="p-4 rounded-2xl border bg-slate-50 border-slate-200/90 space-y-3">
          <div class="flex items-center justify-between">
            <span class="text-xs font-bold text-slate-600 flex items-center gap-1.5">
              <span>🕒</span>
              <span>กิจกรรมและการเข้าถึงล่าสุด</span>
            </span>
            <span
              class="px-2 py-0.5 rounded-full text-[10px] font-bold"
              :class="isLineLinked && hasPin ? 'bg-emerald-100 text-emerald-800' : isLineLinked || hasPin ? 'bg-teal-100 text-teal-800' : 'bg-amber-100 text-amber-800'"
            >
              {{ isLineLinked && hasPin ? 'ครบ 2 ช่องทาง' : isLineLinked ? 'LINE LIFF' : hasPin ? 'Web Portal' : 'Walk-in' }}
            </span>
          </div>

          <div class="space-y-1.5 pt-1">
            <div class="text-sm font-extrabold text-slate-900 font-mono">
              {{ formatDateTime(localTenant.updatedAt || localTenant.createdAt) }}
            </div>
            <p class="text-[11px] text-slate-500 leading-relaxed">
              บันทึกกิจกรรมล่าสุดในระบบ: 
              <span v-if="isLineLinked && hasPin" class="text-emerald-700 font-medium">พร้อมใช้งานทั้ง LINE และ Web</span>
              <span v-else-if="isLineLinked" class="text-emerald-700 font-medium">เชื่อมต่อผ่าน LINE แล้ว</span>
              <span v-else-if="hasPin" class="text-teal-700 font-medium">พร้อมใช้ Web Portal</span>
              <span v-else class="text-amber-700 font-medium">รอการเปิดใช้งานครั้งแรก</span>
            </p>
          </div>
        </div>
      </div>
    </div>

    <!-- ========================================================================= -->
    <!-- 2. Section 2: การจัดการความปลอดภัย (Security Actions)                     -->
    <!-- ========================================================================= -->
    <div class="bg-white p-6 rounded-3xl border border-slate-200/90 shadow-2xs space-y-5">
      <div class="flex items-center justify-between border-b border-slate-100 pb-4">
        <div>
          <h3 class="text-base font-bold text-slate-900 flex items-center gap-2">
            <span>⚙️</span>
            <span>การจัดการความปลอดภัย (Security Actions & Assistance)</span>
          </h3>
          <p class="text-xs text-slate-500">
            เครื่องมือสำหรับแอดมินช่วยเหลือลูกบ้านกรณีลืมรหัส PIN, เปลี่ยนเครื่องใหม่ หรือมือถือสูญหาย
          </p>
        </div>
      </div>

      <!-- Action Items Grid -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <!-- Action 1: รีเซ็ตรหัส PIN (สีส้ม) -->
        <div class="p-5 rounded-2xl border border-amber-200/80 bg-amber-50/40 flex flex-col justify-between space-y-4">
          <div class="space-y-2">
            <div class="flex items-center gap-2.5">
              <div class="w-9 h-9 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center font-bold text-lg shadow-2xs">
                🔑
              </div>
              <div>
                <h4 class="text-xs font-bold text-slate-900">รีเซ็ตรหัส PIN</h4>
                <span class="text-[10px] text-amber-700 font-medium">กรณีลูกบ้านลืมรหัส 6 หลัก</span>
              </div>
            </div>
            <p class="text-[11px] text-slate-600 leading-relaxed">
              ล้างรหัส PIN เดิมทิ้งทันที ลูกบ้านจะถูกบังคับให้ตั้งรหัส PIN 6 หลักใหม่อัตโนมัติเมื่อเปิดแอป LINE LIFF
            </p>
          </div>

          <button
            type="button"
            :disabled="!hasPin || actionLoading"
            @click="handleResetPin"
            class="w-full py-2.5 px-4 bg-amber-500 hover:bg-amber-600 active:bg-amber-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <KeyRound class="w-4 h-4" />
            <span>{{ hasPin ? 'รีเซ็ตรหัส PIN' : 'ยังไม่ได้ตั้ง PIN' }}</span>
          </button>
        </div>

        <!-- Action 2: ยกเลิกการผูกบัญชี LINE (สีแดง) -->
        <div class="p-5 rounded-2xl border border-rose-200/80 bg-rose-50/40 flex flex-col justify-between space-y-4">
          <div class="space-y-2">
            <div class="flex items-center gap-2.5">
              <div class="w-9 h-9 rounded-xl bg-rose-100 text-rose-700 flex items-center justify-center font-bold text-lg shadow-2xs">
                🚫
              </div>
              <div>
                <h4 class="text-xs font-bold text-slate-900">ยกเลิกการผูกบัญชี LINE</h4>
                <span class="text-[10px] text-rose-600 font-medium">กรณีโทรศัพท์หาย / ถูกขโมย</span>
              </div>
            </div>
            <p class="text-[11px] text-slate-600 leading-relaxed">
              เตะออกจากระบบ LINE ทันที และล้างค่ารหัส PIN ทั้งหมดเพื่อความปลอดภัย ป้องกันผู้อื่นแอบอ้างใช้งาน
            </p>
          </div>

          <button
            type="button"
            :disabled="!isLineLinked || actionLoading"
            @click="handleUnlinkLine"
            class="w-full py-2.5 px-4 bg-rose-600 hover:bg-rose-700 active:bg-rose-800 text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <Unlink class="w-4 h-4" />
            <span>{{ isLineLinked ? 'ยกเลิกการผูกบัญชี LINE' : 'ไม่ได้ผูกบัญชีไว้' }}</span>
          </button>
        </div>

        <!-- Action 3: สร้างรหัสเชิญใหม่ (สีฟ้า) -->
        <div class="p-5 rounded-2xl border border-sky-200/80 bg-sky-50/40 flex flex-col justify-between space-y-4">
          <div class="space-y-2">
            <div class="flex items-center gap-2.5">
              <div class="w-9 h-9 rounded-xl bg-sky-100 text-sky-700 flex items-center justify-center font-bold text-lg shadow-2xs">
                📲
              </div>
              <div>
                <h4 class="text-xs font-bold text-slate-900">สร้างรหัสเชิญใหม่</h4>
                <span class="text-[10px] text-sky-700 font-medium">สำหรับผูกบัญชี LINE ใหม่อีกครั้ง</span>
              </div>
            </div>
            <p class="text-[11px] text-slate-600 leading-relaxed">
              สร้างรหัส Invite Code 6 หลัก (อายุ 7 วัน) ส่งให้ลูกบ้านนำไปผูกบัญชี LINE ใหม่ได้สะดวก
            </p>
          </div>

          <button
            type="button"
            :disabled="actionLoading"
            @click="handleGenerateInvite"
            class="w-full py-2.5 px-4 bg-sky-600 hover:bg-sky-700 active:bg-sky-800 text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            <QrCode class="w-4 h-4" />
            <span>สร้างรหัสเชิญใหม่ (Invite Code)</span>
          </button>
        </div>
      </div>
    </div>

    <!-- ========================================================================= -->
    <!-- 3. Modal Popup: แสดงรหัสเชิญใหม่ 6 หลักตัวใหญ่ๆ พร้อมปุ่ม Copy            -->
    <!-- ========================================================================= -->
    <div
      v-if="showInviteModal"
      class="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 select-none"
    >
      <div class="bg-white rounded-3xl p-6 sm:p-8 max-w-sm w-full shadow-2xl space-y-5 border border-slate-200 text-center relative animate-scale-up">
        <button
          @click="showInviteModal = false"
          class="absolute top-4 right-4 text-slate-400 hover:text-slate-700 p-1.5 rounded-full hover:bg-slate-100 transition-colors cursor-pointer"
        >
          <X class="w-5 h-5" />
        </button>

        <div class="space-y-1.5 pt-2">
          <div class="w-14 h-14 rounded-2xl bg-sky-100 text-sky-600 flex items-center justify-center mx-auto text-2xl font-bold shadow-2xs">
            🔑
          </div>
          <h3 class="text-lg font-black text-slate-900 tracking-tight">รหัสเชิญเชื่อมต่อ LINE</h3>
          <p class="text-xs text-slate-500">
            ผู้เช่า: <span class="font-bold text-slate-800">{{ localTenant.firstName }} {{ localTenant.lastName }}</span>
          </p>
        </div>

        <!-- Large 6-Character Invite Code Box -->
        <div class="bg-slate-50 p-5 rounded-2xl border-2 border-dashed border-sky-300 space-y-2">
          <div class="text-[11px] font-extrabold text-slate-500 uppercase tracking-wider">
            รหัสเชิญ 6 หลัก (Invite Code)
          </div>
          <div class="text-3xl sm:text-4xl font-black font-mono tracking-widest text-sky-600 select-all">
            {{ newInviteCode }}
          </div>
          <div class="text-[11px] text-slate-400">
            ใช้คู่กับเบอร์โทรศัพท์ 4 ตัวท้าย: <span class="font-mono font-bold text-slate-700">{{ (localTenant.phone || '').slice(-4) }}</span>
          </div>
        </div>

        <!-- QR Code Preview if generated -->
        <div v-if="inviteQrUrl" class="space-y-2 py-1">
          <img :src="inviteQrUrl" alt="Invite QR" class="w-44 h-44 mx-auto rounded-2xl border border-slate-200 shadow-xs" />
          <div class="text-[11px] text-slate-400">หรือให้ลูกบ้านสแกน QR Code นี้ผ่าน LINE</div>
        </div>

        <!-- Action Buttons -->
        <div class="flex gap-2.5 pt-1">
          <button
            type="button"
            @click="copyInviteCode"
            class="flex-1 py-3 bg-sky-600 hover:bg-sky-700 active:bg-sky-800 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-sky-600/30 flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <Copy class="w-4 h-4" />
            <span>{{ isCopied ? 'คัดลอกสำเร็จ! ✓' : 'คัดลอกรหัส' }}</span>
          </button>
          <button
            type="button"
            @click="showInviteModal = false"
            class="py-3 px-5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-all cursor-pointer"
          >
            ปิด
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue';
import tenantService from '@/services/tenantService';
import { showSuccess, showError } from '@/utils/swal';
import Swal from 'sweetalert2';
import QRCode from 'qrcode';
import { KeyRound, Unlink, QrCode, Copy, X } from 'lucide-vue-next';

const props = defineProps({
  tenant: {
    type: Object,
    required: true
  }
});

const emit = defineEmits(['updated']);

// Local reactive clone of tenant for instant UI feedback without full page refresh
const localTenant = ref({ ...props.tenant });

watch(
  () => props.tenant,
  (newVal) => {
    if (newVal) {
      localTenant.value = { ...newVal };
    }
  },
  { deep: true }
);

const actionLoading = ref(false);
const showInviteModal = ref(false);
const newInviteCode = ref('');
const inviteQrUrl = ref('');
const isCopied = ref(false);

const isLineLinked = computed(() => {
  return Boolean(localTenant.value?.lineUserId);
});

const hasPin = computed(() => {
  return Boolean(localTenant.value?.pinHash);
});

/**
 * 1. ฟังก์ชันรีเซ็ตรหัส PIN
 */
const handleResetPin = async () => {
  if (!hasPin.value) return;

  const result = await Swal.fire({
    title: 'รีเซ็ตรหัส PIN ของผู้เช่า?',
    text: 'คุณแน่ใจหรือไม่ว่าต้องการรีเซ็ต PIN ของผู้เช่ารายนี้? (ลูกบ้านจะต้องตั้งรหัส PIN 6 หลักใหม่เมื่อเปิด LIFF ครั้งถัดไป)',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonText: 'ยืนยันรีเซ็ต PIN',
    confirmButtonColor: '#f59e0b',
    cancelButtonText: 'ยกเลิก',
    reverseButtons: true
  });

  if (!result.isConfirmed) return;

  actionLoading.value = true;
  try {
    const res = await tenantService.resetTenantPin(localTenant.value.id);
    if (res.success) {
      // Instant State Update: ข้อความเปลี่ยนเป็น "ยังไม่ตั้งค่า" ทันที
      localTenant.value.pinHash = null;
      localTenant.value.updatedAt = new Date().toISOString();
      emit('updated', { ...localTenant.value });

      await showSuccess('รีเซ็ต PIN สำเร็จ', 'ระบบได้ล้างรหัส PIN เดิมเรียบร้อยแล้ว ลูกบ้านจะถูกบังคับให้ตั้งรหัสใหม่เมื่อเปิดแอป');
    } else {
      showError('ไม่สำเร็จ', res.message || 'ไม่สามารถรีเซ็ตรหัส PIN ได้');
    }
  } catch (err) {
    console.error('Reset PIN error:', err);
    showError('เกิดข้อผิดพลาด', err.response?.data?.message || 'ไม่สามารถรีเซ็ตรหัส PIN ได้');
  } finally {
    actionLoading.value = false;
  }
};

/**
 * 2. ฟังก์ชันยกเลิกการผูกบัญชี LINE (บังคับพิมพ์คำว่า CONFIRM)
 */
const handleUnlinkLine = async () => {
  if (!isLineLinked.value) return;

  const result = await Swal.fire({
    title: '⚠️ ยืนยันยกเลิกการผูกบัญชี LINE?',
    html: `
      <div class="text-left text-xs text-slate-600 space-y-2">
        <p class="text-rose-600 font-bold">คำเตือน: การดำเนินการนี้จะตัดสิทธิ์การเข้าใช้งาน LINE LIFF ของผู้เช่าทันที และล้างรหัส PIN ทั้งหมด</p>
        <p>เพื่อความปลอดภัย กรุณาพิมพ์คำว่า <b class="text-slate-900 font-mono">CONFIRM</b> ในช่องด้านล่างเพื่อยืนยัน:</p>
      </div>
    `,
    input: 'text',
    inputPlaceholder: 'พิมพ์ CONFIRM เพื่อยืนยัน',
    icon: 'error',
    showCancelButton: true,
    confirmButtonText: 'ยืนยันยกเลิกการผูกบัญชี',
    confirmButtonColor: '#e11d48',
    cancelButtonText: 'ยกเลิก',
    reverseButtons: true,
    preConfirm: (value) => {
      if (value !== 'CONFIRM') {
        Swal.showValidationMessage('กรุณาพิมพ์คำว่า CONFIRM ให้ถูกต้อง');
        return false;
      }
      return true;
    }
  });

  if (!result.isConfirmed) return;

  actionLoading.value = true;
  try {
    const res = await tenantService.unlinkTenantLine(localTenant.value.id);
    if (res.success) {
      // Instant State Update: ข้อความเปลี่ยนเป็น "รอการเชื่อมต่อ" และ "ยังไม่ตั้งค่า" ทันที
      localTenant.value.lineUserId = null;
      localTenant.value.lineDisplayName = null;
      localTenant.value.linePictureUrl = null;
      localTenant.value.pinHash = null;
      localTenant.value.updatedAt = new Date().toISOString();
      emit('updated', { ...localTenant.value });

      await showSuccess('ยกเลิกการผูกบัญชีสำเร็จ', 'ตัดการเชื่อมต่อ LINE และล้างค่าความปลอดภัยเรียบร้อยแล้ว');
    } else {
      showError('ไม่สำเร็จ', res.message || 'ไม่สามารถยกเลิกการผูกบัญชีได้');
    }
  } catch (err) {
    console.error('Unlink LINE error:', err);
    showError('เกิดข้อผิดพลาด', err.response?.data?.message || 'ไม่สามารถยกเลิกการผูกบัญชีได้');
  } finally {
    actionLoading.value = false;
  }
};

/**
 * 3. ฟังก์ชันสร้างรหัสเชิญใหม่ 6 หลัก
 */
const handleGenerateInvite = async () => {
  actionLoading.value = true;
  try {
    const res = await tenantService.generateTenantInvite(localTenant.value.id);
    if (res.success && res.data) {
      newInviteCode.value = res.data.inviteCode;
      localTenant.value.inviteCode = res.data.inviteCode;
      localTenant.value.inviteExpiresAt = res.data.inviteExpiresAt;
      emit('updated', { ...localTenant.value });

      // Generate QR Code containing LIFF Onboarding URL with prefilled code
      // ต้องใช้ https://liff.line.me/{LIFF_ID}/... (ไม่ใช่ window.location.origin) มิฉะนั้นสแกนแล้วจะเปิดเป็นเว็บปกติ
      // ไม่ใช่แอป LIFF ใน LINE — เหมือน pattern เดียวกับ router/index.js และ utils/liff.js
      const liffId = import.meta.env.VITE_LINE_LIFF_ID || import.meta.env.VITE_LIFF_ID || '';
      const liffUrl = liffId
        ? `https://liff.line.me/${liffId}/onboarding?code=${res.data.inviteCode}`
        : `${window.location.origin}/liff/onboarding?code=${res.data.inviteCode}`;
      inviteQrUrl.value = await QRCode.toDataURL(liffUrl, {
        width: 250,
        margin: 1,
        color: { dark: '#0369a1', light: '#ffffff' }
      });

      isCopied.value = false;
      showInviteModal.value = true;
    } else {
      showError('ไม่สำเร็จ', res.message || 'ไม่สามารถสร้างรหัสเชิญได้');
    }
  } catch (err) {
    console.error('Generate invite error:', err);
    showError('เกิดข้อผิดพลาด', err.response?.data?.message || 'ไม่สามารถสร้างรหัสเชิญได้');
  } finally {
    actionLoading.value = false;
  }
};

const copyInviteCode = async () => {
  if (!newInviteCode.value) return;
  try {
    await navigator.clipboard.writeText(newInviteCode.value);
    isCopied.value = true;
    setTimeout(() => {
      isCopied.value = false;
    }, 2500);
  } catch (err) {
    console.error('Copy failed:', err);
  }
};

const formatDateTime = (dateStr) => {
  if (!dateStr) return '-';
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return '-';
  return d.toLocaleString('th-TH', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  });
};
</script>

<style scoped>
@keyframes scaleUp {
  from {
    opacity: 0;
    transform: scale(0.95);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

.animate-scale-up {
  animation: scaleUp 0.15s ease-out forwards;
}
</style>
