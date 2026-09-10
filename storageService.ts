import {
  Santri,
  GuruJadwal,
  JadwalSlotItem,
  SesiAbsensi,
  NilaiSiswaItem,
  SiswaMuhafadzoh,
  HariLiburItem,
  KritikSaranItem,
  JawabanUjianSiswa,
  AppUserAccount,
  NavMenuItemConfig,
  KalenderPendidikanItem,
} from '../types';
import {
  MOCK_GURU_JADWAL,
  MOCK_JADWAL_SLOTS,
  MOCK_SESI_ABSENSI,
  INITIAL_NILAI_LIST,
  PESANTREN_INFO,
} from '../data/mockData';
import { DATA_SISWA_247 } from '../data/students247Data';
import { SilabusItem, SILABUS_DATA_1_SAMPAI_6 } from '../data/madinData';

const PREFIX = 'annajiyah_v2_';

const KEYS = {
  TAHUN_AJARAN: `${PREFIX}tahun_ajaran`,
  SEMESTER: `${PREFIX}semester`,
  DAFTAR_TAHUN: `${PREFIX}daftar_tahun`,
  SANTRI: `${PREFIX}santri_list`,
  GURU: `${PREFIX}guru_list`,
  JADWAL: `${PREFIX}jadwal_slots`,
  ABSENSI: `${PREFIX}absensi_session`,
  NILAI: `${PREFIX}nilai_list`,
  MUHAFADZOH: `${PREFIX}muhafadzoh_list`,
  LIBUR: `${PREFIX}daftar_libur`,
  KRITIK_SARAN: `${PREFIX}kritik_saran_list`,
  EXAM_SUBMISSIONS: `${PREFIX}exam_submissions`,
  PERATURAN_GURU: `${PREFIX}peraturan_guru`,
  SIGNATURES: `${PREFIX}signatures_musrif`,
  SETTINGS: `${PREFIX}settings`,
  LAST_SAVED: `${PREFIX}last_saved`,
  USER_ACCOUNTS: `${PREFIX}user_accounts`,
  NAV_MENUS: `${PREFIX}nav_menus`,
  SILABUS: `${PREFIX}silabus_list`,
  KALENDER_PENDIDIKAN: `${PREFIX}kalender_pendidikan`,
};

export interface SignaturesConfig {
  namaPengasuh: string;
  jabatanPengasuh?: string;
  namaKepalaMadrasah?: string;
  titimangsaRaport: string;
  tanggalHijriahRaport?: string;
  titimangsaIjazah: string;
  tanggalHijriahIjazah?: string;
  nomorIjazahTemplate?: string;
  catatanRaportDefault?: string;
  keputusanLulusDefault?: string;
  musrifPerKelas: Record<string, string>;
  signatureImageUrl?: string;
}

const DEFAULT_SIGNATURES: SignaturesConfig = {
  namaPengasuh: 'KH. M. Salman Al Faries, Lc.,M.H.I.',
  jabatanPengasuh: 'Pengasuh PP. An-Najiyah 2 Bahrul ‘Ulum',
  namaKepalaMadrasah: 'Ust. Ach. Aldyansyah, S.Pd',
  titimangsaRaport: 'Jombang, 15 Juni 2026',
  tanggalHijriahRaport: '28 Dzulqaidah 1447 H',
  titimangsaIjazah: 'Jombang, 30 Mei 2026',
  tanggalHijriahIjazah: '13 Dzulhijjah 1447 H',
  nomorIjazahTemplate: 'MDTA-AN2/IJZ/2026/{NIS}',
  catatanRaportDefault: "Pertahankan ketekunan mengaji, istiqomah dalam lalaran nadhom, dan tingkatkan pemahaman qowa'id kitab kuning.",
  keputusanLulusDefault: 'Dinyatakan LULUS dari Pendidikan Madrasah Diniyah Takmiliyah.',
  signatureImageUrl: '',
  musrifPerKelas: {
    '1A': 'Ust. Rhendie Reihansyah',
    '1B': 'Ust. Rhendie Reihansyah',
    '2A': 'Ust. M. Syukron Ma’mun',
    '2B': 'Ust. M. Syukron Ma’mun',
    '3A': 'Ust. Ahmad Fauzan',
    '3B': 'Ust. Ahmad Fauzan',
    '3C': 'Ust. Ahmad Fauzan',
    '4A': 'Ust. Abdulloh Faqih',
    '4B': 'Ust. Abdulloh Faqih',
    '5A': 'Ust. H. Zainal Abidin',
    '5B': 'Ust. H. Zainal Abidin',
    '6': 'KH. M. Salman Al Faries, Lc.,M.H.I.',
  },
};

