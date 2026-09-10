# Madrasah Diniyah Takmiliyah Annajiyah 2

Sistem administrasi akademik Madrasah Diniyah Takmiliyah Annajiyah 2, PP. Bahrul Ulum Tambakberas Jombang.

## Status finalisasi

Branch `finalisasi-publish` menggunakan data master santri dan struktur akademik dari berkas resmi proyek. Data yang belum tersedia pada sumber tidak diisi dengan placeholder atau nilai acak.

Fitur yang telah difinalisasi meliputi:

- master santri resmi dan upload foto santri oleh administrator;
- absensi bulanan sesuai struktur workbook;
- Muhafadloh delapan periode (M1-M8) dalam satu tahun;
- buku nilai semester tanpa generator nilai demo;
- raport yang mengambil nilai dari buku nilai tersimpan;
- ijazah dua halaman dengan data kosong tetap kosong sampai diinput;
- dashboard Admin, Guru, dan Santri tanpa statistik simulasi;
- login tanpa kredensial demo bawaan dan setup administrator pertama;
- pencarian global berbasis data produksi;
- pemeriksaan build otomatis melalui GitHub Actions.

## Menjalankan aplikasi

```bash
npm ci
npm run dev
```

Build produksi:

```bash
npm run build
```

> Catatan deployment: penyimpanan dan akun pada versi ini masih berbasis penyimpanan browser. Untuk publikasi internet multi-perangkat, autentikasi dan database server-side perlu dikonfigurasi pada tahap deployment agar data tidak hanya tersimpan pada satu browser.
