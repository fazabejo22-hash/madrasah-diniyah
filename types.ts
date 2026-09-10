export type UserRole = 'admin' | 'guru' | 'siswa' | 'Admin' | 'Guru' | 'Siswa';

export type StatusSantri = 'Aktif' | 'Alumni' | 'Lulus' | 'Mutasi' | 'Cuti' | 'Boyong';

export interface UserProfile {
  id: string;
  name: string;
  role: UserRole;
  roleTitle: string; // e.g., 'Guru Pengampu / Wali Kelas 5A', 'Santri Madin', 'Administrator Utama'
  nipOrNis: string;
  avatar: string;
  email: string;
  kelas?: string;
  unreadNotifications: number;
}

export interface Santri {
  id: string;
  nis: string;
  nisn: string;
  nama: string;
  gender?: 'L' | 'P'; // Semua santri MT. Annajiyah 2 adalah laki-laki (putra)
  jenisKelamin?: string;
  kelas: string;
  kamarAsrama?: string;
  tahunMasuk?: string;
  status: StatusSantri;
  tempatLahir: string;
  tanggalLahir: string;
  namaWali?: string;
  waliSantri?: string;
  noHpWali: string;
  alamat: string;
  hafalanJuz?: number;
  mutqinSurah?: string;
  akhlakPredikat?: 'Jayyid Jiddan' | 'Jayyid' | 'Mutawashit' | 'Rodhi\'' | string;
  foto?: string;
  kehadiranPercent?: number;
  rataRataNilai?: number;
  catatanWaliKelas?: string;
  waliKelas?: string;
  prestasi?: string[];
  pelanggaran?: string[];
}

export type StatusAbsensi = 'Hadir' | 'Sakit' | 'Izin' | 'Alpa';

export interface RecordAbsensiSiswa {
  santriId: string;
  nama: string;
  nis: string;
  status: StatusAbsensi;
  keterangan?: string;
}

export interface SesiAbsensi {
  id: string;
  tanggal: string;
  kelas: string;
  mataPelajaran: string;
  jamKe: string;
  ruang: string;
  guruPengampu: string;
  isCompleted: boolean;
  records: RecordAbsensiSiswa[];
}

export interface NilaiSiswaItem {
  santriId: string;
  nama: string;
  nis: string;
  tugas: number;
  ulanganHarian: number;
  uts: number;
  uas: number;
  praktik: number;
  hafalan: number;
  akhlak: number;
  kehadiran: number;
  nilaiAkhir: number;
  predikat: 'A (Mumtaz)' | 'B+ (Jayyid Jiddan)' | 'B (Jayyid)' | 'C (Maqbul)' | 'D (Rasib)';
  status: 'Lengkap' | 'Belum lengkap';
}

export interface GuruJadwal {
  kode: number;
  nama: string;
  warnaBadge: string;
  keterangan?: string;
}

export interface JadwalSlotItem {
  id: string;
  kelas: string; // '1A' | '1B' | '2A' | '2B' | '3A' | '3B' | '3C' | '4A' | '4B' | '5A' | '5B' | '6'
  hari: 'Jum\'at' | 'Sabtu' | 'Minggu' | 'Selasa' | 'Rabu';
  kitab: string;
  kitabLatin?: string;
  fanIlmu: string; // Tajwid, Fiqih, Shorof, Hadits, Tauhid, Nahwu, Pegon, Tasawwuf, Aswaja, Baca Kitab
  kodeGuru: number;
}

export interface JadwalPelajaranItem {
  id: string;
  hari: string;
  jam?: string;
  mataPelajaran: string;
  kategori?: string;
  guru: string;
  kelas: string;
  ruangan?: string;
  status?: string;
  kitab?: string;
  fanIlmu?: string;
  kodeGuru?: number;
}

export type JadwalPelajaran = JadwalPelajaranItem;

export interface SilabusItem {
  id: string;
  mataPelajaran: string;
  kelas: string;
  semester: 'Ganjil' | 'Genap';
  kompetensi: string;
  materi: string;
  tujuanPembelajaran: string;
  metodePembelajaran: string;
  alokasiWaktu: string;
  referensi: string;
  guruPengampu: string;
  isPublishedToSiswa: boolean;
  fileUrl?: string;
}

export interface MateriItem {
  id: string;
  judul: string;
  mataPelajaran: string;
  kelas: string;
  guru: string;
  tipe?: 'PDF' | 'Buku' | 'Modul' | 'Lembar Kerja' | 'Gambar' | 'Dokumen' | string;
  jenisFile?: string;
  ukuran?: string;
  ukuranFile?: string;
  tanggalUpload: string;
  deskripsi: string;
  coverColor?: string;
  unduhanCount?: number;
}

