import { Santri } from './types';
import { storageService as legacyStorageService } from './storageService';

export type { SignaturesConfig } from './storageService';

/**
 * Lapisan kompatibilitas produksi.
 *
 * Workbook resmi yang tersedia hanya memuat NIS, nama, jenis kelamin,
 * kelas, dan status. Field biodata yang sebelumnya dibuat sebagai contoh
 * tidak boleh ditampilkan sebagai fakta. Lapisan ini mengosongkan placeholder
 * lama sambil tetap mempertahankan data yang benar-benar telah diedit admin,
 * termasuk foto santri yang diunggah sendiri.
 */
const sanitizeSantri = (s: Santri): Santri => {
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
    ...s,
    nisn: fakeNisn ? '' : s.nisn,
    tempatLahir: fakeBirthPlace ? '' : s.tempatLahir,
    tanggalLahir: fakeBirthDate ? '' : s.tanggalLahir,
    namaWali: fakeGuardian ? '' : s.namaWali,
    waliSantri: fakeGuardian ? '' : s.waliSantri,
    noHpWali: fakePhone ? '' : s.noHpWali,
    alamat: fakeAddress ? '' : s.alamat,
    foto: fakePhoto ? '' : s.foto,
    hafalanJuz: undefined,
    mutqinSurah: undefined,
    kehadiranPercent: s.kehadiranPercent === 96.5 ? undefined : s.kehadiranPercent,
    rataRataNilai: s.rataRataNilai === 88.5 ? undefined : s.rataRataNilai,
    akhlakPredikat: s.akhlakPredikat === 'Jayyid Jiddan' ? undefined : s.akhlakPredikat,
    catatanWaliKelas: fakeAcademicNote ? '' : s.catatanWaliKelas,
  };
};

export const storageService = {
  ...legacyStorageService,

  getSantriList(): Santri[] {
    return legacyStorageService.getSantriList().map(sanitizeSantri);
  },

  getStudents(): Santri[] {
    return this.getSantriList();
  },

  saveSantriList(list: Santri[]): void {
    legacyStorageService.saveSantriList(list.map(sanitizeSantri));
  },

  saveStudents(list: Santri[]): void {
    this.saveSantriList(list);
  },

  updateSantri(id: string, updates: Partial<Santri>): void {
    const current = this.getSantriList();
    const updated = current.map((s) => (s.id === id ? sanitizeSantri({ ...s, ...updates }) : s));
    legacyStorageService.saveSantriList(updated);
  },

  deleteSantri(id: string): void {
    legacyStorageService.saveSantriList(this.getSantriList().filter((s) => s.id !== id));
  },
};
