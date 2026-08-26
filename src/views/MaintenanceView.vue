<template>
  <div class="space-y-6">
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-bold text-slate-900 tracking-tight">Maintenance Requests</h1>
        <p class="text-sm text-slate-500">Report room issues or view repair request status</p>
      </div>

      <button
        @click="fetchData"
        class="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-semibold transition-all shadow-xs"
      >
        Refresh List
      </button>
    </div>

    <!-- Maintenance Form Box -->
    <div class="p-6 bg-white border border-slate-200 rounded-2xl shadow-xs space-y-4">
      <h2 class="text-lg font-semibold text-slate-900">New Repair Request (แจ้งซ่อมอุปกรณ์)</h2>

      <form @submit.prevent="handleSubmit" class="space-y-4">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label class="block text-xs font-semibold text-slate-700 mb-1">Select Room (เลือกห้องพัก)</label>
            <select
              v-model="form.roomId"
              required
              class="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
            >
              <option value="" disabled>-- Select Room --</option>
              <option v-for="room in roomStore.rooms" :key="room.id" :value="room.id">
                Room {{ room.roomNumber }}
              </option>
            </select>
          </div>

          <div>
            <label class="block text-xs font-semibold text-slate-700 mb-1">Title (หัวข้อการแจ้งซ่อม)</label>
            <input
              v-model="form.title"
              type="text"
              placeholder="e.g. เครื่องปรับอากาศไม่เย็น / ก๊อกน้ำรั่ว"
              required
              class="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
            />
          </div>
        </div>

        <div>
          <label class="block text-xs font-semibold text-slate-700 mb-1">Description (รายละเอียด)</label>
          <textarea
            v-model="form.description"
            rows="3"
            placeholder="รายละเอียดเพิ่มเติมของปัญหา..."
            required
            class="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
          ></textarea>
        </div>

        <div>
          <label class="block text-xs font-semibold text-slate-700 mb-1">Upload Photo (แนบรูปภาพประกอบ)</label>
          <input
            type="file"
            accept="image/png, image/jpeg, image/jpg, image/webp"
            @change="handleFileChange"
            class="block w-full text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
          />
          <span v-if="uploading" class="text-xs text-indigo-600 mt-1 block">Uploading image...</span>
          <img v-if="form.imageUrl" :src="form.imageUrl" class="mt-2 h-24 w-24 object-cover rounded-xl border border-slate-200" />
        </div>

        <div class="flex justify-end">
          <button
            type="submit"
            :disabled="submitting || uploading"
            class="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-semibold transition-all shadow-xs disabled:opacity-50"
          >
            {{ submitting ? 'Submitting...' : 'Submit Request' }}
          </button>
        </div>
      </form>
    </div>

    <!-- Maintenance Table -->
    <div class="bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden">
      <div class="p-4 border-b border-slate-200">
        <h3 class="font-semibold text-slate-900">Maintenance Request Log</h3>
      </div>

      <div class="overflow-x-auto">
        <table class="w-full text-left text-sm text-slate-700">
          <thead class="bg-slate-50 text-xs text-slate-500 uppercase tracking-wider border-b border-slate-200">
            <tr>
              <th class="p-3.5">Room</th>
              <th class="p-3.5">Title</th>
              <th class="p-3.5">Description</th>
              <th class="p-3.5">Photo</th>
              <th class="p-3.5">Status</th>
              <th class="p-3.5">Date</th>
              <th class="p-3.5 text-right">Action</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100">
            <tr v-for="item in requests" :key="item.id" class="hover:bg-slate-50/60">
              <td class="p-3.5 font-semibold text-slate-900">Room {{ item.room?.roomNumber }}</td>
              <td class="p-3.5 font-medium text-slate-800">{{ item.title }}</td>
              <td class="p-3.5 text-xs text-slate-600 max-w-xs truncate">{{ item.description }}</td>
              <td class="p-3.5">
                <a v-if="item.imageUrl" :href="item.imageUrl" target="_blank" class="text-indigo-600 hover:underline text-xs font-medium">
                  View Photo
                </a>
                <span v-else class="text-xs text-slate-400">No Image</span>
              </td>
              <td class="p-3.5">
                <span
                  class="text-xs font-semibold px-2.5 py-1 rounded-full border"
                  :class="{
                    'bg-amber-50 border-amber-300 text-amber-800': item.status === 'pending',
                    'bg-indigo-50 border-indigo-300 text-indigo-800': item.status === 'in_progress',
                    'bg-emerald-50 border-emerald-300 text-emerald-800': item.status === 'completed'
                  }"
                >
                  {{ item.status.toUpperCase() }}
                </span>
              </td>
              <td class="p-3.5 text-xs text-slate-500">{{ new Date(item.createdAt).toLocaleDateString() }}</td>
              <td class="p-3.5 text-right">
                <button
                  v-if="item.status !== 'completed'"
                  @click="handleUpdateStatus(item.id, 'completed')"
                  class="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-medium rounded-lg"
                >
                  Mark Completed
                </button>
              </td>
            </tr>
            <tr v-if="requests.length === 0">
              <td colspan="7" class="p-6 text-center text-slate-400">No repair requests found</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue';
import { useRoomStore } from '@/stores/useRoomStore';
import uploadService from '@/services/uploadService';
import maintenanceService from '@/services/maintenanceService';

const roomStore = useRoomStore();
const requests = ref([]);
const uploading = ref(false);
const submitting = ref(false);

const form = reactive({
  roomId: '',
  title: '',
  description: '',
  imageUrl: ''
});

const fetchData = async () => {
  await roomStore.fetchRooms();
  const res = await maintenanceService.getRequests();
  requests.value = res.data || [];
};

onMounted(fetchData);

const handleFileChange = async (e) => {
  const file = e.target.files[0];
  if (!file) return;

  uploading.value = true;
  try {
    const res = await uploadService.uploadFile(file);
    form.imageUrl = res.data.url;
  } catch (err) {
    alert(err.response?.data?.message || 'File upload failed');
  } finally {
    uploading.value = false;
  }
};

const handleSubmit = async () => {
  submitting.value = true;
  try {
    await maintenanceService.createRequest({ ...form });
    alert('Maintenance request submitted successfully!');
    form.title = '';
    form.description = '';
    form.imageUrl = '';
    fetchData();
  } catch (err) {
    alert(err.response?.data?.message || 'Failed to submit request');
  } finally {
    submitting.value = false;
  }
};

const handleUpdateStatus = async (id, status) => {
  try {
    await maintenanceService.updateStatus(id, status);
    fetchData();
  } catch (err) {
    alert(err.response?.data?.message || 'Failed to update status');
  }
};
</script>
