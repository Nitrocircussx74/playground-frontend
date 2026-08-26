<template>
  <div class="profile-page">
    <div class="glass-card profile-card">
      <div class="avatar-section">
        <div class="avatar">
          {{ userInitials }}
        </div>
        <h2>User Profile</h2>
        <p class="role-tag">Authenticated Account</p>
      </div>

      <div class="profile-details">
        <div class="detail-row">
          <span class="detail-label">Email Address</span>
          <span class="detail-value">{{ authStore.currentUser?.email || 'N/A' }}</span>
        </div>

        <div class="detail-row">
          <span class="detail-label">User ID</span>
          <span class="detail-value"><code>{{ authStore.currentUser?.id || 'N/A' }}</code></span>
        </div>

        <div class="detail-row">
          <span class="detail-label">Auth Provider</span>
          <span class="detail-value badge badge-success">Local / JWT Cookie</span>
        </div>
      </div>

      <div class="action-footer">
        <button @click="refreshProfile" class="btn btn-secondary" :disabled="loading">
          Reload Profile (GET /auth/me)
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useAuthStore } from '@/stores/auth';

const authStore = useAuthStore();
const loading = ref(false);

const userInitials = computed(() => {
  const email = authStore.currentUser?.email || '';
  return email ? email.slice(0, 2).toUpperCase() : 'US';
});

const refreshProfile = async () => {
  loading.value = true;
  try {
    await authStore.fetchProfile();
  } finally {
    loading.value = false;
  }
};
</script>

<style scoped>
.profile-page {
  display: flex;
  justify-content: center;
  margin-top: 20px;
}

.profile-card {
  width: 100%;
  max-width: 500px;
  padding: 36px;
}

.avatar-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 28px;
}

.avatar {
  width: 72px;
  height: 72px;
  border-radius: 50%;
  background: linear-gradient(135deg, var(--accent-purple), var(--accent-blue));
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  font-weight: 700;
  color: white;
  margin-bottom: 14px;
  box-shadow: 0 4px 15px rgba(139, 92, 246, 0.4);
}

.avatar-section h2 {
  font-size: 1.5rem;
  margin-bottom: 4px;
}

.role-tag {
  color: var(--text-muted);
  font-size: 0.85rem;
}

.profile-details {
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin-bottom: 28px;
  background: rgba(15, 23, 42, 0.4);
  padding: 20px;
  border-radius: 12px;
  border: 1px solid var(--border-color);
}

.detail-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.9rem;
}

.detail-label {
  color: var(--text-muted);
}

.detail-value {
  font-weight: 600;
}

.action-footer {
  display: flex;
  justify-content: center;
}
</style>
