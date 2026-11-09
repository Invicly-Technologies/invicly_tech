/**
 * Contact adapter. The site is static, so messages go to a form-to-email service
 * straight from the browser. When a backend is added, replace sendContact() with a
 * fetch to your own route handler (Prisma + Nodemailer) and nothing else changes.
 */
import { site } from "@/data/site";

export type ContactPayload = {
  name: string;
  email: string;
  company?: string;
  service: string;
  message: string;
};

const provider = (process.env.NEXT_PUBLIC_CONTACT_PROVIDER || "formsubmit").toLowerCase();
const endpoint =
  process.env.NEXT_PUBLIC_CONTACT_ENDPOINT ||
  (provider === "web3forms" ? "https://api.web3forms.com/submit" : `https://formsubmit.co/ajax/${site.email}`);

const subject = "New enquiry from invicly.com";

export async function sendContact(data: ContactPayload): Promise<void> {
  const body =
    provider === "web3forms"
      ? {
          access_key: process.env.NEXT_PUBLIC_WEB3FORMS_KEY,
          subject,
          from_name: data.name,
          replyto: data.email,
          ...data,
        }
      : {
          ...data,
          company: data.company || "-",
          _subject: subject,
          _template: "table",
          _captcha: "false",
          _replyto: data.email,
        };

  const res = await fetch(endpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify(body),
  });
  const json = (await res.json().catch(() => ({}))) as { success?: boolean | string; message?: string };
  const ok = res.ok && json.success !== false && json.success !== "false";
  if (!ok) throw new Error(json.message || "The message could not be sent.");
}
