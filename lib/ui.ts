/**
 * Class bersama untuk seluruh UI (Tailwind lewat className, bukan globals.css).
 *
 * Ukuran mengikuti HeroUI v3:
 *  - tombol : `.button` = h-10 (mobile) / md:h-9 (desktop), text-sm, px-4
 *  - field  : h-10 / md:h-9, text-sm, px-3
 * Input, trigger Select, dan tombol memakai tinggi yang sama, jadi selalu
 * sejajar saat berdampingan (mis. baris pencarian di beranda).
 *
 * Gaya HeroUI berada di `@layer components`, sedangkan utility Tailwind di
 * `@layer utilities`, sehingga class di bawah otomatis menimpa gaya bawaan.
 */

/* ------------------------------------------------------------------ */
/* Tombol skeuomorphic                                                 */
/* Gradien + highlight tipis di atas + bayangan lembut berwarna.       */
/* Border memakai warna turunan dari warna tombol (bukan hitam).       */
/* ------------------------------------------------------------------ */

export type ButtonTone = "primary" | "secondary" | "danger";
export type ButtonSize = "sm" | "md" | "lg";

const skeuoTone: Record<ButtonTone, string> = {
  primary:
    "border border-[#5b3de0] bg-[linear-gradient(180deg,#a287ff_0%,#6d4aff_100%)] text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.4),0_1px_2px_rgba(91,61,224,0.4),0_6px_14px_-4px_rgba(109,74,255,0.55)] transition-[filter,box-shadow] hover:brightness-110 active:brightness-95 active:shadow-[inset_0_2px_4px_rgba(46,16,140,0.45)]",
  secondary:
    "border border-[color:var(--input-border)] bg-[linear-gradient(180deg,var(--btn2-top)_0%,var(--btn2-bottom)_100%)] text-[color:var(--text)] shadow-[inset_0_1px_0_var(--btn-hl),0_1px_2px_var(--btn-shadow)] transition-[filter,box-shadow,border-color] hover:border-[color:var(--accent)] hover:brightness-105 active:shadow-[inset_0_2px_3px_var(--btn-shadow)]",
  danger:
    "border border-[#b91c1c] bg-[linear-gradient(180deg,#f87171_0%,#dc2626_100%)] text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.35),0_1px_2px_rgba(185,28,28,0.4),0_6px_14px_-4px_rgba(220,38,38,0.5)] transition-[filter,box-shadow] hover:brightness-110 active:brightness-95 active:shadow-[inset_0_2px_4px_rgba(127,29,29,0.5)]",
};

/**
 * Untuk komponen <Button> HeroUI:
 *   <Button variant="primary" className={skeuoButton("primary")}>
 */
export function skeuoButton(tone: ButtonTone = "primary") {
  return skeuoTone[tone];
}

/**
 * Untuk <Link> / <a> yang tampil seperti tombol (aman dipakai di Server
 * Component). Memakai class BEM bawaan HeroUI (.button, .button--primary, ...)
 * ditambah gaya skeuomorphic.
 */
export function linkButton(
  tone: ButtonTone = "primary",
  size: ButtonSize = "md",
) {
  return `button button--${tone} button--${size} ${skeuoTone[tone]}`;
}

/* ------------------------------------------------------------------ */
/* Field                                                               */
/* ------------------------------------------------------------------ */

const fieldBase =
  "w-full min-w-0 rounded-xl border border-[color:var(--input-border)] bg-[color:var(--input-bg)] px-3 text-sm text-[color:var(--text)] shadow-none outline-none transition-colors focus-visible:border-[color:var(--accent)] focus-visible:ring-2 focus-visible:ring-[color:var(--accent-soft)]";

/** <Input> HeroUI atau <input> biasa. */
export const inputClass = `h-10 md:h-9 ${fieldBase}`;

/** <Select.Trigger> HeroUI (tinggi sama dengan input). */
export const selectTriggerClass = `h-10 md:h-9 aria-expanded:border-[color:var(--accent)] ${fieldBase}`;

/** <TextArea> HeroUI atau <textarea> biasa. */
export const textareaClass = `min-h-24 resize-y py-2 ${fieldBase}`;

/** <Select.Popover>, <ListBox>, dan <ListBox.Item>. */
export const popoverClass = "rounded-xl p-1 shadow-lg";
export const listBoxClass = "max-h-64 overflow-y-auto outline-none";
export const optionClass = "min-h-9 rounded-lg px-3 text-sm";

/* ------------------------------------------------------------------ */
/* Kartu                                                               */
/* ------------------------------------------------------------------ */

/** Kartu form (login & register). */
export const cardClass =
  "rounded-3xl border border-[color:var(--border)] bg-[color:var(--surface)] p-6 sm:p-7";
