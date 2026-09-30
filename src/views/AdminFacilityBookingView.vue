<template>
  <div class="space-y-6 font-sans">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
      <div>
        <h1 class="text-lg font-bold text-slate-900 tracking-tight flex items-center gap-2">
          <CalendarCheck class="w-5 h-5 text-primary" />
          <span>จองพื้นที่ส่วนกลาง</span>
        </h1>
        <p class="text-xs text-slate-500 mt-0.5">จัดการพื้นที่ส่วนกลางที่เปิดให้จอง และดูรายการจองของลูกบ้านทั้งหมด</p>
      </div>
      <Button v-if="activeTab === 'facilities'" class="shrink-0" @click="openCreateFacilityModal">
        <Plus class="w-4 h-4" />
        <span>เพิ่มพื้นที่ส่วนกลาง</span>
      </Button>
    </div>

    <Tabs v-model="activeTab">
      <TabsList>
        <TabsTrigger value="facilities">พื้นที่ส่วนกลาง ({{ facilities.length }})</TabsTrigger>
        <TabsTrigger value="bookings">รายการจอง ({{ bookings.length }})</TabsTrigger>
      </TabsList>

      <TabsContent value="facilities">
        <Card class="p-0 overflow-hidden">
          <div class="overflow-x-auto">
            <table class="w-full text-left text-sm text-slate-700">
              <thead class="bg-slate-50 text-xs text-slate-500 uppercase tracking-wider border-b border-slate-200 font-bold">
                <tr>
                  <th class="p-3.5">ชื่อพื้นที่</th>
                  <th class="p-3.5">รายละเอียด</th>
                  <th class="p-3.5">สถานะ</th>
                  <th class="p-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-100">
                <tr v-for="f in facilities" :key="f.id" class="hover:bg-slate-50/60 transition-colors">
                  <td class="p-3.5 font-bold text-slate-900">{{ f.name }}</td>
                  <td class="p-3.5 text-xs text-slate-600">{{ f.description || '-' }}</td>
                  <td class="p-3.5">
                    <Badge :variant="f.isActive ? 'success' : 'neutral'">
                      {{ f.isActive ? 'เปิดให้จอง' : 'ปิดใช้งาน' }}
                    </Badge>
                  </td>
                  <td class="p-3.5 text-right space-x-1.5">
                    <Button variant="outline" size="sm" @click="toggleFacilityActive(f)">
                      {{ f.isActive ? 'ปิดใช้งาน' : 'เปิดใช้งาน' }}
                    </Button>
                    <Button variant="outline" size="sm" class="text-rose-700 border-rose-200 hover:bg-rose-50" @click="handleDeleteFacility(f.id)">
                      <Trash2 class="w-3.5 h-3.5" />
                      <span>ลบ</span>
                    </Button>
                  </td>
                </tr>
                <tr v-if="facilities.length === 0">
                  <td colspan="4" class="p-8 text-center text-slate-400 text-xs">ยังไม่มีพื้นที่ส่วนกลางในตึกนี้</td>
                </tr>
              </tbody>
            </table>
          </div>
        </Card>
      </TabsContent>

      <TabsContent value="bookings">
        <Card class="p-0 overflow-hidden">
          <div class="overflow-x-auto">
            <table class="w-full text-left text-sm text-slate-700">
              <thead class="bg-slate-50 text-xs text-slate-500 uppercase tracking-wider border-b border-slate-200 font-bold">
                <tr>
                  <th class="p-3.5">พื้นที่</th>
                  <th class="p-3.5">ผู้จอง</th>
                  <th class="p-3.5">ช่วงเวลา</th>
                  <th class="p-3.5">สถานะ</th>
                  <th class="p-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-100">
                <tr v-for="b in bookings" :key="b.id" class="hover:bg-slate-50/60 transition-colors">
                  <td class="p-3.5 font-bold text-slate-900">{{ b.facility?.name }}</td>
                  <td class="p-3.5 text-xs text-slate-600">{{ b.tenant ? `${b.tenant.firstName} ${b.tenant.lastName}` : '-' }}</td>
                  <td class="p-3.5 text-xs text-slate-500 font-mono">
                    {{ formatShortDate(b.startTime) }} · {{ formatTimeRange(b.startTime, b.endTime) }} น.
                  </td>
                  <td class="p-3.5">
                    <Badge :variant="b.status === 'CONFIRMED' ? 'success' : 'neutral'">
                      {{ b.status === 'CONFIRMED' ? 'ยืนยันแล้ว' : 'ยกเลิกแล้ว' }}
                    </Badge>
                  </td>
                  <td class="p-3.5 text-right">
                    <Button
                      v-if="b.status === 'CONFIRMED'"
                      variant="outline"
                      size="sm"
                      class="text-rose-700 border-rose-200 hover:bg-rose-50"
                      @click="handleCancelBooking(b.id)"
                    >
                      ยกเลิกการจอง
                    </Button>
                  </td>
                </tr>
                <tr v-if="bookings.length === 0">
                  <td colspan="5" class="p-8 text-center text-slate-400 text-xs">ยังไม่มีรายการจอง</td>
                </tr>
              </tbody>
            </table>
          </div>
        </Card>
      </TabsContent>
    </Tabs>

    <!-- Create Facility Modal -->
    <Dialog :open="showModal" @update:open="showModal = $event">
      <DialogContent class="max-w-md p-0 overflow-hidden">
        <div class="px-6 py-4 bg-gradient-to-r from-cyan-600 to-teal-600 text-white">
          <DialogHeader class="pr-6">
            <DialogTitle class="text-white">เพิ่มพื้นที่ส่วนกลาง</DialogTitle>
          </DialogHeader>
        </div>
        <form @submit.prevent="handleCreateFacility" class="p-6 space-y-4">
          <div>
            <label class="block text-xs font-bold text-slate-700 mb-1">ชื่อพื้นที่</label>
            <Input v-model="form.name" required type="text" placeholder="เช่น สระว่ายน้ำ, ห้องฟิตเนส" class="font-bold" />
          </div>
          <div>
            <label class="block text-xs font-bold text-slate-700 mb-1">รายละเอียด (Optional)</label>
            <textarea
              v-model="form.description"
              rows="2"
              class="flex w-full rounded-md border border-input bg-background px-3.5 py-2.5 text-xs text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/30 focus-visible:border-ring"
            ></textarea>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" @click="showModal = false">ยกเลิก</Button>
            <Button type="submit" :disabled="submitting">
              <CheckCircle2 class="w-4 h-4" />
              <span>{{ submitting ? 'กำลังบันทึก...' : 'บันทึก' }}</span>
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, watch } from 'vue';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { useBuildingStore } from '@/stores/useBuildingStore';
import { showSuccess, showError, showConfirm } from '@/utils/swal';
import { formatDate, formatShortDate } from '@/utils/formatters';
import api from '@/utils/api';
import { CalendarCheck, Plus, Trash2, CheckCircle2 } from 'lucide-vue-next';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';

