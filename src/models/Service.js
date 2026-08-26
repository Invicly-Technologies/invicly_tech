import mongoose from "mongoose";

const ServiceSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    icon: { type: String, default: "Code2" },
    shortDescription: { type: String, required: true },
    fullDescription: { type: String, required: true },
    imageUrl: { type: String, default: "" },
    features: { type: [String], default: [] },
    order: { type: Number, default: 0 },
    featured: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export default mongoose.models.Service || mongoose.model("Service", ServiceSchema, "services");
