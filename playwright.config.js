import { defineConfig, devices } from '@playwright/test';

/**
 * Playwright E2E Test Configuration for Vue 3 Dormitory System
 * @see https://playwright.dev/docs/test-configuration
 */
export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',

  use: {
    /* Base URL สำหรับการทดสอบ (Dev Server บน Vite port 5173) */
    baseURL: process.env.BASE_URL || 'http://localhost:5173',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure'
  },

  /* กำหนด Browser Projects (รันบน Desktop Chrome สำหรับ Admin และ Mobile Safari สำหรับ LIFF) */
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] }
    },
    {
      name: 'mobile-safari',
      use: {
        ...devices['iPhone 13'],
        /* จำลองสภาพแวดล้อมมือถือ (LIFF App) */
        isMobile: true,
        hasTouch: true
      }
    }
  ],

  /* รัน Vite Dev Server โดยอัตโนมัติหากยังไม่ได้เปิดไว้ */
  webServer: {
    command: 'yarn dev',
    url: 'http://localhost:5173',
    reuseExistingServer: !process.env.CI,
    timeout: 120 * 1000
  }
});
