# Tag versi RbxDaily

Penomoran mengikuti Semantic Versioning (`vMAJOR.MINOR.PATCH`). Selama belum
dirilis ke publik memakai `0.x`; rilis publik pertama menjadi `v1.0.0`.

## 1. Daftar tag

Tag `v0.1.0` sampai `v0.7.0` **sudah dibuat** di repo Anda (terlihat di
`git log`). Dua tag berikutnya yang belum ada:

| Tag      | Commit                        | Isi                                                                | Status    |
| -------- | ----------------------------- | ------------------------------------------------------------------ | --------- |
| `v0.1.0` | `0954ffa`                     | Tracker absensi, reward pribadi, dashboard                         | sudah ada |
| `v0.2.0` | `e55cb4a`                     | Tema terang/gelap, target Robux pribadi                            | sudah ada |
| `v0.3.0` | `1ca677a`                     | Sidebar, navbar, panel admin                                       | sudah ada |
| `v0.4.0` | `31ce0bf`                     | Ikon, tombol skeuomorphic, dialog HeroUI                           | sudah ada |
| `v0.5.0` | `5869d7b`                     | Validasi link, laporan map, verifikasi admin                       | sudah ada |
| `v0.6.0` | `47d767a`                     | Footer, tampil password, perbaikan form                            | sudah ada |
| `v0.7.0` | `7827ac3`                     | SEO, font Inter, siap deploy                                       | sudah ada |
| `v0.7.1` | `7e636b7`                     | Perbaikan pembungkus teks panjang (word wrap)                      | **belum** |
| `v0.8.0` | commit docs terakhir (`HEAD`) | Aturan reset per map, isi absensi sebelumnya, badge, fokus seragam | **belum** |

`v0.7.1` adalah rilis perbaikan (PATCH) yang menutup tujuh commit `fix(ui)` word
wrap (`8a14da9` sampai `7e636b7`). `v0.8.0` adalah fitur baru (MINOR). Commit
`78a9516` sampai `1458912` (hasil aksi, model laporan, admin, `resetMode` di
form edit) menjadi bagian dari `v0.8.0`.

Setelah situs live dan semuanya teruji: beri tag **`v1.0.0`** (rilis publik
pertama, jangan ditandai pre-release).

## 2. Commit untuk perubahan yang belum di-commit

Urutannya dibuat supaya tiap commit tetap bisa di-build (komponen dan
pemakainya tidak terpisah). Jalankan di folder project:

```powershell
git status

# 1. Fokus seragam dan komponen badge
git add lib/ui.ts components/badge.tsx app/globals.css components/map-card.tsx
git commit -m "feat(ui): unify focus ring and add shared badge component" -m "All fields use a 2px outline with 2px offset. Badges for verification, duration, and Robux target share one component."

# 2. Migrasi database
git add prisma/migrations/20261106123102_add_reset_mode_and_backfill/migration.sql
git commit -m "feat(db): add migration for map reset mode and attendance backfill flag"

# 3. Logika absensi
git add lib/attendance/rules.ts lib/action-result.ts actions/attendance.ts
git commit -m "feat(attendance): add per-map reset rules, backfill action, and result-based errors" -m "Check-in follows DAILY_UTC, DAILY_LOCAL, or ROLLING_24H. Expected errors are returned as values so messages survive production error masking."

# 4. Antarmuka absensi
git add components/attendance-client.tsx components/dashboard-client.tsx ':(literal)app/(public)/maps/[slug]/page.tsx'
git commit -m "feat(attendance): show check-in status with countdown and add backfill dialog" -m "Users can fill in earlier attendance for maps already running before they joined. Detail page uses the shared badge component."

# 5. Dokumentasi
git add CHANGELOG.md docs/GIT-TAGS.md
git commit -m "docs: update changelog and tag guide through v0.8.0"
```

Catatan: pada `git add` untuk path berkurung siku, `':(literal)...'` membuat
`[slug]` dibaca apa adanya, bukan sebagai pola.

Beberapa commit lama (`051bb46`, `b0a3221`) memakai isi pesan sebagai judul
karena kalimat panjangnya terpisah saat ditempel. Itu tidak mengganggu dan tidak
perlu diperbaiki (riwayat yang sudah di-push sebaiknya tidak ditulis ulang).

## 3. Membuat dan mengirim tag baru

```powershell
git push origin main

# v0.7.1 (mengikuti tanggal commit-nya)
$env:GIT_COMMITTER_DATE = (git log -1 --format=%aI 7e636b7)
git tag -a v0.7.1 7e636b7 -m "v0.7.1 - Perbaikan pembungkus teks panjang"
Remove-Item Env:GIT_COMMITTER_DATE

# v0.8.0 (di commit terakhir)
git tag -a v0.8.0 HEAD -m "v0.8.0 - Aturan reset per map dan isi absensi sebelumnya"

git tag -n
git push origin --tags
```

`git push origin --tags` hanya mengirim tag yang belum ada di GitHub, jadi tag
lama tidak terpengaruh. Jika salah titik: `git tag -d v0.8.0`, lalu
`git push origin :refs/tags/v0.8.0`, dan buat ulang.

## 4. Rilis di GitHub

1. Repo, **Releases**, **Draft a new release**.
2. **Choose a tag**: pilih tag (mis. `v0.8.0`).
3. Judul dan catatan diambil dari bagian yang sesuai di `CHANGELOG.md`.
4. Centang **Set as a pre-release** untuk semua tag `0.x`; jangan untuk `v1.0.0`.
5. **Publish release**.

Rilis berikutnya: `npm version patch -m "chore(release): %s"` (atau `minor`),
lalu `git push origin main --follow-tags`.
