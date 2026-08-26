import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { connectDB } from "@/lib/db";
import Admin from "@/models/Admin";
import { changePasswordSchema } from "@/lib/validators";
import { requireAdminOrResponse } from "@/lib/api-guard";

export async function PUT(req) {
  const { session, response } = await requireAdminOrResponse();
  if (response) return response;

  const body = await req.json();
  const parsed = changePasswordSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message || "Invalid input" }, { status: 400 });
  }

  await connectDB();
  const admin = await Admin.findById(session.user.id);
  if (!admin) return NextResponse.json({ error: "Admin not found" }, { status: 404 });

  const valid = await bcrypt.compare(parsed.data.currentPassword, admin.passwordHash);
  if (!valid) return NextResponse.json({ error: "Current password is incorrect" }, { status: 400 });

  admin.passwordHash = await bcrypt.hash(parsed.data.newPassword, 10);
  await admin.save();

  return NextResponse.json({ ok: true });
}
