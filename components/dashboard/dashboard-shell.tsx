"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import type { LucideIcon } from "lucide-react";
import {
  LogOut,
  LayoutDashboard,
  FileText,
  History,
  Users,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "@/components/theme/theme-toggle";

type NavItem = {
  href: string;
  label: string;
  /** Shorter label for the mobile tab bar (falls back to `label`). */
  mobileLabel?: string;
  icon: LucideIcon;
  /** Render as the raised center action on the mobile tab bar. */
  emphasis?: boolean;
};

export type ShellVariant = "koas" | "pasien" | "admin";

/* Nav config lives inside this client module so icon components never have to
   cross the server → client boundary (Next 16 rejects non-serializable props). */
const NAV_ITEMS: Record<ShellVariant, NavItem[]> = {
  koas: [{ href: "/koas/dashboard", label: "Dashboard", icon: LayoutDashboard }],
  admin: [
    { href: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
    {
      href: "/admin/users",
      label: "Kelola User",
      mobileLabel: "User",
      icon: Users,
    },
  ],
  pasien: [
    { href: "/pasien/dashboard", label: "Beranda", icon: LayoutDashboard },
    {
      href: "/pasien/skrining",
      label: "Skrining Baru",
      mobileLabel: "Skrining",
      icon: FileText,
      emphasis: true,
    },
    { href: "/pasien/riwayat", label: "Riwayat", icon: History },
  ],
};

type ShellUser = {
  name: string;
  meta?: string;
  role?: string;
};

function useIsActive() {
  const pathname = usePathname();
  return (href: string) =>
    pathname === href || pathname.startsWith(href + "/");
}

function Avatar({ name, className }: { name: string; className?: string }) {
  return (
    <div
      className={cn(
        "flex items-center justify-center rounded-full bg-gradient-to-br from-primary to-secondary font-semibold text-primary-foreground ring-2 ring-card",
        className
      )}
    >
      {name?.charAt(0).toUpperCase()}
    </div>
  );
}

export function DashboardShell({
  variant,
  subtitle,
  user,
  logoutAction,
  children,
}: {
  variant: ShellVariant;
  subtitle: string;
  user: ShellUser;
  logoutAction: () => void;
  children: React.ReactNode;
}) {
  const isActive = useIsActive();
  const items = NAV_ITEMS[variant];

  return (
    <div className="flex h-[100dvh] w-full flex-col bg-background md:flex-row">
      {/* ===== Desktop sidebar ===== */}
      <aside className="hidden w-72 shrink-0 flex-col border-r border-border bg-sidebar md:flex">
        <div className="flex items-center gap-3 px-6 pt-6 pb-5">
          <Image
            src="/assets/logo.jpg"
            alt="DentMul"
            width={500}
            height={500}
            priority
            className="size-11 rounded-xl shadow-sm"
          />
          <div className="leading-tight">
            <span className="block text-lg font-bold tracking-tight text-primary">
              DentMul
            </span>
            <span className="text-xs font-medium text-muted-foreground">
              {subtitle}
            </span>
          </div>
        </div>

        <nav className="flex-1 space-y-1 px-4">
          <p className="px-3 pb-2 text-[11px] font-semibold tracking-wider text-muted-foreground/70 uppercase">
            Menu
          </p>
          {items.map((item) => {
            const active = isActive(item.href);
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all",
                  active
                    ? "bg-primary text-primary-foreground shadow-sm shadow-primary/25"
                    : "text-foreground/70 hover:bg-accent hover:text-accent-foreground"
                )}
              >
                <Icon
                  size={19}
                  className={cn(
                    "shrink-0 transition-transform group-hover:scale-105",
                    active ? "" : "text-muted-foreground group-hover:text-primary"
                  )}
                />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="space-y-3 border-t border-border p-4">
          <div className="flex items-center justify-between px-1">
            <span className="text-xs font-medium text-muted-foreground">
              Tampilan
            </span>
            <ThemeToggle />
          </div>

          <div className="flex items-center gap-3 rounded-xl bg-muted/60 p-2.5">
            <Avatar name={user.name} className="size-10 shrink-0 text-sm" />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-foreground">
                {user.name}
              </p>
              <p className="truncate text-xs text-muted-foreground">
                {user.meta}
              </p>
            </div>
          </div>

          <form action={logoutAction}>
            <button className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-destructive transition-colors hover:bg-destructive/10">
              <LogOut size={19} />
              <span>Keluar</span>
            </button>
          </form>
        </div>
      </aside>

      {/* ===== Main column ===== */}
      <div className="flex min-w-0 flex-1 flex-col">
        {/* Mobile top bar */}
        <header className="sticky top-0 z-30 flex items-center justify-between border-b border-border bg-card/85 px-4 py-3 backdrop-blur-lg md:hidden">
          <div className="flex items-center gap-2.5">
            <Image
              src="/assets/logo.jpg"
              alt="DentMul"
              width={500}
              height={500}
              priority
              className="size-9 rounded-lg shadow-sm"
            />
            <div className="leading-none">
              <span className="block text-base font-bold tracking-tight text-primary">
                DentMul
              </span>
              <span className="text-[11px] font-medium text-muted-foreground">
                {subtitle}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Avatar name={user.name} className="size-9 text-sm" />
          </div>
        </header>

        <main className="flex-1 overflow-y-auto scrollbar-slim pb-28 md:pb-0">
          <div className="mx-auto w-full max-w-5xl px-4 py-6 md:px-8 md:py-10">
            {children}
          </div>
        </main>
      </div>

      {/* ===== Mobile bottom tab bar ===== */}
      <MobileTabBar items={items} logoutAction={logoutAction} isActive={isActive} />
    </div>
  );
}

function MobileTabBar({
  items,
  logoutAction,
  isActive,
}: {
  items: NavItem[];
  logoutAction: () => void;
  isActive: (href: string) => boolean;
}) {
  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-0 z-40 md:hidden">
      <nav className="pointer-events-auto mx-3 mb-3 flex items-stretch justify-around rounded-2xl border border-border/70 bg-card/90 px-1.5 pt-1.5 pb-[calc(0.375rem+env(safe-area-inset-bottom,0px))] shadow-lg backdrop-blur-xl">
        {items.map((item) => {
          const active = isActive(item.href);
          const Icon = item.icon;

          if (item.emphasis) {
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? "page" : undefined}
                className="relative -mt-6 flex flex-1 flex-col items-center justify-end gap-1"
              >
                <span className="flex size-14 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-secondary text-primary-foreground shadow-lg shadow-primary/30 ring-4 ring-card transition-transform active:scale-95">
                  <Icon size={24} />
                </span>
                <span className="text-[10px] font-semibold text-primary">
                  {item.mobileLabel ?? item.label}
                </span>
              </Link>
            );
          }

          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={active ? "page" : undefined}
              className={cn(
                "relative flex flex-1 flex-col items-center gap-1 rounded-xl py-2 text-[10px] font-medium transition-colors",
                active ? "text-primary" : "text-muted-foreground"
              )}
            >
              <span
                className={cn(
                  "flex size-9 items-center justify-center rounded-xl transition-colors",
                  active ? "bg-primary/12 text-primary" : "text-muted-foreground"
                )}
              >
                <Icon size={20} className={active ? "scale-105" : undefined} />
              </span>
              <span>{item.mobileLabel ?? item.label}</span>
            </Link>
          );
        })}

        <form
          action={logoutAction}
          className="flex flex-1 flex-col items-center"
        >
          <button
            type="submit"
            className="flex flex-1 flex-col items-center gap-1 rounded-xl py-2 text-[10px] font-medium text-muted-foreground transition-colors active:text-destructive"
          >
            <span className="flex size-9 items-center justify-center rounded-xl">
              <LogOut size={20} />
            </span>
            <span>Keluar</span>
          </button>
        </form>
      </nav>
    </div>
  );
}
