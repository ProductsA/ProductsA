"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { cn } from "@/lib/utils";
import { useTheme } from "@/components/theme-provider";
import {
  LayoutDashboard,
  Package,
  FolderTree,
  Users,
  FileSpreadsheet,
  Settings2,
  Image,
  Settings,
  Globe,
  UserCircle,
  Shield,
  LogOut,
  Menu,
  X,
  TrendingUp,
  Sun,
  Moon,
  Sheet,
} from "lucide-react";

interface AdminInfo {
  name: string;
  email: string;
}

const navItems = [
  { label: "Dashboard", href: "/admin", icon: LayoutDashboard, color: "blue" },
  { label: "Products", href: "/admin/products", icon: Package, color: "emerald" },
  { label: "Categories", href: "/admin/categories", icon: FolderTree, color: "amber" },
  { label: "Customers/Leads", href: "/admin/customers", icon: Users, color: "violet" },
  { label: "Customer Sheet", href: "/admin/customers/sheet", icon: FileSpreadsheet, color: "cyan" },
  { label: "Analytics", href: "/admin/analytics", icon: TrendingUp, color: "rose" },
  { label: "Custom Fields", href: "/admin/custom-fields", icon: Settings2, color: "pink" },
  { label: "Media", href: "/admin/media", icon: Image, color: "purple" },
  { label: "Google Sheets", href: "/admin/google-sheets", icon: Sheet, color: "teal" },
  { label: "Settings", href: "/admin/settings", icon: Settings, color: "orange" },
  { label: "Domain", href: "/admin/settings/domain", icon: Globe, color: "sky" },
  { label: "Profile", href: "/admin/profile", icon: UserCircle, color: "indigo" },
  { label: "Security", href: "/admin/settings/security", icon: Shield, color: "red" },
];

