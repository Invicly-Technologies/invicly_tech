"use client";

import { useRef, useState } from "react";
import { CheckCircle2, Loader2, Paperclip, Send, X } from "lucide-react";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import { RichTextEditor } from "@/components/admin/rich-text-editor";

const MAX_TOTAL_BYTES = 20 * 1024 * 1024;

function formatBytes(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

// Parent should remount this with a fresh `key` each time it opens for a new recipient,
// so this component can initialize its state from props once instead of resetting via an effect.
export function MailComposeModal({ open, onClose, to, recipientName, defaultSubject = "" }) {
  const [subject, setSubject] = useState(defaultSubject);
  const [html, setHtml] = useState("");
  const [files, setFiles] = useState([]);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const [sent, setSent] = useState(false);
  const fileInputRef = useRef(null);

  const totalBytes = files.reduce((sum, f) => sum + f.size, 0);

  function addFiles(fileList) {
    setFiles((prev) => [...prev, ...Array.from(fileList || [])]);
  }

  function removeFile(index) {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  }

  async function onSend(e) {
    e.preventDefault();
    setError("");

    const plainText = html.replace(/<[^>]*>/g, "").trim();
    if (!plainText) {
      setError("Write a message before sending.");
      return;
    }
    if (totalBytes > MAX_TOTAL_BYTES) {
      setError("Attachments are too large — keep the total under 20MB.");
      return;
    }

    setSending(true);
    const formData = new FormData();
    formData.append("to", to);
    formData.append("subject", subject);
    formData.append("html", html);
    files.forEach((file) => formData.append("attachments", file));

    const res = await fetch("/api/admin/mail", { method: "POST", body: formData });
    setSending(false);

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error || "Something went wrong. Please try again.");
      return;
    }
    setSent(true);
  }

  return (
    <Modal open={open} onClose={onClose} title={`Email ${recipientName || to}`} className="max-w-2xl">
      {sent ? (
        <div className="flex flex-col items-center gap-3 py-8 text-center">
          <CheckCircle2 className="text-primary" size={40} />
          <p className="text-sm font-medium text-foreground">Email sent to {to}</p>
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </div>
      ) : (
        <form onSubmit={onSend} className="space-y-4">
          <div>
            <Label htmlFor="mail-to">To</Label>
            <Input id="mail-to" value={to} disabled />
          </div>
          <div>
            <Label htmlFor="mail-subject">Subject</Label>
            <Input
              id="mail-subject"
              required
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="mail-body">Message</Label>
            <RichTextEditor value={html} onChange={setHtml} placeholder="Write your message..." />
          </div>

          <div>
            <input
              ref={fileInputRef}
              type="file"
              multiple
              className="hidden"
              onChange={(e) => {
                addFiles(e.target.files);
                e.target.value = "";
              }}
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-foreground/80 hover:bg-muted"
            >
              <Paperclip size={13} /> Attach files
            </button>

            {files.length > 0 && (
              <ul className="mt-2 space-y-1.5">
                {files.map((file, i) => (
                  <li
                    key={`${file.name}-${i}`}
                    className="flex items-center justify-between gap-2 rounded-lg bg-muted px-3 py-1.5 text-xs text-foreground/90"
                  >
                    <span className="truncate">
                      {file.name} <span className="text-muted-foreground">({formatBytes(file.size)})</span>
                    </span>
                    <button
                      type="button"
                      onClick={() => removeFile(i)}
                      aria-label="Remove attachment"
                      className="text-muted-foreground hover:text-red-500"
                    >
                      <X size={13} />
                    </button>
                  </li>
                ))}
              </ul>
            )}
            {totalBytes > MAX_TOTAL_BYTES && (
              <p className="mt-1.5 text-xs text-red-500">Attachments are too large — keep the total under 20MB.</p>
            )}
          </div>

          {error && <p className="text-sm text-red-500">{error}</p>}

          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={sending}>
              {sending ? <Loader2 size={16} className="animate-spin" /> : <Send size={15} />}
              Send email
            </Button>
          </div>
        </form>
      )}
    </Modal>
  );
}
