<template>
  <div class="space-y-6 font-sans">
    <!-- Header -->
    <div>
      <h1 class="text-lg font-bold text-slate-900 tracking-tight flex items-center gap-2">
        <Car class="w-5 h-5 text-primary" />
        <span>จัดการยานพาหนะ/ผู้มาเยือน</span>
      </h1>
      <p class="text-xs text-slate-500 mt-0.5">อนุมัติ/ปฏิเสธทะเบียนรถของลูกบ้าน และดูรายชื่อแขกที่แจ้งล่วงหน้า</p>
    </div>

    <Tabs v-model="activeTab">
      <TabsList>
        <TabsTrigger value="vehicles">ทะเบียนรถ ({{ vehicles.length }})</TabsTrigger>
        <TabsTrigger value="visitors">แขก/ผู้มาเยือน ({{ visitors.length }})</TabsTrigger>
      </TabsList>

      <TabsContent value="vehicles">
        <Card class="p-0 overflow-hidden">
          <div class="overflow-x-auto">
            <table class="w-full text-left text-sm text-slate-700">
              <thead class="bg-slate-50 text-xs text-slate-500 uppercase tracking-wider border-b border-slate-200 font-bold">
                <tr>
                  <th class="p-3.5">ทะเบียน</th>
                  <th class="p-3.5">เจ้าของ</th>
                  <th class="p-3.5">ประเภท/ยี่ห้อ</th>
                  <th class="p-3.5">สถานะ</th>
                  <th class="p-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-100">
                <tr v-for="v in vehicles" :key="v.id" class="hover:bg-slate-50/60 transition-colors">
                  <td class="p-3.5 font-bold text-slate-900 font-mono">{{ v.licensePlate }}</td>
                  <td class="p-3.5 text-xs text-slate-600">{{ v.tenant ? `${v.tenant.firstName} ${v.tenant.lastName}` : '-' }}</td>
                  <td class="p-3.5 text-xs text-slate-600">{{ v.vehicleType === 'car' ? 'รถยนต์' : 'มอเตอร์ไซค์' }} {{ v.brand ? `(${v.brand})` : '' }}</td>
                  <td class="p-3.5">
                    <Badge
                      :variant="{ PENDING: 'warning', APPROVED: 'success', REJECTED: 'danger' }[v.status]"
                    >
                      {{ { PENDING: 'รออนุมัติ', APPROVED: 'อนุมัติแล้ว', REJECTED: 'ปฏิเสธ' }[v.status] }}
                    </Badge>
                  </td>
                  <td class="p-3.5 text-right space-x-1.5">
                    <template v-if="v.status === 'PENDING'">
                      <Button size="sm" class="bg-emerald-600 hover:bg-emerald-600/90" @click="handleApprove(v.id)">
                        <CheckCircle2 class="w-3.5 h-3.5" />
                        <span>อนุมัติ</span>
                      </Button>
                      <Button variant="outline" size="sm" class="text-rose-700 border-rose-200 hover:bg-rose-50" @click="handleReject(v.id)">
                        <X class="w-3.5 h-3.5" />
                        <span>ปฏิเสธ</span>
                      </Button>
                    </template>
                  </td>
                </tr>
                <tr v-if="vehicles.length === 0">
                  <td colspan="5" class="p-8 text-center text-slate-400 text-xs">ยังไม่มีรายการทะเบียนรถ</td>
                </tr>
              </tbody>
            </table>
          </div>
        </Card>
      </TabsContent>

      <TabsContent value="visitors">
        <Card class="p-0 overflow-hidden">
          <div class="overflow-x-auto">
            <table class="w-full text-left text-sm text-slate-700">
              <thead class="bg-slate-50 text-xs text-slate-500 uppercase tracking-wider border-b border-slate-200 font-bold">
                <tr>
                  <th class="p-3.5">ชื่อแขก</th>
                  <th class="p-3.5">ผู้แจ้ง</th>
                  <th class="p-3.5">ทะเบียนรถ</th>
                  <th class="p-3.5">วันที่คาดว่าจะมา</th>
                  <th class="p-3.5">สถานะ</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-100">
                <tr v-for="v in visitors" :key="v.id" class="hover:bg-slate-50/60 transition-colors">
                  <td class="p-3.5 font-bold text-slate-900">{{ v.visitorName }}</td>
                  <td class="p-3.5 text-xs text-slate-600">{{ v.tenant ? `${v.tenant.firstName} ${v.tenant.lastName}` : '-' }}</td>
                  <td class="p-3.5 text-xs text-slate-600 font-mono">{{ v.licensePlate || '-' }}</td>
                  <td class="p-3.5 text-xs text-slate-500 font-mono">{{ formatShortDate(v.expectedDate) }}</td>
                  <td class="p-3.5">
                    <Badge :variant="v.status === 'EXPECTED' ? 'warning' : 'neutral'">
                      {{ v.status === 'EXPECTED' ? 'รอมาตามนัด' : 'ยกเลิกแล้ว' }}
                    </Badge>
                  </td>
                </tr>
                <tr v-if="visitors.length === 0">
                  <td colspan="5" class="p-8 text-center text-slate-400 text-xs">ยังไม่มีการแจ้งแขก</td>
                </tr>
              </tbody>
            </table>
          </div>
        </Card>
      </TabsContent>
    </Tabs>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { useBuildingStore } from '@/stores/useBuildingStore';
import { showSuccess, showError, showConfirm } from '@/utils/swal';
import { formatShortDate } from '@/utils/formatters';
import api from '@/utils/api';
import { Car, CheckCircle2, X } from 'lucide-vue-next';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

const buildingStore = useBuildingStore();

const activeTab = ref('vehicles');
const vehicles = ref([]);
const visitors = ref([]);

const loadData = () => {
  const bId = buildingStore.activeBuildingId || buildingStore.buildings[0]?.id;
  if (!bId) return;
  fetchVehicles(bId);
  fetchVisitors(bId);
};

onMounted(loadData);
watch(() => buildingStore.activeBuildingId, loadData);

const fetchVehicles = async (bId) => {
  try {
    const res = await api.get(`/api/admin/buildings/${bId}/vehicles`);
    vehicles.value = res.data.data;
  } catch (error) {
    console.error('Failed to fetch vehicles:', error);
  }
};

const fetchVisitors = async (bId) => {
  try {
    const res = await api.get(`/api/admin/buildings/${bId}/visitors`);
    visitors.value = res.data.data;
  } catch (error) {
    console.error('Failed to fetch visitors:', error);
  }
};

const handleApprove = async (id) => {
  try {
    await api.patch(`/api/admin/vehicles/${id}/approve`);
    showSuccess('สำเร็จ', 'อนุมัติทะเบียนรถเรียบร้อย');
    loadData();
  } catch (error) {
    showError('เกิดข้อผิดพลาด', error.response?.data?.message || 'ไม่สามารถอนุมัติได้');
  }
};

const handleReject = async (id) => {
  const confirmed = await showConfirm('ยืนยันปฏิเสธ', 'ต้องการปฏิเสธทะเบียนรถนี้ใช่หรือไม่?');
  if (!confirmed) return;
  try {
    await api.patch(`/api/admin/vehicles/${id}/reject`);
    showSuccess('สำเร็จ', 'ปฏิเสธทะเบียนรถเรียบร้อย');
    loadData();
  } catch (error) {
    showError('เกิดข้อผิดพลาด', error.response?.data?.message || 'ไม่สามารถปฏิเสธได้');
  }
};

</script>
