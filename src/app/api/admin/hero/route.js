import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Hero from "@/models/Hero";
import { heroSchema } from "@/lib/validators";
import { requireAdminOrResponse } from "@/lib/api-guard";

export async function GET() {
  const { response } = await requireAdminOrResponse();
  if (response) return response;

  await connectDB();
  const doc = await Hero.findOneAndUpdate(
    { singleton: "main" },
    {},
    { upsert: true, new: true, setDefaultsOnInsert: true }
  ).lean();
  return NextResponse.json(doc);
}

export async function PUT(req) {
  const { response } = await requireAdminOrResponse();
  if (response) return response;

  const body = await req.json();
  const parsed = heroSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message || "Invalid input" }, { status: 400 });
  }

  await connectDB();
  const doc = await Hero.findOneAndUpdate({ singleton: "main" }, parsed.data, {
    upsert: true,
    new: true,
  }).lean();
  return NextResponse.json(doc);
}
