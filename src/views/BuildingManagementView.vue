<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2"><Building2 class="w-6 h-6 text-cyan-600" /><span>บริหารจัดการตึก / อาคาร (Building Management)</span></h1>
        <p class="text-sm text-slate-500">จัดการข้อมูลตึก/สาขา ธีมสี โลโก้ LIFF และตั้งค่า PromptPay QR Code ชำระเงินแยกตามตึก</p>
      </div>

      <Button @click="showCreateModal = true">
        <span>เพิ่มตึกใหม่ (Add Building)</span>
      </Button>
    </div>

    <!-- Building Cards Grid -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
      <Card
        v-for="b in buildingStore.buildings"
        :key="b.id"
        class="p-5 space-y-4 transition-all hover:shadow-md relative overflow-hidden"
        :class="b.id === buildingStore.activeBuildingId ? 'border-cyan-500 ring-2 ring-cyan-500/20' : ''"
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
              @error="b.logoUrl = ''"
            />
            <div
              v-else
              class="w-10 h-10 rounded-xl flex items-center justify-center text-white text-base font-bold shadow-2xs shrink-0"
              :style="{ backgroundColor: b.themeColor || '#0E7490' }"
            >
              <Building2 class="w-5 h-5" />
            </div>
            <div>
              <h3 class="font-bold text-slate-900 text-base">{{ b.name }}</h3>
              <p class="text-xs text-slate-500 mt-0.5">{{ b.address || 'ไม่ได้ระบุที่อยู่' }}</p>
            </div>
          </div>

          <Badge v-if="b.id === buildingStore.activeBuildingId" variant="success" class="shrink-0">ACTIVE</Badge>
        </div>

        <!-- Room count & LIFF theme info -->
        <div class="grid grid-cols-2 gap-2">
          <div class="p-2.5 bg-slate-50 rounded-xl text-xs flex flex-col justify-between text-slate-600">
            <span class="text-xs text-slate-400 font-bold uppercase">จำนวนห้องพัก:</span>
            <span class="font-bold text-slate-900 font-mono mt-0.5">{{ b._count?.rooms || 0 }} ห้อง</span>
          </div>
          <div class="p-2.5 bg-slate-50 rounded-xl text-xs flex flex-col justify-between text-slate-600">
            <span class="text-xs text-slate-400 font-bold uppercase">ธีมสี LIFF:</span>
            <div class="flex items-center gap-1.5 mt-0.5">
              <span class="w-3 h-3 rounded-full border border-slate-300" :style="{ backgroundColor: b.themeColor || '#0E7490' }"></span>
              <span class="font-mono font-bold text-slate-900 text-xs">{{ b.themeColor || '#0E7490' }}</span>
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
          <Button
            variant="secondary"
            size="sm"
            class="flex-1"
            :class="{ 'opacity-50 pointer-events-none': b.id === buildingStore.activeBuildingId }"
            @click="buildingStore.setActiveBuildingId(b.id)"
          >
            {{ b.id === buildingStore.activeBuildingId ? 'กำลังใช้งานตึกนี้' : 'สลับมาตึกนี้' }}
          </Button>

          <Button variant="outline" size="sm" @click="openEditSettingModal(b)">
            แก้ไขธีม & QR
          </Button>

          <Button
            variant="outline"
            size="sm"
            class="text-rose-600 hover:text-rose-700 border-rose-200 hover:bg-rose-50"
            title="ลบอาคาร"
            @click="handleDeleteBuilding(b)"
          >
            <Trash2 class="w-3.5 h-3.5" />
            <span>ลบตึก</span>
          </Button>
        </div>
      </Card>
    </div>

    <!-- Create / Edit Building Dialog (shared) -->
    <BuildingFormDialog
      :open="showCreateModal"
      mode="create"
      @update:open="showCreateModal = $event"
      @saved="buildingStore.fetchBuildings()"
    />

    <BuildingFormDialog
      :open="showEditModal"
      mode="edit"
      :building="selectedBuilding"
      @update:open="showEditModal = $event"
      @saved="buildingStore.fetchBuildings()"
      @delete="handleDeleteBuilding(selectedBuilding); showEditModal = false"
    />
  </div>
</template>

<script setup>
import { Building2, Trash2 } from 'lucide-vue-next';
import { ref, onMounted } from 'vue';
import { useBuildingStore } from '@/stores/useBuildingStore';
import { showSuccess, showError, showConfirm } from '@/utils/swal';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import BuildingFormDialog from '@/components/BuildingFormDialog.vue';

const buildingStore = useBuildingStore();

const showCreateModal = ref(false);
const showEditModal = ref(false);
const submitting = ref(false);
const selectedBuilding = ref(null);

onMounted(() => {
  buildingStore.fetchBuildings();
});

const openEditSettingModal = (b) => {
  selectedBuilding.value = b;
  showEditModal.value = true;
};

const handleDeleteBuilding = async (b) => {
  if (!b) return;

  // ป้องกันการลบหากยังมีห้องพัก (แสดงเตือนล่วงหน้าได้ทันที)
  if (b._count?.rooms > 0) {
    showError(
      'ไม่สามารถลบอาคารได้',
      `อาคาร "${b.name}" ยังมีห้องพักผูกอยู่ ${b._count.rooms} ห้อง กรุณาย้ายหรือลบห้องพักทั้งหมดออกก่อนทำการลบอาคาร`
    );
    return;
  }

  // ป้องกันการลบหากเหลือตึกเดียว
  if (buildingStore.buildings.length <= 1) {
    showError(
      'ไม่สามารถลบอาคารได้',
      'ระบบต้องมีอาคารอย่างน้อย 1 อาคาร ไม่สามารถลบอาคารสุดท้ายได้'
    );
    return;
  }

  const confirmed = await showConfirm(
    `ยืนยันการลบ ${b.name}?`,
    'การดำเนินการนี้จะลบข้อมูลอาคารและการตั้งค่าที่เกี่ยวข้องทั้งหมดออกจากระบบ และไม่สามารถย้อนกลับได้',
    'ลบอาคาร',
    'ยกเลิก'
  );

  if (!confirmed) return;

  submitting.value = true;
  try {
    const res = await buildingStore.deleteBuilding(b.id);
    await showSuccess('สำเร็จ!', res?.message || `ลบอาคาร ${b.name} เรียบร้อยแล้ว`);
  } catch (error) {
    showError(
      'เกิดข้อผิดพลาดในการลบอาคาร',
      error.response?.data?.message || 'ไม่สามารถลบอาคารได้ กรุณาลองใหม่อีกครั้ง'
    );
  } finally {
    submitting.value = false;
  }
};
</script>
