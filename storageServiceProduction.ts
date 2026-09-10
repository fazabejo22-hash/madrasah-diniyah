import { AppUserAccount, Santri } from './types';
import { DATA_SISWA_247 } from './students247Data';
import { storageService as legacyStorageService } from './storageService';

export type { SignaturesConfig } from './storageService';

const PROD_ACCOUNTS_KEY = 'annajiyah_prod_accounts_v1';

const readAccounts = (): AppUserAccount[] => {
  try {
    const raw = localStorage.getItem(PROD_ACCOUNTS_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

const writeAccounts = (accounts: AppUserAccount[]) => {
  localStorage.setItem(PROD_ACCOUNTS_KEY, JSON.stringify(accounts));
};

/**
 * Lapisan kompatibilitas produksi.
 * Master resmi menentukan NIS, nama, jenis kelamin, kelas dan status.
 * Biodata tambahan hanya dipertahankan bila benar-benar diinput administrator.
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
  const fakeAcademicNote = Boolean(s.catatanWaliKelas && (s.catatanWaliKelas.includes('Santri berakhlakul karimah') || s.catatanWaliKelas.includes('Calon wisudawan teladan')));

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
  try { persisted = legacyStorageService.getSantriList(); } catch { persisted = []; }
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
      nis: src.nis,
      nama: src.nama,
      gender: src.jk,
      jenisKelamin: src.jk,
      kelas: src.kelas,
      status: src.status as any,
    } as Santri;
  });

  const custom = persisted
    .filter((s) => !officialNis.has(s.nis))
    .map((s) => ({ ...s, ...sanitizeExtra(s), hafalanJuz: undefined, mutqinSurah: undefined }));

  return [...official, ...custom];
};

export const storageService = {
  ...legacyStorageService,

  getSantriList(): Santri[] { return officialBase(); },
  getStudents(): Santri[] { return this.getSantriList(); },
  saveSantriList(list: Santri[]): void { legacyStorageService.saveSantriList(list); },
  saveStudents(list: Santri[]): void { this.saveSantriList(list); },
  updateSantri(id: string, updates: Partial<Santri>): void {
    const updated = this.getSantriList().map((s) => (s.id === id ? { ...s, ...updates } : s));
    legacyStorageService.saveSantriList(updated);
  },
  deleteSantri(id: string): void {
    legacyStorageService.saveSantriList(this.getSantriList().filter((s) => s.id !== id));
  },

  // Akun produksi dipisahkan total dari akun contoh pada ekspor lama.
  getUserAccounts(): AppUserAccount[] { return readAccounts(); },
  saveUserAccounts(accounts: AppUserAccount[]): void { writeAccounts(accounts); },
  addUserAccount(account: AppUserAccount): void { writeAccounts([account, ...readAccounts()]); },
  updateUserAccount(id: string, updates: Partial<AppUserAccount>): void {
    writeAccounts(readAccounts().map((a) => a.id === id ? { ...a, ...updates } : a));
  },
  deleteUserAccount(id: string): void { writeAccounts(readAccounts().filter((a) => a.id !== id)); },
  changeUserPassword(idOrUsername: string, newPass: string): boolean {
    let changed = false;
    const key = idOrUsername.trim().toLowerCase();
    const updated = readAccounts().map((a) => {
      if (a.id.toLowerCase() === key || a.username.toLowerCase() === key || a.nipOrNis.replace(/\W/g, '').toLowerCase() === key.replace(/\W/g, '')) {
        changed = true;
        return { ...a, password: newPass };
      }
      return a;
    });
    if (changed) writeAccounts(updated);
    return changed;
  },
  verifyLogin(username: string, pass: string): AppUserAccount | null {
    const user = username.trim().toLowerCase();
    return readAccounts().find((a) => a.status === 'Aktif' && a.password === pass && (a.username.toLowerCase() === user || a.nipOrNis.replace(/\W/g, '').toLowerCase() === user.replace(/\W/g, ''))) || null;
  },
};
