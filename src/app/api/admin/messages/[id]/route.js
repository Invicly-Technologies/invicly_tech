import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import ContactSubmission from "@/models/ContactSubmission";
import { requireAdminOrResponse } from "@/lib/api-guard";

export async function PUT(req, { params }) {
  const { response } = await requireAdminOrResponse();
  if (response) return response;

  const { id } = await params;
  const body = await req.json();

  await connectDB();
  const doc = await ContactSubmission.findByIdAndUpdate(
    id,
    { read: Boolean(body.read) },
    { new: true }
  ).lean();
  if (!doc) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(doc);
}

export async function DELETE(_req, { params }) {
  const { response } = await requireAdminOrResponse();
  if (response) return response;

  const { id } = await params;
  await connectDB();
  await ContactSubmission.findByIdAndDelete(id);
  return NextResponse.json({ ok: true });
}
