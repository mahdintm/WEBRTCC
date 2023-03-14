import { createPool } from "mysql2";
import dotenv from "dotenv";
dotenv.config();
const pool_Main = createPool({
  host: process.env.Host_MYSQL,
  user: process.env.Username_MYSQL,
  password: process.env.Password_MYSQL,
  database: process.env.Database_MYSQL_Main,
  port: process.env.Port_MYSQL,
});

pool_Main.on("connected", () => {
  console.log("Connection");
});
export async function sql(sql_command, ...args) {
  try {
    args = [...args];
    const [rows_Main, fields_Main] = await pool_Main.promise().query(sql_command, args);
    return rows_Main;
  } catch (error) {
    console.log(error);
  }
}
