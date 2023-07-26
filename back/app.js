import express from "express";
// import { createServer } from "https";
import { createServer } from "http";
import { Server } from "socket.io";
import cors from "cors";
import bodyParser from "body-parser";
import cookieParser from "cookie-parser";
import CodeGenerator from "node-code-generator";
import { router } from "./router/router.js";
import { Data_App } from "./database/datastore.js";
import fs from "fs";
const app = express();
const server = createServer(
  // {
  //   key: fs.readFileSync("./ssl/privkey.pem"),
  //   cert: fs.readFileSync("./ssl/cert.pem"),
  // },
  app,
);
var generator = new CodeGenerator();
const io = new Server(server, {
  cookie: {
    name: "io",
    path: "/",
    httpOnly: true,
    sameSite: "lax",
  },
  cors: {
    // origin: ["https://172.17.160.101", "https://172.17.160.101:3002"],
    origin: ["http://localhost:3000", "http://localhost:3002", "http://192.168.90.221:3002", "http://192.168.90.221:3000"],
  },
});
let rooms = [];
let rooms_mic = [];

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

  socket.on("getNameRoom", (roomid) => {
    rooms.forEach((element) => {
      if (element.roomID == roomid) {
        console.log(1);
        io.to(socket.id).emit("SetNameRoom", element.Name);
      }
    });
  });
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
  socket.on("GetAllRooms__Mic", async () => {
    try {
      let ro = [];
      for await (const element of rooms_mic) {
        ro.push({
          Name: element.Name,
          roomID: element.roomID,
          users: element.users.length,
          Streamer: await Data_App.Users.getName(element.Streamer),
        });
      }
      io.to(socket.id).emit("GetAllRooms_Mic", ro);
    } catch (error) {
      console.log(error);
      try {
        setTimeout(async () => {
          let ro = [];
          for await (const element of rooms_mic) {
            ro.push({
              Name: element.Name,
              roomID: element.roomID,
              users: element.users.length,
              Streamer: await Data_App.Users.getName(element.Streamer),
            });
          }
          io.to(socket.id).emit("GetAllRooms_Mic", ro);
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
          rooms.splice(index, 1);
        }
      }
      for await (const [index, element] of rooms_mic.entries()) {
        var index_ = rooms_mic[index]["users"].indexOf(await Data_App.Users.GetUserID(socket.id));
        if (index_ != -1) rooms_mic[index]["users"].splice(index_, 1);
        if (element.Streamer == (await Data_App.Users.GetUserID(socket.id))) {
          for await (const iterator of element.users) {
            io.to(await Data_App.Users.GetSocketID(iterator)).emit("redirect_", "/");
          }
          rooms_mic.splice(index, 1);
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
            socket.broadcast.emit("GetAllRooms", ro);
          }, 2000);
        }
      }
    } catch (error) {
      console.log(error);
    }
  });
  socket.on("deleteRoom_Mic", async () => {
    try {
      io.to(socket.id).emit("redirect_", "/");
      for await (const [index, element] of rooms_mic.entries()) {
        if (element.Streamer == (await Data_App.Users.GetUserID(socket.id))) {
          await Data_App.Log.add("Streamer:DeleteRoom_Room", JSON.stringify({ Userid: await Data_App.Users.GetUserID(socket.id), SocketID: socket.id, RoomID: element.roomID }));
          element.users.forEach(async (element___) => {
            io.to(await Data_App.Users.GetSocketID(element___)).emit("redirect_", "/");
            await Data_App.Log.add("Viewer:laying_off_DeleteRoom_Room", JSON.stringify({ Userid: element___, SocketID: await Data_App.Users.GetSocketID(element___), RoomID: element.roomID }));
          });
          var index_ = rooms_mic.indexOf(element);

          if (index_ != -1) rooms_mic.splice(index_, 1);
          setTimeout(async () => {
            let ro = [];
            for await (const element of rooms_mic) {
              ro.push({
                Name: element.Name,
                roomID: element.roomID,
                users: element.users.length,
                Streamer: await Data_App.Users.getName(element.Streamer),
              });
            }
            socket.broadcast.emit("GetAllRooms_Mic", ro);
          }, 2000);
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
  socket.on("EnterRoom_Mic", async (roomid, Password, mic) => {
    for await (const element of rooms_mic) {
      if (element.roomID == roomid) {
        if (element.Password == Password) {
          return socket.emit("GotoRoom_Bisim", { id: roomid, mic: mic });
        }
      }
    }
  });
  socket.on("CreateRoom_Bisim", async (data) => {
    try {
      console.log(11);
      let roomid = (await GenerateCode(5))[0];
      io.to(socket.id).emit("Create_GotoRoom_Bisim", { mic: data.selectedMic.deviceId, id: roomid });
      let a = rooms_mic.push({ roomID: roomid, Streamer: await Data_App.Users.GetUserID(socket.id), users: [], Password: data.Password, Name: data.Name });
      await Data_App.Log.add("Streamer:Create_Room_Bisim", JSON.stringify(rooms_mic[a - 1]));
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
        socket.broadcast.emit("GetAllRooms_Mic", ro);
      }, 2000);
    } catch (error) {
      console.log(error);
    }
  });
  socket.on("CreateRoom", async (data) => {
    try {
      let roomid = (await GenerateCode(5))[0];
      io.to(socket.id).emit("Create_GotoRoom", { camera: data.selectedCamera.deviceId, id: roomid });
      let a = rooms.push({ roomID: roomid, Streamer: await Data_App.Users.GetUserID(socket.id), users: [], Password: data.Password, Name: data.Name });
      await Data_App.Log.add("Streamer:Create_Room", JSON.stringify(rooms[a - 1]));
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
        socket.broadcast.emit("GetAllRooms", ro);
      }, 2000);
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
  socket.on("offer_mic", async (data) => {
    try {
      for await (const [index, element] of rooms_mic.entries()) {
        if (element.Streamer == (await Data_App.Users.GetUserID(socket.id))) {
          io.to(await Data_App.Users.GetSocketID(data.to)).emit("offer_send_mic", {
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
  socket.on("make-answer_mic", async (data) => {
    try {
      io.to(await Data_App.Users.GetSocketID(data.to)).emit("answer-made_mic", {
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
  socket.on("validation_room_Mic", async (roomid) => {
    try {
      for await (const [index, element] of rooms_mic.entries()) {
        if (element.roomID === roomid) {
          if (element.users < 0) {
            rooms_mic[index]["users"].push(socket.id);
          } else {
            var index_ = element.users.indexOf(socket.id);
            if (index_ != -1) {
              return io.to(socket.id).emit("errorEnterRoom");
            } else {
              rooms_mic[index]["users"].push(await Data_App.Users.GetUserID(socket.id));
              io.to(await Data_App.Users.GetSocketID(element.Streamer)).emit("newUser", await Data_App.Users.GetUserID(socket.id));

              await Data_App.Log.add("Viewer:Join_Room", JSON.stringify({ Userid: await Data_App.Users.GetUserID(socket.id), SocketID: socket.id, roomID: element.roomID }));
              if (element.ShareScreen) {
                io.to(await Data_App.Users.GetSocketID(element.Streamer)).emit("ConnectTOScreen", await Data_App.Users.GetUserID(socket.id));
              }
            }
          }
        } else if (rooms_mic.length == index + 1) {
          return io.to(socket.id).emit("errorValidationRoom");
        }
      }
    } catch (error) {
      console.log(error);
    }
  });
  socket.on("_GetAllUsers", async () => {
    try {
      io.to(socket.id).emit("GetAllUsers", await Data_App.Users.GetAll());
    } catch (error) {
      console.log(error);
    }
  });
  socket.on("_GetAllVideoRooms", async () => {
    try {
      io.to(socket.id).emit("GetAllVideoRooms", rooms);
    } catch (error) {
      console.log(error);
    }
  });
  socket.on("_GetAllBisimRooms", async () => {
    try {
      io.to(socket.id).emit("GetAllBisimRooms", rooms_mic);
    } catch (error) {
      console.log(error);
    }
  });
  socket.on("_getStateAdmin", async (userid) => {
    try {
      io.to(socket.id).emit("getStateAdmin", await Data_App.Users.isAdmin(userid));
    } catch (error) {
      console.log(error);
    }
  });
  socket.on("CreateUser", async (data) => {
    try {
      await Data_App.Users.create(data);
      io.to(socket.id).emit("GetAllUsers", await Data_App.Users.GetAll());
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
    // origin: ["https://172.17.160.101", "https://172.17.160.101:3002"],
    origin: ["http://localhost:3000", "http://localhost:3002", "http://192.168.90.221:3002", "http://192.168.90.221:3000"],
  }),
);
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(router);

server.listen(3002, () => {
  console.log("listening on *:3002");
});
