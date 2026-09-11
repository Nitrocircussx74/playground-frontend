# 🤖 คำสั่งและข้อตกลงการทำงานสำหรับ AI Agents (AGENTS.md)

ไฟล์นี้เป็นคู่มือกลางสำหรับ AI Coding Assistants ทั้งหมด (รวมถึง **Gemini** และ **Claude**) ที่เข้ามาทำงานใน repository นี้ เพื่อให้เข้าใจโครงสร้างโปรเจกต์ กฎการเขียนโค้ด และแนวทางการทำงานร่วมกัน

---

## 🚫 กฎเหล็ก (Strict Rule): ห้ามใส่ Credit ของ AI หรือ Agent

> **ห้ามใส่ Credit, ลายเซ็น, ป้ายโลโก้ หรือข้อความอ้างอิงถึง AI / Agent ทุกประเภท** ลงในไฟล์โค้ด, คอมเมนต์, เอกสาร (Documentation), Commit messages หรือไฟล์ใดๆ ในโปรเจกต์นี้โดยเด็ดขาด

---

## 📌 ข้อมูลโปรเจกต์ (Project Overview)

- **Architecture Overview**: โปรเจกต์นี้ทำงานร่วมกันเป็นคู่ (Full-Stack Architecture) และฝั่ง Frontend เป็นแบบ **Multi-System Single Repo**:
  - 🖥️ **`playground-frontend`**:
    - **Admin Portal (`/admin`)**: เว็บจัดการหลังบ้านสำหรับผู้ดูแลหอพัก (ผูกกับ `AdminLayout.vue` มี Sidebar/Navbar + JWT Guard)
    - **Tenant LIFF App (`/liff`)**: เว็บสำหรับผู้เช่าเปิดผ่านแอป LINE (ผูกกับ `LiffLayout.vue` โมบายวิว + `@line/liff` SDK)
  - ⚙️ **`playground-api`**: ระบบ Backend (Node.js + Express + PostgreSQL + JWT + HTTP-Only Cookie)
