import React, { useState, useMemo } from 'react';
import {
  BookOpen,
  Search,
  Users,
  CheckCircle2,
  AlertTriangle,
  FileSpreadsheet,
  Filter,
  Download,
  Edit3,
  Info,
  X,
  Save,
  ArrowUpDown,
  BookMarked,
  ShieldCheck,
  ChevronRight,
  Printer
} from 'lucide-react';
import { SiswaMuhafadzoh, UserProfile } from '../types';
import { storageService } from '../services/storageService';
import { TARGET_MUHAFADZOH_RULES } from '../data/muhafadzohRules';

interface MuhafadzohViewProps {
  userRole?: string;
  currentUser?: UserProfile;
}

export const MuhafadzohView: React.FC<MuhafadzohViewProps> = ({
  userRole = 'Guru',
}) => {
  const isSiswa = userRole.toLowerCase() === 'siswa';
  const canEdit = !isSiswa;

  // Active view tab (STRICTLY NO "Analisis" or "Tanya Jawab")
  const [activeTab, setActiveTab] = useState<
    'database' | 'per_kelas' | 'rekap_kelulusan' | 'pedoman'
  >('database');

  // Master student state (247 Santri)
  const [students, setStudents] = useState<SiswaMuhafadzoh[]>(() =>
    storageService.getMuhafadzohList()
  );

  // Database filtering state
  const [dbFilterKelas, setDbFilterKelas] = useState<string>('Semua');
  const [dbFilterStatus, setDbFilterStatus] = useState<string>('Semua');
  const [dbSearchQuery, setDbSearchQuery] = useState<string>('');
  const [selectedStudentForDetail, setSelectedStudentForDetail] = useState<SiswaMuhafadzoh | null>(null);

  // Editing state for modal
  const [editingStudent, setEditingStudent] = useState<SiswaMuhafadzoh | null>(null);
  const [saveNotification, setSaveNotification] = useState<string | null>(null);

  // Selected class for Tab 2 (Rekap Per Kelas)
  const [selectedClassRekap, setSelectedClassRekap] = useState<string>('1A');

  // Filter for Tab 3 (Rekap Kelulusan Target)
  const [targetStatusFilter, setTargetStatusFilter] = useState<'all' | 'tercapai' | 'belum'>('all');

  // Available classes strictly as given in CSV
  const classList = useMemo(() => {
    return ['1A', '1B', '2A', '2B', '3A', '3B', '3C', '4A', '4B', '5A', '5B', '6'];
  }, []);

  // Filtered students for Tab 1 (Database)
  const filteredStudents = useMemo(() => {
    return students.filter((s) => {
      const matchKelas = dbFilterKelas === 'Semua' || s.kelas === dbFilterKelas;
      const matchStatus =
        dbFilterStatus === 'Semua' || s.statusTarget === dbFilterStatus;
      const matchSearch =
        s.nama.toLowerCase().includes(dbSearchQuery.toLowerCase()) ||
        s.nis.includes(dbSearchQuery);
      return matchKelas && matchStatus && matchSearch;
    });
  }, [students, dbFilterKelas, dbFilterStatus, dbSearchQuery]);

  // Handle Edit Save
  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingStudent) return;

    const updatedStudents = students.map((s) => {
      if (s.nis === editingStudent.nis) {
        const target = editingStudent.targetBait ?? s.targetBait ?? s.targetTahunan ?? 100;
        const capaian = editingStudent.capaianBait ?? 0;
        const selisih = capaian - target;
        const statusTarget = selisih >= 0 ? ('Tercapai' as const) : ('Belum Memenuhi' as const);
        return {
          ...editingStudent,
          targetBait: target,
          capaianBait: capaian,
          statusTarget,
          selisihTarget: selisih,
        };
      }
      return s;
    });

    setStudents(updatedStudents);
    storageService.saveMuhafadzohList(updatedStudents);
    setSaveNotification(`Data nilai Muhafadloh ${editingStudent.nama} berhasil diperbarui.`);
    setEditingStudent(null);
    setTimeout(() => setSaveNotification(null), 4000);
  };

  // Summary stats
  const totalSantri = students.length;
  const tercapaiCount = students.filter((s) => s.statusTarget === 'Tercapai').length;
  const belumCount = students.filter((s) => s.statusTarget === 'Belum Memenuhi').length;
  const persentaseTercapai = totalSantri > 0 ? Math.round((tercapaiCount / totalSantri) * 100) : 0;

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <BookMarked className="w-6 h-6 text-emerald-700" />
            <span>Sistem & Rekap Nilai Muhafadloh</span>
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Pencatatan hafalan bait nadhom dan nilai ujian Muhafadloh 247 Santri Madin Annajiyah 2
          </p>
        </div>

        <button
          onClick={() => window.print()}
          className="flex items-center gap-1.5 px-4 py-2 bg-emerald-800 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-xs transition-colors"
        >
          <Printer className="w-4 h-4" />
          <span>Cetak Laporan Muhafadloh</span>
        </button>
      </div>

      {/* Save Notification */}
      {saveNotification && (
        <div className="bg-emerald-800 text-white px-4 py-3 rounded-2xl shadow-xl flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-5 h-5 text-amber-300" />
            <p className="text-xs sm:text-sm font-bold">{saveNotification}</p>
          </div>
          <button onClick={() => setSaveNotification(null)} className="text-emerald-200 text-xs font-bold">
            Tutup
          </button>
        </div>
      )}

      {/* Navigation Tabs (Strictly No Analisis or Tanya Jawab) */}
      <div className="bg-white rounded-2xl p-2.5 border border-slate-200 shadow-xs flex items-center gap-2 overflow-x-auto">
        {[
          { id: 'database', label: 'Database & Nilai Muhafadloh (247 Santri)' },
          { id: 'per_kelas', label: 'Rekap Capaian Per Kelas' },
          { id: 'rekap_kelulusan', label: 'Rekap Kelulusan Target' },
          { id: 'pedoman', label: 'Pedoman Kitab & Target Bait' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-colors ${
              activeTab === tab.id
                ? 'bg-emerald-800 text-white shadow-xs'
                : 'bg-slate-50 text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Summary Statistic Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Santri</span>
          <div className="text-2xl font-black text-slate-900 font-mono mt-0.5">{totalSantri}</div>
          <span className="text-[10px] text-slate-500">12 Rombel Kelas</span>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-emerald-100 shadow-2xs">
          <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider">Target Tercapai</span>
          <div className="text-2xl font-black text-emerald-800 font-mono mt-0.5">{tercapaiCount}</div>
          <span className="text-[10px] text-emerald-600 font-semibold">{persentaseTercapai}% dari total santri</span>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-amber-100 shadow-2xs">
          <span className="text-[10px] font-bold text-amber-700 uppercase tracking-wider">Belum Memenuhi Target</span>
          <div className="text-2xl font-black text-amber-800 font-mono mt-0.5">{belumCount}</div>
          <span className="text-[10px] text-amber-600">Perlu bimbingan musrif</span>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Batas Nilai Lulus</span>
          <div className="text-2xl font-black text-emerald-950 font-mono mt-0.5">70</div>
          <span className="text-[10px] text-slate-500">Nilai Ujian Muhafadloh</span>
        </div>
      </div>

      {/* TAB 1: Database & Nilai Muhafadloh */}
      {activeTab === 'database' && (
        <div className="space-y-4">
          {/* Filters Bar */}
          <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="relative">
              <label className="block text-[11px] font-bold text-slate-600 mb-1">Cari Santri</label>
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Cari nama atau NIS..."
                  value={dbSearchQuery}
                  onChange={(e) => setDbSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-emerald-600"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-600 mb-1">Pilih Kelas</label>
              <select
                value={dbFilterKelas}
                onChange={(e) => setDbFilterKelas(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-emerald-600"
              >
                <option value="Semua">Semua Kelas</option>
                {classList.map((c) => (
                  <option key={c} value={c}>
                    Kelas {c}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-600 mb-1">Status Target Bait</label>
              <select
                value={dbFilterStatus}
                onChange={(e) => setDbFilterStatus(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-emerald-600"
              >
                <option value="Semua">Semua Status</option>
                <option value="Tercapai">Target Tercapai</option>
                <option value="Belum Memenuhi">Belum Memenuhi</option>
              </select>
            </div>
          </div>

          {/* Table */}
          <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-xs">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between">
              <span className="text-xs font-extrabold text-slate-800 uppercase tracking-wider">
                Daftar Nilai Muhafadloh ({filteredStudents.length} Santri)
              </span>
              <span className="text-[11px] font-semibold text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-full">
                Tersinkronisasi 247 Santri
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider text-[11px]">
                    <th className="p-3.5 text-center w-12">No</th>
                    <th className="p-3.5">Nama Santri</th>
                    <th className="p-3.5 w-24">NIS</th>
                    <th className="p-3.5 text-center w-20">Kelas</th>
                    <th className="p-3.5 text-center">Kitab Muhafadloh</th>
                    <th className="p-3.5 text-center w-24">Capaian Bait</th>
                    <th className="p-3.5 text-center w-24">Target Bait</th>
                    <th className="p-3.5 text-center w-24 font-bold text-slate-900 bg-emerald-50">
                      Nilai Ujian
                    </th>
                    <th className="p-3.5 text-center w-32">Status Target</th>
                    {canEdit && <th className="p-3.5 text-center w-16">Aksi</th>}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-sans">
                  {filteredStudents.map((s, idx) => (
                    <tr key={s.nis} className="hover:bg-slate-50/80 transition-colors">
                      <td className="p-3.5 text-center font-mono text-slate-400 font-bold">{idx + 1}</td>
                      <td className="p-3.5 font-bold text-slate-900">{s.nama}</td>
                      <td className="p-3.5 font-mono text-slate-600 font-semibold">{s.nis}</td>
                      <td className="p-3.5 text-center">
                        <span className="px-2 py-0.5 rounded-md bg-slate-100 font-mono font-bold text-slate-800 text-[11px]">
                          {s.kelas}
                        </span>
                      </td>
                      <td className="p-3.5 text-center font-serif text-slate-700 text-xs">
                        {s.kitabMuhafadzoh}
                      </td>
                      <td className="p-3.5 text-center font-mono font-bold text-slate-900">
                        {s.capaianBait}
                      </td>
                      <td className="p-3.5 text-center font-mono text-slate-500">
                        {s.targetBait}
                      </td>
                      <td className="p-3.5 text-center font-mono font-black text-emerald-950 bg-emerald-50 text-sm">
                        {s.nilaiUjianMuhafadzoh}
                      </td>
                      <td className="p-3.5 text-center">
                        <span
                          className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                            s.statusTarget === 'Tercapai'
                              ? 'bg-emerald-100 text-emerald-900'
                              : 'bg-amber-100 text-amber-900'
                          }`}
                        >
                          {s.statusTarget}
                        </span>
                      </td>
                      {canEdit && (
                        <td className="p-3.5 text-center">
                          <button
                            onClick={() => setEditingStudent(s)}
                            className="p-1 rounded-lg text-slate-400 hover:text-emerald-700 hover:bg-slate-100 transition-colors"
                            title="Edit Data Nilai"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: Rekap Capaian Per Kelas */}
      {activeTab === 'per_kelas' && (
        <div className="space-y-4">
          <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs flex items-center gap-3">
            <span className="text-xs font-bold text-slate-600">Pilih Kelas:</span>
            <div className="flex items-center gap-1.5 flex-wrap">
              {classList.map((c) => (
                <button
                  key={c}
                  onClick={() => setSelectedClassRekap(c)}
                  className={`px-3 py-1.5 rounded-xl font-mono text-xs font-bold transition-colors ${
                    selectedClassRekap === c
                      ? 'bg-emerald-800 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  Kelas {c}
                </button>
              ))}
            </div>
          </div>

          {/* Class Rekap Card */}
          {(() => {
            const classStudents = students.filter((s) => s.kelas === selectedClassRekap);
            const passCount = classStudents.filter((s) => s.statusTarget === 'Tercapai').length;
            const avgScore =
              classStudents.length > 0
                ? (
                    classStudents.reduce((a, b) => a + (Number(b.nilaiUjianMuhafadzoh) || 0), 0) /
                    classStudents.length
                  ).toFixed(1)
                : '0.0';

            return (
              <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-6">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
                  <div>
                    <h3 className="text-lg font-black text-slate-900">
                      Rekapitulasi Muhafadloh — Kelas {selectedClassRekap}
                    </h3>
                    <p className="text-xs text-slate-500">
                      Kitab Acuan: {classStudents[0]?.kitabMuhafadzoh || 'Al-Amtsilah At-Tashrifiyyah'} • Target: {classStudents[0]?.targetBait || 0} Bait
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="px-3 py-1 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-900 text-xs font-mono font-bold">
                      Rata-Rata Nilai: {avgScore}
                    </span>
                    <span className="px-3 py-1 bg-slate-100 rounded-xl text-slate-800 text-xs font-bold">
                      {passCount} / {classStudents.length} Santri Lulus
                    </span>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider text-[11px]">
                        <th className="p-3 w-12 text-center">No</th>
                        <th className="p-3">Nama Santri</th>
                        <th className="p-3 w-28">NIS</th>
                        <th className="p-3 text-center">Capaian Bait</th>
                        <th className="p-3 text-center">Target Bait</th>
                        <th className="p-3 text-center font-bold text-slate-900 bg-emerald-50">Nilai Ujian</th>
                        <th className="p-3 text-center">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {classStudents.map((s, idx) => (
                        <tr key={s.nis} className="hover:bg-slate-50/70">
                          <td className="p-3 text-center font-mono text-slate-400 font-bold">{idx + 1}</td>
                          <td className="p-3 font-bold text-slate-900">{s.nama}</td>
                          <td className="p-3 font-mono text-slate-600">{s.nis}</td>
                          <td className="p-3 text-center font-mono font-bold text-slate-800">{s.capaianBait}</td>
                          <td className="p-3 text-center font-mono text-slate-500">{s.targetBait}</td>
                          <td className="p-3 text-center font-mono font-black text-emerald-950 bg-emerald-50">
                            {s.nilaiUjianMuhafadzoh}
                          </td>
                          <td className="p-3 text-center">
                            <span
                              className={`px-2 py-0.5 rounded-md font-bold text-[10px] ${
                                s.statusTarget === 'Tercapai'
                                  ? 'bg-emerald-100 text-emerald-900'
                                  : 'bg-amber-100 text-amber-900'
                              }`}
                            >
                              {s.statusTarget}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            );
          })()}
        </div>
      )}

      {/* TAB 3: Rekap Kelulusan Target */}
      {activeTab === 'rekap_kelulusan' && (
        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
            <div>
              <h3 className="font-extrabold text-sm text-slate-900">
                Rekap Kelulusan Target Muhafadloh Semua Kelas
              </h3>
              <p className="text-xs text-slate-500">
                Data capaian target bait hafalan per rombel kelas 1A sampai kelas 6
              </p>
            </div>
            <div className="inline-flex rounded-xl bg-slate-100 p-1">
              {(['all', 'tercapai', 'belum'] as const).map((f) => (
                <button
                  key={f}
                  onClick={() => setTargetStatusFilter(f)}
                  className={`px-3 py-1 text-xs font-bold rounded-lg transition-colors ${
                    targetStatusFilter === f
                      ? 'bg-emerald-800 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {f === 'all' ? 'Semua' : f === 'tercapai' ? 'Target Tercapai' : 'Belum Memenuhi'}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {classList.map((c) => {
              const studentsInClass = students.filter((s) => s.kelas === c);
              const lulus = studentsInClass.filter((s) => s.statusTarget === 'Tercapai').length;
              const belum = studentsInClass.length - lulus;
              const pct = studentsInClass.length > 0 ? Math.round((lulus / studentsInClass.length) * 100) : 0;

              return (
                <div
                  key={c}
                  className="p-4 rounded-2xl border border-slate-200 bg-slate-50/60 hover:bg-white hover:border-emerald-300 transition-all space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-bold text-sm text-slate-900">
                      Kelas {c}
                    </span>
                    <span className="px-2 py-0.5 bg-emerald-100 text-emerald-900 rounded-md font-mono text-xs font-bold">
                      {pct}% Lulus
                    </span>
                  </div>
                  <div className="text-xs text-slate-600">
                    <div>Total Santri: <span className="font-bold">{studentsInClass.length}</span></div>
                    <div className="text-emerald-800">Tercapai: <span className="font-bold">{lulus} santri</span></div>
                    <div className="text-amber-800">Belum Memenuhi: <span className="font-bold">{belum} santri</span></div>
                  </div>
                  {/* Progress bar */}
                  <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-emerald-700 rounded-full transition-all"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 4: Pedoman Kitab & Target Bait */}
      {activeTab === 'pedoman' && (
        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-4">
          <div className="border-b border-slate-100 pb-3">
            <h3 className="font-extrabold text-sm text-slate-900">
              Pedoman Kitab & Target Bait Muhafadloh Tingkat 1 s.d. 6
            </h3>
            <p className="text-xs text-slate-500">
              Standar kurikulum hafalan wajib tahun ajaran 2024/2025 dan 2025/2026
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Object.values(TARGET_MUHAFADZOH_RULES).map((rule) => (
              <div
                key={rule.tingkat}
                className="p-4 rounded-2xl border border-slate-200 bg-slate-50/70 space-y-2"
              >
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-0.5 bg-emerald-900 text-amber-300 rounded-lg font-mono font-bold text-xs">
                    Tingkat {rule.tingkat}
                  </span>
                  <span className="text-xs font-mono font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                    Target: {rule.targetTahunan} {rule.satuan}
                  </span>
                </div>
                <h4 className="font-bold text-sm text-slate-900">{rule.namaMateri}</h4>
                {rule.catatanKhusus && (
                  <p className="text-xs text-slate-600 leading-relaxed">{rule.catatanKhusus}</p>
                )}
                <div className="text-[11px] text-slate-500 font-mono">
                  Distribusi Setoran (8x): [{rule.targetPerSetoran.join(', ')}] {rule.satuan}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {editingStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-extrabold text-base text-slate-900">Edit Data Muhafadloh</h3>
                <p className="text-xs text-slate-500">{editingStudent.nama} (Kelas {editingStudent.kelas})</p>
              </div>
              <button
                onClick={() => setEditingStudent(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Capaian Bait</label>
                <input
                  type="number"
                  min="0"
                  value={editingStudent.capaianBait}
                  onChange={(e) =>
                    setEditingStudent({
                      ...editingStudent,
                      capaianBait: parseInt(e.target.value) || 0,
                    })
                  }
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono text-sm font-bold text-slate-800 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-emerald-600"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Nilai Ujian Muhafadloh</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={editingStudent.nilaiUjianMuhafadzoh}
                  onChange={(e) =>
                    setEditingStudent({
                      ...editingStudent,
                      nilaiUjianMuhafadzoh: parseInt(e.target.value) || 0,
                    })
                  }
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono text-sm font-bold text-slate-800 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-emerald-600"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditingStudent(null)}
                  className="px-4 py-2 rounded-xl text-slate-600 font-bold hover:bg-slate-100"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-emerald-800 text-white font-bold hover:bg-emerald-700 shadow-xs"
                >
                  Simpan Perubahan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
