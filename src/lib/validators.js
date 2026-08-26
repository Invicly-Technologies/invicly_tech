import { z } from "zod";

export const contactSchema = z.object({
  name: z.string().min(2, "Name is too short").max(120),
  email: z.string().email("Enter a valid email"),
  phone: z.string().max(30).optional().or(z.literal("")),
  subject: z.string().max(160).optional().or(z.literal("")),
  message: z.string().min(10, "Message is too short").max(5000),
});

export const serviceSchema = z.object({
  title: z.string().min(2).max(120),
  slug: z
    .string()
    .min(2)
    .max(120)
    .regex(/^[a-z0-9-]+$/, "Use lowercase letters, numbers, and hyphens only"),
  icon: z.string().max(60).optional().or(z.literal("")),
  shortDescription: z.string().min(5).max(300),
  fullDescription: z.string().min(5).max(5000),
  imageUrl: z.string().max(500).optional().or(z.literal("")),
  features: z.array(z.string()).optional(),
  order: z.number().optional(),
  featured: z.boolean().optional(),
});

export const productSchema = z.object({
  title: z.string().min(2).max(120),
  slug: z
    .string()
    .min(2)
    .max(120)
    .regex(/^[a-z0-9-]+$/, "Use lowercase letters, numbers, and hyphens only"),
  category: z.string().max(60).optional().or(z.literal("")),
  description: z.string().min(5).max(300),
  fullDescription: z.string().max(5000).optional().or(z.literal("")),
  imageUrl: z.string().max(500).optional().or(z.literal("")),
  features: z.array(z.string()).optional(),
  priceLabel: z.string().max(120).optional().or(z.literal("")),
  order: z.number().optional(),
  featured: z.boolean().optional(),
});

export const teamMemberSchema = z.object({
  name: z.string().min(2).max(120),
  role: z.string().min(2).max(120),
  bio: z.string().max(2000).optional().or(z.literal("")),
  photoUrl: z.string().max(500).optional().or(z.literal("")),
  linkedin: z.string().max(300).optional().or(z.literal("")),
  twitter: z.string().max(300).optional().or(z.literal("")),
  order: z.number().optional(),
});

export const testimonialSchema = z.object({
  clientName: z.string().min(2).max(120),
  company: z.string().max(120).optional().or(z.literal("")),
  quote: z.string().min(5).max(2000),
  avatarUrl: z.string().max(500).optional().or(z.literal("")),
  rating: z.number().min(1).max(5).optional(),
  order: z.number().optional(),
});

export const heroSchema = z.object({
  eyebrow: z.string().max(120).optional().or(z.literal("")),
  headline: z.string().min(5).max(200),
  subheadline: z.string().min(5).max(500),
  ctaText: z.string().max(60).optional().or(z.literal("")),
  ctaLink: z.string().max(300).optional().or(z.literal("")),
  secondaryCtaText: z.string().max(60).optional().or(z.literal("")),
  secondaryCtaLink: z.string().max(300).optional().or(z.literal("")),
  backgroundImageUrl: z.string().max(500).optional().or(z.literal("")),
});

export const aboutSchema = z.object({
  story: z.string().min(5).max(5000),
  mission: z.string().min(5).max(1000),
  vision: z.string().min(5).max(1000),
  imageUrl: z.string().max(500).optional().or(z.literal("")),
  values: z
    .array(z.object({ title: z.string(), description: z.string(), icon: z.string().optional() }))
    .optional(),
  stats: z.array(z.object({ label: z.string(), value: z.string() })).optional(),
});

export const siteSettingsSchema = z.object({
  siteName: z.string().min(2).max(120),
  tagline: z.string().max(200).optional().or(z.literal("")),
  logoUrl: z.string().max(500).optional().or(z.literal("")),
  email: z.string().email().optional().or(z.literal("")),
  phone: z.string().max(40).optional().or(z.literal("")),
  address: z.string().max(300).optional().or(z.literal("")),
  socials: z
    .object({
      linkedin: z.string().optional().or(z.literal("")),
      twitter: z.string().optional().or(z.literal("")),
      github: z.string().optional().or(z.literal("")),
      instagram: z.string().optional().or(z.literal("")),
    })
    .optional(),
  seoDescription: z.string().max(300).optional().or(z.literal("")),
});

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "Required"),
    newPassword: z.string().min(8, "Use at least 8 characters"),
    confirmPassword: z.string().min(1, "Required"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

const passwordField = z.string().min(8, "Use at least 8 characters").max(200);
const otpField = z.string().regex(/^\d{6}$/, "Enter the 6-digit code");

export const candidateSignupSchema = z.object({
  name: z.string().min(2, "Name is too short").max(120),
  email: z.string().email("Enter a valid email"),
  phone: z.string().max(30).optional().or(z.literal("")),
  password: passwordField,
});

export const candidateLoginSchema = z.object({
  email: z.string().email("Enter a valid email"),
  password: z.string().min(1, "Required"),
});

export const verifyOtpSchema = z.object({
  email: z.string().email(),
  otp: otpField,
});

export const resendOtpSchema = z.object({
  email: z.string().email(),
  purpose: z.enum(["verify", "reset"]),
});

export const forgotPasswordSchema = z.object({
  email: z.string().email(),
});

export const resetPasswordSchema = z.object({
  email: z.string().email(),
  otp: otpField,
  newPassword: passwordField,
});

export const jobPostingSchema = z.object({
  title: z.string().min(2).max(160),
  slug: z
    .string()
    .min(2)
    .max(160)
    .regex(/^[a-z0-9-]+$/, "Use lowercase letters, numbers, and hyphens only"),
  department: z.string().max(120).optional().or(z.literal("")),
  location: z.string().max(120).optional().or(z.literal("")),
  type: z.enum(["full-time", "part-time", "internship", "contract"]),
  description: z.string().min(5).max(5000),
  responsibilities: z.array(z.string()).optional(),
  requirements: z.array(z.string()).optional(),
  applyDeadline: z.string().nullable().optional().or(z.literal("")),
  status: z.enum(["open", "closed"]),
  order: z.number().optional(),
});

export const applicationSchema = z.object({
  jobId: z.string().min(1, "Job is required"),
  fullName: z.string().min(2).max(160),
  email: z.string().email(),
  phone: z.string().max(30).optional().or(z.literal("")),
  education: z.object({
    degree: z.string().max(160).optional().or(z.literal("")),
    institution: z.string().max(160).optional().or(z.literal("")),
    graduationYear: z.string().max(10).optional().or(z.literal("")),
  }),
  resumeUrl: z.string().min(1, "Resume link is required").max(500),
  coverLetter: z.string().max(4000).optional().or(z.literal("")),
});

export const applicationStatusSchema = z.object({
  status: z.enum(["submitted", "under_review", "shortlisted", "rejected", "hired"]),
});

export const createAdminSchema = z.object({
  name: z.string().min(2).max(120),
  email: z.string().email(),
  password: passwordField,
});
