import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { fileURLToPath, URL } from 'node:url'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    {
      // Cloudflare Tunnel ทับ Cache-Control ของไฟล์ .js ใต้ /src เป็น max-age=14400 (4 ชม.) ทำให้ Browser ค้าง main.js/store เก่า
      // ปนกับโมดูลใหม่ที่ได้ pinia.js?v=hash ใหม่ จนเกิด Pinia 2 สำเนา (getActivePinia() ไม่มี) - บังคับ no-store เฉพาะ dev
      name: 'dev-src-no-store',
      apply: 'serve',
      configureServer(server) {
        server.middlewares.use((req, res, next) => {
          // ชั่วคราว: สั่ง Browser ล้าง HTTP cache ของโดเมนนี้ตอนเปิดหน้า เพื่อทิ้ง .js เก่าที่ค้างจากช่วงที่ยังโดนแคช 4 ชม.
          // ponytail: ลบบล็อกนี้ทิ้งได้หลังทุกเครื่องโหลดใหม่แล้ว 1 ครั้ง (Safari/iOS ไม่รองรับ ต้องล้าง cache เอง)
          if (req.headers.accept?.includes('text/html')) res.setHeader('Clear-Site-Data', '"cache"');
          if (req.url?.startsWith('/src/')) {
            const setHeader = res.setHeader.bind(res);
            res.setHeader = (name, value) =>
              setHeader(name, name.toLowerCase() === 'cache-control' ? 'no-store' : value);
          }
          next();
        });
      }
    }
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  },
  // กัน Vite re-optimize กลางทางตอน lazy-load route แล้ว pinia ถูกโหลดซ้ำ 2 สำเนา (getActivePinia() = undefined)
  optimizeDeps: {
    include: [
      'vue', 'vue-router', 'pinia', 'lucide-vue-next', 'radix-vue', 'sweetalert2', 'chart.js', 'vue-chartjs',
      '@line/liff', '@vuepic/vue-datepicker', 'axios', 'class-variance-authority', 'clsx', 'driver.js',
      'html2canvas', 'qrcode', 'tailwind-merge'
    ]
  },
  build: {
    chunkSizeWarningLimit: 600,
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor-vue': ['vue', 'vue-router', 'pinia'],
          'vendor-ui': ['lucide-vue-next', 'radix-vue', 'sweetalert2'],
          'vendor-charts': ['chart.js', 'vue-chartjs']
        }
      }
    }
  },
  preview: {
    port: 5173,
    headers: {
      'Cache-Control': 'public, max-age=31536000, immutable'
    }
  },
  server: {
    port: 5173,
    host: true,
    allowedHosts: true,
    cors: true,
    hmr: {
      clientPort: 443
    },
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': '*',
      'Access-Control-Allow-Headers': '*'
    }
  }
})



