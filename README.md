# ⚡ Vue 3 Clean Architecture Auth Frontend (JWT + HTTP-Only Cookie)

โปรเจกต์ Frontend พัฒนาด้วย **Vue 3 (Vite)** ตามหลัก **Clean Architecture** เชื่อมต่อกับระบบ Node.js Express API ที่ใช้มาตรฐานรักษาความปลอดภัยด้วย **JWT Access Token (In-Memory)** และ **HTTP-Only Cookie (Refresh Token)**

---

## 🌟 คุณสมบัติเด่น (Features)

1. **🔒 Secure Access Token Storage (XSS Protection)**: เก็บ Access Token ไว้ใน Memory (Pinia State) เท่านั้น ห้ามเก็บลง `localStorage`
2. **🍪 HTTP-Only Cookie Integration**: ตั้งค่า Axios Instance ด้วย `withCredentials: true` เพื่อส่งและรับ Refresh Token Cookie โดยอัตโนมัติ
3. **🔄 Silent Refresh & Request Queueing**: Response Interceptor ดักจับ 401 Unauthorized และยิงขอ Access Token ใหม่แบบ Silent Refresh พร้อมระบบคิว (`failedQueue`) ป้องกัน race condition เมื่อยิง API ซ้ำกันหลายตัว
4. **🛡️ Vue Router Navigation Guards**: ตรวจสอบการเปิดใช้งาน (F5) และป้องกันการเข้าถึงหน้าเว็บสำหรับ Protected Routes (`/dashboard`, `/profile`)
5. **🎨 Premium Glassmorphism Design**: ออกแบบด้วยสไตล์ Glassmorphic UI สวยงาม รองรับ Responsive

---

## 📁 โครงสร้างไดเรกทอรี (Directory Structure)

```text
playground-frontend/
├── .env                          # ตั้งค่า API Base URL (http://localhost:3000)
├── package.json                  # Dependencies (axios, pinia, vue-router)
├── vite.config.js                # Vite Config + Alias (@ -> /src)
└── src/
    ├── main.js                   # Entry Point ของ Vue App
    ├── App.vue                   # Root Component & Layout
    ├── assets/
    │   └── main.css              # Style หลัก (Glassmorphic Modern UI)
    ├── utils/
    │   └── api.js                # Axios Instance & Silent Refresh Interceptor
    ├── services/
    │   └── authService.js        # Auth API Service Layer
    ├── stores/
    │   └── auth.js               # Pinia Auth State Store
    ├── router/
    │   └── index.js              # Vue Router & Navigation Guard (beforeEach)
    └── views/
        ├── LoginView.vue         # หน้า เข้าสู่ระบบ
        ├── DashboardView.vue     # หน้า Dashboard (Protected Route & API Test)
        └── ProfileView.vue       # หน้า ข้อมูลผู้ใช้ (Protected Route)
```

---

## 🛠️ ขั้นตอนการรันโปรเจกต์ (Getting Started)

```bash
# 1. ติดตั้ง Dependencies ด้วย Yarn
yarn install

# 2. รันโหมดพัฒนา (Development Mode)
yarn dev

# 3. ประกอบระบบเพื่อใช้งานจริง (Production Build)
yarn build
```

---

## 🤖 ข้อมูล AI Agents & Guidelines

โปรเจกต์นี้มีคู่มือและข้อตกลงการทำงานร่วมกันสำหรับ AI Assistants ในไฟล์:
- [AGENTS.md](file:///Users/user/Desktop/playgroud/playground/playground-frontend/AGENTS.md)
- [GEMINI.md](file:///Users/user/Desktop/playgroud/playground/playground-frontend/GEMINI.md)
- [CLAUDE.md](file:///Users/user/Desktop/playgroud/playground/playground-frontend/CLAUDE.md)
- [docs/ACTIVITY_LOG.md](file:///Users/user/Desktop/playgroud/playground/playground-frontend/docs/ACTIVITY_LOG.md)
