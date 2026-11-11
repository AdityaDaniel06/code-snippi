"use client";

import { useCallback, useEffect, useState } from "react";

export type Theme = "light" | "dark";

/**
 * Reads/writes the app theme stored on <html data-theme>. The initial value is
 * applied by an inline script in the root layout to avoid a flash of the wrong
 * theme, so this hook just mirrors and mutates that attribute.
 */
export function useTheme() {
  const [theme, setThemeState] = useState<Theme>("dark");

  useEffect(() => {
    const el = document.documentElement;
    const read = () =>
      setThemeState((el.getAttribute("data-theme") as Theme) ?? "dark");

    read();
    const observer = new MutationObserver(read);
    observer.observe(el, {
      attributes: true,
      attributeFilter: ["data-theme"],
    });
    return () => observer.disconnect();
  }, []);

  const setTheme = useCallback((next: Theme) => {
    document.documentElement.setAttribute("data-theme", next);
    try {
      localStorage.setItem("theme", next);
    } catch {
      /* ignore storage errors */
    }
  }, []);

  const toggleTheme = useCallback(() => {
    setTheme(theme === "dark" ? "light" : "dark");
  }, [theme, setTheme]);

  return { theme, setTheme, toggleTheme };
}
