import mongoose from "mongoose";

const ApplicationSchema = new mongoose.Schema(
  {
    candidate: { type: mongoose.Schema.Types.ObjectId, ref: "Candidate", required: true },
    job: { type: mongoose.Schema.Types.ObjectId, ref: "JobPosting", required: true },
    fullName: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String, default: "" },
    education: {
      degree: { type: String, default: "" },
      institution: { type: String, default: "" },
      graduationYear: { type: String, default: "" },
    },
    resumeUrl: { type: String, required: true },
    coverLetter: { type: String, default: "" },
    status: {
      type: String,
      enum: ["submitted", "under_review", "shortlisted", "rejected", "hired"],
      default: "submitted",
    },
  },
  { timestamps: true }
);

ApplicationSchema.index({ candidate: 1, job: 1 }, { unique: true });

export default mongoose.models.Application || mongoose.model("Application", ApplicationSchema, "applications");
