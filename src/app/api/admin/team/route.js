import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import TeamMember from "@/models/TeamMember";
import { teamMemberSchema } from "@/lib/validators";
import { requireAdminOrResponse } from "@/lib/api-guard";

export async function GET() {
  const { response } = await requireAdminOrResponse();
  if (response) return response;

  await connectDB();
  const docs = await TeamMember.find({}).sort({ order: 1, createdAt: 1 }).lean();
  return NextResponse.json(docs);
}

export async function POST(req) {
  const { response } = await requireAdminOrResponse();
  if (response) return response;

  const body = await req.json();
  const parsed = teamMemberSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message || "Invalid input" }, { status: 400 });
  }

  await connectDB();
  const doc = await TeamMember.create(parsed.data);
  return NextResponse.json(doc, { status: 201 });
}
