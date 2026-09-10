import React, { useState, useMemo, useEffect } from 'react';
import {
  Award,
  Eye,
  Download,
  Printer,
  FileText,
  User,
  CheckCircle2,
  Calendar,
  Layers,
  ShieldCheck,
  ShieldAlert,
  Edit2,
  Save,
  X,
  Plus,
  Sliders,
  Sparkles
} from 'lucide-react';
import { storageService } from '../services/storageService';
import { PdfPreviewModal } from '../components/PdfPreviewModal';
import { UserProfile } from '../types';

interface IjazahViewProps {
  currentUser?: UserProfile;
  userRole?: string;
}

export const IjazahView: React.FC<IjazahViewProps> = ({
  currentUser,
  userRole = 'Guru',
}) => {
  const isAdmin = userRole.toLowerCase() === 'admin';
  const isSiswa = userRole.toLowerCase() === 'siswa';
  const isKelas6 = Boolean(
    currentUser?.kelas?.includes('6') ||
    currentUser?.roleTitle?.includes('Kelas 6')
  );

  const [students, setStudents] = useState(() => storageService.getStudents());
  const [sigConfig, setSigConfig] = useState(() => storageService.getSignaturesAndMusrif());
  const [overrides, setOverrides] = useState(() => storageService.getIjazahOverrides());
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Filter santri kelas 6 or all students
  const kelas6Students = useMemo(() => {
    const k6 = students.filter((s) => s.kelas === '6');
    return k6.length > 0 ? k6 : students;
  }, [students]);

  // Anti-IDOR: If student, find their own record only
  const myStudentRecord = useMemo(() => {
    if (!isSiswa || !currentUser) return null;
    const cleanNis = (currentUser.nipOrNis || '').replace(/[^0-9]/g, '');
    return students.find(
      (s) =>
        (cleanNis && s.nis.replace(/[^0-9]/g, '') === cleanNis) ||
        s.nama.toLowerCase().includes(currentUser.name.toLowerCase())
    ) || kelas6Students[0];
  }, [isSiswa, currentUser, students, kelas6Students]);

  const [selectedNis, setSelectedNis] = useState<string>(() => {
    if (isSiswa && myStudentRecord) return myStudentRecord.nis;
    return kelas6Students[0]?.nis || '247001';
  });

  const [activePage, setActivePage] = useState<'depan' | 'belakang'>('depan');
  const [showPdfModal, setShowPdfModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);

  const selectedSantri = useMemo(() => {
    if (isSiswa && myStudentRecord) return myStudentRecord;
    return students.find((s) => s.nis === selectedNis) || kelas6Students[0];
  }, [isSiswa, myStudentRecord, students, selectedNis, kelas6Students]);

  // Current active override for this student
  const studentOverride = overrides[selectedNis] || {};

  // Form State for Admin Edit
  const [editNama, setEditNama] = useState('');
  const [editNis, setEditNis] = useState('');
  const [editTempatLahir, setEditTempatLahir] = useState('');
  const [editTanggalLahir, setEditTanggalLahir] = useState('');
  const [editNomorIjazah, setEditNomorIjazah] = useState('');
  const [editTitimangsa, setEditTitimangsa] = useState('');
  const [editPengasuh, setEditPengasuh] = useState('');
  const [editStatusKelulusan, setEditStatusKelulusan] = useState('L U L U S');
  
  // 7 Mapel Ujian Akhir
  const defaultMapelScores = [
    { no: 1, mapel: 'Tasawwuf', angka: 93, huruf: 'Sembilan puluh tiga' },
    { no: 2, mapel: 'Fiqih', angka: 88, huruf: 'Delapan puluh delapan' },
    { no: 3, mapel: 'Tauhid', angka: 85, huruf: 'Delapan puluh lima' },
    { no: 4, mapel: 'Aswaja', angka: 90, huruf: 'Sembilan puluh' },
    { no: 5, mapel: 'Baca Kitab', angka: 87, huruf: 'Delapan puluh tujuh' },
    { no: 6, mapel: 'Baca Al-Qur’an', angka: 86, huruf: 'Delapan puluh enam' },
    { no: 7, mapel: 'Muhafadhoh', angka: 92, huruf: 'Sembilan puluh dua' },
  ];

  const [editMapelScores, setEditMapelScores] = useState(defaultMapelScores);

  // Sync form when selected student or overrides change
  useEffect(() => {
    if (selectedSantri) {
      setEditNama(studentOverride.namaSantri || selectedSantri.nama);
      setEditNis(studentOverride.nis || selectedSantri.nis);
      setEditTempatLahir(studentOverride.tempatLahir || selectedSantri.tempatLahir || 'Jombang');
      setEditTanggalLahir(studentOverride.tanggalLahir || selectedSantri.tanggalLahir || '12 Mei 2012');
      setEditNomorIjazah(studentOverride.nomorIjazah || `037/PP.ANJ2/BU/V/${selectedSantri.nis}`);
      setEditTitimangsa(sigConfig.titimangsaIjazah || '30 Mei 2026');
      setEditPengasuh(sigConfig.namaPengasuh || 'KH. M. Salman Al Faries, Lc.,M.H.I.');
      setEditStatusKelulusan(studentOverride.statusKelulusan || 'L U L U S');

      if (studentOverride.nilaiMapel && studentOverride.nilaiMapel.length > 0) {
        setEditMapelScores(studentOverride.nilaiMapel);
      } else {
        setEditMapelScores(defaultMapelScores);
      }
    }
  }, [selectedSantri, studentOverride, sigConfig]);

  // RBAC: If student is not in Class 6, forbid access completely
  if (isSiswa && !isKelas6) {
    return (
      <div className="p-8 text-center bg-white rounded-3xl border border-rose-200 shadow-sm max-w-lg mx-auto my-12">
        <ShieldAlert className="w-12 h-12 text-rose-600 mx-auto mb-3" />
        <h2 className="text-lg font-black text-slate-900 mb-2">Akses Ijazah Dibatasi</h2>
        <p className="text-xs text-slate-600 leading-relaxed">
          Dokumen dan menu Ijazah Kelulusan hanya diperuntukkan bagi santri tingkat akhir (Kelas 6). Anda terdaftar sebagai santri aktif {currentUser?.kelas ? `Kelas ${currentUser.kelas}` : ''}.
        </p>
      </div>
    );
  }

  // Number to Indonesian words converter
  const angkaKeHuruf = (nilai: number): string => {
    const words: Record<number, string> = {
      95: 'Sembilan puluh lima',
      94: 'Sembilan puluh empat',
      93: 'Sembilan puluh tiga',
      92: 'Sembilan puluh dua',
      91: 'Sembilan puluh satu',
      90: 'Sembilan puluh',
      89: 'Delapan puluh sembilan',
      88: 'Delapan puluh delapan',
      87: 'Delapan puluh tujuh',
      86: 'Delapan puluh enam',
      85: 'Delapan puluh lima',
      84: 'Delapan puluh empat',
      83: 'Delapan puluh tiga',
      82: 'Delapan puluh dua',
      81: 'Delapan puluh satu',
      80: 'Delapan puluh',
      78: 'Tujuh puluh delapan',
      75: 'Tujuh puluh lima',
    };
    return words[nilai] || `${nilai}`;
  };

  // Active display values (prioritize overrides)
  const displayNama = studentOverride.namaSantri || selectedSantri?.nama || 'Santri Terdaftar';
  const displayNis = studentOverride.nis || selectedSantri?.nis || '247001';
  const displayNomorIjazah = studentOverride.nomorIjazah || `037/PP.ANJ2/BU/V/${displayNis}`;
  const displayTitimangsa = sigConfig.titimangsaIjazah || '30 Mei 2026';
  const displayPengasuh = sigConfig.namaPengasuh || 'KH. M. Salman Al Faries, Lc.,M.H.I.';
  const displayStatus = studentOverride.statusKelulusan || 'L U L U S';
  const displayScores = studentOverride.nilaiMapel || defaultMapelScores;

  const totalNilai = displayScores.reduce((a, b) => a + Number(b.angka), 0);
  const rataRataNilai = (totalNilai / displayScores.length).toFixed(2);

  const handleSaveAdminEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSantri) return;

    // Save student override
    storageService.saveIjazahOverride(selectedNis, {
      namaSantri: editNama.trim(),
      nis: editNis.trim(),
      tempatLahir: editTempatLahir.trim(),
      tanggalLahir: editTanggalLahir.trim(),
      nomorIjazah: editNomorIjazah.trim(),
      statusKelulusan: editStatusKelulusan.trim(),
      nilaiMapel: editMapelScores.map((m) => ({
        ...m,
        huruf: angkaKeHuruf(Number(m.angka)),
      })),
    });

    // Save global signatures if changed
    const updatedSig = {
      ...sigConfig,
      titimangsaIjazah: editTitimangsa.trim(),
      namaPengasuh: editPengasuh.trim(),
    };
    storageService.saveSignaturesAndMusrif(updatedSig);
    setSigConfig(updatedSig);

    // If student name changed, update student record in main database too
    if (editNama.trim() !== selectedSantri.nama) {
      storageService.updateSantri(selectedSantri.id, {
        nama: editNama.trim(),
        tempatLahir: editTempatLahir.trim(),
        tanggalLahir: editTanggalLahir.trim(),
      });
      setStudents(storageService.getStudents());
    }

    setOverrides(storageService.getIjazahOverrides());
    setShowEditModal(false);
    showToast(`Data Ijazah & Transkrip Nilai untuk ${editNama} berhasil diperbarui!`);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-4 py-3 rounded-2xl shadow-2xl text-xs font-bold flex items-center gap-3 border border-slate-700 animate-in fade-in slide-in-from-bottom-5">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-400 text-emerald-950">
              Khusus Santri Kelas 6 (Tingkat Akhir)
            </span>
            <span className="text-xs font-semibold text-emerald-800">
              Pondok Pesantren An-Najiyah 2 Bahrul &apos;Ulum
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <Award className="w-6 h-6 text-emerald-700" />
            <span>Ijazah Kelulusan Santri</span>
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Format Ijazah Resmi Madrasah Diniyah Takmiliyah
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {isAdmin && (
            <button
              onClick={() => setShowEditModal(true)}
              id="btn-admin-edit-ijazah"
              className="flex items-center gap-1.5 px-4 py-2 bg-amber-400 hover:bg-amber-300 text-emerald-950 font-black rounded-xl text-xs shadow-md transition-all cursor-pointer"
            >
              <Edit2 className="w-4 h-4" />
              <span>Master Edit Ijazah</span>
            </button>
          )}

          <button
            onClick={() => setShowPdfModal(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 rounded-xl text-xs font-semibold shadow-2xs transition-colors"
          >
            <Eye className="w-4 h-4 text-emerald-700" />
            <span>Preview Ijazah PDF</span>
          </button>
          <button
            onClick={() => window.print()}
            className="flex items-center gap-1.5 px-4 py-2 bg-emerald-800 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-xs transition-colors"
          >
            <Printer className="w-4 h-4" />
            <span>Cetak Ijazah</span>
          </button>
        </div>
      </div>

      {/* Admin Notice Bar */}
      {isAdmin && (
        <div className="bg-gradient-to-r from-amber-50 to-emerald-50 border border-amber-200/80 rounded-2xl p-3.5 sm:p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2.5">
            <Sliders className="w-4 h-4 text-amber-700 shrink-0" />
            <div>
              <span className="font-extrabold text-emerald-950">Mode Web Architect & Master Editor Aktif: </span>
              <span className="text-slate-700">
                Anda dapat mengubah tanggal cetak, nomor ijazah, nama santri, maupun nilai ujian akhir jika terdapat data yang kurang tepat.
              </span>
            </div>
          </div>
          <button
            onClick={() => setShowEditModal(true)}
            className="px-3 py-1.5 bg-amber-400 hover:bg-amber-300 text-emerald-950 font-bold rounded-xl text-[11px] whitespace-nowrap shadow-xs"
          >
            Edit Ijazah Santri Ini
          </button>
        </div>
      )}

      {/* Santri Selector Bar */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <User className="w-4 h-4 text-emerald-700 shrink-0" />
          <span className="text-xs font-bold text-slate-700 shrink-0">Ijazah Santri:</span>
          {isSiswa ? (
            <div className="px-3 py-1.5 bg-emerald-50 border border-emerald-200 rounded-xl text-xs font-bold text-emerald-950 flex items-center gap-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" />
              <span>{displayNama} (NIS: {displayNis} — Kelas {selectedSantri?.kelas})</span>
            </div>
          ) : (
            <select
              value={selectedNis}
              onChange={(e) => setSelectedNis(e.target.value)}
              className="w-full sm:w-80 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-emerald-600"
            >
              <optgroup label="🎓 Santri Kelas 6 (Tingkat Akhir)">
                {kelas6Students.map((s) => (
                  <option key={s.nis} value={s.nis}>
                    {s.nama} (Kelas {s.kelas} — NIS: {s.nis})
                  </option>
                ))}
              </optgroup>
            </select>
          )}
        </div>

        {/* Page Switcher */}
        <div className="inline-flex rounded-xl bg-slate-100 p-1">
          <button
            onClick={() => setActivePage('depan')}
            className={`px-3 py-1 text-xs font-bold rounded-lg transition-colors ${
              activePage === 'depan'
                ? 'bg-emerald-800 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Halaman Depan (Sertifikat)
          </button>
          <button
            onClick={() => setActivePage('belakang')}
            className={`px-3 py-1 text-xs font-bold rounded-lg transition-colors ${
              activePage === 'belakang'
                ? 'bg-emerald-800 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Halaman Belakang (Daftar Nilai)
          </button>
        </div>
      </div>

      {/* HALAMAN DEPAN: SERTIFIKAT IJAZAH */}
      {activePage === 'depan' && (
        <div className="bg-white border-8 border-double border-amber-600/60 rounded-3xl p-6 sm:p-12 shadow-xl max-w-4xl mx-auto space-y-6 text-center text-slate-900 relative overflow-hidden">
          {/* Watermark Logo */}
          <div className="absolute inset-0 pointer-events-none flex items-center justify-center opacity-5 z-0 overflow-hidden">
            <img src="/logo.png" alt="Watermark Madrasah" className="w-96 h-96 object-contain filter grayscale" />
          </div>
          {/* Header Logo & Arab */}
          <div className="space-y-2 flex flex-col items-center">
            <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-emerald-50 border-2 border-amber-500/50 flex items-center justify-center p-2 shadow-sm mb-1">
              <img src="/logo.png" alt="Logo Madrasah Diniyah" className="w-full h-full object-contain" />
            </div>
            <p className="font-serif font-black text-xl sm:text-2xl text-emerald-950">
              المعهد الإسلامي الناجية ٢ بحر العلوم
            </p>
            <h2 className="font-serif font-black text-2xl sm:text-4xl text-amber-900 tracking-widest uppercase pt-2">
              I J A Z A H
            </h2>
            <h3 className="font-extrabold text-sm sm:text-base text-slate-900 uppercase tracking-wide">
              MADRASAH DINIYAH
            </h3>
            <h4 className="font-black text-base sm:text-lg text-emerald-950 uppercase tracking-tight">
              PONDOK PESANTREN AN-NAJIYAH 2 BAHRUL ‘ULUM
            </h4>
            <p className="text-xs font-bold text-slate-700 tracking-wider uppercase">
              TAMBAKBERAS JOMBANG JAWA TIMUR
            </p>
            <p className="text-xs text-slate-500 font-mono pt-1">
              Tahun Pelajaran : 1446 – 1447 H / 2025 – 2026
            </p>
            <p className="text-xs font-mono font-semibold text-slate-600">
              Nomor : {displayNomorIjazah}
            </p>
          </div>

          {/* Pengantar & Nama Santri */}
          <div className="max-w-2xl mx-auto space-y-4 text-xs sm:text-sm leading-relaxed text-slate-800 pt-2">
            <p>
              Yang bertandatangan dibawah ini, Pengasuh Pondok Pesantren An-Najiyah 2 Bahrul ‘Ulum Tambakberas Jombang menerangkan bahwa :
            </p>

            <div className="py-2.5 my-2 border-y-2 border-amber-600/30 bg-amber-50/40 rounded-2xl">
              <h3 className="text-xl sm:text-3xl font-serif font-black text-emerald-950 tracking-wide uppercase">
                {displayNama}
              </h3>
              <p className="text-xs text-slate-500 font-mono mt-0.5">
                Nomor Induk Santri: {displayNis}
              </p>
            </div>

            <p className="font-bold text-slate-800">Dinyatakan :</p>

            <div className="inline-block px-10 py-2 bg-emerald-900 text-amber-300 font-serif font-extrabold text-2xl sm:text-3xl rounded-2xl shadow-md border border-amber-400">
              {displayStatus}
            </div>

            <p className="text-xs sm:text-sm text-slate-700 leading-relaxed pt-1">
              Dari Pendidikan Madrasah Diniyah Takmiliyah Pondok Pesantren An-Najiyah 2 Bahrul ‘Ulum Tambakberas Jombang berdasarkan Ujian Akhir Madrasah Diniyah yang diselenggarakan pada tanggal 25 Syawal s.d. 29 Syawal 1447 H / 14 April s.d. 18 Maret 2026.
            </p>
          </div>

          {/* Titimangsa & Tanda Tangan PENGASUH */}
          <div className="pt-6 grid grid-cols-1 sm:grid-cols-2 items-center gap-6 text-xs max-w-2xl mx-auto">
            {/* Foto Santri & Cap */}
            <div className="flex flex-col items-center sm:items-start">
              <div className="w-24 h-32 rounded-xl border-2 border-slate-300 p-1 bg-white shadow-xs relative flex items-center justify-center text-slate-400 font-mono text-[10px]">
                <span>Foto Santri 3x4</span>
                <div className="absolute -bottom-2 -right-2 w-9 h-9 rounded-full bg-emerald-900 text-amber-300 flex items-center justify-center text-[8px] font-bold border border-amber-300">
                  CAP
                </div>
              </div>
            </div>

            {/* Tanda Tangan Pengasuh */}
            <div className="text-center sm:text-right space-y-1">
              <p className="text-slate-600">Jombang, 13 Dzulhijjah 1447 H</p>
              <p className="text-slate-800 font-medium">{displayTitimangsa}</p>
              <p className="font-bold text-slate-900 pt-1 uppercase text-xs">
                Pengasuh PP. An-Najiyah 2 Bahrul ‘Ulum
              </p>

              <div className="h-16 flex items-center justify-center sm:justify-end my-1">
                <span className="font-serif italic font-bold text-emerald-900 text-sm border-b-2 border-emerald-800 pb-0.5">
                  [Tanda Tangan & Stempel Pengasuh]
                </span>
              </div>

              <p className="font-black text-emerald-950 text-sm">
                {displayPengasuh}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* HALAMAN BELAKANG: DAFTAR NILAI UJIAN AKHIR */}
      {activePage === 'belakang' && (
        <div className="bg-white border-8 border-double border-amber-600/60 rounded-3xl p-6 sm:p-12 shadow-xl max-w-4xl mx-auto space-y-6 text-slate-900 relative overflow-hidden">
          {/* Watermark Logo */}
          <div className="absolute inset-0 pointer-events-none flex items-center justify-center opacity-5 z-0 overflow-hidden">
            <img src="/logo.png" alt="Watermark Madrasah" className="w-96 h-96 object-contain filter grayscale" />
          </div>
          {/* Header Nilai */}
          <div className="text-center space-y-1 border-b-2 border-slate-200 pb-4">
            <h2 className="font-black text-base sm:text-lg text-slate-900 uppercase tracking-wide">
              DAFTAR NILAI UJIAN AKHIR MADRASAH DINIYAH
            </h2>
            <h3 className="font-extrabold text-base sm:text-lg text-emerald-950 uppercase tracking-tight">
              PONDOK PESANTREN AN-NAJIYAH 2 BAHRUL ‘ULUM
            </h3>
            <p className="text-xs font-bold text-slate-700 tracking-wider uppercase">
              TAMBAKBERAS JOMBANG
            </p>
            <p className="text-xs text-slate-500 font-mono">
              TAHUN PELAJARAN 2025 – 2026
            </p>
          </div>

          {/* Identity Santri */}
          <div className="text-xs font-semibold space-y-1">
            <p className="text-slate-600">Dari :</p>
            <div className="grid grid-cols-2 gap-2 bg-slate-50 p-3 rounded-xl border border-slate-200">
              <div>Nama Santri : <span className="font-bold text-slate-900 uppercase">{displayNama}</span></div>
              <div>Nomor Induk Santri : <span className="font-mono font-bold text-slate-900">{displayNis}</span></div>
            </div>
          </div>

          {/* Tabel Nilai Ujian Akhir */}
          <div className="overflow-x-auto">
            <table className="w-full text-xs border border-slate-300 border-collapse">
              <thead>
                <tr className="bg-slate-100 border-b border-slate-300 text-slate-800 font-bold">
                  <th className="p-2.5 text-center w-12 border-r border-slate-300">No</th>
                  <th className="p-2.5 text-left border-r border-slate-300">Mata Pelajaran</th>
                  <th className="p-2.5 text-center w-24 border-r border-slate-300">Angka</th>
                  <th className="p-2.5 text-left">Huruf</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {displayScores.map((row) => (
                  <tr key={row.no} className="hover:bg-slate-50">
                    <td className="p-2 text-center border-r border-slate-300 font-mono">{row.no}</td>
                    <td className="p-2 font-bold border-r border-slate-300 text-slate-900">{row.mapel}</td>
                    <td className="p-2 text-center border-r border-slate-300 font-mono font-black text-sm">
                      {row.angka}
                    </td>
                    <td className="p-2 italic text-slate-700">{row.huruf || angkaKeHuruf(Number(row.angka))}</td>
                  </tr>
                ))}
                {/* JUMLAH NILAI */}
                <tr className="bg-slate-50 font-bold border-t-2 border-slate-300">
                  <td colSpan={2} className="p-2 text-left pl-4 border-r border-slate-300 uppercase">
                    JUMLAH NILAI
                  </td>
                  <td className="p-2 text-center font-mono font-black text-slate-900 text-sm border-r border-slate-300">
                    {totalNilai}
                  </td>
                  <td className="p-2 italic text-slate-800">
                    Total Nilai Kumulatif Ujian
                  </td>
                </tr>
                {/* RATA-RATA */}
                <tr className="bg-slate-50 font-bold">
                  <td colSpan={2} className="p-2 text-left pl-4 border-r border-slate-300 uppercase">
                    RATA-RATA
                  </td>
                  <td className="p-2 text-center font-mono font-black text-emerald-950 text-sm border-r border-slate-300">
                    {rataRataNilai}
                  </td>
                  <td className="p-2 italic text-emerald-900">
                    Predikat Rata-Rata
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Tanda Tangan Pengasuh Daftar Nilai */}
          <div className="pt-6 flex justify-end text-xs">
            <div className="text-right space-y-1">
              <p className="text-slate-600">Jombang, 13 Sya’ban 1446 H</p>
              <p className="text-slate-800 font-medium">{displayTitimangsa}</p>
              <p className="font-bold text-slate-900 pt-1 uppercase text-xs">
                Pengasuh PP. An-Najiyah 2 Bahrul ‘Ulum
              </p>

              <div className="h-16 flex items-center justify-end my-1">
                <span className="font-serif italic font-bold text-emerald-900 text-sm border-b-2 border-emerald-800 pb-0.5">
                  [Tanda Tangan & Stempel Pengasuh]
                </span>
              </div>

              <p className="font-black text-emerald-950 text-sm">
                {displayPengasuh}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: ADMIN MASTER EDIT IJAZAH & NILAI KELULUSAN                        */}
      {/* ========================================================================= */}
      {showEditModal && isAdmin && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-xs animate-in fade-in overflow-y-auto">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-2xl w-full shadow-2xl space-y-5 relative my-8">
            <button
              onClick={() => setShowEditModal(false)}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-700 rounded-full hover:bg-slate-100 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
              <div className="w-10 h-10 rounded-2xl bg-amber-100 text-amber-900 flex items-center justify-center">
                <Award className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-black text-slate-900">Master Editor Ijazah & Transkrip Nilai</h3>
                <p className="text-xs text-slate-500">
                  Ubah data santri, titimangsa cetak, nomor ijazah, dan nilai 7 mapel ujian
                </p>
              </div>
            </div>

            <form onSubmit={handleSaveAdminEdit} className="space-y-4 text-xs">
              {/* Bagian 1: Identitas & Cetak */}
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
                <h4 className="font-black text-slate-900 flex items-center gap-1.5">
                  <Sliders className="w-3.5 h-3.5 text-emerald-700" />
                  <span>1. Pengaturan Header & Cetak Ijazah</span>
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Nomor Ijazah</label>
                    <input
                      type="text"
                      value={editNomorIjazah}
                      onChange={(e) => setEditNomorIjazah(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl font-mono focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Titimangsa Cetak Depan/Belakang</label>
                    <input
                      type="text"
                      value={editTitimangsa}
                      onChange={(e) => setEditTitimangsa(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block font-bold text-slate-700 mb-1">Nama Pengasuh Pondok Pesantren</label>
                    <input
                      type="text"
                      value={editPengasuh}
                      onChange={(e) => setEditPengasuh(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl font-bold focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Bagian 2: Biodata Santri */}
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
                <h4 className="font-black text-slate-900 flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-emerald-700" />
                  <span>2. Biodata Santri Terpilih</span>
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Nama Santri</label>
                    <input
                      type="text"
                      value={editNama}
                      onChange={(e) => setEditNama(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl font-bold focus:ring-2 focus:ring-emerald-600 focus:outline-none uppercase"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Nomor Induk Santri (NIS)</label>
                    <input
                      type="text"
                      value={editNis}
                      onChange={(e) => setEditNis(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl font-mono focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Tempat Lahir</label>
                    <input
                      type="text"
                      value={editTempatLahir}
                      onChange={(e) => setEditTempatLahir(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Tanggal Lahir</label>
                    <input
                      type="text"
                      value={editTanggalLahir}
                      onChange={(e) => setEditTanggalLahir(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Bagian 3: Nilai Ujian Akhir 7 Mapel */}
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
                <h4 className="font-black text-slate-900 flex items-center gap-1.5">
                  <Award className="w-3.5 h-3.5 text-emerald-700" />
                  <span>3. Nilai 7 Mata Pelajaran Ujian Akhir (Transkrip Belakang)</span>
                </h4>

                <div className="space-y-2">
                  {editMapelScores.map((m, idx) => (
                    <div key={m.no} className="flex items-center justify-between gap-3 bg-white p-2 rounded-xl border border-slate-200">
                      <span className="font-bold text-slate-800 w-36 sm:w-48 truncate">{m.no}. {m.mapel}</span>
                      <div className="flex items-center gap-2">
                        <label className="text-[10px] text-slate-500 font-bold">Angka:</label>
                        <input
                          type="number"
                          min="50"
                          max="100"
                          value={m.angka}
                          onChange={(e) => {
                            const val = parseInt(e.target.value, 10) || 0;
                            const copy = [...editMapelScores];
                            copy[idx] = { ...copy[idx], angka: val, huruf: angkaKeHuruf(val) };
                            setEditMapelScores(copy);
                          }}
                          className="w-16 px-2 py-1 bg-slate-50 border border-slate-300 rounded-lg text-center font-mono font-bold"
                        />
                      </div>
                      <span className="text-[11px] text-slate-500 italic hidden sm:inline w-40 truncate">
                        {m.huruf || angkaKeHuruf(m.angka)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold transition-colors cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-emerald-800 hover:bg-emerald-700 text-white rounded-xl font-bold transition-all shadow-md cursor-pointer flex items-center justify-center gap-2"
                >
                  <Save className="w-4 h-4" />
                  <span>Simpan Perubahan Ijazah</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showPdfModal && (
        <PdfPreviewModal
          type="ijazah"
          isOpen={showPdfModal}
          onClose={() => setShowPdfModal(false)}
        />
      )}
    </div>
  );
};
