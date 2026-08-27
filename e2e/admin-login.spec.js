import { test, expect } from '@playwright/test';

/**
 * Test Case 1: ระบบ Login และการตรวจสอบ RBAC (Admin Backoffice)
 */
test.describe('Admin Backoffice Login & Authorization Flow', () => {

  test('ควรกรอกข้อมูล Login -> กดปุ่ม -> เปลี่ยนหน้าไปที่ /dashboard พร้อมแสดงสรุปภาพรวม', async ({ page }) => {
    // 1. เปิดหน้า Login ของระบบ
    await page.goto('/login');

    // 2. ตรวจสอบว่าหน้าจอแสดงผลหัวข้อ Sign In
    await expect(page.getByRole('heading', { name: 'Sign In to Portal' })).toBeVisible();

    // 3. จำลองการพิมพ์ Username/Email ด้วย data-testid
    await page.getByTestId('email-input').fill('superadmin@dorm.com');

    // 4. จำลองการพิมพ์ รหัสผ่าน ด้วย data-testid
    await page.getByTestId('password-input').fill('password123');

    // 5. กดปุ่ม Login
    await page.getByTestId('login-button').click();

    // 6. ตรวจสอบว่า URL เปลี่ยนแปลงไปที่หน้า /dashboard
    await expect(page).toHaveURL(/\/dashboard/);

    // 7. ตรวจสอบว่ามีข้อความ "สรุปภาพรวมธุรกิจ" หรือ "Dashboard" ปรากฏบนหน้าจอ
    await expect(page.getByText(/สรุปภาพรวมธุรกิจ|ภาพรวม/i).first()).toBeVisible();
  });

  test('กรณีใส่รหัสผ่านผิด ควรแสดง Error Message เตือนผู้ใช้', async ({ page }) => {
    await page.goto('/login');
    await page.getByTestId('email-input').fill('superadmin@dorm.com');
    await page.getByTestId('password-input').fill('wrongpassword');
    await page.getByTestId('login-button').click();

    // ตรวจสอบว่ามี Error Message ปรากฏ
    await expect(page.getByTestId('error-message')).toBeVisible();
  });

});
