import { test, expect } from '@playwright/test';
import path from 'path';

/**
 * Test Case 2: Flow การดูบิลและชำระเงินฝั่งลูกบ้าน (LIFF Mobile Viewport)
 */
test.describe('LIFF Tenant Invoice & Payment Flow', () => {

  // ตั้งค่าให้รันเทสบน Mobile Viewport (iPhone 13 Dimensions)
  test.use({
    viewport: { width: 390, height: 844 },
    userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 15_0 like Mac OS X) AppleWebKit/605.1.15'
  });

  test('ควรเปิดหน้าบิลค่าเช่า -> อัปโหลดสลิปโอนเงิน -> สถานะเปลี่ยนเป็นรอตรวจสอบ', async ({ page }) => {
    // 1. จำลองการเข้าหน้าบิลค่าเช่าในรูปแบบ Mobile LIFF App
    await page.goto('/liff/invoices/inv-001');

    // 2. ตรวจสอบว่าหน้าจอแสดงรายละเอียดบิลค่าเช่า
    await expect(page.getByText(/รายละเอียดบิล|ยอดชำระ/i).first()).toBeVisible();

    // 3. จำลองการแนบไฟล์สลิปรูปภาพ (File input)
    // สร้าง Dummy Buffer สำหรับจำลองรูปสลิป PNG
    const buffer = Buffer.from(
      'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
      'base64'
    );

    // เลือก File Input บนหน้าจอ และส่งไฟล์แนบไป
    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles({
      name: 'transfer-slip.png',
      mimeType: 'image/png',
      buffer: buffer
    });

    // 4. กดปุ่มยืนยันส่งสลิปชำระเงิน
    const submitBtn = page.getByRole('button', { name: /ยืนยันส่งสลิป|อัปโหลด/i });
    if (await submitBtn.isVisible()) {
      await submitBtn.click();
    }

    // 5. ตรวจสอบว่า UI เปลี่ยนสถานะเป็น "รอตรวจสอบ (Reviewing)" หรือมี Toast แจ้งเตือนสำเร็จ
    await expect(page.getByText(/รอตรวจสอบ|สำเร็จ|Reviewing/i).first()).toBeVisible({ timeout: 5000 });
  });

});
