import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Candidate from "@/models/Candidate";
import { requireAdminOrResponse } from "@/lib/api-guard";

export async function GET() {
  const { response } = await requireAdminOrResponse();
  if (response) return response;

  await connectDB();
  const docs = await Candidate.find({}, "-passwordHash -otp").sort({ createdAt: -1 }).lean();
  return NextResponse.json(docs);
}
