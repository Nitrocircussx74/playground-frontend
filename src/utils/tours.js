import { driver } from 'driver.js';
import 'driver.js/dist/driver.css';
import { useTourStore } from '@/stores/useTourStore';

const tourDefinitions = {
  dashboard: [
    {
      element: '#tour-building-selector',
      popover: {
        title: '🏢 สลับโหมดตึก & ภาพรวม',
        description: 'เลือกตึกที่ต้องการดูข้อมูล หรือเลือก "ภาพรวมทุกหอพัก" เพื่อเปรียบเทียบผลประกอบการระหว่างตึกได้ทันที',
        side: 'bottom',
        align: 'start'
      }
    },
    {
      element: '#tour-kpi-cards',
      popover: {
        title: '📊 4 สถิติภาพรวมธุรกิจ (KPI Cards)',
        description: 'สรุปรายรับเดือนนี้, ยอดหนี้ค้างชำระ, อัตราการเข้าพัก (Occupancy Rate %), และเคสงานซ่อมค้างอยู่',
        side: 'bottom',
        align: 'center'
      }
    },
    {
      element: '#tour-revenue-chart',
      popover: {
        title: '📈 แนวโน้มรายรับ 6 เดือน & สัดส่วนห้อง',
        description: 'กราฟ Stacked Bar แสดงการกระจายรายได้ย้อนหลัง 6 เดือน (ค่าเช่า/ค่าน้ำ/ค่าไฟ/ค่าส่วนกลาง) และกราฟโดนัทแสดงสัดส่วนห้องพัก',
        side: 'top',
        align: 'center'
      }
    },
    {
      element: '#tour-overdue-debtors',
      popover: {
        title: '⚠️ รายการห้องค้างชำระ & LINE ทวงหนี้',
        description: 'ตรวจสอบตารางห้องค้างชำระค่าบริการ พร้อมกดปุ่ม "💬 ส่ง LINE ทวงหนี้" เพื่อยิงข้อความทวงถามยอดค้างชำระรายห้องแบบอัตโนมัติ',
        side: 'top',
        align: 'start'
      }
    },
    {
      element: '#tour-expiring-leases',
      popover: {
        title: '📜 สัญญาเช่าใกล้หมดอายุใน 30 วัน',
        description: 'ติดตามสัญญาเช่าที่จะหมดอายุในเดือนนี้ พร้อมชื่อผู้เช่า เบอร์โทรติดต่อ และยอดเงินมัดจำคงเหลือ',
        side: 'top',
        align: 'end'
      }
    }
  ],

  meter: [
    {
      element: '#tour-meter-table',
      popover: {
        title: '⚡ ตารางจดเลขมิเตอร์ด่วน',
        description: 'ป้อนเลขมิเตอร์น้ำและไฟฟ้าประจำเดือน ระบบจะคำนวณยูนิตและค่าน้ำไฟให้อัตโนมัติในตาราง',
        side: 'bottom',
        align: 'center'
      }
    },
    {
      element: '#tour-btn-import-excel',
      popover: {
        title: '📥 นำเข้าข้อมูลผ่าน Excel / CSV',
        description: 'ดาวน์โหลดไฟล์ Template สำเร็จรูปไปกรอกแบบ Offline แล้วลากวางไฟล์เพื่อนำเข้ามิเตอร์ทั้งตึกได้ในคลิกเดียว',
        side: 'bottom',
        align: 'end'
      }
    },
    {
      element: '#tour-btn-generate-invoices',
      popover: {
        title: '🚀 คำนวณ & ออกบิลแบบ Draft',
        description: 'เมื่อตรวจสอบเลขมิเตอร์ครบถ้วนแล้ว กดปุ่มนี้เพื่อสร้างใบแจ้งหนี้สถานะ Draft ใน Prisma Transaction ทันที',
        side: 'top',
        align: 'center'
      }
    }
  ],

  leases: [
    {
      element: '#tour-lease-status-tabs',
      popover: {
        title: '🔍 สลับตัวกรองสถานะสัญญา',
        description: 'เลือกดูสัญญาเช่าปัจจุบัน (ACTIVE), ประวัติผู้เช่าที่ย้ายออกแล้ว (ENDED), หรือสัญญาดูทั้งหมด (ALL)',
        side: 'bottom',
        align: 'start'
      }
    },
    {
      element: '#tour-lease-search',
      popover: {
        title: '🔎 ช่องค้นหาผู้เช่า & เลขห้อง',
        description: 'พิมพ์ค้นหาเลขห้องพัก หรือชื่อ-นามสกุลผู้เช่า เพื่อค้นหาเล่มสัญญาแบบ Real-time',
        side: 'bottom',
        align: 'center'
      }
    },
    {
      element: '#tour-btn-move-out',
      popover: {
        title: '🚨 แจ้งย้ายออก & คำนวณคืนเงินมัดจำ',
        description: 'คลิกปุ่มนี้เพื่อเข้าสู่ Wizard 3 ขั้นตอน: จดมิเตอร์วันย้ายออก ➔ กรอกค่าเสียหาย ➔ คำนวณยอดเงินมัดจำคงเหลือสุทธิและพิมพ์เอกสาร A4',
        side: 'top',
        align: 'end'
      }
    }
  ],

  maintenance: [
    {
      element: '#tour-kanban-pending',
      popover: {
        title: '⏳ คอลัมน์ตั๋วรอดำเนินการ (Pending)',
        description: 'รวมรายการแจ้งซ่อมใหม่จากลูกบ้าน คลิกที่การ์ดเพื่อเปิด Modal มอบหมายชื่อช่างและใส่ค่าซ่อม',
        side: 'bottom',
        align: 'start'
      }
    },
    {
      element: '#tour-kanban-inprogress',
      popover: {
        title: '🔧 คอลัมน์กำลังดำเนินการซ่อม (In Progress)',
        description: 'แสดงรายการที่ช่างกำลังเข้าซ่อมแซม พร้อมชื่อช่างผู้รับผิดชอบ และยิง LINE Flex Message อัปเดตลูกบ้าน',
        side: 'bottom',
        align: 'center'
      }
    },
    {
      element: '#tour-kanban-resolved',
      popover: {
        title: '✅ คอลัมน์ซ่อมเสร็จสิ้น (Resolved)',
        description: 'สรุปรายการแจ้งซ่อมที่แก้ไขเสร็จสิ้นเรียบร้อยแล้ว พร้อมยอดสรุปค่าใช้จ่ายซ่อมแซม/ค่าอะไหล่',
        side: 'bottom',
        align: 'end'
      }
    }
  ]
};

export const startTour = (tourKey, forcePlay = false) => {
  const steps = tourDefinitions[tourKey];
  if (!steps || steps.length === 0) return;

  const tourStore = useTourStore();
  if (!forcePlay && tourStore.hasSeenTour(tourKey)) {
    return;
  }

  // Filter steps to only include elements currently present in DOM
  const activeSteps = steps.filter((step) => {
    if (!step.element) return true;
    return !!document.querySelector(step.element);
  });

  if (activeSteps.length === 0) return;

  const driverObj = driver({
    showProgress: true,
    animate: true,
    allowClose: true,
    doneBtnText: 'เสร็จสิ้น 🎉',
    nextBtnText: 'ถัดไป ➔',
    prevBtnText: '◀ ย้อนกลับ',
    steps: activeSteps,
    onDestroyed: () => {
      tourStore.markTourAsSeen(tourKey);
    }
  });

  driverObj.drive();
};
