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

/**
 * Ketiga warna tombol memakai "geometri" yang sama persis supaya terlihat
 * sama tebal saat berdampingan:
 *   - border 1px (warna turunan tombol, tidak lebih gelap dari isinya)
 *   - highlight tipis di atas   : inset 0 1px 0
 *   - bayangan tipis di bawah   : 0 1px 2px  (tanpa glow besar)
 *   - saat ditekan              : inset 0 2px 3px
 */
const skeuoTone: Record<ButtonTone, string> = {
  primary:
    "border border-[#6d4aff] bg-[linear-gradient(180deg,#a287ff_0%,#6d4aff_100%)] text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.4),0_1px_2px_rgba(76,45,200,0.3)] transition-[filter,box-shadow] hover:brightness-110 active:brightness-95 active:shadow-[inset_0_2px_3px_rgba(46,16,140,0.4)]",
  secondary:
    "border border-[color:var(--input-border)] bg-[linear-gradient(180deg,var(--btn2-top)_0%,var(--btn2-bottom)_100%)] text-[color:var(--text)] shadow-[inset_0_1px_0_var(--btn-hl),0_1px_2px_var(--btn-shadow)] transition-[filter,box-shadow,border-color] hover:border-[color:var(--accent)] hover:brightness-105 active:shadow-[inset_0_2px_3px_var(--btn-shadow)]",
  danger:
    "border border-[#dc2626] bg-[linear-gradient(180deg,#f87171_0%,#dc2626_100%)] text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.35),0_1px_2px_rgba(153,27,27,0.3)] transition-[filter,box-shadow] hover:brightness-110 active:brightness-95 active:shadow-[inset_0_2px_3px_rgba(127,29,29,0.45)]",
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
 * FOCUS RING SERAGAM
 *
 * Cincin fokus (outline 2px, jarak 2px, border field tidak berubah) digambar
 * SATU kali oleh aturan global di app/globals.css, berdasarkan class penanda:
 *
 *   field-ring         input & trigger Select (fokus keyboard / daftar terbuka)
 *   field-ring-within  kotak pembungkus (textarea, InputGroup): fokus ada di anak
 *   field-ring-none    elemen di DALAM kotak pembungkus: tanpa cincin sendiri
 *   field-ring-option  pilihan dalam daftar (cincin di sisi dalam)
 *
 * Kenapa tidak lewat utility Tailwind: HeroUI menggambar ring fokus bawaannya
 * dengan variabel ring Tailwind di dalam box-shadow. `shadow-none` TIDAK
 * mereset variabel itu, sehingga ring bawaan (tebal 3px, menempel di border)
 * tetap muncul. `ring-0 ring-offset-0` di bawah mereset variabelnya, dan
 * aturan global memastikan hanya satu cincin yang tampil.
 */

const fieldBase = `field-ring w-full min-w-0 rounded-xl border border-[color:var(--input-border)] bg-[color:var(--input-bg)] px-3 text-sm text-[color:var(--text)] shadow-none ring-0 ring-offset-0 outline-none transition-colors`;

/** <Input> HeroUI atau <input> biasa. */
export const inputClass = `h-9 ${fieldBase}`;

/**
 * <InputGroup> HeroUI (kolom + tombol/ikon di dalamnya, mis. show password).
 * Kotak luar membawa border, background, dan focus ring (lewat focus-within);
 * <InputGroup.Input> di dalamnya dibuat polos.
 */
export const inputGroupClass =
  "field-ring-within flex h-9 w-full min-w-0 items-center rounded-xl border border-[color:var(--input-border)] bg-[color:var(--input-bg)] text-sm text-[color:var(--text)] shadow-none ring-0 ring-offset-0 outline-none transition-colors";

/**
 * `rounded-[inherit]` penting: saat password manager mengisi kolom, Chrome
 * mengecat lapisan autofill persegi di seluruh kotak <input>. Tanpa sudut
 * membulat yang sama dengan kotak induknya, sudut persegi itu menimpa border
 * melengkung di kiri atas/bawah dan menimbulkan garis ganda tipis.
 */
export const inputGroupInputClass =
  "field-ring-none h-full min-w-0 flex-1 rounded-[inherit] border-0 bg-transparent px-3 text-sm shadow-none ring-0 ring-offset-0 outline-none";

/**
 * <Select.Trigger> HeroUI (tinggi sama dengan input).
 *
 * Teks di dalam trigger dipaksa 14px / line-height 20px dan dipusatkan secara
 * vertikal (items-center, tanpa padding atas-bawah). Tanpa ini, di layar kecil
 * teks nilai bawaan HeroUI (16px) membuat teks turun dari tengah.
 */
export const selectTriggerClass = `flex h-9 items-center justify-between gap-2 py-0 leading-5 [&_*]:py-0 [&_*]:text-sm [&_*]:leading-5 ${fieldBase}`;

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
  "field-ring-within flex w-full min-w-0 rounded-xl border border-[color:var(--input-border)] bg-[color:var(--input-bg)] p-1 ring-0 ring-offset-0 transition-colors";

export const textareaClass =
  "field-ring-none block min-h-24 w-full min-w-0 resize-y rounded-lg border-0 bg-transparent px-2 py-1.5 text-sm text-[color:var(--text)] shadow-none outline-none ring-0 ring-offset-0 [&::-webkit-scrollbar-track]:bg-transparent!";

/** <Select.Popover>, <ListBox>, dan <ListBox.Item>. */
export const popoverClass = "rounded-xl p-1 shadow-lg";
export const listBoxClass = "max-h-64 overflow-y-auto outline-none";
/**
 * Pilihan di dalam daftar: cincin fokus keyboard digambar di sisi DALAM
 * (offset negatif) karena daftar memotong apa pun yang keluar dari kotaknya.
 */
export const optionClass =
  "field-ring-option min-h-9 rounded-lg px-3 text-sm outline-none";

/* ------------------------------------------------------------------ */
/* Kartu                                                               */
/* ------------------------------------------------------------------ */

/** Kartu form (login & register). */
export const cardClass =
  "rounded-3xl border border-[color:var(--border)] bg-[color:var(--surface)] p-6 sm:p-7";
