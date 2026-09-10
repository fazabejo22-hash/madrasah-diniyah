import React, { useMemo, useState } from 'react';
import { Camera, Check, Edit3, Search, ShieldCheck, Trash2, User, Users, X } from 'lucide-react';
import { Santri, StatusSantri } from './types';
import { storageService } from './storageServiceProduction';

interface SiswaDatabaseViewProps {
  userRole?: string;
}

const show = (value?: string | number | null) => (value === undefined || value === null || value === '' ? '—' : value);

export const SiswaDatabaseView: React.FC<SiswaDatabaseViewProps> = ({ userRole = 'Admin' }) => {
  const isAdmin = userRole.toLowerCase() === 'admin';
  const [students, setStudents] = useState<Santri[]>(() => storageService.getSantriList());
  const [query, setQuery] = useState('');
  const [kelas, setKelas] = useState('Semua');
  const [status, setStatus] = useState('Semua');
  const [detail, setDetail] = useState<Santri | null>(null);
  const [editing, setEditing] = useState<Santri | null>(null);
  const [toast, setToast] = useState('');

  const classList = ['1A','1B','2A','2B','3A','3B','3C','4A','4B','5A','5B','6'];

  const filtered = useMemo(() => students.filter((s) => {
    const q = query.trim().toLowerCase();
    const matchQ = !q || s.nama.toLowerCase().includes(q) || s.nis.toLowerCase().includes(q);
    const matchKelas = kelas === 'Semua' || s.kelas === kelas;
    const matchStatus = status === 'Semua' || String(s.status) === status;
    return matchQ && matchKelas && matchStatus;
  }), [students, query, kelas, status]);

  const notify = (text: string) => {
    setToast(text);
    setTimeout(() => setToast(''), 3000);
  };

  const persistEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editing) return;
    storageService.updateSantri(editing.id, editing);
    setStudents(storageService.getSantriList());
    setDetail((d) => d?.id === editing.id ? editing : d);
    setEditing(null);
    notify('Data tambahan santri berhasil disimpan.');
  };

  const setPhoto = (student: Santri, file?: File) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      notify('File foto harus berupa gambar.');
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      notify('Ukuran foto maksimal 2 MB.');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const foto = String(reader.result || '');
      storageService.updateSantri(student.id, { foto });
      const next = storageService.getSantriList();
      setStudents(next);
      if (detail?.id === student.id) setDetail(next.find((s) => s.id === student.id) || null);
      if (editing?.id === student.id) setEditing({ ...editing, foto });
      notify('Foto santri berhasil disimpan.');
    };
    reader.readAsDataURL(file);
  };

  const removePhoto = (student: Santri) => {
    storageService.updateSantri(student.id, { foto: '' });
    const next = storageService.getSantriList();
    setStudents(next);
    if (detail?.id === student.id) setDetail(next.find((s) => s.id === student.id) || null);
    notify('Foto santri dihapus.');
  };

  return (
    <div className="space-y-6 pb-12">
      {toast && <div className="fixed bottom-6 right-6 z-[70] flex items-center gap-2 rounded-xl bg-emerald-900 px-4 py-3 text-xs font-bold text-white shadow-xl"><Check className="h-4 w-4" />{toast}</div>}

      <header className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="mb-1 flex items-center gap-2 text-[10px] font-black uppercase tracking-wider text-emerald-800"><ShieldCheck className="h-4 w-4" />Master Data Resmi</div>
          <h1 className="flex items-center gap-2 text-2xl font-black text-slate-900"><Users className="h-6 w-6 text-emerald-700" />Database Santri</h1>
          <p className="mt-1 text-xs text-slate-500">NIS, nama, jenis kelamin, kelas dan status mengikuti master resmi. Biodata lain hanya tampil bila telah diisi admin.</p>
        </div>
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-2 text-xs font-bold text-emerald-950">{students.length} santri terdata</div>
      </header>

      <section className="grid gap-3 rounded-2xl border bg-white p-4 md:grid-cols-3">
        <div className="relative"><Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" /><input value={query} onChange={(e)=>setQuery(e.target.value)} placeholder="Cari nama atau NIS..." className="w-full rounded-xl border bg-slate-50 py-2.5 pl-9 pr-3 text-xs" /></div>
        <select value={kelas} onChange={(e)=>setKelas(e.target.value)} className="rounded-xl border bg-slate-50 px-3 py-2.5 text-xs font-bold"><option>Semua</option>{classList.map((c)=><option key={c} value={c}>Kelas {c}</option>)}</select>
        <select value={status} onChange={(e)=>setStatus(e.target.value)} className="rounded-xl border bg-slate-50 px-3 py-2.5 text-xs font-bold"><option>Semua</option><option>Aktif</option><option>Keluar</option><option>Lulus</option><option>Mutasi</option><option>Cuti</option><option>Boyong</option></select>
      </section>

      <section className="overflow-hidden rounded-2xl border bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-xs">
            <thead><tr className="bg-slate-100 text-slate-700"><th className="border-b p-3 text-center">No</th><th className="border-b p-3 text-left">Foto</th><th className="border-b p-3 text-left">NIS</th><th className="border-b p-3 text-left">Nama Santri</th><th className="border-b p-3 text-center">JK</th><th className="border-b p-3 text-center">Kelas</th><th className="border-b p-3 text-center">Status</th><th className="border-b p-3 text-center">Aksi</th></tr></thead>
            <tbody>
              {filtered.map((s, idx) => <tr key={s.id} className="hover:bg-slate-50">
                <td className="border-b p-3 text-center text-slate-400">{idx + 1}</td>
                <td className="border-b p-3">{s.foto ? <img src={s.foto} alt={s.nama} className="h-11 w-11 rounded-lg object-cover" /> : <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-slate-100 text-slate-400"><User className="h-5 w-5" /></div>}</td>
                <td className="border-b p-3 font-mono font-bold">{s.nis}</td>
                <td className="border-b p-3 font-bold text-slate-900">{s.nama}</td>
                <td className="border-b p-3 text-center">{show(s.jenisKelamin || s.gender)}</td>
                <td className="border-b p-3 text-center font-bold">{s.kelas}</td>
                <td className="border-b p-3 text-center"><span className="rounded-full bg-slate-100 px-2 py-1 font-bold">{show(String(s.status))}</span></td>
                <td className="border-b p-3"><div className="flex justify-center gap-1.5"><button onClick={()=>setDetail(s)} className="rounded-lg bg-emerald-50 px-2.5 py-1.5 font-bold text-emerald-900">Detail</button>{isAdmin && <button onClick={()=>setEditing({...s})} className="rounded-lg bg-amber-50 px-2.5 py-1.5 font-bold text-amber-900"><Edit3 className="mr-1 inline h-3.5 w-3.5" />Edit</button>}</div></td>
              </tr>)}
              {!filtered.length && <tr><td colSpan={8} className="p-8 text-center text-slate-400">Tidak ada data sesuai filter.</td></tr>}
            </tbody>
          </table>
        </div>
      </section>

      {detail && <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4"><div className="max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-3xl bg-white p-6 shadow-2xl">
        <div className="flex items-start justify-between"><div className="flex gap-4">{detail.foto ? <img src={detail.foto} alt={detail.nama} className="h-20 w-20 rounded-2xl object-cover" /> : <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-slate-100"><User className="h-8 w-8 text-slate-400" /></div>}<div><div className="font-mono text-xs text-slate-500">NIS {detail.nis}</div><h2 className="text-lg font-black">{detail.nama}</h2><div className="text-xs text-slate-500">Kelas {detail.kelas} · {String(detail.status)}</div></div></div><button onClick={()=>setDetail(null)}><X className="h-5 w-5" /></button></div>
        {isAdmin && <div className="mt-4 flex flex-wrap gap-2"><label className="cursor-pointer rounded-xl bg-emerald-800 px-3 py-2 text-xs font-bold text-white"><Camera className="mr-1 inline h-4 w-4" />{detail.foto ? 'Ganti Foto' : 'Upload Foto'}<input type="file" accept="image/*" className="hidden" onChange={(e)=>setPhoto(detail,e.target.files?.[0])} /></label>{detail.foto && <button onClick={()=>removePhoto(detail)} className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-xs font-bold text-rose-700"><Trash2 className="mr-1 inline h-4 w-4" />Hapus Foto</button>}<button onClick={()=>setEditing({...detail})} className="rounded-xl border px-3 py-2 text-xs font-bold"><Edit3 className="mr-1 inline h-4 w-4" />Edit Biodata Tambahan</button></div>}
        <div className="mt-5 grid gap-3 text-xs sm:grid-cols-2">{[
          ['NISN', detail.nisn],['Tempat Lahir', detail.tempatLahir],['Tanggal Lahir', detail.tanggalLahir],['Nama Wali', detail.waliSantri || detail.namaWali],['No. HP Wali', detail.noHpWali],['Alamat', detail.alamat]
        ].map(([k,v])=><div key={String(k)} className="rounded-xl border bg-slate-50 p-3"><div className="text-[10px] font-bold uppercase text-slate-400">{k}</div><div className="mt-1 font-semibold text-slate-800">{show(v)}</div></div>)}</div>
      </div></div>}

      {isAdmin && editing && <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/60 p-4"><form onSubmit={persistEdit} className="max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-3xl bg-white p-6 shadow-2xl">
        <div className="flex items-center justify-between"><div><h2 className="font-black">Biodata Tambahan Santri</h2><p className="text-xs text-slate-500">NIS, nama, kelas, jenis kelamin dan status berasal dari master resmi dan tidak diubah di formulir ini.</p></div><button type="button" onClick={()=>setEditing(null)}><X className="h-5 w-5" /></button></div>
        <div className="mt-4 rounded-xl border bg-slate-50 p-3 text-xs"><b>{editing.nama}</b> · NIS {editing.nis} · Kelas {editing.kelas} · {String(editing.status)}</div>
        <div className="mt-4 grid gap-3 sm:grid-cols-2"><label className="text-xs font-bold">NISN<input value={editing.nisn || ''} onChange={(e)=>setEditing({...editing,nisn:e.target.value})} className="mt-1 w-full rounded-xl border px-3 py-2" /></label><label className="text-xs font-bold">Tempat Lahir<input value={editing.tempatLahir || ''} onChange={(e)=>setEditing({...editing,tempatLahir:e.target.value})} className="mt-1 w-full rounded-xl border px-3 py-2" /></label><label className="text-xs font-bold">Tanggal Lahir<input value={editing.tanggalLahir || ''} onChange={(e)=>setEditing({...editing,tanggalLahir:e.target.value})} className="mt-1 w-full rounded-xl border px-3 py-2" /></label><label className="text-xs font-bold">Nama Wali<input value={editing.waliSantri || editing.namaWali || ''} onChange={(e)=>setEditing({...editing,waliSantri:e.target.value,namaWali:e.target.value})} className="mt-1 w-full rounded-xl border px-3 py-2" /></label><label className="text-xs font-bold">No. HP Wali<input value={editing.noHpWali || ''} onChange={(e)=>setEditing({...editing,noHpWali:e.target.value})} className="mt-1 w-full rounded-xl border px-3 py-2" /></label><label className="text-xs font-bold sm:col-span-2">Alamat<textarea rows={3} value={editing.alamat || ''} onChange={(e)=>setEditing({...editing,alamat:e.target.value})} className="mt-1 w-full rounded-xl border px-3 py-2" /></label></div>
        <div className="mt-4"><label className="inline-flex cursor-pointer items-center rounded-xl bg-emerald-50 px-3 py-2 text-xs font-bold text-emerald-900"><Camera className="mr-1 h-4 w-4" />Upload / Ganti Foto<input type="file" accept="image/*" className="hidden" onChange={(e)=>setPhoto(editing,e.target.files?.[0])} /></label></div>
        <div className="mt-5 flex justify-end gap-2"><button type="button" onClick={()=>setEditing(null)} className="rounded-xl border px-4 py-2 text-xs font-bold">Batal</button><button type="submit" className="rounded-xl bg-emerald-800 px-4 py-2 text-xs font-bold text-white">Simpan Biodata</button></div>
      </form></div>}
    </div>
  );
};
