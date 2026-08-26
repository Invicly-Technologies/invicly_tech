import mongoose from "mongoose";

const ProductSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    category: { type: String, default: "Platform" },
    description: { type: String, required: true },
    fullDescription: { type: String, default: "" },
    imageUrl: { type: String, default: "" },
    features: { type: [String], default: [] },
    priceLabel: { type: String, default: "Contact for pricing" },
    order: { type: Number, default: 0 },
    featured: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export default mongoose.models.Product || mongoose.model("Product", ProductSchema, "products");
