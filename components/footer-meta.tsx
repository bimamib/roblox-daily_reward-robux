"use client";

import { useEffect, useState } from "react";

const timeFormatter = new Intl.DateTimeFormat("en-GB", {
  hour: "2-digit",
  minute: "2-digit",
  second: "2-digit",
  hourCycle: "h23",
});

function timeZoneLabel(date: Date) {
  return (
    new Intl.DateTimeFormat("id-ID", { timeZoneName: "short" })
      .formatToParts(date)
      .find((part) => part.type === "timeZoneName")?.value ?? ""
  );
}

/**
 * Baris hak cipta + jam yang berjalan.
 *  - Tahun diambil dari tanggal saat ini, jadi berganti otomatis tiap tahun.
 *  - Jam memakai zona waktu perangkat pengguna dan diperbarui tiap detik
 *    (diselaraskan ke pergantian detik agar tidak melompat).
 *  - Sebelum komponen tampil di browser, jam menampilkan "--:--:--" agar
 *    HTML server dan browser selalu sama (tanpa error hydration).
 */
export function FooterMeta() {
  const [now, setNow] = useState<Date | null>(null);

  useEffect(() => {
    let timer = 0;

    function tick() {
      setNow(new Date());
      timer = window.setTimeout(tick, 1000 - (Date.now() % 1000));
    }

    tick();

    return () => window.clearTimeout(timer);
  }, []);

  return (
    <div className="mt-4 border-t border-[color:var(--border)] pt-4">
      <p>
        &#169;{" "}
        <span suppressHydrationWarning>
          {(now ?? new Date()).getFullYear()}
        </span>{" "}
        Meyo
      </p>

      <p
        className="mt-1 tabular-nums"
        aria-label="Waktu saat ini"
        suppressHydrationWarning
      >
        {now
          ? `${timeFormatter.format(now)} ${timeZoneLabel(now)}`
          : "--:--:--"}
      </p>
    </div>
  );
}
