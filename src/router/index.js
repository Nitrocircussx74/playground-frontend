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
  {
    path: '/liff/pay/:invoiceId',
    name: 'LiffPayment',
    component: () => import('@/views/LiffPaymentView.vue')
  },
  {
    path: '/liff/register',
    name: 'LiffRegister',
    component: () => import('@/views/LiffRegisterView.vue')
  },
  {
    path: '/liff/announcements',
    name: 'LiffAnnouncements',
    component: () => import('@/views/LiffAnnouncementsView.vue')
  },
  {
    path: '/liff/maintenance',
    name: 'LiffMaintenance',
    component: () => import('@/views/LiffMaintenanceView.vue')
  },
  {
    path: '/liff/receipts',
    name: 'LiffReceiptHistory',
    component: () => import('@/views/LiffReceiptHistoryView.vue')
  },
  {
    path: '/liff/profile',
    name: 'LiffProfile',
    component: () => import('@/views/LiffProfileView.vue')
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

// Navigation Guard (router.beforeEach)
router.beforeEach(async (to, from, next) => {
  const authStore = useAuthStore();

  if (!authStore.isInitialized && !authStore.isAuthenticated) {
    await authStore.silentRefresh();
  }

  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    return next({ path: '/login', query: { redirect: to.fullPath } });
  }

  next();
});

export default router;
