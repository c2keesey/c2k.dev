"use client";

import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";

type Theme = "dark" | "warm";

function applyTheme(theme: Theme) {
  document.documentElement.dataset.theme = theme;
  document.documentElement.style.colorScheme = theme === "warm" ? "light" : "dark";
  document.querySelectorAll<HTMLMetaElement>('meta[name="theme-color"]').forEach((meta) => {
    meta.content = theme === "warm" ? "#f1eadf" : "#09090b";
  });
}

export function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>("dark");

  useEffect(() => {
    const saved = localStorage.getItem("c2k-theme");
    const initial: Theme = saved === "warm" ? "warm" : "dark";
    applyTheme(initial);
    queueMicrotask(() => setTheme(initial));
  }, []);

  function toggle() {
    const next = theme === "dark" ? "warm" : "dark";
    setTheme(next);
    localStorage.setItem("c2k-theme", next);
    applyTheme(next);
  }

  return (
    <button className="theme-toggle" type="button" onClick={toggle} aria-label={`Switch to ${theme === "dark" ? "warm" : "dark"} theme`}>
      {theme === "dark" ? <Sun aria-hidden="true" size={17} /> : <Moon aria-hidden="true" size={17} />}
    </button>
  );
}
