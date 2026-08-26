# ==========================================
# STAGE 1: Build Vue 3 App ด้วย Vite
# ==========================================
FROM node:20-alpine AS builder

WORKDIR /app

# คัดลอกไฟล์จัดการความสัมพันธ์ Dependencies
COPY package.json yarn.lock ./

# ติดตั้ง Dependencies ทั้งหมด
RUN yarn install --frozen-lockfile

# คัดลอกโค้ดทั้งหมดเข้า Builder Container
COPY . .

# ประกอบโปรเจกต์ (Production Build)
RUN yarn build

# ==========================================
# STAGE 2: Nginx Web Server สำหรับ Production
# ==========================================
FROM nginx:alpine

# คัดลอก Static Files จาก Stage Builder ไปยัง Nginx Web Root
COPY --from=builder /app/dist /usr/share/nginx/html

# คัดลอกไฟล์ตั้งค่า Nginx (SPA Routing & API Proxy)
COPY nginx.conf /etc/nginx/conf.d/default.conf

# เปิดพอร์ต 80
EXPOSE 80

# เริ่มต้นการทำงานของ Nginx Web Server
CMD ["nginx", "-g", "daemon off;"]
