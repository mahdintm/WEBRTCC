import { sql } from "./mysql.js";
import dotenv from "dotenv";
dotenv.config();
export class Data_App {
  static async loadAll() {
    const [userRows, chatsRows, pmsRows] = await Promise.all([sql("SELECT * FROM Users"), sql("SELECT * FROM chats"), sql("SELECT * FROM pms")]);
    for await (const [index, chat] of chatsRows.entries()) {
      chatsRows[index].Members = JSON.parse(chat.Members);
      chatsRows[index].admins_Group = JSON.parse(chat.admins_Group);
    }
    for await (const [index, user] of userRows.entries()) {
      userRows[index].name = await JSON.parse(user.name);
    }
    Data_App.users = userRows;
    Data_App.chats = chatsRows;
    Data_App.pms = pmsRows;
  }
  static Log = {
    async add(EventName, EventDescription) {
      try {
        await sql(`INSERT INTO Logs( EventName, Description, TimeStamp) VALUES ('${EventName}','${EventDescription}','${Date.now()}')`);
      } catch (error) {
        console.log(error);
      }
    },
  };
  static Chats = {
    async getLastOnline(GroupId, UserID) {
      const ChatRow = Data_App.chats.find((chat) => chat.id === parseInt(GroupId) && chat.Members.find((member) => member == parseInt(UserID)));
      const otherUserId = await ChatRow.Members.find((member) => member !== parseInt(UserID));
      return await Data_App.Users.getLastOnline(otherUserId);
    },
    async GetNameChat(GroupId, UserID) {
      const ChatRow = Data_App.chats.find((chat) => chat.id === parseInt(GroupId) && chat.Members.find((member) => member == parseInt(UserID)));
      switch (ChatRow.is_Group) {
        case 0:
          const otherUserId = await ChatRow.Members.find((member) => member !== parseInt(UserID));
          return await Data_App.Users.getName(otherUserId);
        case 1:
          return await ChatRow.name_Group;
      }
    },
    async getChatList(userId) {
      const userData = [];
      const userChats = Data_App.chats.filter((chat) => chat.Members.some((member) => member === userId));
      for (const chat of userChats) {
        if (chat.is_Group) {
          const image = await Data_App.Groups.getProfileImage(chat.id);
          userData.push({
            id: chat.id,
            isGroup: true,
            image,
            name: chat.name_Group,
          });
        } else {
          const otherUserId = chat.Members.find((member) => member !== userId);
          const name = await Data_App.Users.getName(otherUserId);
          const image = await Data_App.Users.getProfileImage(otherUserId);
          userData.push({
            id: chat.id,
            isGroup: false,
            image,
            name,
          });
        }
      }
      return userData;
    },
  };
  static Pms = {
    async getAllPmsChat(userid, chatid) {
      const userChats = await Data_App.chats.filter((chat) => chat.Members.some((member) => member === userid));
      if (userChats != "") {
        const pmsChat = await Data_App.pms.filter((pm) => pm.chat_id == chatid);
        await pmsChat.sort((a, b) => a.timestamp - b.timestamp);
        for await (const [index, element] of pmsChat.entries()) {
          pmsChat[index].fromName = await Data_App.Users.getName(element.from);
        }
        return await pmsChat;
      } else {
        return false;
      }
    },
  };
  static Groups = {
    async getProfileImage(GroupId) {
      const GroupRow = Data_App.chats.find((chat) => chat.id === GroupId);
      let img = GroupRow.image !== null ? `${process.env.ServerUrl}/upload/${GroupRow.image}` : `${process.env.ServerUrl}/private/profile.png`;
      return img;
    },
  };
  static Position = {
    async Add(userid, position, timestamp) {
      await sql(`INSERT INTO GPS( User, latitude, longitude, timestamp) VALUES ("${userid}","${position.latitude}","${position.longitude}","${timestamp}") `);
    },
  };
  static Users = {
    async getProfileImage(userId) {
      try {
        const userRow = Data_App.users.find((user) => user.id === userId);
        let img = userRow.image !== null ? `${process.env.ServerUrl}/upload/${userRow.image}` : `${process.env.ServerUrl}/private/profile.png`;
        return img;
      } catch (error) {
        console.log(error);
        return `${process.env.ServerUrl}/private/profile.png`;
      }
    },
    async getName(userId) {
      try {
        const user = await Data_App.users.find((user) => user.id === parseInt(userId));
        let name = user.name;
        return name.firstName || name.lastName !== null ? (name.firstName && name.lastName !== null ? `${name.firstName} ${name.lastName}` : name.firstName !== null ? name.firstName : name.lastName) : await Data_App.Users.getUserName(user.id);
      } catch (error) {
        console.log(error);
        return "نام یافت نشد";
      }
    },
    async getUserName(userId) {
      try {
        const userRow = Data_App.users.find((user) => user.id === userId);
        return userRow.username;
      } catch (error) {
        console.log(error);
        return "null";
      }
    },
    async getLastOnline(userId) {
      try {
        const userRow = Data_App.users.find((user) => user.id === userId);
        return userRow.lastOnline;
      } catch (error) {
        console.log(error);
        return 0;
      }
    },
    async GetSocketID(userId) {
      try {
        const userRow = Data_App.users.find((user) => user.id === userId);
        return userRow.sokcetID;
      } catch (error) {
        console.log(error);
      }
    },
    async SetSocketID(userId, socketid) {
      try {
        for (const [index, element] of Data_App.users.entries()) {
          if (element.id === userId) {
            return (Data_App.users[index]["sokcetID"] = socketid);
          }
        }
      } catch (error) {
        console.log(error);
      }
    },
    async GetUserID(sokcetID) {
      try {
        const userRow = await Data_App.users.find((user) => user.sokcetID === sokcetID);
        if (!userRow) {
          return null;
        }
        return userRow.id;
      } catch (error) {
        console.log(error);
      }
    },
  };
}

Data_App.users = null;
Data_App.chats = null;
Data_App.pms = null;
