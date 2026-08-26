import mongoose from "mongoose";

const HeroSchema = new mongoose.Schema(
  {
    singleton: { type: String, default: "main", unique: true },
    eyebrow: { type: String, default: "Software · Cloud · AI" },
    headline: { type: String, default: "We build technology that moves your business forward" },
    subheadline: {
      type: String,
      default:
        "Invicly Technologies partners with ambitious companies to design, engineer, and ship software, cloud platforms, and AI-driven products.",
    },
    ctaText: { type: String, default: "Start a project" },
    ctaLink: { type: String, default: "/contact" },
    secondaryCtaText: { type: String, default: "Explore services" },
    secondaryCtaLink: { type: String, default: "/services" },
    backgroundImageUrl: {
      type: String,
      default: "https://images.unsplash.com/photo-1519389950473-47ba0277781c?q=80&w=2000&auto=format&fit=crop",
    },
  },
  { timestamps: true }
);

export default mongoose.models.Hero || mongoose.model("Hero", HeroSchema, "hero");
