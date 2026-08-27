import { defineStore } from 'pinia';
import api from '@/utils/api';

export const useBuildingStore = defineStore('building', {
  state: () => ({
    buildings: [],
    activeBuildingId: localStorage.getItem('activeBuildingId') || '',
    isLoading: false,
    error: null
  }),

  getters: {
    activeBuilding: (state) => {
      if (!state.activeBuildingId) return state.buildings[0] || null;
      return state.buildings.find((b) => b.id === state.activeBuildingId) || state.buildings[0] || null;
    }
  },

  actions: {
    async fetchBuildings() {
      this.isLoading = true;
      this.error = null;
      try {
        const res = await api.get('/api/v1/buildings');
        this.buildings = res.data.data || [];

        // If no activeBuildingId is set or if activeBuildingId doesn't exist in fetched list, set default to first building
        if (this.buildings.length > 0) {
          const exists = this.buildings.some((b) => b.id === this.activeBuildingId);
          if (!this.activeBuildingId || !exists) {
            this.setActiveBuildingId(this.buildings[0].id);
          }
        }
      } catch (err) {
        this.error = err.response?.data?.message || 'ไม่สามารถดึงข้อมูลตึกได้';
      } finally {
        this.isLoading = false;
      }
    },

    setActiveBuildingId(id) {
      this.activeBuildingId = id;
      if (id) {
        localStorage.setItem('activeBuildingId', id);
      } else {
        localStorage.removeItem('activeBuildingId');
      }
    },

    async createBuilding(payload) {
      this.isLoading = true;
      try {
        const res = await api.post('/api/v1/buildings', payload);
        await this.fetchBuildings();
        return res.data;
      } catch (err) {
        throw err;
      } finally {
        this.isLoading = false;
      }
    },

    async updateBuildingSetting(buildingId, payload) {
      this.isLoading = true;
      try {
        const res = await api.put(`/api/v1/buildings/${buildingId}/setting`, payload);
        await this.fetchBuildings();
        return res.data;
      } catch (err) {
        throw err;
      } finally {
        this.isLoading = false;
      }
    }
  }
});
