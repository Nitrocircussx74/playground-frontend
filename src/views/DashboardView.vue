<template>
  <div class="dashboard">
    <div class="header-section">
      <h1>Protected API Dashboard</h1>
      <p>Test JWT authorization headers & silent refresh interceptor</p>
    </div>

    <div class="grid">
      <!-- Status Card -->
      <div class="glass-card card">
        <h3>🔑 Auth Status (Memory State)</h3>
        <div class="status-list">
          <div class="status-item">
            <span>Access Token Status:</span>
            <span class="badge badge-success" v-if="authStore.accessToken">
              Active in Pinia State
            </span>
            <span class="badge badge-warning" v-else>Missing</span>
          </div>

          <div class="status-item">
            <span>Refresh Token Storage:</span>
            <span class="badge badge-success">HTTP-Only Cookie (Browser Managed)</span>
          </div>

          <div class="status-item">
            <span>User ID:</span>
            <code>{{ authStore.currentUser?.id || 'N/A' }}</code>
          </div>
        </div>

        <div class="token-preview" v-if="authStore.accessToken">
          <label>Access Token Preview (Truncated):</label>
          <code>{{ truncatedToken }}</code>
        </div>
      </div>

      <!-- Action Card -->
      <div class="glass-card card">
        <h3>🚀 Test Protected Endpoints</h3>
        <p class="card-desc">Execute API calls to backend requiring <code>Authorization: Bearer</code> header</p>

        <div class="btn-group">
          <button @click="fetchApiOverview" class="btn btn-primary" :disabled="loading">
            GET /api (Overview)
          </button>
          <button @click="triggerManualRefresh" class="btn btn-secondary" :disabled="loading">
            Silent Refresh Token
          </button>
        </div>

        <div v-if="apiResponse" class="response-box">
          <div class="response-header">
            <span>API Response Output</span>
            <span class="badge badge-success">HTTP 200 OK</span>
          </div>
          <pre>{{ JSON.stringify(apiResponse, null, 2) }}</pre>
        </div>

        <div v-if="apiError" class="error-alert">
          {{ apiError }}
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useAuthStore } from '@/stores/auth';
import api from '@/utils/api';

const authStore = useAuthStore();
const loading = ref(false);
const apiResponse = ref(null);
const apiError = ref(null);

const truncatedToken = computed(() => {
  if (!authStore.accessToken) return '';
  return `${authStore.accessToken.slice(0, 20)}...${authStore.accessToken.slice(-20)}`;
});

const fetchApiOverview = async () => {
  loading.value = true;
  apiResponse.value = null;
  apiError.value = null;
  try {
    const res = await api.get('/api');
    apiResponse.value = res.data;
  } catch (err) {
    apiError.value = err.response?.data?.message || 'Failed to fetch API overview';
  } finally {
    loading.value = false;
  }
};

const triggerManualRefresh = async () => {
  loading.value = true;
  apiError.value = null;
  try {
    const success = await authStore.silentRefresh();
    if (success) {
      apiResponse.value = { message: 'Token rotated successfully via HTTP-Only cookie!' };
    }
  } catch (err) {
    apiError.value = 'Manual refresh failed.';
  } finally {
    loading.value = false;
  }
};
</script>

<style scoped>
.header-section {
  margin-bottom: 30px;
}

.header-section h1 {
  font-size: 2rem;
  margin-bottom: 6px;
}

.header-section p {
  color: var(--text-muted);
}

.grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(340px, 1fr));
  gap: 24px;
}

.card {
  padding: 28px;
}

.card h3 {
  font-size: 1.2rem;
  margin-bottom: 16px;
}

.card-desc {
  color: var(--text-muted);
  font-size: 0.9rem;
  margin-bottom: 20px;
}

.status-list {
  display: flex;
  flex-direction: column;
  gap: 14px;
  margin-bottom: 20px;
}

.status-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.9rem;
}

.token-preview {
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding-top: 14px;
  border-top: 1px solid var(--border-color);
  font-size: 0.85rem;
}

.token-preview label {
  color: var(--text-muted);
}

code {
  background: rgba(0, 0, 0, 0.4);
  padding: 4px 8px;
  border-radius: 6px;
  font-family: monospace;
  font-size: 0.8rem;
  color: var(--accent-purple);
  word-break: break-all;
}

.btn-group {
  display: flex;
  gap: 12px;
  margin-bottom: 20px;
  flex-wrap: wrap;
}

.response-box {
  background: rgba(15, 23, 42, 0.8);
  border: 1px solid var(--border-color);
  border-radius: 10px;
  overflow: hidden;
}

.response-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 16px;
  background: rgba(255, 255, 255, 0.05);
  border-bottom: 1px solid var(--border-color);
  font-size: 0.85rem;
  font-weight: 600;
}

pre {
  padding: 16px;
  font-family: monospace;
  font-size: 0.85rem;
  color: #6ee7b7;
  overflow-x: auto;
}

.error-alert {
  padding: 12px;
  background: rgba(244, 63, 94, 0.15);
  border: 1px solid rgba(244, 63, 94, 0.3);
  color: #fda4af;
  border-radius: 8px;
  font-size: 0.9rem;
}
</style>
