import { defineStore } from 'pinia';
import roomService from '@/services/roomService';

export const useRoomStore = defineStore('room', {
  state: () => ({
    rooms: [],
    currentRoom: null,
    isLoading: false,
    errorMessage: ''
  }),

  actions: {
    async fetchRooms() {
      this.isLoading = true;
      this.errorMessage = '';
      try {
        const response = await roomService.getRooms();
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
    }
  }
});
