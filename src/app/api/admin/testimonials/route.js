import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Testimonial from "@/models/Testimonial";
import { testimonialSchema } from "@/lib/validators";
import { requireAdminOrResponse } from "@/lib/api-guard";

export async function GET() {
  const { response } = await requireAdminOrResponse();
  if (response) return response;

  await connectDB();
  const docs = await Testimonial.find({}).sort({ order: 1, createdAt: 1 }).lean();
  return NextResponse.json(docs);
}

export async function POST(req) {
  const { response } = await requireAdminOrResponse();
  if (response) return response;

  const body = await req.json();
  const parsed = testimonialSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message || "Invalid input" }, { status: 400 });
  }

  await connectDB();
  const doc = await Testimonial.create(parsed.data);
  return NextResponse.json(doc, { status: 201 });
}
