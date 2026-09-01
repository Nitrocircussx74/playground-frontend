import { describe, it, expect, vi, beforeEach } from 'vitest';
import tenantService from './tenantService';
import api from '@/utils/api';

vi.mock('@/utils/api', () => ({
  default: {
    get: vi.fn(),
    patch: vi.fn()
  }
}));

describe('tenantService Unit Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('getAllTenants ควรเรียก GET /api/admin/tenants พร้อม params', async () => {
    const mockData = { success: true, data: [{ id: '1', firstName: 'Somchai' }] };
    api.get.mockResolvedValueOnce({ data: mockData });

    const result = await tenantService.getAllTenants({ buildingId: 'b-1' });

    expect(api.get).toHaveBeenCalledWith('/api/admin/tenants', { params: { buildingId: 'b-1' } });
    expect(result).toEqual(mockData);
  });

  it('getTenantDetail ควรเรียก GET /api/admin/tenants/:id พร้อม params', async () => {
    const mockData = { success: true, data: { id: 't-1', firstName: 'Somsak', rooms: [] } };
    api.get.mockResolvedValueOnce({ data: mockData });

    const result = await tenantService.getTenantDetail('t-1', { buildingId: 'b-1' });

    expect(api.get).toHaveBeenCalledWith('/api/admin/tenants/t-1', { params: { buildingId: 'b-1' } });
    expect(result).toEqual(mockData);
  });

  it('updateTenantNotes ควรเรียก PATCH /api/admin/tenants/:id/notes พร้อม payload', async () => {
    const payload = { internalNotes: 'Good tenant', isBlacklisted: false };
    const mockData = { success: true, data: { id: 't-1', ...payload } };
    api.patch.mockResolvedValueOnce({ data: mockData });

    const result = await tenantService.updateTenantNotes('t-1', payload);

    expect(api.patch).toHaveBeenCalledWith('/api/admin/tenants/t-1/notes', payload);
    expect(result).toEqual(mockData);
  });
});
