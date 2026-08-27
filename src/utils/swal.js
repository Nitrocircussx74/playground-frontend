import Swal from 'sweetalert2';
import 'sweetalert2/dist/sweetalert2.min.css';

// Create styled Swal instance with custom Tailwind buttons & smooth styling
const customSwal = Swal.mixin({
  customClass: {
    popup: 'rounded-3xl border border-slate-100 shadow-2xl p-6 font-sans',
    title: 'text-xl font-bold text-slate-900',
    htmlContainer: 'text-sm text-slate-600 mt-2',
    confirmButton: 'px-5 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white rounded-xl text-xs sm:text-sm font-bold shadow-md shadow-purple-600/30 transition-all mx-1.5 focus:outline-none',
    cancelButton: 'px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs sm:text-sm font-semibold transition-all border border-slate-200 mx-1.5 focus:outline-none'
  },
  buttonsStyling: false
});

/**
 * Toast Alert (Top End Notification)
 */
export const showToast = (message, icon = 'success') => {
  return Swal.fire({
    toast: true,
    position: 'top-end',
    icon,
    title: message,
    showConfirmButton: false,
    timer: 3000,
    timerProgressBar: true
  });
};

/**
 * Success Dialog
 */
export const showSuccess = (title, text = '') => {
  return customSwal.fire({
    icon: 'success',
    title,
    text,
    confirmButtonText: 'ตกลง'
  });
};

/**
 * Error Dialog
 */
export const showError = (title, text = '') => {
  return customSwal.fire({
    icon: 'error',
    title,
    text,
    confirmButtonText: 'เข้าใจแล้ว'
  });
};

/**
 * Warning Dialog
 */
export const showWarning = (title, text = '') => {
  return customSwal.fire({
    icon: 'warning',
    title,
    text,
    confirmButtonText: 'เข้าใจแล้ว'
  });
};

/**
 * Confirm Dialog (returns Promise<boolean>)
 */
export const showConfirm = async (title, text = '', confirmText = 'ยืนยัน', cancelText = 'ยกเลิก') => {
  const result = await customSwal.fire({
    icon: 'question',
    title,
    text,
    showCancelButton: true,
    confirmButtonText: confirmText,
    cancelButtonText: cancelText,
    reverseButtons: true
  });

  return result.isConfirmed;
};

export default customSwal;
