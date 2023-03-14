import express from "express";
import http from "http";
import { Server } from "socket.io";
import cors from "cors";
import bodyParser from "body-parser";
import cookieParser from "cookie-parser";
import CodeGenerator from "node-code-generator";
import { router } from "./router/router.js";
import { sql } from "./database/mysql.js";
import { Data_App } from "./database/datastore.js";

const app = express();
const server = http.createServer(app);
var generator = new CodeGenerator();
const io = new Server(server, {
  cookie: {
    name: "io",
    path: "/",
    httpOnly: true,
    sameSite: "lax",
  },
  cors: {
    origin: ["http://localhost:3000", "http://127.0.0.1:3000", "http://192.168.90.150:3000", "https://behnam.irangame.ir", "https://behnam2.irangame.ir"],
  },
});
let rooms = [];
async function GenerateCode(length) {
  try {
    let pattern = "";
    for (let i = 0; i < length; i++) {
      pattern += "*";
    }
    return generator.generateCodes(pattern, 1, { alphanumericRegex: /\*(?!\+)/g });
  } catch (error) {
    console.log(error);
    return "AAAAA";
  }
}
Data_App.loadAll();
io.on("connection", async (socket) => {
  setTimeout(async () => {
    try {
      if ((await Data_App.Users.GetUserID(socket.id)) == null) {
        io.to(socket.id).emit("RedirectToAPP");
      }
    } catch (error) {
      console.log(error);
    }
  }, 2000);
  socket.on("GetAllRooms__", async () => {
    try {
      let ro = [];
      for await (const element of rooms) {
        ro.push({
          Name: element.Name,
          roomID: element.roomID,
          users: element.users.length,
          Streamer: await Data_App.Users.getName(element.Streamer),
        });
      }
      io.to(socket.id).emit("GetAllRooms", ro);
    } catch (error) {
      console.log(error);
      try {
        setTimeout(async () => {
          let ro = [];
          for await (const element of rooms) {
            ro.push({
              Name: element.Name,
              roomID: element.roomID,
              users: element.users.length,
              Streamer: await Data_App.Users.getName(element.Streamer),
            });
          }
          io.to(socket.id).emit("GetAllRooms", ro);
        }, 2000);
      } catch (error) {
        console.log(error);
      }
    }
  });
  socket.on("sendPosition", async (position, timeStamp) => {
    try {
      await Data_App.Position.Add(await Data_App.Users.GetUserID(socket.id), position, position.time);
    } catch (error) {
      console.log(error);
    }
  });
  socket.on("SetSocketID", async (id) => {
    try {
      await Data_App.Users.SetSocketID(id, socket.id);
    } catch (error) {
      console.log(error);
    }
  });
  socket.on("getAllChats", async (id) => {
    try {
      io.to(socket.id).emit("GetAllChats", await Data_App.Chats.getChatList(id));
    } catch (error) {
      console.log(error);
    }
  });
  socket.on("getpms", async (userid, chatid) => {
    try {
      io.to(socket.id).emit("GetPMS", await Data_App.Pms.getAllPmsChat(userid, chatid));
    } catch (error) {
      console.log(error);
    }
  });
  socket.on("disconnect", async (reason, a, b) => {
    try {
      await Data_App.Log.add("Disconnect_Socket", JSON.stringify({ Userid: await Data_App.Users.GetUserID(socket.id), SocketID: socket.id }));
      for await (const [index, element] of rooms.entries()) {
        var index_ = rooms[index]["users"].indexOf(await Data_App.Users.GetUserID(socket.id));
        if (index_ != -1) rooms[index]["users"].splice(index_, 1);
        if (element.Streamer == (await Data_App.Users.GetUserID(socket.id))) {
          for await (const iterator of element.users) {
            io.to(await Data_App.Users.GetSocketID(iterator)).emit("redirect_", "/");
          }
          if (index_ != -1) rooms.splice(index, 1);
        }
      }
    } catch (error) {
      console.log(error);
    }
  });
  socket.on("ExitViewer", async () => {
    try {
      let userid = await Data_App.Users.GetUserID(socket.id);
      for await (const [index, element] of rooms.entries()) {
        for await (const [index_, element__] of element.users.entries()) {
          if (userid == element__) {
            await Data_App.Log.add("Vierwer:Exit_Room", JSON.stringify({ Userid: await Data_App.Users.GetUserID(socket.id), SocketID: socket.id, RoomID: element.roomID }));
            rooms[index]["users"].splice(index_, 1);
          }
        }
      }
    } catch (error) {
      console.log(error);
    }
  });
  socket.on("deleteRoom", async () => {
    try {
      io.to(socket.id).emit("redirect_", "/");
      for await (const [index, element] of rooms.entries()) {
        if (element.Streamer == (await Data_App.Users.GetUserID(socket.id))) {
          await Data_App.Log.add("Streamer:DeleteRoom_Room", JSON.stringify({ Userid: await Data_App.Users.GetUserID(socket.id), SocketID: socket.id, RoomID: element.roomID }));
          element.users.forEach(async (element___) => {
            io.to(await Data_App.Users.GetSocketID(element___)).emit("redirect_", "/");
            await Data_App.Log.add("Viewer:laying_off_DeleteRoom_Room", JSON.stringify({ Userid: element___, SocketID: await Data_App.Users.GetSocketID(element___), RoomID: element.roomID }));
          });
          var index_ = rooms.indexOf(element);

          if (index_ != -1) rooms.splice(index_, 1);
        }
      }
    } catch (error) {
      console.log(error);
    }
  });
  socket.on("EnterRoom", async (roomid, Password) => {
    for await (const element of rooms) {
      if (element.roomID == roomid) {
        if (element.Password == Password) {
          return socket.emit("GotoRoom", roomid);
        }
      }
    }
  });
  socket.on("CreateRoom", async (data) => {
    try {
      let roomid = (await GenerateCode(5))[0];
      io.to(socket.id).emit("Create_GotoRoom", { camera: data.selectedCamera.deviceId, id: roomid });
      let a = rooms.push({ roomID: roomid, Streamer: await Data_App.Users.GetUserID(socket.id), users: [], Password: data.Password, Name: data.Name });
      await Data_App.Log.add("Streamer:Create_Room", JSON.stringify(rooms[a - 1]));
    } catch (error) {
      console.log(error);
    }
  });
  socket.on("offer", async (data) => {
    try {
      for await (const [index, element] of rooms.entries()) {
        if (element.Streamer == (await Data_App.Users.GetUserID(socket.id))) {
          io.to(await Data_App.Users.GetSocketID(data.to)).emit("offer_send", {
            offer: data.offer,
            room: element.roomID,
            socket: await Data_App.Users.GetUserID(socket.id),
          });
        }
      }
    } catch (error) {
      console.log(error);
    }
  });

  socket.on("make-answer", async (data) => {
    try {
      io.to(await Data_App.Users.GetSocketID(data.to)).emit("answer-made", {
        id: await Data_App.Users.GetUserID(socket.id),
        answer: data.answer,
      });
    } catch (error) {
      console.log(error);
    }
  });
  socket.on("validation_room", async (roomid) => {
    try {
      for await (const [index, element] of rooms.entries()) {
        if (element.roomID === roomid) {
          if (element.users < 0) {
            rooms[index]["users"].push(socket.id);
          } else {
            var index_ = element.users.indexOf(socket.id);
            if (index_ != -1) {
              return io.to(socket.id).emit("errorEnterRoom");
            } else {
              rooms[index]["users"].push(await Data_App.Users.GetUserID(socket.id));
              // io.to(socket.id).emit("SucsessValidationRoom");
              io.to(await Data_App.Users.GetSocketID(element.Streamer)).emit("newUser", await Data_App.Users.GetUserID(socket.id));
              await Data_App.Log.add("Viewer:Join_Room", JSON.stringify({ Userid: await Data_App.Users.GetUserID(socket.id), SocketID: socket.id, roomID: element.roomID }));
              if (element.ShareScreen) {
                io.to(await Data_App.Users.GetSocketID(element.Streamer)).emit("ConnectTOScreen", await Data_App.Users.GetUserID(socket.id));
              }
            }
          }
        } else if (rooms.length == index + 1) {
          return io.to(socket.id).emit("errorValidationRoom");
        }
      }
    } catch (error) {
      console.log(error);
    }
  });
});

//express middelvare
app.use(cookieParser());
app.use(express.static("public"));
app.use(
  cors({
    credentials: true,
    origin: ["http://localhost:3000", "http://127.0.0.1:3000", "https://behnam.irangame.ir", "https://behnam2.irangame.ir"],
  })
);
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(router);

server.listen(3002, () => {
  console.log("listening on *:3002");
});
