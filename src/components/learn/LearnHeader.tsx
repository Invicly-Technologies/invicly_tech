"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { CircleHelp, Newspaper, LayoutDashboard, LogOut, Map, Menu, Plus, X } from "lucide-react";
import { LogoMark } from "@/components/ui/Logo";
import { logout } from "@/app/learn/actions";
import { ThemeToggle } from "@/components/learn/ThemeToggle";
import { BlogSearch } from "@/components/learn/BlogSearch";
import { clearSessionCache, useLearnSession } from "@/components/learn/session";
import { cn } from "@/lib/cn";

export function LearnHeader() {
  const { user, loaded } = useLearnSession();
  const afterLogout = () => {
    clearSessionCache();
    setTimeout(() => window.dispatchEvent(new Event("il-session-refresh")), 900);
  };
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  useEffect(() => setOpen(false), [pathname]);

  const links = [
    { href: "/learn/", label: "Paths", icon: Map, exact: true },
    { href: "/blog/", label: "Blog", icon: Newspaper, exact: false },
    ...(user
      ? [
          { href: "/learn/dashboard/", label: "Dashboard", icon: LayoutDashboard, exact: false },
          { href: "/learn/plans/new/", label: "New plan", icon: Plus, exact: false },
        ]
      : []),
  ];
  const active = (href: string, exact: boolean) =>
    exact ? pathname === href || pathname === href.replace(/\/$/, "") || pathname.startsWith("/learn/paths") : pathname.startsWith(href.replace(/\/$/, ""));

  return (
    <header className="sticky top-0 z-50 border-b border-fg/10 bg-ground/80 backdrop-blur-xl">
      <div className="wrap flex h-16 items-center justify-between gap-4">
        <Link href="/learn/" className="flex min-h-11 items-center gap-2.5" aria-label="Invicly Learn home">
          <LogoMark size={34} />
          <span className="font-display text-[19px] font-extrabold tracking-[-0.5px]">
            Invicly<span className="text-blue">Learn</span>
          </span>
        </Link>

        <nav aria-label="Learn" className="hidden items-center gap-1 md:flex">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              data-tour={l.label === "Paths" ? "nav-paths" : l.label === "New plan" ? "new-plan" : undefined}
              className={cn(
                "inline-flex min-h-10 items-center gap-2 rounded-full px-4 text-[14px] font-semibold transition-colors",
                active(l.href, l.exact) ? "bg-fg/10 text-fg" : "text-muted hover:text-fg",
              )}
            >
              <l.icon size={16} aria-hidden />
              {l.label}
            </Link>
          ))}
        </nav>

        <BlogSearch className="hidden min-w-0 flex-1 md:block md:max-w-[220px] lg:max-w-xs" />

        <div className="hidden items-center gap-3 md:flex">
          {user && (
            <button
              type="button"
              data-tour="tour"
              onClick={() => window.dispatchEvent(new Event("il-tour"))}
              aria-label="Take the tour"
              title="Take the tour"
              className="grid h-10 w-10 place-items-center rounded-full border border-fg/15 text-muted transition-[border-color,transform] hover:-translate-y-0.5 hover:border-blue/70 hover:text-fg"
            >
              <CircleHelp size={18} aria-hidden />
            </button>
          )}
          <ThemeToggle />
          {user ? (
            <>
              <span className="flex items-center gap-2 text-sm text-muted">
                <span className="grid h-8 w-8 place-items-center rounded-full bg-blue/20 font-bold text-blue-light" aria-hidden>
                  {user.name.slice(0, 1).toUpperCase()}
                </span>
                {user.name.split(" ")[0]}
              </span>
              <form action={logout} onSubmit={afterLogout}>
                <button className="inline-flex min-h-10 items-center gap-1.5 rounded-full px-3 text-sm font-semibold text-muted hover:text-fg" type="submit">
                  <LogOut size={15} aria-hidden /> Log out
                </button>
              </form>
            </>
          ) : !loaded ? (
            <span className="h-10 w-44" aria-hidden />
          ) : (
            <>
              <Link href="/learn/login/" className="min-h-10 px-3 py-2 text-sm font-semibold text-muted hover:text-fg">
                Log in
              </Link>
              <Link href="/learn/signup/" className="btn btn-primary btn-sm">
                Start free
              </Link>
            </>
          )}
        </div>

        <div className="flex items-center gap-2 md:hidden">
        <ThemeToggle />
        <button
          type="button"
          className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-fg/15"
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
          onClick={() => setOpen((o) => !o)}
        >
          {open ? <X size={20} /> : <Menu size={20} />}
        </button>
        </div>
      </div>

      {open && (
        <nav aria-label="Learn mobile" className="wrap flex flex-col gap-1 border-t border-fg/10 pb-5 pt-3 md:hidden">
          <BlogSearch className="mb-2" />
          {links.map((l) => (
            <Link key={l.href} href={l.href} onClick={() => setOpen(false)} className="flex min-h-12 items-center gap-3 rounded-xl px-3 font-semibold hover:bg-fg/5">
              <l.icon size={18} aria-hidden /> {l.label}
            </Link>
          ))}
          {user ? (
            <form action={logout} onSubmit={afterLogout}>
              <button type="submit" className="flex min-h-12 w-full items-center gap-3 rounded-xl px-3 font-semibold text-muted hover:bg-fg/5">
                <LogOut size={18} aria-hidden /> Log out ({user.name.split(" ")[0]})
              </button>
            </form>
          ) : (
            <div className="mt-2 flex gap-3">
              <Link href="/learn/login/" onClick={() => setOpen(false)} className="btn btn-ghost btn-sm flex-1">
                Log in
              </Link>
              <Link href="/learn/signup/" onClick={() => setOpen(false)} className="btn btn-primary btn-sm flex-1">
                Start free
              </Link>
            </div>
          )}
        </nav>
      )}
    </header>
  );
}
