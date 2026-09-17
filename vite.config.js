import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { fileURLToPath, URL } from 'node:url'
import { execSync } from 'node:child_process'

function killPortPlugin(port = 5173) {
  return {
    name: 'kill-port-on-serve',
    config(config, { command }) {
      if (command === 'serve') {
        try {
          if (process.platform === 'win32') {
            execSync(`for /f "tokens=5" %a in ('netstat -aon ^| findstr :${port}') do taskkill /f /pid %a`, { stdio: 'ignore' })
          } else {
            const pids = execSync(`lsof -ti :${port}`, { encoding: 'utf8' })
              .split('\n')
              .map((p) => p.trim())
              .filter((p) => p && p !== String(process.pid) && p !== String(process.ppid))

            if (pids.length > 0) {
              execSync(`kill -9 ${pids.join(' ')}`, { stdio: 'ignore' })
            }
          }
        } catch {
          // Process already terminated or not found
        }
      }
    }
  }
}

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue(), killPortPlugin(5173)],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
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
    strictPort: true,
    host: true,
    allowedHosts: true,
    cors: true,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': '*',
      'Access-Control-Allow-Headers': '*'
    }
  }
})



