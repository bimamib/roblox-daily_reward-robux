/**
 * Validasi & normalisasi link game Roblox.
 *
 * Hanya link halaman game di roblox.com yang diterima, contoh:
 *   https://www.roblox.com/games/1234567890
 *   https://www.roblox.com/games/1234567890/Nama-Map?privateServerLinkCode=...
 *   https://www.roblox.com/id/games/1234567890/Nama-Map   (dengan kode bahasa)
 *
 * Link lain (domain berbeda, shortener, "free robux", dll.) ditolak, sehingga
 * pengguna tidak bisa menyisipkan link phishing ke katalog.
 */

export type ParsedRobloxGame = {
  /** ID place (angka) dari URL /games/<id>. */
  placeId: string;
  /** URL baku tanpa query/slug/kredensial. */
  url: string;
};

const GAME_PATH = /^\/(?:[a-z]{2}(?:-[a-z]{2})?\/)?games\/(\d{4,20})(?:\/|$)/i;

export function parseRobloxGameUrl(input: string): ParsedRobloxGame | null {
  let url: URL;

  try {
    url = new URL(input.trim());
  } catch {
    return null;
  }

  if (url.protocol !== "https:" && url.protocol !== "http:") return null;

  const host = url.hostname.toLowerCase();
  if (host !== "roblox.com" && host !== "www.roblox.com") return null;

  const match = url.pathname.match(GAME_PATH);
  if (!match) return null;

  const placeId = match[1];

  return { placeId, url: `https://www.roblox.com/games/${placeId}` };
}

export const ROBLOX_URL_HINT =
  "Gunakan link halaman game Roblox, contoh: https://www.roblox.com/games/1234567890/Nama-Map";
