import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mount } from '@vue/test-utils';
import { createPinia, setActivePinia } from 'pinia';
import LiffOwnerDashboardView from './LiffOwnerDashboardView.vue';
import { useAuthStore } from '@/stores/auth';
import { useDashboardStore } from '@/stores/useDashboardStore';
import { useBuildingStore } from '@/stores/useBuildingStore';
import invoiceService from '@/services/invoiceService';
import maintenanceService from '@/services/maintenanceService';
import * as swal from '@/utils/swal';

vi.mock('vue-router', async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    useRouter: () => ({ push: vi.fn() })
  };
});

vi.mock('@/services/invoiceService', () => ({
  default: {
    updateInvoiceStatus: vi.fn(() => Promise.resolve({ success: true }))
  }
}));

vi.mock('@/services/maintenanceService', () => ({
  default: {
    updateMaintenanceRequest: vi.fn(() => Promise.resolve({ success: true }))
  }
}));

vi.mock('@/utils/swal', () => ({
  showSuccess: vi.fn(),
  showError: vi.fn(),
  showConfirm: vi.fn(() => Promise.resolve(true)),
  showPrompt: vi.fn(() => Promise.resolve('ยอดเงินไม่ตรง'))
}));

describe('LiffOwnerDashboardView Unit Tests', () => {
  let pinia;

  beforeEach(() => {
    vi.clearAllMocks();
    global.localStorage = {
      getItem: vi.fn(() => null),
      setItem: vi.fn(),
      removeItem: vi.fn()
    };
    pinia = createPinia();
    setActivePinia(pinia);
  });

  const setupComponent = () => {
    const authStore = useAuthStore();
    authStore.user = { name: 'นายเจ้าของ หอพัก' };
    authStore.tenant = { id: 't-1', name: 'นายเจ้าของ หอพัก' };

    const dashboardStore = useDashboardStore();
    dashboardStore.summary = {
      occupancy: { totalRooms: 20, occupiedRooms: 18, occupancyRate: 90 },
      financial: { currentTotal: 95000, currentCycle: '09-2026' },
      debt: { totalDebt: 5000, debtorCount: 1 },
      pendingSlips: [
        {
          id: 'inv-1',
          invoiceNumber: 'INV-001',
          grandTotal: 5000,
          slipUrl: 'https://example.com/slip.jpg',
          room: { roomNumber: '101' },
          tenant: { firstName: 'สมชาย', lastName: 'ใจดี' }
        }
      ],
      pendingMaintenanceRequests: [
        {
          id: 'm-1',
          title: 'แอร์น้ำหยด',
          description: 'น้ำแอร์หยดลงเตียง',
          status: 'pending',
          room: { roomNumber: '101' }
        }
      ],
      expiringLeases: [
        {
          id: 'l-1',
          expectedEndDate: new Date(Date.now() + 15 * 86400000).toISOString(),
          room: { roomNumber: '101' },
          tenant: { firstName: 'สมชาย', lastName: 'ใจดี', phone: '0812345678' }
        }
      ]
    };

    const buildingStore = useBuildingStore();
    buildingStore.buildings = [{ id: 'b-1', name: 'อาคาร A' }];

    return mount(LiffOwnerDashboardView, {
      global: {
        plugins: [pinia],
        stubs: {
          OwnerMetricCard: true
        }
      }
    });
  };

  it('renders executive banner and action items properly', () => {
    const wrapper = setupComponent();

    expect(wrapper.text()).toContain('แดชบอร์ดเจ้าของตึก (Executive View)');
    expect(wrapper.text()).toContain('สลิปโอนเงินรอยืนยัน');
    expect(wrapper.text()).toContain('1 สลิป');
    expect(wrapper.text()).toContain('งานแจ้งซ่อมรอดำเนินการ');
    expect(wrapper.text()).toContain('1 รายการ');
    expect(wrapper.text()).toContain('สัญญาเช่าใกล้หมดอายุ (30 วัน)');
    expect(wrapper.text()).toContain('1 สัญญา');
  });

  it('opens slip modal and approves payment slip', async () => {
    const wrapper = setupComponent();

    // Click on Slip Action Item
    const slipCard = wrapper.findAll('.cursor-pointer').find((el) => el.text().includes('สลิปโอนเงินรอยืนยัน'));
    await slipCard.trigger('click');

    expect(wrapper.text()).toContain('รายการสลิปรอตรวจสอบ');
    expect(wrapper.text()).toContain('ห้อง 101');
    expect(wrapper.text()).toContain('฿5,000.00');

    // Click Approve Button
    const approveBtn = wrapper.findAll('button').find((b) => b.text().includes('อนุมัติรับชำระ'));
    expect(approveBtn).toBeDefined();
    await approveBtn.trigger('click');

    expect(swal.showConfirm).toHaveBeenCalled();
    expect(invoiceService.updateInvoiceStatus).toHaveBeenCalledWith('inv-1', { status: 'paid' });
  });

  it('rejects payment slip with reason prompt', async () => {
    const wrapper = setupComponent();

    const slipCard = wrapper.findAll('.cursor-pointer').find((el) => el.text().includes('สลิปโอนเงินรอยืนยัน'));
    await slipCard.trigger('click');

    const rejectBtn = wrapper.findAll('button').find((b) => b.text().includes('ขอให้ส่งสลิปใหม่'));
    expect(rejectBtn).toBeDefined();
    await rejectBtn.trigger('click');

    expect(swal.showPrompt).toHaveBeenCalled();
    expect(invoiceService.updateInvoiceStatus).toHaveBeenCalledWith('inv-1', {
      status: 'pending',
      rejectionReason: 'ยอดเงินไม่ตรง'
    });
  });

  it('opens maintenance modal and updates request status', async () => {
    const wrapper = setupComponent();

    const maintCard = wrapper.findAll('.cursor-pointer').find((el) => el.text().includes('งานแจ้งซ่อมรอดำเนินการ'));
    await maintCard.trigger('click');

    expect(wrapper.text()).toContain('งานแจ้งซ่อมรอดำเนินการ (1)');
    expect(wrapper.text()).toContain('แอร์น้ำหยด');

    const inProgressBtn = wrapper.findAll('button').find((b) => b.text().includes('รับเรื่อง / กำลังซ่อม'));
    expect(inProgressBtn).toBeDefined();
    await inProgressBtn.trigger('click');

    expect(maintenanceService.updateMaintenanceRequest).toHaveBeenCalledWith('m-1', { status: 'in_progress' });
  });

  it('opens expiring leases modal and shows contact phone link', async () => {
    const wrapper = setupComponent();

    const leaseCard = wrapper.findAll('.cursor-pointer').find((el) => el.text().includes('สัญญาเช่าใกล้หมดอายุ'));
    await leaseCard.trigger('click');

    expect(wrapper.text()).toContain('สัญญาเช่าใกล้หมดอายุใน 30 วัน');
    expect(wrapper.text()).toContain('เบอร์ติดต่อ: 0812345678');
    const phoneLink = wrapper.find('a[href="tel:0812345678"]');
    expect(phoneLink.exists()).toBe(true);
  });
});

