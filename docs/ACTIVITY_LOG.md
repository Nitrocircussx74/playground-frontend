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


---

## 📅 [2026-09-07] - Theme-Driven UI/UX Redesign (Modern Purple-Indigo & Thai Font Support)

### 📌 รายการกิจกรรมที่ดำเนินการ:
1. **Typography & Google Fonts Setup**:
   - เพิ่มฟอนต์ `Prompt` (สำหรับภาษาไทย) และ `Plus Jakarta Sans` (สำหรับภาษาอังกฤษ) ใน `index.html` และกำหนด fallback font stack ใน `src/assets/main.css`
2. **Glassmorphism & Global Design System**:
   - เพิ่ม Custom Utility Classes ใน `main.css` (`glass-panel`, `glass-dark`, `card-hover`, `animate-soft-pulse`, custom scrollbar)
   - ปรับแต่งโทนสีหลัก Purple-Indigo พร้อมสีสถานะ Emerald, Amber, Rose ให้กลมกลืนและอ่านง่าย
3. **App Shell & Admin Navigation (`App.vue` & `AdminLayout.vue`)**:
   - ปรับโฉม Sidebar ให้มีความลึก (Depth), โลโก้เรืองแสง, เมนูนำทาง Active Pill Gradient พร้อมไอคอน Lucide Vue Next
   - ปรับปรุง Top Header เป็นสไตล์ Frosted Glass (`backdrop-blur-md`) พร้อม Capsule Dropdown เลือกตึก และปุ่มคู่มือใช้งาน
4. **LINE LIFF Mobile Shell (`LiffLayout.vue`)**:
   - ปรับปรุงกรอบโมบายแอปและ Floating Bottom Navigation Bar ให้สวยงาม ลื่นไหลสไตล์ Mobile App ชั้นนำ
5. **Views Redesign & Polish**:
   - `LoginView.vue`: ปรับแต่งหน้าเข้าสู่ระบบด้วย Ambient Glow Backdrop, Frosted Card และปุ่มกรอกบัญชีทดสอบด่วน
   - `DashboardView.vue`: ปรับแต่ง Stat Cards, Charts, Mode Banner และตาราง Overdue / Expiring Leases ให้สวยงาม สะอาดตา
   - `RoomsView.vue` & `RoomOverviewCard.vue`: ปรับปรุงการ์ดห้องพัก สเตตัส Badge ไฟกระพริบ และปุ่มกรองสถานะ

---

## 📅 [2026-09-07] - Commercial & Rental Spaces Multi-Asset Feature Implementation

### 📌 รายการกิจกรรมที่ดำเนินการ:
1. **Database & Schema Extension**:
   - เพิ่มฟิลด์ `unitType` (`residential`, `commercial_shop`, `vending_spot`, `parking`, `storage`, `billboard_rooftop`), `areaSqm`, `locationZone`, `billingModel`, `revSharePercent`, และ `companyTaxId` ลงในตาราง `rooms`
   - ซิงค์โครงสร้างฐานข้อมูลผ่าน Prisma (`npx prisma db push`)
2. **Backend API & Controllers (`roomController.js`)**:
   - อัปเดต `createRoom` และ `getRooms` ให้รองรับการรับ บันทึก และกรองตาม `unitType`
3. **Frontend UI/UX (`RoomsView.vue` & `RoomOverviewCard.vue`)**:
   - เพิ่มแถบแท็บตัวกรองแยกตามประเภทพื้นที่ (Asset Type Tabs): ห้องพัก, ร้านค้า/ล็อค, ตู้บริการ/เต่าบิน, ที่จอดรถ, ห้องสต็อก, ดาดฟ้า/ป้ายโฆษณา
   - ปรับแต่งการ์ด `RoomOverviewCard` ให้แสดงไอคอน, ป้ายประเภท, ขนาด ตร.ม., และโซนที่ตั้ง
   - ขยายแบบฟอร์มสร้างยูนิตใหม่ให้สามารถกำหนดประเภทสินทรัพย์, ขนาดพื้นที่, โซน, และโมเดลการคิดเงิน (เหมาจ่าย / ส่วนแบ่ง GP %)
---

## 📅 [2026-09-07] - Dual Onboarding Workflow (LINE vs Non-LINE & Seamless Later Linking)

### 📌 รายการกิจกรรมที่ดำเนินการ:
1. **ครบวงจร 2 ทางเลือก (Dual Onboarding Channels)**:
   - **ทางเลือกที่ 1 (ผ่าน LINE)**: แอดมินกดสร้าง Invite Code แล้วส่งให้ผู้เช่าลงทะเบียนผ่าน LINE LIFF
   - **ทางเลือกที่ 2 (ไม่ผ่าน LINE / Walk-in)**: แอดมินกด `+ เช็คอินผู้เช่า (Walk-in)` กรอกข้อมูลและทำสัญญาเช่าเข้าพักทันที
2. **การเชื่อมต่อ LINE ย้อนหลัง (Seamless Later Linking)**:
   - ในหน้า [TenantDetail.vue](file:///Users/user/Desktop/playgroud/playground/playground-frontend/src/views/TenantDetail.vue) สำหรับผู้เช่า Walk-in ที่ยังไม่มี LINE จะมีปุ่ม **"💬 สร้างรหัส/QR เชื่อมต่อบัญชี LINE"**
   - แอดมินสามารถสร้าง Invite Code 6 หลัก และพิมพ์หรือส่ง QR Code ให้ลูกบ้านสแกนเปิด LINE เพื่อผูกบัญชีได้ทันที
   - ปรับปรุง [LiffOnboardingView.vue](file:///Users/user/Desktop/playgroud/playground/playground-frontend/src/views/LiffOnboardingView.vue) ให้อ่านรหัสเชิญจาก QR Code อัตโนมัติ (`?code=...`)
3. **Build Verification**:
   - รันคำสั่ง `yarn build` สำเร็จ 100% (0 Errors)

### STATUS: 🟢 COMPLETE & FULLY VERIFIED
