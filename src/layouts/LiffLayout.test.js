import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import { createRouter, createMemoryHistory } from 'vue-router';
import LiffLayout from './LiffLayout.vue';

describe('LiffLayout Component Unit Tests', () => {
  const createTestRouter = () => {
    return createRouter({
      history: createMemoryHistory(),
      routes: [
        { path: '/liff', name: 'LiffEntry', component: { template: '<div>Entry</div>' } },
        { path: '/liff/register', name: 'LiffRegister', component: { template: '<div>Register</div>' } },
        { path: '/liff/onboarding', name: 'LiffOnboarding', component: { template: '<div>Onboarding</div>' } },
        { path: '/liff/profile', name: 'LiffProfile', component: { template: '<div>Profile</div>' }, meta: { title: 'ศูนย์กลางลูกบ้าน' } },
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
        plugins: [router],
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
        plugins: [router],
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
        plugins: [router],
        stubs: {
          'router-view': true,
          'router-link': true
        }
      }
    });

    expect(wrapper.find('nav').exists()).toBe(true);
  });

  it('ควรแสดงปุ่มย้อนกลับ (Back Button) เมื่ออยู่ในหน้าย่อย เช่น /liff/invoices/123', async () => {
    const router = createTestRouter();
    await router.push('/liff/invoices/123');
    await router.isReady();

    const wrapper = mount(LiffLayout, {
      global: {
        plugins: [router],
        stubs: {
          'router-view': true,
          'router-link': true
        }
      }
    });

    const backButton = wrapper.find('button');
    expect(backButton.exists()).toBe(true);
  });
});
