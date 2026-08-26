import nodemailer from "nodemailer";

let transporter;

function getTransporter() {
  if (transporter) return transporter;
  if (!process.env.SMTP_USER || !process.env.SMTP_PASS) return null;

  transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || "smtp.gmail.com",
    port: Number(process.env.SMTP_PORT || 465),
    secure: true,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
  return transporter;
}

export async function sendMail({ to, subject, text }) {
  const t = getTransporter();
  if (!t || !to) return { skipped: true };

  await t.sendMail({
    from: `"Invicly Technologies" <${process.env.SMTP_USER}>`,
    to,
    subject,
    text,
  });

  return { skipped: false };
}

export async function sendOtpEmail(to, code, purpose) {
  const subject =
    purpose === "reset" ? "Your Invicly Technologies password reset code" : "Verify your Invicly Technologies account";
  const text = [
    purpose === "reset"
      ? "Use this code to reset your password:"
      : "Use this code to verify your email address:",
    "",
    code,
    "",
    "This code expires in 10 minutes. If you didn't request this, you can ignore this email.",
  ].join("\n");

  return sendMail({ to, subject, text });
}

export async function sendContactNotification(submission) {
  const t = getTransporter();
  const to = process.env.CONTACT_NOTIFY_EMAIL || process.env.SMTP_USER;
  if (!t || !to) return { skipped: true };

  await t.sendMail({
    from: `"Invicly Technologies Website" <${process.env.SMTP_USER}>`,
    to,
    replyTo: submission.email,
    subject: `New contact form submission: ${submission.subject || "General inquiry"}`,
    text: [
      `Name: ${submission.name}`,
      `Email: ${submission.email}`,
      `Phone: ${submission.phone || "-"}`,
      `Subject: ${submission.subject || "-"}`,
      "",
      submission.message,
    ].join("\n"),
  });

  return { skipped: false };
}
