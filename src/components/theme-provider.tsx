"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";

type Theme = "light" | "dark";

interface ThemeContextValue {
  theme: Theme;
  setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

const defaultTheme: ThemeContextValue = {
  theme: "light",
  setTheme: () => {},
};

export function useTheme() {
  const ctx = useContext(ThemeContext);
  return ctx ?? defaultTheme;
}

function applyTheme(theme: Theme) {
  const root = document.documentElement;
  root.classList.remove("light", "dark");
  root.classList.add(theme);
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>("light");
  const [mounted, setMounted] = useState(false);

  const setTheme = useCallback((newTheme: Theme) => {
    setThemeState(newTheme);
    localStorage.setItem("store-theme", newTheme);
    applyTheme(newTheme);

    fetch("/api/admin/theme", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ theme: newTheme }),
    }).catch(() => {});
  }, []);

  useEffect(() => {
    const saved = localStorage.getItem("store-theme") as Theme | null;
    const initial = saved || "light";
    setThemeState(initial);
    applyTheme(initial);
    setMounted(true);

    fetch("/api/admin/theme")
      .then((r) => r.json())
      .then((data) => {
        if (data.theme && (data.theme === "light" || data.theme === "dark") && data.theme !== initial) {
          setThemeState(data.theme);
          localStorage.setItem("store-theme", data.theme);
          applyTheme(data.theme);
        }
      })
      .catch(() => {});
  }, []);

  if (!mounted) {
    return <>{children}</>;
  }

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}
