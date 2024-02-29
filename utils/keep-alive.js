import http from 'http';

http.createServer((req, res) => {
  res.writeHead(200, {'Content-Type': 'text/plain'});
  res.write("I'm Alive");
  res.end();
}).listen(8080);
