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
    meta: { guestOnly: true }
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

// Route Guard (router.beforeEach) เพื่อตรวจสอบการเข้าถึงหน้าเว็บ
router.beforeEach(async (to, from, next) => {
  const authStore = useAuthStore();

  // หากแอปยังไม่เคยพยายามทำ Silent Refresh (เช่น เมื่อเพิ่งกด Refresh หน้าจอ F5)
  // ให้ลองขอ Access Token ใหม่ด้วย HTTP-Only Cookie ก่อน
  if (!authStore.isInitialized && !authStore.isAuthenticated) {
    await authStore.silentRefresh();
  }

  // 1. หน้าที่ต้องล็อกอิน (Protected Routes)
  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    return next({
      path: '/login',
      query: { redirect: to.fullPath }
    });
  }

  // 2. หน้าสำหรับผู้เยี่ยมชมเท่านั้น (เช่น หน้า Login หากล็อกอินแล้วให้ข้ามไป Dashboard)
  if (to.meta.guestOnly && authStore.isAuthenticated) {
    return next('/dashboard');
  }

  next();
});

export default router;
