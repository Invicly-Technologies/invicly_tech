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
    // Reuse a warm connection across sends instead of paying a fresh TLS handshake
    // every time, and fail fast instead of hanging on nodemailer's multi-minute defaults
    // (which on a serverless deploy can get the whole request killed before the email sends).
    pool: true,
    maxConnections: 3,
    maxMessages: 100,
    connectionTimeout: 10_000,
    greetingTimeout: 10_000,
    socketTimeout: 15_000,
  });
  return transporter;
}

const BRAND = {
  name: "Invicly Technologies",
  tagline: "Engineering Tomorrow's Technology, Today",
  primary: "#3b57e8",
  accent: "#06b6d4",
  dark: "#0b1120",
  muted: "#5b6472",
  border: "#e3e7ee",
  background: "#f7f8fb",
};

// Hex equivalents of the site's Tailwind status-badge colors (bg-*/10, text-*-600),
// reused so status emails look like the exact badge the admin/candidate dashboards render.
const STATUS_THEME = {
  submitted: { bg: "#eef1f7", fg: "#5b6472" },
  under_review: { bg: "#fef3c7", fg: "#b45309" },
  shortlisted: { bg: "#e5e9fd", fg: "#3b57e8" },
  rejected: { bg: "#fee2e2", fg: "#dc2626" },
  hired: { bg: "#d1fae5", fg: "#047857" },
};

