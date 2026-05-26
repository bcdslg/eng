import { createReadStream, existsSync } from "node:fs";
import { createServer } from "node:http";
import { extname, join, normalize } from "node:path";

const root = join(process.cwd(), "dist");
const port = Number(process.env.PORT || 4173);

const contentTypes = {
  ".css": "text/css; charset=utf-8",
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml"
};

const server = createServer((request, response) => {
  const requestPath = decodeURIComponent(new URL(request.url || "/", `http://127.0.0.1:${port}`).pathname);
  const normalizedPath = normalize(requestPath).replace(/^(\.\.[/\\])+/, "");
  const filePath = join(root, normalizedPath === "/" ? "index.html" : normalizedPath);
  const finalPath = existsSync(filePath) ? filePath : join(root, "index.html");

  response.setHeader("Content-Type", contentTypes[extname(finalPath)] || "application/octet-stream");
  createReadStream(finalPath).pipe(response);
});

server.listen(port, "127.0.0.1");
