import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Candidate from "@/models/Candidate";
import { requireSuperAdminOrResponse } from "@/lib/api-guard";

export async function PUT(req, { params }) {
  const { response } = await requireSuperAdminOrResponse();
  if (response) return response;

  const { id } = await params;
  const body = await req.json();

  await connectDB();
  const doc = await Candidate.findByIdAndUpdate(
    id,
    { disabled: Boolean(body.disabled) },
    { new: true, projection: "-passwordHash -otp" }
  ).lean();
  if (!doc) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(doc);
}

export async function DELETE(_req, { params }) {
  const { response } = await requireSuperAdminOrResponse();
  if (response) return response;

  const { id } = await params;
  await connectDB();
  await Candidate.findByIdAndDelete(id);
  return NextResponse.json({ ok: true });
}
