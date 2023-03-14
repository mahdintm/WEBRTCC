import express from "express";
import jwt from "jsonwebtoken";
import { Data_App } from "../database/datastore.js";
import { sql } from "../database/mysql.js";
export const ApiService = express.Router();
const config = process.env;
ApiService.get("/GetOnlineChat", async (req, res) => {
  try {
    res.status(200).json({ time: await Data_App.Chats.getLastOnline(req.query.chatid, req.query.userid) });
  } catch (e) {
    console.log(e);
  }
});
ApiService.get("/GetNameChat", async (req, res) => {
  try {
    res.status(200).json({ name: await Data_App.Chats.GetNameChat(req.query.chatid, req.query.userid) });
  } catch (e) {
    console.log(e);
  }
});
