import mongoose from "mongoose";

const JobPostingSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    department: { type: String, default: "" },
    location: { type: String, default: "Remote" },
    type: {
      type: String,
      enum: ["full-time", "part-time", "internship", "contract"],
      default: "full-time",
    },
    description: { type: String, required: true },
    responsibilities: { type: [String], default: [] },
    requirements: { type: [String], default: [] },
    applyDeadline: { type: Date, default: null },
    status: { type: String, enum: ["open", "closed"], default: "open" },
    order: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export default mongoose.models.JobPosting || mongoose.model("JobPosting", JobPostingSchema, "job_postings");
