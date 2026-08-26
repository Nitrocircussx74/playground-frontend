# 🤖 คำสั่งและข้อตกลงการทำงานสำหรับ AI Agents (AGENTS.md)

ไฟล์นี้เป็นคู่มือกลางสำหรับ AI Coding Assistants ทั้งหมด (รวมถึง **Gemini** และ **Claude**) ที่เข้ามาทำงานใน repository นี้ เพื่อให้เข้าใจโครงสร้างโปรเจกต์ กฎการเขียนโค้ด และแนวทางการทำงานร่วมกัน

---

## 🚫 กฎเหล็ก (Strict Rule): ห้ามใส่ Credit ของ AI หรือ Agent

> **ห้ามใส่ Credit, ลายเซ็น, ป้ายโลโก้ หรือข้อความอ้างอิงถึง AI / Agent ทุกประเภท** ลงในไฟล์โค้ด, คอมเมนต์, เอกสาร (Documentation), Commit messages หรือไฟล์ใดๆ ในโปรเจกต์นี้โดยเด็ดขาด

---

## 📌 ข้อมูลโปรเจกต์ (Project Overview)

- **Architecture Overview**: โปรเจกต์นี้ทำงานร่วมกันเป็นคู่ (Full-Stack Architecture):
  - 🖥️ **`playground-frontend`**: ระบบ Frontend (Vue 3 + Vite + Pinia + Axios)
  - ⚙️ **`playground-api`**: ระบบ Backend (Node.js + Express + PostgreSQL + JWT + HTTP-Only Cookie)
- **Repository**: `https://github.com/Nitrocircussx74/playground-frontend` (GitHub Account: `Nitrocircussx74`)
- **Package Manager**: **Yarn** (`yarn.lock`)
- **Framework & Build Tool**: Vue 3 + Vite
- **State Management**: **Pinia** (`src/stores/auth.js`) - เก็บ Access Token และข้อมูล User ใน Memory เท่านั้นเพื่อป้องกัน XSS
- **Routing & Guards**: **Vue Router 4** (`src/router/index.js`) - ควบคุมการเข้าถึงหน้าด้วย Route Guard (`router.beforeEach`)
- **HTTP Client**: **Axios** (`src/utils/api.js`) - ตั้งค่า `withCredentials: true` เพื่อรองรับ HTTP-Only Refresh Token Cookie จาก `playground-api` (Base URL: `http://localhost:3000`) พร้อมระบบ Request Queueing สำหรับ Silent Refresh
- **Language Policy**: ตอบผู้ใช้และเขียนข้อความคอมเมนต์เป็น **ภาษาไทย** เท่านั้น

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
   - **ห้าม** เก็บ Access Token ลงใน `localStorage` หรือ `sessionStorage`
   - Refresh Token บริหารจัดการผ่าน HTTP-Only Cookie จาก Node.js Backend เสมอ
4. **Language Policy**: ความคิดเห็นในโค้ด (Comments) และเอกสารคำอธิบาย ให้ใช้ **ภาษาไทย** เป็นหลัก

---

## 🤝 ข้อตกลงการทำงานร่วมกันระหว่าง Gemini และ Claude (Multi-Agent Protocol)

1. **อัปเดต Activity Log**: เมื่อ Agent ทำการสร้างหรือแก้ไขไฟล์งาน ให้ลงบันทึกใน [docs/ACTIVITY_LOG.md](file:///Users/user/Desktop/playgroud/playground/playground-frontend/docs/ACTIVITY_LOG.md) เสมอ
2. **รักษาความสะอาดของโค้ด**: ก่อนจบการทำงาน ให้รัน `yarn build` เพื่อตรวจสอบว่าไม่มี Compilation Errors
3. **การส่งมอบงาน (Handover)**: หากต้องส่งต่องานให้ Agent อื่น ให้ระบุสถานะล่าสุดลงใน `docs/ACTIVITY_LOG.md`