export interface BukuKerjaItem {
  id: string;
  kategori: 'guru' | 'siswa';
  judul: string;
  subJudul: string;
  jenisDokumen: string;
  tahun: string;
  ukuran: string;
  halaman: number;
  penulisOrPenerbit: string;
  deskripsi: string;
}

export type TipeSoal = 'pilihan_ganda' | 'benar_salah' | 'isian' | 'essay';

export interface SoalItem {
  id: string;
  nomor?: number;
  tipe?: string;
  mataPelajaran?: string;
  kelas?: string;
  bab?: string;
  kompetensi?: string;
  tipeSoal?: TipeSoal;
  tingkatKesulitan?: 'Mudah' | 'Sedang' | 'Sulit';
  pertanyaan: string;
  opsi?: string[];
  pilihanJawaban?: string[];
  kunciJawaban: string;
  bobot?: number;
  bobotNilai?: number;
  status?: 'Draft' | 'Dipublikasikan' | string;
  tanggalDibuat?: string;
}

export interface PaketSoal {
  id: string;
  judul: string;
  mataPelajaran: string;
  kelas: string;
  semester?: 'Ganjil' | 'Genap';
  alokasiWaktuMenit: number;
  guruPembuat: string;
  tanggalDibuat: string;
  tanggalMulai?: string;
  jamMulai?: string;
  tanggalSelesai?: string;
  jamSelesai?: string;
  totalSoal: number;
  totalBobot: number;
  status: string;
  isPublished?: boolean;
  daftarSoal: SoalItem[];
}

export interface JawabanUjianSiswa {
  id: string;
  paketId: string;
  santriNis: string;
  santriNama: string;
  kelas: string;
  mataPelajaran: string;
  waktuSubmit: string;
  jawaban: Record<string, string>;
  nilaiOtomatis?: number;
  nilaiAkhir?: number;
  catatanGuru?: string;
  statusPenilaian: 'Belum Dinilai' | 'Sudah Dinilai';
  dinilaiOleh?: string;
}

export interface HariLiburItem {
  id: string;
  tanggalMulai: string; // YYYY-MM-DD
  tanggalSelesai: string; // YYYY-MM-DD
  keterangan: string;
  dibuatPada?: string;
}

export interface KritikSaranItem {
  id: string;
  namaGuru: string;
  kodeGuru?: string | number;
  emailGuru?: string;
  judul: string;
  kategori: 'Kurikulum' | 'Kedisiplinan' | 'Fasilitas' | 'Santri' | 'Lainnya';
  pesan: string;
  tanggal: string;
  dibaca: boolean;
  arsip?: boolean;
  tanggapanPengasuh?: string;
  tanggalTanggapan?: string;
}

export interface RaportSiswa {
  santri: Santri;
  tahunAjaran: string;
  semester: 'Ganjil' | 'Genap';
  ranking: number;
  totalSantriKelas: number;
  nilaiMapel: {
    kategori: 'Dirasah Islamiyah (Kepesantrenan)' | 'Pendidikan Umum' | 'Bahasa Asing';
    mapel: string;
    kkm: number;
    nilaiAngka: number;
    predikat: string;
    deskripsi: string;
  }[];
  tahfidz: {
    juzTeruji: string;
    kelancaran: string;
    tajwidMakhraj: string;
    predikat: string;
  };
  akhlakAdab: {
    kedisiplinanIbadah: string;
    adabSantri: string;
    kebersihanKamar: string;
    bahasaResmiAsrama: string;
  };
  absensiSemester: {
    sakit: number;
    izin: number;
    alpa: number;
  };
  catatanWaliKelas: string;
  tanggalCetak: string;
}

export interface IjazahSiswa {
  nomorIjazah: string;
  santri: Santri;
  namaPesantren: string;
  tahunKelulusan: string;
  nomorPokokSekolah: string;
  nilaiRataRata: number;
  predikatKelulusan: 'MUMTAZ (Dengan Pujian)' | 'JAYYID JIDDAN (Sangat Baik)' | 'JAYYID (Baik)';
  namaPengasuh: string;
  namaMudir?: string;
  tanggalKelulusan: string;
}

