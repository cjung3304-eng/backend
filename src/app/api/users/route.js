// นำเข้า NextResponse จาก next/server เพื่อใช้จัดการและส่งค่า HTTP Response กลับไปยังไคลเอนต์
import { NextResponse } from "next/server";
import db from "../../lib/db";
//================================================================================
// GET Function (/src/app/api/users/route.js)
//================================================================================
/**
 * Route Handler สำหรับ HTTP Method: GET
 * ทำหน้าที่ดึงข้อมูลผู้ใช้ทั้งหมดจากตาราง tbl_users
 */
export async function GET() {
  try {
    // ดึงข้อมูลผู้ใช้จากฐานข้อมูลจริง
    const [rows] = await db.query('SELECT * FROM tbl_users');

    console.log({ success: true, message: "ดึงข้อมูลผู้ใช้สำเร็จ", total: rows.length, status: 200 });

    return NextResponse.json({
      success: true,
      message: "ดึงข้อมูลผู้ใช้สำเร็จ",
      total: rows.length,
      data: rows,
    }, { status: 200 });

  } catch (error) {
    console.error('Database query error:', error);
    return NextResponse.json(
      {
        success: false,
        message: "เกิดข้อผิดพลาดภายในเซิร์ฟเวอร์",
        error: error instanceof Error ? error.message : "Internal Server Error",
      },
      { status: 500 }
    );
  }
}

//================================================================================
// POST Function (/src/app/api/users/route.js)
//================================================================================
/**
 * Route Handler สำหรับ HTTP Method: POST
 * ทำหน้าที่รับข้อมูลเพื่อเพิ่มผู้ใช้ใหม่ลงในฐานข้อมูล
 */
export async function POST(request) {
  try {
    // รับข้อมูล JSON ที่ส่งมาจาก Client
    const body = await request.json();
    const { firstname, fullname, lastname, username, password, status } = body;

    // ตรวจสอบข้อมูลเบื้องต้น
    if (!username || !password) {
      return NextResponse.json(
        { success: false, message: "กรุณากรอก username และ password" },
        { status: 400 }
      );
    }

    // คำสั่ง SQL สำหรับเพิ่มข้อมูลลงตาราง tbl_users
    const sql = `
      INSERT INTO tbl_users (firstname, fullname, lastname, username, password, status) 
      VALUES (?, ?, ?, ?, ?, ?)
    `;
    
    const values = [firstname, fullname, lastname, username, password, status || 'active'];

    const [result] = await db.query(sql, values);

    return NextResponse.json(
      {
        success: true,
        message: "เพิ่มข้อมูลผู้ใช้สำเร็จ",
        insertId: result.insertId,
      },
      { status: 201 }
    );

  } catch (error) {
    console.error('Database insert error:', error);
    return NextResponse.json(
      {
        success: false,
        message: "เกิดข้อผิดพลาดภายในเซิร์ฟเวอร์",
        error: error instanceof Error ? error.message : "Internal Server Error",
      },
      { status: 500 }
    );
  }
}