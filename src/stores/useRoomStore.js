import { defineStore } from 'pinia';
import roomService from '@/services/roomService';
import { useBuildingStore } from '@/stores/useBuildingStore';

export const useRoomStore = defineStore('room', {
  state: () => ({
    rooms: [],
    currentRoom: null,
    isLoading: false,
    errorMessage: ''
  }),

  actions: {
    async fetchRooms(buildingId) {
      const bStore = useBuildingStore();
      const targetBuildingId = buildingId || bStore.activeBuildingId;

      this.isLoading = true;
      this.errorMessage = '';
      try {
        const response = await roomService.getRooms(targetBuildingId);
        this.rooms = response.data || [];
      } catch (error) {
        this.errorMessage = error.response?.data?.message || 'Failed to fetch rooms';
      } finally {
        this.isLoading = false;
      }
    },

    async fetchRoomById(id) {
      this.isLoading = true;
      this.errorMessage = '';
      try {
        const response = await roomService.getRoomById(id);
        this.currentRoom = response.data;
      } catch (error) {
        this.errorMessage = error.response?.data?.message || 'Failed to fetch room details';
      } finally {
        this.isLoading = false;
      }
    },

    async createRoom(payload) {
      const bStore = useBuildingStore();
      const targetBuildingId = payload.buildingId || bStore.activeBuildingId;

      this.isLoading = true;
      this.errorMessage = '';
      try {
        const response = await roomService.createRoom({
          ...payload,
          buildingId: targetBuildingId
        });
        await this.fetchRooms(targetBuildingId);
        return response;
      } catch (error) {
        this.errorMessage = error.response?.data?.message || 'Failed to create room';
        throw error;
      } finally {
        this.isLoading = false;
      }
    },

    async importRooms(payload) {
      const bStore = useBuildingStore();
      const targetBuildingId = payload.buildingId || bStore.activeBuildingId;

      this.isLoading = true;
      this.errorMessage = '';
      try {
        const response = await roomService.importRooms({
          ...payload,
          buildingId: targetBuildingId
        });
        await this.fetchRooms(targetBuildingId);
        return response;
      } catch (error) {
        this.errorMessage = error.response?.data?.message || 'Failed to import rooms';
        throw error;
      } finally {
        this.isLoading = false;
      }
    }
  }
});
