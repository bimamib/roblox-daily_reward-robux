"use client";

import { useEffect, useState } from "react";
import { Button } from "@heroui/react";
import { Moon, Sun } from "lucide-react";

type Theme = "dark" | "light";

export function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>("dark");
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const saved = window.localStorage.getItem("rbxdaily-theme");
    const nextTheme: Theme = saved === "light" ? "light" : "dark";
    applyTheme(nextTheme);
    setTheme(nextTheme);
    setReady(true);
  }, []);

  function applyTheme(nextTheme: Theme, animate = false) {
    const root = document.documentElement;

    if (animate) {
      // Enable color transitions only for the short theme-change window.
      root.classList.remove("theme-transition");
      void root.offsetWidth;
      root.classList.add("theme-transition");
      window.setTimeout(() => root.classList.remove("theme-transition"), 280);
    }

    root.classList.toggle("light", nextTheme === "light");
    root.dataset.theme = nextTheme;
    root.style.colorScheme = nextTheme;
    window.localStorage.setItem("rbxdaily-theme", nextTheme);
  }

  function toggleTheme() {
    const nextTheme: Theme = theme === "dark" ? "light" : "dark";
    applyTheme(nextTheme, true);
    setTheme(nextTheme);
  }

  return (
    <Button
      type="button"
      isIconOnly
      variant="secondary"
      size="md"
      aria-label={
        ready
          ? `Aktifkan mode ${theme === "dark" ? "terang" : "gelap"}`
          : "Ubah tema"
      }
      onPress={toggleTheme}
      className="shrink-0 rounded-full border border-default-200 bg-content1 text-foreground"
    >
      {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
    </Button>
  );
}
