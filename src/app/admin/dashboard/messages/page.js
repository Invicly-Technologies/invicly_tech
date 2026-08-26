"use client";

import { useEffect, useState } from "react";
import { Loader2, Mail, MailOpen, Trash2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/card";

export default function MessagesAdminPage() {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    const res = await fetch("/api/admin/messages");
    if (res.ok) setMessages(await res.json());
    setLoading(false);
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load();
  }, []);

  async function toggleRead(msg) {
    await fetch(`/api/admin/messages/${msg._id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ read: !msg.read }),
    });
    load();
  }

  async function remove(msg) {
    if (!confirm(`Delete message from ${msg.name}?`)) return;
    await fetch(`/api/admin/messages/${msg._id}`, { method: "DELETE" });
    load();
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-foreground">Messages</h1>
      <p className="mt-1 text-sm text-muted-foreground">Submissions from the public contact form.</p>

      <div className="mt-8 space-y-4">
        {loading ? (
          <div className="flex items-center justify-center gap-2 py-10 text-sm text-muted-foreground">
            <Loader2 size={16} className="animate-spin" /> Loading...
          </div>
        ) : messages.length === 0 ? (
          <Card className="py-10 text-center text-sm text-muted-foreground">No messages yet.</Card>
        ) : (
          messages.map((msg) => (
            <Card key={msg._id} className={msg.read ? "opacity-70" : "border-primary/40"}>
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-semibold text-foreground">{msg.name}</p>
                    {!msg.read && <Badge className="border-primary/40 bg-primary/10 text-primary">New</Badge>}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {msg.email} {msg.phone && `· ${msg.phone}`}
                  </p>
                  {msg.subject && <p className="mt-1 text-sm font-medium text-foreground/90">{msg.subject}</p>}
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => toggleRead(msg)}
                    className="flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted hover:text-primary"
                    aria-label={msg.read ? "Mark unread" : "Mark read"}
                    title={msg.read ? "Mark unread" : "Mark read"}
                  >
                    {msg.read ? <Mail size={16} /> : <MailOpen size={16} />}
                  </button>
                  <button
                    onClick={() => remove(msg)}
                    className="flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground hover:bg-red-500/10 hover:text-red-500"
                    aria-label="Delete"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
              <p className="mt-3 whitespace-pre-line text-sm text-foreground/90">{msg.message}</p>
              <p className="mt-3 text-xs text-muted-foreground">
                {new Date(msg.createdAt).toLocaleString()}
              </p>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
