import React, { useMemo, useState } from 'react';
import {
  Users,
  Search,
  Eye,
  Edit3,
  Save,
  X,
  ShieldCheck,
  Check,
  Trash2,
  UserPlus,
  Camera,
  BookMarked,
} from 'lucide-react';
import { Santri, StatusSantri } from '../types';
import { storageService } from '../services/storageService';

interface SiswaDatabaseViewProps {
  userRole?: string;
  santriList?: Santri[];
  onUpdateSantri?: (updated: Santri) => void;
}

const kelasOptions = ['1A','1B','2A','2B','3A','3B','3C','4A','4B','5A','5B','6'];

const normalizeKelas = (kelas?: string) => (kelas || '').replace(/^Kelas\s+/i, '').trim();

const hasRealPhoto = (foto?: string) => Boolean(foto && !foto.includes('images.unsplash.com'));

const initials = (name: string) =>
  name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('') || 'S';

export const SiswaDatabaseView: React.FC<SiswaDatabaseViewProps> = ({
  userRole = 'Admin',
  santriList: propSantriList,
  onUpdateSantri,
}) => {
  const isAdmin = userRole.toLowerCase() === 'admin';
  const [santriList, setSantriList] = useState<Santri[]>(() => propSantriList || storageService.getSantriList());
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedKelas, setSelectedKelas] = useState('Semua');
  const [selectedStatus, setSelectedStatus] = useState('Semua');
  const [activeSantriDetail, setActiveSantriDetail] = useState<Santri | null>(null);
  const [editingSantri, setEditingSantri] = useState<Santri | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const [newSantri, setNewSantri] = useState<Santri>({
    id: '', nis: '', nisn: '', nama: '', kelas: '1A', status: 'Aktif',
    tempatLahir: '', tanggalLahir: '', noHpWali: '', alamat: '', waliSantri: '', foto: '',
  });

  const muhafadzoh = useMemo(() => storageService.getMuhafadzohList(), [santriList]);

  React.useEffect(() => {
    if (propSantriList) setSantriList(propSantriList);
  }, [propSantriList]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    window.setTimeout(() => setToastMessage(null), 3500);
  };

  const filteredSantri = useMemo(() => santriList.filter((s) => {
    const q = searchQuery.toLowerCase().trim();
    const matchSearch = !q || s.nama.toLowerCase().includes(q) || s.nis.toLowerCase().includes(q);
    const matchKelas = selectedKelas === 'Semua' || normalizeKelas(s.kelas) === selectedKelas;
    const matchStatus = selectedStatus === 'Semua' || s.status === selectedStatus;
    return matchSearch && matchKelas && matchStatus;
  }), [santriList, searchQuery, selectedKelas, selectedStatus]);

  const getMuhafadzoh = (nis: string) => muhafadzoh.find((m) => m.nis === nis);

  const readPhoto = (file: File, apply: (value: string) => void) => {
    if (!file.type.startsWith('image/')) {
      showToast('File foto harus berupa gambar.');
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      showToast('Ukuran foto maksimal 2 MB.');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => apply(String(reader.result || ''));
    reader.readAsDataURL(file);
  };

  const saveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingSantri || !editingSantri.nama.trim() || !editingSantri.nis.trim()) return;
    const updated = santriList.map((s) => s.id === editingSantri.id ? { ...editingSantri, kelas: normalizeKelas(editingSantri.kelas) } : s);
    storageService.saveSantriList(updated);
    setSantriList(updated);
    onUpdateSantri?.(editingSantri);
    if (activeSantriDetail?.id === editingSantri.id) setActiveSantriDetail(editingSantri);
    setEditingSantri(null);
    showToast('Data santri berhasil diperbarui.');
  };

  const saveNew = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSantri.nama.trim() || !newSantri.nis.trim()) {
      showToast('Nama santri dan NIS wajib diisi.');
      return;
    }
    if (santriList.some((s) => s.nis.trim() === newSantri.nis.trim())) {
      showToast('NIS sudah digunakan.');
      return;
    }
    const item: Santri = {
      ...newSantri,
      id: `santri-${newSantri.nis.trim()}-${Date.now()}`,
      nama: newSantri.nama.trim(),
      nis: newSantri.nis.trim(),
      kelas: normalizeKelas(newSantri.kelas),
      status: newSantri.status || 'Aktif',
    };
    const updated = [...santriList, item];
    storageService.saveSantriList(updated);
    setSantriList(updated);
    storageService.addUserAccount({
      id: `usr-${item.id}`,
      username: item.nis,
      password: `santri${item.nis}`,
      name: item.nama,
      role: 'siswa',
      roleTitle: `Santri Kelas ${item.kelas}`,
      nipOrNis: `NIS. ${item.nis}`,
      kelas: item.kelas,
      permissions: ['santri_portal'],
      status: 'Aktif',
    });
    setShowAddModal(false);
    setNewSantri({ id: '', nis: '', nisn: '', nama: '', kelas: '1A', status: 'Aktif', tempatLahir: '', tanggalLahir: '', noHpWali: '', alamat: '', waliSantri: '', foto: '' });
    showToast('Santri baru berhasil ditambahkan.');
  };

  const removeSantri = (item: Santri) => {
    if (!window.confirm(`Hapus data ${item.nama}?`)) return;
    const updated = santriList.filter((s) => s.id !== item.id);
    storageService.saveSantriList(updated);
    setSantriList(updated);
    if (activeSantriDetail?.id === item.id) setActiveSantriDetail(null);
    showToast('Data santri dihapus.');
  };

  const Photo = ({ item, size = 'normal' }: { item: Santri; size?: 'normal' | 'large' }) => {
    const cls = size === 'large' ? 'w-20 h-20 text-xl' : 'w-14 h-14 text-sm';
    return hasRealPhoto(item.foto) ? (
      <img src={item.foto} alt={`Foto ${item.nama}`} className={`${cls} rounded-2xl object-cover border-2 border-emerald-600 shrink-0`} />
    ) : (
      <div className={`${cls} rounded-2xl bg-emerald-100 border-2 border-emerald-300 text-emerald-900 font-black flex items-center justify-center shrink-0`}>
        {initials(item.nama)}
      </div>
    );
  };

  return (
    <div className="space-y-6 pb-12">
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-[70] bg-emerald-950 text-white px-4 py-3 rounded-2xl shadow-xl flex items-center gap-2 text-xs font-semibold">
          <Check className="w-4 h-4" /> {toastMessage}
        </div>
      )}

      <div className="flex flex-col sm:flex-row gap-4 sm:items-end sm:justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-emerald-100 text-emerald-900 border border-emerald-300">Database Resmi</span>
            {isAdmin && <span className="text-[10px] font-bold text-amber-900 flex items-center gap-1"><ShieldCheck className="w-3.5 h-3.5"/> Admin dapat mengelola foto santri</span>}
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 flex items-center gap-2"><Users className="w-6 h-6 text-emerald-700"/>Database Induk Santri</h1>
          <p className="text-xs text-slate-500 mt-1">Nama, NIS, kelas, status, foto identitas, dan data Muhafadloh. Tidak menggunakan data hafalan Al-Qur'an 2 juz.</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="px-3 py-2 rounded-xl bg-white border text-xs font-bold">{santriList.length} santri</span>
          {isAdmin && <button onClick={() => setShowAddModal(true)} className="px-4 py-2 rounded-xl bg-emerald-800 text-white text-xs font-bold flex items-center gap-2"><UserPlus className="w-4 h-4"/>Tambah Santri</button>}
        </div>
      </div>

      <div className="bg-white p-4 rounded-2xl border grid grid-cols-1 md:grid-cols-3 gap-3">
        <div className="relative"><Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2"/><input value={searchQuery} onChange={(e)=>setSearchQuery(e.target.value)} placeholder="Cari nama atau NIS..." className="w-full pl-9 pr-3 py-2.5 rounded-xl border bg-slate-50 text-xs"/></div>
        <select value={selectedKelas} onChange={(e)=>setSelectedKelas(e.target.value)} className="px-3 py-2.5 rounded-xl border bg-slate-50 text-xs"><option>Semua</option>{kelasOptions.map(k=><option key={k}>{k}</option>)}</select>
        <select value={selectedStatus} onChange={(e)=>setSelectedStatus(e.target.value)} className="px-3 py-2.5 rounded-xl border bg-slate-50 text-xs"><option>Semua</option><option>Aktif</option><option>Lulus</option><option>Mutasi</option><option>Cuti</option><option>Boyong</option></select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {filteredSantri.map((s) => {
          const m = getMuhafadzoh(s.nis);
          const capaian = [m?.capaian1,m?.capaian2,m?.capaian3,m?.capaian4,m?.capaian5,m?.capaian6,m?.capaian7,m?.capaian8].filter((v)=>v !== null && v !== undefined).length;
          return <div key={s.id} className="bg-white rounded-3xl border p-5 shadow-xs">
            <div className="flex gap-3"><Photo item={s}/><div className="min-w-0 flex-1"><div className="text-[10px] font-mono text-emerald-800 font-bold">NIS {s.nis}</div><h3 className="font-extrabold text-slate-900 truncate">{s.nama}</h3><div className="text-xs text-slate-500">Kelas {normalizeKelas(s.kelas)} • {s.status}</div></div></div>
            <div className="mt-4 rounded-2xl bg-slate-50 border p-3 text-xs flex items-start gap-2"><BookMarked className="w-4 h-4 text-emerald-700 mt-0.5"/><div><div className="font-bold text-slate-800">Muhafadloh M1–M8</div><div className="text-slate-500">{m?.materiMuhafadzoh || 'Materi mengikuti tingkat kelas'} • {capaian}/8 periode terisi</div></div></div>
            <div className="mt-4 pt-3 border-t flex justify-end gap-2">{isAdmin && <><button onClick={()=>setEditingSantri({...s, kelas: normalizeKelas(s.kelas)})} className="px-3 py-1.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs font-bold flex items-center gap-1"><Edit3 className="w-3.5 h-3.5"/>Ubah</button><button onClick={()=>removeSantri(s)} className="p-2 rounded-xl bg-rose-50 border border-rose-200 text-rose-700" title="Hapus"><Trash2 className="w-3.5 h-3.5"/></button></>}<button onClick={()=>setActiveSantriDetail(s)} className="px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-900 text-xs font-bold flex items-center gap-1"><Eye className="w-3.5 h-3.5"/>Detail</button></div>
          </div>;
        })}
      </div>

      {filteredSantri.length === 0 && <div className="bg-white border rounded-2xl p-8 text-center text-sm text-slate-500">Tidak ada santri yang cocok dengan filter.</div>}

      {activeSantriDetail && <div className="fixed inset-0 z-50 bg-slate-950/60 p-4 flex items-center justify-center"><div className="bg-white rounded-3xl p-6 w-full max-w-xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between gap-4"><div className="flex gap-4"><Photo item={activeSantriDetail} size="large"/><div><div className="text-xs font-mono text-slate-500">NIS {activeSantriDetail.nis}</div><h3 className="text-lg font-black">{activeSantriDetail.nama}</h3><p className="text-xs text-slate-500">Kelas {normalizeKelas(activeSantriDetail.kelas)} • {activeSantriDetail.status}</p></div></div><button onClick={()=>setActiveSantriDetail(null)}><X className="w-5 h-5"/></button></div>
        <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          <Field label="NISN" value={activeSantriDetail.nisn}/><Field label="Jenis Kelamin" value={activeSantriDetail.jenisKelamin || activeSantriDetail.gender}/><Field label="Tempat Lahir" value={activeSantriDetail.tempatLahir}/><Field label="Tanggal Lahir" value={activeSantriDetail.tanggalLahir}/><Field label="Wali Santri" value={activeSantriDetail.waliSantri || activeSantriDetail.namaWali}/><Field label="No. HP Wali" value={activeSantriDetail.noHpWali}/><div className="sm:col-span-2"><Field label="Alamat" value={activeSantriDetail.alamat}/></div>
        </div>
        <div className="mt-4 rounded-2xl border bg-emerald-50 p-4 text-xs"><div className="font-bold text-emerald-950">Muhafadloh</div><div className="text-emerald-800 mt-1">{getMuhafadzoh(activeSantriDetail.nis)?.materiMuhafadzoh || 'Belum ada data materi.'}</div></div>
      </div></div>}

      {isAdmin && editingSantri && <SantriForm title="Ubah Data Santri" value={editingSantri} setValue={setEditingSantri} onSubmit={saveEdit} onClose={()=>setEditingSantri(null)} onPhoto={readPhoto}/>}
      {isAdmin && showAddModal && <SantriForm title="Tambah Santri" value={newSantri} setValue={setNewSantri} onSubmit={saveNew} onClose={()=>setShowAddModal(false)} onPhoto={readPhoto}/>}
    </div>
  );
};

