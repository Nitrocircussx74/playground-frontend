<template>
  <div v-if="show" class="fixed inset-0 z-50 bg-slate-950/40 backdrop-blur-xs flex items-center justify-center p-4">
    <div class="bg-white rounded-3xl p-6 max-w-lg w-full shadow-2xl space-y-5 border border-slate-200">
      <!-- Modal Header -->
      <div class="flex items-center justify-between border-b border-slate-100 pb-4">
        <div>
          <h3 class="text-lg font-bold text-slate-900">🔑 รหัสเชิญลงทะเบียนห้อง {{ room?.roomNumber }}</h3>
          <p class="text-xs text-slate-500">จัดการและสร้าง Invite Code สำหรับผูกผู้เช่าใหม่ผ่าน LINE</p>
        </div>
        <button @click="$emit('close')" class="text-slate-400 hover:text-slate-600 font-bold p-1">✕</button>
      </div>

      <!-- Action Button: Generate New Invite Code -->
      <div class="bg-slate-50 p-4 rounded-2xl border border-slate-200/80 flex items-center justify-between">
        <div>
          <div class="text-xs font-semibold text-slate-700">สร้าง Invite Code ใหม่ (อายุ 48 ชม.)</div>
          <div class="text-[11px] text-slate-400">สำหรับส่งให้ผู้เช่าสแกนลงทะเบียนผ่าน LINE</div>
        </div>

        <button
          @click="handleGenerateInvite"
          :disabled="generating"
          class="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs disabled:opacity-50"
        >
          {{ generating ? 'กำลังสร้าง...' : '⚡ สร้างรหัสเชิญ' }}
        </button>
      </div>

      <!-- Newly Generated Code Alert Box -->
      <div v-if="newlyGenerated" class="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl space-y-2">
        <div class="flex items-center justify-between text-xs text-emerald-800 font-semibold">
          <span>🎉 สร้างรหัสเชิญสำเร็จแล้ว!</span>
          <span class="font-mono">หมดอายุใน 48 ชม.</span>
        </div>

        <div class="flex items-center gap-2">
          <div class="text-2xl font-extrabold font-mono text-emerald-700 tracking-wider bg-white px-4 py-1.5 rounded-xl border border-emerald-200 flex-1 text-center">
            {{ newlyGenerated.code }}
          </div>

          <button
            @click="copyToClipboard(newlyGenerated.code, 'code')"
            class="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all shadow-2xs"
          >
            {{ copiedType === 'code' ? '✓ คัดลอกแล้ว' : '📋 คัดลอกรหัส' }}
          </button>

          <button
            @click="copyToClipboard(getShareUrl(newlyGenerated.code), 'link')"
            class="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-all shadow-2xs"
          >
            {{ copiedType === 'link' ? '✓ คัดลอกลิงก์แล้ว' : '🔗 คัดลอกลิงก์ LINE' }}
          </button>
        </div>
      </div>

      <!-- Active / History Invites Table -->
      <div class="space-y-2">
        <h4 class="text-xs font-bold text-slate-700 uppercase tracking-wider">ประวัติรหัสเชิญของห้องนี้</h4>

        <div v-if="loading" class="p-4 text-center text-xs text-slate-400">กำลังโหลดรายการรหัสเชิญ...</div>

        <div v-else-if="invites.length === 0" class="p-4 text-center text-xs text-slate-400 bg-slate-50 rounded-2xl border border-slate-100">
          ยังไม่มีรหัสเชิญสำหรับห้องนี้ กดปุ่มสร้างรหัสเชิญด้านบน
        </div>

        <div v-else class="max-h-48 overflow-y-auto rounded-2xl border border-slate-200 divide-y divide-slate-100">
          <div v-for="inv in invites" :key="inv.id" class="p-3 flex items-center justify-between text-xs hover:bg-slate-50/60">
            <div class="space-y-0.5">
              <div class="flex items-center gap-2">
                <span class="font-mono font-bold text-slate-900 text-sm">{{ inv.code }}</span>
                <span
                  class="text-[10px] px-2 py-0.5 rounded-full font-semibold"
                  :class="{
                    'bg-emerald-100 text-emerald-800': !inv.isUsed && new Date(inv.expiresAt) > new Date(),
                    'bg-slate-100 text-slate-600': inv.isUsed,
                    'bg-rose-100 text-rose-700': !inv.isUsed && new Date(inv.expiresAt) <= new Date()
                  }"
                >
                  {{ inv.isUsed ? 'ใช้งานแล้ว' : (new Date(inv.expiresAt) > new Date() ? 'ยังไม่ใช้งาน' : 'หมดอายุ') }}
                </span>
              </div>
              <div class="text-[11px] text-slate-400">
                สร้างเมื่อ: {{ new Date(inv.createdAt).toLocaleString('th-TH') }} | หมดอายุ: {{ new Date(inv.expiresAt).toLocaleString('th-TH') }}
              </div>
            </div>

            <div class="flex items-center gap-1.5">
              <button
                v-if="!inv.isUsed && new Date(inv.expiresAt) > new Date()"
                @click="copyToClipboard(getShareUrl(inv.code), inv.id)"
                class="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-[11px] font-medium transition-all"
              >
                {{ copiedType === inv.id ? '✓ คัดลอกแล้ว' : '🔗 ลิงก์' }}
              </button>

              <button
                @click="handleRevokeInvite(inv.id)"
                class="px-2.5 py-1 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-lg text-[11px] font-medium transition-all"
              >
                ยกเลิก
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Modal Footer -->
      <div class="pt-2">
        <button
          @click="$emit('close')"
          class="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition-all"
        >
          ปิดหน้าต่าง (Close)
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue';
import api from '@/utils/api';
import { showError, showConfirm, showToast } from '@/utils/swal';

