import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * ฟังก์ชันช่วยสำหรับรวม Class Names ของ Tailwind CSS และ Shadcn Components
 */
export function cn(...inputs) {
  return twMerge(clsx(inputs));
}
