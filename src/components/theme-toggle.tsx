"use client";

import { useEffect, useState } from "react";
import { useTheme } from "@/hooks/use-theme";
import { MoonIcon, SunIcon } from "@/components/icons";

export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Avoid hydration mismatch: render a stable placeholder until mounted.
  useEffect(() => setMounted(true), []);

  const isDark = theme === "dark";
  const label = `Switch to ${isDark ? "light" : "dark"} theme`;

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className="btn btn-quiet btn-icon"
      aria-label={label}
      title={label}
    >
      <span className="relative block h-[18px] w-[18px]">
        {mounted && (
          <>
            <SunIcon
              className={`absolute inset-0 h-[18px] w-[18px] transition-[transform,opacity] duration-300 ${
                isDark ? "rotate-0 scale-100 opacity-100" : "-rotate-90 scale-50 opacity-0"
              }`}
            />
            <MoonIcon
              className={`absolute inset-0 h-[18px] w-[18px] transition-[transform,opacity] duration-300 ${
                isDark ? "rotate-90 scale-50 opacity-0" : "rotate-0 scale-100 opacity-100"
              }`}
            />
          </>
        )}
      </span>
    </button>
  );
}
