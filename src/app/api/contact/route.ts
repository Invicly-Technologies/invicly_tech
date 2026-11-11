import { NextResponse } from "next/server";
import { z } from "zod";
import { esc, mailConfigured, smtpUser, transport } from "@/lib/learn/mail";
import { serviceOptions } from "@/data/services";
import { site } from "@/data/site";

export const dynamic = "force-dynamic";

/**
 * Contact form backend. Validates the enquiry on the server, filters bots (hidden field + time-to-fill),
 * rate-limits per visitor, and emails the details to the Invicly inbox. "Reply" in the mail client goes
 * straight to the visitor.
 */

const schema = z.object({
  name: z.string().trim().min(2).max(100),
  email: z.string().trim().email().max(200),
  company: z.string().trim().max(150).optional().default(""),
  service: z.string().trim().min(1).max(100),
  message: z.string().trim().min(10).max(5000),
  _honey: z.string().optional().default(""),
  startedAt: z.number().optional(),
  page: z.string().max(300).optional().default(""),
});

// Best-effort limit per server instance: 5 messages per 10 minutes per IP.
const WINDOW_MS = 10 * 60 * 1000;
const LIMIT = 5;
const hits = new Map<string, number[]>();
function limited(ip: string) {
  const now = Date.now();
  const recent = (hits.get(ip) ?? []).filter((t) => now - t < WINDOW_MS);
  recent.push(now);
  hits.set(ip, recent);
  if (hits.size > 5000) hits.clear();
  return recent.length > LIMIT;
}

const ok = () => NextResponse.json({ ok: true }, { headers: { "Cache-Control": "no-store" } });
const fail = (status: number, error: string) => NextResponse.json({ ok: false, error }, { status, headers: { "Cache-Control": "no-store" } });

export async function POST(req: Request) {
  let raw: unknown;
  try {
    raw = await req.json();
  } catch {
    return fail(400, "The form could not be read. Please try again.");
  }
  const parsed = schema.safeParse(raw);
  if (!parsed.success) return fail(400, "Please check the highlighted fields and try again.");
  const d = parsed.data;

  // Bots: filled the hidden field, or submitted faster than a person can type. Pretend it worked.
  if (d._honey || (d.startedAt && Date.now() - d.startedAt < 2500)) return ok();

  const h = req.headers;
  const ip = (h.get("x-forwarded-for") ?? "").split(",")[0].trim() || h.get("x-real-ip") || "unknown";
  if (limited(ip)) return fail(429, "You have sent several messages in a short time. Please wait a few minutes, or email us directly.");

  const service = serviceOptions.includes(d.service) ? d.service : `${d.service} (not in list)`;
  const to = process.env.CONTACT_NOTIFY_EMAIL || site.email;
  const when = new Date();
  const ist = when.toLocaleString("en-IN", { timeZone: "Asia/Kolkata", dateStyle: "medium", timeStyle: "short" });
  const place = [h.get("x-vercel-ip-city"), h.get("x-vercel-ip-country-region"), h.get("x-vercel-ip-country")].filter(Boolean).map((x) => decodeURIComponent(x!)).join(", ");
  const page = d.page.startsWith("/") ? `${site.url}${d.page}` : d.page || `${site.url}/contact/`;

  const rows: [string, string][] = [
    ["Name", d.name],
    ["Email", d.email],
    ["Company", d.company || "Not given"],
    ["Service", service],
    ["Sent", `${ist} IST (${when.toISOString()})`],
    ["From page", page],
    ...(place ? ([["Location (approx.)", place]] as [string, string][]) : []),
  ];

  const subject = `New enquiry: ${service} from ${d.name}${d.company ? ` (${d.company})` : ""}`;
  const text = [
    "New enquiry from invicly.com",
    "",
    ...rows.map(([k, v]) => `${k}: ${v}`),
    "",
    "Message:",
    d.message,
    "",
    `Reply to this email to answer ${d.name} directly.`,
  ].join("\n");

  const td = "padding:10px 14px;border-bottom:1px solid #e8edf5;font-size:14px;vertical-align:top";
  const html = `<!doctype html><html><body style="margin:0;background:#f4f6fb;font-family:Arial,Helvetica,sans-serif;color:#0b1220">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="padding:28px 12px"><tr><td align="center">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;background:#ffffff;border-radius:16px;border:1px solid #e3e8f2">
<tr><td style="padding:24px 28px 6px;font-size:20px;font-weight:800">Invicly<span style="color:#0A84FF">Tech</span></td></tr>
<tr><td style="padding:0 28px 18px;font-size:15px;color:#3b4660">New enquiry from the website contact form.</td></tr>
<tr><td style="padding:0 28px"><table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #e8edf5;border-radius:12px;border-collapse:separate;overflow:hidden">
${rows
  .map(
    ([k, v]) =>
      `<tr><td style="${td};width:150px;color:#5b6780;font-weight:bold;background:#f8faff">${esc(k)}</td><td style="${td}">${
        k === "Email" ? `<a href="mailto:${esc(v)}" style="color:#0a6fe0">${esc(v)}</a>` : k === "From page" ? `<a href="${esc(v)}" style="color:#0a6fe0">${esc(v)}</a>` : esc(v)
      }</td></tr>`,
  )
  .join("\n")}
</table></td></tr>
<tr><td style="padding:22px 28px 6px;font-size:13px;font-weight:bold;color:#5b6780">Message</td></tr>
<tr><td style="padding:0 28px 22px"><div style="white-space:pre-wrap;font-size:15px;line-height:1.6;background:#f8faff;border:1px solid #e8edf5;border-radius:12px;padding:16px">${esc(d.message)}</div></td></tr>
<tr><td style="padding:0 28px 26px;font-size:13px;color:#5b6780">Reply to this email to answer ${esc(d.name)} directly.</td></tr>
</table></td></tr></table></body></html>`;

  if (!transport || !mailConfigured) {
    // Local development without SMTP: show the enquiry in the server log instead of failing.
    if (process.env.NODE_ENV !== "production") {
      console.log(`[contact] would email ${to}\n${text}`);
      return ok();
    }
    return fail(503, `Messages can't be sent right now. Please email us at ${site.email}.`);
  }

  try {
    await transport.sendMail({
      from: `"Invicly website" <${smtpUser}>`,
      to,
      replyTo: { name: d.name, address: d.email },
      subject,
      text,
      html,
    });
  } catch (e) {
    console.error("[contact] send failed", e);
    return fail(502, `Your message could not be sent. Please try again, or email us at ${site.email}.`);
  }
  return ok();
}
