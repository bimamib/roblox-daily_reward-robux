# Changelog

Semua perubahan penting pada RbxDaily dicatat di sini.
Format mengikuti [Keep a Changelog](https://keepachangelog.com/id-ID/1.1.0/) dan
penomoran versi mengikuti [Semantic Versioning](https://semver.org/lang/id/).
Pemetaan versi ke commit ada di `docs/GIT-TAGS.md`.

## [Belum dirilis] (menuju 1.0.0)

Rilis publik pertama setelah database produksi disiapkan, situs di-deploy, dan
semua fitur diuji di web live.

## [0.8.0] - 2026-11-11

### Ditambahkan

- Aturan reset per map: harian UTC (00.00 UTC), harian waktu akun, atau 24 jam
  sejak klaim terakhir (streak putus jika lewat 48 jam). Dipilih saat menambah
  map dan dapat diubah admin di halaman Edit.
- Status check-in langsung: aturan reset, hitung mundur menuju check-in
  berikutnya, batas streak, dan peringatan jika streak terputus.
- "Isi Absensi Sebelumnya": pengguna yang sudah menjalankan map sebelum memakai
  RbxDaily dapat mengisi jumlah hari dan waktu absen terakhir. Hari yang diisi
  ditandai "diisi manual".
- Komponen `Badge` untuk Verified, durasi, dan target Robux; dipakai di kartu
  beranda (mengikuti tema) dan banner detail map.
- Migrasi database: kolom `resetMode` pada map dan `isBackfilled` pada log
  absensi.

### Diubah

- Focus ring seragam di semua field (input, select, textarea, kolom password,
  pilihan daftar): cincin 2px yang berjarak 2px dari field; border field tidak
  berubah.
- Kesalahan yang dapat diduga pada aksi absensi dan laporan dikembalikan sebagai
  nilai (bukan dilempar), sehingga pesannya tampil jelas juga di produksi.
- Admin: validasi lebih ketat saat mengubah map.
- Lencana pada banner detail map memakai komponen bersama dengan kontras
  minimal 7:1.

### Diperbaiki

- Kartu map di beranda: emoji pada label Robux diganti ikon agar konsisten.

## [0.7.1]

### Diperbaiki

- Teks panjang tidak lagi merusak tata letak (word wrap) di dashboard, kartu
  map, detail map, dan tracker absensi.

## [0.7.0]

### Ditambahkan

- SEO: metadata per halaman, `sitemap.xml`, `robots.txt`, gambar pratinjau
  berbagi link, data terstruktur WebSite, dan ikon situs.

### Diubah

- Font diganti ke Inter (semua ketebalan memakai font asli).
- `getMapBySlug` di-cache per permintaan.

### Diperbaiki

- Garis fokus tipis pada kolom yang diisi dari saran browser (autofill).

## [0.6.0]

### Ditambahkan

- Footer dengan hak cipta dan jam berjalan.
- Kolom password dengan tombol tampil/sembunyikan (InputGroup).
- Pencarian langsung di beranda.

### Diubah

- Textarea dan form memakai struktur TextField/TextArea.

### Diperbaiki

- Border terpotong pada kolom password saat diisi password manager.

## [0.5.0]

### Ditambahkan

- Validasi link game Roblox (anti-phishing) dan pencegahan map duplikat.
- Laporan map oleh pengguna dan halaman review admin.
- Verifikasi map oleh admin, aktifkan/nonaktifkan map.

## [0.4.0]

### Ditambahkan

- Ikon aplikasi, logo, dan `site.webmanifest`.
- Class UI bersama (`lib/ui.ts`), tombol skeuomorphic, dan dialog HeroUI
  pengganti `alert`/`confirm`.
- Skrip `prisma/clear-data.ts`; seed demo tidak lagi berjalan otomatis.

### Diubah

- Ukuran field dan tombol mengikuti HeroUI v3.

## [0.3.0]

### Ditambahkan

- Sidebar + navbar, drawer mobile, dan penyempurnaan panel admin.

### Diperbaiki

- Kilatan layar saat berpindah tema.

## [0.2.0]

### Ditambahkan

- Tema terang/gelap dan target Robux pribadi pada kartu map.

### Diubah

- Penyempurnaan select, popover, dan variabel tema.

## [0.1.0]

### Ditambahkan

- Tracker absensi harian per map, reward pribadi, klaim Robux, status
  pengiriman, dan dashboard pengguna.
- Katalog map dengan pencarian dan filter durasi, serta autentikasi Supabase.
