import { createApp } from 'vue';
import { createPinia } from 'pinia';
import App from './App.vue';
import router from './router';
import './assets/main.css';

// Dev-only: เติม ?devLineUserId=xxx ต่อท้าย URL หน้า LIFF ใดก็ได้ครั้งเดียว เพื่อจำลอง LINE User ID
// ปลอมไว้ใน localStorage สำหรับทดสอบ Flow ผ่าน Browser ธรรมดา (ไม่ผ่านแอป LINE) — ต้องเปิด
// LINE_AUTH_MOCK_MODE=true ที่ playground-api/.env ควบคู่กันด้วย ไม่งั้น Backend จะปฏิเสธ Token ปลอมนี้
if (import.meta.env.DEV) {
  const devLineUserId = new URLSearchParams(window.location.search).get('devLineUserId');
  if (devLineUserId) {
    localStorage.setItem('dev_line_user_id', devLineUserId);
  }
}

const app = createApp(App);

const pinia = createPinia();
app.use(pinia);
app.use(router);

app.mount('#app');
