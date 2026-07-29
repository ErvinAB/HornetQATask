const http = require('http');
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..', 'app');
const PORT = parseInt(process.env.PORT || '8080', 10);
const HOST = process.env.DOCKER ? '0.0.0.0' : '127.0.0.1';

const MIME = {
  '.html': 'text/html',
  '.css': 'text/css',
  '.js': 'application/javascript',
  '.json': 'application/json',
  '.map': 'application/json',
  '.png': 'image/png',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.eot': 'application/vnd.ms-fontobject',
  '.ttf': 'font/ttf',
};

const REWRITES = { '/todo': '/todo.html', '/todo/': '/todo.html' };

const server = http.createServer((req, res) => {
  let url = new URL(req.url, `http://${req.headers.host}`).pathname;

  if (url.endsWith('/') && url.length > 1) {
    url = url.slice(0, -1);
  }

  const resolved = REWRITES[url] || url;
  const filePath = path.join(ROOT, resolved);

  if (!filePath.startsWith(ROOT)) {
    res.writeHead(403);
    res.end('Forbidden');
    return;
  }

  fs.readFile(filePath, (err, data) => {
    if (err) {
      if (err.code === 'ENOENT') {
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        res.end('Not Found');
      } else {
        res.writeHead(500);
        res.end('Internal Server Error');
      }
      return;
    }
    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME[ext] || 'application/octet-stream';
    res.writeHead(200, {
      'Content-Type': contentType,
      'Cache-Control': 'no-cache',
    });
    res.end(data);
  });
});

server.listen(PORT, HOST, () => {
  process.stdout.write(`Server listening on http://${HOST}:${PORT}\n`);
});

process.on('SIGTERM', () => server.close(() => process.exit(0)));
process.on('SIGINT', () => server.close(() => process.exit(0)));
