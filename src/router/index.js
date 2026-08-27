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
    path: '/403',
    name: 'Forbidden',
    component: () => import('@/views/ForbiddenView.vue'),
    meta: { isCms: true }
  },
  {
    path: '/dashboard',
    name: 'Dashboard',
    component: () => import('@/views/DashboardView.vue'),
    meta: { isCms: true, requiresAuth: true, roles: ['admin'] }
  },
  {
    path: '/rooms',
    name: 'Rooms',
    component: () => import('@/views/RoomsView.vue'),
    meta: { isCms: true, requiresAuth: true, roles: ['admin'] }
  },
  {
    path: '/leases',
    name: 'Leases',
    component: () => import('@/views/LeasesView.vue'),
    meta: { isCms: true, requiresAuth: true, roles: ['admin'] }
  },
  {
    path: '/buildings',
    name: 'Buildings',
    component: () => import('@/views/BuildingManagementView.vue'),
    meta: { isCms: true, requiresAuth: true, roles: ['admin'] }
  },
  {
    path: '/building-settings',
    name: 'BuildingSettings',
    component: () => import('@/views/BuildingSettingsView.vue'),
    meta: { isCms: true, requiresAuth: true, roles: ['admin'] }
  },
  {
    path: '/meter-readings',
    name: 'MeterReadings',
    component: () => import('@/views/MeterReadingsView.vue'),
    meta: { isCms: true, requiresAuth: true, roles: ['admin'] }
  },
  {
    path: '/invoices',
    name: 'Invoices',
    component: () => import('@/views/InvoicesView.vue'),
    meta: { isCms: true, requiresAuth: true, roles: ['admin'] }
  },
  {
    path: '/maintenance',
    name: 'Maintenance',
    component: () => import('@/views/MaintenanceView.vue'),
    meta: { isCms: true, requiresAuth: true, roles: ['admin'] }
  },
  {
    path: '/announcements',
    name: 'Announcements',
    component: () => import('@/views/AnnouncementsView.vue'),
    meta: { isCms: true, requiresAuth: true, roles: ['admin'] }
  },
  {
    path: '/parcels',
    name: 'AdminParcels',
    component: () => import('@/views/AdminParcelView.vue'),
    meta: { isCms: true, requiresAuth: true, roles: ['admin'] }
  },
  {
    path: '/admin/parcels',
    name: 'AdminParcelsDirect',
    component: () => import('@/views/AdminParcelView.vue'),
    meta: { isCms: true, requiresAuth: true, roles: ['admin'] }
  },
  {
    path: '/features',
    name: 'FeatureSettings',
    component: () => import('@/views/FeatureSettingsView.vue'),
    meta: { isCms: true, requiresAuth: true, roles: ['admin'] }
  },
  {
    path: '/profile',
    name: 'Profile',
    component: () => import('@/views/ProfileView.vue'),
    meta: { isCms: true, requiresAuth: true }
  },
  {
    path: '/admin/users',
    name: 'AdminUserManagement',
    component: () => import('@/views/AdminUserManagementView.vue'),
    meta: { isCms: true, requiresAuth: true, roles: ['owner', 'super_admin', 'superadmin'] }
  },
  {
    path: '/admin/audit-logs',
    name: 'AuditLogViewer',
    component: () => import('@/views/AuditLogViewer.vue'),
    meta: { isCms: true, requiresAuth: true, roles: ['owner', 'super_admin', 'superadmin'] }
  },

  // 📱 2. LINE / LIFF Tenant Portal Routes (แยก Guard ทำงานอิสระเฉพาะของฝั่ง LINE)
  {
    path: '/liff',
    component: () => import('@/layouts/LiffLayout.vue'),
    meta: { isLiff: true },
    children: [
      {
        path: '',
        name: 'LiffEntry',
        component: () => import('@/views/LiffEntryView.vue'),
        meta: { isLiff: true, title: 'ระบบจัดการหอพัก (LINE LIFF)' }
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
        path: 'onboarding',
        name: 'LiffOnboarding',
        component: () => import('@/views/LiffOnboardingView.vue'),
        meta: { isLiff: true, title: 'ผูกบัญชีลูกบ้าน (Account Linking)' }
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
        path: 'parcels',
        name: 'LiffParcels',
        component: () => import('@/views/LiffParcelsView.vue'),
        meta: { isLiff: true, title: 'จัดการพัสดุของฉัน (My Parcels)' }
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

  if (to.meta.roles && to.meta.roles.length > 0) {
    const userRole = (
      authStore.user?.role ||
      authStore.currentUser?.role ||
      'tenant'
    ).toLowerCase();

    const allowedRoles = to.meta.roles.map((r) => r.toLowerCase());
    const isCmsAdminUser = ['admin', 'super_admin', 'superadmin', 'owner', 'manager'].includes(userRole);

    // If route requires 'admin' role, allow any CMS backoffice role (admin, super_admin, owner, manager)
    if (allowedRoles.includes('admin') && isCmsAdminUser) {
      return next();
    }

    if (!allowedRoles.includes(userRole)) {
      return next({ path: '/403' });
    }
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
