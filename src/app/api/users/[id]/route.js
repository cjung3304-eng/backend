import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import db from "@/app/lib/db";

const SAFE_COLUMNS = `
  id,
  firstname,
  fullname,
  lastname,
  username,
  status,
  created_at,
  updated_at
`;

function parseUserId(rawId) {
  const userId = Number(rawId);
  return Number.isInteger(userId) && userId > 0 ? userId : null;
}

// GET: ดึงข้อมูลผู้ใช้ตาม id
export async function GET(_request, context) {
  try {
    const { id } = await context.params;
    const userId = parseUserId(id);

    if (!userId) {
      return NextResponse.json(
        { success: false, message: "รหัสผู้ใช้ไม่ถูกต้อง" },
        { status: 400 }
      );
    }

    const [rows] = await db.query(
      `SELECT ${SAFE_COLUMNS} FROM tbl_users WHERE id = ? LIMIT 1`,
      [userId]
    );

    if (rows.length === 0) {
      return NextResponse.json(
        { success: false, message: "ไม่พบข้อมูลผู้ใช้นี้" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: "ดึงข้อมูลผู้ใช้สำเร็จ",
        data: rows[0],
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("GET /api/users/[id] error:", error);
    return NextResponse.json(
      { success: false, message: "เกิดข้อผิดพลาดในการดึงข้อมูลผู้ใช้" },
      { status: 500 }
    );
  }
}

// PUT: แก้ไขข้อมูลผู้ใช้ตาม id
export async function PUT(request, context) {
  try {
    const { id } = await context.params;
    const userId = parseUserId(id);

    if (!userId) {
      return NextResponse.json(
        { success: false, message: "รหัสผู้ใช้ไม่ถูกต้อง" },
        { status: 400 }
      );
    }

    const body = await request.json();
    const firstname = body.firstname?.trim();
    const fullname = body.fullname?.trim();
    const lastname = body.lastname?.trim();
    const username = body.username?.trim();
    const status = body.status?.trim();
    const password = body.password;

    if (!firstname || !fullname || !lastname || !username || !status) {
      return NextResponse.json(
        { success: false, message: "กรุณากรอกข้อมูลให้ครบถ้วน" },
        { status: 400 }
      );
    }

    const [existingUser] = await db.query(
      "SELECT id FROM tbl_users WHERE id = ? LIMIT 1",
      [userId]
    );

    if (existingUser.length === 0) {
      return NextResponse.json(
        { success: false, message: "ไม่พบข้อมูลผู้ใช้นี้" },
        { status: 404 }
      );
    }

    // ถ้ามีการส่ง password ใหม่มาให้ hash ด้วย ถ้าไม่ส่งมาให้คงรหัสผ่านเดิมไว้
    if (password && password.length > 0) {
      const hashedPassword = await bcrypt.hash(password, 10);
      await db.query(
        `UPDATE tbl_users
         SET firstname = ?, fullname = ?, lastname = ?, username = ?, password = ?, status = ?
         WHERE id = ?`,
        [firstname, fullname, lastname, username, hashedPassword, status, userId]
      );
    } else {
      await db.query(
        `UPDATE tbl_users
         SET firstname = ?, fullname = ?, lastname = ?, username = ?, status = ?
         WHERE id = ?`,
        [firstname, fullname, lastname, username, status, userId]
      );
    }

    const [updatedRows] = await db.query(
      `SELECT ${SAFE_COLUMNS} FROM tbl_users WHERE id = ? LIMIT 1`,
      [userId]
    );

    return NextResponse.json(
      {
        success: true,
        message: "แก้ไขข้อมูลผู้ใช้สำเร็จ",
        data: updatedRows[0],
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("PUT /api/users/[id] error:", error);
    return NextResponse.json(
      { success: false, message: "เกิดข้อผิดพลาดในการแก้ไขข้อมูลผู้ใช้" },
      { status: 500 }
    );
  }
}

// DELETE: ลบข้อมูลผู้ใช้ตาม id
export async function DELETE(_request, context) {
  try {
    const { id } = await context.params;
    const userId = parseUserId(id);

    if (!userId) {
      return NextResponse.json(
        { success: false, message: "รหัสผู้ใช้ไม่ถูกต้อง" },
        { status: 400 }
      );
    }

    const [result] = await db.query(
      "DELETE FROM tbl_users WHERE id = ?",
      [userId]
    );

    if (result.affectedRows === 0) {
      return NextResponse.json(
        { success: false, message: "ไม่พบข้อมูลผู้ใช้นี้" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: "ลบข้อมูลผู้ใช้สำเร็จ",
        deletedId: userId,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("DELETE /api/users/[id] error:", error);
    return NextResponse.json(
      { success: false, message: "เกิดข้อผิดพลาดในการลบข้อมูลผู้ใช้" },
      { status: 500 }
    );
  }
}