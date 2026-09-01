const http = require('http');
const fs = require('fs');
const path = require('path');

let PORT = parseInt(process.env.PORT || 3000, 10);
const PUBLIC_DIR = __dirname;

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.webp': 'image/webp'
};

const server = http.createServer((req, res) => {
  let reqPath = req.url.split('?')[0];
  if (reqPath === '/' || reqPath === '') reqPath = '/index.html';
  const filePath = path.join(PUBLIC_DIR, decodeURIComponent(reqPath));

  fs.stat(filePath, (err, stats) => {
    if (err || !stats.isFile()) {
      res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
      res.end('404 Not Found');
      return;
    }

    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';
    res.writeHead(200, { 
      'Content-Type': contentType,
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0'
    });
    fs.createReadStream(filePath).pipe(res);
  });
});

function startServer(portToTry) {
  server.listen(portToTry, '0.0.0.0', () => {
    console.log('\n=============================================================');
    console.log('  🇩🇪  PrüfungStore Pro • ABDEUTSCH CENTER (Serveur Actif)  ');
    console.log('=============================================================');
    console.log('  🛍️  Boutique Publique : http://localhost:' + portToTry + '/');
    console.log('  🔐  Espace Admin     : http://localhost:' + portToTry + '/admin.html');
    console.log('  📊  Dashboard BI     : http://localhost:' + portToTry + '/student-assessment.html');
    console.log('=============================================================\n');
  });
}

server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.warn(`⚠️  Le port ${PORT} est déjà occupé. Basculement automatique sur le port ${PORT + 1}...`);
    PORT += 1;
    startServer(PORT);
  } else {
    console.error('Erreur serveur:', err);
  }
});

startServer(PORT);
