import { initLiff, isInLiffClient, openExternalWindow } from '@/utils/liff';
import html2canvas from 'html2canvas';
import Swal from 'sweetalert2';
import { showToast } from '@/utils/swal';

/**
 * ดาวน์โหลด Blob ลงเครื่องผ่าน Object URL + Anchor Element (คลิกแล้วเคลียร์ทิ้งอัตโนมัติ)
 * หมายเหตุ: ห้ามใส่ target="_blank" คู่กับ download เพราะบาง Android WebView/In-App Browser
 * (รวมถึง LINE) จะตีความเป็นการเปิดแท็บใหม่แทนการดาวน์โหลด แล้วทำอะไรไม่ได้เพราะ WebView เปิดแท็บใหม่ไม่ได้
 *
 * @param {Blob} blob
 * @param {string} filename
 * @returns {string} object URL ที่สร้างขึ้น (จะถูก revoke อัตโนมัติหลัง 2.5 วินาที)
 */
export function downloadBlob(urlOrBlob, filename) {
  const isBlob = urlOrBlob instanceof Blob;
  const url = isBlob ? window.URL.createObjectURL(urlOrBlob) : urlOrBlob;
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', filename);
  link.style.display = 'none';
  document.body.appendChild(link);
  link.click();

  setTimeout(() => {
    link.remove();
    if (isBlob) window.URL.revokeObjectURL(url);
  }, 2500);

  return url;
}

export const downloadUrl = downloadBlob;

/**
 * Universal Direct PDF Downloader for LINE LIFF / Mobile & Desktop
 * ดาวน์โหลดไฟล์ PDF ลงเครื่องโดยตรง (ไม่เปิด Native Share Sheet)
 *
 * @param {Blob} blob - ไฟล์ PDF ในรูปแบบ Blob
 * @param {string} filename - ชื่อไฟล์ที่ต้องการบันทึก เช่น Official-Receipt-REC-001.pdf
 * @param {string} fallbackDirectUrl - URL ตรงของไฟล์ PDF สำหรับเปิดดาวน์โหลดบน External Browser
 */
export async function downloadOrSharePdf(blob, filename = 'document.pdf', fallbackDirectUrl = '') {
  try {
    // 1. กรณีเปิดบน LINE App Client และมี Direct Download URL -> ให้เปิดดาวน์โหลดผ่าน External Browser (Safari / Chrome) เพื่อเซฟไฟล์ลงเครื่องได้ทันที
    await initLiff();
    if (isInLiffClient() && fallbackDirectUrl) {
      openExternalWindow(fallbackDirectUrl);
      return true;
    }

    // 2. ดาวน์โหลดตรงผ่าน Blob Object URL และ Anchor Element สำหรับ Desktop และ Mobile Web
    downloadBlob(blob, filename);

    return true;
  } catch (err) {
    console.error('Direct PDF Download error:', err);
    if (fallbackDirectUrl) {
      window.open(fallbackDirectUrl, '_blank');
      return true;
    }
    throw err;
  }
}

/**
 * แสดง Popup รูปภาพพร้อมวิธีบันทึกรูปภาพลงเครื่องสำหรับ Mobile / LINE LIFF (Android & iOS)
 * รองรับทั้งการ แตะค้างเพื่อบันทึกรูป (Long-press to save) และ Native Save Dialog
 */
