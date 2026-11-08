/**
 * Aturan reset absensi & pengisian mundur.
 *
 * Modul ini murni (tanpa database), dipakai di server action DAN di browser,
 * sehingga keputusan "bisa check-in atau tidak" selalu sama di kedua sisi.
 */

export type ResetMode = "DAILY_UTC" | "DAILY_LOCAL" | "ROLLING_24H";

export const RESET_MODES: ResetMode[] = [
  "DAILY_UTC",
  "DAILY_LOCAL",
  "ROLLING_24H",
];

/** Pilihan bawaan untuk map baru (aturan reset yang paling umum di Roblox). */
export const DEFAULT_RESET_MODE: ResetMode = "DAILY_UTC";

export const resetModeOptions: {
  id: ResetMode;
  label: string;
  hint: string;
}[] = [
  {
    id: "DAILY_UTC",
    label: "Harian, reset 00.00 UTC (07.00 WIB)",
    hint: "Paling umum di game Roblox. Hari baru dimulai pukul 00.00 UTC.",
  },
  {
    id: "DAILY_LOCAL",
    label: "Harian, reset tengah malam waktu kamu",
    hint: "Hari baru dimulai pukul 00.00 di zona waktu akunmu.",
  },
  {
    id: "ROLLING_24H",
    label: "24 jam sejak klaim terakhir",
    hint: "Reward tersedia lagi 24 jam setelah klaim. Streak putus jika lewat 48 jam.",
  },
];

export function isResetMode(value: unknown): value is ResetMode {
  return RESET_MODES.includes(value as ResetMode);
}

export function resetModeLabel(mode: ResetMode) {
  return resetModeOptions.find((option) => option.id === mode)?.label ?? mode;
}

export const DEFAULT_TIME_ZONE = "Asia/Jakarta";

const DAY_MS = 86_400_000;

/* ------------------------------------------------------------------ */
/* Zona waktu                                                          */
/* ------------------------------------------------------------------ */

/** Mengembalikan zona waktu yang valid (kalau tidak valid -> Asia/Jakarta). */
export function safeTimeZone(timeZone?: string | null): string {
  if (!timeZone) return DEFAULT_TIME_ZONE;

  try {
    new Intl.DateTimeFormat("en-US", { timeZone });
    return timeZone;
  } catch {
    return DEFAULT_TIME_ZONE;
  }
}

const wallFormatters = new Map<string, Intl.DateTimeFormat>();

function wallFormatter(timeZone: string) {
  let formatter = wallFormatters.get(timeZone);

  if (!formatter) {
    formatter = new Intl.DateTimeFormat("en-CA", {
      timeZone,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hourCycle: "h23",
    });
    wallFormatters.set(timeZone, formatter);
  }

  return formatter;
}

/** Jam dinding (tanggal & jam di zona itu) sebagai milidetik UTC "semu". */
function wallAsUtcMs(instantMs: number, timeZone: string) {
  const parts = wallFormatter(timeZone).formatToParts(new Date(instantMs));
  const get = (type: string) =>
    Number(parts.find((part) => part.type === type)?.value);

  return Date.UTC(
    get("year"),
    get("month") - 1,
    get("day"),
    get("hour"),
    get("minute"),
    get("second"),
  );
}

/** Selisih zona terhadap UTC pada instan tertentu (milidetik). */
function offsetMs(instantMs: number, timeZone: string) {
  return wallAsUtcMs(instantMs, timeZone) - Math.floor(instantMs / 1000) * 1000;
}

/** Jam dinding di zona -> instan nyata (dua langkah agar aman saat DST). */
function wallToInstantMs(wallAsUtc: number, timeZone: string) {
  let guess = wallAsUtc - offsetMs(wallAsUtc, timeZone);
  guess = wallAsUtc - offsetMs(guess, timeZone);

  return guess;
}

/** Nomor hari (sejak 1970-01-01) dari tanggal kalender di zona itu. */
export function dayIndex(date: Date, timeZone: string) {
  const wall = wallAsUtcMs(date.getTime(), timeZone);

  return Math.floor(wall / DAY_MS);
}

/** Instan saat hari ke-`index` dimulai (00.00) di zona itu. */
function startOfDayMs(index: number, timeZone: string) {
  return wallToInstantMs(index * DAY_MS, timeZone);
}

/* ------------------------------------------------------------------ */
/* Status check-in                                                     */
/* ------------------------------------------------------------------ */

export type CheckInStatus =
  /** Belum pernah absen di siklus ini: boleh check-in. */
  | { state: "FIRST" }
  /** Sudah absen untuk periode ini: tunggu sampai `availableAt`. */
  | { state: "LOCKED"; availableAt: Date }
  /** Boleh check-in sekarang; streak aman sampai `deadline`. */
  | { state: "AVAILABLE"; deadline: Date }
  /** Terlewat: streak putus pada `brokeAt`. Check-in berikutnya = siklus baru. */
  | { state: "BROKEN"; brokeAt: Date };