export const DEFAULT_NAV_MENUS: NavMenuItemConfig[] = [
  { id: 'menu-dashboard', title: 'Dashboard', page: 'dashboard', category: 'utama', visibleForAdmin: true, visibleForGuru: true, visibleForSiswa: true, iconName: 'LayoutDashboard', order: 1 },
  { id: 'menu-siswa', title: 'Database Santri', page: 'siswa', category: 'utama', visibleForAdmin: true, visibleForGuru: true, visibleForSiswa: false, iconName: 'Users', order: 2 },
  { id: 'menu-muhafadzoh', title: 'Pusat Muhafadzoh', page: 'muhafadzoh', category: 'utama', visibleForAdmin: true, visibleForGuru: true, visibleForSiswa: true, iconName: 'Sparkles', badge: '247 Santri', order: 3 },
  { id: 'menu-guru-kerja', title: 'Buku Kerja Guru', page: 'guru_kerja', category: 'utama', visibleForAdmin: true, visibleForGuru: true, visibleForSiswa: false, iconName: 'UserCheck', order: 4 },
  { id: 'menu-jadwal', title: 'Jadwal Pelajaran', page: 'jadwal', category: 'akademik', visibleForAdmin: true, visibleForGuru: true, visibleForSiswa: false, iconName: 'Calendar', order: 5 },
  { id: 'menu-absensi', title: 'Absensi Siswa', page: 'absensi', category: 'akademik', visibleForAdmin: true, visibleForGuru: true, visibleForSiswa: true, iconName: 'ClipboardCheck', order: 6 },
  { id: 'menu-nilai', title: 'Daftar Nilai Siswa', page: 'nilai', category: 'akademik', visibleForAdmin: true, visibleForGuru: true, visibleForSiswa: true, iconName: 'FileSpreadsheet', order: 7 },
  { id: 'menu-silabus', title: 'Silabus Madin', page: 'silabus', category: 'akademik', visibleForAdmin: true, visibleForGuru: true, visibleForSiswa: true, iconName: 'BookOpen', order: 8 },
  { id: 'menu-soal', title: 'Soal & Ujian', page: 'soal', category: 'evaluasi', visibleForAdmin: true, visibleForGuru: true, visibleForSiswa: true, iconName: 'FileQuestion', order: 9 },
  { id: 'menu-buku-guru', title: 'Buku Guru', page: 'buku_guru', category: 'dokumen', visibleForAdmin: true, visibleForGuru: true, visibleForSiswa: false, iconName: 'BookMarked', order: 10 },
  { id: 'menu-buku-siswa', title: 'Buku Panduan Santri', page: 'buku_siswa', category: 'dokumen', visibleForAdmin: true, visibleForGuru: true, visibleForSiswa: true, iconName: 'BookOpen', order: 11 },
  { id: 'menu-materi', title: 'Materi Pembelajaran', page: 'materi', category: 'dokumen', visibleForAdmin: true, visibleForGuru: true, visibleForSiswa: true, iconName: 'FileText', order: 12 },
  { id: 'menu-raport', title: 'Raport Digital', page: 'raport', category: 'evaluasi', visibleForAdmin: true, visibleForGuru: true, visibleForSiswa: true, iconName: 'Award', order: 13 },
  { id: 'menu-ijazah', title: 'Ijazah Kelulusan', page: 'ijazah', category: 'evaluasi', visibleForAdmin: true, visibleForGuru: true, visibleForSiswa: true, iconName: 'GraduationCap', order: 14 },
  { id: 'menu-peraturan-guru', title: 'Peraturan Guru', page: 'peraturan_guru', category: 'dokumen', visibleForAdmin: true, visibleForGuru: true, visibleForSiswa: false, iconName: 'FileText', order: 15 },
  { id: 'menu-kritik-saran', title: 'Kritik & Saran', page: 'kritik_saran', category: 'utama', visibleForAdmin: true, visibleForGuru: true, visibleForSiswa: false, iconName: 'MessageSquare', order: 16 },
  { id: 'menu-hari-libur', title: 'Kalender & Hari Libur', page: 'hari_libur', category: 'akademik', visibleForAdmin: true, visibleForGuru: true, visibleForSiswa: false, iconName: 'CalendarOff', order: 17 },
  { id: 'menu-pesantren-info', title: 'Informasi Pesantren', page: 'pesantren_info', category: 'dokumen', visibleForAdmin: true, visibleForGuru: true, visibleForSiswa: true, iconName: 'Landmark', order: 18 },
  { id: 'menu-pengumuman', title: 'Pengumuman', page: 'pengumuman', category: 'utama', visibleForAdmin: true, visibleForGuru: true, visibleForSiswa: true, iconName: 'Bell', order: 19 },
  { id: 'menu-notifikasi', title: 'Notifikasi Sistem', page: 'notifikasi', category: 'utama', visibleForAdmin: true, visibleForGuru: true, visibleForSiswa: true, iconName: 'Bell', order: 20 },
  { id: 'menu-pengaturan', title: 'Pengaturan Sistem', page: 'pengaturan', category: 'pengaturan', visibleForAdmin: true, visibleForGuru: true, visibleForSiswa: true, iconName: 'Settings', order: 21 },
];

export const INITIAL_USER_ACCOUNTS: AppUserAccount[] = [
  {
    id: 'usr-admin',
    username: 'admin.mahfudz',
    password: 'admin123',
    name: 'Ust. Ach. Aldyansyah, S.Pd',
    role: 'admin',
    roleTitle: 'Administrator Utama & Web Architect',
    nipOrNis: 'NIP. 197805122004011002',
    email: 'admin@pesantrenterpadu.sch.id',
    permissions: ['admin_full', 'menu_editor', 'user_editor', 'kalender_editor', 'raport_editor', 'silabus_editor'],
    status: 'Aktif',
  },
  {
    id: 'usr-guru-1',
    username: 'ahmad.fauzi',
    password: 'guru123',
    name: 'Ustadz Ahmad Fauzi, S.Pd.I',
    role: 'guru',
    roleTitle: 'Guru Pengampu / Wali Kelas 5A',
    nipOrNis: 'NIP. 198503142010011008',
    kelas: '5A',
    email: 'ahmad.fauzi@pesantrenterpadu.sch.id',
    permissions: ['kbm', 'absensi', 'nilai', 'muhafadzoh', 'raport_view'],
    status: 'Aktif',
  },
  {
    id: 'usr-guru-2',
    username: 'rhendie.reihan',
    password: 'guru123',
    name: 'Ust. Rhendie Reihansyah',
    role: 'guru',
    roleTitle: 'Musrif Kelas 1',
    nipOrNis: 'NIP. 199004112015011003',
    kelas: '1A',
    email: 'rhendie@pesantrenterpadu.sch.id',
    permissions: ['kbm', 'absensi', 'nilai', 'muhafadzoh'],
    status: 'Aktif',
  },
  {
    id: 'usr-guru-3',
    username: 'syukron.mamun',
    password: 'guru123',
    name: 'Ust. M. Syukron Ma’mun',
    role: 'guru',
    roleTitle: 'Musrif Kelas 2',
    nipOrNis: 'NIP. 198802102014011005',
    kelas: '2A',
    email: 'syukron@pesantrenterpadu.sch.id',
    permissions: ['kbm', 'absensi', 'nilai', 'muhafadzoh'],
    status: 'Aktif',
  },
  {
    id: 'usr-siswa-1',
    username: '202305012',
    password: 'santri123',
    name: 'Ahmad Zaki Mubarak',
    role: 'siswa',
    roleTitle: 'Santri Kelas 5A',
    nipOrNis: 'NIS. 202305012',
    kelas: 'Kelas 5A',
    email: 'zaki.mubarak@santri.pesantren.id',
    permissions: ['santri_portal'],
    status: 'Aktif',
  },
  {
    id: 'usr-siswa-2',
    username: '20240501',
    password: 'santri123',
    name: 'Muhammad Rayhan',
    role: 'siswa',
    roleTitle: 'Santri Kelas 5A',
    nipOrNis: 'NIS. 20240501',
    kelas: 'Kelas 5A',
    email: 'rayhan@santri.pesantren.id',
    permissions: ['santri_portal'],
    status: 'Aktif',
  },
];

