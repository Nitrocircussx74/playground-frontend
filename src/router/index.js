import { createRouter, createWebHistory } from 'vue-router';
import { useAdminAuthStore } from '@/stores/adminAuth';
import { useAuthStore } from '@/stores/auth';

const routes = [
  {
    path: '/',
    redirect: '/admin/dashboard'
  },

  // -------------------------------------------------------------
  // 1. กลุ่มระบบ ADMIN (ใช้ AdminLayout มี Sidebar & Navigation Guard JWT)
  // -------------------------------------------------------------
  {
    path: '/admin',
    component: () => import('@/layouts/AdminLayout.vue'),
    meta: { requiresAdminAuth: true },
    children: [
      {
        path: '',
        redirect: '/admin/dashboard'
      },
      {
        path: 'dashboard',
        name: 'AdminDashboard',
        component: () => import('@/views/admin/AdminDashboard.vue')
      },
      {
        path: 'rooms',
        name: 'AdminRooms',
        component: () => import('@/views/admin/AdminRooms.vue')
      }
    ]
  },

  // -------------------------------------------------------------
  // 2. กลุ่มระบบ LIFF (ใช้ LiffLayout เปล่าสำหรับเปิดบนแอป LINE)
  // -------------------------------------------------------------
  {
    path: '/liff',
    component: () => import('@/layouts/LiffLayout.vue'),
    children: [
      {
        path: '',
        name: 'LiffHome',
        component: () => import('@/views/liff/LiffHome.vue')
      },
      {
        path: 'bills',
        name: 'LiffBills',
        component: () => import('@/views/liff/LiffBills.vue')
      }
    ]
  },

  // Auth Routes หลักเดิม
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

// Navigation Guard (router.beforeEach) เพื่อแยกการตรวจสิทธิ์ของ Admin และ LIFF
router.beforeEach(async (to, from, next) => {
  const adminAuthStore = useAdminAuthStore();
  const authStore = useAuthStore();

  // 1. ตรวจสอบการทำ Silent Refresh สำหรับ Auth Store เดิมก่อน
  if (!authStore.isInitialized && !authStore.isAuthenticated) {
    await authStore.silentRefresh();
  }

  // 2. ตรวจสอบสิทธิ์สำหรับกลุ่ม Admin Routes
  if (to.meta.requiresAdminAuth) {
    // ในระบบจริง หากไม่มี JWT Admin Token หรือไม่ได้เป็น Admin สามารถ Redirect ไปหน้า Login
    // (สำหรับการทดสอบ หากล็อกอินใน authStore ถือว่าใช้สิทธิ์เข้าชมได้)
    if (!adminAuthStore.isAdminAuthenticated && !authStore.isAuthenticated) {
      return next({ path: '/login', query: { redirect: to.fullPath } });
    }
  }

  // 3. กลุ่ม LIFF Routes ปล่อยผ่านไปให้ LIFF SDK ใน Component จัดการ (ไม่บล็อกด้วย Router Guard)
  next();
});

export default router;
