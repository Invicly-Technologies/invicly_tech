import "server-only";
import nodemailer from "nodemailer";

const host = process.env.SMTP_HOST;
const port = Number(process.env.SMTP_PORT || 587);
const user = process.env.SMTP_USER;
const pass = process.env.SMTP_PASS;

export const mailConfigured = Boolean(host && user && pass);

const transport = mailConfigured
  ? nodemailer.createTransport({ host, port, secure: port === 465, auth: { user, pass } })
  : null;

const esc = (s: string) => s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);

export async function sendCodeEmail(to: string, name: string, code: string, purpose: "verify" | "reset") {
  const subject = purpose === "verify" ? `${code} is your Invicly Learn verification code` : `${code} is your Invicly Learn password reset code`;
  const lead =
    purpose === "verify"
      ? "Use this code to verify your email and finish creating your Invicly Learn account."
      : "Use this code to reset your Invicly Learn password. If you did not ask for this, you can ignore this email.";
  const text = `Hi ${name},\n\n${lead}\n\n${code}\n\nThe code expires in 15 minutes.\n\nInvicly Learn · https://www.invicly.com/learn/`;
  const html = `<!doctype html><html><body style="margin:0;background:#f4f6fb;font-family:Arial,Helvetica,sans-serif;color:#0b1220">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="padding:32px 12px"><tr><td align="center">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:480px;background:#ffffff;border-radius:16px;border:1px solid #e3e8f2">
  <tr><td style="padding:28px 32px 8px;font-size:20px;font-weight:800">Invicly<span style="color:#0A84FF">Learn</span></td></tr>
  <tr><td style="padding:8px 32px 0;font-size:15px;line-height:1.6">Hi ${esc(name)},<br>${lead}</td></tr>
  <tr><td style="padding:24px 32px"><div style="font-size:34px;letter-spacing:10px;font-weight:800;text-align:center;background:#eef5ff;border-radius:12px;padding:18px 0;color:#0a3a7a">${code}</div></td></tr>
  <tr><td style="padding:0 32px 28px;font-size:13px;color:#5b6780">The code expires in 15 minutes.</td></tr>
  </table><p style="font-size:12px;color:#8a95ab">Invicly Tech · <a href="https://www.invicly.com/learn/" style="color:#0A84FF">invicly.com/learn</a></p>
  </td></tr></table></body></html>`;

  if (!transport) {
    // Local development without SMTP: print the code so the flow can still be completed.
    console.log(`[learn mail] ${purpose} code for ${to}: ${code}`);
    return;
  }
  await transport.sendMail({ from: `"Invicly Learn" <${user}>`, to, subject, text, html });
}
