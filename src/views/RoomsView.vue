<template>
  <div class="space-y-6">
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-bold text-slate-100">Room Management</h1>
        <p class="text-sm text-slate-400">Overview of all dormitory rooms and occupancy status</p>
      </div>

      <button
        @click="roomStore.fetchRooms()"
        class="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-sm font-medium transition-all shadow-sm"
      >
        Refresh List
      </button>
    </div>

    <div v-if="roomStore.isLoading" class="p-8 text-center text-slate-400">Loading room data...</div>

    <div v-else-if="roomStore.errorMessage" class="p-4 bg-red-900/30 border border-red-500/40 text-red-300 rounded-xl">
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
