import mongoose from "mongoose";

const ValueSchema = new mongoose.Schema(
  {
    title: String,
    description: String,
    icon: { type: String, default: "Sparkles" },
  },
  { _id: false }
);

const StatSchema = new mongoose.Schema(
  {
    label: String,
    value: String,
  },
  { _id: false }
);

const AboutSchema = new mongoose.Schema(
  {
    singleton: { type: String, default: "main", unique: true },
    story: {
      type: String,
      default:
        "Invicly Technologies was founded to help growing companies build reliable software without the overhead of hiring a full in-house engineering team. What started as a small group of engineers solving one client's cloud migration has grown into a full-service technology partner working across product engineering, cloud infrastructure, and applied AI.",
    },
    mission: {
      type: String,
      default: "To help businesses of every size build and scale technology that actually works.",
    },
    vision: {
      type: String,
      default: "A world where great software is accessible to every ambitious company, not just the ones with the biggest budgets.",
    },
    imageUrl: {
      type: String,
      default: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?q=80&w=1600&auto=format&fit=crop",
    },
    values: {
      type: [ValueSchema],
      default: [
        { title: "Craftsmanship", description: "We sweat the details others skip.", icon: "Gem" },
        { title: "Transparency", description: "Clear timelines, clear pricing, clear communication.", icon: "Eye" },
        { title: "Ownership", description: "We treat every project like it's our own product.", icon: "ShieldCheck" },
        { title: "Velocity", description: "We ship fast without cutting corners on quality.", icon: "Rocket" },
      ],
    },
    stats: {
      type: [StatSchema],
      default: [
        { label: "Years in business", value: "6+" },
        { label: "Projects delivered", value: "120+" },
        { label: "Happy clients", value: "80+" },
        { label: "Team members", value: "35+" },
      ],
    },
  },
  { timestamps: true }
);

export default mongoose.models.About || mongoose.model("About", AboutSchema, "about");
