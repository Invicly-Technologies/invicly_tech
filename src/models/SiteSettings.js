import mongoose from "mongoose";

const SiteSettingsSchema = new mongoose.Schema(
  {
    singleton: { type: String, default: "main", unique: true },
    siteName: { type: String, default: "Invicly Technologies" },
    tagline: { type: String, default: "Engineering Tomorrow's Technology, Today" },
    logoUrl: { type: String, default: "" },
    email: { type: String, default: "hello@invictechnologies.com" },
    phone: { type: String, default: "+1 (555) 013-4477" },
    address: { type: String, default: "4th Floor, Skyline Business Park, Baner, Pune, Maharashtra, India" },
    socials: {
      linkedin: { type: String, default: "https://linkedin.com" },
      twitter: { type: String, default: "https://twitter.com" },
      github: { type: String, default: "https://github.com" },
      instagram: { type: String, default: "https://instagram.com" },
    },
    seoDescription: {
      type: String,
      default:
        "Invicly Technologies builds software, cloud, and AI solutions that help businesses move faster.",
    },
  },
  { timestamps: true }
);

export default mongoose.models.SiteSettings ||
  mongoose.model("SiteSettings", SiteSettingsSchema, "site_settings");