const colorMap: Record<string, { active: string; hover: string; icon: string; dot: string }> = {
  blue:    { active: "bg-blue-500/10 text-blue-600 dark:text-blue-400",    hover: "hover:bg-blue-500/5",    icon: "text-blue-500 dark:text-blue-400",    dot: "bg-blue-500" },
  emerald: { active: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400", hover: "hover:bg-emerald-500/5", icon: "text-emerald-500 dark:text-emerald-400", dot: "bg-emerald-500" },
  amber:   { active: "bg-amber-500/10 text-amber-600 dark:text-amber-400",   hover: "hover:bg-amber-500/5",   icon: "text-amber-500 dark:text-amber-400",   dot: "bg-amber-500" },
  violet:  { active: "bg-violet-500/10 text-violet-600 dark:text-violet-400", hover: "hover:bg-violet-500/5",  icon: "text-violet-500 dark:text-violet-400",  dot: "bg-violet-500" },
  cyan:    { active: "bg-cyan-500/10 text-cyan-600 dark:text-cyan-400",     hover: "hover:bg-cyan-500/5",    icon: "text-cyan-500 dark:text-cyan-400",     dot: "bg-cyan-500" },
  rose:    { active: "bg-rose-500/10 text-rose-600 dark:text-rose-400",     hover: "hover:bg-rose-500/5",    icon: "text-rose-500 dark:text-rose-400",     dot: "bg-rose-500" },
  pink:    { active: "bg-pink-500/10 text-pink-600 dark:text-pink-400",     hover: "hover:bg-pink-500/5",    icon: "text-pink-500 dark:text-pink-400",     dot: "bg-pink-500" },
  purple:  { active: "bg-purple-500/10 text-purple-600 dark:text-purple-400", hover: "hover:bg-purple-500/5",  icon: "text-purple-500 dark:text-purple-400",  dot: "bg-purple-500" },
  teal:    { active: "bg-teal-500/10 text-teal-600 dark:text-teal-400",     hover: "hover:bg-teal-500/5",    icon: "text-teal-500 dark:text-teal-400",     dot: "bg-teal-500" },
  orange:  { active: "bg-orange-500/10 text-orange-600 dark:text-orange-400", hover: "hover:bg-orange-500/5",  icon: "text-orange-500 dark:text-orange-400",  dot: "bg-orange-500" },
  sky:     { active: "bg-sky-500/10 text-sky-600 dark:text-sky-400",       hover: "hover:bg-sky-500/5",     icon: "text-sky-500 dark:text-sky-400",       dot: "bg-sky-500" },
  indigo:  { active: "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400", hover: "hover:bg-indigo-500/5",  icon: "text-indigo-500 dark:text-indigo-400",  dot: "bg-indigo-500" },
  red:     { active: "bg-red-500/10 text-red-600 dark:text-red-400",       hover: "hover:bg-red-500/5",     icon: "text-red-500 dark:text-red-400",       dot: "bg-red-500" },
};

export function Sidebar({ admin }: { admin: AdminInfo }) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const { theme, setTheme } = useTheme();
  const [siteName, setSiteName] = useState("Souq");
  const navRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch("/api/settings")
      .then((r) => r.json())
      .then((data) => {
        if (data.website_name) setSiteName(data.website_name);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (mobileOpen) {
      const activeEl = navRef.current?.querySelector("[data-active='true']");
      if (activeEl) {
        activeEl.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    }
  }, [mobileOpen, pathname]);

  function cycleTheme() {
    setTheme(theme === "light" ? "dark" : "light");
  }

  function isActive(href: string) {
    if (href === "/admin") return pathname === "/admin";
    const exact = navItems.filter((item) =>
      item.href === "/admin" ? pathname === "/admin" : pathname.startsWith(item.href)
    );
    const longest = exact.sort((a, b) => b.href.length - a.href.length)[0];
    return longest?.href === href;
  }

  function NavContent() {
    return (
      <>
        <div className="flex items-center gap-2.5 px-5 py-5 border-b">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-primary-foreground text-sm font-bold transition-transform duration-300 hover:scale-110 hover:rotate-3">
            {siteName.charAt(0).toUpperCase()}
          </div>
          <span className="font-semibold text-lg tracking-tight">{siteName} Admin</span>
        </div>

        <nav ref={navRef} className="flex-1 overflow-y-auto px-3 py-4 space-y-1 scroll-smooth" style={{ scrollBehavior: "smooth" }}>
          {navItems.map((item, index) => {
            const active = isActive(item.href);
            const colors = colorMap[item.color];
            return (
              <Link
                key={item.href}
                href={item.href}
                data-active={active}
                onClick={() => setMobileOpen(false)}
                style={{ animationDelay: `${index * 30}ms` }}
                className={cn(
                  "group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium",
                  "transition-all duration-200 ease-out",
                  "animate-[slide-in-left_0.3s_ease-out_both]",
                  active
                    ? cn(colors?.active, "shadow-sm")
                    : cn("text-muted-foreground", colors?.hover, "hover:text-foreground")
                )}
              >
                {active && (
                  <span className={cn(
                    "absolute left-0 top-1/2 -translate-y-1/2 h-5 w-[3px] rounded-full transition-all duration-300",
                    colors?.dot
                  )} />
                )}
                <item.icon className={cn(
                  "h-4 w-4 shrink-0 transition-all duration-200",
                  active ? cn(colors?.icon, "scale-110") : "group-hover:scale-110"
                )} />
                <span className="truncate">{item.label}</span>
                {active && (
                  <span className={cn(
                    "ml-auto h-1.5 w-1.5 rounded-full animate-pulse",
                    colors?.dot
                  )} />
                )}
              </Link>
            );
          })}
        </nav>

        <div className="border-t px-4 py-4 space-y-3">
          <div className="flex items-center gap-3 px-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-primary text-sm font-semibold transition-transform duration-300 hover:scale-110">
              {admin.name.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{admin.name}</p>
              <p className="text-xs text-muted-foreground truncate">{admin.email}</p>
            </div>
          </div>
          <div className="flex gap-1">
            <button
              onClick={cycleTheme}
              className="flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-all duration-200 hover:scale-[1.02]"
              title={`Theme: ${theme}`}
            >
              {theme === "dark" ? (
                <Sun className="h-4 w-4 transition-transform duration-300 hover:rotate-45" />
              ) : (
                <Moon className="h-4 w-4 transition-transform duration-300 hover:-rotate-12" />
              )}
              {theme.charAt(0).toUpperCase() + theme.slice(1)}
            </button>
            <button
              onClick={() => signOut({ callbackUrl: "/admin/login" })}
              className="flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-red-500/10 hover:text-red-500 transition-all duration-200 hover:scale-[1.02]"
            >
              <LogOut className="h-4 w-4" />
              Logout
            </button>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <button
        onClick={() => setMobileOpen(true)}
        className="fixed top-4 left-4 z-50 flex h-10 w-10 items-center justify-center rounded-xl border bg-background shadow-sm lg:hidden transition-all duration-200 hover:scale-105 active:scale-95"
      >
        <Menu className="h-5 w-5" />
      </button>

      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity duration-300"
            onClick={() => setMobileOpen(false)}
          />
          <div className="fixed inset-y-0 left-0 w-72 bg-background border-r flex flex-col animate-slide-in-left">
            <button
              onClick={() => setMobileOpen(false)}
              className="absolute top-4 right-4 flex h-8 w-8 items-center justify-center rounded-xl hover:bg-muted transition-all duration-200 hover:rotate-90"
            >
              <X className="h-4 w-4" />
            </button>
            <NavContent />
          </div>
        </div>
      )}

      <aside className="hidden lg:flex lg:flex-col lg:w-64 lg:border-r bg-background h-screen sticky top-0 transition-colors">
        <NavContent />
      </aside>
    </>
  );
}
