/**
 * จัดรูปแบบวันที่แบบไทย (พ.ศ.) ผ่าน Intl (Date.prototype.toLocaleDateString)
 * @param {string|Date} date
 * @param {Intl.DateTimeFormatOptions} [options] - ไม่ระบุ = แสดงวันที่แบบสั้น (ค่า default ของ toLocaleDateString)
 * @param {string} [fallback='-'] - ค่าที่คืนเมื่อไม่มีวันที่ หรือวันที่ไม่ถูกต้อง
 */
export function formatDate(date, options, fallback = '-') {
  if (!date) return fallback;
  const d = new Date(date);
  if (isNaN(d.getTime())) return fallback;
  return d.toLocaleDateString('th-TH', options);
}

/**
 * จัดรูปแบบวันที่แบบสั้นภาษาไทย เช่น "9 ก.ย. 2569"
 */
export function formatShortDate(date, fallback = '-') {
  return formatDate(date, { year: 'numeric', month: 'short', day: 'numeric' }, fallback);
}

/**
 * จัดรูปแบบวันและเวลาภาษาไทย เช่น "9 ก.ย. 2569 17:30"
 */
export function formatDateTime(date, fallback = '-') {
  return formatDate(date, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }, fallback);
}

/**
 * จัดรูปแบบจำนวนเงินเป็นสกุลบาทไทย (฿) ผ่าน Intl.NumberFormat
 * @param {number|string} value
 */
export function formatCurrency(value) {
  const num = Number(value) || 0;
  return new Intl.NumberFormat('th-TH', {
    style: 'currency',
    currency: 'THB',
    maximumFractionDigits: 2
  }).format(num);
}
