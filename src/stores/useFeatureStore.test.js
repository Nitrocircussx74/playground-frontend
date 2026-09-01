import { describe, it, expect, vi, beforeEach } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';
import { useFeatureStore } from './useFeatureStore';
import api from '@/utils/api';

vi.mock('@/utils/api', () => ({
  default: {
    get: vi.fn(),
    put: vi.fn()
  }
}));

describe('useFeatureStore Unit Tests', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    vi.clearAllMocks();
  });

  it('isEnabled ควรส่งคืนค่าตาม featureMap', () => {
    const store = useFeatureStore();
    store.featureMap = {
      ENABLE_PARCEL_NOTIFY: true,
      ENABLE_VEHICLE_MANAGEMENT: false
    };

    expect(store.isEnabled('ENABLE_PARCEL_NOTIFY')).toBe(true);
    expect(store.isEnabled('ENABLE_VEHICLE_MANAGEMENT')).toBe(false);
    expect(store.isEnabled('UNKNOWN_FEATURE')).toBe(true); // default true if undefined
  });

  it('fetchFeatures ควรดึงข้อมูลและอัปเดต state สำเร็จ', async () => {
    const store = useFeatureStore();
    api.get.mockResolvedValueOnce({
      data: {
        success: true,
        data: {
          features: [{ key: 'ENABLE_PARCEL_NOTIFY', isActive: true }],
          featureMap: { ENABLE_PARCEL_NOTIFY: true }
        }
      }
    });

    await store.fetchFeatures('b-1');

    expect(api.get).toHaveBeenCalledWith('/api/v1/features', {
      params: { buildingId: 'b-1' }
    });
    expect(store.features).toHaveLength(1);
    expect(store.featureMap.ENABLE_PARCEL_NOTIFY).toBe(true);
    expect(store.isLoading).toBe(false);
  });
});
