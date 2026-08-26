import mongoose from "mongoose";

const AdminSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true },
    name: { type: String, default: "Admin" },
    role: { type: String, default: "admin" },
    isSuperAdmin: { type: Boolean, default: false },
    disabled: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export default mongoose.models.Admin || mongoose.model("Admin", AdminSchema, "admins");
