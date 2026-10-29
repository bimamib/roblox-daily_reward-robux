"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Input, Label, ListBox, Select, TextField } from "@heroui/react";
import {
  inputClass,
  listBoxClass,
  optionClass,
  popoverClass,
  selectTriggerClass,
} from "@/lib/ui";

interface HomeFiltersProps {
  search?: string;
  duration?: string;
}

const durationOptions = [
  { id: "all", label: "Semua Durasi" },
  { id: "7", label: "7 Hari" },
  { id: "14", label: "14 Hari" },
  { id: "30", label: "30 Hari" },
];

/** Jeda setelah berhenti mengetik sebelum hasil pencarian dimuat. */
const SEARCH_DELAY_MS = 350;

/**
 * Filter beranda dengan pencarian langsung:
 *  - mengetik nama map -> hasil diperbarui otomatis (setelah jeda singkat),
 *  - memilih durasi    -> hasil diperbarui seketika,
 *  - Enter tetap berfungsi.
 *
 * Filter disimpan di URL (?search=...&duration=...) memakai router.replace,
 * sehingga link bisa dibagikan dan tombol Back tidak dipenuhi riwayat ketikan.
 */
export function HomeFilters({ search = "", duration = "" }: HomeFiltersProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const [query, setQuery] = useState(search);
  const [durationKey, setDurationKey] = useState(duration || "all");
  const inputRef = useRef<HTMLInputElement>(null);

  // Nilai terbaru untuk timer debounce (menghindari closure yang basi).
  const latest = useRef({ search, durationKey });

  useEffect(() => {
    latest.current = { search, durationKey };
  });

  function go(nextQuery: string, nextDuration: string) {
    const params = new URLSearchParams();
    const trimmed = nextQuery.trim();

    if (trimmed) params.set("search", trimmed);
    if (nextDuration !== "all") params.set("duration", nextDuration);

    const qs = params.toString();

    startTransition(() => {
      router.replace(qs ? `/?${qs}` : "/", { scroll: false });
    });
  }

  // Pencarian otomatis setelah berhenti mengetik.
  useEffect(() => {
    const timer = window.setTimeout(() => {
      // Sama dengan yang sedang tampil -> tidak perlu memuat ulang.
      if (query.trim() === latest.current.search.trim()) return;

      go(query, latest.current.durationKey);
    }, SEARCH_DELAY_MS);

    return () => window.clearTimeout(timer);
    // `go` sengaja tidak masuk dependensi: hanya `query` yang memicu pencarian.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query]);

  // Ikuti perubahan dari luar (mis. tombol Back/Forward browser), tetapi
  // jangan menimpa teks yang sedang diketik.
  useEffect(() => {
    if (document.activeElement !== inputRef.current) setQuery(search);
  }, [search]);

  useEffect(() => {
    setDurationKey(duration || "all");
  }, [duration]);

  return (
    <form
      role="search"
      method="GET"
      action="/"
      className="mb-7 grid gap-4 md:grid-cols-[1fr_220px]"
      onSubmit={(event) => {
        event.preventDefault();
        go(query, durationKey);
      }}
    >
      <TextField name="search" value={query} onChange={setQuery}>
        <Label className="flex items-center gap-2">
          Cari Map
          {isPending && (
            <span
              role="status"
              aria-label="Memperbarui hasil"
              className="size-3 animate-spin rounded-full border-2 border-[color:var(--border)] border-t-[color:var(--accent)]"
            />
          )}
        </Label>
        <Input
          ref={inputRef}
          className={inputClass}
          placeholder="Nama Map atau Creator"
          autoComplete="off"
        />
      </TextField>

      <Select
        name="duration"
        selectedKey={durationKey}
        onSelectionChange={(key) => {
          if (key == null) return;

          const next = String(key);

          setDurationKey(next);
          go(query, next);
        }}
      >
        <Label>Durasi</Label>

        <Select.Trigger className={selectTriggerClass}>
          <Select.Value />
          <Select.Indicator />
        </Select.Trigger>

        <Select.Popover className={popoverClass}>
          <ListBox className={listBoxClass}>
            {durationOptions.map((option) => (
              <ListBox.Item
                key={option.id}
                id={option.id}
                textValue={option.label}
                className={optionClass}
              >
                {option.label}
              </ListBox.Item>
            ))}
          </ListBox>
        </Select.Popover>
      </Select>

      {/* Tombol kirim tersembunyi: memastikan tombol Enter selalu berfungsi. */}
      <button
        type="submit"
        className="sr-only"
        tabIndex={-1}
        aria-hidden="true"
      >
        Cari
      </button>
    </form>
  );
}