export const DEFAULT_KALENDER: KalenderPendidikanItem[] = [
  { id: 'kal-1', tanggalMulai: '2025-07-15', tanggalSelesai: '2025-07-20', kegiatan: 'Awal Masuk & Orientasi Santri Baru (MOS)', kategori: 'KBM', keterangan: 'KBM resmi dimulai di seluruh jenjang kelas 1-6', warna: 'emerald' },
  { id: 'kal-2', tanggalMulai: '2025-09-05', tanggalSelesai: '2025-09-06', kegiatan: 'Peringatan & Libur Maulid Nabi Muhammad SAW 1447 H', kategori: 'Libur', keterangan: 'KBM libur resmi pondok', warna: 'rose' },
  { id: 'kal-3', tanggalMulai: '2025-10-01', tanggalSelesai: '2025-10-08', kegiatan: 'Penilaian Tengah Semester (PTS) Ganjil', kategori: 'Ujian', keterangan: 'Ujian tulis & lisan materi pertengahan semester', warna: 'amber' },
  { id: 'kal-4', tanggalMulai: '2025-11-20', tanggalSelesai: '2025-11-30', kegiatan: 'Imtihan Akhir Semester & Munaqosyah Muhafadloh', kategori: 'Muhafadloh', keterangan: 'Ujian target bait 1-8', warna: 'purple' },
  { id: 'kal-5', tanggalMulai: '2025-12-15', tanggalSelesai: '2026-01-02', kegiatan: 'Libur Semester Ganjil & Haul Akbar Bahrul Ulum', kategori: 'Libur', keterangan: 'Santri pulang & ziarah pendiri pondok', warna: 'rose' },
  { id: 'kal-6', tanggalMulai: '2026-01-05', tanggalSelesai: '2026-01-05', kegiatan: 'Awal KBM Semester Genap 2025/2026', kategori: 'KBM', keterangan: 'Masuk perdana semester genap', warna: 'emerald' },
  { id: 'kal-7', tanggalMulai: '2026-03-01', tanggalSelesai: '2026-04-05', kegiatan: 'Libur Ramadhan & Hari Raya Idul Fitri 1447 H', kategori: 'Libur', keterangan: 'Santri libur hari raya', warna: 'rose' },
  { id: 'kal-8', tanggalMulai: '2026-05-18', tanggalSelesai: '2026-05-28', kegiatan: 'Ujian Akhir Madrasah & Ujian Munaqosyah Kelas 6', kategori: 'Ujian', keterangan: 'Penentuan nilai Ijazah santri tingkat akhir', warna: 'amber' },
  { id: 'kal-9', tanggalMulai: '2026-06-15', tanggalSelesai: '2026-06-15', kegiatan: 'Pembagian Raport Genap & Haflah Wisuda Kelulusan Ijazah', kategori: 'Pondok', keterangan: 'Penerimaan raport & ijazah kelulusan', warna: 'blue' },
];

export const OFFICIAL_SANTRI_247: Santri[] = DATA_SISWA_247.map((s) => {
  const isK6 = s.kelas === '6';
  const masukYear = s.nis.startsWith('26')
    ? '2026'
    : s.nis.startsWith('25')
    ? '2025'
    : s.nis.startsWith('24')
    ? '2024'
    : s.nis.startsWith('21')
    ? '2021'
    : '2023';
  return {
    id: `santri-${s.nis}`,
    nis: s.nis,
    nisn: `00${s.nis}88`,
    nama: s.nama,
    gender: 'L',
    jenisKelamin: 'L',
    kelas: s.kelas,
    tahunMasuk: masukYear,
    status: (s.status === 'Aktif' || s.status === 'Boyong' || s.status === 'Lulus' || s.status === 'Cuti') ? s.status : 'Aktif',
    tempatLahir: 'Jombang',
    tanggalLahir: '10 Muharram 1430 H',
    namaWali: `Wali dari ${s.nama}`,
    waliSantri: `Wali dari ${s.nama}`,
    noHpWali: '0812-3456-7890',
    alamat: 'Tambakberas, Jombang',
    hafalanJuz: s.tingkat * 2,
    mutqinSurah: s.materiMuhafadzoh,
    akhlakPredikat: 'Jayyid Jiddan',
    foto: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=200&auto=format&fit=crop&q=80',
    kehadiranPercent: s.status === 'Aktif' ? 96.5 : 0,
    rataRataNilai: s.status === 'Aktif' ? 88.5 : 0,
    catatanWaliKelas: isK6
      ? 'Calon wisudawan teladan. Telah menyelesaikan kurikulum takmiliyah dengan predikat Mumtaz.'
      : 'Santri berakhlakul karimah, tekun muthala\'ah kitab dan aktif dalam kegiatan madrasah diniyah.',
  };
});

const DEFAULT_LIBUR: HariLiburItem[] = [
  {
    id: 'libur-1',
    tanggalMulai: '2026-09-15',
    tanggalSelesai: '2026-09-16',
    keterangan: 'Libur Peringatan Maulid Nabi Muhammad SAW 1448 H',
    dibuatPada: '2026-09-01',
  },
  {
    id: 'libur-2',
    tanggalMulai: '2026-10-22',
    tanggalSelesai: '2026-10-22',
    keterangan: 'Libur Hari Santri Nasional',
    dibuatPada: '2026-09-01',
  },
];

