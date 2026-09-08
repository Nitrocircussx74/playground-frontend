import { initLiff, isInLiffClient, openExternalWindow } from '@/utils/liff';

/**
 * Universal PDF Downloader & Native Share Sheet for LINE LIFF / Mobile & Desktop
 *
 * เหตุผลที่บน Android และ iOS ใน LINE In-App Browser ดาวน์โหลดไฟล์ผ่าน blob ปกติไม่ได้:
 * 1. WKWebView (iOS) และ Android WebView ใน LINE ปิดกั้น/ไม่รองรับการดาวน์โหลดผ่านแท็ก <a download="blob:...">
 * 2. ทางแก้ที่ได้ผล 100% บนมือถือ:
 *    - ลำดับที่ 1: ใช้ Web Share API (navigator.share) ส่ง File PDF เข้า Native Share Sheet ของเครื่อง (Save to Files / Save to Downloads / AirDrop / LINE / Google Drive)
 *    - ลำดับที่ 2: หากอยู่ใน LINE และต้องการดาวน์โหลดผ่าน Browser หลัก ให้เปิดผ่าน External Browser (Safari/Chrome) ด้วย liff.openWindow({ url, external: true })
 *    - ลำดับที่ 3: Fallback สำหรับ Desktop/ทั่วไปด้วย <a download> และ window.open()
 */
export async function downloadOrSharePdf(blob, filename, fallbackDirectUrl = '') {
  try {
    // 1. ตรวจสอบและใช้งาน Web Share API กับ Native File (รองรับ iOS 15+, Safari, Chrome Mobile, LINE WebView รุ่นใหม่)
    if (typeof navigator !== 'undefined' && navigator.canShare && typeof File !== 'undefined') {
      try {
        const file = new File([blob], filename, { type: 'application/pdf' });
        if (navigator.canShare({ files: [file] })) {
          await navigator.share({
            title: filename.replace('.pdf', ''),
            text: 'ใบเสร็จรับเงิน / ใบแจ้งหนี้ (Official Receipt)',
            files: [file]
          });
          return true;
        }
      } catch (shareErr) {
        // หากผู้ใช้กดยกเลิกใน Share Sheet (AbortError) ถือว่าทำงานปกติ
        if (shareErr.name === 'AbortError') {
          return true;
        }
        console.warn('⚠️ Web Share API fallback:', shareErr);
      }
    }

    // 2. หากทำงานอยู่ใน LINE App Client และมี Direct URL ให้เปิดใน External Browser (Safari / Chrome)
    await initLiff();
    if (isInLiffClient() && fallbackDirectUrl) {
      openExternalWindow(fallbackDirectUrl);
      return true;
    }

    // 3. Fallback สำหรับ Desktop และ Standard Web Browsers
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', filename);
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();

    setTimeout(() => {
      link.remove();
      window.URL.revokeObjectURL(url);
    }, 2000);

    return true;
  } catch (err) {
    console.error('Download/Share PDF error:', err);
    if (fallbackDirectUrl) {
      window.open(fallbackDirectUrl, '_blank');
      return true;
    }
    throw err;
  }
}
