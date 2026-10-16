import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import OwnerMetricCard from './OwnerMetricCard.vue';
import { TrendingUp } from 'lucide-vue-next';

describe('OwnerMetricCard Unit Tests', () => {
  it('renders title, value and subtitle properly', () => {
    const wrapper = mount(OwnerMetricCard, {
      props: {
        title: 'ยอดรับชำระแล้ว',
        value: '125,000.00',
        subtitle: 'รอบบิลก่อนหน้า: 110,000.00',
        trend: 13.6,
        icon: TrendingUp,
        variant: 'emerald'
      }
    });

    expect(wrapper.text()).toContain('ยอดรับชำระแล้ว');
    expect(wrapper.text()).toContain('125,000.00');
    expect(wrapper.text()).toContain('รอบบิลก่อนหน้า: 110,000.00');
    expect(wrapper.text()).toContain('+13.6%');
  });

  it('renders skeleton pulse when loading is true', () => {
    const wrapper = mount(OwnerMetricCard, {
      props: {
        title: 'ยอดรับชำระแล้ว',
        value: '125,000.00',
        icon: TrendingUp,
        loading: true
      }
    });

    expect(wrapper.find('.animate-pulse').exists()).toBe(true);
  });
});
