import { NextResponse, after } from "next/server";
import { connectDB } from "@/lib/db";
import ContactSubmission from "@/models/ContactSubmission";
import { contactSchema } from "@/lib/validators";
import { sendContactNotification } from "@/lib/mailer";

export async function POST(req) {
  try {
    const body = await req.json();
    const parsed = contactSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0]?.message || "Invalid input" }, { status: 400 });
    }

    await connectDB();
    const submission = await ContactSubmission.create(parsed.data);

    // `after()` keeps the serverless function alive until the email finishes sending,
    // which a fire-and-forget promise does not guarantee once the response is returned.
    after(() =>
      sendContactNotification(parsed.data).catch((err) =>
        console.error("[contact] email notification failed:", err.message)
      )
    );

    return NextResponse.json({ ok: true, id: submission._id.toString() }, { status: 201 });
  } catch (err) {
    console.error("[contact] submission failed:", err.message);
    return NextResponse.json({ error: "Something went wrong. Please try again." }, { status: 500 });
  }
}