const DEFAULT_KRITIK_SARAN: KritikSaranItem[] = [
  {
    id: 'ks-1',
    namaGuru: 'Ust. Zainurrohim, M.Pd',
    kodeGuru: '05',
    emailGuru: 'zainurrohim@annajiyah.id',
    kategori: 'Kurikulum',
    judul: 'Usulan Penjadwalan Tambahan Bimbingan Nadhom Imrithi Kelas 4A',
    pesan: 'Mohon dipertimbangkan penambahan sesi bimbingan khusus ba\'da Ashar untuk santri yang capaian bait nadhomnya masih di bawah target bulanan.',
    tanggal: '2026-09-05 20:45 WIB',
    dibaca: false,
    arsip: false,
  },
];

export interface AppDatabaseBackup {
  version: string;
  exportDate: string;
  app: string;
  activeTahunAjaran: string;
  activeSemester: 'Ganjil' | 'Genap';
  daftarTahunAjaran: string[];
  santriList: Santri[];
  guruList: GuruJadwal[];
  jadwalSlots: JadwalSlotItem[];
  absensiSession: SesiAbsensi;
  nilaiList: NilaiSiswaItem[];
  muhafadzohList?: SiswaMuhafadzoh[];
  settings: {
    namaPesantren: string;
    nspp: string;
    alamat: string;
  };
}

// Safe localStorage access helper
const safeGet = <T>(key: string, fallback: T): T => {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
};

const safeSet = (key: string, value: unknown): void => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    localStorage.setItem(KEYS.LAST_SAVED, new Date().toISOString());
  } catch (err) {
    console.error('Gagal menyimpan ke localStorage:', err);
  }
};

function normalizeSiswaMuhafadzoh(s: SiswaMuhafadzoh): SiswaMuhafadzoh {
  const capaian =
    s.capaianBait ??
    s.totalCapaian ??
    ((s.capaian1 || 0) +
      (s.capaian2 || 0) +
      (s.capaian3 || 0) +
      (s.capaian4 || 0) +
      (s.capaian5 || 0) +
      (s.capaian6 || 0) +
      (s.capaian7 || 0) +
      (s.capaian8 || 0));
  const target = s.targetBait ?? s.targetTahunan ?? 100;
  const nilai =
    s.nilaiUjianMuhafadzoh ??
    s.nilaiMuhafadzoh ??
    (s.rataUjianLisan
      ? Math.round(s.rataUjianLisan)
      : capaian && target
      ? Math.min(100, Math.round((capaian / target) * 100))
      : 88);
  const status = s.statusTarget ?? (capaian >= target ? 'Tercapai' : 'Belum Memenuhi');
  const kitab = s.kitabMuhafadzoh || s.materiMuhafadzoh || 'Al-Amtsilah At-Tashrifiyyah';

  return {
    ...s,
    kitabMuhafadzoh: kitab,
    targetBait: target,
    capaianBait: capaian,
    nilaiUjianMuhafadzoh: nilai,
    statusTarget: status,
  };
}

