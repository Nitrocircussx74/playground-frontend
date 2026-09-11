<template>
  <div class="space-y-6 font-sans">
    <!-- Header Banner -->
    <div class="bg-gradient-to-r from-cyan-600 via-sky-600 to-slate-900 p-6 rounded-3xl text-white shadow-xl">
      <h1 class="text-2xl font-black tracking-tight text-white">🚗 จัดการยานพาหนะ/ผู้มาเยือน (Vehicle & Visitor)</h1>
      <p class="text-xs text-cyan-100/80 mt-1 max-w-xl">
        อนุมัติ/ปฏิเสธทะเบียนรถของลูกบ้าน และดูรายชื่อแขกที่แจ้งล่วงหน้า
      </p>
    </div>

    <Tabs v-model="activeTab">
      <TabsList>
        <TabsTrigger value="vehicles">ทะเบียนรถ ({{ vehicles.length }})</TabsTrigger>
        <TabsTrigger value="visitors">แขก/ผู้มาเยือน ({{ visitors.length }})</TabsTrigger>
      </TabsList>

      <TabsContent value="vehicles">
        <div class="bg-white border border-slate-200 rounded-3xl shadow-xs overflow-hidden">
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
                    <span
                      class="text-[11px] font-extrabold px-2.5 py-1 rounded-full border"
                      :class="{
                        'bg-amber-100 border-amber-300 text-amber-800': v.status === 'PENDING',
                        'bg-emerald-100 border-emerald-300 text-emerald-800': v.status === 'APPROVED',
                        'bg-rose-100 border-rose-300 text-rose-800': v.status === 'REJECTED'
                      }"
                    >
                      {{ { PENDING: 'รออนุมัติ', APPROVED: 'อนุมัติแล้ว', REJECTED: 'ปฏิเสธ' }[v.status] }}
                    </span>
                  </td>
                  <td class="p-3.5 text-right space-x-1.5">
                    <template v-if="v.status === 'PENDING'">
                      <button @click="handleApprove(v.id)" class="px-2.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold cursor-pointer">
                        ✅ อนุมัติ
                      </button>
                      <button @click="handleReject(v.id)" class="px-2.5 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-xl text-xs font-semibold border border-rose-200 cursor-pointer">
                        ปฏิเสธ
                      </button>
                    </template>
                  </td>
                </tr>
                <tr v-if="vehicles.length === 0">
                  <td colspan="5" class="p-8 text-center text-slate-400 text-xs">ยังไม่มีรายการทะเบียนรถ</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </TabsContent>

      <TabsContent value="visitors">
        <div class="bg-white border border-slate-200 rounded-3xl shadow-xs overflow-hidden">
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
                  <td class="p-3.5 text-xs text-slate-500 font-mono">{{ formatDate(v.expectedDate) }}</td>
                  <td class="p-3.5">
                    <span
                      class="text-[11px] font-extrabold px-2.5 py-1 rounded-full border"
                      :class="v.status === 'EXPECTED' ? 'bg-sky-100 border-sky-300 text-sky-800' : 'bg-slate-100 border-slate-300 text-slate-500'"
                    >
                      {{ v.status === 'EXPECTED' ? 'รอมาตามนัด' : 'ยกเลิกแล้ว' }}
                    </span>
                  </td>
                </tr>
                <tr v-if="visitors.length === 0">
                  <td colspan="5" class="p-8 text-center text-slate-400 text-xs">ยังไม่มีการแจ้งแขก</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </TabsContent>
    </Tabs>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { useBuildingStore } from '@/stores/useBuildingStore';
import { showError } from '@/utils/swal';
import api from '@/utils/api';

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
    loadData();
  } catch (error) {
    showError('เกิดข้อผิดพลาด', error.response?.data?.message || 'ไม่สามารถอนุมัติได้');
  }
};

const handleReject = async (id) => {
  try {
    await api.patch(`/api/admin/vehicles/${id}/reject`);
    loadData();
  } catch (error) {
    showError('เกิดข้อผิดพลาด', error.response?.data?.message || 'ไม่สามารถปฏิเสธได้');
  }
};

const formatDate = (d) => new Date(d).toLocaleDateString('th-TH');
</script>
