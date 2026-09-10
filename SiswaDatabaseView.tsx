import React, { useState } from 'react';
import {
  Users,
  Search,
  Filter,
  CheckCircle2,
  Award,
  AlertTriangle,
  ClipboardCheck,
  GraduationCap,
  Eye,
  MapPin,
  Calendar,
  User,
  X,
  Phone,
  Home,
  Edit3,
  ShieldCheck,
  Check,
  Save,
  Trash2,
  UserPlus,
  Plus
} from 'lucide-react';
import { MOCK_SANTRI } from '../data/mockData';
import { Santri, StatusSantri } from '../types';
import { storageService } from '../services/storageService';

interface SiswaDatabaseViewProps {
  userRole?: string;
  santriList?: Santri[];
  onUpdateSantri?: (updated: Santri) => void;
}

export const SiswaDatabaseView: React.FC<SiswaDatabaseViewProps> = ({
  userRole = 'Admin',
  santriList: propSantriList,
  onUpdateSantri,
}) => {
  const [santriList, setSantriList] = useState<Santri[]>(() => propSantriList || storageService.getSantriList());
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedKelas, setSelectedKelas] = useState<string>('Semua');
  const [selectedStatus, setSelectedStatus] = useState<string>('Semua');
  const [activeSantriDetail, setActiveSantriDetail] = useState<Santri | null>(null);

  // Admin edit & add student state
  const [editingSantri, setEditingSantri] = useState<Santri | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Add Santri Form Fields
  const [addNama, setAddNama] = useState('');
  const [addNis, setAddNis] = useState('');
  const [addNisn, setAddNisn] = useState('');
  const [addClass, setAddClass] = useState('Kelas 1A');
  const [addStatus, setAddStatus] = useState<StatusSantri>('Aktif');
  const [addHafalan, setAddHafalan] = useState(1);
  const [addTempatLahir, setAddTempatLahir] = useState('Jombang');
  const [addTanggalLahir, setAddTanggalLahir] = useState('12 Mei 2012');
  const [addWali, setAddWali] = useState('');
  const [addHpWali, setAddHpWali] = useState('081234567890');
  const [addAlamat, setAddAlamat] = useState('Tambakberas, Jombang');

  const isAdmin = userRole.toLowerCase() === 'admin';

  React.useEffect(() => {
    if (propSantriList) {
      setSantriList(propSantriList);
    }
  }, [propSantriList]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Filter logic
  const filteredSantri = santriList.filter(s => {
    const matchSearch = s.nama.toLowerCase().includes(searchQuery.toLowerCase()) || s.nis.includes(searchQuery);
    const matchKelas = selectedKelas === 'Semua' || s.kelas === selectedKelas;
    const matchStatus = selectedStatus === 'Semua' || s.status === selectedStatus;
    return matchSearch && matchKelas && matchStatus;
  });

  const handleSaveSantri = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingSantri) return;

    const updatedList = santriList.map(s => (s.id === editingSantri.id ? editingSantri : s));
    setSantriList(updatedList);
    storageService.saveSantriList(updatedList);
    if (onUpdateSantri) {
      onUpdateSantri(editingSantri);
    }
    if (activeSantriDetail && activeSantriDetail.id === editingSantri.id) {
      setActiveSantriDetail(editingSantri);
    }
    showToast(`Data Santri ${editingSantri.nama} (NIS: ${editingSantri.nis}) berhasil diperbarui!`);
    setEditingSantri(null);
  };

  const handleAddSantri = (e: React.FormEvent) => {
    e.preventDefault();
    if (!addNama.trim() || !addNis.trim()) {
      showToast('Harap lengkapi nama santri dan NIS.');
      return;
    }

    const newSantri: Santri = {
      id: `santri-${Date.now()}`,
      nama: addNama.trim(),
      nis: addNis.trim(),
      nisn: addNisn.trim() || undefined,
      kelas: addClass,
      hafalanJuz: Number(addHafalan) || 1,
      kehadiranPercent: 100,
      rataRataNilai: 80,
      status: addStatus,
      tempatLahir: addTempatLahir.trim(),
      tanggalLahir: addTanggalLahir.trim(),
      waliSantri: addWali.trim() || 'Wali Santri',
      noHpWali: addHpWali.trim(),
      alamat: addAlamat.trim(),
    };

    const updatedList = storageService.addSantri(newSantri);
    setSantriList(updatedList);

    // Also register login account
    storageService.addUserAccount({
      id: `usr-${newSantri.id}`,
      name: newSantri.nama,
      username: newSantri.nis,
      password: `santri${newSantri.nis}`,
      role: 'siswa',
      roleTitle: 'Santri Terdaftar',
      nipOrNis: `NIS. ${newSantri.nis}`,
      kelas: newSantri.kelas,
      status: 'Aktif',
      permissions: ['santri_portal'],
    });

    setShowAddModal(false);
    setAddNama('');
    setAddNis('');
    setAddNisn('');
    setAddWali('');
    showToast(`Santri baru ${newSantri.nama} (NIS: ${newSantri.nis}) berhasil didaftarkan & akun login telah dibuat!`);
  };

  const handleDeleteSantri = (id: string, nama: string) => {
    if (window.confirm(`Hapus santri "${nama}" secara permanen dari pangkalan data?`)) {
      const updatedList = storageService.deleteSantri(id);
      setSantriList(updatedList);
      if (activeSantriDetail && activeSantriDetail.id === id) {
        setActiveSantriDetail(null);
      }
      showToast(`Data santri "${nama}" telah dihapus.`);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Toast */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-emerald-900 text-white px-4 py-3 rounded-2xl shadow-xl flex items-center gap-3 border border-emerald-700 animate-in fade-in slide-in-from-bottom-5">
          <Check className="w-5 h-5 text-emerald-300 shrink-0" />
          <span className="text-xs font-semibold">{toastMessage}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-emerald-100 text-emerald-900 border border-emerald-300">
              EMIS Madrasah
            </span>
            {isAdmin && (
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-amber-100 text-amber-900 border border-amber-300 flex items-center gap-1">
                <ShieldCheck className="w-3 h-3" />
                Admin: Akses Ubah Nama Siswa & NIS
              </span>
            )}
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2 mt-1">
            <Users className="w-6 h-6 text-emerald-700" />
            <span>Database Induk Santri MT. Annajiyah 2</span>
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Manajemen data santri, profil lengkap, mutaba&apos;ah hafalan, histori absensi, nilai, serta NIS
          </p>
        </div>

        <div className="text-xs text-slate-600 bg-emerald-50 border border-emerald-200 px-3.5 py-2 rounded-xl font-semibold">
          Total Terdata: <span className="font-bold text-emerald-950">{santriList.length} Santri Terdaftar</span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-xs space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {/* Search by Name / NIS */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              id="input-database-santri-search"
              placeholder="Cari nama santri atau NIS..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-emerald-600"
            />
          </div>

          {/* Filter by Kelas */}
          <div>
            <select
              value={selectedKelas}
              onChange={(e) => setSelectedKelas(e.target.value)}
              className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-emerald-600"
            >
              <option value="Semua">Semua Kelas</option>
              <option value="Kelas 1A">Kelas 1A</option>
              <option value="Kelas 1B">Kelas 1B</option>
              <option value="Kelas 2A">Kelas 2A</option>
              <option value="Kelas 2B">Kelas 2B</option>
              <option value="Kelas 3A">Kelas 3A</option>
              <option value="Kelas 3B">Kelas 3B</option>
              <option value="Kelas 3C">Kelas 3C</option>
              <option value="Kelas 4A">Kelas 4A</option>
              <option value="Kelas 4B">Kelas 4B</option>
              <option value="Kelas 5A">Kelas 5A</option>
              <option value="Kelas 5B">Kelas 5B</option>
              <option value="Kelas 6">Kelas 6</option>
            </select>
          </div>

          {/* Filter by Status */}
          <div className="flex items-center gap-1.5">
            {(['Semua', 'Aktif', 'Lulus', 'Mutasi'] as const).map((st) => (
              <button
                key={st}
                onClick={() => setSelectedStatus(st)}
                className={`flex-1 py-2 rounded-xl text-xs font-bold transition-colors ${
                  selectedStatus === st
                    ? 'bg-emerald-800 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {st}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Santri Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredSantri.map((s) => (
          <div
            key={s.id}
            className="bg-white rounded-3xl p-5 border border-slate-200 hover:border-emerald-300 hover:shadow-lg transition-all flex flex-col justify-between group"
          >
            <div>
              {/* Top Row: Photo, Name, NIS */}
              <div className="flex items-start gap-3.5 mb-3">
                <img
                  src={s.foto}
                  alt={s.nama}
                  className="w-14 h-14 rounded-2xl object-cover border-2 border-emerald-600 shadow-2xs shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-mono font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-md">
                      NIS. {s.nis}
                    </span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      s.status === 'Aktif' ? 'bg-emerald-100 text-emerald-800' : s.status === 'Lulus' ? 'bg-blue-100 text-blue-800' : 'bg-slate-100 text-slate-600'
                    }`}>
                      {s.status}
                    </span>
                  </div>
                  <h3 className="text-sm sm:text-base font-extrabold text-slate-900 group-hover:text-emerald-950 transition-colors truncate mt-1">
                    {s.nama}
                  </h3>
                  <p className="text-xs text-slate-500 truncate">
                    {s.kelas} • Santri Aktif
                  </p>
                </div>
              </div>

              {/* Quick Metrics */}
              <div className="grid grid-cols-3 gap-2 bg-slate-50 p-2.5 rounded-2xl border border-slate-100 text-center my-2 text-xs">
                <div>
                  <span className="text-[9px] text-slate-400 block uppercase font-bold">Hafalan</span>
                  <span className="font-mono font-bold text-emerald-800">{s.hafalanJuz} Juz</span>
                </div>
                <div className="border-x border-slate-200">
                  <span className="text-[9px] text-slate-400 block uppercase font-bold">Hadir</span>
                  <span className="font-mono font-bold text-slate-900">{s.kehadiranPercent}%</span>
                </div>
                <div>
                  <span className="text-[9px] text-slate-400 block uppercase font-bold">Rata Nilai</span>
                  <span className="font-mono font-bold text-amber-700">{s.rataRataNilai}</span>
                </div>
              </div>

              {/* Prestasi Badge if any */}
              {s.prestasi && s.prestasi.length > 0 && (
                <div className="flex items-center gap-1.5 text-[11px] text-emerald-800 bg-emerald-50/70 px-2.5 py-1 rounded-xl mt-2 truncate">
                  <Award className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                  <span className="truncate">{s.prestasi[0]}</span>
                </div>
              )}
            </div>

            {/* Action buttons: Detail and Admin Edit */}
            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
              <span className="text-[11px] text-slate-400 truncate max-w-[120px]">
                Wali: {s.waliSantri}
              </span>

              <div className="flex items-center gap-1.5">
                {isAdmin && (
                  <button
                    onClick={() => setEditingSantri(s)}
                    className="flex items-center gap-1 px-2.5 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-900 font-bold rounded-xl text-xs transition-colors border border-amber-200"
                    title="Ubah Nama & NIS Santri"
                  >
                    <Edit3 className="w-3.5 h-3.5 text-amber-700" />
                    <span>Ubah NIS/Nama</span>
                  </button>
                )}

                <button
                  onClick={() => setActiveSantriDetail(s)}
                  className="flex items-center gap-1 px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-900 font-bold rounded-xl text-xs transition-colors"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>Detail</span>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* MODAL: Edit Nama & NIS Santri (Admin Only) */}
      {isAdmin && editingSantri && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white w-full max-w-xl rounded-3xl p-6 shadow-2xl border border-emerald-100 my-6 animate-in fade-in zoom-in-95">
            <div className="flex items-start justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                  <Edit3 className="w-5 h-5 text-amber-600" />
                  <span>Ubah Data Santri & NIS (Admin)</span>
                </h3>
                <p className="text-xs text-slate-500">
                  Perubahan nama santri dan NIS akan otomatis disinkronisasi ke modul Absensi dan Nilai.
                </p>
              </div>
              <button
                onClick={() => setEditingSantri(null)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveSantri} className="py-4 space-y-3.5 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="sm:col-span-2">
                  <label className="block font-bold text-slate-700 mb-1">
                    Nama Lengkap Santri <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={editingSantri.nama}
                    onChange={(e) => setEditingSantri({ ...editingSantri, nama: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl font-bold text-slate-900 focus:bg-white focus:ring-2 focus:ring-emerald-600 text-sm"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Nomor Induk Santri (NIS) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={editingSantri.nis}
                    onChange={(e) => setEditingSantri({ ...editingSantri, nis: e.target.value })}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl font-mono font-bold text-slate-900 focus:bg-white focus:ring-2 focus:ring-emerald-600"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    NISN (Nomor Induk Siswa Nasional)
                  </label>
                  <input
                    type="text"
                    value={editingSantri.nisn || ''}
                    onChange={(e) => setEditingSantri({ ...editingSantri, nisn: e.target.value })}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl font-mono"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Kelas</label>
                  <input
                    type="text"
                    required
                    value={editingSantri.kelas}
                    onChange={(e) => setEditingSantri({ ...editingSantri, kelas: e.target.value })}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl font-semibold"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Status Santri</label>
                  <select
                    value={editingSantri.status}
                    onChange={(e) => setEditingSantri({ ...editingSantri, status: e.target.value as StatusSantri })}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl font-bold"
                  >
                    <option value="Aktif">Aktif</option>
                    <option value="Lulus">Lulus (Alumni)</option>
                    <option value="Mutasi">Mutasi / Pindah</option>
                    <option value="Cuti">Cuti</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Capaian Nadhom / Muhafadloh</label>
                  <input
                    type="number"
                    value={editingSantri.hafalanJuz}
                    onChange={(e) => setEditingSantri({ ...editingSantri, hafalanJuz: Number(e.target.value) })}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl font-bold"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Tempat Lahir</label>
                  <input
                    type="text"
                    value={editingSantri.tempatLahir}
                    onChange={(e) => setEditingSantri({ ...editingSantri, tempatLahir: e.target.value })}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Tanggal Lahir</label>
                  <input
                    type="text"
                    value={editingSantri.tanggalLahir}
                    onChange={(e) => setEditingSantri({ ...editingSantri, tanggalLahir: e.target.value })}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Nama Orang Tua / Wali</label>
                  <input
                    type="text"
                    value={editingSantri.waliSantri}
                    onChange={(e) => setEditingSantri({ ...editingSantri, waliSantri: e.target.value })}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">No. HP Orang Tua / Wali</label>
                  <input
                    type="text"
                    value={editingSantri.noHpWali}
                    onChange={(e) => setEditingSantri({ ...editingSantri, noHpWali: e.target.value })}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl font-mono"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block font-bold text-slate-700 mb-1">Alamat Asal Santri</label>
                  <textarea
                    rows={2}
                    value={editingSantri.alamat}
                    onChange={(e) => setEditingSantri({ ...editingSantri, alamat: e.target.value })}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditingSantri(null)}
                  className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-xl font-bold transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="flex items-center gap-1.5 px-5 py-2 bg-emerald-800 hover:bg-emerald-700 text-white rounded-xl font-bold transition-colors shadow-xs"
                >
                  <Save className="w-4 h-4" />
                  <span>Simpan Perubahan Siswa & NIS</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Detail Modal / Drawer */}
      {activeSantriDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white w-full max-w-2xl rounded-3xl p-6 shadow-2xl border border-emerald-100 my-6 max-h-[92vh] overflow-y-auto">
            
            {/* Header Modal */}
            <div className="flex items-start justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-4">
                <img
                  src={activeSantriDetail.foto}
                  alt={activeSantriDetail.nama}
                  className="w-16 h-16 rounded-2xl object-cover border-2 border-emerald-600 shadow-md"
                />
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-bold text-slate-400">NIS. {activeSantriDetail.nis}</span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                      Status: {activeSantriDetail.status}
                    </span>
                  </div>
                  <h3 className="text-lg font-black text-slate-900 mt-0.5">
                    {activeSantriDetail.nama}
                  </h3>
                  <p className="text-xs text-slate-500">
                    Kelas {activeSantriDetail.kelas} • Santri Aktif
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {isAdmin && (
                  <button
                    onClick={() => {
                      setEditingSantri(activeSantriDetail);
                    }}
                    className="flex items-center gap-1 px-3 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-900 font-bold rounded-xl text-xs border border-amber-200"
                  >
                    <Edit3 className="w-3.5 h-3.5 text-amber-700" />
                    <span>Ubah Santri</span>
                  </button>
                )}
                <button
                  onClick={() => setActiveSantriDetail(null)}
                  className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Biodata Lengkap */}
            <div className="py-4 space-y-4 text-xs">
              <div>
                <h4 className="font-bold text-slate-900 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <User className="w-4 h-4 text-emerald-700" />
                  <span>1. Biodata Santri & Orang Tua</span>
                </h4>
                <div className="grid grid-cols-2 gap-3 bg-slate-50 p-3.5 rounded-2xl border border-slate-200">
                  <div>
                    <span className="text-slate-400 block">Tempat, Tanggal Lahir:</span>
                    <span className="font-bold text-slate-800">{activeSantriDetail.tempatLahir}, {activeSantriDetail.tanggalLahir}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block">Jenis Kelamin:</span>
                    <span className="font-bold text-slate-800">{activeSantriDetail.jenisKelamin}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block">Nama Orang Tua / Wali:</span>
                    <span className="font-bold text-slate-800">{activeSantriDetail.waliSantri}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block">Kontak Telepon:</span>
                    <span className="font-bold text-slate-800 font-mono">{activeSantriDetail.noHpWali}</span>
                  </div>
                  <div className="col-span-2">
                    <span className="text-slate-400 block">Alamat Asal:</span>
                    <span className="font-medium text-slate-800">{activeSantriDetail.alamat}</span>
                  </div>
                </div>
              </div>

              {/* 2. Riwayat Absensi */}
              <div>
                <h4 className="font-bold text-slate-900 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <ClipboardCheck className="w-4 h-4 text-emerald-700" />
                  <span>2. Riwayat Kehadiran Semester Ini</span>
                </h4>
                <div className="grid grid-cols-4 gap-2 text-center">
                  <div className="p-2 bg-emerald-50 rounded-xl border border-emerald-100">
                    <span className="text-[10px] text-emerald-800 font-bold block">Tingkat Hadir</span>
                    <span className="font-mono font-bold text-sm text-emerald-950">{activeSantriDetail.kehadiranPercent}%</span>
                  </div>
                  <div className="p-2 bg-blue-50 rounded-xl border border-blue-100">
                    <span className="text-[10px] text-blue-800 font-bold block">Izin</span>
                    <span className="font-mono font-bold text-sm text-blue-950">2 Hari</span>
                  </div>
                  <div className="p-2 bg-amber-50 rounded-xl border border-amber-100">
                    <span className="text-[10px] text-amber-800 font-bold block">Sakit</span>
                    <span className="font-mono font-bold text-sm text-amber-950">1 Hari</span>
                  </div>
                  <div className="p-2 bg-rose-50 rounded-xl border border-rose-100">
                    <span className="text-[10px] text-rose-800 font-bold block">Alpa</span>
                    <span className="font-mono font-bold text-sm text-rose-950">0 Hari</span>
                  </div>
                </div>
              </div>

              {/* 3. Riwayat Nilai & Capaian */}
              <div>
                <h4 className="font-bold text-slate-900 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <GraduationCap className="w-4 h-4 text-emerald-700" />
                  <span>3. Riwayat Nilai Akademik & Muhafadloh</span>
                </h4>
                <div className="grid grid-cols-2 gap-3 bg-slate-50 p-3.5 rounded-2xl border border-slate-200">
                  <div className="flex justify-between border-b pb-1">
                    <span className="text-slate-500">Rata-rata Nilai:</span>
                    <span className="font-bold text-slate-900 font-mono">{activeSantriDetail.rataRataNilai} (Mumtaz)</span>
                  </div>
                  <div className="flex justify-between border-b pb-1">
                    <span className="text-slate-500">Capaian Muhafadloh:</span>
                    <span className="font-bold text-emerald-800 font-mono">Tuntas Target Nadhom</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Peringkat Kelas:</span>
                    <span className="font-bold text-amber-700 font-mono">Peringkat 3 dari 32 Santri</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Wali Kelas:</span>
                    <span className="font-medium text-slate-800">{activeSantriDetail.waliKelas}</span>
                  </div>
                </div>
              </div>

              {/* 4. Catatan Prestasi & Pelanggaran */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-3.5 bg-emerald-50/60 rounded-2xl border border-emerald-200">
                  <h5 className="font-bold text-emerald-950 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <Award className="w-4 h-4 text-emerald-700" />
                    <span>Prestasi Santri</span>
                  </h5>
                  {activeSantriDetail.prestasi && activeSantriDetail.prestasi.length > 0 ? (
                    <ul className="space-y-1 text-slate-700">
                      {activeSantriDetail.prestasi.map((p, i) => (
                        <li key={i} className="flex items-center gap-1.5">
                          <span className="text-amber-500 font-bold">★</span>
                          <span>{p}</span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-slate-400 italic">Belum ada catatan prestasi terdaftar</p>
                  )}
                </div>

                <div className="p-3.5 bg-rose-50/50 rounded-2xl border border-rose-200">
                  <h5 className="font-bold text-rose-950 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <AlertTriangle className="w-4 h-4 text-rose-700" />
                    <span>Catatan Disiplin / Pelanggaran</span>
                  </h5>
                  {activeSantriDetail.pelanggaran && activeSantriDetail.pelanggaran.length > 0 ? (
                    <ul className="space-y-1 text-slate-700">
                      {activeSantriDetail.pelanggaran.map((p, i) => (
                        <li key={i} className="flex items-center gap-1.5">
                          <span className="text-rose-500 font-bold">•</span>
                          <span>{p}</span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <div className="flex items-center gap-1.5 text-emerald-700 font-semibold mt-1">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      <span>Nol Pelanggaran (Disiplin Mumtaz)</span>
                    </div>
                  )}
                </div>
              </div>

            </div>

            <div className="flex justify-end pt-3 border-t border-slate-100">
              <button
                onClick={() => setActiveSantriDetail(null)}
                className="px-5 py-2 font-bold bg-emerald-800 hover:bg-emerald-700 text-white rounded-xl text-xs"
              >
                Tutup Biodata
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
