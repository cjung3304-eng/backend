// นำเข้าไลบรารี mysql2 เวอร์ชัน Promise เพื่อใช้งานร่วมกับ async/await ได้
import mysql from 'mysql2/promise';

// สร้างอ็อบเจกต์สำหรับเก็บค่าตั้งค่าในการเชื่อมต่อฐานข้อมูล
const poolConfig = {
  host: 'localhost',
  port: 3306,
  user: 'root',
  password: '', // ใส่รหัสผ่านของคุณ (ถ้าไม่มีปล่อยว่างไว้)
  database: 'db_shop', // ชื่อฐานข้อมูลของคุณ
  waitForConnections: true,
  connectionLimit: 10,
};

const globalForMySQL = globalThis;
const db = globalForMySQL.mysqlPool || mysql.createPool(poolConfig);

if (process.env.NODE_ENV !== 'production') {
  globalForMySQL.mysqlPool = db;
}

// ส่งออกตัวแปร db เพื่อนำไป import และสั่ง Query ในไฟล์อื่นได้
export default db;