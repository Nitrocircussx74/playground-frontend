import { createRouter, createWebHistory } from 'vue-router';
import { useAuthStore } from '@/stores/auth';

const routes = [
  {
    path: '/',
    redirect: '/dashboard'
  },
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/LoginView.vue'),
    meta: { isCms: true }
  },

  // 🏢 1. CMS Admin Backoffice Routes (ต้องการสิทธิ์ Admin JWT Authentication)
  {
    path: '/dashboard',
    name: 'Dashboard',
    component: () => import('@/views/DashboardView.vue'),
    meta: { isCms: true, requiresAuth: true }
  },
  {
    path: '/rooms',
    name: 'Rooms',
    component: () => import('@/views/RoomsView.vue'),
    meta: { isCms: true, requiresAuth: true }
  },
  {
    path: '/meter-readings',
    name: 'MeterReadings',
    component: () => import('@/views/MeterReadingsView.vue'),
    meta: { isCms: true, requiresAuth: true }
  },
  {
    path: '/invoices',
    name: 'Invoices',
    component: () => import('@/views/InvoicesView.vue'),
    meta: { isCms: true, requiresAuth: true }
  },
  {
    path: '/maintenance',
    name: 'Maintenance',
    component: () => import('@/views/MaintenanceView.vue'),
    meta: { isCms: true, requiresAuth: true }
  },
  {
    path: '/announcements',
    name: 'Announcements',
    component: () => import('@/views/AnnouncementsView.vue'),
    meta: { isCms: true, requiresAuth: true }
  },
  {
    path: '/features',
    name: 'FeatureSettings',
    component: () => import('@/views/FeatureSettingsView.vue'),
    meta: { isCms: true, requiresAuth: true }
  },
  {
    path: '/profile',
    name: 'Profile',
    component: () => import('@/views/ProfileView.vue'),
    meta: { isCms: true, requiresAuth: true }
  },

  // 📱 2. LINE / LIFF Tenant Portal Routes (แยก Guard ทำงานอิสระเฉพาะของฝั่ง LINE)
  {
    path: '/liff',
    component: () => import('@/layouts/LiffLayout.vue'),
    meta: { isLiff: true },
    children: [
      {
        path: '',
        redirect: '/liff/profile'
      },
      {
        path: 'profile',
        name: 'LiffProfile',
        component: () => import('@/views/LiffProfileView.vue'),
        meta: { isLiff: true, title: 'ศูนย์กลางลูกบ้าน (Tenant Hub)' }
      },
      {
        path: 'profile/edit',
        name: 'LiffUpdateProfile',
        component: () => import('@/views/LiffUpdateProfileView.vue'),
        meta: { isLiff: true, title: 'แก้ไขข้อมูลส่วนตัว' }
      },
      {
        path: 'invoices',
        name: 'LiffInvoiceList',
        component: () => import('@/views/LiffInvoiceListView.vue'),
        meta: { isLiff: true, title: 'บิลค่าเช่าทั้งหมด' }
      },
      {
        path: 'invoices/:id',
        name: 'LiffInvoiceDetail',
        component: () => import('@/views/LiffInvoiceDetailView.vue'),
        meta: { isLiff: true, title: 'รายละเอียดบิล & ชำระเงิน' }
      },
      {
        path: 'pay/:invoiceId',
        name: 'LiffPayment',
        component: () => import('@/views/LiffPaymentView.vue'),
        meta: { isLiff: true, title: 'ชำระเงินบิลค่าเช่า' }
      },
      {
        path: 'register',
        name: 'LiffRegister',
        component: () => import('@/views/LiffRegisterView.vue'),
        meta: { isLiff: true, title: 'ลงทะเบียนลูกบ้าน' }
      },
      {
        path: 'announcements',
        name: 'LiffAnnouncements',
        component: () => import('@/views/LiffAnnouncementsView.vue'),
        meta: { isLiff: true, title: 'ข่าวสาร & ประกาศหอพัก' }
      },
      {
        path: 'maintenance',
        name: 'LiffMaintenance',
        component: () => import('@/views/LiffMaintenanceView.vue'),
        meta: { isLiff: true, title: 'แจ้งซ่อม & ติดตามสถานะ' }
      },
      {
        path: 'receipts',
        name: 'LiffReceiptHistory',
        component: () => import('@/views/LiffReceiptHistoryView.vue'),
        meta: { isLiff: true, title: 'ประวัติบิล & ใบเสร็จ E-Receipt' }
      }
    ]
  },

  {
    path: '/:pathMatch(.*)*',
    redirect: '/'
  }
];

const router = createRouter({
  history: createWebHistory(),
  routes
});

async function cmsNavigationGuard(to, from, next) {
  const authStore = useAuthStore();

  if (!authStore.isInitialized && !authStore.isAuthenticated) {
    await authStore.silentRefresh();
  }

  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    return next({ path: '/login', query: { redirect: to.fullPath } });
  }

  next();
}

async function liffNavigationGuard(to, from, next) {
  console.log(`[LIFF Dedicated Guard] Routing to: ${to.path}`);
  next();
}

router.beforeEach(async (to, from, next) => {
  if (to.path.startsWith('/liff') || to.meta.isLiff) {
    return liffNavigationGuard(to, from, next);
  } else {
    return cmsNavigationGuard(to, from, next);
  }
});

export default router;