function escapeHtml(str = "") {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

// Wraps content in a branded shell so every outgoing email looks like the site:
// same gradient mark, same card/rounded-corner treatment, same badge colors.
export function renderEmailHtml({ preheader = "", eyebrow, heading, badge, bodyHtml, ctaText, ctaLink }) {
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
              <td style="background:linear-gradient(135deg,${BRAND.primary},${BRAND.accent});padding:26px 32px;">
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                  <tr>
                    <td style="width:38px;">
                      <div style="width:34px;height:34px;border-radius:9px;background:rgba(255,255,255,0.18);color:#ffffff;font-weight:700;font-size:13px;letter-spacing:-0.5px;text-align:center;line-height:34px;">IT</div>
                    </td>
                    <td style="color:#ffffff;font-size:15px;font-weight:700;padding-left:10px;letter-spacing:0.2px;">${BRAND.name}</td>
                  </tr>
                </table>
              </td>
            </tr>
            <tr>
              <td style="padding:36px 32px 12px;">
                ${
                  eyebrow
                    ? `<p style="margin:0 0 10px;font-size:11px;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;color:${BRAND.primary};">${escapeHtml(eyebrow)}</p>`
                    : ""
                }
                ${heading ? `<h1 style="margin:0 0 14px;font-size:21px;line-height:1.4;color:${BRAND.dark};">${escapeHtml(heading)}</h1>` : ""}
                ${
                  badge
                    ? `<span style="display:inline-block;background:${badge.bg};color:${badge.fg};font-size:12px;font-weight:600;padding:5px 14px;border-radius:999px;margin-bottom:18px;">${escapeHtml(badge.label)}</span>`
                    : ""
                }
                <div style="font-size:15px;line-height:1.7;color:#1f2735;">${bodyHtml}</div>
                ${
                  ctaText && ctaLink
                    ? `<div style="margin-top:28px;"><a href="${ctaLink}" style="display:inline-block;background:${BRAND.primary};color:#ffffff;text-decoration:none;font-weight:600;font-size:14px;padding:12px 26px;border-radius:999px;box-shadow:0 8px 20px rgba(59,87,232,0.25);">${escapeHtml(ctaText)}</a></div>`
                    : ""
                }
              </td>
            </tr>
            <tr>
              <td style="padding:22px 32px 30px;border-top:1px solid ${BRAND.border};">
                <p style="margin:16px 0 2px;font-size:12px;font-weight:600;color:${BRAND.dark};">${BRAND.name}</p>
                <p style="margin:0;font-size:11px;color:${BRAND.muted};">${BRAND.tagline}</p>
                <p style="margin:12px 0 0;font-size:11px;color:${BRAND.muted};">This is an automated message — please don't reply directly to this email.</p>
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
    eyebrow: "Account security",
    heading: isReset ? "Reset your password" : "Verify your email address",
    bodyHtml: `
      <p style="margin:0 0 20px;">${
        isReset
          ? "Use this code to reset your password:"
          : "Use this code to verify your email address:"
      }</p>
      <div style="text-align:center;margin:24px 0;">
        <span style="display:inline-block;font-size:28px;font-weight:700;letter-spacing:6px;color:${BRAND.primary};background:${BRAND.background};border:1px dashed ${BRAND.border};padding:14px 28px;border-radius:12px;">${code}</span>
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

function fieldRow(label, value) {
  return `<tr>
    <td style="padding:7px 0;font-size:12px;color:${BRAND.muted};width:100px;vertical-align:top;white-space:nowrap;">${escapeHtml(label)}</td>
    <td style="padding:7px 0 7px 12px;font-size:14px;color:${BRAND.dark};vertical-align:top;">${escapeHtml(value || "-")}</td>
  </tr>`;
}

export async function sendContactNotification(submission) {
  const to = process.env.CONTACT_NOTIFY_EMAIL || process.env.SMTP_USER;

  const html = renderEmailHtml({
    preheader: `New message from ${submission.name}`,
    eyebrow: "Website contact form",
    heading: submission.subject || "New contact form submission",
    bodyHtml: `
      <table role="presentation" cellpadding="0" cellspacing="0" style="width:100%;margin-bottom:18px;">
        ${fieldRow("Name", submission.name)}
        ${fieldRow("Email", submission.email)}
        ${fieldRow("Phone", submission.phone)}
      </table>
      <div style="background:${BRAND.background};border:1px solid ${BRAND.border};border-radius:12px;padding:16px 18px;white-space:pre-line;font-size:14px;color:#1f2735;">${escapeHtml(submission.message)}</div>
    `,
    ctaText: "Reply to sender",
    ctaLink: `mailto:${submission.email}`,
  });

  const text = [
    `Name: ${submission.name}`,
    `Email: ${submission.email}`,
    `Phone: ${submission.phone || "-"}`,
    `Subject: ${submission.subject || "-"}`,
    "",
    submission.message,
  ].join("\n");

  return sendMail({
    to,
    replyTo: submission.email,
    subject: `New contact form submission: ${submission.subject || "General inquiry"}`,
    text,
    html,
  });
}

const STATUS_COPY = {
  submitted: {
    label: "Submitted",
    heading: "We've received your application",
    body: "Thanks for applying — our team will review your application and get back to you soon.",
  },
  under_review: {
    label: "Under review",
    heading: "Your application is under review",
    body: "Good news — your application has moved to the review stage. We'll be in touch with next steps shortly.",
  },
  shortlisted: {
    label: "Shortlisted",
    heading: "You've been shortlisted!",
    body: "Congratulations — you've been shortlisted for this role. Our team will reach out soon to schedule next steps.",
  },
  rejected: {
    label: "Not selected",
    heading: "Update on your application",
    body: "Thank you for your interest and the time you invested in applying. We've decided to move forward with other candidates for this role, but we encourage you to apply for future openings that match your profile.",
  },
  hired: {
    label: "Hired",
    heading: "Congratulations — you're hired!",
    body: "We're thrilled to let you know that you've been selected for this role. Our team will reach out with onboarding details shortly.",
  },
};

export async function sendApplicationStatusEmail({ to, fullName, jobTitle, status }) {
  const copy = STATUS_COPY[status] || STATUS_COPY.submitted;
  const theme = STATUS_THEME[status] || STATUS_THEME.submitted;
  const subject = `${copy.heading} — ${jobTitle || "Your application"} at ${BRAND.name}`;

  const html = renderEmailHtml({
    preheader: copy.heading,
    eyebrow: "Application update",
    heading: copy.heading,
    badge: { label: copy.label, bg: theme.bg, fg: theme.fg },
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
    eyebrow: "Message from our team",
    heading: subject,
    bodyHtml,
  });

  return sendMail({ to, subject, html, attachments });
}
