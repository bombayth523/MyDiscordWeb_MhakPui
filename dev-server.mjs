// ============================================================
// กลุ่มหมักปุ๋ย — Local Development Server (Node.js)
// รันเซิร์ฟเวอร์ทดสอบในเครื่องพร้อมรองรับ /api/chat และโหลด .env
// ใช้งาน: node dev-server.mjs
// ============================================================

import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import handler from './api/chat.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// โหลดตัวแปรจากไฟล์ .env ถ้ามี
const envPath = path.join(__dirname, '.env');
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf-8');
  for (const line of envContent.split('\n')) {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('#')) {
      const idx = trimmed.indexOf('=');
      if (idx !== -1) {
        const key = trimmed.slice(0, idx).trim();
        const val = trimmed.slice(idx + 1).trim().replace(/^['"]|['"]$/g, '');
        if (!process.env[key]) {
          process.env[key] = val;
        }
      }
    }
  }
  console.log('✅ โหลด .env เรียบร้อย (GEMINI_API_KEY พร้อมทำงาน)');
} else {
  console.log('⚠️ ไม่พบไฟล์ .env ในโฟลเดอร์');
}

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon'
};

const PORT = 3001;

const server = http.createServer(async (req, res) => {
  const parsedUrl = new URL(req.url, `http://${req.headers.host}`);
  const pathname = parsedUrl.pathname;

  // 1. จัดการ Endpoint /api/chat
  if (pathname === '/api/chat') {
    if (req.method !== 'POST') {
      res.writeHead(405, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify({ error: 'Method not allowed' }));
    }

    let rawBody = '';
    req.on('data', chunk => { rawBody += chunk; });
    req.on('end', async () => {
      let bodyObj = {};
      try { bodyObj = JSON.parse(rawBody); } catch (e) {}

      // จำลอง express-like response object ให้ api/chat.js
      const customRes = {
        statusCode: 200,
        headers: { 'Content-Type': 'application/json' },
        status(code) { this.statusCode = code; return this; },
        json(data) {
          res.writeHead(this.statusCode, this.headers);
          res.end(JSON.stringify(data));
        }
      };

      const customReq = {
        method: req.method,
        body: bodyObj,
        headers: req.headers
      };

      try {
        console.log(`\n[API Request] /api/chat: "${bodyObj.message || ''}"`);
        await handler(customReq, customRes);
      } catch (err) {
        console.error('Handler error:', err);
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Internal server error' }));
      }
    });
    return;
  }

  // 2. จัดการ Static Files
  let filePath = path.join(__dirname, pathname);
  if (fs.existsSync(filePath) && fs.statSync(filePath).isDirectory()) {
    filePath = path.join(filePath, 'index.html');
  }

  if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';
    res.writeHead(200, { 'Content-Type': contentType });
    fs.createReadStream(filePath).pipe(res);
  } else {
    res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end('404 Not Found');
  }
});

server.listen(PORT, () => {
  console.log(`\n🚀 Dev Server รันแล้วที่: http://localhost:${PORT}`);
  console.log(`💬 ลองเปิดหน้าแชตบอท: http://localhost:${PORT}/chatbot/index.html\n`);
});
