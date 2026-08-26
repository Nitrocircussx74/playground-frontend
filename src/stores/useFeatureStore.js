import { defineStore } from 'pinia';
import api from '@/utils/api';

export const useFeatureStore = defineStore('feature', {
  state: () => ({
    features: [],
    featureMap: {},
    isLoading: false,
    errorMessage: ''
  }),

  getters: {
    /**
     * ตรวจสอบว่าฟีเจอร์ที่ระบุเปิดใช้งานอยู่หรือไม่ (Boolean)
     */
    isEnabled: (state) => (key) => {
      if (state.featureMap[key] !== undefined) {
        return Boolean(state.featureMap[key]);
      }
      return true; // ค่าเริ่มต้นเปิดใช้งานถ้าไม่พบคีย์
    }
  },

  actions: {
    /**
     * ดึงรายการสถานะ Feature Toggles ทั้งหมดจาก Backend
     */
    async fetchFeatures() {
      this.isLoading = true;
      this.errorMessage = '';
      try {
        const response = await api.get('/api/v1/features');
        this.features = response.data.data.features;
        this.featureMap = response.data.data.featureMap;
      } catch (error) {
        console.error('Failed to fetch feature flags:', error);
        this.errorMessage = error.response?.data?.message || 'Failed to fetch features';
      } finally {
        this.isLoading = false;
      }
    },

    /**
     * อัปเดตสถานะเปิด-ปิดฟีเจอร์ (Admin Action)
     */
    async toggleFeature(key, isActive) {
      try {
        // Optimistic UI Update
        this.featureMap[key] = isActive;
        const item = this.features.find((f) => f.key === key);
        if (item) item.isActive = isActive;

        const response = await api.put(`/api/v1/features/${key}`, { isActive });
        return response.data;
      } catch (error) {
        // Revert on error
        this.featureMap[key] = !isActive;
        const item = this.features.find((f) => f.key === key);
        if (item) item.isActive = !isActive;
        throw error;
      }
    }
  }
});