export async function showQrImagePreviewModal(dataUrl, filename = 'promptpay-qr.png') {
  let file = null;
  try {
    const res = await fetch(dataUrl);
    const blob = await res.blob();
    file = new File([blob], filename, { type: 'image/png' });
  } catch (e) {
    console.warn('Could not create File object for share:', e);
  }

  const canNativeShare = Boolean(
    file &&
    typeof navigator !== 'undefined' &&
    typeof navigator.canShare === 'function' &&
    navigator.canShare({ files: [file] })
  );

  return Swal.fire({
    title: '<span style="font-size: 1.15rem; font-weight: 700; color: #1e293b; display: block;">บันทึกรูปภาพ QR Code</span>',
    html: `
      <div style="display: flex; flex-direction: column; align-items: center; gap: 10px; margin-top: 4px; width: 100%;">
        <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 16px; padding: 8px; width: 100%; box-sizing: border-box;">
          <img src="${dataUrl}" alt="PromptPay QR" style="max-height: 260px; width: auto; max-width: 100%; margin: 0 auto; border-radius: 12px; display: block; -webkit-touch-callout: default !important; user-select: auto !important; touch-action: manipulation !important;" />
        </div>
        
        <div style="background: #eef2ff; border: 1px solid #c7d2fe; border-radius: 12px; padding: 10px 12px; width: 100%; text-align: left; box-sizing: border-box;">
          <div style="font-weight: 700; color: #312e81; font-size: 12px; display: flex; align-items: center; gap: 6px; margin-bottom: 3px;">
            <span>📱</span> <span>วิธีบันทึกลงแกลเลอรี (Android & iOS):</span>
          </div>
          <p style="font-size: 11px; color: #3730a3; margin: 0; line-height: 1.45;">
            แตะค้างที่รูปภาพด้านบน แล้วเลือก <b>"บันทึกรูปภาพ" (Save Image)</b> หรือ <b>"ดาวน์โหลดรูปภาพ"</b> ลงเครื่อง
          </p>
        </div>
      </div>
    `,
    showConfirmButton: true,
    confirmButtonText: canNativeShare ? '📥 บันทึกลงอัลบั้มรูป' : 'เสร็จสิ้น / ปิดหน้าต่าง',
    showCancelButton: canNativeShare,
    cancelButtonText: 'ปิดหน้าต่าง',
    buttonsStyling: false,
    customClass: {
      popup: 'rounded-3xl border border-slate-100 shadow-2xl p-5 font-sans max-w-xs sm:max-w-sm w-full',
      actions: 'w-full flex flex-col gap-2 mt-3 px-0',
      confirmButton: 'w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white rounded-xl text-xs sm:text-sm font-bold shadow-md shadow-indigo-600/20 cursor-pointer block text-center',
      cancelButton: 'w-full py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs sm:text-sm font-semibold border border-slate-200 cursor-pointer block text-center'
    },
    preConfirm: async () => {
      if (canNativeShare && file) {
        try {
          await navigator.share({
            files: [file],
            title: 'PromptPay QR Code'
          });
        } catch (shareErr) {
          if (shareErr.name !== 'AbortError') {
            console.warn('Native share error:', shareErr);
          }
        }
      }
    }
  });
}

/**
 * Universal Direct Image Downloader for PromptPay QR Code & Images
 * ดาวน์โหลดรูปภาพ QR Code / สลิป ลงเครื่องโดยตรง
 * 
 * @param {string|Blob} dataUrlOrBlob - Data URL (base64) หรือ Blob ของรูปภาพ
 * @param {string} filename - ชื่อไฟล์รูป เช่น promptpay-qr.png
 */
export async function downloadImage(dataUrlOrBlob, filename = 'promptpay-qr.png') {
  try {
    let blobOrUrl = dataUrlOrBlob;
    if (typeof dataUrlOrBlob === 'string' && (dataUrlOrBlob.startsWith('http://') || dataUrlOrBlob.startsWith('https://') || dataUrlOrBlob.startsWith('/'))) {
      const res = await fetch(dataUrlOrBlob);
      blobOrUrl = await res.blob();
    }
    const downloadHref = downloadBlob(blobOrUrl, filename);

    // ตรวจสอบว่าเป็น Mobile หรือ LINE LIFF หรือไม่
    const isMobile = typeof navigator !== 'undefined' && /iPhone|iPad|iPod|Android/i.test(navigator.userAgent || '');
    if (isMobile || isInLiffClient()) {
      await showQrImagePreviewModal(downloadHref, filename);
    } else {
      showToast('บันทึกรูปภาพเรียบร้อยแล้ว', 'success');
    }

    return true;
  } catch (err) {
    console.error('Direct Image Download error:', err);
    throw err;
  }
}

/**
 * Capture เฉพาะส่วนการ์ด QR Code (DOM Element) แล้วดาวน์โหลดเป็นรูปภาพลงเครื่อง (รองรับทั้ง iOS และ Android)
 * @param {HTMLElement} element - DOM Element ที่ต้องการ Capture เช่น การ์ด PromptPay
 * @param {string} filename - ชื่อไฟล์รูป เช่น promptpay-qr-card.png
 */
export async function captureAndDownloadElement(element, filename = 'promptpay-qr-card.png') {
  if (!element) {
    throw new Error('ไม่พบ Element สำหรับ Capture');
  }

  try {
    const canvas = await html2canvas(element, {
      scale: 3, // High-res retina quality
      useCORS: true,
      allowTaint: true,
      backgroundColor: '#ffffff',
      logging: false,
      ignoreElements: (el) => {
        // ละเว้นปุ่มดาวน์โหลดหรือปุ่มที่ไม่ต้องการให้ติดในรูป
        return Boolean(el.classList && el.classList.contains('no-capture'));
      }
    });

    const dataUrl = canvas.toDataURL('image/png', 1.0);
    return await downloadImage(dataUrl, filename);
  } catch (err) {
    console.error('Capture and download element error:', err);
    throw err;
  }
}
