import React, { useState } from 'react';
import {
  ClipboardCheck,
  Search,
  Filter,
  Check,
  AlertTriangle,
  Printer,
  Calendar,
  MapPin,
  BookOpen,
  UserCheck,
  Users,
  CheckCheck,
  Download,
  Info,
  CalendarOff,
  BellRing
} from 'lucide-react';
import { SesiAbsensi, StatusAbsensi, UserProfile } from '../types';
import { PdfPreviewModal } from '../components/PdfPreviewModal';
import { storageService } from '../services/storageService';

interface AbsensiViewProps {
  session?: SesiAbsensi;
  onSaveSession?: (updatedSession: SesiAbsensi) => void;
  userRole?: string;
  currentUser?: UserProfile;
}

export const AbsensiView: React.FC<AbsensiViewProps> = ({
  session = storageService.getAbsensiSession(),
  onSaveSession = (_updatedSession: SesiAbsensi) => {},
  userRole = 'Guru',
  currentUser,
}) => {
  const isSiswa = userRole.toLowerCase() === 'siswa';
  const isGuru = userRole.toLowerCase() === 'guru';
  const isAdmin = userRole.toLowerCase() === 'admin';

  // Check Hari Libur
  const hariLiburList = storageService.getHariLibur();
  const activeHoliday = hariLiburList.find((h) => {
    return (
      (session.tanggal && (session.tanggal.includes(h.tanggalMulai) || session.tanggal.includes(h.tanggalSelesai))) ||
      session.tanggal?.toLowerCase().includes('libur')
    );
  });
  const isLibur = Boolean(activeHoliday);

  const canEdit = !isSiswa && !isLibur;

  // Assigned classes for Guru
  const assignedClasses = React.useMemo(() => {
    if (!currentUser?.kelas) return [];
    return currentUser.kelas.split(',').map((c) => c.trim());
  }, [currentUser]);

  const [selectedKelas, setSelectedKelas] = useState(() => {
    if (assignedClasses.length > 0) {
      const first = assignedClasses[0];
      return first.startsWith('Kelas ') ? first : `Kelas ${first}`;
    }
    return 'Kelas 1A';
  });
  const [selectedMapel, setSelectedMapel] = useState(session.mataPelajaran || 'Fiqih (فصلاتن)');
  const [selectedTanggal, setSelectedTanggal] = useState(
  isGuru
    ? new Date().toISOString().split('T')[0]
    : session.tanggal || new Date().toISOString().split('T')[0]
);
  const [selectedRuang, setSelectedRuang] = useState('Teras Kompleks Umar');
  
  const [records, setRecords] = useState(session.records || []);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('Semua');
  const [saveToast, setSaveToast] = useState(false);
  const [isCompleted, setIsCompleted] = useState(session.isCompleted);
  const [showPdfModal, setShowPdfModal] = useState(false);

  // Sync if session prop changes
  React.useEffect(() => {
    if (session.records) {
      setRecords(session.records);
    }
    setIsCompleted(session.isCompleted);
  }, [session]);

  // Handle status toggle for a student (Guru & Admin only)
  const handleStatusChange = (santriId: string, newStatus: StatusAbsensi) => {
    if (!canEdit) return;
    setRecords((prev) =>
      prev.map((item) =>
        item.santriId === santriId ? { ...item, status: newStatus } : item
      )
    );
  };

  // "Hadir Semua" action button (Guru & Admin only)
  const handleHadirSemua = () => {
    if (!canEdit) return;
    setRecords((prev) =>
      prev.map((item) => ({ ...item, status: 'Hadir' as StatusAbsensi }))
    );
  };

  // "Simpan Absensi" action button (Guru & Admin only)
  const handleSimpanAbsensi = () => {
    if (!canEdit) return;
    setIsCompleted(true);
    const updated: SesiAbsensi = {
      ...session,
      kelas: selectedKelas,
      mataPelajaran: selectedMapel,
      tanggal: selectedTanggal,
      jamKe: '', // Time info purged
      ruang: selectedRuang,
      isCompleted: true,
      records: records,
    };
    onSaveSession(updated);
    storageService.saveAbsensiSession(updated);
    setSaveToast(true);
    setTimeout(() => setSaveToast(false), 4000);
  };

  // Filter & Search records
  const safeRecords = records || [];
  
  // If Siswa: ONLY display attendance record for the student matching their name or NIS
  const visibleRecords = isSiswa
    ? safeRecords.filter((r) => {
        const studentNis = (currentUser?.nipOrNis || '').replace(/[^0-9]/g, '');
        const recordNis = (r.nis || '').replace(/[^0-9]/g, '');
        const matchNis = studentNis && recordNis && studentNis === recordNis;
        const matchName =
          currentUser?.name &&
          r.nama.toLowerCase().includes(currentUser.name.toLowerCase());
        return matchNis || matchName || r.santriId === 's-1';
      })
    : safeRecords;

  const filteredRecords = visibleRecords.filter((item) => {
    const matchesSearch =
      item.nama.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.nis.includes(searchQuery);
    const matchesStatus =
      filterStatus === 'Semua' || item.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  // Calculate statistics
  const total = visibleRecords.length;
  const hadirCount = visibleRecords.filter((r) => r.status === 'Hadir').length;
  const izinCount = visibleRecords.filter((r) => r.status === 'Izin').length;
  const sakitCount = visibleRecords.filter((r) => r.status === 'Sakit').length;
  const alphaCount = visibleRecords.filter((r) => r.status === 'Alpha').length;
  const persentaseHadir = total > 0 ? Math.round((hadirCount / total) * 100) : 0;

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <ClipboardCheck className="w-6 h-6 text-emerald-700" />
            <span>Presensi & Absensi Santri</span>
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Pencatatan kehadiran santri Madrasah Diniyah Takmiliyah Annajiyah 2 Bahrul Ulum Tambakberas Jombang
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => setShowPdfModal(true)}
            id="btn-preview-absensi"
            className="flex items-center gap-1.5 px-3.5 py-2 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 rounded-xl text-xs font-semibold shadow-2xs transition-colors"
          >
            <Printer className="w-4 h-4 text-emerald-700" />
            <span>Cetak Rekap</span>
          </button>

          {canEdit && (
            <>
              <button
                onClick={handleHadirSemua}
                id="btn-hadir-semua"
                className="flex items-center gap-1.5 px-3.5 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 rounded-xl text-xs font-bold transition-colors"
              >
                <CheckCheck className="w-4 h-4" />
                <span>Hadir Semua</span>
              </button>

              <button
                onClick={handleSimpanAbsensi}
                id="btn-simpan-absensi"
                className="flex items-center gap-1.5 px-4 py-2 bg-emerald-800 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-md transition-all active:scale-95"
              >
                <Check className="w-4 h-4" />
                <span>Simpan Absensi</span>
              </button>
            </>
          )}
        </div>
      </div>

      {/* Siswa Read-Only Banner */}
      {isSiswa && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-900 flex items-center justify-center shrink-0">
            <Info className="w-5 h-5 text-emerald-800" />
          </div>
          <div className="flex-1">
            <p className="text-xs sm:text-sm font-bold text-emerald-950">
              Akses Santri (Hanya Lihat): Menampilkan data absensi kehadiran Anda.
            </p>
            <p className="text-xs text-emerald-800/80 mt-0.5">
              Data absensi hanya dapat diisi dan diubah oleh Ustadz/Guru atau Admin Madrasah.
            </p>
          </div>
        </div>
      )}

      {/* Hari Libur Banner (Locks attendance) */}
      {isLibur && (
        <div className="bg-rose-50 border border-rose-200 rounded-2xl p-4 flex items-center gap-3.5 text-rose-950">
          <CalendarOff className="w-6 h-6 text-rose-600 shrink-0" />
          <div>
            <h3 className="font-bold text-xs sm:text-sm">
              Sesi Absensi Diliburkan: {activeHoliday?.keterangan}
            </h3>
            <p className="text-[11px] text-rose-800 mt-0.5">
              Periode: {activeHoliday?.tanggalMulai} s.d. {activeHoliday?.tanggalSelesai}. Pengisian kehadiran dinonaktifkan sesuai Kalender Akademik Pesantren.
            </p>
          </div>
        </div>
      )}

      {/* Guru Unsubmitted Attendance Reminder */}
      {isGuru && !isCompleted && !isLibur && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-center gap-3 text-amber-950">
          <BellRing className="w-5 h-5 text-amber-600 shrink-0 animate-bounce" />
          <div>
            <p className="text-xs font-bold">Pemberitahuan Guru: Sesi Absensi Belum Disimpan</p>
            <p className="text-[11px] text-amber-800">
              Silakan periksa status kehadiran seluruh santri di kelas ini dan klik tombol &quot;Simpan Absensi&quot;.
            </p>
          </div>
        </div>
      )}

      {/* Success Toast */}
      {saveToast && (
        <div className="bg-emerald-800 text-white px-4 py-3 rounded-2xl shadow-xl flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-full bg-emerald-600 flex items-center justify-center font-bold text-amber-300">
              ✓
            </div>
            <div>
              <p className="text-xs sm:text-sm font-bold">Absensi berhasil disimpan.</p>
              <p className="text-[11px] text-emerald-200">Data telah tercatat ke arsip sistem akademik madrasah.</p>
            </div>
          </div>
          <button
            onClick={() => setSaveToast(false)}
            className="text-emerald-200 hover:text-white text-xs font-semibold"
          >
            Tutup
          </button>
        </div>
      )}

      {/* Parameter Sesi Pembelajaran (Tanpa Waktu / Jam Pelajaran) */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
            Parameter Kelas & Pembelajaran
          </span>
          <span className="text-[11px] text-emerald-800 font-semibold bg-emerald-50 px-2.5 py-0.5 rounded-full">
            Guru Pengampu: {session.guruPengampu || 'Ust. Rhendie Reihansyah'}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* 1. Kelas (Hanya nama kelas asli) */}
          <div>
            <label className="block text-[11px] font-bold text-slate-600 mb-1">Nama Kelas</label>
            <select
              id="select-absensi-kelas"
              disabled={isSiswa || isLibur}
              value={selectedKelas}
              onChange={(e) => setSelectedKelas(e.target.value)}
              className={`w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 ${
                isSiswa || isLibur ? 'opacity-80 cursor-not-allowed' : 'focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-emerald-600'
              }`}
            >
              {assignedClasses.length > 0 && (
                <optgroup label="⭐ Kelas yang Anda Ampu">
                  {assignedClasses.map((cls) => {
                    const val = cls.startsWith('Kelas ') ? cls : `Kelas ${cls}`;
                    return (
                      <option key={val} value={val}>
                        {val} (Diampu)
                      </option>
                    );
                  })}
                </optgroup>
              )}
              <optgroup label="Daftar Seluruh Kelas">
                {[
                  'Kelas 1A',
                  'Kelas 1B',
                  'Kelas 2A',
                  'Kelas 2B',
                  'Kelas 3A',
                  'Kelas 3B',
                  'Kelas 3C',
                  'Kelas 4A',
                  'Kelas 4B',
                  'Kelas 5A',
                  'Kelas 5B',
                  'Kelas 6',
                ].map((cls) => (
                  <option key={cls} value={cls}>
                    {cls}
                  </option>
                ))}
              </optgroup>
            </select>
          </div>

          {/* 2. Mata Pelajaran / Kitab */}
          <div>
            <label className="block text-[11px] font-bold text-slate-600 mb-1">Mata Pelajaran & Kitab</label>
            <input
              type="text"
              readOnly={isSiswa}
              value={selectedMapel}
              onChange={(e) => setSelectedMapel(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800"
            />
          </div>

          {/* 3. Tanggal */}
          <div>
            <label className="block text-[11px] font-bold text-slate-600 mb-1">Tanggal</label>
            <input
              type="date"
              disabled={isSiswa || isGuru}
              value={selectedTanggal}
              onChange={(e) => setSelectedTanggal(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800"
            />
          </div>

          {/* 4. Ruangan */}
          <div>
            <label className="block text-[11px] font-bold text-slate-600 mb-1">Ruangan</label>
            <input
              type="text"
              readOnly={isSiswa}
              value={selectedRuang}
              onChange={(e) => setSelectedRuang(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800"
            />
          </div>
        </div>
      </div>

      {/* Rekap Kehadiran Stats Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-2xs">
          <span className="text-[10px] font-bold text-slate-400 uppercase">Tingkat Hadir</span>
          <div className="text-xl font-black text-emerald-950 font-mono mt-0.5">{persentaseHadir}%</div>
          <span className="text-[10px] text-emerald-700 font-semibold">{hadirCount} dari {total} santri</span>
        </div>
        <div className="bg-white p-3.5 rounded-2xl border border-emerald-100 shadow-2xs">
          <span className="text-[10px] font-bold text-emerald-700 uppercase">Hadir</span>
          <div className="text-xl font-black text-emerald-800 font-mono mt-0.5">{hadirCount}</div>
          <span className="text-[10px] text-slate-500">Santri di kelas</span>
        </div>
        <div className="bg-white p-3.5 rounded-2xl border border-blue-100 shadow-2xs">
          <span className="text-[10px] font-bold text-blue-700 uppercase">Izin</span>
          <div className="text-xl font-black text-blue-800 font-mono mt-0.5">{izinCount}</div>
          <span className="text-[10px] text-slate-500">Surat Izin Resmi</span>
        </div>
        <div className="bg-white p-3.5 rounded-2xl border border-amber-100 shadow-2xs">
          <span className="text-[10px] font-bold text-amber-700 uppercase">Sakit</span>
          <div className="text-xl font-black text-amber-800 font-mono mt-0.5">{sakitCount}</div>
          <span className="text-[10px] text-slate-500">Keterangan Sehat</span>
        </div>
        <div className="bg-white p-3.5 rounded-2xl border border-rose-100 shadow-2xs">
          <span className="text-[10px] font-bold text-rose-700 uppercase">Alpha</span>
          <div className="text-xl font-black text-rose-800 font-mono mt-0.5">{alphaCount}</div>
          <span className="text-[10px] text-rose-600 font-semibold">Batas maks. 15 hari</span>
        </div>
      </div>

      {/* Search & Filter Status Bar */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Cari santri berdasarkan nama atau NIS..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 placeholder:text-slate-400 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-emerald-600"
          />
        </div>

        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-slate-400 shrink-0" />
          <span className="text-xs font-bold text-slate-600">Status:</span>
          <div className="inline-flex rounded-xl bg-slate-100 p-1">
            {['Semua', 'Hadir', 'Izin', 'Sakit', 'Alpha'].map((st) => (
              <button
                key={st}
                onClick={() => setFilterStatus(st)}
                className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-colors ${
                  filterStatus === st
                    ? 'bg-emerald-800 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {st}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Table Records Presensi Santri */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider text-[11px]">
                <th className="p-3 w-12 text-center">No</th>
                <th className="p-3">Nama Santri</th>
                <th className="p-3 w-28">NIS</th>
                <th className="p-3 text-center w-32">Status Kehadiran</th>
                <th className="p-3 text-center">Keterangan Catatan</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredRecords.map((item, idx) => (
                <tr key={item.santriId} className="hover:bg-slate-50/70 transition-colors">
                  <td className="p-3 text-center font-mono text-slate-400 font-bold">{idx + 1}</td>
                  <td className="p-3 font-bold text-slate-900">
                    <div>{item.nama}</div>
                    <div className="text-[10px] text-slate-400 font-normal">{selectedKelas}</div>
                  </td>
                  <td className="p-3 font-mono text-slate-600 font-semibold">{item.nis}</td>
                  <td className="p-3 text-center">
                    {canEdit ? (
                      <div className="inline-flex rounded-lg bg-slate-100 p-0.5 border border-slate-200">
                        {(['Hadir', 'Izin', 'Sakit', 'Alpha'] as StatusAbsensi[]).map((st) => {
                          const isActive = item.status === st;
                          return (
                            <button
                              key={st}
                              type="button"
                              onClick={() => handleStatusChange(item.santriId, st)}
                              className={`px-2 py-1 text-[10px] font-bold rounded-md transition-all ${
                                isActive
                                  ? st === 'Hadir'
                                    ? 'bg-emerald-600 text-white shadow-xs'
                                    : st === 'Izin'
                                    ? 'bg-blue-600 text-white shadow-xs'
                                    : st === 'Sakit'
                                    ? 'bg-amber-600 text-white shadow-xs'
                                    : 'bg-rose-600 text-white shadow-xs'
                                  : 'text-slate-600 hover:text-slate-900'
                              }`}
                            >
                              {st}
                            </button>
                          );
                        })}
                      </div>
                    ) : (
                      <span
                        className={`inline-block px-2.5 py-1 rounded-full text-[11px] font-bold ${
                          item.status === 'Hadir'
                            ? 'bg-emerald-100 text-emerald-800'
                            : item.status === 'Izin'
                            ? 'bg-blue-100 text-blue-800'
                            : item.status === 'Sakit'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-rose-100 text-rose-800'
                        }`}
                      >
                        {item.status}
                      </span>
                    )}
                  </td>
                  <td className="p-3 text-center text-slate-500 text-[11px]">
                    {item.catatan || (item.status === 'Hadir' ? 'Mengikuti KBM tertib' : 'Dispensasi / Tercatat')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showPdfModal && (
        <PdfPreviewModal
          type="absensi"
          isOpen={showPdfModal}
          onClose={() => setShowPdfModal(false)}
        />
      )}
    </div>
  );
};
