import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Application from "@/models/Application";
import JobPosting from "@/models/JobPosting";
import { applicationSchema } from "@/lib/validators";
import { requireCandidateOrResponse } from "@/lib/api-guard";

export async function GET() {
  const { candidate, response } = await requireCandidateOrResponse();
  if (response) return response;

  await connectDB();
  const applications = await Application.find({ candidate: candidate._id })
    .sort({ createdAt: -1 })
    .populate("job", "title slug type location status")
    .lean();

  return NextResponse.json(applications);
}

export async function POST(req) {
  const { candidate, response } = await requireCandidateOrResponse();
  if (response) return response;

  const body = await req.json();
  const parsed = applicationSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message || "Invalid input" }, { status: 400 });
  }

  await connectDB();
  const job = await JobPosting.findById(parsed.data.jobId);
  if (!job || job.status !== "open") {
    return NextResponse.json({ error: "This position is no longer accepting applications." }, { status: 400 });
  }

  const existing = await Application.findOne({ candidate: candidate._id, job: job._id });
  if (existing) {
    return NextResponse.json({ error: "You've already applied to this position." }, { status: 409 });
  }

  const { jobId, ...rest } = parsed.data;
  const application = await Application.create({
    ...rest,
    candidate: candidate._id,
    job: job._id,
  });

  return NextResponse.json(application, { status: 201 });
}
