/**
 * Class bersama untuk seluruh UI (Tailwind lewat className, bukan globals.css).
 *
 * Ukuran mengikuti HeroUI v3:
 *  - field  : `.input-group` = min-h-9 (36px), text-sm, px-3 (contoh "Email address")
 *  - tombol : `.button` = h-10 (mobile) / md:h-9 (desktop, 36px), text-sm, px-4
 * Di layar md ke atas, input, trigger Select, dan tombol sama-sama 36px, jadi
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

/**
 * Focus ring seperti HeroUI: garis 2px penuh berwarna aksen
 * (border 1px + ring 1px, tanpa jarak dari field).
 */
const focusRing =
  "focus-visible:border-[color:var(--accent)] focus-visible:ring-1 focus-visible:ring-[color:var(--accent)]";

const fieldBase = `w-full min-w-0 rounded-xl border border-[color:var(--input-border)] bg-[color:var(--input-bg)] px-3 text-sm text-[color:var(--text)] shadow-none outline-none transition-colors ${focusRing}`;

/** <Input> HeroUI atau <input> biasa. */
export const inputClass = `h-9 ${fieldBase}`;

/**
 * <Select.Trigger> HeroUI (tinggi sama dengan input).
 *
 * Teks di dalam trigger dipaksa 14px / line-height 20px dan dipusatkan secara
 * vertikal (items-center, tanpa padding atas-bawah). Tanpa ini, di layar kecil
 * teks nilai bawaan HeroUI (16px) membuat teks turun dari tengah.
 */
export const selectTriggerClass = `flex h-9 items-center justify-between gap-2 py-0 leading-5 aria-expanded:border-[color:var(--accent)] aria-expanded:ring-1 aria-expanded:ring-[color:var(--accent)] [&_*]:py-0 [&_*]:text-sm [&_*]:leading-5 ${fieldBase}`;

/**
 * Textarea dibuat dari dua bagian:
 *  - textareaShellClass : kotak berborder (membawa focus ring via focus-within)
 *  - textareaClass      : <textarea>/<TextArea> polos di dalam kotak itu
 * Padding kotak (p-1) membuat scrollbar berada DI DALAM border, tidak
 * menyentuh sudut membulat — sama seperti scrollbar pada daftar Hari reward.
 *
 * Contoh:
 *   <div className={textareaShellClass}>
 *     <TextArea className={textareaClass} />
 *   </div>
 */
export const textareaShellClass =
  "flex w-full min-w-0 rounded-xl border border-[color:var(--input-border)] bg-[color:var(--input-bg)] p-1 transition-colors focus-within:border-[color:var(--accent)] focus-within:ring-1 focus-within:ring-[color:var(--accent)]";

export const textareaClass =
  "block min-h-24 w-full min-w-0 resize-y rounded-lg border-0 bg-transparent px-2 py-1.5 text-sm text-[color:var(--text)] shadow-none outline-none ring-0 [&::-webkit-scrollbar-track]:bg-transparent!";

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
