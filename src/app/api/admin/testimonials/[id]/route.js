import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Testimonial from "@/models/Testimonial";
import { testimonialSchema } from "@/lib/validators";
import { requireAdminOrResponse } from "@/lib/api-guard";

export async function PUT(req, { params }) {
  const { response } = await requireAdminOrResponse();
  if (response) return response;

  const { id } = await params;
  const body = await req.json();
  const parsed = testimonialSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message || "Invalid input" }, { status: 400 });
  }

  await connectDB();
  const doc = await Testimonial.findByIdAndUpdate(id, parsed.data, { new: true }).lean();
  if (!doc) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(doc);
}

export async function DELETE(_req, { params }) {
  const { response } = await requireAdminOrResponse();
  if (response) return response;

  const { id } = await params;
  await connectDB();
  await Testimonial.findByIdAndDelete(id);
  return NextResponse.json({ ok: true });
}
