import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Application from "@/models/Application";
import { applicationStatusSchema } from "@/lib/validators";
import { requireAdminOrResponse } from "@/lib/api-guard";

export async function PUT(req, { params }) {
  const { response } = await requireAdminOrResponse();
  if (response) return response;

  const { id } = await params;
  const body = await req.json();
  const parsed = applicationStatusSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message || "Invalid input" }, { status: 400 });
  }

  await connectDB();
  const doc = await Application.findByIdAndUpdate(id, { status: parsed.data.status }, { new: true }).lean();
  if (!doc) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(doc);
}
