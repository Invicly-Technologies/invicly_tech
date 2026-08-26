import mongoose from "mongoose";

const TeamMemberSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    role: { type: String, required: true },
    bio: { type: String, default: "" },
    photoUrl: { type: String, default: "" },
    linkedin: { type: String, default: "" },
    twitter: { type: String, default: "" },
    order: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export default mongoose.models.TeamMember ||
  mongoose.model("TeamMember", TeamMemberSchema, "team_members");
