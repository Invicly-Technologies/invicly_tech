import mongoose from "mongoose";

const OtpSchema = new mongoose.Schema(
  {
    codeHash: { type: String, default: null },
    purpose: { type: String, enum: ["verify", "reset"], default: null },
    expiresAt: { type: Date, default: null },
    attempts: { type: Number, default: 0 },
    lastSentAt: { type: Date, default: null },
  },
  { _id: false }
);

const CandidateSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    phone: { type: String, default: "" },
    passwordHash: { type: String, required: true },
    emailVerified: { type: Boolean, default: false },
    disabled: { type: Boolean, default: false },
    otp: { type: OtpSchema, default: () => ({}) },
  },
  { timestamps: true }
);

export default mongoose.models.Candidate || mongoose.model("Candidate", CandidateSchema, "candidates");
