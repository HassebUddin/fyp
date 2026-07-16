const http = require("http");
const { Server } = require("socket.io");

const config = require("./config");
const { initDb } = require("./db");
const createApp = require("./app");
const registerSocketHandlers = require("./sockets");

initDb(config);

const httpServer = http.createServer();
const io = new Server(httpServer, { cors: { origin: "*" } });

const app = createApp(config, io);
httpServer.on("request", app);

registerSocketHandlers(io, config);

httpServer.listen(config.PORT, "0.0.0.0", () => {
  console.log(`AdShield AI backend (Node.js/SQLite) listening on port ${config.PORT}`);
  console.log(`Debug mode: ${config.DEBUG}`);
});
