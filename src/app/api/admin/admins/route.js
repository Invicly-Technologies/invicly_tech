import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { connectDB } from "@/lib/db";
import Admin from "@/models/Admin";
import { createAdminSchema } from "@/lib/validators";
import { requireSuperAdminOrResponse } from "@/lib/api-guard";

export async function GET() {
  const { response } = await requireSuperAdminOrResponse();
  if (response) return response;

  await connectDB();
  const docs = await Admin.find({}, "-passwordHash").sort({ createdAt: 1 }).lean();
  return NextResponse.json(docs);
}

export async function POST(req) {
  const { response } = await requireSuperAdminOrResponse();
  if (response) return response;

  const body = await req.json();
  const parsed = createAdminSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message || "Invalid input" }, { status: 400 });
  }

  await connectDB();
  const email = parsed.data.email.toLowerCase().trim();
  const existing = await Admin.findOne({ email });
  if (existing) {
    return NextResponse.json({ error: "An admin with this email already exists" }, { status: 409 });
  }

  const passwordHash = await bcrypt.hash(parsed.data.password, 10);
  const admin = await Admin.create({ name: parsed.data.name, email, passwordHash });

  return NextResponse.json(
    { _id: admin._id, name: admin.name, email: admin.email, isSuperAdmin: admin.isSuperAdmin, disabled: admin.disabled },
    { status: 201 }
  );
}
