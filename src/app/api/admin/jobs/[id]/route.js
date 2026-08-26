import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import JobPosting from "@/models/JobPosting";
import { jobPostingSchema } from "@/lib/validators";
import { requireAdminOrResponse } from "@/lib/api-guard";

export async function PUT(req, { params }) {
  const { response } = await requireAdminOrResponse();
  if (response) return response;

  const { id } = await params;
  const body = await req.json();
  const parsed = jobPostingSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message || "Invalid input" }, { status: 400 });
  }

  await connectDB();
  const duplicate = await JobPosting.findOne({ slug: parsed.data.slug, _id: { $ne: id } });
  if (duplicate) {
    return NextResponse.json({ error: "A job posting with this slug already exists" }, { status: 409 });
  }

  const doc = await JobPosting.findByIdAndUpdate(
    id,
    { ...parsed.data, applyDeadline: parsed.data.applyDeadline || null },
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
  await JobPosting.findByIdAndDelete(id);
  return NextResponse.json({ ok: true });
}
