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

---

## 📅 [2026-09-09] - LIFF Security Audit: ตัด Token ออกจาก LocalStorage, ปิด Dev Bypass และ Unify ระบบแจ้งซ่อม

### 📌 รายการกิจกรรมที่ดำเนินการ:
1. **Audit Flow ฝั่งลูกบ้าน (LIFF Tenant Portal)**:
   - ไล่ตรวจ Flow ทั้งหมดตั้งแต่ [LiffEntryView.vue](file:///Users/user/Desktop/playgroud/playground/playground-frontend/src/views/LiffEntryView.vue) → Friendship Check → Auth Check → PIN → Main App พบจุดเสี่ยงด้าน Security และ Data Consistency หลายจุด
2. **Security Fix #1 - ย้าย `liff_token` ออกจาก LocalStorage**:
   - แก้ [stores/auth.js](file:///Users/user/Desktop/playgroud/playground/playground-frontend/src/stores/auth.js) ให้เก็บ `liffToken` แบบ Memory-only ผ่าน Pinia เท่านั้น (ของเดิมเขียน/อ่าน `localStorage.liff_token` ตรงๆ ขัดกับกฎใน AGENTS.md)
   - เพิ่ม Action `restoreLiffSession()` กู้คืน Session หลังรีเฟรชหน้าด้วย LINE ID Token ผ่าน Silent Login (`authService.silentLoginLiff()`) แทนการอ่านค่าจาก LocalStorage
   - อัปเดต [utils/api.js](file:///Users/user/Desktop/playgroud/playground/playground-frontend/src/utils/api.js), [router/index.js](file:///Users/user/Desktop/playgroud/playground/playground-frontend/src/router/index.js) และหน้าที่เคยอ่าน `liff_token` จาก LocalStorage โดยตรง (LiffReceiptHistoryView, LiffInvoiceDetailView, LiffInvoiceListView) ให้ใช้ Memory State แทนทั้งหมด
3. **Security Fix #2 - ตัด Hardcoded Dev Bypass**:
   - ลบ Mock User ID (`U_mock_tenant_user_1`) ที่ Hardcode ไว้ใน LiffPinLogin.vue, LiffSetupPin.vue, PinLoginView.vue ออกทั้งหมด
   - Gate กลไก `dev_line_user_id` / Header `X-Line-User-Id` ทั้งหมดด้วย `import.meta.env.DEV` ป้องกันการสวมรอยผู้ใช้อื่นใน Production Build
4. **Unify ระบบแจ้งซ่อม/ร้องเรียนที่ซ้อนกัน (Maintenance vs Issues)**:
   - พบว่า `/liff/maintenance` และ `/liff/issues` เป็นคนละ Endpoint/ตารางกันจริงในฝั่ง Backend (`playground-api`) แต่ฝั่ง Admin CMS Unify แสดงผลรวมเป็น Kanban Board เดียวไปแล้วก่อนหน้านี้
   - ปรับ Bottom Nav "แจ้งซ่อม" ให้ชี้ไปที่ `/liff/issues` (ฟอร์มใหม่ที่ครบกว่า: แนบได้ 5 รูป, แยกหมวดซ่อม/ร้องเรียน/อื่นๆ) และเปลี่ยน `/liff/maintenance` เป็น Redirect แทนการแสดงฟอร์มแยก เพื่อไม่ให้มีการเขียนข้อมูลใหม่เข้าตารางเดิมอีก
   - [IssueHistory.vue](file:///Users/user/Desktop/playgroud/playground/playground-frontend/src/views/IssueHistory.vue) ดึงข้อมูลจากทั้ง 2 Endpoint มารวมกันและ Normalize ให้อยู่ในรูปแบบเดียวกัน เพื่อไม่ให้ประวัติแจ้งซ่อมเก่าของลูกบ้านหายไป
   - แก้ Badge จำนวนงานค้างใน LiffProfileView.vue ให้นับรวมจากทั้ง 2 Endpoint ให้ตรงกับสิ่งที่กดเข้าไปดูจริง
5. **Build Verification**:
   - รัน `yarn build` ผ่าน 100% (0 Errors) และ `yarn test` ไม่มี Regression เพิ่มจากที่มีอยู่ก่อนแล้ว (4 Test เดิมที่ Fail จาก Pinia Setup ใน `LiffLayout.test.js` ยังไม่ได้แก้ในรอบนี้)
6. **Git**: Commit และ Push ขึ้น Branch `fix/liff-security-audit-and-unify-maintenance`

### ⏭️ งานที่เหลือ (Follow-up Items จาก Audit):
- ลบ `LiffOnboardingView.vue` (Dead Code, ไม่มี Route ไหนลิงก์มาเลย, ตรรกะซ้ำกับ LiffEntryView.vue)
- แก้บั๊ก `liff` undefined ใน `LiffRegisterView.vue` (บรรทัด 216) ทำให้ LINE Profile ไม่ถูกแนบไปกับ Payload ลงทะเบียน
- ตัด Route PIN ที่ซ้ำกัน (`/pin-login`, `/setup-pin`, `/change-pin` ระดับบนสุด vs ชุดเดียวกันใต้ `/liff/*`)
- เพิ่ม Route Guard สำหรับหน้า LIFF ที่ต้อง Login (เช่น `/liff/invoices`, `/liff/pay/:id`)
- ลด Friendship Check ที่ยิงซ้ำทุกครั้งที่เปลี่ยนแท็บใน LiffLayout.vue
- พิจารณาลบไฟล์ `LiffMaintenanceView.vue` ที่กลายเป็น Dead Code แล้วหลังข้อ 4

### STATUS: 🟢 COMPLETE & VERIFIED (รอ Merge เข้า `main` — ยังไม่ลบไฟล์ Dead Code ในรอบนี้)

---

## 📅 [2026-09-09] - PIN Verify-and-Set Flow, Maintenance Payer UI, UI Polish, Android/LINE PDF Download Fix

### 📌 รายการกิจกรรมที่ดำเนินการ:
1. **Audit ระบบ PIN (LIFF)**: พบว่าตอนยืนยันตัวตนข้ามอาคาร (`linkAndLogin`) ถ้าบัญชียังไม่เคยตั้ง PIN มาก่อนจะโดนบล็อกเฉยๆ ไม่มีทางตั้ง PIN ใหม่ในหน้าเดียวกันได้ — ประสาน Backend แก้ให้ตั้ง PIN ใหม่พร้อมยืนยันตัวตนได้ในคำขอเดียว แล้วปรับ UI ให้สอดคล้อง:
   - [LiffEntryView.vue](file:///Users/user/Desktop/playgroud/playground/playground-frontend/src/views/LiffEntryView.vue) และ [LiffOnboardingView.vue](file:///Users/user/Desktop/playgroud/playground/playground-frontend/src/views/LiffOnboardingView.vue): เดิมพาไปหน้ากรอก PIN เฉพาะกรณีมี PIN แล้วเท่านั้น ปรับให้เข้าหน้าเดียวกันทุกกรณีที่เป็นผู้ใช้เดิม แล้วสลับข้อความ/ปุ่มอัตโนมัติ ("กรอก PIN เดิม" vs "ตั้ง PIN ใหม่") ซ่อนปุ่ม "ลืม PIN" เมื่อยังไม่เคยมี PIN
   - [LiffOnboardingView.vue](file:///Users/user/Desktop/playgroud/playground/playground-frontend/src/views/LiffOnboardingView.vue) MODE 2 (ผูกบัญชีด้วย Invite Code) และ [LiffRegisterView.vue](file:///Users/user/Desktop/playgroud/playground/playground-frontend/src/views/LiffRegisterView.vue) (ลงทะเบียนใหม่ด้วย Invite Code): เดิมไม่เคยพาลูกบ้านไปตั้ง PIN เลยหลังผูกบัญชี/ลงทะเบียนสำเร็จ ปรับให้เช็ค `hasPin` จาก Backend แล้วพาไป `/liff/setup-pin` อัตโนมัติถ้ายังไม่มี
   - ⚠️ **แก้ไขบันทึกเดิม**: Follow-up item "ลบ LiffOnboardingView.vue (Dead Code)" จากบันทึกวันเดียวกันด้านบน **ไม่ถูกต้อง** — หน้านี้ยังมี Route (`/liff/onboarding`) ใช้งานจริงในเซสชันนี้ ไม่ควรลบ
2. **UI/Design Audit หน้าโปรไฟล์ลูกบ้าน ([LiffProfileView.vue](file:///Users/user/Desktop/playgroud/playground/playground-frontend/src/views/LiffProfileView.vue))**: จากภาพหน้าจอที่ผู้ใช้ส่งมา
   - การ์ดข่าวสารเลื่อนแนวนอนถูกตัดขาดที่ขอบขวาโดยไม่มีสัญญาณว่าเลื่อนดูต่อได้ → เพิ่มเงาไล่สีจางบอกใบ้ (Edge Fade)
   - รูปปกข่าวสารที่โหลดพัง (ลิงก์เสีย) โชว์เป็นกล่องเทาว่างๆ → เพิ่ม `@error` fallback สลับไปโชว์หัวการ์ดแบบไม่มีรูปแทน (มี Pattern เดิมสำหรับ Avatar อยู่แล้วแต่ลืมทำให้การ์ดข่าวสาร)
   - **พบและแก้บั๊กจริงระหว่างตรวจ**: รูปโปรไฟล์ LINE ไม่ขึ้น เพราะ (ก) DB ของ Tenant ทดสอบถูกอินทิเกรชันเทสเขียนทับด้วย URL ปลอม (ล้างข้อมูลให้แล้ว) และ (ข) `fetchTenantProfile()` ให้ค่า `linePictureUrl` จาก DB ทับรูปสดจาก LIFF SDK เสมอ ทั้งที่ควรให้รูปสดชนะ — แก้ให้ใช้รูปสดจาก LIFF ก่อนเสมอถ้ามี ค่อย fallback ไป DB
3. **ระบบผู้รับผิดชอบค่าซ่อม (Maintenance Payer) ฝั่ง UI**:
   - [MaintenanceView.vue](file:///Users/user/Desktop/playgroud/playground/playground-frontend/src/views/MaintenanceView.vue): เพิ่มปุ่มเลือก "นิติออกให้" / "ลูกบ้านจ่ายเอง" ตอนปิดงานซ่อม + Badge สถานะ "รอรวมบิล / รวมในบิลแล้ว" (ล็อกฟิลด์เมื่อรวมบิลไปแล้ว)
   - [IssueHistory.vue](file:///Users/user/Desktop/playgroud/playground/playground-frontend/src/views/IssueHistory.vue) และ [TenantDetail.vue](file:///Users/user/Desktop/playgroud/playground/playground-frontend/src/views/TenantDetail.vue): โชว์ผู้รับผิดชอบค่าใช้จ่ายให้ลูกบ้านและแอดมินเห็นตรงกัน
4. **แก้บั๊กดาวน์โหลดใบแจ้งหนี้/QR Code ไม่ได้บน Android ใน LINE**:
   - [downloadHelper.js](file:///Users/user/Desktop/playgroud/playground/playground-frontend/src/utils/downloadHelper.js): เอา `target="_blank"` ออกจาก Anchor ที่มี `download` attribute ทั้งใน `downloadPdf` และ `downloadImage` (คู่กันแล้วบาง Android WebView/LINE In-App Browser ตีความเป็นเปิดแท็บใหม่แทนดาวน์โหลด แล้วพังเงียบๆ)
   - Backend แก้ `Content-Disposition` จาก `inline` เป็น `attachment` ที่ Endpoint PDF ใบแจ้งหนี้/ใบเสร็จ (ดู `playground-api/docs/ACTIVITY_LOG.md` Phase 12) — เป็นสาเหตุหลักที่ทำให้ Android ดาวน์โหลดไม่ได้
5. **Build Verification**: รัน `yarn build` ผ่าน 100% (0 Errors) ทุกครั้งหลังแก้แต่ละส่วน

---

## 📅 [2026-09-10] - Audit Flow Login ลูกบ้านผ่าน LINE/Web, แก้บั๊ก Web Login พัง & LINE Entry Bounce ผิดที่

### 📌 รายการกิจกรรมที่ดำเนินการ:
1. **Audit Flow Login ลูกบ้านทั้งผ่าน LINE และผ่านเว็บปกติ**: ไล่ตรวจ [WebLogin.vue](file:///Users/user/Desktop/playgroud/playground/playground-frontend/src/views/WebLogin.vue), [LiffPinLogin.vue](file:///Users/user/Desktop/playgroud/playground/playground-frontend/src/views/LiffPinLogin.vue), [LiffEntryView.vue](file:///Users/user/Desktop/playgroud/playground/playground-frontend/src/views/LiffEntryView.vue), router guard และฝั่ง Backend ที่เกี่ยวข้องทั้งหมด (ดูช่องโหว่ความปลอดภัยที่พบและแก้ใน `playground-api/docs/ACTIVITY_LOG.md` Phase 13)
2. **แก้บั๊ก Web Login พังทุกครั้งแม้เบอร์โทร/PIN ถูกต้อง**: [WebLogin.vue](file:///Users/user/Desktop/playgroud/playground/playground-frontend/src/views/WebLogin.vue) — `handleWebLogin` อ้างตัวแปร `tenant`/`user`/`rooms`/`building`/`accessToken` โดยไม่เคย Destructure จาก `res.data.data` เลย → Login สำเร็จทุกครั้งแต่โยน `ReferenceError` แล้วโดน `catch` กลืนไปแสดงเป็น "เบอร์โทรศัพท์หรือรหัส PIN ไม่ถูกต้อง" ทำให้ลูกบ้านที่ Login ผ่านเว็บ (ไม่ผ่าน LINE) เข้าระบบไม่ได้เลย — แก้ให้ Destructure ค่าจาก Response ให้ครบ
3. **แก้บั๊กเข้าจาก Rich Menu/LIFF Link แล้วโดนเด้งไปหน้า Web Login ผิดๆ**: [LiffEntryView.vue](file:///Users/user/Desktop/playgroud/playground/playground-frontend/src/views/LiffEntryView.vue) — เดิมเช็ค `liff.isInClient()` ก่อนตัดสินใจว่าจะ Auto-Login ด้วย LINE หรือเด้งไป `/web/login` แต่ค่านี้ไม่น่าเชื่อถือ 100% (LIFF `init()` ล้มเงียบๆ ได้ถ้า Endpoint URL ไม่ตรงกับ Origin ปัจจุบัน, หรือผู้ใช้เปิดผ่าน LINE แบบ External Browser) ทำให้ลูกบ้านที่เข้าจาก Rich Menu/ลิงก์ LINE จริงๆ โดนเด้งไปหน้าเบอร์โทร+PIN ผิดๆ แทนที่จะได้ Login ด้วย LINE — แก้โดยไม่พึ่ง `isInClient()` อีกต่อไป: ลอง `loginLiff()` ก่อนเสมอ (จำกัด 1 ครั้งต่อ Session กัน Loop เหมือนเดิม) เพราะ `liff.login()` รองรับทั้งสองบริบทอยู่แล้วผ่าน LINE Login OAuth Redirect ถ้าเรียกไม่สำเร็จจริงๆ ค่อย Fallback ไปหน้า Web Login
4. **Build Verification**: รัน `yarn build` ผ่าน 100% (0 Errors)
5. **รวม Commit งาน UI ที่ค้างอยู่**: Commit งานที่พัฒนาไว้ก่อนหน้าแต่ยังไม่เคย Commit เข้า Git History — UI จัดการ Room Owner (มอบหมายเจ้าของห้อง, แสดงใน [RoomOverviewCard.vue](file:///Users/user/Desktop/playgroud/playground/playground-frontend/src/components/RoomOverviewCard.vue)/[RoomTenancyHistoryModal.vue](file:///Users/user/Desktop/playgroud/playground/playground-frontend/src/components/RoomTenancyHistoryModal.vue)), [LineQuotaCard.vue](file:///Users/user/Desktop/playgroud/playground/playground-frontend/src/components/LineQuotaCard.vue) และ [DeliveryLogsTab.vue](file:///Users/user/Desktop/playgroud/playground/playground-frontend/src/components/DeliveryLogsTab.vue) สำหรับติดตามโควต้า/ประวัติการส่งแจ้งเตือน LINE ราย Building, `thaiBanks` constants และ `ui/progress` component — Build ผ่านครบก่อน Commit

### STATUS: 🟢 COMPLETE & VERIFIED

---

## 📅 [2026-09-10] - LIFF Client Redirect Guard, Brand Color Rebrand (Teal), Room Type/Building Icons

### 📌 รายการกิจกรรมที่ดำเนินการ:
1. **Debug Session ทดสอบ Onboarding จริง**: ไล่ตาม User ทดสอบ Flow "ผูกบัญชี → ตั้ง PIN" ผ่าน Browser/Tunnel จนพบว่าระบบมี **Invite Code 2 ชุดซ้อนกัน** ที่หน้าตาคล้ายกันจนสับสนได้ง่าย: `/liff/onboarding` (LiffOnboardingView.vue, ใช้ `Tenant.inviteCode` — สำหรับผู้เช่า**เดิม**ที่มีข้อมูลอยู่แล้ว) กับ `/liff/register` (LiffRegisterView.vue, ใช้ `RoomInvite.code` — สำหรับผู้เช่า**ใหม่**เอี่ยม) ปุ่ม "ลงทะเบียนด้วยรหัสเชิญ" ที่ [LiffEntryView.vue](file:///Users/user/Desktop/playgroud/playground/playground-frontend/src/views/LiffEntryView.vue) พาไปแค่หน้าเดียว (`/liff/register`) ทำให้ผู้เช่าเดิมที่มีรหัสเชิญแบบแรกเข้าผิดหน้าแล้วเจอ "ไม่พบรหัสเชิญ" — **ยังไม่ได้แก้ในรอบนี้** (เป็น Backend Design Issue ข้ามระบบ ดู `playground-api/docs/ACTIVITY_LOG.md` Phase 14 ข้อ 4) บันทึกไว้เป็น Follow-up
2. **LIFF Client Redirect Guard** ([router/index.js](file:///Users/user/Desktop/playgroud/playground/playground-frontend/src/router/index.js)): เพิ่ม Check ต้นทาง `liffNavigationGuard` — ถ้าเปิดหน้า `/liff/*` ผ่าน Browser ธรรมดา (ไม่ใช่แอป LINE จริง, เช็คด้วย `liff.isInClient()`) จะ `window.location.href` เด้งไปเปิดผ่าน `https://liff.line.me/<LIFF_ID><path เดิม>` ให้อัตโนมัติ (LINE จัดการเปิดแอป LINE ต่อเองถ้ามีติดตั้ง) กันปัญหา LINE ID Token Verify ไม่ผ่านเพราะไม่มี Session LINE จริงที่เจอกันมาทั้ง Session — **ปิดกลไกนี้ใน `import.meta.env.DEV`** (ไม่งั้นจะไปรบกวนการทดสอบผ่าน Browser ด้วย `?devLineUserId=`) และเว้น `/web/login`/`isTenantWeb` ไว้เพราะตั้งใจออกแบบให้ใช้นอก LINE ได้อยู่แล้ว
3. **Dev Testing Convenience** ([main.js](file:///Users/user/Desktop/playgroud/playground/playground-frontend/src/main.js)): พบว่าโค้ดเดิมมีแค่ "อ่าน"/"ลบ" `localStorage.dev_line_user_id` (`utils/liff.js`, `utils/api.js`) แต่ไม่เคยมีจุด "ตั้งค่า" เลยสักที่ — เพิ่ม Dev-only Bootstrap อ่าน Query Param `?devLineUserId=xxx` แล้ว Persist ลง localStorage ให้ครั้งเดียว ใช้ร่วมกับ `LINE_AUTH_MOCK_MODE=true` ฝั่ง Backend เพื่อทดสอบผ่าน Browser ธรรมดาได้แบบไม่ต้องพึ่งมือถือจริง (ดู `playground-api/docs/ACTIVITY_LOG.md` Phase 15 เรื่อง Mock Mode)
4. **Brand Color Rebrand — HorHub Teal**: Sample สีจากไฟล์โลโก้จริง (`public/horhub-app-icon.png` ฯลฯ) ด้วยสคริปต์อ่าน Pixel ได้ค่าเฉลี่ยใกล้เคียง Tailwind `cyan-700` (`#0E7490`) มากที่สุด — สีเดิมของทั้งระบบ (Purple/Indigo ฝั่ง CMS, Blue-500 Default ฝั่ง Theme) ไม่ตรงกับโลโก้เลย:
   - Sed ทั่ว `src/` แทนที่ Tailwind Class `purple-*` → `cyan-*` และ `indigo-*` → `teal-*` (คงเฉดเดิมทุกจุด 50-950) ครอบคลุม 55 ไฟล์ทั่วทั้ง CMS Admin
   - `tailwind.config.js`, `assets/main.css`, `composables/useDynamicTheme.js`: เปลี่ยน Default `--theme-primary`/Fallback จาก Blue (`#3B82F6` / `59 130 246`) เป็น Teal (`#0E7490` / `14 116 144`)
   - `components/common/CycleDatePicker.vue`: `--dp-primary-color` จาก Purple (`#9333ea`) เป็น Cyan (`#0891b2`)
   - `views/BuildingSettingsView.vue`: เพิ่ม Preset สี **"HorHub Teal"** เป็นตัวเลือกแรกในรายการสีให้แอดมินเลือกได้ (นอกเหนือจาก Blue/Ruby/Emerald/Indigo/Amber/Sky/Rose/Slate เดิม) และเปลี่ยน Default ฟอร์มสร้าง/แก้ตึกให้เป็น HorHub Teal
   - **ตั้งใจไม่แตะ**: Preset สีอื่นๆ ที่ให้แอดมินเลือกเอง (เป็น Theme เฉพาะของแต่ละตึก ไม่ใช่ของแอป), สี Categorical ใน Chart ของ `DashboardView.vue` (Indigo/Emerald แยกแยะ Data Series คนละเรื่องกับ Brand), สี Emerald ในหน้า LIFF (`LiffOnboardingView.vue` ฯลฯ) ที่ยังไม่ชัดว่าเป็น Brand หรือ Semantic Success Color ปนกัน — รอ Confirm ก่อนแก้เพิ่ม
5. **ไอคอนห้องพักตามประเภท + โลโก้ตึก** ([LiffProfileView.vue](file:///Users/user/Desktop/playgroud/playground/playground-frontend/src/views/LiffProfileView.vue)): Multi-Room Selector เดิมใช้ไอคอนประตู (`DoorClosed`) เดียวกันทุกห้องไม่ว่าจะเป็นห้องพักจริงหรือ Unit ประเภทอื่น (เช่น `vending_spot` ตู้เต่าบิน) — เพิ่ม `getRoomIcon(unitType)` reuse Mapping เดียวกับ `getUnitTypeIcon` ใน `RoomOverviewCard.vue` ฝั่ง CMS Admin (🏪 ร้านค้า, ☕ ตู้บริการ, 🚗 ที่จอดรถ, 📦 ห้องเก็บของ, 📡 ป้าย/ดาดฟ้า, 🚪 ห้องพักปกติ) และถ้าตึกนั้นตั้งโลโก้ไว้ (`room.logoUrl`) ให้แสดงโลโก้ตึกแทนไอคอนเลย ช่วยแยกห้องข้ามหลายตึกของผู้เช่าคนเดียวได้ง่ายขึ้น
6. **Build Verification**: รัน `yarn build` ผ่าน 100% (0 Errors) ทุกครั้งหลังแก้แต่ละส่วน (ระหว่างทางเจอ Duplicate Import `Package` ของตัวเองทำ Build พังชั่วคราว แก้แล้ว)

### ⏭️ งานที่เหลือ (Follow-up Items):
- แก้ปุ่ม "ลงทะเบียนด้วยรหัสเชิญ" ใน `LiffEntryView.vue` ให้ฉลาดขึ้น (เช็คเบอร์โทร/สถานะก่อนแล้วพาไปหน้าที่ถูกต้องอัตโนมัติ แทนที่จะพาไปหน้าเดียวตายตัว) — หรือรวม 2 ระบบ Invite Code เป็นระบบเดียวฝั่ง Backend
- ตัดสินใจว่าสี Emerald ในหน้า LIFF ควรเปลี่ยนเป็น HorHub Teal ด้วยหรือไม่ (บาง Component ใช้เป็น Brand บาง Component ใช้เป็น Success Semantic ปนกัน ต้องแยกทีละจุด)

---

## 📅 [2026-09-11] - Facility Booking / Vehicle & Visitor / Voting Modules (Frontend) + แก้บั๊ก Invite QR ไม่เปิด LIFF + Auto-Login รวมศูนย์

### 📌 รายการกิจกรรมที่ดำเนินการ:
1. **หน้าจอใหม่ 6 หน้า** รองรับ Backend 3 โมดูลใหม่ (ดู `playground-api/docs/ACTIVITY_LOG.md` Phase 16 คู่กัน) — ตามรูปแบบ [AdminParcelView.vue](file:///Users/user/Desktop/playgroud/playground/playground-frontend/src/views/AdminParcelView.vue)/[LiffParcelsView.vue](file:///Users/user/Desktop/playgroud/playground/playground-frontend/src/views/LiffParcelsView.vue) เป๊ะ (เรียก `@/utils/api` ตรงๆ ไม่มี Store/Service แยก):
   - `AdminFacilityBookingView.vue` + `LiffFacilityBookingView.vue` (`/facility-bookings`, `/liff/facility-bookings`)
   - `AdminVehicleView.vue` + `LiffVehicleView.vue` (`/vehicles`, `/liff/vehicles`)
   - `AdminPollView.vue` + `LiffPollView.vue` (`/polls`, `/liff/polls`)
   - เพิ่ม `ENABLE_FACILITY_BOOKING`/`ENABLE_VOTING` ใน [FeatureSettingsView.vue](file:///Users/user/Desktop/playgroud/playground/playground-frontend/src/views/FeatureSettingsView.vue) (ไอคอน/สี), เพิ่มเมนู Sidebar ใน [App.vue](file:///Users/user/Desktop/playgroud/playground/playground-frontend/src/App.vue) ที่พลาดไปตอนแรก (สร้าง Route ไว้แต่ลืมผูกเมนู ผู้ใช้ถามว่า "menu อยู่ไหน" ถึงรู้ตัว)
2. **🐛 แก้บั๊ก Invite QR/ลิงก์ไม่เปิด LIFF (ผู้ใช้รายงานว่าสแกนแล้วไม่เปิด LIFF)**: ไล่หาต้นตอเจอ 4 จุดสร้างลิงก์ผิดรูปแบบเหมือนกันหมด (`${window.location.origin}/liff/...` แทน `https://liff.line.me/{LIFF_ID}/...`):
   - [TenantDetail.vue](file:///Users/user/Desktop/playgroud/playground/playground-frontend/src/views/TenantDetail.vue) — Modal "เชื่อมต่อบัญชี LINE ให้ผู้เช่า" (จุดที่ผู้ใช้เจอจริงในภาพหน้าจอ)
   - [TenantSecurityTab.vue](file:///Users/user/Desktop/playgroud/playground/playground-frontend/src/components/TenantSecurityTab.vue) — Modal เดียวกันแต่โค้ดซ้ำอีกชุด เรียกจากแท็บ "ความปลอดภัย" หน้าเดียวกัน
   - [RoomInviteModal.vue](file:///Users/user/Desktop/playgroud/playground/playground-frontend/src/components/RoomInviteModal.vue) — ลิงก์เชิญรูมเมทที่แอดมินคัดลอกไปแชร์
   - [LiffProfileView.vue](file:///Users/user/Desktop/playgroud/playground/playground-frontend/src/views/LiffProfileView.vue) — QR เชิญรูมเมทที่ลูกบ้านสร้างเอง
   - แก้ทั้ง 4 จุดให้ใช้ `VITE_LINE_LIFF_ID`/`VITE_LIFF_ID` ประกอบเป็น `https://liff.line.me/{LIFF_ID}/...` เหมือน Pattern ที่ `router/index.js`/`utils/liff.js` ใช้อยู่แล้ว (Fallback เป็นของเดิมถ้าไม่มี Env Var ตั้งไว้)
3. **🐛 แก้บั๊กต่อเนื่อง "กรุณาเข้าสู่ระบบก่อน" หลังแก้ข้อ 2**: สแกน QR ที่แก้แล้วเปิด LIFF ถูกแล้ว แต่ยัง 401 เพราะ [LiffOnboardingView.vue](file:///Users/user/Desktop/playgroud/playground/playground-frontend/src/views/LiffOnboardingView.vue) ไม่เคยเรียก `loginLiff()` เลย (มีแค่ `LiffEntryView.vue` ที่ทำ) — ผู้ใช้ถามต่อว่า "ถ้ามาผ่าน liff ควร auto login ทุกครั้ง" เลย**ย้าย Auto-Login ไปรวมศูนย์ที่ `liffNavigationGuard`** (`router/index.js`) แทนที่จะเขียนเช็คซ้ำทีละหน้า — Guard เรียก `isLiffLoggedIn()`/`loginLiff()` ให้ทุกหน้าที่ผ่าน Guard นี้อัตโนมัติ (จำกัด 1 ครั้ง/Session เหมือนเดิม) ลบโค้ด Auto-Login ที่เพิ่งแปะไว้ใน `LiffOnboardingView.vue` ทิ้งเพราะซ้ำกับ Guard แล้ว
4. **Build Verification**: รัน `yarn build` ผ่าน 100% (0 Errors) ทุกครั้งหลังแก้แต่ละส่วน

### STATUS: 🟢 COMPLETE & VERIFIED (Backend ส่วนที่เกี่ยวข้องดู `playground-api/docs/ACTIVITY_LOG.md` Phase 16)
