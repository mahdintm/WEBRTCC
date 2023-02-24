const express = require("express");
const app = express();
const http = require("http");
const server = http.createServer(app);
const { Server } = require("socket.io");
const CodeGenerator = require("node-code-generator");
var generator = new CodeGenerator();
const io = new Server(server, {
  cors: {
    origin: ["http://localhost:3000", "http://127.0.0.1:3000", "http://192.168.90.150:3000", "https://phpmyadmin.irangame.ir"],
  },
});
let rooms = [{ roomID: undefined, Streamer: undefined, ShareScreen: false, users: [] }];
async function GenerateCode(length) {
  let pattern = "";
  for (let i = 0; i < length; i++) {
    pattern += "*";
  }
  return generator.generateCodes(pattern, 1, { alphanumericRegex: /\*(?!\+)/g });
}
io.on("connection", (socket) => {
  socket.on("disconnect", async (reason, a, b) => {
    for await (const [index, element] of rooms.entries()) {
      var index_ = rooms[index]["users"].indexOf(socket.id);
      if (index_ != -1) rooms[index]["users"].splice(index_, 1);
      if (element.Streamer == socket.id) {
        for await (const iterator of element.users) {
          io.to(iterator).emit("redirect", "/");
        }
        if (index_ != -1) rooms.splice(index, 1);
      }
    }
  });
  socket.on("enableShareScreen", async () => {
    for await (const [index, element] of rooms.entries()) {
      if (element.Streamer == socket.id) {
        rooms[index].ShareScreen = true;
        element.users.forEach((element___) => {
          io.to(element.Streamer).emit("ConnectTOScreen", element___);
        });
      }
    }
  });
  socket.on("disableShareScreen", async () => {
    for await (const [index, element] of rooms.entries()) {
      if (element.Streamer == socket.id) {
        rooms[index].ShareScreen = false;
        element.users.forEach((element___) => {
          io.to(element___).emit("disableUserShareScreen", { RoomID: element.roomID });
        });
      }
    }
  });
  socket.on("deleteRoom", async () => {
    io.to(socket.id).emit("redirect_", "/");
    for await (const [index, element] of rooms.entries()) {
      if (element.Streamer == socket.id) {
        element.users.forEach((element___) => {
          io.to(element___).emit("redirect", "/");
        });
        var index_ = rooms.indexOf(element);

        if (index_ != -1) rooms.splice(index_, 1);
      }
    }
  });
  socket.on("CreateRoom", async () => {
    let roomid = await GenerateCode(5);
    io.to(socket.id).emit("TakeRoomId", roomid[0]);
    rooms.push({ roomID: roomid[0], Streamer: socket.id, ShareScreen: false, users: [] });
  });
  socket.on("call-user", async (data) => {
    for await (const [index, element] of rooms.entries()) {
      if (element.Streamer == socket.id) {
        io.to(data.to).emit("call-made", {
          offer: data.offer,
          room: element.roomID,
          socket: socket.id,
        });
      }
    }
  });
  socket.on("screen-call-user", async (data) => {
    for await (const [index, element] of rooms.entries()) {
      if (element.Streamer == socket.id) {
        io.to(data.to).emit("screen-call-made", {
          offer: data.offer,
          room: element.roomID,
          socket: socket.id,
        });
      }
    }
  });
  socket.on("make-answer", (data) => {
    io.to(data.to).emit("answer-made", {
      id: socket.id,
      answer: data.answer,
    });
  });
  socket.on("screen-make-answer", (data) => {
    io.to(data.to).emit("screen-answer-made", {
      id: socket.id,
      answer: data.answer,
    });
  });
  socket.on("validation_room", async (roomid) => {
    for await (const [index, element] of rooms.entries()) {
      if (element.roomID === roomid) {
        if (element.users < 0) {
          console.log("add shod1");
          rooms[index]["users"].push(socket.id);
        } else {
          var index_ = element.users.indexOf(socket.id);
          if (index_ != -1) {
            return io.to(socket.id).emit("errorEnterRoom");
          } else {
            console.log("add");
            rooms[index]["users"].push(socket.id);
            console.log(element.Streamer);
            // io.to(socket.id).emit("SucsessValidationRoom");
            io.to(element.Streamer).emit("newUser", socket.id);
            if (element.ShareScreen) {
              io.to(element.Streamer).emit("ConnectTOScreen", socket.id);
            }
          }
        }
      } else if (rooms.length == index + 1) {
        return io.to(socket.id).emit("errorValidationRoom");
      }
    }
  });
});
server.listen(3002, () => {
  console.log("listening on *:3002");
});
