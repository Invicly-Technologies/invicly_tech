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

const BRAND = {
  name: "Invicly Technologies",
  primary: "#3b57e8",
  accent: "#06b6d4",
  dark: "#0b1120",
  muted: "#5b6472",
  border: "#e3e7ee",
  background: "#f7f8fb",
};

function escapeHtml(str = "") {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

// Wraps content in a branded shell so every candidate/applicant-facing email looks like the site.
export function renderEmailHtml({ preheader = "", heading, bodyHtml, ctaText, ctaLink }) {
  return `<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>${escapeHtml(heading || BRAND.name)}</title>
  </head>
  <body style="margin:0;padding:0;background:${BRAND.background};font-family:Arial,Helvetica,sans-serif;">
    <span style="display:none;max-height:0;overflow:hidden;opacity:0;">${escapeHtml(preheader)}</span>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${BRAND.background};padding:32px 16px;">
      <tr>
        <td align="center">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:#ffffff;border-radius:16px;overflow:hidden;border:1px solid ${BRAND.border};">
            <tr>
              <td style="background:linear-gradient(135deg,${BRAND.primary},${BRAND.accent});padding:28px 32px;">
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                  <tr>
                    <td style="width:40px;">
                      <div style="width:36px;height:36px;border-radius:10px;background:rgba(255,255,255,0.18);color:#ffffff;font-weight:700;font-size:16px;text-align:center;line-height:36px;">I</div>
                    </td>
                    <td style="color:#ffffff;font-size:16px;font-weight:700;padding-left:8px;">${BRAND.name}</td>
                  </tr>
                </table>
              </td>
            </tr>
            <tr>
              <td style="padding:36px 32px 12px;">
                ${heading ? `<h1 style="margin:0 0 16px;font-size:20px;line-height:1.4;color:${BRAND.dark};">${escapeHtml(heading)}</h1>` : ""}
                <div style="font-size:15px;line-height:1.65;color:#1f2735;">${bodyHtml}</div>
                ${
                  ctaText && ctaLink
                    ? `<div style="margin-top:28px;"><a href="${ctaLink}" style="display:inline-block;background:${BRAND.primary};color:#ffffff;text-decoration:none;font-weight:600;font-size:14px;padding:12px 24px;border-radius:999px;">${escapeHtml(ctaText)}</a></div>`
                    : ""
                }
              </td>
            </tr>
            <tr>
              <td style="padding:24px 32px 32px;border-top:1px solid ${BRAND.border};margin-top:16px;">
                <p style="margin:16px 0 0;font-size:12px;color:${BRAND.muted};">
                  ${BRAND.name} · This is an automated message, please don't reply directly to this email.
                </p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}

export async function sendMail({ to, subject, text, html, attachments, replyTo }) {
  const t = getTransporter();
  if (!t || !to) return { skipped: true };

  await t.sendMail({
    from: `"${BRAND.name}" <${process.env.SMTP_USER}>`,
    to,
    replyTo,
    subject,
    text,
    html,
    attachments,
  });

  return { skipped: false };
}

export async function sendOtpEmail(to, code, purpose) {
  const isReset = purpose === "reset";
  const subject = isReset
    ? `Your ${BRAND.name} password reset code`
    : `Verify your ${BRAND.name} account`;

  const html = renderEmailHtml({
    preheader: `Your verification code is ${code}`,
    heading: isReset ? "Reset your password" : "Verify your email address",
    bodyHtml: `
      <p style="margin:0 0 20px;">${
        isReset
          ? "Use this code to reset your password:"
          : "Use this code to verify your email address:"
      }</p>
      <div style="text-align:center;margin:24px 0;">
        <span style="display:inline-block;font-size:28px;font-weight:700;letter-spacing:6px;color:${BRAND.primary};background:${BRAND.background};padding:14px 28px;border-radius:12px;">${code}</span>
      </div>
      <p style="margin:20px 0 0;color:${BRAND.muted};font-size:13px;">This code expires in 10 minutes. If you didn't request this, you can safely ignore this email.</p>
    `,
  });

  const text = [
    isReset
      ? "Use this code to reset your password:"
      : "Use this code to verify your email address:",
    "",
    code,
    "",
    "This code expires in 10 minutes. If you didn't request this, you can ignore this email.",
  ].join("\n");

  return sendMail({ to, subject, text, html });
}

export async function sendContactNotification(submission) {
  const t = getTransporter();
  const to = process.env.CONTACT_NOTIFY_EMAIL || process.env.SMTP_USER;
  if (!t || !to) return { skipped: true };

  await t.sendMail({
    from: `"${BRAND.name} Website" <${process.env.SMTP_USER}>`,
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

const STATUS_COPY = {
  submitted: {
    heading: "We've received your application",
    body: "Thanks for applying — our team will review your application and get back to you soon.",
  },
  under_review: {
    heading: "Your application is under review",
    body: "Good news — your application has moved to the review stage. We'll be in touch with next steps shortly.",
  },
  shortlisted: {
    heading: "You've been shortlisted!",
    body: "Congratulations — you've been shortlisted for this role. Our team will reach out soon to schedule next steps.",
  },
  rejected: {
    heading: "Update on your application",
    body: "Thank you for your interest and the time you invested in applying. We've decided to move forward with other candidates for this role, but we encourage you to apply for future openings that match your profile.",
  },
  hired: {
    heading: "Congratulations — you're hired!",
    body: "We're thrilled to let you know that you've been selected for this role. Our team will reach out with onboarding details shortly.",
  },
};

export async function sendApplicationStatusEmail({ to, fullName, jobTitle, status }) {
  const copy = STATUS_COPY[status] || STATUS_COPY.submitted;
  const subject = `${copy.heading} — ${jobTitle || "Your application"} at ${BRAND.name}`;

  const html = renderEmailHtml({
    preheader: copy.heading,
    heading: copy.heading,
    bodyHtml: `
      <p style="margin:0 0 16px;">Hi ${escapeHtml(fullName || "there")},</p>
      <p style="margin:0 0 16px;">${escapeHtml(copy.body)}</p>
      ${jobTitle ? `<p style="margin:0;color:${BRAND.muted};font-size:13px;">Role: <strong style="color:${BRAND.dark};">${escapeHtml(jobTitle)}</strong></p>` : ""}
    `,
    ctaText: "View my applications",
    ctaLink: `${process.env.NEXTAUTH_URL || ""}/careers/applications`,
  });

  const text = `Hi ${fullName || "there"},\n\n${copy.body}\n${jobTitle ? `\nRole: ${jobTitle}` : ""}`;

  return sendMail({ to, subject, text, html });
}

// Free-form email an admin composes from the dashboard, sent to a candidate/applicant.
export async function sendCustomMail({ to, subject, bodyHtml, attachments }) {
  const html = renderEmailHtml({
    preheader: subject,
    heading: subject,
    bodyHtml,
  });

  return sendMail({ to, subject, html, attachments });
}
