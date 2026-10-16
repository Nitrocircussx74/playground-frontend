/**
 * รัน Vite dev server + Cloudflare Named Tunnel (horspace-dev) พร้อมกัน
 * - app.horspace.com → Vite (port อะไรก็ได้ที่ Vite เลือก)
 * - config อยู่ที่ ~/.cloudflared/config.yml
 *
 * ถ้า Vite ได้ port ≠ 5173 ให้แก้ config.yml ด้วยตนเอง
 * (ปกติ Vite ใช้ 5173 เป็น default ถ้าว่าง)
 */
import { spawn } from 'child_process';

// --- Vite ---
const vite = spawn('vite', [], { stdio: 'inherit' });

// --- Named Tunnel ---
const tunnel = spawn('cloudflared', ['tunnel', 'run', 'horspace-dev'], {
  stdio: ['ignore', 'pipe', 'pipe'],
});

tunnel.stdout.on('data', (d) => process.stdout.write(`\x1b[36m[Tunnel]\x1b[0m ${d}`));
tunnel.stderr.on('data', (d) => {
  const text = d.toString();
  // กรอง INFO spam ปกติออก แสดงเฉพาะ INF Registered (connected) และ ERR
  if (text.includes('Registered tunnel connection')) {
    console.log('\n\x1b[1m\x1b[32m' + '═'.repeat(60) + '\x1b[0m');
    console.log('\x1b[1m\x1b[32m  Tunnel Active!\x1b[0m');
    console.log('\x1b[1m\x1b[33m  app.horspace.com\x1b[0m → Vite dev server');
    console.log('\x1b[1m\x1b[33m  api.horspace.com\x1b[0m → API :3000');
    console.log('\x1b[1m\x1b[32m' + '═'.repeat(60) + '\x1b[0m\n');
  } else if (text.includes('ERR') || text.includes('error')) {
    process.stderr.write(`\x1b[31m[Tunnel]\x1b[0m ${text}`);
  }
});

tunnel.on('close', (code) => {
  if (code !== 0 && code !== null) {
    console.error(`\x1b[31m[Tunnel] exited with code ${code}\x1b[0m`);
  }
});

vite.on('close', (code) => {
  tunnel.kill();
  process.exit(code ?? 0);
});

for (const sig of ['SIGINT', 'SIGTERM']) {
  process.on(sig, () => {
    vite.kill(sig);
    tunnel.kill(sig);
    process.exit();
  });
}
