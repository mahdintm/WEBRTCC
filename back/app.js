const express = require("express");
const app = express();
const http = require("http");
const server = http.createServer(app);
const { Server } = require("socket.io");
const CodeGenerator = require("node-code-generator");
var generator = new CodeGenerator();
const io = new Server(server, {
  cors: {
    origin: ["http://localhost:3000", "http://127.0.0.1:3000", "http://192.168.87.36:3000/"],
  },
});
async function GenerateCode(length) {
  let pattern = "";
  for (let i = 0; i < length; i++) {
    pattern += "*";
  }
  return generator.generateCodes(pattern, 1, { alphanumericRegex: /\*(?!\+)/g });
}
io.on("connection", (socket) => {
  socket.on("GetRoomCode", async (data) => {
    console.log(data);
    io.to(data.id).emit("SendRoomCode", {
      code: await GenerateCode(5),
    });
  });
});
server.listen(3003, () => {
  console.log("listening on *:3003");
});
