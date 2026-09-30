<template>
  <div class="space-y-5 pb-6 font-sans text-slate-800">
    <!-- Feature Disabled State -->
    <Card v-if="!isFeatureEnabled" class="p-8 text-center space-y-3">
      <div class="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto">
        <Car class="w-6 h-6" />
      </div>
      <h2 class="text-sm font-bold text-slate-800">ฟีเจอร์นี้ไม่พร้อมใช้งาน</h2>
      <p class="text-xs text-slate-500">ขออภัย ฟีเจอร์จัดการยานพาหนะ/ผู้มาเยือนถูกปิดการใช้งานชั่วคราว</p>
    </Card>

    <template v-else>
      <div>
        <h1 class="text-lg font-bold text-slate-900 tracking-tight">ยานพาหนะ/ผู้มาเยือน</h1>
        <p class="text-xs text-slate-500 mt-0.5">ลงทะเบียนรถของคุณ หรือแจ้งแขกล่วงหน้า</p>
      </div>

      <Tabs v-model="activeTab">
        <TabsList>
          <TabsTrigger value="vehicles">รถของฉัน</TabsTrigger>
          <TabsTrigger value="visitors">แขกของฉัน</TabsTrigger>
        </TabsList>

        <TabsContent value="vehicles">
          <div class="space-y-3">
            <Button class="w-full" @click="showVehicleForm = true">
              ลงทะเบียนรถใหม่
            </Button>

            <Card v-for="v in myVehicles" :key="v.id" class="p-4 flex items-center justify-between gap-3">
              <div class="min-w-0">
                <div class="font-bold text-slate-800 text-sm font-mono">{{ v.licensePlate }}</div>
                <div class="text-xs text-slate-500">{{ v.vehicleType === 'car' ? 'รถยนต์' : 'มอเตอร์ไซค์' }} {{ v.brand ? `- ${v.brand}` : '' }}</div>
                <Badge
                  class="mt-1"
                  :variant="{ PENDING: 'warning', APPROVED: 'success', REJECTED: 'danger' }[v.status]"
                >
                  {{ { PENDING: 'รออนุมัติ', APPROVED: 'อนุมัติแล้ว', REJECTED: 'ปฏิเสธ' }[v.status] }}
                </Badge>
              </div>
              <Button
                v-if="v.status === 'PENDING'"
                variant="outline"
                size="sm"
                class="text-rose-700 border-rose-200 hover:bg-rose-50 shrink-0"
                @click="handleDeleteVehicle(v.id)"
              >
                ลบ
              </Button>
            </Card>
            <Card v-if="!loading && myVehicles.length === 0" class="p-6 text-center">
              <p class="text-xs text-slate-400">คุณยังไม่ได้ลงทะเบียนรถ</p>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="visitors">
          <div class="space-y-3">
            <Button class="w-full" @click="showVisitorForm = true">
              แจ้งแขกล่วงหน้า
            </Button>

            <Card v-for="v in myVisitors" :key="v.id" class="p-4 flex items-center justify-between gap-3">
              <div class="min-w-0">
                <div class="font-bold text-slate-800 text-sm">{{ v.visitorName }}</div>
                <div class="text-xs text-slate-500 font-mono">{{ formatDate(v.expectedDate) }} {{ v.licensePlate ? `· ${v.licensePlate}` : '' }}</div>
              </div>
              <Button
                v-if="v.status === 'EXPECTED'"
                variant="outline"
                size="sm"
                class="text-rose-700 border-rose-200 hover:bg-rose-50 shrink-0"
                @click="handleDeleteVisitor(v.id)"
              >
                ยกเลิก
              </Button>
            </Card>
            <Card v-if="!loading && myVisitors.length === 0" class="p-6 text-center">
              <p class="text-xs text-slate-400">คุณยังไม่มีการแจ้งแขก</p>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      <!-- Register Vehicle Modal (bottom sheet on mobile, centered on larger screens) -->
      <div v-if="showVehicleForm" class="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4">
        <div class="bg-white w-full sm:max-w-sm rounded-t-xl sm:rounded-xl shadow-2xl overflow-hidden">
          <div class="px-5 py-4 bg-primary text-primary-foreground flex items-center justify-between">
            <h3 class="font-bold text-sm">ลงทะเบียนยานพาหนะ</h3>
            <button @click="showVehicleForm = false" class="text-xl leading-none opacity-80 hover:opacity-100">&times;</button>
          </div>
          <form @submit.prevent="handleRegisterVehicle" class="p-5 space-y-4">
            <div>
              <label class="block text-xs font-bold text-slate-700 mb-1">ทะเบียนรถ</label>
              <Input v-model="vehicleForm.licensePlate" required type="text" placeholder="เช่น กข-1234" class="font-mono" />
            </div>
            <div>
              <label class="block text-xs font-bold text-slate-700 mb-1">ประเภท</label>
              <Select v-model="vehicleForm.vehicleType">
                <option value="car">รถยนต์</option>
                <option value="motorcycle">มอเตอร์ไซค์</option>
              </Select>
            </div>
            <div>
              <label class="block text-xs font-bold text-slate-700 mb-1">ยี่ห้อ (Optional)</label>
              <Input v-model="vehicleForm.brand" type="text" />
            </div>
            <div class="pt-2 flex gap-3">
              <Button type="button" variant="outline" class="w-1/2" @click="showVehicleForm = false">ยกเลิก</Button>
              <Button type="submit" class="w-1/2" :disabled="submitting">
                {{ submitting ? 'กำลังบันทึก...' : 'ลงทะเบียน' }}
              </Button>
            </div>
          </form>
        </div>
      </div>

      <!-- Add Visitor Modal (bottom sheet on mobile, centered on larger screens) -->
      <div v-if="showVisitorForm" class="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4">
        <div class="bg-white w-full sm:max-w-sm rounded-t-xl sm:rounded-xl shadow-2xl overflow-hidden">
          <div class="px-5 py-4 bg-primary text-primary-foreground flex items-center justify-between">
            <h3 class="font-bold text-sm">แจ้งแขกล่วงหน้า</h3>
            <button @click="showVisitorForm = false" class="text-xl leading-none opacity-80 hover:opacity-100">&times;</button>
          </div>
          <form @submit.prevent="handleCreateVisitor" class="p-5 space-y-4">
            <div>
              <label class="block text-xs font-bold text-slate-700 mb-1">ชื่อแขก</label>
              <Input v-model="visitorForm.visitorName" required type="text" />
            </div>
            <div>
              <label class="block text-xs font-bold text-slate-700 mb-1">วันที่คาดว่าจะมา</label>
              <Input v-model="visitorForm.expectedDate" required type="date" />
            </div>
            <div>
              <label class="block text-xs font-bold text-slate-700 mb-1">ทะเบียนรถ (Optional)</label>
              <Input v-model="visitorForm.licensePlate" type="text" class="font-mono" />
            </div>
            <div class="pt-2 flex gap-3">
              <Button type="button" variant="outline" class="w-1/2" @click="showVisitorForm = false">ยกเลิก</Button>
              <Button type="submit" class="w-1/2" :disabled="submitting">
                {{ submitting ? 'กำลังบันทึก...' : 'บันทึก' }}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { Car } from 'lucide-vue-next';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { useFeatureStore } from '@/stores/useFeatureStore';
