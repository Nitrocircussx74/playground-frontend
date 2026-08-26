<template>
  <div class="login-wrapper">
    <div class="glass-card login-card">
      <div class="login-header">
        <h2>Sign In</h2>
        <p>Enter your email to test JWT + HTTP-Only Cookie Login</p>
      </div>

      <form @submit.prevent="handleLogin" class="login-form">
        <div class="form-group">
          <label for="email">Email Address</label>
          <input
            id="email"
            v-model="email"
            type="email"
            class="input-field"
            placeholder="developer@example.com"
            required
            :disabled="authStore.loading"
          />
        </div>

        <div class="form-group">
          <label for="password">Password</label>
          <input
            id="password"
            v-model="password"
            type="password"
            class="input-field"
            placeholder="••••••••"
            required
            :disabled="authStore.loading"
          />
        </div>

        <div v-if="errorMessage" class="error-alert">
          {{ errorMessage }}
        </div>

        <button type="submit" class="btn btn-primary btn-block" :disabled="authStore.loading">
          <span v-if="authStore.loading">Signing In...</span>
          <span v-else>Sign In</span>
        </button>
      </form>

      <div class="demo-box">
        <h4>💡 Demo Credentials / Security Note:</h4>
        <p>Enter email and password (min 6 chars) to authenticate with backend.</p>
        <ul>
          <li><strong>Access Token:</strong> Returned in response body & saved to Pinia State (Memory ONLY)</li>
          <li><strong>Refresh Token:</strong> Set by Node.js server as HTTP-Only Cookie</li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useAuthStore } from '@/stores/auth';
import { useRouter, useRoute } from 'vue-router';

const authStore = useAuthStore();
const router = useRouter();
const route = useRoute();

const email = ref('developer@example.com');
const password = ref('password123');
const errorMessage = ref('');

const handleLogin = async () => {
  errorMessage.value = '';
  try {
    await authStore.login(email.value, password.value);
    const redirectPath = route.query.redirect || '/dashboard';
    router.push(redirectPath);
  } catch (error) {
    errorMessage.value =
      error.response?.data?.message || 'Login failed. Please check your network connection.';
  }
};
</script>

<style scoped>
.login-wrapper {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 60vh;
}

.login-card {
  width: 100%;
  max-width: 440px;
  padding: 40px;
}

.login-header {
  text-align: center;
  margin-bottom: 28px;
}

.login-header h2 {
  font-size: 1.8rem;
  margin-bottom: 8px;
}

.login-header p {
  color: var(--text-muted);
  font-size: 0.95rem;
}

.login-form {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.form-group label {
  font-size: 0.9rem;
  font-weight: 600;
  color: var(--text-muted);
}

.btn-block {
  width: 100%;
  margin-top: 10px;
}

.error-alert {
  padding: 12px;
  background: rgba(244, 63, 94, 0.15);
  border: 1px solid rgba(244, 63, 94, 0.3);
  color: #fda4af;
  border-radius: 8px;
  font-size: 0.9rem;
  text-align: center;
}

.demo-box {
  margin-top: 30px;
  padding: 16px;
  background: rgba(15, 23, 42, 0.5);
  border: 1px dashed var(--border-color);
  border-radius: 10px;
  font-size: 0.85rem;
}

.demo-box h4 {
  margin-bottom: 8px;
  color: var(--accent-purple);
}

.demo-box ul {
  margin-top: 8px;
  padding-left: 20px;
  color: var(--text-muted);
}
</style>
