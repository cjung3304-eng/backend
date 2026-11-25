import { NextResponse } from "next/server";
import db from "../../lib/db";

// ==========================================
// GET: ดึงข้อมูลผู้ใช้ทั้งหมด
// ==========================================
export async function GET() {
  try {
    const [rows] = await db.query(`
      SELECT
        id,
        firstname,
        fullname,
        lastname,
        username,
        status,
        created_at,
        updated_at
      FROM tbl_users
    `);

    console.log("ดึงข้อมูลผู้ใช้สำเร็จ");

    return NextResponse.json({
      success: true,
      message: "ดึงข้อมูลผู้ใช้สำเร็จ",
      total: rows.length,
      data: rows,
    }, { status: 200 });

  } catch (error) {
    console.error("GET Error:", error);

    return NextResponse.json({
      success: false,
      message: "เกิดข้อผิดพลาดในการดึงข้อมูล",
      error: error.message,
    }, { status: 500 });
  }
}

// ==========================================
// POST: เพิ่มข้อมูลผู้ใช้
// ==========================================
export async function POST(request) {
  try {
    const body = await request.json();

    const {
      firstname,
      fullname,
      lastname,
      username,
      password,
      status
    } = body;

    if (
      !firstname ||
      !fullname ||
      !lastname ||
      !username ||
      !password ||
      !status
    ) {
      return NextResponse.json({
        success: false,
        message: "กรุณากรอกข้อมูลให้ครบถ้วน"
      }, { status: 400 });
    }

    const [result] = await db.query(
      `INSERT INTO tbl_users
      (firstname, fullname, lastname, username, password, status)
      VALUES (?, ?, ?, ?, ?, ?)`,
      [firstname, fullname, lastname, username, password, status]
    );

    return NextResponse.json({
      success: true,
      message: "เพิ่มข้อมูลผู้ใช้สำเร็จ",
      insertId: result.insertId
    }, { status: 201 });

  } catch (error) {
    console.error("POST Error:", error);

    return NextResponse.json({
      success: false,
      message: "เกิดข้อผิดพลาดในการเพิ่มข้อมูล",
      error: error.message
    }, { status: 500 });
  }
}