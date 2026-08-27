<template>
  <div class="space-y-6">
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-bold text-slate-900 tracking-tight">Room Management</h1>
        <p class="text-sm text-slate-500">Overview of all dormitory rooms, occupancy status & invite code manager</p>
      </div>

      <div class="flex items-center gap-3">
        <button
          @click="showCreateModal = !showCreateModal"
          class="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-semibold transition-all shadow-sm shadow-indigo-600/20 flex items-center gap-1.5"
        >
          <span>{{ showCreateModal ? 'Cancel' : '+ Add New Room' }}</span>
        </button>

        <button
          @click="roomStore.fetchRooms()"
          class="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-sm font-semibold transition-all border border-slate-200"
        >
          Refresh List
        </button>
      </div>
    </div>

    <!-- Create Room Form Panel -->
    <div v-if="showCreateModal" class="p-6 bg-white border border-slate-200 rounded-2xl shadow-sm space-y-4">
      <h2 class="text-lg font-semibold text-slate-900">Add New Room (เพิ่มห้องพักใหม่)</h2>

      <form @submit.prevent="handleCreateRoom" class="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div>
          <label class="block text-xs font-semibold text-slate-700 mb-1">Room Number (เลขห้อง)</label>
          <input
            v-model="form.roomNumber"
            type="text"
            placeholder="e.g. 202"
            required
            class="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
          />
        </div>

        <div>
          <label class="block text-xs font-semibold text-slate-700 mb-1">Floor (ชั้น)</label>
          <input
            v-model.number="form.floor"
            type="number"
            min="1"
            placeholder="e.g. 2"
            required
            class="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
          />
        </div>

        <div>
          <label class="block text-xs font-semibold text-slate-700 mb-1">Monthly Rent Price (ราคา/เดือน)</label>
          <input
            v-model.number="form.price"
            type="number"
            step="100"
            placeholder="e.g. 4500"
            required
            class="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
          />
        </div>

        <div>
          <label class="block text-xs font-semibold text-slate-700 mb-1">Initial Status (สถานะเริ่มต้น)</label>
          <select
            v-model="form.status"
            class="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
          >
            <option value="available">Available (ว่าง)</option>
            <option value="occupied">Occupied (มีผู้เช่า)</option>
            <option value="maintenance">Maintenance (ซ่อมบำรุง)</option>
          </select>
        </div>

        <div class="col-span-full flex justify-end pt-2">
          <button
            type="submit"
            :disabled="roomStore.isLoading"
            class="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-semibold transition-all shadow-sm shadow-emerald-600/20 disabled:opacity-50"
          >
            {{ roomStore.isLoading ? 'Saving...' : 'Save New Room' }}
          </button>
        </div>
      </form>
    </div>

    <div v-if="roomStore.isLoading && !showCreateModal" class="p-8 text-center text-slate-500">Loading room data...</div>

    <div v-else-if="roomStore.errorMessage" class="p-4 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-sm font-medium">
      {{ roomStore.errorMessage }}
    </div>

    <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
      <div v-for="room in roomStore.rooms" :key="room.id" class="space-y-2">
        <RoomOverviewCard :room="room" />

        <!-- Generate Invite Button for Available Rooms -->
        <button
          v-if="room.status === 'available'"
          @click="openInviteModal(room)"
          class="w-full py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 rounded-xl text-xs font-semibold transition-all flex items-center justify-center gap-1.5 shadow-2xs"
        >
          <span>🔑 Manage Invite Code (ห้อง {{ room.roomNumber }})</span>
        </button>
      </div>
    </div>

    <!-- Room Invite Code Management Modal -->
    <RoomInviteModal
      :show="showInviteModal"
      :room="selectedRoomForInvite"
      @close="showInviteModal = false"
    />
  </div>
</template>

<script setup>
import { reactive, ref, onMounted } from 'vue';
import { useRoomStore } from '@/stores/useRoomStore';
import RoomOverviewCard from '@/components/RoomOverviewCard.vue';
import RoomInviteModal from '@/components/RoomInviteModal.vue';

const roomStore = useRoomStore();
const showCreateModal = ref(false);
const showInviteModal = ref(false);
const selectedRoomForInvite = ref(null);

const form = reactive({
  roomNumber: '',
  floor: 2,
  price: 4500,
  status: 'available'
});

onMounted(() => {
  roomStore.fetchRooms();
});

const handleCreateRoom = async () => {
  try {
    await roomStore.createRoom({ ...form });
    alert(`Room ${form.roomNumber} created successfully!`);
    form.roomNumber = '';
    showCreateModal.value = false;
  } catch (error) {
    alert(error.response?.data?.message || 'Failed to create room');
  }
};

const openInviteModal = (room) => {
  selectedRoomForInvite.value = room;
  showInviteModal.value = true;
};
</script>
