import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";

export type BadgeTone = "success" | "warning" | "neutral";

/**
 * Lencana kecil berbentuk pil dengan ikon (Verified, durasi hari, target Robux).
 *
 * Dua gaya:
 *  - `onDark`: untuk latar gelap yang tetap (banner ungu di detail map).
 *    Selalu kaca gelap + teks terang, tidak bergantung tema.
 *  - bawaan : mengikuti tema terang/gelap lewat variabel CSS --badge-*
 *    (didefinisikan di app/globals.css), dipakai di kartu map beranda.
 *
 * Komponen ini tidak memakai state, jadi aman dipakai di Server maupun
 * Client Component.
 */
const base =
  "inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold leading-none shadow-sm backdrop-blur-sm";

const themedTones: Record<BadgeTone, string> = {
  success:
    "border-[color:var(--badge-ok-bd)] bg-[color:var(--badge-ok-bg)] text-[color:var(--badge-ok-fg)]",
  warning:
    "border-[color:var(--badge-warn-bd)] bg-[color:var(--badge-warn-bg)] text-[color:var(--badge-warn-fg)]",
  neutral:
    "border-[color:var(--badge-neutral-bd)] bg-[color:var(--badge-neutral-bg)] text-[color:var(--badge-neutral-fg)]",
};

const darkTones: Record<BadgeTone, string> = {
  success: "border-emerald-300/40 bg-black/35 text-emerald-300",
  warning: "border-amber-300/40 bg-black/35 text-amber-300",
  neutral: "border-white/25 bg-black/35 text-white",
};

export function Badge({
  tone = "neutral",
  icon: Icon,
  onDark = false,
  className = "",
  children,
}: {
  tone?: BadgeTone;
  icon?: LucideIcon;
  onDark?: boolean;
  className?: string;
  children: ReactNode;
}) {
  const palette = onDark ? darkTones[tone] : themedTones[tone];

  return (
    <span className={`${base} ${palette} ${className}`.trim()}>
      {Icon && <Icon className="size-4 shrink-0" aria-hidden="true" />}
      {children}
    </span>
  );
}