- **Repository**: `https://github.com/Nitrocircussx74/playground-frontend` (GitHub Account: `Nitrocircussx74`)
- **Package Manager**: **Yarn** (`yarn.lock`)
- **Framework & Build Tool**: Vue 3 + Vite + Tailwind CSS v3 + Shadcn Vue
- **State Management**: **Pinia** (`src/stores/adminAuth.js`, `src/stores/liffAuth.js`, `src/stores/auth.js`)
- **LINE Integration**: **LINE Front-end Framework SDK** (`@line/liff` v2.30) - จัดการ LINE User Profile
- **Routing & Guards**: **Vue Router 4** (`src/router/index.js`) - Nested Routes แยกกิ่ง `/admin` และ `/liff`
- **HTTP Client**: **Axios** (`src/utils/api.js`) - ตั้งค่า `withCredentials: true` รองรับ HTTP-Only Cookie จาก `playground-api`
- **Language Policy**: ตอบผู้ใช้และเขียนข้อความคอมเมนต์เป็น **ภาษาไทย** เท่านั้น
- **Maintenance & Issue Tracking**: Backend (`playground-api`) ยังแยก 2 ตาราง/Endpoint กันจริง (`maintenance-requests` ระบบเดิม กับ `issues` ระบบใหม่ที่รองรับทั้งซ่อม/ร้องเรียน/อื่นๆ) แต่ Frontend Unify การแสดงผลเป็นหน้าเดียวแล้วทั้งฝั่ง Admin (`MaintenanceView.vue` Kanban) และฝั่ง LIFF (`IssueHistory.vue`) - การเขียนข้อมูลใหม่จากฝั่งลูกบ้านให้ผ่าน `/liff/issues` เท่านั้น (`/liff/maintenance` เป็นแค่ Redirect เพื่อ Backward-compat)
- **LIFF Entry Detection**: [LiffEntryView.vue](file:///Users/user/Desktop/playgroud/playground/playground-frontend/src/views/LiffEntryView.vue) **ห้าม** ใช้ `liff.isInClient()` ตัดสินว่าอยู่ใน LINE App หรือไม่อีกต่อไป (ค่านี้ Unreliable ถ้า `liff.init()` ล้มเงียบๆ หรือผู้ใช้เปิดผ่าน External Browser) — ให้ลอง `loginLiff()` ก่อนเสมอ (LINE SDK จัดการทั้ง Silent Login ในแอปและ OAuth Redirect นอกแอปให้เอง) ถ้าเรียกไม่สำเร็จจริงๆ ค่อย Fallback ไป `/web/login`
- **LIFF Client Redirect Guard + Auto-Login รวมศูนย์ที่ Router Guard** ([router/index.js](file:///Users/user/Desktop/playgroud/playground/playground-frontend/src/router/index.js)): `liffNavigationGuard` เช็ค `liff.isInClient()` ก่อนทุกหน้า `/liff/*` — ถ้าไม่ได้เปิดผ่านแอป LINE จริง จะ `window.location.href` เด้งไป `https://liff.line.me/<LIFF_ID><path เดิม>` ให้อัตโนมัติ (ปิดใน `import.meta.env.DEV` เพื่อไม่รบกวนการทดสอบผ่าน Browser, เว้น `/web/login`) — ต่อจากนั้น Guard ยังเช็ค `isLiffLoggedIn()` และเรียก `loginLiff()` ให้อัตโนมัติด้วย (จำกัด 1 ครั้ง/Session ผ่าน `sessionStorage.liff_auto_login_attempted`) **ครอบคลุมทุกหน้าที่ผ่าน Guard นี้ ไม่ใช่แค่ `LiffEntryView.vue`** (เดิมมีแค่ `LiffEntryView.vue` เช็คเอง ทำให้ Deep Link เข้าหน้าอื่นตรงๆ เช่น `/liff/onboarding`, `/liff/register` ไม่มี LINE ID Token ให้ Backend ตรวจ โดน 401 "กรุณาเข้าสู่ระบบผ่าน LINE ก่อนใช้งาน") — ห้ามเพิ่ม Auto-Login Logic ซ้ำในแต่ละหน้าอีก ให้พึ่ง Guard นี้จุดเดียว
- **⚠️ Invite QR/ลิงก์ต้องเป็น `https://liff.line.me/{LIFF_ID}/...` เท่านั้น**: เคยมีบั๊กซ้ำ 4 จุด ([TenantDetail.vue](file:///Users/user/Desktop/playgroud/playground/playground-frontend/src/views/TenantDetail.vue), [TenantSecurityTab.vue](file:///Users/user/Desktop/playgroud/playground/playground-frontend/src/components/TenantSecurityTab.vue), [RoomInviteModal.vue](file:///Users/user/Desktop/playgroud/playground/playground-frontend/src/components/RoomInviteModal.vue), [LiffProfileView.vue](file:///Users/user/Desktop/playgroud/playground/playground-frontend/src/views/LiffProfileView.vue)) ที่สร้างลิงก์เชิญ/QR ด้วย `${window.location.origin}/liff/...` แทนที่จะเป็น `https://liff.line.me/{LIFF_ID}/...` — สแกน/แตะแล้วเปิดเป็นเว็บปกตินอก LINE ไม่ได้เปิดแอป LIFF จริง แก้ครบแล้วทั้ง 4 จุด (Fallback เป็น `window.location.origin` เฉพาะตอนไม่มี `VITE_LINE_LIFF_ID` ตั้งไว้เท่านั้น) — จุดใหม่ที่สร้างลิงก์/QR สำหรับเปิดผ่าน LIFF ต้องเช็ค Pattern นี้เสมอ
- **Dev Testing ผ่าน Browser (ไม่ใช้มือถือจริง)**: เติม `?devLineUserId=xxx` ต่อท้าย URL ครั้งเดียว (`main.js` Bootstrap จะ Persist ลง `localStorage.dev_line_user_id` ให้) คู่กับเปิด `LINE_AUTH_MOCK_MODE=true` ฝั่ง `playground-api/.env` — ใช้ได้เฉพาะ Dev Build (`yarn dev`) เท่านั้น เพราะกลไกนี้ถูก Gate ด้วย `import.meta.env.DEV` ทุกจุด
- **HorHub Brand Color = Teal `#0E7490`** (Sample จากโลโก้จริง, ใกล้เคียง Tailwind `cyan-700` ที่สุด) — สีนี้คือ Default ของทั้งระบบ (`tailwind.config.js`, `main.css`, `useDynamicTheme.js`) **ไม่ใช่** Purple/Indigo หรือ Blue-500 เดิม แต่ละตึกยังเปลี่ยน Theme สีของตัวเองได้ผ่าน `BuildingSettingsView.vue` (มี Preset "HorHub Teal" เป็นตัวเลือกแรก) — ห้ามใช้ `purple-*`/`indigo-*` เป็นสี CTA/Active State หลักของ CMS อีก ให้ใช้ `cyan-*`/`teal-*` แทน
- **Invite Code 2 ระบบซ้อนกัน (ยังไม่ได้รวม)**: `/liff/onboarding` (LiffOnboardingView.vue, `Tenant.inviteCode` — ผู้เช่าเดิม) vs `/liff/register` (LiffRegisterView.vue, `RoomInvite.code` — ผู้เช่าใหม่) หน้าตาคล้ายกันจนผู้ใช้สับสนได้ง่าย ก่อนแนะนำ Flow ผูกบัญชี ให้เช็คให้แน่ใจก่อนว่าผู้เช่ารายนั้น "มีอยู่แล้ว" หรือ "ใหม่เอี่ยม" แล้วชี้ไปหน้าที่ถูกต้อง

---

## ⚡ คำสั่งพิเศษ: `update memory` (Memory Sync Protocol)

เมื่อผู้ใช้พิมพ์คำสั่ง **`update memory`** (หรือขอให้อัปเดตความจำ/ความรู้โปรเจกต์):
> **บังคับ (Mandatory)**: AI Agents ต้องทำการอัปเดตไฟล์ข้อมูลและคอนฟิกเหล่านี้พร้อมกันทันที:
> 1. [AGENTS.md](file:///Users/user/Desktop/playgroud/playground/playground-frontend/AGENTS.md) (ไฟล์นี้)
> 2. [GEMINI.md](file:///Users/user/Desktop/playgroud/playground/playground-frontend/GEMINI.md)
> 3. [CLAUDE.md](file:///Users/user/Desktop/playgroud/playground/playground-frontend/CLAUDE.md)
> 4. [docs/ACTIVITY_LOG.md](file:///Users/user/Desktop/playgroud/playground/playground-frontend/docs/ACTIVITY_LOG.md)
> 5. [README.md](file:///Users/user/Desktop/playgroud/playground/playground-frontend/README.md)

---

## 🛠️ คำสั่งที่ใช้ในโปรเจกต์ (Yarn Commands)

```bash
# การติดตั้ง Dependencies ด้วย Yarn
yarn install

# การรันระบบในโหมดพัฒนา (Development Server)
yarn dev

# การประกอบโปรเจกต์เพื่อการใช้งานจริง (Production Build Verification)
yarn build

# การพรีวิวผลลัพธ์ Production Build
yarn preview
```

---

## 📐 กฎการเขียนโค้ดและดีไซน์ (Code Style & Conventions)

1. **Vue 3 Composition API**: ใช้ `<script setup>` เสมอ
2. **Layer Responsibilities**:
   - `utils/api.js`: จัดการ Axios Instance, Request Headers และ Response Interceptors (Silent Refresh Queue)
   - `services/authService.js`: รวมฟังก์ชันยิง API เกี่ยวกับ Authentication เพื่อลดความซับซ้อนใน Component
   - `stores/auth.js`: จัดการ State ของระบบยืนยันตัวตน (Access Token ใน RAM, User Data, Loading State)
   - `router/index.js`: กำหนดเส้นทาง และเขียน `router.beforeEach` สำหรับตรวจสอบสิทธิ์ก่อนเข้าถึงหน้าต่างๆ
   - `views/`: หน้าจอการทำงานหลัก (`LoginView.vue`, `DashboardView.vue`, `ProfileView.vue`)
3. **Security Standards**:
   - **ห้าม** เก็บ Access Token ลงใน `localStorage` หรือ `sessionStorage` ฝั่ง Admin และฝั่ง LIFF ที่ Login ผ่าน LINE (`liffToken` ใน `stores/auth.js` เป็น Memory-only, กู้คืนผ่าน `restoreLiffSession()` ด้วย LINE ID Token Silent Login แทนการเก็บ Token ไว้)
   - **ข้อยกเว้น**: ลูกบ้านที่ Login ผ่าน [WebLogin.vue](file:///Users/user/Desktop/playgroud/playground/playground-frontend/src/views/WebLogin.vue) (เบอร์โทร+PIN แบบไม่ผ่าน LINE) — `setTenantWebAuth()` ใน `stores/auth.js` **ตั้งใจ** เก็บ Token ลง `localStorage` (`horhub_tenant_token`) เพราะไม่มี LINE SDK ให้ Silent Re-Auth ได้เหมือนฝั่ง LIFF จำเป็นต้องคง Session ไว้ข้าม Page Reload
   - Refresh Token บริหารจัดการผ่าน HTTP-Only Cookie จาก Node.js Backend เสมอ
   - กลไก Dev-only Bypass ใดๆ (เช่น `dev_line_user_id`, Header `X-Line-User-Id`) ต้อง Gate ด้วย `import.meta.env.DEV` เสมอ ห้ามมี Mock/Hardcoded User ID หลุดไปกับ Production Build เด็ดขาด
4. **Language Policy**: ความคิดเห็นในโค้ด (Comments) และเอกสารคำอธิบาย ให้ใช้ **ภาษาไทย** เป็นหลัก

---

## 🤝 ข้อตกลงการทำงานร่วมกันระหว่าง Gemini และ Claude (Multi-Agent Protocol)

1. **อัปเดต Activity Log**: เมื่อ Agent ทำการสร้างหรือแก้ไขไฟล์งาน ให้ลงบันทึกใน [docs/ACTIVITY_LOG.md](file:///Users/user/Desktop/playgroud/playground/playground-frontend/docs/ACTIVITY_LOG.md) เสมอ
2. **รักษาความสะอาดของโค้ด**: ก่อนจบการทำงาน ให้รัน `yarn build` เพื่อตรวจสอบว่าไม่มี Compilation Errors
3. **การส่งมอบงาน (Handover)**: หากต้องส่งต่องานให้ Agent อื่น ให้ระบุสถานะล่าสุดลงใน `docs/ACTIVITY_LOG.md`
