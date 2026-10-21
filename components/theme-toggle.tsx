"use client";

import { Moon, Sun } from "lucide-react";

type Theme = "dark" | "light";

/**
 * Mengganti tema TANPA transisi.
 *
 * Penyebab bug "layar abu-abu / kedip" sebelumnya: tiap elemen punya
 * `transition` warna sendiri (globals.css + HeroUI), sehingga saat tema
 * berganti, background / border / teks berubah tidak serempak dan
 * terlihat frame abu-abu di tengah. Solusinya: matikan semua transisi
 * selama class `theme-switching` aktif, paksa browser menghitung ulang
 * style, lalu lepas class tersebut setelah frame berikutnya.
 */
function applyTheme(nextTheme: Theme) {
  const root = document.documentElement;

  root.classList.add("theme-switching");

  root.classList.toggle("light", nextTheme === "light");
  root.dataset.theme = nextTheme;
  root.style.colorScheme = nextTheme;

  try {
    window.localStorage.setItem("rbxdaily-theme", nextTheme);
  } catch {
    // localStorage bisa dinonaktifkan; tema tetap berganti untuk sesi ini.
  }

  // Paksa reflow supaya style baru dihitung saat transisi masih mati.
  void root.offsetHeight;

  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      root.classList.remove("theme-switching");
    });
  });
}

export function ThemeToggle() {
  function toggleTheme() {
    const isLight = document.documentElement.classList.contains("light");
    applyTheme(isLight ? "dark" : "light");
  }

  // Ikon ditentukan CSS (html.light), bukan state React, sehingga tidak ada
  // ikon yang salah / kedip sebelum hydration selesai.
  return (
    <button
      type="button"
      className="nav-icon-btn nav-icon-btn--outline"
      aria-label="Ubah tema"
      title="Ubah tema"
      onClick={toggleTheme}
    >
      <Sun size={18} className="theme-icon-sun" aria-hidden="true" />
      <Moon size={18} className="theme-icon-moon" aria-hidden="true" />
    </button>
  );
}
