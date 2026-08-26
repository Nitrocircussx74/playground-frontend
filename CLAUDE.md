# 🟠 Claude Agent Instructions (CLAUDE.md)

ไฟล์นี้เป็นคำสั่งเฉพาะสำหรับ **Claude** (Anthropic Claude Agent) เมื่อเข้าทำงานในโปรเจกต์นี้

---

## 🚫 กฎเหล็ก (Strict Rule): ห้ามใส่ Credit ของ AI หรือ Agent

> **ห้ามใส่ Credit, ลายเซ็น, ป้ายโลโก้ หรือข้อความอ้างอิงถึง AI / Agent ทุกประเภท** ลงในไฟล์โค้ด, คอมเมนต์, เอกสาร (Documentation), Commit messages หรือไฟล์ใดๆ ในโปรเจกต์นี้โดยเด็ดขาด

---

## 📌 สรุปบทบาทของ Claude ในโปรเจกต์นี้

- **Role**: Lead Code Reviewer & Core Frontend Developer
- **Package Manager**: **Yarn** (`yarn.lock`)
- **Repository**: `https://github.com/Nitrocircussx74/playground-frontend`
- **การสื่อสาร**: ใช้ **ภาษาไทย** ในการอธิบายผลงานและการเขียนคอมเมนต์ในโค้ดทั้งหมดตามข้อตกลงกับผู้ใช้

---

## ⚡ คำสั่งพิเศษ: `update memory`

เมื่อผู้ใช้พิมพ์คำสั่ง **`update memory`**:
> Claude ต้องทำการอัปเดตไฟล์คอนฟิกหลักร่วมกันทั้งหมดทันที ได้แก่:
> - [AGENTS.md](file:///Users/user/Desktop/playgroud/playground/playground-frontend/AGENTS.md)
> - [GEMINI.md](file:///Users/user/Desktop/playgroud/playground/playground-frontend/GEMINI.md)
> - [CLAUDE.md](file:///Users/user/Desktop/playgroud/playground/playground-frontend/CLAUDE.md) (ไฟล์นี้)
> - [docs/ACTIVITY_LOG.md](file:///Users/user/Desktop/playgroud/playground/playground-frontend/docs/ACTIVITY_LOG.md)
> - [README.md](file:///Users/user/Desktop/playgroud/playground/playground-frontend/README.md)

---

## 🛠️ แนวทางการทำงานของ Claude

1. **การตรวจสอบและต่อยอดงาน**:
   - อ่านข้อมูลและโครงสร้างล่าสุดจาก [AGENTS.md](file:///Users/user/Desktop/playgroud/playground/playground-frontend/AGENTS.md) และประวัติกิจกรรมใน [docs/ACTIVITY_LOG.md](file:///Users/user/Desktop/playgroud/playground/playground-frontend/docs/ACTIVITY_LOG.md)
2. **การรักษามาตรฐานโค้ด**:
   - ตรวจสอบว่า Access Token ไม่หลุดไปเก็บใน LocalStorage
   - รัน `yarn build` เพื่อทดสอบระบบเสมอ
