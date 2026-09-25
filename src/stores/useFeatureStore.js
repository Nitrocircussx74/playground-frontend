import { defineStore } from 'pinia';
import api from '@/utils/api';
import { useAuthStore } from '@/stores/auth';

// นับลำดับ Request ของ fetchFeatures() กันปัญหา Response เก่ามาถึงทีหลัง Response ใหม่ (Race Condition)
// เช่น สลับตึกเร็วๆ ใน FeatureSettingsView.vue หรือหลายหน้า LIFF เรียกซ้อนกันตอน Mount
let fetchRequestSeq = 0;

export const useFeatureStore = defineStore('feature', {
  state: () => ({
    features: [],
    featureMap: {},
    buildingId: null, // ตึกของ featureMap ปัจจุบัน ให้ LiffLayout ดึงซ้ำตึกเดิมได้ (รวมโหมดพรีวิวของเจ้าของ)
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
     * ดึงรายการสถานะ Feature Toggles ทั้งหมดจาก Backend (รองรับแยกรายตึก)
     */
    async fetchFeatures(buildingId = null) {
      const requestSeq = ++fetchRequestSeq;
      this.isLoading = true;
      this.errorMessage = '';
      try {
        // ถ้าไม่ระบุ buildingId มา (หลายหน้า LIFF เรียกแบบนี้) ลอง Derive จาก Tenant ที่ Login อยู่ในเมมโมรี
        // ก่อนเสมอ กันปัญหา Backend ต้องเดา buildingId เองจาก Authorization Header ที่ Interceptor แนบมา
        // (Dual-Role User ที่ Login ทั้ง CMS Admin และ LIFF Tenant พร้อมกัน อาจได้ Header เป็น Admin Token
        // แทน Tenant Token แล้วได้ Feature Map ผิดตึก)
        let resolvedBuildingId = buildingId;
        if (!resolvedBuildingId && typeof window !== 'undefined') {
          resolvedBuildingId = localStorage.getItem('active_tenant_building_id') || localStorage.getItem('liff_target_building');
        }
        if (!resolvedBuildingId) {
          const authStore = useAuthStore();
          const activeRoomId = typeof window !== 'undefined' ? localStorage.getItem('active_tenant_room_id') : null;
          const matchedRoom = activeRoomId ? authStore.tenant?.rooms?.find((r) => r.id === activeRoomId) : null;
          resolvedBuildingId = matchedRoom?.buildingId || authStore.tenant?.rooms?.[0]?.buildingId || authStore.tenant?.buildingId || null;
        }

        const response = await api.get('/api/v1/features', {
          params: { ...(resolvedBuildingId && { buildingId: resolvedBuildingId }) }
        });

        if (requestSeq !== fetchRequestSeq) return; // มี Request ใหม่กว่ายิงตามมาแล้ว ทิ้ง Response เก่านี้
        this.features = response.data.data.features;
        this.featureMap = response.data.data.featureMap;
        this.buildingId = resolvedBuildingId || null;
      } catch (error) {
        if (requestSeq !== fetchRequestSeq) return;
        console.error('Failed to fetch feature flags:', error);
        this.errorMessage = error.response?.data?.message || 'Failed to fetch features';
      } finally {
        if (requestSeq === fetchRequestSeq) {
          this.isLoading = false;
        }
      }
    },

    /**
     * อัปเดตสถานะเปิด-ปิดฟีเจอร์ (Admin Action)
     */
    async toggleFeature(key, isActive, buildingId = null) {
      try {
        // Optimistic UI Update
        this.featureMap[key] = isActive;
        const item = this.features.find((f) => f.key === key);
        if (item) item.isActive = isActive;

        const response = await api.put(`/api/v1/features/${key}`, {
          isActive,
          ...(buildingId && { buildingId })
        });
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
