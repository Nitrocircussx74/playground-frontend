import { describe, it, expect, beforeEach } from 'vitest';
import { mount } from '@vue/test-utils';
import { createRouter, createMemoryHistory } from 'vue-router';
import { createPinia, setActivePinia } from 'pinia';
import LiffLayout from './LiffLayout.vue';

describe('LiffLayout Component Unit Tests', () => {
  let pinia;

  beforeEach(() => {
    pinia = createPinia();
    setActivePinia(pinia);
  });

  const createTestRouter = () => {
    return createRouter({
      history: createMemoryHistory(),
      routes: [
        { path: '/liff', name: 'LiffEntry', component: { template: '<div>Entry</div>' } },
        { path: '/liff/register', name: 'LiffRegister', component: { template: '<div>Register</div>' } },
        { path: '/liff/onboarding', name: 'LiffOnboarding', component: { template: '<div>Onboarding</div>' } },
        { path: '/liff/profile', name: 'LiffProfile', component: { template: '<div>Profile</div>' }, meta: { title: 'ศูนย์กลางลูกบ้าน' } },
        { path: '/liff/owner-dashboard', name: 'LiffOwnerDashboard', component: { template: '<div>OwnerDashboard</div>' }, meta: { title: 'แดชบอร์ดเจ้าของตึก' } },
        { path: '/liff/invoices/123', name: 'LiffInvoiceDetail', component: { template: '<div>Detail</div>' }, meta: { title: 'รายละเอียดบิล' } }
      ]
    });
  };

  it('ควรซ่อน Bottom Navigation Bar เมื่ออยู่ในหน้า Entry Gateway (/liff)', async () => {
    const router = createTestRouter();
    await router.push('/liff');
    await router.isReady();

    const wrapper = mount(LiffLayout, {
      global: {
        plugins: [router, pinia],
        stubs: {
          'router-view': true,
          'router-link': true
        }
      }
    });

    expect(wrapper.find('nav').exists()).toBe(false);
  });

  it('ควรซ่อน Bottom Navigation Bar เมื่ออยู่ในหน้า Register (/liff/register)', async () => {
    const router = createTestRouter();
    await router.push('/liff/register');
    await router.isReady();

    const wrapper = mount(LiffLayout, {
      global: {
        plugins: [router, pinia],
        stubs: {
          'router-view': true,
          'router-link': true
        }
      }
    });

    expect(wrapper.find('nav').exists()).toBe(false);
  });

  it('ควรแสดง Bottom Navigation Bar เมื่ออยู่ในหน้า Profile (/liff/profile)', async () => {
    const router = createTestRouter();
    await router.push('/liff/profile');
    await router.isReady();

    const wrapper = mount(LiffLayout, {
      global: {
        plugins: [router, pinia],
        stubs: {
          'router-view': true,
          NotificationBell: true
        }
      }
    });

    expect(wrapper.find('nav').exists()).toBe(true);
    expect(wrapper.text()).toContain('หน้าแรก');
    expect(wrapper.text()).toContain('ใบเสร็จ');
    expect(wrapper.text()).toContain('แจ้งซ่อม');
  });

  it('ควรแสดงปุ่มย้อนกลับ (Back Button) เมื่ออยู่ในหน้าย่อย เช่น /liff/invoices/123', async () => {
    const router = createTestRouter();
    await router.push('/liff/invoices/123');
    await router.isReady();

    const wrapper = mount(LiffLayout, {
      global: {
        plugins: [router, pinia],
        stubs: {
          'router-view': true,
          NotificationBell: true
        }
      }
    });

    const backButton = wrapper.find('button[aria-label="ย้อนกลับ"]');
    expect(backButton.exists()).toBe(true);
  });

  it('ไม่ควรแสดงปุ่มย้อนกลับเมื่ออยู่ในหน้าแดชบอร์ดหลักของเจ้าของ (/liff/owner-dashboard)', async () => {
    const router = createTestRouter();
    await router.push('/liff/owner-dashboard');
    await router.isReady();

    const wrapper = mount(LiffLayout, {
      global: {
        plugins: [router, pinia],
        stubs: {
          'router-view': true,
          NotificationBell: true
        }
      }
    });

    const backButton = wrapper.find('button[aria-label="ย้อนกลับ"]');
    expect(backButton.exists()).toBe(false);
  });

  it('ควรแสดงแถบเมนูสำหรับเจ้าของ (Owner Tabs) เมื่ออยู่ในหน้า /liff/owner-dashboard', async () => {
    const router = createTestRouter();
    await router.push('/liff/owner-dashboard');
    await router.isReady();

    const wrapper = mount(LiffLayout, {
      global: {
        plugins: [router, pinia],
        stubs: {
          'router-view': true,
          NotificationBell: true
        }
      }
    });

    const nav = wrapper.find('nav');
    expect(nav.exists()).toBe(true);
    expect(wrapper.text()).toContain('ภาพรวม');
    expect(wrapper.text()).toContain('ตรวจสลิป');
    expect(wrapper.text()).toContain('สัญญาเช่า');
    expect(wrapper.text()).not.toContain('ใบเสร็จ');
  });

  it('ควรสลับแท็บเมนูตาม activeRole เมื่อเป็นเจ้าของที่มีหลายบทบาท (Dual-Role)', async () => {
    const { useAuthStore } = await import('@/stores/auth');
    const authStore = useAuthStore();
    authStore.user = { role: 'owner', name: 'เจ้าของตึก' };
    authStore.setAvailableRoles(['owner', 'tenant']);
    authStore.setActiveRole('owner');

    const router = createTestRouter();
    await router.push('/liff/settings');
    await router.isReady();

    const wrapper = mount(LiffLayout, {
      global: {
        plugins: [router, pinia],
        stubs: {
          'router-view': true,
          NotificationBell: true
        }
      }
    });

    expect(wrapper.text()).toContain('ภาพรวม');
    expect(wrapper.text()).toContain('ตรวจสลิป');

    // สลับบทบาทเป็นลูกบ้าน (Tenant View)
    authStore.setActiveRole('tenant');
    await wrapper.vm.$nextTick();

    expect(wrapper.text()).toContain('หน้าแรก');
    expect(wrapper.text()).toContain('ใบเสร็จ');
    expect(wrapper.text()).not.toContain('ตรวจสลิป');
  });
});
