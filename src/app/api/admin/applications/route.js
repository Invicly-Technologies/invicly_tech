import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Application from "@/models/Application";
import { requireAdminOrResponse } from "@/lib/api-guard";

export async function GET() {
  const { response } = await requireAdminOrResponse();
  if (response) return response;

  await connectDB();
  const docs = await Application.find({})
    .sort({ createdAt: -1 })
    .populate("job", "title slug type")
    .populate("candidate", "name email")
    .lean();
  return NextResponse.json(docs);
}
