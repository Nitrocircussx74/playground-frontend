import { describe, it, expect, vi, beforeEach } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';
import { useBuildingStore } from './useBuildingStore';
import api from '@/utils/api';

vi.mock('@/utils/api', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn()
  }
}));

describe('useBuildingStore Unit Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    global.localStorage = {
      getItem: vi.fn(() => null),
      setItem: vi.fn(),
      removeItem: vi.fn()
    };
    setActivePinia(createPinia());
  });

  it('deleteBuilding ควรยิง API DELETE และเคลียร์ activeBuildingId หากลบตึกที่กำลัง active', async () => {
    const store = useBuildingStore();
    store.activeBuildingId = 'b-delete-me';
    store.buildings = [
      { id: 'b-delete-me', name: 'Building to delete' },
      { id: 'b-keep-me', name: 'Building to keep' }
    ];

    api.delete.mockResolvedValueOnce({
      data: { success: true, message: 'ลบอาคารเรียบร้อยแล้ว' }
    });
    api.get.mockResolvedValueOnce({
      data: {
        success: true,
        data: [{ id: 'b-keep-me', name: 'Building to keep' }]
      }
    });

    const res = await store.deleteBuilding('b-delete-me');

    expect(api.delete).toHaveBeenCalledWith('/api/v1/buildings/b-delete-me');
    expect(res.success).toBe(true);
    expect(store.activeBuildingId).toBe('');
    expect(global.localStorage.removeItem).toHaveBeenCalledWith('activeBuildingId');
  });

  it('deleteBuilding ควรคงค่า activeBuildingId เดิมไว้ หากลบตึกอื่นที่ไม่ได้ active', async () => {
    const store = useBuildingStore();
    store.activeBuildingId = 'b-active';
    store.buildings = [
      { id: 'b-active', name: 'Active Building' },
      { id: 'b-other', name: 'Other Building' }
    ];

    api.delete.mockResolvedValueOnce({
      data: { success: true, message: 'ลบอาคารเรียบร้อยแล้ว' }
    });
    api.get.mockResolvedValueOnce({
      data: {
        success: true,
        data: [{ id: 'b-active', name: 'Active Building' }]
      }
    });

    await store.deleteBuilding('b-other');

    expect(api.delete).toHaveBeenCalledWith('/api/v1/buildings/b-other');
    expect(store.activeBuildingId).toBe('b-active');
  });
});
