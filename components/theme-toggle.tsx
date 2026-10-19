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

  function applyTheme(nextTheme: Theme) {
    const root = document.documentElement;
    root.classList.toggle("light", nextTheme === "light");
    root.dataset.theme = nextTheme;
    root.style.colorScheme = nextTheme;
    window.localStorage.setItem("rbxdaily-theme", nextTheme);
  }

  function toggleTheme() {
    const nextTheme: Theme = theme === "dark" ? "light" : "dark";
    applyTheme(nextTheme);
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
