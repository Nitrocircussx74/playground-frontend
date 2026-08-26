<template>
  <div class="space-y-6">
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-bold text-slate-900 tracking-tight">Room Management</h1>
        <p class="text-sm text-slate-500">Overview of all dormitory rooms and occupancy status</p>
      </div>

      <button
        @click="roomStore.fetchRooms()"
        class="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-semibold transition-all shadow-sm shadow-indigo-600/20"
      >
        Refresh List
      </button>
    </div>

    <div v-if="roomStore.isLoading" class="p-8 text-center text-slate-500">Loading room data...</div>

    <div v-else-if="roomStore.errorMessage" class="p-4 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-sm font-medium">
      {{ roomStore.errorMessage }}
    </div>

    <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
      <RoomOverviewCard v-for="room in roomStore.rooms" :key="room.id" :room="room" />
    </div>
  </div>
</template>

<script setup>
import { onMounted } from 'vue';
import { useRoomStore } from '@/stores/useRoomStore';
import RoomOverviewCard from '@/components/RoomOverviewCard.vue';

const roomStore = useRoomStore();

onMounted(() => {
  roomStore.fetchRooms();
});
</script>
