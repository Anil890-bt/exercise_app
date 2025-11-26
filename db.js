import mysql from "mysql2/promise";
import dotenv from "dotenv";
dotenv.config();

export const db = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT || 3306,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  multipleStatements: true,
});

console.log("🌐 MySQL Pool Created");

(async () => {
  try {
    const [rows] = await db.query("SELECT NOW() AS currentTime");
    console.log("✅ DB Connected! Current Time:", rows[0].currentTime);
  } catch (err) {
    console.error("❌ DB Connection Error:", err.message);
  }
})();
