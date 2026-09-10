# Madrasah Diniyah Takmiliyah Annajiyah 2

Sistem administrasi akademik Madrasah Diniyah Takmiliyah Annajiyah 2, PP. Bahrul Ulum Tambakberas Jombang.

## Status finalisasi

Branch `finalisasi-publish` digunakan untuk penyesuaian produksi sebelum digabung ke `main`.

Perubahan yang sudah diterapkan:
- konfigurasi Vite/npm dan build production;
- struktur import hasil ekspor AI Studio;
- login menggunakan akun tersimpan, bukan simulasi peran;
- database santri tanpa fitur hafalan Al-Qur'an 2 juz;
- upload foto santri oleh admin untuk kebutuhan kartu identitas;
- Muhafadloh memakai 8 periode M1-M8;
- absensi diselaraskan dengan format data resmi;
- ijazah dua halaman dengan bingkai, identitas, status kelulusan, dan daftar nilai; nilai yang belum ada ditampilkan kosong, bukan data contoh.

## Menjalankan project

```bash
npm ci
npm run dev
```

Build produksi:

```bash
npm run build
```

Output build berada di direktori `dist/`.