const Field = ({ label, value }: { label: string; value?: string }) => <div className="rounded-xl bg-slate-50 border p-3"><div className="text-[10px] uppercase tracking-wide text-slate-400 font-bold">{label}</div><div className="font-semibold text-slate-800 mt-0.5">{value?.trim() || 'Belum diisi'}</div></div>;

interface SantriFormProps {
  title: string;
  value: Santri;
  setValue: React.Dispatch<React.SetStateAction<any>>;
  onSubmit: (e: React.FormEvent) => void;
  onClose: () => void;
  onPhoto: (file: File, apply: (value: string) => void) => void;
}

const SantriForm: React.FC<SantriFormProps> = ({ title, value, setValue, onSubmit, onClose, onPhoto }) => (
  <div className="fixed inset-0 z-[60] bg-slate-950/60 p-4 flex items-center justify-center overflow-y-auto"><div className="bg-white rounded-3xl p-6 w-full max-w-2xl my-6">
    <div className="flex justify-between items-start border-b pb-3"><div><h3 className="font-black text-slate-900">{title}</h3><p className="text-xs text-slate-500">Foto digunakan untuk kartu identitas santri. Maksimal 2 MB.</p></div><button onClick={onClose}><X className="w-5 h-5"/></button></div>
    <form onSubmit={onSubmit} className="mt-4 space-y-4 text-xs">
      <div className="flex items-center gap-4"><div className="w-20 h-20 rounded-2xl bg-slate-100 border flex items-center justify-center overflow-hidden">{hasRealPhoto(value.foto) ? <img src={value.foto} alt="Foto santri" className="w-full h-full object-cover"/> : <Camera className="w-6 h-6 text-slate-400"/>}</div><label className="px-4 py-2 rounded-xl border bg-slate-50 font-bold cursor-pointer">Pilih Foto<input type="file" accept="image/*" className="hidden" onChange={(e)=>{const f=e.target.files?.[0]; if(f) onPhoto(f,(foto)=>setValue((prev:Santri)=>({...prev,foto})));}}/></label>{hasRealPhoto(value.foto) && <button type="button" onClick={()=>setValue((prev:Santri)=>({...prev,foto:''}))} className="text-rose-700 font-bold">Hapus foto</button>}</div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <Input label="Nama Lengkap *" value={value.nama} onChange={(v)=>setValue((p:Santri)=>({...p,nama:v}))}/><Input label="NIS *" value={value.nis} onChange={(v)=>setValue((p:Santri)=>({...p,nis:v}))}/><Input label="NISN" value={value.nisn || ''} onChange={(v)=>setValue((p:Santri)=>({...p,nisn:v}))}/>
        <label className="font-bold text-slate-700">Kelas<select value={normalizeKelas(value.kelas)} onChange={(e)=>setValue((p:Santri)=>({...p,kelas:e.target.value}))} className="mt-1 w-full px-3 py-2.5 rounded-xl border bg-slate-50">{kelasOptions.map(k=><option key={k}>{k}</option>)}</select></label>
        <label className="font-bold text-slate-700">Status<select value={value.status} onChange={(e)=>setValue((p:Santri)=>({...p,status:e.target.value as StatusSantri}))} className="mt-1 w-full px-3 py-2.5 rounded-xl border bg-slate-50"><option>Aktif</option><option>Lulus</option><option>Mutasi</option><option>Cuti</option><option>Boyong</option></select></label>
        <Input label="Tempat Lahir" value={value.tempatLahir || ''} onChange={(v)=>setValue((p:Santri)=>({...p,tempatLahir:v}))}/><Input label="Tanggal Lahir" value={value.tanggalLahir || ''} onChange={(v)=>setValue((p:Santri)=>({...p,tanggalLahir:v}))}/><Input label="Wali Santri" value={value.waliSantri || ''} onChange={(v)=>setValue((p:Santri)=>({...p,waliSantri:v}))}/><Input label="No. HP Wali" value={value.noHpWali || ''} onChange={(v)=>setValue((p:Santri)=>({...p,noHpWali:v}))}/><div className="sm:col-span-2"><Input label="Alamat" value={value.alamat || ''} onChange={(v)=>setValue((p:Santri)=>({...p,alamat:v}))}/></div>
      </div>
      <div className="pt-3 border-t flex justify-end gap-2"><button type="button" onClick={onClose} className="px-4 py-2 rounded-xl font-bold text-slate-600">Batal</button><button type="submit" className="px-5 py-2 rounded-xl bg-emerald-800 text-white font-bold flex items-center gap-2"><Save className="w-4 h-4"/>Simpan</button></div>
    </form>
  </div></div>
);

const Input = ({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) => <label className="font-bold text-slate-700">{label}<input value={value} onChange={(e)=>onChange(e.target.value)} className="mt-1 w-full px-3 py-2.5 rounded-xl border bg-slate-50 font-normal"/></label>;
