"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { WOW_THEMES } from "@/lib/themes";

const STORAGE_KEY = "gamerphile-theme";

interface ThemeContextValue {
  theme: string;
  setTheme: (id: string) => void;
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState("default");

  // On mount, read persisted theme
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored && WOW_THEMES.some((t) => t.id === stored)) {
      setThemeState(stored);
    }
  }, []);

  // Apply CSS class to <html> whenever theme changes
  useEffect(() => {
    const html = document.documentElement;
    // Remove all theme-* classes
    const toRemove = Array.from(html.classList).filter((c) =>
      c.startsWith("theme-")
    );
    toRemove.forEach((c) => html.classList.remove(c));

    const entry = WOW_THEMES.find((t) => t.id === theme);
    if (entry?.cssClass) {
      html.classList.add(entry.cssClass);
    }
  }, [theme]);

  const setTheme = useCallback((id: string) => {
    setThemeState(id);
    localStorage.setItem(STORAGE_KEY, id);
  }, []);

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return ctx;
}
