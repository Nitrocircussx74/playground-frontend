import { defineStore } from 'pinia';
import meterService from '@/services/meterService';

export const useMeterStore = defineStore('meter', {
  state: () => ({
    meterRecords: [],
    isLoading: false,
    errorMessage: ''
  }),

  actions: {
    async fetchMeterRecords(params = {}) {
      this.isLoading = true;
      this.errorMessage = '';
      try {
        const response = await meterService.getMeterRecords(params);
        this.meterRecords = response.data || [];
      } catch (error) {
        this.errorMessage = error.response?.data?.message || 'Failed to fetch meter records';
      } finally {
        this.isLoading = false;
      }
    },

    async recordMeter(payload) {
      this.isLoading = true;
      this.errorMessage = '';
      try {
        const response = await meterService.createMeterRecord(payload);
        await this.fetchMeterRecords({ roomId: payload.roomId });
        return response;
      } catch (error) {
        this.errorMessage = error.response?.data?.message || 'Failed to record meter';
        throw error;
      } finally {
        this.isLoading = false;
      }
    }
  }
});
