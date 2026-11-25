import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import db from "@/app/lib/db";

// ================================================================================
// GET Function (/src/app/api/users/route.js)
// ================================================================================
/**
 * Route Handler สำหรับ HTTP Method: GET
 * ทำหน้าที่ดึงข้อมูลผู้ใช้ทั้งหมดจากตาราง tbl_users
 */
export async function GET() {
  try {
    const [rows] = await db.query(
      "SELECT id, firstname, fullname, lastname, username, status FROM tbl_users"
    );

    console.log({
      success: true,
      message: "ดึงข้อมูลผู้ใช้สำเร็จ",
      total: rows.length,
      status: 200,
    });

    return NextResponse.json(
      {
        success: true,
        message: "ดึงข้อมูลผู้ใช้สำเร็จ",
        total: rows.length,
        data: rows,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Database query error:", error);
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

// ================================================================================
// POST Function (/src/app/api/users/route.js)
// ================================================================================
/**
 * Route Handler สำหรับ HTTP Method: POST
 * ทำหน้าที่รับข้อมูลเพื่อเพิ่มผู้ใช้ใหม่ลงในฐานข้อมูล
 */
export async function POST(request) {
  try {
    const body = await request.json();
    const { firstname, fullname, lastname, username, password, status } = body;

    if (!username || !password) {
      return NextResponse.json(
        { success: false, message: "กรุณากรอก username และ password" },
        { status: 400 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const sql = `
      INSERT INTO tbl_users (firstname, fullname, lastname, username, password, status)
      VALUES (?, ?, ?, ?, ?, ?)
    `;

    const values = [
      firstname ?? null,
      fullname ?? null,
      lastname ?? null,
      username,
      hashedPassword,
      status || "active",
    ];

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
    console.error("Database insert error:", error);
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