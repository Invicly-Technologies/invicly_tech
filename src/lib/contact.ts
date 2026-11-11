/**
 * Sends the contact form to the site's own backend (src/app/api/contact/route.ts), which emails the
 * details to the Invicly inbox over SMTP. No third-party form service is involved.
 */
export type ContactPayload = {
  name: string;
  email: string;
  company?: string;
  service: string;
  message: string;
  /** Hidden anti-spam field; must stay empty. */
  _honey?: string;
  /** When the form was first shown (ms since epoch); very fast submissions are treated as bots. */
  startedAt?: number;
  /** Page the form was sent from. */
  page?: string;
};

export async function sendContact(data: ContactPayload): Promise<void> {
  const res = await fetch("/api/contact/", {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify(data),
  });
  const json = (await res.json().catch(() => ({}))) as { ok?: boolean; error?: string };
  if (!res.ok || !json.ok) throw new Error(json.error || "The message could not be sent. Please try again.");
}
