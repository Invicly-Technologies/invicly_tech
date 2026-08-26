import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Admin from "@/models/Admin";
import { requireSuperAdminOrResponse } from "@/lib/api-guard";

export async function PUT(req, { params }) {
  const { response } = await requireSuperAdminOrResponse();
  if (response) return response;

  const { id } = await params;
  const body = await req.json();

  await connectDB();
  const target = await Admin.findById(id);
  if (!target) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (target.isSuperAdmin) {
    return NextResponse.json({ error: "The default super admin account can't be disabled." }, { status: 403 });
  }

  target.disabled = Boolean(body.disabled);
  await target.save();

  return NextResponse.json({
    _id: target._id,
    name: target.name,
    email: target.email,
    isSuperAdmin: target.isSuperAdmin,
    disabled: target.disabled,
  });
}

export async function DELETE(_req, { params }) {
  const { response } = await requireSuperAdminOrResponse();
  if (response) return response;

  const { id } = await params;
  await connectDB();
  const target = await Admin.findById(id);
  if (!target) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (target.isSuperAdmin) {
    return NextResponse.json({ error: "The default super admin account can't be deleted." }, { status: 403 });
  }

  await Admin.findByIdAndDelete(id);
  return NextResponse.json({ ok: true });
}
