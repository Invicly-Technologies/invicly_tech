import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Service from "@/models/Service";
import Product from "@/models/Product";
import TeamMember from "@/models/TeamMember";
import Testimonial from "@/models/Testimonial";
import ContactSubmission from "@/models/ContactSubmission";
import { requireAdminOrResponse } from "@/lib/api-guard";

export async function GET() {
  const { response } = await requireAdminOrResponse();
  if (response) return response;

  await connectDB();
  const [services, products, team, testimonials, messages, unreadMessages] = await Promise.all([
    Service.countDocuments(),
    Product.countDocuments(),
    TeamMember.countDocuments(),
    Testimonial.countDocuments(),
    ContactSubmission.countDocuments(),
    ContactSubmission.countDocuments({ read: false }),
  ]);

  return NextResponse.json({ services, products, team, testimonials, messages, unreadMessages });
}
