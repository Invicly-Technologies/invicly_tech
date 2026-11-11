"use client";
import { zodResolver } from "@hookform/resolvers/zod";
import { AnimatePresence, motion } from "framer-motion";
import { CheckCircle2, Loader2 } from "lucide-react";
import { useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { serviceOptions } from "@/data/services";
import { site } from "@/data/site";
import { sendContact } from "@/lib/contact";

const schema = z.object({
  name: z.string().trim().min(2, "Please enter your name (2 characters or more)."),
  email: z.string().trim().email("Please enter a valid email address."),
  company: z.string().trim().optional(),
  service: z.string().min(1, "Please choose a service."),
  message: z.string().trim().min(10, "Please add a few more details (10 characters or more)."),
  _honey: z.string().optional(),
});
type FormValues = z.infer<typeof schema>;

const COOLDOWN_MS = 30_000;
let lastSent = 0;

export function ContactForm() {
  const [status, setStatus] = useState<"idle" | "sending" | "success" | "error">("idle");
  const [error, setError] = useState("");
  const startedAt = useRef(Date.now());
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { service: serviceOptions[0], company: "", _honey: "" },
  });

  const onSubmit = async (values: FormValues) => {
    const wait = lastSent + COOLDOWN_MS - Date.now();
    if (wait > 0) {
      setError(`Please wait ${Math.ceil(wait / 1000)} seconds before sending another message.`);
      setStatus("error");
      return;
    }
    setStatus("sending");
    setError("");
    try {
      await sendContact({ ...values, startedAt: startedAt.current, page: window.location.pathname });
      lastSent = Date.now();
      setStatus("success");
      reset();
    } catch (e) {
      setError(e instanceof Error ? e.message : "The message could not be sent.");
      setStatus("error");
    }
  };

  const fieldErr = (id: keyof FormValues) =>
    errors[id] ? (
      <p id={`${id}-err`} className="mt-1.5 text-[13px] text-danger">
        {errors[id]?.message}
      </p>
    ) : null;

  return (
    <div className="relative min-w-0 flex-[1_1_520px] rounded-[28px] border border-fg/[.12] bg-card p-6 shadow-[0_40px_90px_-40px_rgba(10,132,255,.5)] md:p-9">
      <AnimatePresence mode="wait">
        {status === "success" ? (
          <motion.div
            key="ok"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="flex min-h-[420px] flex-col items-center justify-center text-center"
            role="status"
            aria-live="polite"
          >
            <CheckCircle2 size={56} className="text-[#34D399]" aria-hidden="true" />
            <h2 className="mt-5 text-3xl font-bold">Message sent.</h2>
            <p className="mt-3 max-w-sm leading-relaxed text-muted">Thanks for reaching out. We reply within one business day.</p>
            <button type="button" className="btn btn-ghost mt-8" onClick={() => setStatus("idle")}>
              Send another message
            </button>
          </motion.div>
        ) : (
          <motion.form key="form" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-5">
            <div className="hidden" aria-hidden="true">
              <label htmlFor="_honey">Leave this field empty</label>
              <input id="_honey" type="text" tabIndex={-1} autoComplete="off" {...register("_honey")} />
            </div>
            <div className="grid gap-5 sm:grid-cols-2">
              <div>
                <label className="lbl" htmlFor="name">
                  Your name
                </label>
                <input className="fld" id="name" type="text" autoComplete="name" placeholder="Full name" aria-invalid={!!errors.name} aria-describedby={errors.name ? "name-err" : undefined} {...register("name")} />
                {fieldErr("name")}
              </div>
              <div>
                <label className="lbl" htmlFor="email">
                  Email
                </label>
                <input className="fld" id="email" type="email" autoComplete="email" placeholder="you@company.com" aria-invalid={!!errors.email} aria-describedby={errors.email ? "email-err" : undefined} {...register("email")} />
                {fieldErr("email")}
              </div>
            </div>
            <div className="grid gap-5 sm:grid-cols-2">
              <div>
                <label className="lbl" htmlFor="company">
                  Company (optional)
                </label>
                <input className="fld" id="company" type="text" autoComplete="organization" placeholder="Company name" {...register("company")} />
              </div>
              <div>
                <label className="lbl" htmlFor="service">
                  What do you need?
                </label>
                <select className="fld" id="service" {...register("service")}>
                  {serviceOptions.map((o) => (
                    <option key={o} value={o} className="bg-panel">
                      {o}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div>
              <label className="lbl" htmlFor="message">
                Project details
              </label>
              <textarea
                className="fld resize-y"
                id="message"
                rows={6}
                placeholder="What are you building, and when do you need it?"
                aria-invalid={!!errors.message}
                aria-describedby={errors.message ? "message-err" : undefined}
                {...register("message")}
              />
              {fieldErr("message")}
            </div>

            {status === "error" && (
              <div role="alert" className="rounded-xl border border-[#FF7A7A]/40 bg-[#FF7A7A]/10 p-4 text-sm leading-relaxed text-danger">
                {error || "Something went wrong."} You can also email us directly at{" "}
                <a className="font-bold text-fg underline" href={`mailto:${site.email}`}>
                  {site.email}
                </a>
                .
              </div>
            )}

            <button type="submit" disabled={status === "sending"} className="btn btn-primary min-h-[56px] w-full font-sans disabled:cursor-wait disabled:opacity-70">
              {status === "sending" ? (
                <>
                  <Loader2 size={18} className="animate-spin" aria-hidden="true" /> Sending…
                </>
              ) : (
                "Send message"
              )}
            </button>
            <p className="text-[13px] leading-normal text-quiet">Your message goes straight to our inbox. We never share your details.</p>
          </motion.form>
        )}
      </AnimatePresence>
    </div>
  );
}
