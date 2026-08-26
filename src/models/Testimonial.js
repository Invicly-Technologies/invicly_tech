import mongoose from "mongoose";

const TestimonialSchema = new mongoose.Schema(
  {
    clientName: { type: String, required: true },
    company: { type: String, default: "" },
    quote: { type: String, required: true },
    avatarUrl: { type: String, default: "" },
    rating: { type: Number, default: 5, min: 1, max: 5 },
    order: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export default mongoose.models.Testimonial ||
  mongoose.model("Testimonial", TestimonialSchema, "testimonials");
