const http = require("http");
const fs = require("fs");
const path = require("path");

const PORT = 5500;
const root = __dirname;

const server = http.createServer((req, res) => {
  const file = path.join(root, req.url === "/" ? "index.html" : req.url);
  if (!file.startsWith(root)) {
    res.writeHead(403);
    return res.end("forbidden");
  }
  fs.readFile(file, (err, data) => {
    if (err) {
      res.writeHead(404);
      return res.end("not found");
    }
    const ext = path.extname(file);
    const type =
      ext === ".html"
        ? "text/html"
        : ext === ".js"
          ? "application/javascript"
          : "text/plain";
    res.writeHead(200, { "Content-Type": type });
    res.end(data);
  });
});

server.listen(PORT, "127.0.0.1", () => {
  console.log(`Demo store http://127.0.0.1:${PORT}/`);
});
