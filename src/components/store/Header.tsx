"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Menu, X, ShoppingCart, Search, Sun, Moon, HelpCircle, Phone } from "lucide-react";
import { SearchBar } from "./SearchBar";
import { useTheme } from "@/components/theme-provider";

interface HeaderProps {
  siteName: string;
}

export function Header({ siteName }: HeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { theme, setTheme } = useTheme();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const navLinks = [
    { href: "/", label: "Accueil" },
    { href: "/products", label: "Produits" },
    { href: "/categories", label: "Categories" },
    { href: "/help/how-to-order", label: "Aide", icon: HelpCircle },
  ];

  function cycleTheme() {
    setTheme(theme === "light" ? "dark" : "light");
  }

  return (
    <header
      className={`sticky top-0 z-50 transition-all duration-300 ${
        scrolled
          ? "glass border-b shadow-sm"
          : "bg-background/80 border-b border-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 md:h-18">
          <Link href="/" className="flex items-center gap-2.5 font-bold text-xl group">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-primary-foreground transition-transform group-hover:scale-110 group-hover:rotate-3">
              <ShoppingCart className="h-5 w-5" />
            </div>
            <span className="gradient-text">{siteName}</span>
          </Link>

          <nav className="hidden md:flex items-center gap-1 bg-muted/50 rounded-full px-2 py-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="relative px-4 py-1.5 text-sm font-medium text-muted-foreground hover:text-foreground transition-all rounded-full hover:bg-background inline-flex items-center gap-1.5"
              >
                {link.icon && <link.icon className="h-3.5 w-3.5" />}
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="hidden md:flex items-center gap-2">
            <SearchBar className="w-56" placeholder="Rechercher..." />
            <button
              onClick={cycleTheme}
              className="p-2.5 rounded-full hover:bg-muted text-muted-foreground hover:text-foreground transition-all hover:scale-105"
              title={`Theme: ${theme}`}
            >
              {theme === "dark" ? (
                <Sun className="h-4 w-4" />
              ) : (
                <Moon className="h-4 w-4" />
              )}
            </button>
          </div>

          <div className="flex items-center gap-1 md:hidden">
            <button
              onClick={() => setSearchOpen(!searchOpen)}
              className="p-2.5 rounded-full hover:bg-muted transition-colors text-muted-foreground"
            >
              <Search className="h-4 w-4" />
            </button>
            <button
              onClick={cycleTheme}
              className="p-2.5 rounded-full hover:bg-muted transition-colors text-muted-foreground"
              title={`Theme: ${theme}`}
            >
              {theme === "dark" ? (
                <Sun className="h-4 w-4" />
              ) : (
                <Moon className="h-4 w-4" />
              )}
            </button>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2.5 rounded-full hover:bg-muted transition-colors text-muted-foreground"
            >
              {mobileMenuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
            </button>
          </div>
        </div>

        {searchOpen && (
          <div className="md:hidden pb-3 animate-slide-down">
            <SearchBar placeholder="Rechercher..." />
          </div>
        )}

        {mobileMenuOpen && (
          <div className="md:hidden pb-4 border-t animate-slide-down">
            <nav className="flex flex-col gap-1 pt-3">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="px-4 py-2.5 rounded-xl text-sm font-medium hover:bg-muted transition-colors inline-flex items-center gap-2"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {link.icon && <link.icon className="h-4 w-4" />}
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}
