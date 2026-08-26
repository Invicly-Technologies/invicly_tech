import { NextResponse, after } from "next/server";
import { connectDB } from "@/lib/db";
import Application from "@/models/Application";
import { applicationStatusSchema } from "@/lib/validators";
import { requireAdminOrResponse } from "@/lib/api-guard";
import { sendApplicationStatusEmail } from "@/lib/mailer";
import { isBackwardStatusChange } from "@/lib/application-status";

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
  const existing = await Application.findById(id).lean();
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

  if (isBackwardStatusChange(existing.status, parsed.data.status)) {
    return NextResponse.json({ error: "Status can't be moved backward." }, { status: 400 });
  }

  const doc = await Application.findByIdAndUpdate(id, { status: parsed.data.status }, { new: true })
    .populate("job", "title slug type")
    .lean();
  if (!doc) return NextResponse.json({ error: "Not found" }, { status: 404 });

  after(() => {
    console.log(`[applications] sending status email to ${doc.email} (status=${doc.status})`);
    return sendApplicationStatusEmail({
      to: doc.email,
      fullName: doc.fullName,
      jobTitle: doc.job?.title,
      status: doc.status,
    })
      .then((result) => console.log(`[applications] status email result:`, result))
      .catch((err) => console.error("[applications] status email failed:", err.message, err.stack));
  });

  return NextResponse.json(doc);
}
