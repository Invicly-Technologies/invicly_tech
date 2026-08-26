"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, CheckCircle2 } from "lucide-react";
import { contactSchema } from "@/lib/validators";
import { Input, Textarea, Label } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export function ContactForm() {
  const [status, setStatus] = useState("idle");
  const [error, setError] = useState("");

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({ resolver: zodResolver(contactSchema) });

  async function onSubmit(values) {
    setError("");
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      if (!res.ok) throw new Error("Something went wrong. Please try again.");
      setStatus("success");
      reset();
    } catch (err) {
      setError(err.message);
    }
  }

  if (status === "success") {
    return (
      <div className="card-surface flex flex-col items-center gap-3 p-10 text-center">
        <CheckCircle2 className="text-primary" size={40} />
        <h3 className="text-lg font-semibold text-foreground">Message sent</h3>
        <p className="max-w-sm text-sm text-muted-foreground">
          Thanks for reaching out — our team will get back to you within one business day.
        </p>
        <Button variant="outline" onClick={() => setStatus("idle")}>
          Send another message
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="card-surface grid gap-5 p-7 sm:p-8">
      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <Label htmlFor="name">Full name</Label>
          <Input id="name" placeholder="Jane Doe" {...register("name")} />
          {errors.name && <p className="mt-1 text-xs text-red-500">{errors.name.message}</p>}
        </div>
        <div>
          <Label htmlFor="email">Email</Label>
          <Input id="email" type="email" placeholder="jane@company.com" {...register("email")} />
          {errors.email && <p className="mt-1 text-xs text-red-500">{errors.email.message}</p>}
        </div>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <Label htmlFor="phone">Phone (optional)</Label>
          <Input id="phone" placeholder="+1 555 123 4567" {...register("phone")} />
        </div>
        <div>
          <Label htmlFor="subject">Subject</Label>
          <Input id="subject" placeholder="Project inquiry" {...register("subject")} />
        </div>
      </div>

      <div>
        <Label htmlFor="message">Message</Label>
        <Textarea id="message" placeholder="Tell us about your project..." {...register("message")} />
        {errors.message && <p className="mt-1 text-xs text-red-500">{errors.message.message}</p>}
      </div>

      {error && <p className="text-sm text-red-500">{error}</p>}

      <Button type="submit" disabled={isSubmitting} className="justify-self-start">
        {isSubmitting && <Loader2 size={16} className="animate-spin" />}
        Send message
      </Button>
    </form>
  );
}
