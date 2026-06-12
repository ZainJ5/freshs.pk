const { createServer } = require('http');
const { parse } = require('url');
const next = require('next');
const { Server } = require('socket.io');
const fs = require('fs');
const path = require('path');

const dev = process.env.NODE_ENV !== 'production';
const app = next({ dev });
const handle = app.getRequestHandler();

const PUBLIC_DIR = path.join(process.cwd(), 'public');

// Static file types that may be uploaded to /public at runtime (logos,
// category/product images, menus, notification sounds, etc.).
const STATIC_TYPES = {
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.webp': 'image/webp',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.bmp': 'image/bmp',
  '.avif': 'image/avif',
  '.pdf': 'application/pdf',
  '.mp3': 'audio/mpeg',
  '.wav': 'audio/wav',
};

// Next.js (in production) does NOT serve files added to /public after the
// build. Admin-uploaded assets therefore have to be served by the custom
// server so they work on any access path (direct app port, nginx, domain).
function tryServeStatic(res, pathname) {
  const ext = path.extname(pathname).toLowerCase();
  const contentType = STATIC_TYPES[ext];
  if (!contentType || pathname.includes('..')) return false;

  let filePath;
  try {
    filePath = path.join(PUBLIC_DIR, decodeURIComponent(pathname));
  } catch {
    return false;
  }
  // Prevent path traversal outside /public.
  if (filePath !== PUBLIC_DIR && !filePath.startsWith(PUBLIC_DIR + path.sep)) return false;

  let stat;
  try {
    stat = fs.statSync(filePath);
  } catch {
    return false; // not found -> let Next handle it
  }
  if (!stat.isFile()) return false;

  res.setHeader('Content-Type', contentType);
  res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
  const stream = fs.createReadStream(filePath);
  stream.on('error', () => {
    if (!res.headersSent) res.statusCode = 500;
    res.end();
  });
  stream.pipe(res);
  return true;
}

app.prepare().then(() => {
  const server = createServer((req, res) => {
    const parsedUrl = parse(req.url, true);
    if (tryServeStatic(res, parsedUrl.pathname || '')) return;
    handle(req, res, parsedUrl);
  });

  const io = new Server(server);

  global.io = io;

  io.on('connection', (socket) => {
    console.log('Client connected:', socket.id);

    socket.on('disconnect', () => {
      console.log('Client disconnected:', socket.id);
    });
  });

  const port = process.env.PORT || 3002;
  server.listen(port, (err) => {
    if (err) throw err;
    console.log(`> Ready on http://localhost:${port}`);
  });
});