const props = defineProps({
  show: Boolean,
  room: Object
});

const emit = defineEmits(['close']);

const invites = ref([]);
const loading = ref(false);
const generating = ref(false);
const newlyGenerated = ref(null);
const copiedType = ref('');

watch(
  () => props.show,
  (newVal) => {
    if (newVal && props.room?.id) {
      fetchInvites();
      newlyGenerated.value = null;
    }
  }
);

const fetchInvites = async () => {
  if (!props.room?.id) return;
  loading.value = true;
  try {
    const res = await api.get(`/api/v1/rooms/${props.room.id}/invites`);
    invites.value = res.data.data || [];
  } catch (error) {
    console.error('Failed to fetch invites:', error);
  } finally {
    loading.value = false;
  }
};

const handleGenerateInvite = async () => {
  if (!props.room?.id) return;
  generating.value = true;
  try {
    const res = await api.post(`/api/v1/rooms/${props.room.id}/invites`);
    newlyGenerated.value = res.data.data;
    showToast('สร้างรหัสเชิญสำเร็จ!');
    await fetchInvites();
  } catch (error) {
    showError('เกิดข้อผิดพลาด', error.response?.data?.message || 'Failed to generate invite code');
  } finally {
    generating.value = false;
  }
};

const handleRevokeInvite = async (inviteId) => {
  const confirmed = await showConfirm('ยกเลิกรหัสเชิญ', 'คุณต้องการยกเลิกรหัสเชิญนี้ใช่หรือไม่?');
  if (!confirmed) return;
  try {
    await api.delete(`/api/v1/rooms/invites/${inviteId}`);
    showToast('ยกเลิกรหัสเชิญเรียบร้อยแล้ว');
    await fetchInvites();
  } catch (error) {
    showError('เกิดข้อผิดพลาด', error.response?.data?.message || 'Failed to revoke invite');
  }
};

const getShareUrl = (code) => {
  return `${window.location.origin}/liff/register?inviteCode=${code}`;
};

const copyToClipboard = (text, type) => {
  navigator.clipboard.writeText(text);
  copiedType.value = type;
  setTimeout(() => {
    copiedType.value = '';
  }, 2000);
};
</script>
