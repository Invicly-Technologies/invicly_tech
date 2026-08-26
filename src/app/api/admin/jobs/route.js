import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import JobPosting from "@/models/JobPosting";
import { jobPostingSchema } from "@/lib/validators";
import { requireAdminOrResponse } from "@/lib/api-guard";

export async function GET() {
  const { response } = await requireAdminOrResponse();
  if (response) return response;

  await connectDB();
  const docs = await JobPosting.find({}).sort({ order: 1, createdAt: -1 }).lean();
  return NextResponse.json(docs);
}

export async function POST(req) {
  const { response } = await requireAdminOrResponse();
  if (response) return response;

  const body = await req.json();
  const parsed = jobPostingSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message || "Invalid input" }, { status: 400 });
  }

  await connectDB();
  const existing = await JobPosting.findOne({ slug: parsed.data.slug });
  if (existing) {
    return NextResponse.json({ error: "A job posting with this slug already exists" }, { status: 409 });
  }

  const doc = await JobPosting.create({ ...parsed.data, applyDeadline: parsed.data.applyDeadline || null });
  return NextResponse.json(doc, { status: 201 });
}
