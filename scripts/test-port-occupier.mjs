import http from 'node:http';

http
  .createServer((req, res) => {
    res.writeHead(200, { 'content-type': 'text/plain; charset=utf-8' });
    res.end('occupied');
  })
  .listen(3000, '127.0.0.1');

setInterval(() => {}, 1000);
