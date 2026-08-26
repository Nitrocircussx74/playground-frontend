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
    component: () => import('@/views/LoginView.vue')
  },
  {
    path: '/dashboard',
    name: 'Dashboard',
    component: () => import('@/views/DashboardView.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/rooms',
    name: 'Rooms',
    component: () => import('@/views/RoomsView.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/meter-readings',
    name: 'MeterReadings',
    component: () => import('@/views/MeterReadingsView.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/invoices',
    name: 'Invoices',
    component: () => import('@/views/InvoicesView.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/maintenance',
    name: 'Maintenance',
    component: () => import('@/views/MaintenanceView.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/announcements',
    name: 'Announcements',
    component: () => import('@/views/AnnouncementsView.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/features',
    name: 'FeatureSettings',
    component: () => import('@/views/FeatureSettingsView.vue'),
    meta: { requiresAuth: true }
  },

  // LIFF App Nested Router Layout (แยกส่วนอย่างสมบูรณ์จากระบบหลังบ้าน Admin)
  {
    path: '/liff',
    component: () => import('@/layouts/LiffLayout.vue'),
    children: [
      {
        path: '',
        redirect: '/liff/profile'
      },
      {
        path: 'profile',
        name: 'LiffProfile',
        component: () => import('@/views/LiffProfileView.vue'),
        meta: { title: 'ศูนย์กลางลูกบ้าน (Tenant Hub)' }
      },
      {
        path: 'pay/:invoiceId',
        name: 'LiffPayment',
        component: () => import('@/views/LiffPaymentView.vue'),
        meta: { title: 'ชำระเงินบิลค่าเช่า' }
      },
      {
        path: 'register',
        name: 'LiffRegister',
        component: () => import('@/views/LiffRegisterView.vue'),
        meta: { title: 'ลงทะเบียนลูกบ้าน' }
      },
      {
        path: 'announcements',
        name: 'LiffAnnouncements',
        component: () => import('@/views/LiffAnnouncementsView.vue'),
        meta: { title: 'ข่าวสาร & ประกาศหอพัก' }
      },
      {
        path: 'maintenance',
        name: 'LiffMaintenance',
        component: () => import('@/views/LiffMaintenanceView.vue'),
        meta: { title: 'แจ้งซ่อม & ติดตามสถานะ' }
      },
      {
        path: 'receipts',
        name: 'LiffReceiptHistory',
        component: () => import('@/views/LiffReceiptHistoryView.vue'),
        meta: { title: 'ประวัติบิล & ใบเสร็จ E-Receipt' }
      }
    ]
  },

  {
    path: '/profile',
    name: 'Profile',
    component: () => import('@/views/ProfileView.vue'),
    meta: { requiresAuth: true }
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

// Navigation Guard (router.beforeEach) - แยกสิทธิ์ LIFF ลูกบ้าน และ Admin หลังบ้านอย่างเด็ดขาด
router.beforeEach(async (to, from, next) => {
  const authStore = useAuthStore();

  // หากเป็นเส้นทางของ LIFF Portal (/liff/*) ข้ามการยืนยันตัวตน Cookie หลังบ้านของ Admin
  if (!to.path.startsWith('/liff')) {
    if (!authStore.isInitialized && !authStore.isAuthenticated) {
      await authStore.silentRefresh();
    }
  }

  // ป้องกันการแอบเข้าถึงหน้าหลังบ้าน Admin หากไม่ได้ Login
  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    return next({ path: '/login', query: { redirect: to.fullPath } });
  }

  next();
});

export default router;
