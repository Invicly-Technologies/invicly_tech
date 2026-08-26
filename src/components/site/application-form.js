"use client";

import { useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CheckCircle2, Loader2 } from "lucide-react";
import { applicationSchema } from "@/lib/validators";
import { Input, Textarea, Label } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export function ApplicationForm({ jobId, defaultValues }) {
  const [status, setStatus] = useState("idle");
  const [error, setError] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(applicationSchema),
    defaultValues: {
      jobId,
      fullName: defaultValues?.name || "",
      email: defaultValues?.email || "",
      phone: defaultValues?.phone || "",
      education: { degree: "", institution: "", graduationYear: "" },
      resumeUrl: "",
      coverLetter: "",
    },
  });

  async function onSubmit(values) {
    setError("");
    try {
      const res = await fetch("/api/candidate/applications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "Something went wrong. Please try again.");
      setStatus("success");
    } catch (err) {
      setError(err.message);
    }
  }

  if (status === "success") {
    return (
      <div className="card-surface flex flex-col items-center gap-3 p-10 text-center">
        <CheckCircle2 className="text-primary" size={40} />
        <h3 className="text-lg font-semibold text-foreground">Application submitted</h3>
        <p className="max-w-sm text-sm text-muted-foreground">
          Thanks for applying — you can track its status anytime from{" "}
          <Link href="/careers/applications" className="text-primary underline">
            My Applications
          </Link>
          .
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="card-surface grid gap-5 p-7 sm:p-8">
      <input type="hidden" {...register("jobId")} />
      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <Label htmlFor="fullName">Full name</Label>
          <Input id="fullName" {...register("fullName")} />
          {errors.fullName && <p className="mt-1 text-xs text-red-500">{errors.fullName.message}</p>}
        </div>
        <div>
          <Label htmlFor="email">Email</Label>
          <Input id="email" type="email" {...register("email")} />
          {errors.email && <p className="mt-1 text-xs text-red-500">{errors.email.message}</p>}
        </div>
      </div>

      <div>
        <Label htmlFor="phone">Phone (optional)</Label>
        <Input id="phone" {...register("phone")} />
      </div>

      <div className="grid gap-5 sm:grid-cols-3">
        <div>
          <Label htmlFor="degree">Degree</Label>
          <Input id="degree" placeholder="B.Tech CS" {...register("education.degree")} />
        </div>
        <div>
          <Label htmlFor="institution">Institution</Label>
          <Input id="institution" placeholder="University name" {...register("education.institution")} />
        </div>
        <div>
          <Label htmlFor="graduationYear">Graduation year</Label>
          <Input id="graduationYear" placeholder="2026" {...register("education.graduationYear")} />
        </div>
      </div>

      <div>
        <Label htmlFor="resumeUrl">Resume link</Label>
        <Input id="resumeUrl" placeholder="Google Drive / Dropbox link to your resume" {...register("resumeUrl")} />
        {errors.resumeUrl && <p className="mt-1 text-xs text-red-500">{errors.resumeUrl.message}</p>}
      </div>

      <div>
        <Label htmlFor="coverLetter">Cover letter (optional)</Label>
        <Textarea id="coverLetter" placeholder="Tell us why you're a great fit..." {...register("coverLetter")} />
      </div>

      {error && <p className="text-sm text-red-500">{error}</p>}

      <Button type="submit" disabled={isSubmitting} className="justify-self-start">
        {isSubmitting && <Loader2 size={16} className="animate-spin" />}
        Submit application
      </Button>
    </form>
  );
}