/** Zona yang dipakai untuk menentukan batas "hari" pada mode harian. */
function dailyZone(mode: ResetMode, timeZone: string) {
  return mode === "DAILY_UTC" ? "UTC" : safeTimeZone(timeZone);
}

export function getCheckInStatus(
  mode: ResetMode,
  lastAttendanceAt: Date | null,
  now: Date,
  timeZone: string,
): CheckInStatus {
  if (!lastAttendanceAt) return { state: "FIRST" };

  if (mode === "ROLLING_24H") {
    const last = lastAttendanceAt.getTime();
    const elapsed = now.getTime() - last;

    if (elapsed < DAY_MS) {
      return { state: "LOCKED", availableAt: new Date(last + DAY_MS) };
    }

    if (elapsed < 2 * DAY_MS) {
      return { state: "AVAILABLE", deadline: new Date(last + 2 * DAY_MS) };
    }

    return { state: "BROKEN", brokeAt: new Date(last + 2 * DAY_MS) };
  }

  const zone = dailyZone(mode, timeZone);
  const lastIndex = dayIndex(lastAttendanceAt, zone);
  const diff = dayIndex(now, zone) - lastIndex;

  if (diff <= 0) {
    return {
      state: "LOCKED",
      availableAt: new Date(startOfDayMs(lastIndex + 1, zone)),
    };
  }

  if (diff === 1) {
    return {
      state: "AVAILABLE",
      deadline: new Date(startOfDayMs(lastIndex + 2, zone)),
    };
  }

  return {
    state: "BROKEN",
    brokeAt: new Date(startOfDayMs(lastIndex + 2, zone)),
  };
}

/* ------------------------------------------------------------------ */
/* Pengisian mundur                                                    */
/* ------------------------------------------------------------------ */

/** Geser tanggal kalender di zona tertentu, jam dinding tetap sama. */
function shiftCalendarDays(date: Date, deltaDays: number, timeZone: string) {
  const wall = wallAsUtcMs(date.getTime(), timeZone);
  const shifted = wall + deltaDays * DAY_MS;

  return new Date(wallToInstantMs(shifted, timeZone));
}

/**
 * Waktu absen untuk hari 1..count, urut naik. Hari terakhir = `lastAttendanceAt`.
 *  - mode harian    : jam yang sama, mundur satu hari kalender per hari
 *  - ROLLING_24H    : tepat 24 jam per hari
 */
export function backfillDates(
  mode: ResetMode,
  lastAttendanceAt: Date,
  count: number,
  timeZone: string,
): Date[] {
  const zone = dailyZone(mode, timeZone);
  const dates: Date[] = [];

  for (let back = count - 1; back >= 0; back--) {
    dates.push(
      mode === "ROLLING_24H"
        ? new Date(lastAttendanceAt.getTime() - back * DAY_MS)
        : shiftCalendarDays(lastAttendanceAt, -back, zone),
    );
  }

  return dates;
}

/* ------------------------------------------------------------------ */
/* Tampilan                                                            */
/* ------------------------------------------------------------------ */

function pad(value: number) {
  return String(value).padStart(2, "0");
}

/** "03:12:05" — hitung mundur dari milidetik. */
export function formatCountdown(ms: number) {
  const total = Math.max(0, Math.ceil(ms / 1000));
  const hours = Math.floor(total / 3600);
  const minutes = Math.floor((total % 3600) / 60);
  const seconds = total % 60;

  return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
}

export function formatDateTime(date: Date, timeZone: string) {
  return new Intl.DateTimeFormat("id-ID", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: safeTimeZone(timeZone),
  }).format(date);
}

/** Penjelasan singkat aturan reset untuk ditampilkan ke pengguna. */
export function describeReset(
  mode: ResetMode,
  timeZone: string,
  now: Date = new Date(),
) {
  if (mode === "ROLLING_24H") {
    return "24 jam setelah check-in terakhir (streak putus jika lewat 48 jam)";
  }

  if (mode === "DAILY_LOCAL") {
    return "Harian, hari baru dimulai pukul 00.00 waktu akunmu";
  }

  const nextUtcMidnight = startOfDayMs(dayIndex(now, "UTC") + 1, "UTC");
  const local = new Intl.DateTimeFormat("id-ID", {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: safeTimeZone(timeZone),
    timeZoneName: "short",
  }).format(new Date(nextUtcMidnight));

  return `Harian, hari baru dimulai pukul ${local} (00.00 UTC)`;
}
