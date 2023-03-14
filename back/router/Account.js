import express from "express";
import jwt from "jsonwebtoken";
import { sql } from "../database/mysql.js";
import device from "express-device";
import { Data_App } from "../database/datastore.js";
// app.use(device.capture());
export const AccountManager = express.Router();
AccountManager.use(device.capture());
const config = process.env;

AccountManager.post("/login", async (req, res) => {
  try {
    const { username, password, device } = req.body;
    if (!username || !password) return res.status(401).send({ status: false });
    const user_SQL = (await sql(`select * from Users where username="${username}"`))[0];
    if (!user_SQL || password != user_SQL.password || !user_SQL.IsEnable) return res.status(401).send({ status: false });
    await sql(`update Users set lastLogin="${Date.now()}" where id="${user_SQL.id}"`);
    const token = jwt.sign({ id: user_SQL.id }, config.TOKEN_KEY);
    Data_App.Log.add("Login", `IP:${req.ip} Desc:${device}`);
    res.cookie("jwt", token, {
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000,
    });
    res.status(200).send({ status: true, id: user_SQL.id });
  } catch (error) {
    console.log(error);
    res.status(401).send({ status: false, id: null });
  }
});
AccountManager.post("/logout", (req, res) => {
  try {
    res.cookie("jwt", "", { maxAge: 0 });
    res.status(200).send("You Are Logouted!");
  } catch (error) {
    return res.status(401).send({
      auth: false,
    });
  }
});

AccountManager.get("/GetStatus", async (req, res) => {
  try {
    const cookie = req.cookies["jwt"];
    const claims = jwt.verify(cookie, config.TOKEN_KEY);
    let { IsEnable } = (await sql(`SELECT IsEnable FROM Users WHERE id='${claims.id}'`))[0];
    if (!claims || !IsEnable) {
      return res.status(401).send({
        auth: false,
      });
    }
    await sql(`UPDATE Users SET lastOnline='${Date.now()}' WHERE id='${claims.id}'`);
    res.status(200).json({ auth: true, id: claims.id });
  } catch (error) {
    return res.status(401).send({
      auth: false,
    });
  }
});
