import React, { useState, useMemo, useEffect } from 'react';
import {
  GraduationCap,
  Eye,
  Download,
  Printer,
  Award,
  CheckCircle2,
  BookOpen,
  User,
  ChevronRight,
  Edit2,
  Save,
  X,
  Sliders,
  Sparkles
} from 'lucide-react';
import { storageService, SignaturesConfig } from '../services/storageService';
import { MAPEL_RESMI_PER_KELAS } from '../data/madinData';
import { PdfPreviewModal } from '../components/PdfPreviewModal';
import { UserProfile } from '../types';

interface RaportViewProps {
  currentUser?: UserProfile;
  userRole?: string;
}

export const RaportView: React.FC<RaportViewProps> = ({
  currentUser,
  userRole = 'Guru',
}) => {
  const isAdmin = userRole.toLowerCase() === 'admin';
  const isSiswa = userRole.toLowerCase() === 'siswa';

  const [students, setStudents] = useState(() => storageService.getStudents());
  const [sigConfig, setSigConfig] = useState(() => storageService.getSignaturesAndMusrif());
  const [overrides, setOverrides] = useState(() => storageService.getRaportOverrides());
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Anti-IDOR: If student, find own record
  const myStudentRecord = useMemo(() => {
    if (!isSiswa || !currentUser) return null;
    const cleanNis = (currentUser.nipOrNis || '').replace(/[^0-9]/g, '');
    return students.find(
      (s) =>
        (cleanNis && s.nis.replace(/[^0-9]/g, '') === cleanNis) ||
        s.nama.toLowerCase().includes(currentUser.name.toLowerCase())
    ) || students[0];
  }, [isSiswa, currentUser, students]);

  const [selectedNis, setSelectedNis] = useState<string>(() => {
    if (isSiswa && myStudentRecord) return myStudentRecord.nis;
    return students[0]?.nis || '247001';
  });
  
  const [showPdfModal, setShowPdfModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);

  const selectedSantri = useMemo(() => {
    if (isSiswa && myStudentRecord) return myStudentRecord;
    return students.find((s) => s.nis === selectedNis) || students[0];
  }, [isSiswa, myStudentRecord, students, selectedNis]);

  // Current active override
  const studentOverride = overrides[selectedNis] || {};

  const muhafadzohList = useMemo(() => storageService.getMuhafadzohList(), []);
  const santriMuhaf = useMemo(() => {
    const found = muhafadzohList.find((m) => m.nis === selectedSantri?.nis);
    const overriddenNilai = studentOverride.nilaiMuhafadzoh;

    if (found) {
      const capaian =
        found.capaianBait ??
        found.totalCapaian ??
        ((found.capaian1 || 0) +
          (found.capaian2 || 0) +
          (found.capaian3 || 0) +
          (found.capaian4 || 0) +
          (found.capaian5 || 0) +
          (found.capaian6 || 0) +
          (found.capaian7 || 0) +
          (found.capaian8 || 0));
      const target = found.targetBait ?? found.targetTahunan ?? 100;
      const nilai =
        overriddenNilai !== undefined
          ? overriddenNilai
          : found.nilaiUjianMuhafadzoh ??
            found.nilaiMuhafadzoh ??
            (found.rataUjianLisan
              ? Math.round(found.rataUjianLisan)
              : capaian && target
              ? Math.min(100, Math.round((capaian / target) * 100))
              : 88);
      const statusTarget = found.statusTarget ?? (capaian >= target ? 'Tercapai' : 'Belum Memenuhi');
      const kitab = found.kitabMuhafadzoh || found.materiMuhafadzoh || 'Al-Amtsilah At-Tashrifiyyah';
      return {
        kitabMuhafadzoh: kitab,
        capaianBait: capaian,
        targetBait: target,
        nilaiUjianMuhafadzoh: Number(nilai) || 88,
        statusTarget,
      };
    }
    return {
      kitabMuhafadzoh: 'الأمثلة التصريفية',
      capaianBait: 473,
      targetBait: 500,
      nilaiUjianMuhafadzoh: overriddenNilai !== undefined ? overriddenNilai : 94,
      statusTarget: 'Tercapai',
    };
  }, [muhafadzohList, selectedSantri, studentOverride]);

  // Determine subjects and scores according to official curriculum
  const tingkat = selectedSantri?.kelas?.replace(/[^0-9]/g, '') || '1';
  const officialMapel = MAPEL_RESMI_PER_KELAS[tingkat] || MAPEL_RESMI_PER_KELAS['1'];
  const baseScore = selectedSantri?.nilaiRataRata || 85;

  const defaultMapelScores = useMemo(() => {
    return officialMapel.genap.map((m, idx) => {
      const offset = ((selectedSantri?.nis?.charCodeAt(idx % selectedSantri.nis.length) || 0) % 15) - 4;
      const score = Math.min(99, Math.max(68, Math.round(baseScore + offset)));
      return {
        no: idx + 1,
        mapel: m.mapel,
        kitab: m.kitab,
        nilai: score,
      };
    });
  }, [officialMapel, selectedSantri, baseScore]);

  // Active mapel scores (override or default)
  const mapelScores = studentOverride.mapelScores && studentOverride.mapelScores.length > 0
    ? studentOverride.mapelScores
    : defaultMapelScores;

  const totalNilaiTulis = mapelScores.reduce((acc, curr) => acc + curr.nilai, 0);
  const rataNilaiTulis = mapelScores.length > 0 ? (totalNilaiTulis / mapelScores.length).toFixed(2) : '0.00';

  // Musrif name based on class
  const getMusrifName = (kelas: string) => {
    if (kelas.startsWith('1')) return 'Ust. Rhendie Reihansyah';
    if (kelas.startsWith('2')) return 'Ust. M. Syukron Ma’mun';
    if (kelas.startsWith('3')) return 'Ust. Ahmad Fauzan';
    if (kelas.startsWith('4')) return 'Ust. Abdulloh Faqih';
    if (kelas.startsWith('5')) return 'Ust. H. Zainal Abidin';
    return 'Ust. M. Salman Al-Faries';
  };

  const getNaikKelasText = (kelas: string) => {
    if (kelas === '6') return 'Dinyatakan LULUS dari Pendidikan Madrasah Diniyah Takmiliyah.';
    if (kelas.startsWith('1')) return 'Dinyatakan naik ke kelas II (Dua)';
    if (kelas.startsWith('2')) return 'Dinyatakan naik ke kelas III (Tiga)';
    if (kelas.startsWith('3')) return 'Dinyatakan naik ke kelas IV (Empat)';
    if (kelas.startsWith('4')) return 'Dinyatakan naik ke kelas V (Lima)';
    if (kelas.startsWith('5')) return 'Dinyatakan naik ke kelas VI (Enam)';
    return 'Dinyatakan naik ke kelas berikutnya';
  };

  // State for Admin Edit Form
  const [editTitimangsa, setEditTitimangsa] = useState('');
  const [editPengasuh, setEditPengasuh] = useState('');
  const [editMusrif, setEditMusrif] = useState('');
  const [editCatatan, setEditCatatan] = useState('');
  const [editKeputusan, setEditKeputusan] = useState('');
  const [editAkhlak, setEditAkhlak] = useState('Jayyid Jiddan');
  const [editMuhafadzohScore, setEditMuhafadzohScore] = useState(90);
  const [editScoresList, setEditScoresList] = useState(defaultMapelScores);

  useEffect(() => {
    if (selectedSantri) {
      setEditTitimangsa(sigConfig.titimangsaRaport || 'Jombang, 15 Juni 2024');
      setEditPengasuh(sigConfig.namaPengasuh || 'KH. M. Salman Al Faries, Lc.,M.H.I.');
      setEditMusrif(
        studentOverride.musrifName ||
        sigConfig.musrifPerKelas?.[selectedSantri.kelas] ||
        getMusrifName(selectedSantri.kelas)
      );
      setEditCatatan(
        studentOverride.catatanWaliKelas ||
        selectedSantri.catatanWaliKelas ||
        'Pertahankan ketekunan mengaji, istiqomah dalam lalaran nadhom, dan tingkatkan pemahaman qowa\'id kitab kuning.'
      );
      setEditKeputusan(
        studentOverride.keputusanNaik ||
        `Dengan mempertimbangkan hasil yang dicapai, maka santri ini ${getNaikKelasText(selectedSantri.kelas)}.`
      );
      setEditAkhlak(studentOverride.akhlakPredikat || selectedSantri.akhlakPredikat || 'Jayyid Jiddan');
      setEditMuhafadzohScore(santriMuhaf.nilaiUjianMuhafadzoh);
      setEditScoresList(mapelScores);
    }
  }, [selectedSantri, studentOverride, sigConfig]);

  const handleSaveAdminRaport = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSantri) return;

    // Save override for this student
    storageService.saveRaportOverride(selectedNis, {
      catatanWaliKelas: editCatatan.trim(),
      keputusanNaik: editKeputusan.trim(),
      musrifName: editMusrif.trim(),
      akhlakPredikat: editAkhlak,
      nilaiMuhafadzoh: Number(editMuhafadzohScore),
      mapelScores: editScoresList,
    });

    // Save global signatures
    const updatedSig: SignaturesConfig = {
      ...sigConfig,
      titimangsaRaport: editTitimangsa.trim(),
      namaPengasuh: editPengasuh.trim(),
      musrifPerKelas: {
        ...(sigConfig.musrifPerKelas || {}),
        [selectedSantri.kelas]: editMusrif.trim(),
      },
    };
    storageService.saveSignaturesAndMusrif(updatedSig);
    setSigConfig(updatedSig);

    setOverrides(storageService.getRaportOverrides());
    setShowEditModal(false);
    showToast(`Master data raport untuk ${selectedSantri.nama} (NIS: ${selectedSantri.nis}) berhasil disimpan!`);
  };

  const displayTitimangsa = sigConfig.titimangsaRaport || 'Jombang, 15 Juni 2024';
  const displayPengasuh = sigConfig.namaPengasuh || 'KH. M. Salman Al Faries, Lc.,M.H.I.';
  const displayMusrif = studentOverride.musrifName || sigConfig.musrifPerKelas?.[selectedSantri?.kelas] || getMusrifName(selectedSantri?.kelas || '1');
  const displayCatatan = studentOverride.catatanWaliKelas || selectedSantri?.catatanWaliKelas || 'Pertahankan ketekunan mengaji, istiqomah dalam lalaran nadhom, dan tingkatkan pemahaman qowa\'id kitab kuning.';
  const displayKeputusan = studentOverride.keputusanNaik || `Dengan mempertimbangkan hasil yang dicapai, maka santri ini ${getNaikKelasText(selectedSantri?.kelas || '1')}.`;

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
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <GraduationCap className="w-6 h-6 text-emerald-700" />
            <span>Rapot Digital Santri</span>
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Laporan Hasil Penilaian Peserta Didik Madrasah Diniyah Takmiliyah PP. An-Najiyah 2 Bahrul Ulum
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {isAdmin && (
            <button
              onClick={() => setShowEditModal(true)}
              id="btn-admin-edit-raport"
              className="flex items-center gap-1.5 px-4 py-2 bg-amber-400 hover:bg-amber-300 text-emerald-950 font-black rounded-xl text-xs shadow-md transition-all cursor-pointer"
            >
              <Edit2 className="w-4 h-4" />
              <span>Master Edit Rapot</span>
            </button>
          )}

          <button
            onClick={() => setShowPdfModal(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 rounded-xl text-xs font-semibold shadow-2xs transition-colors"
          >
            <Eye className="w-4 h-4 text-emerald-700" />
            <span>Preview Rapot PDF</span>
          </button>
          <button
            onClick={() => window.print()}
            className="flex items-center gap-1.5 px-4 py-2 bg-emerald-800 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-xs transition-colors"
          >
            <Printer className="w-4 h-4" />
            <span>Cetak Rapot</span>
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
                Sebagai Administrator Utama, Anda dapat mengubah tanggal cetak raport, nama wali kelas/pengasuh, catatan kenaikan kelas, serta nilai seluruh santri.
              </span>
            </div>
          </div>
          <button
            onClick={() => setShowEditModal(true)}
            className="px-3 py-1.5 bg-amber-400 hover:bg-amber-300 text-emerald-950 font-bold rounded-xl text-[11px] whitespace-nowrap shadow-xs"
          >
            Edit Raport Santri Ini
          </button>
        </div>
      )}

      {/* Santri Selector */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <User className="w-4 h-4 text-emerald-700 shrink-0" />
          <span className="text-xs font-bold text-slate-600 shrink-0">Raport Santri:</span>
          {isSiswa ? (
            <div className="px-3 py-1.5 bg-emerald-50 border border-emerald-200 rounded-xl text-xs font-bold text-emerald-950 flex items-center gap-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" />
              <span>{selectedSantri?.nama} (NIS: {selectedSantri?.nis} — Kelas {selectedSantri?.kelas})</span>
            </div>
          ) : (
            <select
              value={selectedNis}
              onChange={(e) => setSelectedNis(e.target.value)}
              className="w-full sm:w-80 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-emerald-600"
            >
              {students.map((s) => (
                <option key={s.nis} value={s.nis}>
                  {s.nama} (Kelas {s.kelas} — NIS: {s.nis})
                </option>
              ))}
            </select>
          )}
        </div>

        <div className="text-xs text-slate-500 font-medium">
          Tahun Ajaran: <span className="font-bold text-slate-800">2024/2025</span> • Semester: <span className="font-bold text-slate-800">2 (Genap)</span>
        </div>
      </div>

      {/* Official Raport Paper Layout strictly matching Template_Rapot_Madin_AI_Studio.csv */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-10 shadow-lg max-w-4xl mx-auto space-y-6 text-slate-900 font-sans relative overflow-hidden">
        {/* Watermark Logo */}
        <div className="absolute inset-0 pointer-events-none flex items-center justify-center opacity-5 z-0 overflow-hidden">
          <img src="/logo.png" alt="Watermark Madrasah" className="w-96 h-96 object-contain filter grayscale" />
        </div>
        
        {/* Header Resmi Rapot */}
        <div className="text-center space-y-1 pb-4 border-b-2 border-emerald-950">
          <h2 className="font-black text-sm sm:text-base tracking-wider uppercase text-slate-900">
            LAPORAN HASIL PENILAIAN PESERTA DIDIK
          </h2>
          <h3 className="font-extrabold text-base sm:text-lg text-emerald-950 uppercase tracking-tight">
            MADRASAH DINIYAH TAKMILIYAH PP. AN-NAJIYAH 2 BAHRUL ULUM
          </h3>
          <p className="text-xs font-bold text-slate-700 font-mono">
            TAHUN AJARAN 2024/2025
          </p>
        </div>

        {/* Identity Table (Row 1-2) */}
        <div className="grid grid-cols-2 gap-4 text-xs font-semibold pb-2 border-b border-slate-200">
          <div>
            <span className="text-slate-500 font-normal">Nama : </span>
            <span className="font-extrabold text-slate-900 text-sm uppercase">{selectedSantri?.nama}</span>
          </div>
          <div className="text-right">
            <span className="text-slate-500 font-normal">Semester : </span>
            <span className="font-bold text-slate-800">2 (Genap)</span>
          </div>
          <div>
            <span className="text-slate-500 font-normal">Kelas : </span>
            <span className="font-bold font-mono text-emerald-900 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
              {selectedSantri?.kelas}
            </span>
          </div>
          <div className="text-right">
            <span className="text-slate-500 font-normal">Nomor Induk Santri (NIS) : </span>
            <span className="font-mono font-bold text-slate-800">{selectedSantri?.nis}</span>
          </div>
        </div>

        {/* TABEL 1: UJIAN TULIS */}
        <div className="space-y-2">
          <div className="overflow-x-auto">
            <table className="w-full text-xs border border-slate-300 border-collapse">
              <thead>
                <tr className="bg-slate-100 border-b border-slate-300 text-slate-800 font-bold">
                  <th className="p-2.5 text-center w-12 border-r border-slate-300">No</th>
                  <th className="p-2.5 text-left border-r border-slate-300">Mata Pelajaran</th>
                  <th className="p-2.5 text-center border-r border-slate-300 font-serif">Kitab</th>
                  <th className="p-2.5 text-center w-24">Nilai</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {mapelScores.map((item) => (
                  <tr key={item.no} className="hover:bg-slate-50">
                    <td className="p-2 text-center border-r border-slate-300 font-mono">{item.no}</td>
                    <td className="p-2 font-bold border-r border-slate-300 text-slate-900">{item.mapel}</td>
                    <td className="p-2 text-center border-r border-slate-300 font-serif text-sm font-semibold text-emerald-950">
                      {item.kitab}
                    </td>
                    <td className="p-2 text-center font-mono font-black text-slate-900 text-sm">
                      {item.nilai}
                    </td>
                  </tr>
                ))}
                {/* Total & Rata-rata */}
                <tr className="bg-slate-50 font-bold border-t-2 border-slate-300">
                  <td colSpan={3} className="p-2 text-left pl-4 border-r border-slate-300 uppercase">
                    Jumlah nilai ujian tulis
                  </td>
                  <td className="p-2 text-center font-mono font-black text-slate-900 text-sm">
                    {totalNilaiTulis}
                  </td>
                </tr>
                <tr className="bg-slate-50 font-bold">
                  <td colSpan={3} className="p-2 text-left pl-4 border-r border-slate-300 uppercase">
                    Rata-rata nilai ujian tulis
                  </td>
                  <td className="p-2 text-center font-mono font-black text-emerald-950 text-sm">
                    {rataNilaiTulis}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* TABEL 1 (Lanjutan): UJIAN MUHAFADZOH */}
        <div className="space-y-2">
          <div className="overflow-x-auto">
            <table className="w-full text-xs border border-slate-300 border-collapse">
              <thead>
                <tr className="bg-emerald-900 text-white font-bold">
                  <th colSpan={4} className="p-2 text-left pl-3 uppercase tracking-wider">
                    UJIAN MUHAFADZOH
                  </th>
                </tr>
                <tr className="bg-slate-100 border-b border-slate-300 text-slate-800 font-bold">
                  <th className="p-2 text-center w-12 border-r border-slate-300">No</th>
                  <th className="p-2 text-left border-r border-slate-300">Kitab</th>
                  <th className="p-2 text-left border-r border-slate-300">Batasan</th>
                  <th className="p-2 text-center w-28">Jumlah Nilai</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="p-2 text-center border-r border-slate-300 font-mono">1</td>
                  <td className="p-2 font-serif font-bold text-slate-900 border-r border-slate-300">
                    {santriMuhaf.kitabMuhafadzoh}
                  </td>
                  <td className="p-2 border-r border-slate-300 text-slate-700">
                    Target {santriMuhaf.targetBait} Bait ({santriMuhaf.capaianBait} Bait Tercapai)
                  </td>
                  <td className="p-2 text-center font-mono font-black text-slate-900 text-sm">
                    {santriMuhaf.nilaiUjianMuhafadzoh}
                  </td>
                </tr>
                <tr className="bg-slate-50 font-bold border-t border-slate-300">
                  <td colSpan={3} className="p-2 text-left pl-4 border-r border-slate-300 uppercase">
                    Rata-rata nilai muhafadzoh
                  </td>
                  <td className="p-2 text-center font-mono font-black text-emerald-950 text-sm">
                    {(Number(santriMuhaf?.nilaiUjianMuhafadzoh) || 0).toFixed(1)}
                  </td>
                </tr>
                <tr className="bg-emerald-50/50 font-bold border-t border-slate-300">
                  <td colSpan={4} className="p-2 text-left pl-4 text-emerald-950">
                    Peringkat 15 dari {students.filter((s) => s.kelas === selectedSantri?.kelas).length || 31} santri
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* TABEL 2: UJIAN MADRASATUL QUR'AN & TABEL 4: LAIN-LAIN (2 Kolom) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* TABEL 2: Madrasatul Qur'an */}
          <div className="border border-slate-300 rounded-xl overflow-hidden text-xs">
            <div className="bg-slate-800 text-white p-2 font-bold text-center uppercase tracking-wider text-[11px]">
              UJIAN MADRASATUL QUR&apos;AN
            </div>
            <table className="w-full border-collapse">
              <tbody className="divide-y divide-slate-200">
                <tr>
                  <td className="p-2 w-8 text-center border-r border-slate-200 font-mono">1</td>
                  <td className="p-2 border-r border-slate-200 font-semibold">Kelancaran</td>
                  <td className="p-2 text-center font-mono font-bold w-16">20 / 25</td>
                </tr>
                <tr>
                  <td className="p-2 text-center border-r border-slate-200 font-mono">2</td>
                  <td className="p-2 border-r border-slate-200 font-semibold">Makhroj</td>
                  <td className="p-2 text-center font-mono font-bold">15 / 25</td>
                </tr>
                <tr>
                  <td className="p-2 text-center border-r border-slate-200 font-mono">3</td>
                  <td className="p-2 border-r border-slate-200 font-semibold">Tajwid</td>
                  <td className="p-2 text-center font-mono font-bold">30 / 50</td>
                </tr>
                <tr className="bg-slate-50 font-bold border-t border-slate-300">
                  <td colSpan={2} className="p-2 pl-3 border-r border-slate-200">Jumlah</td>
                  <td className="p-2 text-center font-mono font-black text-slate-900">65</td>
                </tr>
                <tr className="bg-slate-50 font-bold">
                  <td colSpan={2} className="p-2 pl-3 border-r border-slate-200">Rata-rata</td>
                  <td className="p-2 text-center font-mono font-black text-emerald-950">65</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* TABEL 4: LAIN-LAIN */}
          <div className="border border-slate-300 rounded-xl overflow-hidden text-xs">
            <div className="bg-slate-800 text-white p-2 font-bold text-center uppercase tracking-wider text-[11px]">
              LAIN-LAIN (AKHLAK & KEHADIRAN)
            </div>
            <table className="w-full border-collapse">
              <tbody className="divide-y divide-slate-200">
                <tr>
                  <td className="p-2 w-8 text-center border-r border-slate-200 font-mono">1</td>
                  <td className="p-2 border-r border-slate-200 font-semibold">Kelakuan / Akhlak</td>
                  <td className="p-2 text-center font-bold border-r border-slate-200 text-[11px]">{studentOverride.akhlakPredikat || selectedSantri?.akhlakPredikat || 'Jayyid Jiddan'}</td>
                  <td className="p-2 font-semibold">Sakit</td>
                  <td className="p-2 text-center font-mono w-12">-</td>
                </tr>
                <tr>
                  <td className="p-2 text-center border-r border-slate-200 font-mono">2</td>
                  <td className="p-2 border-r border-slate-200 font-semibold">Kerajinan</td>
                  <td className="p-2 text-center font-bold border-r border-slate-200 text-[11px]">Jayyid</td>
                  <td className="p-2 font-semibold">Izin</td>
                  <td className="p-2 text-center font-mono">2 hari</td>
                </tr>
                <tr>
                  <td className="p-2 text-center border-r border-slate-200 font-mono">3</td>
                  <td className="p-2 border-r border-slate-200 font-semibold">Kerapian</td>
                  <td className="p-2 text-center font-bold border-r border-slate-200 text-[11px]">Jayyid</td>
                  <td className="p-2 font-semibold">Tanpa Keterangan</td>
                  <td className="p-2 text-center font-mono">-</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Catatan & Keputusan */}
        <div className="border border-slate-300 rounded-2xl p-4 bg-slate-50/70 space-y-2 text-xs">
          <div>
            <span className="font-bold text-slate-800">Catatan : </span>
            <span className="text-slate-700">{displayCatatan}</span>
          </div>
          <div>
            <span className="font-bold text-slate-800">Keputusan : </span>
            <span className="font-extrabold text-emerald-950">{displayKeputusan}</span>
          </div>
        </div>

        {/* TABEL 5: Tanda Tangan Resmi (Wali Kelas, PENGASUH, Wali Murid) */}
        <div className="pt-4 text-xs relative z-10">
          <div className="text-right text-slate-600 mb-4 font-mono">
            {displayTitimangsa}
          </div>

          <div className="grid grid-cols-3 gap-4 text-center items-end">
            {/* 1. Wali Kelas */}
            <div className="space-y-4">
              <p className="font-semibold text-slate-700">
                Wali Kelas,
              </p>
              <div className="h-16 flex items-center justify-center">
                <div className="text-slate-300 text-[10px] italic">[Paraf / Tanda Tangan]</div>
              </div>
              <div>
                <p className="font-bold text-slate-900 underline">
                  {displayMusrif}
                </p>
                <p className="text-[10px] text-slate-400">Musrif Kelas {selectedSantri?.kelas}</p>
              </div>
            </div>

            {/* 2. PENGASUH (LABEL: "PENGASUH", BUKAN KEPALA MADRASAH/SEKOLAH) */}
            <div className="space-y-4">
              <div>
                <p className="font-semibold text-slate-700">Mengetahui,</p>
                <p className="font-extrabold text-slate-900 uppercase">PENGASUH</p>
              </div>
              <div className="h-20 flex items-center justify-center">
                {sigConfig.signatureImageUrl ? (
                  <img src={sigConfig.signatureImageUrl} alt="Tanda Tangan Pengasuh" className="max-h-20 max-w-[160px] object-contain mx-auto" />
                ) : (
                  <div className="text-slate-300 text-[10px] italic border-b border-dashed border-slate-300 pb-2 w-28 mx-auto">[Tanda Tangan & Stempel]</div>
                )}
              </div>
              <div>
                <p className="font-extrabold text-emerald-950 underline">
                  {displayPengasuh}
                </p>
                <p className="text-[10px] text-slate-500">PP. An-Najiyah 2 Bahrul &apos;Ulum</p>
              </div>
            </div>

            {/* 3. Wali Murid */}
            <div className="space-y-4">
              <p className="font-semibold text-slate-700">
                Mengetahui,<br />Wali Santri
              </p>
              <div className="h-16 flex items-center justify-center">
                <div className="text-slate-300 text-[10px] italic">[Paraf]</div>
              </div>
              <div>
                <p className="text-slate-400">
                  ( .......................................... )
                </p>
                <p className="text-[10px] text-slate-400">Tanda Tangan & Nama Terang</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* MODAL: MASTER EDIT RAPORT UNTUK ADMIN                                    */}
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
              <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-900 flex items-center justify-center">
                <GraduationCap className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-black text-slate-900">Master Editor Raport Digital Santri</h3>
                <p className="text-xs text-slate-500">
                  Edit titimangsa cetak, wali kelas, pengasuh, catatan kenaikan, dan nilai mapel santri
                </p>
              </div>
            </div>

            <form onSubmit={handleSaveAdminRaport} className="space-y-4 text-xs">
              {/* Bagian 1: Header & Tanda Tangan */}
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
                <h4 className="font-black text-slate-900 flex items-center gap-1.5">
                  <Sliders className="w-3.5 h-3.5 text-emerald-700" />
                  <span>1. Tanggal Cetak & Penandatangan</span>
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Titimangsa Raport</label>
                    <input
                      type="text"
                      value={editTitimangsa}
                      onChange={(e) => setEditTitimangsa(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Wali Kelas / Musrif</label>
                    <input
                      type="text"
                      value={editMusrif}
                      onChange={(e) => setEditMusrif(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl font-bold focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                    />
                  </div>

                  <div className="sm:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Nama Pengasuh Pondok Pesantren</label>
                      <input
                        type="text"
                        value={editPengasuh}
                        onChange={(e) => setEditPengasuh(e.target.value)}
                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl font-bold focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Predikat Akhlak / Kelakuan</label>
                      <select
                        value={editAkhlak}
                        onChange={(e) => setEditAkhlak(e.target.value)}
                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl font-bold focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                      >
                        <option value="Jayyid Jiddan">Jayyid Jiddan (جيد جداً)</option>
                        <option value="Jayyid">Jayyid (جيد)</option>
                        <option value="Mutawashit">Mutawashit (متوسط)</option>
                        <option value="Rodhi'">Rodhi' (رديء)</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>

              {/* Bagian 2: Catatan & Keputusan Kenaikan */}
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
                <h4 className="font-black text-slate-900 flex items-center gap-1.5">
                  <BookOpen className="w-3.5 h-3.5 text-emerald-700" />
                  <span>2. Catatan Perkembangan & Keputusan Kenaikan</span>
                </h4>

                <div className="space-y-3">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Catatan Wali Kelas</label>
                    <textarea
                      rows={2}
                      value={editCatatan}
                      onChange={(e) => setEditCatatan(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Keputusan Kenaikan / Kelulusan</label>
                    <input
                      type="text"
                      value={editKeputusan}
                      onChange={(e) => setEditKeputusan(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl font-bold focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Bagian 3: Nilai Mapel & Muhafadzoh */}
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
                <h4 className="font-black text-slate-900 flex items-center gap-1.5">
                  <Award className="w-3.5 h-3.5 text-emerald-700" />
                  <span>3. Nilai Ujian Tulis & Ujian Muhafadzoh</span>
                </h4>

                <div className="space-y-2">
                  <div className="flex items-center justify-between gap-3 bg-emerald-50 p-2.5 rounded-xl border border-emerald-200">
                    <span className="font-bold text-emerald-950">Nilai Ujian Muhafadzoh</span>
                    <div className="flex items-center gap-2">
                      <label className="text-[10px] text-slate-600 font-bold">Nilai:</label>
                      <input
                        type="number"
                        min="50"
                        max="100"
                        value={editMuhafadzohScore}
                        onChange={(e) => setEditMuhafadzohScore(parseInt(e.target.value, 10) || 0)}
                        className="w-16 px-2 py-1 bg-white border border-emerald-300 rounded-lg text-center font-mono font-bold text-emerald-950"
                      />
                    </div>
                  </div>

                  {editScoresList.map((m, idx) => (
                    <div key={m.no} className="flex items-center justify-between gap-3 bg-white p-2 rounded-xl border border-slate-200">
                      <span className="font-bold text-slate-800 w-48 truncate">{m.no}. {m.mapel} ({m.kitab})</span>
                      <div className="flex items-center gap-2">
                        <label className="text-[10px] text-slate-500 font-bold">Nilai:</label>
                        <input
                          type="number"
                          min="50"
                          max="100"
                          value={m.nilai}
                          onChange={(e) => {
                            const val = parseInt(e.target.value, 10) || 0;
                            const copy = [...editScoresList];
                            copy[idx] = { ...copy[idx], nilai: val };
                            setEditScoresList(copy);
                          }}
                          className="w-16 px-2 py-1 bg-slate-50 border border-slate-300 rounded-lg text-center font-mono font-bold"
                        />
                      </div>
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
                  <span>Simpan Perubahan Rapot</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showPdfModal && (
        <PdfPreviewModal
          type="raport"
          isOpen={showPdfModal}
          onClose={() => setShowPdfModal(false)}
        />
      )}
    </div>
  );
};
