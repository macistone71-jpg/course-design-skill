'use strict';

const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const { generateLessonPackage, validateInput } = require('./src/generator');

const PORT = Number(process.env.PORT || 3000);
const PUBLIC_DIR = path.join(__dirname, 'public');
const MAX_BODY = 1024 * 1024;

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon'
};

function sendJson(res, status, payload) {
  res.writeHead(status, {
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': 'no-store',
    'X-Content-Type-Options': 'nosniff'
  });
  res.end(JSON.stringify(payload));
}

function readJson(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', chunk => {
      body += chunk;
      if (Buffer.byteLength(body) > MAX_BODY) {
        reject(Object.assign(new Error('请求内容不能超过 1MB'), { status: 413 }));
        req.destroy();
      }
    });
    req.on('end', () => {
      try {
        resolve(JSON.parse(body || '{}'));
      } catch {
        reject(Object.assign(new Error('请求 JSON 格式错误'), { status: 400 }));
      }
    });
    req.on('error', reject);
  });
}

function safePublicPath(urlPath) {
  const decoded = decodeURIComponent(urlPath.split('?')[0]);
  const relative = decoded === '/' ? 'index.html' : decoded.replace(/^\/+/, '');
  const filePath = path.resolve(PUBLIC_DIR, relative);
  return filePath.startsWith(PUBLIC_DIR + path.sep) || filePath === path.join(PUBLIC_DIR, 'index.html')
    ? filePath
    : null;
}

async function handler(req, res) {
  const pathname = new URL(req.url, `http://${req.headers.host || 'localhost'}`).pathname;

  if (pathname === '/api/health' && req.method === 'GET') {
    return sendJson(res, 200, {
      ok: true,
      service: 'zhibeike',
      engine: process.env.AI_API_KEY ? 'ai-compatible' : 'auditable-demo',
      time: new Date().toISOString()
    });
  }

  if (pathname === '/api/generate' && req.method === 'POST') {
    try {
      const input = await readJson(req);
      const errors = validateInput(input);
      if (errors.length) return sendJson(res, 422, { ok: false, errors });
      const lessonPackage = generateLessonPackage(input);
      return sendJson(res, 200, { ok: true, lessonPackage });
    } catch (error) {
      return sendJson(res, error.status || 500, {
        ok: false,
        errors: [error.status ? error.message : '生成失败，请稍后重试']
      });
    }
  }

  if (pathname.startsWith('/api/')) return sendJson(res, 404, { ok: false, errors: ['接口不存在'] });
  if (!['GET', 'HEAD'].includes(req.method)) return sendJson(res, 405, { ok: false, errors: ['不支持的请求方法'] });

  const filePath = safePublicPath(pathname);
  if (!filePath) return sendJson(res, 403, { ok: false, errors: ['禁止访问'] });

  fs.stat(filePath, (error, stat) => {
    if (error || !stat.isFile()) {
      const fallback = path.join(PUBLIC_DIR, 'index.html');
      res.writeHead(200, { 'Content-Type': MIME['.html'], 'Cache-Control': 'no-cache' });
      return req.method === 'HEAD' ? res.end() : fs.createReadStream(fallback).pipe(res);
    }
    const ext = path.extname(filePath).toLowerCase();
    res.writeHead(200, {
      'Content-Type': MIME[ext] || 'application/octet-stream',
      'Cache-Control': ext === '.html' ? 'no-cache' : 'public, max-age=3600',
      'X-Content-Type-Options': 'nosniff'
    });
    if (req.method === 'HEAD') return res.end();
    fs.createReadStream(filePath).pipe(res);
  });
}

const server = http.createServer(handler);
server.listen(PORT, '0.0.0.0', () => {
  console.log(`智备课已启动：http://localhost:${PORT}`);
});

module.exports = { handler };
