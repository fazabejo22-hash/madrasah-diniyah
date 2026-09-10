import { Santri } from './types';
import { DATA_SISWA_247 } from './students247Data';
import { storageService as legacyStorageService } from './storageService';

export type { SignaturesConfig } from './storageService';

/**
 * Lapisan kompatibilitas produksi.
 *
 * Sumber resmi yang tersedia untuk master santri memuat NIS, nama, jenis
 * kelamin, kelas dan status. Nilai/biodata yang dulu dibuat sebagai contoh
 * tidak boleh dipresentasikan sebagai fakta. Data tambahan yang benar-benar
 * dimasukkan admin (misalnya foto, alamat, NISN, tanggal lahir) tetap dipakai.
 */
const sanitizeExtra = (s?: Santri | null): Partial<Santri> => {
  if (!s) return {};
  const fakeNisn = s.nisn === `00${s.nis}88`;
  const fakeBirthPlace = s.tempatLahir === 'Jombang';
  const fakeBirthDate = s.tanggalLahir === '10 Muharram 1430 H';
  const fakeGuardian = s.waliSantri === `Wali dari ${s.nama}` || s.namaWali === `Wali dari ${s.nama}`;
  const fakePhone = s.noHpWali === '0812-3456-7890';
  const fakeAddress = s.alamat === 'Tambakberas, Jombang';
  const fakePhoto = Boolean(s.foto && s.foto.includes('images.unsplash.com'));
  const fakeAcademicNote = Boolean(
    s.catatanWaliKelas &&
    (s.catatanWaliKelas.includes('Santri berakhlakul karimah') ||
      s.catatanWaliKelas.includes('Calon wisudawan teladan'))
  );

  return {
    nisn: fakeNisn ? '' : s.nisn,
    tempatLahir: fakeBirthPlace ? '' : s.tempatLahir,
    tanggalLahir: fakeBirthDate ? '' : s.tanggalLahir,
    namaWali: fakeGuardian ? '' : s.namaWali,
    waliSantri: fakeGuardian ? '' : s.waliSantri,
    noHpWali: fakePhone ? '' : s.noHpWali,
    alamat: fakeAddress ? '' : s.alamat,
    foto: fakePhoto ? '' : s.foto,
    kamarAsrama: s.kamarAsrama,
    tahunMasuk: s.tahunMasuk,
    prestasi: s.prestasi,
    pelanggaran: s.pelanggaran,
    waliKelas: s.waliKelas,
    catatanWaliKelas: fakeAcademicNote ? '' : s.catatanWaliKelas,
    hafalanJuz: undefined,
    mutqinSurah: undefined,
    kehadiranPercent: s.kehadiranPercent === 96.5 ? undefined : s.kehadiranPercent,
    rataRataNilai: s.rataRataNilai === 88.5 ? undefined : s.rataRataNilai,
    akhlakPredikat: s.akhlakPredikat === 'Jayyid Jiddan' ? undefined : s.akhlakPredikat,
  };
};

const officialBase = (): Santri[] => {
  let persisted: Santri[] = [];
  try {
    persisted = legacyStorageService.getSantriList();
  } catch {
    persisted = [];
  }
  const persistedByNis = new Map(persisted.map((s) => [s.nis, s]));
  const officialNis = new Set(DATA_SISWA_247.map((s) => s.nis));

  const official = DATA_SISWA_247.map((src) => {
    const extra = sanitizeExtra(persistedByNis.get(src.nis));
    return {
      id: `santri-${src.nis}`,
      nis: src.nis,
      nisn: '',
      nama: src.nama,
      gender: src.jk,
      jenisKelamin: src.jk,
      kelas: src.kelas,
      status: src.status as any,
      tempatLahir: '',
      tanggalLahir: '',
      namaWali: '',
      waliSantri: '',
      noHpWali: '',
      alamat: '',
      foto: '',
      ...extra,
      // Kolom berikut wajib tetap mengikuti sumber master resmi.
      nis: src.nis,
      nama: src.nama,
      gender: src.jk,
      jenisKelamin: src.jk,
      kelas: src.kelas,
      status: src.status as any,
    } as Santri;
  });

  // Pertahankan santri yang benar-benar ditambahkan admin dan tidak ada di
  // master resmi; jangan campurkan baris default lama yang sudah ada di master.
  const custom = persisted
    .filter((s) => !officialNis.has(s.nis))
    .map((s) => ({ ...s, ...sanitizeExtra(s), hafalanJuz: undefined, mutqinSurah: undefined }));

  return [...official, ...custom];
};

export const storageService = {
  ...legacyStorageService,

  getSantriList(): Santri[] {
    return officialBase();
  },

  getStudents(): Santri[] {
    return this.getSantriList();
  },

  saveSantriList(list: Santri[]): void {
    legacyStorageService.saveSantriList(list);
  },

  saveStudents(list: Santri[]): void {
    this.saveSantriList(list);
  },

  updateSantri(id: string, updates: Partial<Santri>): void {
    const current = this.getSantriList();
    const updated = current.map((s) => (s.id === id ? { ...s, ...updates } : s));
    legacyStorageService.saveSantriList(updated);
  },

  deleteSantri(id: string): void {
    legacyStorageService.saveSantriList(this.getSantriList().filter((s) => s.id !== id));
  },
};
