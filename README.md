# Madrasah Diniyah Takmiliyah An-Najiyah 2

Sistem administrasi akademik Madrasah Diniyah Takmiliyah An-Najiyah 2, PP. Bahrul Ulum Tambakberas Jombang.

## Status finalisasi

Branch `finalisasi-publish` memakai data master dan struktur akademik dari berkas resmi proyek. Data yang tidak tersedia pada sumber tidak diisi dengan placeholder atau nilai acak.

Fitur yang telah difinalisasi meliputi:

- master santri resmi dan upload foto santri oleh administrator;
- absensi bulanan sesuai struktur workbook;
- Muhafadloh delapan periode (M1-M8) dalam satu tahun;
- buku nilai semester tanpa generator nilai demo;
- raport yang mengambil nilai tersimpan dan tidak membuat nilai otomatis;
- ijazah dua halaman dengan data kosong tetap kosong sampai diinput;
- dashboard Admin, Guru, dan Santri tanpa statistik simulasi;
- login tanpa kredensial demo bawaan dan setup administrator pertama;
- pencarian global berbasis data produksi;
- jadwal, materi, bank soal, pengumuman, kalender, silabus, Buku Kerja Guru, Buku Santri, profil madrasah, dan peraturan guru telah dipisahkan dari data contoh/fiktif;
- pemeriksaan build otomatis melalui GitHub Actions.

## Menjalankan di laptop/server lokal

Pastikan Node.js 20 tersedia, kemudian:

```bash
npm ci
npm run build
npm run preview
```

Untuk pengembangan:

```bash
npm run dev
```

## Tahap server/backend

Backend/database terpusat sengaja belum dipasang pada tahap revisi frontend ini. Source final disiapkan terlebih dahulu agar dapat diunduh dan diekstrak ke laptop/server. Setelah seluruh revisi dinyatakan selesai, integrasi autentikasi server-side, database terpusat, penyimpanan file, dan akses lintas perangkat dapat dilakukan di lingkungan server tujuan.

Selama backend belum dipasang, perubahan data masih tersimpan di browser perangkat yang digunakan. LocalStorage bukan database produksi multi-perangkat.
