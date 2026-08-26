<template>
  <div id="layout">
    <header class="navbar">
      <div class="container nav-content">
        <router-link to="/" class="logo">
          <span class="logo-icon">⚡</span>
          <span class="logo-text">Vue3 Auth Portal</span>
        </router-link>

        <nav class="nav-links" v-if="authStore.isAuthenticated">
          <router-link to="/dashboard" class="nav-item">Dashboard</router-link>
          <router-link to="/profile" class="nav-item">Profile</router-link>
          
          <div class="user-info">
            <span class="user-email">{{ authStore.currentUser?.email }}</span>
            <button @click="handleLogout" class="btn btn-danger btn-sm" :disabled="authStore.loading">
              Logout
            </button>
          </div>
        </nav>

        <div v-else-if="!authStore.loading" class="nav-links">
          <router-link to="/login" class="btn btn-primary">Login</router-link>
        </div>
      </div>
    </header>

    <main class="container main-body">
      <router-view />
    </main>

    <footer class="footer">
      <div class="container">
        <p>Clean Architecture Vue 3 + Pinia + Axios Interceptors (HTTP-Only Cookie Auth)</p>
      </div>
    </footer>
  </div>
</template>

<script setup>
import { useAuthStore } from '@/stores/auth';
import { useRouter } from 'vue-router';

const authStore = useAuthStore();
const router = useRouter();

const handleLogout = async () => {
  await authStore.logout();
  router.push('/login');
};
</script>

<style scoped>
.navbar {
  background: rgba(15, 23, 42, 0.85);
  backdrop-filter: blur(12px);
  border-bottom: 1px solid var(--border-color);
  position: sticky;
  top: 0;
  z-index: 100;
}

.container {
  max-width: 1100px;
  margin: 0 auto;
  padding: 0 24px;
}

.nav-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 70px;
}

.logo {
  display: flex;
  align-items: center;
  gap: 10px;
  text-decoration: none;
  color: white;
  font-weight: 700;
  font-size: 1.2rem;
}

.nav-links {
  display: flex;
  align-items: center;
  gap: 20px;
}

.nav-item {
  color: var(--text-muted);
  text-decoration: none;
  font-weight: 500;
  transition: color 0.2s ease;
}

.nav-item:hover,
.nav-item.router-link-active {
  color: var(--accent-purple);
}

.user-info {
  display: flex;
  align-items: center;
  gap: 12px;
  padding-left: 12px;
  border-left: 1px solid var(--border-color);
}

.user-email {
  font-size: 0.9rem;
  color: var(--text-muted);
}

.btn-sm {
  padding: 6px 14px;
  font-size: 13px;
}

.main-body {
  padding-top: 40px;
  padding-bottom: 60px;
  min-height: calc(100vh - 150px);
}

.footer {
  text-align: center;
  padding: 20px 0;
  border-top: 1px solid var(--border-color);
  color: var(--text-muted);
  font-size: 0.85rem;
}
</style>
