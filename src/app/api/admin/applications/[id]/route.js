import { NextResponse, after } from "next/server";
import { connectDB } from "@/lib/db";
import Application from "@/models/Application";
import { applicationStatusSchema } from "@/lib/validators";
import { requireAdminOrResponse } from "@/lib/api-guard";
import { sendApplicationStatusEmail } from "@/lib/mailer";

// Gives the background email send (via after()) enough headroom on Vercel's default
// function duration, which can otherwise be shorter than the mailer's own SMTP timeouts.
export const maxDuration = 30;

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
  const doc = await Application.findByIdAndUpdate(id, { status: parsed.data.status }, { new: true })
    .populate("job", "title slug type")
    .lean();
  if (!doc) return NextResponse.json({ error: "Not found" }, { status: 404 });

  after(() =>
    sendApplicationStatusEmail({
      to: doc.email,
      fullName: doc.fullName,
      jobTitle: doc.job?.title,
      status: doc.status,
    }).catch((err) => console.error("[applications] status email failed:", err.message))
  );

  return NextResponse.json(doc);
}
