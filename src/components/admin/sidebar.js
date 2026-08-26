"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import {
  LayoutDashboard,
  Sparkles,
  Info,
  Wrench,
  Package,
  Users,
  Quote,
  Mail,
  Settings,
  LogOut,
  Briefcase,
  ClipboardList,
  UserCheck,
  Crown,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "@/components/site/theme-toggle";

const LINKS = [
  { href: "/admin/dashboard", label: "Overview", icon: LayoutDashboard },
  { href: "/admin/dashboard/hero", label: "Hero section", icon: Sparkles },
  { href: "/admin/dashboard/about", label: "About page", icon: Info },
  { href: "/admin/dashboard/services", label: "Services", icon: Wrench },
  { href: "/admin/dashboard/products", label: "Products", icon: Package },
  { href: "/admin/dashboard/team", label: "Team", icon: Users },
  { href: "/admin/dashboard/testimonials", label: "Testimonials", icon: Quote },
  { href: "/admin/dashboard/jobs", label: "Job postings", icon: Briefcase },
  { href: "/admin/dashboard/applications", label: "Applications", icon: ClipboardList },
  { href: "/admin/dashboard/candidates", label: "Candidates", icon: UserCheck },
  { href: "/admin/dashboard/messages", label: "Messages", icon: Mail },
  { href: "/admin/dashboard/settings", label: "Site settings", icon: Settings },
];

const SUPER_ADMIN_LINK = { href: "/admin/dashboard/admins", label: "Admin users", icon: Crown };

export function Sidebar({ adminEmail, isSuperAdmin, open, onNavigate }) {
  const pathname = usePathname();
  const links = isSuperAdmin ? [...LINKS, SUPER_ADMIN_LINK] : LINKS;

  return (
    <aside
      className={cn(
        "fixed inset-y-0 left-0 z-50 flex h-screen w-64 shrink-0 flex-col border-r border-border bg-card transition-transform duration-200 md:sticky md:top-0 md:translate-x-0",
        open ? "translate-x-0" : "-translate-x-full"
      )}
    >
      <div className="flex items-center justify-between border-b border-border px-6 py-5">
        <div>
          <p className="text-sm font-semibold text-foreground">Invicly Technologies</p>
          <p className="mt-0.5 text-xs text-muted-foreground">Admin dashboard</p>
        </div>
        <ThemeToggle className="h-9 w-9" />
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto p-3">
        {links.map((link) => {
          const active = pathname === link.href;
          const Icon = link.icon;
          return (
            <Link
              key={link.href}
              href={link.href}
              onClick={onNavigate}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                active ? "bg-primary/10 text-primary" : "text-foreground/80 hover:bg-muted"
              )}
            >
              <Icon size={17} />
              {link.label}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-border p-3">
        <p className="truncate px-3 py-1 text-xs text-muted-foreground">{adminEmail}</p>
        <button
          onClick={() => signOut({ callbackUrl: "/admin/login" })}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-foreground/80 hover:bg-muted"
        >
          <LogOut size={17} />
          Sign out
        </button>
      </div>
    </aside>
  );
}