const buildingStore = useBuildingStore();

const activeTab = ref('facilities');
const facilities = ref([]);
const bookings = ref([]);
const showModal = ref(false);
const submitting = ref(false);
const form = reactive({ name: '', description: '' });

const loadData = () => {
  const bId = buildingStore.activeBuildingId || buildingStore.buildings[0]?.id;
  if (!bId) return;
  fetchFacilities(bId);
  fetchBookings(bId);
};

onMounted(loadData);
watch(() => buildingStore.activeBuildingId, loadData);

const fetchFacilities = async (bId) => {
  try {
    const res = await api.get(`/api/admin/buildings/${bId}/facilities`);
    facilities.value = res.data.data;
  } catch (error) {
    console.error('Failed to fetch facilities:', error);
  }
};

const fetchBookings = async (bId) => {
  try {
    const res = await api.get(`/api/admin/buildings/${bId}/facility-bookings`);
    bookings.value = res.data.data;
  } catch (error) {
    console.error('Failed to fetch facility bookings:', error);
  }
};

const openCreateFacilityModal = () => {
  form.name = '';
  form.description = '';
  showModal.value = true;
};

const handleCreateFacility = async () => {
  submitting.value = true;
  try {
    const bId = buildingStore.activeBuildingId || buildingStore.buildings[0]?.id;
    const res = await api.post(`/api/admin/buildings/${bId}/facilities`, form);
    await showSuccess('สำเร็จ', res.data.message);
    showModal.value = false;
    loadData();
  } catch (error) {
    showError('เกิดข้อผิดพลาด', error.response?.data?.message || 'ไม่สามารถเพิ่มพื้นที่ส่วนกลางได้');
  } finally {
    submitting.value = false;
  }
};

const toggleFacilityActive = async (f) => {
  try {
    await api.patch(`/api/admin/facilities/${f.id}`, { isActive: !f.isActive });
    loadData();
  } catch (error) {
    showError('เกิดข้อผิดพลาด', error.response?.data?.message || 'ไม่สามารถอัปเดตสถานะได้');
  }
};

const handleDeleteFacility = async (id) => {
  const confirmed = await showConfirm('ยืนยันลบ', 'ต้องการลบพื้นที่ส่วนกลางนี้ใช่หรือไม่?');
  if (!confirmed) return;
  try {
    await api.delete(`/api/admin/facilities/${id}`);
    loadData();
  } catch (error) {
    showError('เกิดข้อผิดพลาด', error.response?.data?.message || 'ไม่สามารถลบได้');
  }
};

const handleCancelBooking = async (id) => {
  const confirmed = await showConfirm('ยืนยันยกเลิก', 'ต้องการยกเลิกการจองนี้ใช่หรือไม่?');
  if (!confirmed) return;
  try {
    await api.patch(`/api/admin/facility-bookings/${id}`);
    loadData();
  } catch (error) {
    showError('เกิดข้อผิดพลาด', error.response?.data?.message || 'ไม่สามารถยกเลิกได้');
  }
};

const timeOptions = { hour: '2-digit', minute: '2-digit' };
const formatTimeRange = (start, end) => `${formatDate(start, timeOptions)}-${formatDate(end, timeOptions)}`;
</script>
