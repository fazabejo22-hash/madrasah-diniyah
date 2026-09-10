export type UserRole = 'admin' | 'guru' | 'siswa' | 'Admin' | 'Guru' | 'Siswa';

export type StatusSantri = 'Aktif' | 'Alumni' | 'Lulus' | 'Mutasi' | 'Cuti' | 'Boyong';

export interface UserProfile {
  id: string;
  name: string;
  role: UserRole;
  roleTitle: string;
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
  gender?: 'L' | 'P';
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

export interface RecordAbsensiSiswa { santriId:string; nama:string; nis:string; status:StatusAbsensi; keterangan?:string; }
export interface SesiAbsensi { id:string; tanggal:string; kelas:string; mataPelajaran:string; jamKe:string; ruang:string; guruPengampu:string; isCompleted:boolean; records:RecordAbsensiSiswa[]; }

export interface NilaiSiswaItem {
  santriId:string; nama:string; nis:string; tugas:number; ulanganHarian:number; uts:number; uas:number; praktik:number; hafalan:number; akhlak:number; kehadiran:number; nilaiAkhir:number;
  predikat:'A (Mumtaz)'|'B+ (Jayyid Jiddan)'|'B (Jayyid)'|'C (Maqbul)'|'D (Rasib)'; status:'Lengkap'|'Belum lengkap';
}

export interface GuruJadwal { kode:number; nama:string; warnaBadge:string; keterangan?:string; foto?:string; }
export interface JadwalSlotItem { id:string; kelas:string; hari:"Jum'at"|'Sabtu'|'Minggu'|'Selasa'|'Rabu'; kitab:string; kitabLatin?:string; fanIlmu:string; kodeGuru:number; }
export interface JadwalPelajaranItem { id:string; hari:string; jam?:string; mataPelajaran:string; kategori?:string; guru:string; kelas:string; ruangan?:string; status?:string; kitab?:string; fanIlmu?:string; kodeGuru?:number; }
export type JadwalPelajaran = JadwalPelajaranItem;

export interface SilabusItem { id:string; kelas:string; semester:string; mataPelajaran:string; sumberBelajar:string; materi:string; kompetensiUmum:string; indikatorPencapaian:string; targetPembelajaran:string; metodePembelajaran:string; }

export interface MateriItem { id:string; judul:string; mataPelajaran:string; kelas:string; deskripsi?:string; tipe?:string; ukuran?:string; tanggalUpload?:string; pengunggah?:string; url?:string; }
export interface SoalItem { id:string; mataPelajaran?:string; kelas?:string; bab?:string; kompetensi?:string; tipeSoal?:'Pilihan Ganda'|'Essay'|string; tingkatKesulitan?:'Mudah'|'Sedang'|'Sulit'; pertanyaan:string; opsi?:string[]; pilihanJawaban?:string[]; kunciJawaban:string; bobot?:number; bobotNilai?:number; status?:'Draft'|'Dipublikasikan'|string; tanggalDibuat?:string; }
export interface PaketSoal { id:string; judul:string; mataPelajaran:string; kelas:string; semester?:'Ganjil'|'Genap'; alokasiWaktuMenit:number; guruPembuat:string; tanggalDibuat:string; tanggalMulai?:string; jamMulai?:string; tanggalSelesai?:string; jamSelesai?:string; totalSoal:number; totalBobot:number; status:string; isPublished?:boolean; daftarSoal:SoalItem[]; }
export interface JawabanUjianSiswa { id:string; paketId:string; santriNis:string; santriNama:string; kelas:string; mataPelajaran:string; waktuSubmit:string; jawaban:Record<string,string>; nilaiOtomatis?:number; nilaiAkhir?:number; catatanGuru?:string; statusPenilaian:'Belum Dinilai'|'Sudah Dinilai'; dinilaiOleh?:string; }
export interface HariLiburItem { id:string; tanggalMulai:string; tanggalSelesai:string; keterangan:string; dibuatPada?:string; }
export interface KritikSaranItem { id:string; namaGuru:string; kodeGuru?:string|number; emailGuru?:string; judul:string; kategori:'Kurikulum'|'Kedisiplinan'|'Fasilitas'|'Santri'|'Lainnya'; pesan:string; tanggal:string; dibaca:boolean; arsip?:boolean; tanggapanPengasuh?:string; tanggalTanggapan?:string; }

export interface RaportSiswa { santri:Santri; tahunAjaran:string; semester:'Ganjil'|'Genap'; ranking:number; totalSantriKelas:number; nilaiMapel?:unknown[]; catatan?:string; }
export interface SiswaMuhafadzoh { nis:string; nama:string; kelas:string; tingkat:number; materiMuhafadzoh?:string; kitabMuhafadzoh?:string; targetTahunan?:number; targetBait?:number; nilaiUjianMuhafadzoh?:number|null; nilaiMuhafadzoh?:number|null; target1?:number;target2?:number;target3?:number;target4?:number;target5?:number;target6?:number;target7?:number;target8?:number;capaian1?:number|null;capaian2?:number|null;capaian3?:number|null;capaian4?:number|null;capaian5?:number|null;capaian6?:number|null;capaian7?:number|null;capaian8?:number|null; }

export interface NotifikasiItem { id:string; judul:string; pesan:string; dibaca:boolean; tanggal?:string; tautan?:string; tipe?:string; }
export interface AppUserAccount { id:string; name:string; username:string; password:string; role:UserRole; roleTitle:string; nipOrNis:string; email?:string; kelas?:string; status:'Aktif'|'Nonaktif'|string; }
export interface NavMenuItemConfig { id:string; page:string; title:string; iconName:string; category:string; visibleForAdmin:boolean; visibleForGuru:boolean; visibleForSiswa:boolean; badge?:string; order?:number; }
export interface KalenderPendidikanItem { id:string; kegiatan:string; tanggalMulai:string; tanggalSelesai?:string; kategori:'kbm'|'ujian'|'libur'|'pondok'|'muhafadzoh'; keterangan?:string; isLibur?:boolean; }
export type TipeSoal = 'Pilihan Ganda' | 'Essay' | string;
