import { NextResponse } from "next/server";
import { requireAdminOrResponse } from "@/lib/api-guard";
import { adminMailSchema } from "@/lib/validators";
import { sendCustomMail } from "@/lib/mailer";

const MAX_TOTAL_BYTES = 20 * 1024 * 1024;

export async function POST(req) {
  const { response } = await requireAdminOrResponse();
  if (response) return response;

  const formData = await req.formData();
  const parsed = adminMailSchema.safeParse({
    to: formData.get("to"),
    subject: formData.get("subject"),
    html: formData.get("html"),
  });
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message || "Invalid input" }, { status: 400 });
  }

  const files = formData.getAll("attachments").filter((f) => f instanceof File && f.size > 0);
  const totalBytes = files.reduce((sum, f) => sum + f.size, 0);
  if (totalBytes > MAX_TOTAL_BYTES) {
    return NextResponse.json({ error: "Attachments are too large — keep the total under 20MB." }, { status: 400 });
  }

  const attachments = await Promise.all(
    files.map(async (file) => ({
      filename: file.name,
      content: Buffer.from(await file.arrayBuffer()),
      contentType: file.type || undefined,
    }))
  );

  try {
    const result = await sendCustomMail({
      to: parsed.data.to,
      subject: parsed.data.subject,
      bodyHtml: parsed.data.html,
      attachments,
    });
    if (result.skipped) {
      return NextResponse.json(
        { error: "Email sending isn't configured on the server (missing SMTP credentials)." },
        { status: 500 }
      );
    }
  } catch (err) {
    console.error("[admin/mail] send failed:", err.message);
    return NextResponse.json({ error: "Failed to send email. Please try again." }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
