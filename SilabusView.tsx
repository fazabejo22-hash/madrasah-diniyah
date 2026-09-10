import React, { useState } from 'react';
import {
  BookOpen,
  Eye,
  Printer,
  Search,
  ChevronDown,
  ChevronUp,
  Plus,
  Edit2,
  Trash2,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  Save,
  BookMarked
} from 'lucide-react';
import { SilabusItem } from '../data/madinData';
import { PdfPreviewModal } from '../components/PdfPreviewModal';
import { UserRole } from '../types';
import { storageService } from '../services/storageService';

interface SilabusViewProps {
  userRole?: UserRole;
}

export const SilabusView: React.FC<SilabusViewProps> = ({ userRole = 'Guru' }) => {
  const isAdmin = userRole.toLowerCase() === 'admin';

  const [silabusList, setSilabusList] = useState<SilabusItem[]>(() =>
    storageService.getSilabusList()
  );
  const [selectedKelas, setSelectedKelas] = useState<string>('Semua');
  const [selectedSemester, setSelectedSemester] = useState<string>('Semua');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [showPdfModal, setShowPdfModal] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(silabusList[0]?.id || null);

  // Admin edit / add state
  const [editingItem, setEditingItem] = useState<SilabusItem | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Form State for Add
  const [addMapel, setAddMapel] = useState('');
  const [addKelas, setAddKelas] = useState('1');
  const [addSemester, setAddSemester] = useState<'1' | '2' | 'Ganjil' | 'Genap' | 'Ganjil & Genap'>('Ganjil');
  const [addKitab, setAddKitab] = useState('');
  const [addMateri, setAddMateri] = useState('');
  const [addKompetensi, setAddKompetensi] = useState('');
  const [addIndikator, setAddIndikator] = useState('');
  const [addTarget, setAddTarget] = useState('');
  const [addMetode, setAddMetode] = useState('Bandongan, Sorogan, Lalaran Nadhom, & Tanya Jawab');

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const filteredSilabus = silabusList.filter((item) => {
    const matchKelas = selectedKelas === 'Semua' || String(item.kelas) === selectedKelas;
    const matchSemester =
      selectedSemester === 'Semua' ||
      String(item.semester).toLowerCase() === selectedSemester.toLowerCase() ||
      String(item.semester).includes('Ganjil & Genap');
    const matchSearch =
      item.mataPelajaran.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.sumberBelajar.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.materi.toLowerCase().includes(searchQuery.toLowerCase());
    return matchKelas && matchSemester && matchSearch;
  });

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem) return;
    const updated = storageService.updateSilabus(editingItem.id, editingItem);
    setSilabusList(updated);
    setEditingItem(null);
    showToast('Silabus dan target kurikulum berhasil diperbarui!');
  };

  const handleAddSilabus = (e: React.FormEvent) => {
    e.preventDefault();
    if (!addMapel.trim() || !addKitab.trim() || !addMateri.trim()) {
      showToast('Harap lengkapi mata pelajaran, kitab, dan cakupan materi.');
      return;
    }
    const newItem: SilabusItem = {
      id: `silabus-${Date.now()}`,
      kelas: addKelas,
      semester: addSemester,
      mataPelajaran: addMapel.trim(),
      sumberBelajar: addKitab.trim(),
      materi: addMateri.trim(),
      kompetensiUmum: addKompetensi.trim() || 'Memahami dan menguasai kaidah dasar kitab kuning serta pengamalannya.',
      indikatorPencapaian: addIndikator.trim() || 'Mampu membaca lafadz, memaknai gandul/pegon, dan menjelaskan maksud matan.',
      targetPembelajaran: addTarget.trim() || 'Khatam materi sesuai target kalender pendidikan madrasah.',
      metodePembelajaran: addMetode.trim(),
    };
    const updated = storageService.addSilabus(newItem);
    setSilabusList(updated);
    setShowAddModal(false);
    setAddMapel('');
    setAddKitab('');
    setAddMateri('');
    setAddKompetensi('');
    setAddIndikator('');
    setAddTarget('');
    showToast('Silabus kurikulum baru berhasil ditambahkan!');
  };

  const handleDeleteSilabus = (id: string, mapel: string) => {
    if (window.confirm(`Hapus silabus "${mapel}" secara permanen?`)) {
      const updated = storageService.deleteSilabus(id);
      setSilabusList(updated);
      showToast(`Silabus "${mapel}" berhasil dihapus.`);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-4 py-3 rounded-2xl shadow-2xl text-xs font-bold flex items-center gap-3 border border-slate-700 animate-in fade-in">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-emerald-100 text-emerald-900 border border-emerald-300">
              Kurikulum Salafiyah
            </span>
            {isAdmin && (
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-amber-100 text-amber-900 border border-amber-300 flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-amber-700" />
                Admin Builder: Akses Penuh Tambah & Edit
              </span>
            )}
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <BookOpen className="w-6 h-6 text-emerald-700" />
            <span>Silabus & Target Pembelajaran</span>
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Kurikulum resmi Madrasah Diniyah Takmiliyah Annajiyah 2 Bahrul Ulum Tambakberas Jombang
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {isAdmin && (
            <button
              onClick={() => setShowAddModal(true)}
              id="btn-tambah-silabus"
              className="flex items-center gap-1.5 px-3.5 py-2 bg-emerald-800 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-xs cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Tambah Silabus Baru</span>
            </button>
          )}
          <button
            onClick={() => setShowPdfModal(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 rounded-xl text-xs font-semibold shadow-2xs transition-colors"
          >
            <Eye className="w-4 h-4 text-emerald-700" />
            <span>Preview Silabus</span>
          </button>
          <button
            onClick={() => window.print()}
            className="flex items-center gap-1.5 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs"
          >
            <Printer className="w-4 h-4" />
            <span>Cetak Silabus</span>
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-xs grid grid-cols-1 sm:grid-cols-3 gap-3">
        {/* Search */}
        <div className="relative">
          <label className="block text-[11px] font-bold text-slate-600 mb-1">Pencarian Materi/Kitab</label>
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Cari mapel, kitab, materi..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-emerald-600"
            />
          </div>
        </div>

        {/* Filter Tingkat Kelas */}
        <div>
          <label className="block text-[11px] font-bold text-slate-600 mb-1">Tingkat Kelas</label>
          <select
            value={selectedKelas}
            onChange={(e) => setSelectedKelas(e.target.value)}
            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-emerald-600"
          >
            <option value="Semua">Semua Kelas (1 s.d. 6)</option>
            <option value="1">Kelas 1</option>
            <option value="2">Kelas 2</option>
            <option value="3">Kelas 3</option>
            <option value="4">Kelas 4</option>
            <option value="5">Kelas 5</option>
            <option value="6">Kelas 6</option>
          </select>
        </div>

        {/* Filter Semester */}
        <div>
          <label className="block text-[11px] font-bold text-slate-600 mb-1">Semester</label>
          <select
            value={selectedSemester}
            onChange={(e) => setSelectedSemester(e.target.value)}
            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-emerald-600"
          >
            <option value="Semua">Semua Semester</option>
            <option value="Ganjil">Semester Ganjil</option>
            <option value="Genap">Semester Genap</option>
          </select>
        </div>
      </div>

      {/* Silabus Accordion List */}
      <div className="space-y-3">
        {filteredSilabus.length === 0 ? (
          <div className="bg-white rounded-2xl p-8 border border-slate-200 text-center text-slate-500 text-xs font-medium">
            Tidak ada mata pelajaran atau silabus yang sesuai dengan kriteria filter.
          </div>
        ) : (
          filteredSilabus.map((item) => {
            const isExpanded = expandedId === item.id;
            return (
              <div
                key={item.id}
                className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden transition-all"
              >
                {/* Accordion Header */}
                <div
                  onClick={() => setExpandedId(isExpanded ? null : item.id)}
                  className="p-4 sm:p-5 flex items-center justify-between cursor-pointer hover:bg-slate-50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <span className="w-10 h-10 rounded-xl bg-emerald-900 text-amber-300 font-mono font-bold text-xs flex items-center justify-center shrink-0">
                      K{item.kelas}
                    </span>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-900 text-[10px] font-bold">
                          Kelas {item.kelas}
                        </span>
                        <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-[10px] font-semibold">
                          Semester {item.semester}
                        </span>
                        <span className="px-2 py-0.5 rounded-md bg-amber-50 text-amber-900 border border-amber-200 text-[10px] font-serif font-bold">
                          Kitab: {item.sumberBelajar}
                        </span>
                      </div>
                      <h3 className="font-extrabold text-sm sm:text-base text-slate-900 mt-1">
                        {item.mataPelajaran} — <span className="font-serif font-normal text-amber-800">{item.materi}</span>
                      </h3>
                    </div>
                  </div>

                  <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                    {isAdmin && (
                      <div className="flex items-center gap-1 mr-2">
                        <button
                          onClick={() => setEditingItem(item)}
                          className="p-1.5 bg-slate-100 hover:bg-emerald-50 text-slate-700 hover:text-emerald-800 rounded-lg text-xs font-bold flex items-center gap-1 transition-colors"
                          title="Edit Silabus"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                          <span className="hidden sm:inline">Edit</span>
                        </button>
                        <button
                          onClick={() => handleDeleteSilabus(item.id, item.mataPelajaran)}
                          className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-lg transition-colors"
                          title="Hapus Silabus"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}
                    <button
                      type="button"
                      onClick={() => setExpandedId(isExpanded ? null : item.id)}
                      className="p-1 text-slate-400"
                    >
                      {isExpanded ? (
                        <ChevronUp className="w-5 h-5" />
                      ) : (
                        <ChevronDown className="w-5 h-5" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Expanded Content */}
                {isExpanded && (
                  <div className="px-4 pb-5 sm:px-5 border-t border-slate-100 pt-4 bg-slate-50/50 space-y-4 text-xs">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Standar Kompetensi / Kompetensi Umum */}
                      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
                        <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider block mb-1">
                          Standar / Kompetensi Umum
                        </span>
                        <p className="font-medium text-slate-800 leading-relaxed">
                          {item.kompetensiUmum}
                        </p>
                      </div>

                      {/* Indikator Pencapaian */}
                      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
                        <span className="text-[10px] font-bold text-blue-800 uppercase tracking-wider block mb-1">
                          Indikator Pencapaian Kompetensi
                        </span>
                        <p className="font-medium text-slate-800 leading-relaxed">
                          {item.indikatorPencapaian}
                        </p>
                      </div>

                      {/* Target Pembelajaran */}
                      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
                        <span className="text-[10px] font-bold text-purple-800 uppercase tracking-wider block mb-1">
                          Target Pembelajaran
                        </span>
                        <p className="font-medium text-slate-800 leading-relaxed">
                          {item.targetPembelajaran}
                        </p>
                      </div>

                      {/* Metode Pembelajaran */}
                      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
                        <span className="text-[10px] font-bold text-amber-800 uppercase tracking-wider block mb-1">
                          Metode Pembelajaran Pesantren
                        </span>
                        <p className="font-medium text-slate-800 leading-relaxed">
                          {item.metodePembelajaran}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* MODAL: EDIT SILABUS (ADMIN ONLY) */}
      {isAdmin && editingItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl p-6 w-full max-w-xl shadow-2xl border border-slate-200 space-y-4 text-xs max-h-[90vh] overflow-y-auto">
            <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
              <Edit2 className="w-4 h-4 text-emerald-700" />
              <span>Edit Silabus: {editingItem.mataPelajaran}</span>
            </h3>

            <form onSubmit={handleSaveEdit} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Mata Pelajaran</label>
                  <input
                    type="text"
                    required
                    value={editingItem.mataPelajaran}
                    onChange={(e) => setEditingItem({ ...editingItem, mataPelajaran: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Kitab Rujukan</label>
                  <input
                    type="text"
                    required
                    value={editingItem.sumberBelajar}
                    onChange={(e) => setEditingItem({ ...editingItem, sumberBelajar: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold font-serif"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Tingkat Kelas</label>
                  <select
                    value={editingItem.kelas}
                    onChange={(e) => setEditingItem({ ...editingItem, kelas: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold"
                  >
                    {['1', '2', '3', '4', '5', '6'].map((k) => (
                      <option key={k} value={k}>
                        Kelas {k}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Semester</label>
                  <select
                    value={editingItem.semester}
                    onChange={(e) => setEditingItem({ ...editingItem, semester: e.target.value as any })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold"
                  >
                    <option value="Ganjil">Ganjil</option>
                    <option value="Genap">Genap</option>
                    <option value="Ganjil & Genap">Ganjil & Genap</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Cakupan Bab / Materi Pokok</label>
                <input
                  type="text"
                  required
                  value={editingItem.materi}
                  onChange={(e) => setEditingItem({ ...editingItem, materi: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Standar / Kompetensi Umum</label>
                <textarea
                  rows={2}
                  value={editingItem.kompetensiUmum}
                  onChange={(e) => setEditingItem({ ...editingItem, kompetensiUmum: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Target Pembelajaran</label>
                <textarea
                  rows={2}
                  value={editingItem.targetPembelajaran}
                  onChange={(e) => setEditingItem({ ...editingItem, targetPembelajaran: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setEditingItem(null)}
                  className="px-4 py-2 bg-slate-100 text-slate-700 rounded-xl font-semibold"
                >
                  Batal
                </button>
                <button type="submit" className="px-5 py-2 bg-emerald-800 text-white rounded-xl font-bold shadow-xs">
                  Simpan Silabus
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: TAMBAH SILABUS BARU (ADMIN ONLY) */}
      {isAdmin && showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl p-6 w-full max-w-xl shadow-2xl border border-slate-200 space-y-4 text-xs max-h-[90vh] overflow-y-auto">
            <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
              <Plus className="w-4 h-4 text-emerald-700" />
              <span>Tambah Silabus & Kurikulum Baru</span>
            </h3>

            <form onSubmit={handleAddSilabus} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Mata Pelajaran <span className="text-rose-500">*</span></label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: Nahwu, Fiqih, Tajwid"
                    value={addMapel}
                    onChange={(e) => setAddMapel(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Kitab Rujukan <span className="text-rose-500">*</span></label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: Jurumiyyah, Fathul Qorib"
                    value={addKitab}
                    onChange={(e) => setAddKitab(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold font-serif"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Tingkat Kelas</label>
                  <select
                    value={addKelas}
                    onChange={(e) => setAddKelas(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold"
                  >
                    {['1', '2', '3', '4', '5', '6'].map((k) => (
                      <option key={k} value={k}>
                        Kelas {k}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Semester</label>
                  <select
                    value={addSemester}
                    onChange={(e) => setAddSemester(e.target.value as any)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold"
                  >
                    <option value="Ganjil">Ganjil</option>
                    <option value="Genap">Genap</option>
                    <option value="Ganjil & Genap">Ganjil & Genap</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Cakupan Bab / Materi Pokok <span className="text-rose-500">*</span></label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Bab Kalam s.d. Bab I'rob"
                  value={addMateri}
                  onChange={(e) => setAddMateri(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Standar / Kompetensi Umum</label>
                <textarea
                  rows={2}
                  placeholder="Tujuan umum pembelajaran..."
                  value={addKompetensi}
                  onChange={(e) => setAddKompetensi(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Target Pembelajaran</label>
                <textarea
                  rows={2}
                  placeholder="Target hafalan atau khatam..."
                  value={addTarget}
                  onChange={(e) => setAddTarget(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 bg-slate-100 text-slate-700 rounded-xl font-semibold"
                >
                  Batal
                </button>
                <button type="submit" className="px-5 py-2 bg-emerald-800 text-white rounded-xl font-bold shadow-xs">
                  Tambahkan Silabus
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showPdfModal && (
        <PdfPreviewModal
          type="silabus"
          isOpen={showPdfModal}
          onClose={() => setShowPdfModal(false)}
        />
      )}
    </div>
  );
};
