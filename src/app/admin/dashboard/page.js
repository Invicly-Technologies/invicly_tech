import Link from "next/link";
import { Wrench, Package, Users, Quote, Mail, MailWarning } from "lucide-react";
import { Card } from "@/components/ui/card";
import { connectDB } from "@/lib/db";
import Service from "@/models/Service";
import Product from "@/models/Product";
import TeamMember from "@/models/TeamMember";
import Testimonial from "@/models/Testimonial";
import ContactSubmission from "@/models/ContactSubmission";

export const dynamic = "force-dynamic";

async function getCounts() {
  try {
    await connectDB();
    const [services, products, team, testimonials, messages, unreadMessages] = await Promise.all([
      Service.countDocuments(),
      Product.countDocuments(),
      TeamMember.countDocuments(),
      Testimonial.countDocuments(),
      ContactSubmission.countDocuments(),
      ContactSubmission.countDocuments({ read: false }),
    ]);
    return { services, products, team, testimonials, messages, unreadMessages };
  } catch {
    return null;
  }
}

const TILES = [
  { key: "services", label: "Services", href: "/admin/dashboard/services", icon: Wrench },
  { key: "products", label: "Products", href: "/admin/dashboard/products", icon: Package },
  { key: "team", label: "Team members", href: "/admin/dashboard/team", icon: Users },
  { key: "testimonials", label: "Testimonials", href: "/admin/dashboard/testimonials", icon: Quote },
  { key: "messages", label: "Messages", href: "/admin/dashboard/messages", icon: Mail },
];

export default async function DashboardOverviewPage() {
  const counts = await getCounts();

  return (
    <div>
      <h1 className="text-2xl font-bold text-foreground">Overview</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Manage every part of the Invicly Technologies website from here — changes go live instantly.
      </p>

      {!counts ? (
        <Card className="mt-8 border-amber-500/40 bg-amber-500/5">
          <p className="text-sm text-amber-600 dark:text-amber-400">
            Could not connect to the database. Check that <code>MONGODB_URI</code> in{" "}
            <code>.env.local</code> is correct and that this server&apos;s IP is allowed in Atlas
            Network Access.
          </p>
        </Card>
      ) : (
        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {TILES.map((tile) => {
            const Icon = tile.icon;
            return (
              <Link key={tile.key} href={tile.href}>
                <Card className="flex items-center justify-between transition-colors hover:border-primary/40">
                  <div>
                    <p className="text-sm text-muted-foreground">{tile.label}</p>
                    <p className="mt-1 text-3xl font-bold text-foreground">{counts[tile.key]}</p>
                  </div>
                  <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <Icon size={20} />
                  </span>
                </Card>
              </Link>
            );
          })}

          {counts.unreadMessages > 0 && (
            <Card className="flex items-center gap-3 border-primary/40 bg-primary/5 sm:col-span-2 lg:col-span-3">
              <MailWarning size={20} className="text-primary" />
              <p className="text-sm text-foreground">
                You have <strong>{counts.unreadMessages}</strong> unread contact{" "}
                {counts.unreadMessages === 1 ? "message" : "messages"}.{" "}
                <Link href="/admin/dashboard/messages" className="font-medium text-primary underline">
                  View messages
                </Link>
              </p>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}
