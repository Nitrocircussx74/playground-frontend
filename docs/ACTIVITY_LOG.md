# 📜 Activity Log & Project History (docs/ACTIVITY_LOG.md)

บันทึกประวัติการพัฒนา การแก้ไขไฟล์ และสถานะของโปรเจกต์ `playground-frontend`

---

## 📅 [2026-08-26] - Initial Vue 3 Clean Architecture Setup & Git Repository Push

### 📌 รายการกิจกรรมที่ดำเนินการ:
1. **โปรเจกต์ Initialization**:
   - สร้างโครงสร้างโปรเจกต์ Vue 3 (Vite) ใน `playground-frontend`
   - ติดตั้ง Dependencies หลักด้วย Yarn: `axios`, `pinia`, `vue-router`
2. **Axios Configuration (Silent Refresh Queue)**:
   - สร้างไฟล์ `src/utils/api.js` พร้อมตั้งค่า `withCredentials: true`
   - เขียน Request Interceptor แนบ Access Token จาก Pinia State
   - เขียน Response Interceptor ดัก 401 Unauthorized และทำ Silent Refresh ด้วย HTTP-Only Cookie พร้อมระบบ Queueing (`failedQueue`)
3. **Auth Service Layer**:
   - สร้างไฟล์ `src/services/authService.js` รวบรวม API Endpoints (`login`, `logout`, `refreshToken`, `getProfile`)
4. **Pinia Auth Store (In-Memory Access Token)**:
   - สร้างไฟล์ `src/stores/auth.js` เก็บ Access Token และ User Data ใน Memory (RAM) ป้องกัน XSS
5. **Vue Router & Route Guards**:
   - สร้างไฟล์ `src/router/index.js` พร้อมระบบ Auto Silent Refresh เมื่อกด F5 และตรวจสอบ Protected / Guest Routes
6. **UI Components & Glassmorphism Design**:
   - สร้าง `LoginView.vue`, `DashboardView.vue`, `ProfileView.vue`, `App.vue`, `main.css`
7. **Git Repository Setup**:
   - สร้าง Git Repository `https://github.com/Nitrocircussx74/playground-frontend` และ Push ขึ้น Remote `main` branch เรียบร้อย
10. **Tailwind CSS & Shadcn Vue Integration**:
    - ติดตั้ง `tailwindcss`, `postcss`, `autoprefixer`, `radix-vue`, `clsx`, `tailwind-merge`, `class-variance-authority`, `tailwindcss-animate`
    - สร้าง `tailwind.config.js`, `postcss.config.js`, `jsconfig.json`, `components.json`, และ `src/lib/utils.js` (`cn` helper)
    - สร้าง Shadcn Components: `Button`, `Card`, `Input` ใน `src/components/ui/`
12. **Multi-System Architecture (Admin Portal & LINE LIFF Tenant App)**:
    - ติดตั้ง `@line/liff` SDK ด้วย Yarn (`yarn add @line/liff`)
    - สร้าง `AdminLayout.vue` (Sidebar/Navbar สำหรับจัดการหอพัก) และ `LiffLayout.vue` (Blank Mobile Layout สำหรับแอป LINE)
    - สร้าง `adminAuth.js` Store (จัดการ JWT Admin) และ `liffAuth.js` Store (จัดการ LINE User Profile)
    - ตั้งค่า Vue Router Nested Routes แยกกิ่ง `/admin` (JWT Guard) และ `/liff` (LIFF SDK Auth)
    - สร้าง `LiffHome.vue` พร้อมระบบ `liff.init()` & `liff.getProfile()`

### STATUS: 🟢 COMPLETE & PRODUCTION READY