export interface NotifikasiItem {
  id: string;
  judul: string;
  pesan: string;
  waktu: string;
  tipe: 'warning' | 'info' | 'success' | 'alert';
  dibaca: boolean;
  targetRole?: UserRole[];
  linkModule?: string;
  linkNav?: string;
  tautan?: string;
}

export interface DokumenPesantrenItem {
  id: string;
  judul: string;
  nomorSurat: string;
  kategori: 'SK Pimpinan' | 'Kurikulum' | 'Kalender Akademik' | 'Tata Tertib' | 'Keuangan';
  tanggalRilis: string;
  ukuran: string;
}

export interface SiswaMuhafadzoh {
  no: number;
  nis: string;
  nama: string;
  jk: 'L' | 'P';
  kelas: string;
  status: 'Aktif' | 'Keluar' | string;
  tingkat: number;
  materiMuhafadzoh: string;
  target1: number;
  capaian1: number | null;
  target2: number;
  capaian2: number | null;
  target3: number;
  capaian3: number | null;
  target4: number;
  capaian4: number | null;
  target5: number;
  capaian5: number | null;
  target6: number;
  capaian6: number | null;
  target7: number;
  capaian7: number | null;
  target8: number;
  capaian8: number | null;
  targetTahunan: number;
  totalCapaian?: number | null;
  persenCapaian?: number | null;
  nilaiMuhafadzoh?: number | null;
  kitabMuhafadzoh?: string;
  targetBait?: number;
  capaianBait?: number;
  nilaiUjianMuhafadzoh?: number;
  statusTarget?: 'Tercapai' | 'Belum Memenuhi' | string;
  selisihTarget?: number;
  ujianTulisS1?: number | null;
  ujianTulisS2?: number | null;
  rataUjianTulis?: number | null;
  ujianLisanS1?: number | null;
  ujianLisanS2?: number | null;
  rataUjianLisan?: number | null;
  kehadiran?: number | null;
  nilaiAkhir?: number | null;
  predikat?: 'A' | 'B' | 'C' | 'D' | null;
  predikatLabel?: string;
  statusDokumen?: 'Naik Kelas' | 'Tidak Naik' | 'Belum dapat ditentukan';
  statusRekomendasi?: 'Naik Kelas' | 'BELUM MEMENUHI SYARAT' | 'BELUM DAPAT DITENTUKAN – data belum lengkap';
  alasanRekomendasi?: string;
  catatan?: string;
}

export interface AppUserAccount {
  id: string;
  username: string;
  password: string;
  name: string;
  role: 'admin' | 'guru' | 'siswa';
  roleTitle: string;
  nipOrNis: string;
  kelas?: string;
  email?: string;
  permissions?: string[];
  status: 'Aktif' | 'Nonaktif';
}

export interface NavMenuItemConfig {
  id: string;
  title: string;
  page: string;
  category: 'utama' | 'santri_portal' | 'akademik' | 'dokumen' | 'evaluasi' | 'pengaturan' | 'kustom';
  visibleForAdmin: boolean;
  visibleForGuru: boolean;
  visibleForSiswa: boolean;
  iconName: string;
  badge?: string;
  order: number;
  isCustom?: boolean;
}

export interface KalenderPendidikanItem {
  id: string;
  tanggalMulai: string;
  tanggalSelesai: string;
  kegiatan: string;
  kategori: 'Libur' | 'KBM' | 'Ujian' | 'Muhafadloh' | 'Pondok' | 'Lainnya' | 'libur' | 'kbm' | 'ujian' | 'muhafadzoh' | 'pondok';
  keterangan?: string;
  warna?: string;
  isLibur?: boolean;
}

export interface CalculatedMuhafadzohResult {
  hasAnyCapaian: boolean;
  isCapaianLengkap: boolean;
  totalCapaian: number | null;
  kekuranganMuhafadzoh: number | null;
  persenCapaian: number | null;
  nilaiMuhafadzoh: number | null;
  hasUjianTulisLengkap: boolean;
  rataUjianTulis: number | null;
  hasUjianLisanLengkap: boolean;
  rataUjianLisan: number | null;
  hasNilaiAkhir: boolean;
  nilaiAkhir: number | null;
  predikat: 'A' | 'B' | 'C' | 'D' | null;
  predikatLabel: string;
  statusDokumen: 'Naik Kelas' | 'Tidak Naik' | 'Belum dapat ditentukan';
  statusRekomendasi: 'Naik Kelas' | 'BELUM MEMENUHI SYARAT' | 'BELUM DAPAT DITENTUKAN – data belum lengkap';
  alasanRekomendasi: string;
  catatanData: string[];
}