export const storageService = {
  // 1. Tahun Ajaran & Semester

  getTahunAjaran(): string {
    return safeGet<string>(KEYS.TAHUN_AJARAN, '2025/2026');
  },
  saveTahunAjaran(tahun: string): void {
    safeSet(KEYS.TAHUN_AJARAN, tahun);
  },

  getSemester(): 'Ganjil' | 'Genap' {
    return safeGet<'Ganjil' | 'Genap'>(KEYS.SEMESTER, 'Ganjil');
  },
  saveSemester(semester: 'Ganjil' | 'Genap'): void {
    safeSet(KEYS.SEMESTER, semester);
  },

  getDaftarTahunAjaran(): string[] {
    return safeGet<string[]>(KEYS.DAFTAR_TAHUN, [
      '2024/2025',
      '2025/2026',
      '2026/2027',
      '2027/2028',
      '2028/2029',
    ]);
  },
  saveDaftarTahunAjaran(list: string[]): void {
    safeSet(KEYS.DAFTAR_TAHUN, list);
  },

  // 2. Santri List
  getSantriList(): Santri[] {
    const data = safeGet<Santri[] | null>(KEYS.SANTRI, null);
    if (!data || data.length < 240) {
      safeSet(KEYS.SANTRI, OFFICIAL_SANTRI_247);
      return OFFICIAL_SANTRI_247;
    }
    return data;
  },
  saveSantriList(list: Santri[]): void {
    safeSet(KEYS.SANTRI, list);
  },
  // Alias for compatibility
  getStudents(): Santri[] {
    return this.getSantriList();
  },
  saveStudents(list: Santri[]): void {
    this.saveSantriList(list);
  },

  // 3. Guru List
  getGuruList(): GuruJadwal[] {
    const data = safeGet<GuruJadwal[] | null>(KEYS.GURU, null);
    if (!data || data.length === 0) {
      safeSet(KEYS.GURU, MOCK_GURU_JADWAL);
      return MOCK_GURU_JADWAL;
    }
    return data;
  },
  saveGuruList(list: GuruJadwal[]): void {
    safeSet(KEYS.GURU, list);
  },

  // 4. Jadwal Slots
  getJadwalSlots(): JadwalSlotItem[] {
    const data = safeGet<JadwalSlotItem[] | null>(KEYS.JADWAL, null);
    if (!data || data.length === 0) {
      safeSet(KEYS.JADWAL, MOCK_JADWAL_SLOTS);
      return MOCK_JADWAL_SLOTS;
    }
    return data;
  },
  saveJadwalSlots(slots: JadwalSlotItem[]): void {
    safeSet(KEYS.JADWAL, slots);
  },

  // 5. Absensi Session
  getAbsensiSession(): SesiAbsensi {
    const data = safeGet<SesiAbsensi | null>(KEYS.ABSENSI, null);
    if (!data) {
      safeSet(KEYS.ABSENSI, MOCK_SESI_ABSENSI);
      return MOCK_SESI_ABSENSI;
    }
    return data;
  },
  saveAbsensiSession(session: SesiAbsensi): void {
    safeSet(KEYS.ABSENSI, session);
  },

  // 6. Nilai List
  getNilaiList(): NilaiSiswaItem[] {
    const data = safeGet<NilaiSiswaItem[] | null>(KEYS.NILAI, null);
    if (!data || data.length === 0) {
      safeSet(KEYS.NILAI, INITIAL_NILAI_LIST);
      return INITIAL_NILAI_LIST;
    }
    return data;
  },
  saveNilaiList(list: NilaiSiswaItem[]): void {
    safeSet(KEYS.NILAI, list);
  },

  // 6b. Muhafadzoh List (247 Siswa)
  getMuhafadzohList(): SiswaMuhafadzoh[] {
    const data = safeGet<SiswaMuhafadzoh[] | null>(KEYS.MUHAFADZOH, null);
    if (!data || data.length === 0) {
      const normalized = DATA_SISWA_247.map(normalizeSiswaMuhafadzoh);
      safeSet(KEYS.MUHAFADZOH, normalized);
      return normalized;
    }
    return data.map(normalizeSiswaMuhafadzoh);
  },
  saveMuhafadzohList(list: SiswaMuhafadzoh[]): void {
    safeSet(KEYS.MUHAFADZOH, list);
  },
  updateSingleSiswaMuhafadzoh(updated: SiswaMuhafadzoh): SiswaMuhafadzoh[] {
    const list = this.getMuhafadzohList();
    const idx = list.findIndex(s => s.nis === updated.nis || s.no === updated.no);
    if (idx !== -1) {
      list[idx] = updated;
    } else {
      list.push(updated);
    }
    this.saveMuhafadzohList(list);
    return list;
  },

  // 6c. Hari Libur & Kalender Madrasah
  getDaftarLibur(): HariLiburItem[] {
    return safeGet<HariLiburItem[]>(KEYS.LIBUR, DEFAULT_LIBUR);
  },
  getHariLibur(): HariLiburItem[] {
    return this.getDaftarLibur();
  },
  saveDaftarLibur(list: HariLiburItem[]): void {
    safeSet(KEYS.LIBUR, list);
  },
  addHariLibur(item: Omit<HariLiburItem, 'id' | 'dibuatPada'>): HariLiburItem[] {
    const list = this.getDaftarLibur();
    const newItem: HariLiburItem = {
      ...item,
      id: `libur-${Date.now()}`,
      dibuatPada: new Date().toISOString().slice(0, 10),
    };
    const updated = [newItem, ...list];
    this.saveDaftarLibur(updated);
    return updated;
  },
  deleteHariLibur(id: string): HariLiburItem[] {
    const list = this.getDaftarLibur().filter((l) => l.id !== id);
    this.saveDaftarLibur(list);
    return list;
  },
  isTanggalLibur(dateStr: string): { isLibur: boolean; keterangan?: string } {
    const list = this.getDaftarLibur();
    for (const item of list) {
      if (dateStr >= item.tanggalMulai && dateStr <= item.tanggalSelesai) {
        return { isLibur: true, keterangan: item.keterangan };
      }
    }
    return { isLibur: false };
  },

  // 6d. Kritik & Saran Guru ke Admin/Pengasuh
  getKritikSaran(): KritikSaranItem[] {
    return safeGet<KritikSaranItem[]>(KEYS.KRITIK_SARAN, DEFAULT_KRITIK_SARAN);
  },
  saveKritikSaran(items: KritikSaranItem[]): void {
    safeSet(KEYS.KRITIK_SARAN, items);
  },
  addKritikSaran(data: {
    namaGuru: string;
    kodeGuru?: string;
    emailGuru?: string;
    kategori: 'Kurikulum' | 'Kedisiplinan' | 'Fasilitas' | 'Santri' | 'Lainnya';
    judul: string;
    pesan: string;
  }): KritikSaranItem[] {
    const list = this.getKritikSaran();
    const newItem: KritikSaranItem = {
      ...data,
      id: `ks-${Date.now()}`,
      tanggal: new Date().toLocaleString('id-ID', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }) + ' WIB',
      dibaca: false,
      arsip: false,
    };
    const updated = [newItem, ...list];
    this.saveKritikSaran(updated);
    return updated;
  },
  markKritikSaranRead(id: string): void {
    const list = this.getKritikSaran();
    const updated = list.map((k) => (k.id === id ? { ...k, dibaca: true } : k));
    this.saveKritikSaran(updated);
  },
  archiveKritikSaran(id: string): void {
    const list = this.getKritikSaran();
    const updated = list.map((k) => (k.id === id ? { ...k, arsip: !k.arsip } : k));
    this.saveKritikSaran(updated);
  },
  deleteKritikSaran(id: string): void {
    const list = this.getKritikSaran().filter((k) => k.id !== id);
    this.saveKritikSaran(list);
  },
  balasKritikSaran(id: string, balasan: string): void {
    const list = this.getKritikSaran();
    const updated = list.map((k) =>
      k.id === id
        ? {
            ...k,
            tanggapanPengasuh: balasan,
            tanggalTanggapan: new Date().toLocaleString('id-ID', {
              day: '2-digit',
              month: 'short',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            }) + ' WIB',
          }
        : k
    );
    this.saveKritikSaran(updated);
  },

  // 6e. Hasil Ujian Santri (Exam Submissions)
  getExamSubmissions(): JawabanUjianSiswa[] {
    return safeGet<JawabanUjianSiswa[]>(KEYS.EXAM_SUBMISSIONS, []);
  },
  saveExamSubmissions(items: JawabanUjianSiswa[]): void {
    safeSet(KEYS.EXAM_SUBMISSIONS, items);
  },
  submitExam(submission: Omit<JawabanUjianSiswa, 'id' | 'waktuSubmit'>): JawabanUjianSiswa {
    const list = this.getExamSubmissions();
    const newSubmission: JawabanUjianSiswa = {
      ...submission,
      id: `sub-${Date.now()}`,
      waktuSubmit: new Date().toLocaleString('id-ID', {
        timeZone: 'Asia/Jakarta',
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }) + ' WIB',
    };
    // Replace if already submitted by same student for same exam
    const filtered = list.filter(
      (s) => !(s.paketId === submission.paketId && s.santriNis === submission.santriNis)
    );
    this.saveExamSubmissions([newSubmission, ...filtered]);
    return newSubmission;
  },
  gradeExamSubmission(
    submissionId: string,
    nilaiAkhir: number,
    catatanGuru: string,
    dinilaiOleh: string
  ): void {
    const list = this.getExamSubmissions();
    const updated = list.map((sub) => {
      if (sub.id === submissionId) {
        return {
          ...sub,
          nilaiAkhir,
          catatanGuru,
          dinilaiOleh,
          statusPenilaian: 'Sudah Dinilai' as const,
        };
      }
      return sub;
    });
    this.saveExamSubmissions(updated);
  },

  // 6f. Peraturan Guru & Pengajar
  getPeraturanGuru(): string {
    return safeGet<string>(
      KEYS.PERATURAN_GURU,
      `TATA TERTIB & DISIPLIN GURU/PENGAJAR
MADRASAH DINIYAH TAKMILIYAH ANNAJIYAH 2 BAHRUL ULUM

1. KEHADIRAN & WAKTU MENGAJAR
- Jam KBM Diniyah dimulai pukul 20.00 WIB s/d 21.10 WIB setiap hari aktif.
- Asatidz wajib hadir di ruang kelas minimal 5 menit sebelum KBM dimulai.
- Asatidz wajib mengisi absensi kelas dan jurnal pengajaran secara digital maupun manual.

2. PENAMPILAN & ADAB
- Berpakaian rapi, sopan, bersarung dan berpeci (busana khas santri/asatidz).
- Menjadi teladan akhlaqul karimah bagi santri di dalam maupun di luar kelas.

3. KETIDAKHADIRAN & BADAL
- Jika berhalangan hadir, wajib memberitahukan kepada Pengurus / Sekretariat Madrasah paling lambat pukul 17.00 WIB.
- Memberikan tugas madrasah atau berkoordinasi untuk pengajar pengganti (badal).

4. EVALUASI & NILAI
- Mengisi nilai harian, nilai ujian imtihan, dan setoran muhafadzoh santri secara berkala dan objektif.`
    );
  },
  savePeraturanGuru(text: string): void {
    safeSet(KEYS.PERATURAN_GURU, text);
  },

  // 6g. Pengaturan Tanda Tangan Pengasuh & Musrif Kelas
  getSignaturesAndMusrif(): SignaturesConfig {
    return safeGet<SignaturesConfig>(KEYS.SIGNATURES, DEFAULT_SIGNATURES);
  },
  saveSignaturesAndMusrif(config: SignaturesConfig): void {
    safeSet(KEYS.SIGNATURES, config);
  },

  // 7. Settings
  getAppSettings(): { namaPesantren: string; nspp: string; alamat: string } {
    return safeGet(KEYS.SETTINGS, {
      namaPesantren: PESANTREN_INFO.namaLengkap,
      nspp: PESANTREN_INFO.nomorStatistik,
      alamat: PESANTREN_INFO.alamat,
    });
  },
  saveAppSettings(settings: { namaPesantren: string; nspp: string; alamat: string }): void {
    safeSet(KEYS.SETTINGS, settings);
  },

  // 8. Last Saved Time
  getLastSavedTime(): string {
    const ts = localStorage.getItem(KEYS.LAST_SAVED);
    if (!ts) return new Date().toLocaleTimeString('id-ID');
    try {
      const d = new Date(ts);
      return d.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    } catch {
      return ts;
    }
  },

  // 9. Full Backup Object
  exportBackupObject(): AppDatabaseBackup {
    return {
      version: '2.0',
      exportDate: new Date().toISOString(),
      app: 'Madrasah Takmiliyah Annajiyah 2 (PP. Bahrul Ulum Tambakberas)',
      activeTahunAjaran: this.getTahunAjaran(),
      activeSemester: this.getSemester(),
      daftarTahunAjaran: this.getDaftarTahunAjaran(),
      santriList: this.getSantriList(),
      guruList: this.getGuruList(),
      jadwalSlots: this.getJadwalSlots(),
      absensiSession: this.getAbsensiSession(),
      nilaiList: this.getNilaiList(),
      muhafadzohList: this.getMuhafadzohList(),
      settings: this.getAppSettings(),
    };
  },

  // 10. Download JSON File
  downloadBackupFile(): void {
    const backup = this.exportBackupObject();
    const jsonStr = JSON.stringify(backup, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const dateStr = new Date().toISOString().slice(0, 10);
    const a = document.createElement('a');
    a.href = url;
    a.download = `cadangan_madrasah_annajiyah2_${dateStr}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  },

  // 11. Restore / Import JSON Backup
  importBackupJson(jsonString: string): { success: boolean; message: string } {
    try {
      const data = JSON.parse(jsonString) as Partial<AppDatabaseBackup>;
      if (!data || typeof data !== 'object') {
        return { success: false, message: 'Format file JSON tidak valid.' };
      }

      if (data.activeTahunAjaran) this.saveTahunAjaran(data.activeTahunAjaran);
      if (data.activeSemester) this.saveSemester(data.activeSemester);
      if (data.daftarTahunAjaran && Array.isArray(data.daftarTahunAjaran)) {
        this.saveDaftarTahunAjaran(data.daftarTahunAjaran);
      }
      if (data.santriList && Array.isArray(data.santriList)) {
        this.saveSantriList(data.santriList);
      }
      if (data.guruList && Array.isArray(data.guruList)) {
        this.saveGuruList(data.guruList);
      }
      if (data.jadwalSlots && Array.isArray(data.jadwalSlots)) {
        this.saveJadwalSlots(data.jadwalSlots);
      }
      if (data.absensiSession) {
        this.saveAbsensiSession(data.absensiSession);
      }
      if (data.nilaiList && Array.isArray(data.nilaiList)) {
        this.saveNilaiList(data.nilaiList);
      }
      if (data.muhafadzohList && Array.isArray(data.muhafadzohList)) {
        this.saveMuhafadzohList(data.muhafadzohList);
      }
      if (data.settings) {
        this.saveAppSettings(data.settings);
      }

      return { success: true, message: 'Data cadangan berhasil dipulihkan secara penuh!' };
    } catch {
      return { success: false, message: 'Gagal memproses file. Pastikan berkas cadangan bertipe JSON yang valid.' };
    }
  },

  // 12. Reset to factory defaults
  resetDatabaseToDefaults(): void {
    try {
      localStorage.removeItem(KEYS.TAHUN_AJARAN);
      localStorage.removeItem(KEYS.SEMESTER);
      localStorage.removeItem(KEYS.DAFTAR_TAHUN);
      localStorage.removeItem(KEYS.SANTRI);
      localStorage.removeItem(KEYS.GURU);
      localStorage.removeItem(KEYS.JADWAL);
      localStorage.removeItem(KEYS.ABSENSI);
      localStorage.removeItem(KEYS.NILAI);
      localStorage.removeItem(KEYS.MUHAFADZOH);
      localStorage.removeItem(KEYS.SETTINGS);
      localStorage.removeItem(KEYS.LAST_SAVED);
    } catch (err) {
      console.error(err);
    }
  },

  // 13. Multi-Year Rollover: Advance Academic Year
  advanceAcademicYear(
    newTahun: string,
    options: { promoteStudents: boolean; resetAttendance: boolean }
  ): void {
    const listTahun = this.getDaftarTahunAjaran();
    if (!listTahun.includes(newTahun)) {
      this.saveDaftarTahunAjaran([...listTahun, newTahun]);
    }
    this.saveTahunAjaran(newTahun);
    this.saveSemester('Ganjil');

    if (options.promoteStudents) {
      const currentSantri = this.getSantriList();
      const updatedSantri = currentSantri.map((s) => {
        if (s.status !== 'Aktif') return s;
        // Promote logic for Madin classes
        const match = s.kelas.match(/(\d+)([A-Za-z]?)/);
        if (match) {
          const num = parseInt(match[1], 10);
          const suffix = match[2] || 'A';
          if (num < 5) {
            return { ...s, kelas: `${num + 1}${suffix}` };
          } else if (num === 5) {
            return { ...s, kelas: '6' };
          } else {
            return { ...s, status: 'Alumni' as const, kelas: 'Alumni (Lulus)' };
          }
        }
        return s;
      });
      this.saveSantriList(updatedSantri);
    }

    if (options.resetAttendance) {
      const currentSession = this.getAbsensiSession();
      const freshSession: SesiAbsensi = {
        ...currentSession,
        tanggal: new Date().toISOString().slice(0, 10),
        isCompleted: false,
        records: currentSession.records.map((r) => ({
          ...r,
          status: 'Hadir',
          keterangan: '',
        })),
      };
      this.saveAbsensiSession(freshSession);
    }
  },

  // 14. Nav Menus Management (Admin Builder)
  getNavMenus(): NavMenuItemConfig[] {
    const data = safeGet<NavMenuItemConfig[] | null>(KEYS.NAV_MENUS, null);
    if (!data || !Array.isArray(data) || data.length === 0) {
      safeSet(KEYS.NAV_MENUS, DEFAULT_NAV_MENUS);
      return DEFAULT_NAV_MENUS;
    }
    return data.sort((a, b) => a.order - b.order);
  },
  saveNavMenus(menus: NavMenuItemConfig[]): void {
    safeSet(KEYS.NAV_MENUS, menus);
    try {
      window.dispatchEvent(new Event('nav_menus_updated'));
    } catch {}
  },
  toggleMenuVisibility(id: string, role: 'admin' | 'guru' | 'siswa'): void {
    const menus = this.getNavMenus();
    const updated = menus.map((m) => {
      if (m.id !== id) return m;
      if (role === 'admin') return { ...m, visibleForAdmin: !m.visibleForAdmin };
      if (role === 'guru') return { ...m, visibleForGuru: !m.visibleForGuru };
      return { ...m, visibleForSiswa: !m.visibleForSiswa };
    });
    this.saveNavMenus(updated);
  },
  updateMenuItem(id: string, updates: Partial<NavMenuItemConfig>): void {
    const menus = this.getNavMenus();
    const updated = menus.map((m) => (m.id === id ? { ...m, ...updates } : m));
    this.saveNavMenus(updated);
  },
  addCustomMenuItem(item: Omit<NavMenuItemConfig, 'id' | 'order'>): NavMenuItemConfig {
    const menus = this.getNavMenus();
    const newItem: NavMenuItemConfig = {
      ...item,
      id: `menu-custom-${Date.now()}`,
      order: menus.length + 1,
      isCustom: true,
    };
    this.saveNavMenus([...menus, newItem]);
    return newItem;
  },
  deleteMenuItem(id: string): void {
    const menus = this.getNavMenus();
    this.saveNavMenus(menus.filter((m) => m.id !== id));
  },
  resetNavMenus(): void {
    safeSet(KEYS.NAV_MENUS, DEFAULT_NAV_MENUS);
    try {
      window.dispatchEvent(new Event('nav_menus_updated'));
    } catch {}
  },

  // 15. User Accounts & Login Management
  getUserAccounts(): AppUserAccount[] {
    const data = safeGet<AppUserAccount[] | null>(KEYS.USER_ACCOUNTS, null);
    if (!data || !Array.isArray(data) || data.length === 0) {
      safeSet(KEYS.USER_ACCOUNTS, INITIAL_USER_ACCOUNTS);
      return INITIAL_USER_ACCOUNTS;
    }
    return data;
  },
  saveUserAccounts(accounts: AppUserAccount[]): void {
    safeSet(KEYS.USER_ACCOUNTS, accounts);
  },
  updateUserAccount(id: string, updates: Partial<AppUserAccount>): void {
    const accounts = this.getUserAccounts();
    const updated = accounts.map((acc) => (acc.id === id ? { ...acc, ...updates } : acc));
    this.saveUserAccounts(updated);
  },
  addUserAccount(account: AppUserAccount): void {
    const accounts = this.getUserAccounts();
    this.saveUserAccounts([account, ...accounts]);
  },
  deleteUserAccount(id: string): void {
    const accounts = this.getUserAccounts();
    this.saveUserAccounts(accounts.filter((a) => a.id !== id));
  },
  changeUserPassword(idOrUsername: string, newPass: string): boolean {
    const accounts = this.getUserAccounts();
    let found = false;
    const updated = accounts.map((acc) => {
      if (acc.id === idOrUsername || acc.username.toLowerCase() === idOrUsername.toLowerCase()) {
        found = true;
        return { ...acc, password: newPass };
      }
      return acc;
    });
    if (found) {
      this.saveUserAccounts(updated);
      return true;
    }
    return false;
  },
  verifyLogin(username: string, pass: string): AppUserAccount | null {
    const accounts = this.getUserAccounts();
    const cleanUser = username.trim().toLowerCase();
    const found = accounts.find(
      (a) =>
        (a.username.toLowerCase() === cleanUser || a.nipOrNis.toLowerCase().includes(cleanUser)) &&
        a.password === pass &&
        a.status === 'Aktif'
    );
    return found || null;
  },

  // 16. Silabus Management (Admin Builder)
  getSilabusList(): SilabusItem[] {
    const data = safeGet<SilabusItem[] | null>(KEYS.SILABUS, null);
    if (!data || !Array.isArray(data) || data.length === 0) {
      safeSet(KEYS.SILABUS, SILABUS_DATA_1_SAMPAI_6);
      return SILABUS_DATA_1_SAMPAI_6;
    }
    return data;
  },
  saveSilabusList(list: SilabusItem[]): void {
    safeSet(KEYS.SILABUS, list);
  },
  addSilabus(item: Omit<SilabusItem, 'id'>): SilabusItem {
    const list = this.getSilabusList();
    const newItem: SilabusItem = {
      ...item,
      id: `s-custom-${Date.now()}`,
    };
    this.saveSilabusList([newItem, ...list]);
    return newItem;
  },
  updateSilabus(id: string, updates: Partial<SilabusItem>): void {
    const list = this.getSilabusList();
    const updated = list.map((item) => (item.id === id ? { ...item, ...updates } : item));
    this.saveSilabusList(updated);
  },
  deleteSilabus(id: string): void {
    const list = this.getSilabusList();
    this.saveSilabusList(list.filter((s) => s.id !== id));
  },

  // 17. Kalender Pendidikan & Agenda
  getKalenderPendidikan(): KalenderPendidikanItem[] {
    const data = safeGet<KalenderPendidikanItem[] | null>(KEYS.KALENDER_PENDIDIKAN, null);
    if (!data || !Array.isArray(data) || data.length === 0) {
      safeSet(KEYS.KALENDER_PENDIDIKAN, DEFAULT_KALENDER);
      return DEFAULT_KALENDER;
    }
    return data;
  },
  saveKalenderPendidikan(list: KalenderPendidikanItem[]): void {
    safeSet(KEYS.KALENDER_PENDIDIKAN, list);
  },
  addAgendaKalender(item: Omit<KalenderPendidikanItem, 'id'>): KalenderPendidikanItem {
    const list = this.getKalenderPendidikan();
    const newItem: KalenderPendidikanItem = {
      ...item,
      id: `kal-${Date.now()}`,
    };
    this.saveKalenderPendidikan([newItem, ...list]);
    return newItem;
  },
  updateAgendaKalender(id: string, updates: Partial<KalenderPendidikanItem>): void {
    const list = this.getKalenderPendidikan();
    const updated = list.map((ag) => (ag.id === id ? { ...ag, ...updates } : ag));
    this.saveKalenderPendidikan(updated);
  },
  deleteAgendaKalender(id: string): void {
    const list = this.getKalenderPendidikan();
    this.saveKalenderPendidikan(list.filter((ag) => ag.id !== id));
  },

  // 18. Santri CRUD
  addSantri(newSantri: Santri): void {
    const current = this.getSantriList();
    this.saveSantriList([newSantri, ...current]);
    // Also auto-create user account for this student
    const accounts = this.getUserAccounts();
    const newAccount: AppUserAccount = {
      id: `usr-siswa-${newSantri.nis}`,
      username: newSantri.nis,
      password: 'santri123',
      name: newSantri.nama,
      role: 'siswa',
      roleTitle: `Santri Kelas ${newSantri.kelas}`,
      nipOrNis: `NIS. ${newSantri.nis}`,
      kelas: newSantri.kelas,
      status: 'Aktif',
    };
    this.saveUserAccounts([...accounts, newAccount]);
  },
  updateSantri(id: string, updates: Partial<Santri>): void {
    const current = this.getSantriList();
    const updated = current.map((s) => (s.id === id ? { ...s, ...updates } : s));
    this.saveSantriList(updated);
  },
  deleteSantri(id: string): void {
    const current = this.getSantriList();
    this.saveSantriList(current.filter((s) => s.id !== id));
  },

  // 19. Ijazah & Raport Live Master Overrides (Admin Architect)
  getIjazahOverrides(): Record<string, {
    namaSantri?: string;
    nis?: string;
    tempatLahir?: string;
    tanggalLahir?: string;
    nomorIjazah?: string;
    statusKelulusan?: string;
    nilaiMapel?: { no: number; mapel: string; angka: number; huruf?: string }[];
  }> {
    return safeGet(`${PREFIX}ijazah_overrides`, {});
  },
  saveIjazahOverride(nis: string, data: {
    namaSantri?: string;
    nis?: string;
    tempatLahir?: string;
    tanggalLahir?: string;
    nomorIjazah?: string;
    statusKelulusan?: string;
    nilaiMapel?: { no: number; mapel: string; angka: number; huruf?: string }[];
  }): void {
    const all = this.getIjazahOverrides();
    all[nis] = { ...(all[nis] || {}), ...data };
    safeSet(`${PREFIX}ijazah_overrides`, all);
  },

  getRaportOverrides(): Record<string, {
    catatanWaliKelas?: string;
    keputusanNaik?: string;
    musrifName?: string;
    namaSantri?: string;
    nilaiMuhafadzoh?: number;
    akhlakPredikat?: string;
    mapelScores?: { no: number; mapel: string; kitab: string; nilai: number }[];
  }> {
    return safeGet(`${PREFIX}raport_overrides`, {});
  },
  saveRaportOverride(nis: string, data: {
    catatanWaliKelas?: string;
    keputusanNaik?: string;
    musrifName?: string;
    namaSantri?: string;
    nilaiMuhafadzoh?: number;
    akhlakPredikat?: string;
    mapelScores?: { no: number; mapel: string; kitab: string; nilai: number }[];
  }): void {
    const all = this.getRaportOverrides();
    all[nis] = { ...(all[nis] || {}), ...data };
    safeSet(`${PREFIX}raport_overrides`, all);
  },
};
