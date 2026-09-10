// Target Muhafadzoh Rules & Constants based on official pesantren guidelines

export interface TargetKelasRule {
  tingkat: number;
  namaMateri: string;
  targetPerSetoran: number[];
  targetTahunan: number;
  satuan: string;
  catatanKhusus?: string;
}

export const TARGET_MUHAFADZOH_RULES: Record<number, TargetKelasRule> = {
  1: {
    tingkat: 1,
    namaMateri: 'Tashrif Ishthilahi Tsulatsi Mujarrod 6 Bab',
    targetPerSetoran: [7, 7, 7, 7, 7, 6, 6, 6],
    targetTahunan: 53,
    satuan: 'Wazan/Mauzun',
    catatanKhusus: 'Setoran 1–5: 7 Wazan/Mauzun, Setoran 6–8: 6 Wazan/Mauzun. Total = 53.',
  },
  2: {
    tingkat: 2,
    namaMateri: 'Tashrif Lughowi',
    targetPerSetoran: [7, 7, 7, 7, 7, 7, 7, 6],
    targetTahunan: 55,
    satuan: 'Wazan/Mauzun',
    catatanKhusus: 'Setoran 1–7: 7 Wazan/Mauzun, Setoran 8: 6 Wazan/Mauzun. Total = 55.',
  },
  3: {
    tingkat: 3,
    namaMateri: 'Nadzom Imrithi 130 Bait',
    targetPerSetoran: [18, 16, 16, 16, 16, 16, 16, 16],
    targetTahunan: 130,
    satuan: 'Bait',
    catatanKhusus: 'Setoran 1: 18 Bait, Setoran 2–8: 16 Bait. Total = 130.',
  },
  4: {
    tingkat: 4,
    namaMateri: 'Nadzom Imrithi 124 Bait',
    targetPerSetoran: [16, 16, 16, 16, 15, 15, 15, 15],
    targetTahunan: 124,
    satuan: 'Bait',
    catatanKhusus: 'Setoran 1–4: 16 Bait, Setoran 5–8: 15 Bait. Total = 124.',
  },
  5: {
    tingkat: 5,
    namaMateri: 'Nadzom Qowaidus Shorfiyah Jilid 1',
    targetPerSetoran: [11, 11, 10, 10, 10, 10, 10, 10],
    targetTahunan: 82,
    satuan: 'Bait',
    catatanKhusus:
      'Deskripsi materi menyebut 80 bait, tetapi rincian target 8 kali setoran menghasilkan 82 bait. Untuk perhitungan gunakan 82 bait sampai administrator mengubah ketentuan.',
  },
  6: {
    tingkat: 6,
    namaMateri: 'Surat dan Wirid',
    targetPerSetoran: [1, 1, 1, 1, 1, 1, 1, 1],
    targetTahunan: 8,
    satuan: 'Materi/Surah',
    catatanKhusus:
      'Semester I: 1. Surat Al-Mulk, 2. Surat Al-Waqi\'ah, 3. Surat Yasin, 4. Rotibul Haddad. Semester II: 5. Tahlil, 6. Istighotsah beserta Do\'a dan Tawassul, 7. Wirid Ba\'da Sholat Maktubah, 8. Ujian/review keseluruhan materi.',
  },
};

export const BOBOT_PENILAIAN = {
  ujianTulis: 0.35, // 35%
  ujianLisan: 0.30, // 30%
  muhafadzoh: 0.30, // 30%
  kehadiran: 0.05,  // 5%
  kkmNilaiAkhir: 50,
  minKehadiran: 80, // 80%
  targetMuhafadzohMin: 100, // 100%
};