import { showSuccess, showError, showConfirm } from '@/utils/swal';
import api from '@/utils/api';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';

const featureStore = useFeatureStore();
const loading = ref(true);
const submitting = ref(false);
const activeTab = ref('vehicles');
const myVehicles = ref([]);
const myVisitors = ref([]);
const showVehicleForm = ref(false);
const showVisitorForm = ref(false);
const vehicleForm = ref({ licensePlate: '', vehicleType: 'car', brand: '' });
const visitorForm = ref({ visitorName: '', expectedDate: '', licensePlate: '' });

const isFeatureEnabled = computed(() => featureStore.isEnabled('ENABLE_VEHICLE_MANAGEMENT'));

onMounted(async () => {
  if (featureStore.features.length === 0) {
    await featureStore.fetchFeatures();
  }
  await loadAll();
});

const loadAll = async () => {
  loading.value = true;
  try {
    const [vehiclesRes, visitorsRes] = await Promise.all([
      api.get('/api/v1/liff/vehicles/mine'),
      api.get('/api/v1/liff/visitors/mine')
    ]);
    myVehicles.value = vehiclesRes.data.data;
    myVisitors.value = visitorsRes.data.data;
  } catch (error) {
    console.error('Failed to fetch vehicle/visitor data:', error);
  } finally {
    loading.value = false;
  }
};

const handleRegisterVehicle = async () => {
  submitting.value = true;
  try {
    const res = await api.post('/api/v1/liff/vehicles', vehicleForm.value);
    await showSuccess('สำเร็จ!', res.data.message);
    showVehicleForm.value = false;
    vehicleForm.value = { licensePlate: '', vehicleType: 'car', brand: '' };
    loadAll();
  } catch (error) {
    showError('เกิดข้อผิดพลาด', error.response?.data?.message || 'ไม่สามารถลงทะเบียนได้');
  } finally {
    submitting.value = false;
  }
};

const handleDeleteVehicle = async (id) => {
  const confirmed = await showConfirm('ยืนยันลบ', 'ต้องการลบรายการรถนี้ใช่หรือไม่?');
  if (!confirmed) return;
  try {
    await api.delete(`/api/v1/liff/vehicles/${id}`);
    loadAll();
  } catch (error) {
    showError('เกิดข้อผิดพลาด', error.response?.data?.message || 'ไม่สามารถลบได้');
  }
};

const handleCreateVisitor = async () => {
  submitting.value = true;
  try {
    const res = await api.post('/api/v1/liff/visitors', visitorForm.value);
    await showSuccess('สำเร็จ!', res.data.message);
    showVisitorForm.value = false;
    visitorForm.value = { visitorName: '', expectedDate: '', licensePlate: '' };
    loadAll();
  } catch (error) {
    showError('เกิดข้อผิดพลาด', error.response?.data?.message || 'ไม่สามารถบันทึกได้');
  } finally {
    submitting.value = false;
  }
};

const handleDeleteVisitor = async (id) => {
  const confirmed = await showConfirm('ยืนยันยกเลิก', 'ต้องการยกเลิกการแจ้งแขกนี้ใช่หรือไม่?');
  if (!confirmed) return;
  try {
    await api.delete(`/api/v1/liff/visitors/${id}`);
    loadAll();
  } catch (error) {
    showError('เกิดข้อผิดพลาด', error.response?.data?.message || 'ไม่สามารถยกเลิกได้');
  }
};

const formatDate = (d) => new Date(d).toLocaleDateString('th-TH');
</script>
