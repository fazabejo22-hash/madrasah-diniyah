import React, { useMemo, useState } from 'react';
import { CheckCircle2, Edit2, FileSpreadsheet, Printer, Save, Search, X } from 'lucide-react';
import { MAPEL_RESMI_PER_KELAS } from './madinData';
import { academicGradeService, AcademicGradeRecord, AcademicMapelScore } from './academicGradeService';
import { storageService } from './storageServiceProduction';
import { UserProfile } from './types';

interface NilaiViewProps {
  userRole?: string;
  currentUser?: UserProfile;
}

const score = (n: number | null | undefined) => (typeof n === 'number' && n > 0 ? n : '—');

export const NilaiView: React.FC<NilaiViewProps> = ({ userRole = 'Guru', currentUser }) => {
  const isSiswa = userRole.toLowerCase() === 'siswa';
  const canEdit = !isSiswa;
  const tahunAjaran = storageService.getTahunAjaran();
  const activeSemester = storageService.getSemester();
  const students = storageService.getStudents();
  const [semester, setSemester] = useState<'Ganjil' | 'Genap'>(activeSemester);
  const [kelas, setKelas] = useState('Semua');
  const [query, setQuery] = useState('');
  const [editing, setEditing] = useState<AcademicGradeRecord | null>(null);
  const [toast, setToast] = useState('');
  const [, refresh] = useState(0);

  const visible = useMemo(() => {
    const base = isSiswa && currentUser
      ? students.filter((s) => {
          const a = (currentUser.nipOrNis || '').replace(/\D/g, '');
          const b = s.nis.replace(/\D/g, '');
          return (a && a === b) || s.nama.toLowerCase() === currentUser.name.toLowerCase();
        })
      : students;
    const q = query.trim().toLowerCase();
    return base.filter((s) => (kelas === 'Semua' || s.kelas === kelas) && (!q || s.nama.toLowerCase().includes(q) || s.nis.toLowerCase().includes(q)));
  }, [students, isSiswa, currentUser, kelas, query]);

  const mapelDefaults = (kelasSantri: string): AcademicMapelScore[] => {
    const tingkat = kelasSantri.replace(/\D/g, '') || '1';
    const cfg = MAPEL_RESMI_PER_KELAS[tingkat] || MAPEL_RESMI_PER_KELAS['1'];
    const list = semester === 'Ganjil' ? cfg.ganjil : cfg.genap;
    return list.map((m, i) => ({ no: i + 1, mapel: m.mapel, kitab: m.kitab, nilai: null }));
  };

  const getRecord = (nis: string, kelasSantri: string) => academicGradeService.get(nis, tahunAjaran, semester, mapelDefaults(kelasSantri));

  const muhafMap = useMemo(() => {
    const map = new Map<string, number | null>();
    storageService.getMuhafadzohList().forEach((m) => {
      const n = m.nilaiUjianMuhafadzoh ?? m.nilaiMuhafadzoh ?? null;
      map.set(m.nis, typeof n === 'number' && n > 0 ? n : null);
    });
    return map;
  }, []);

  const avg = (record: AcademicGradeRecord) => {
    const nums = record.mapelScores.map((m) => m.nilai).filter((n): n is number => typeof n === 'number' && n > 0);
    return nums.length ? (nums.reduce((a, b) => a + b, 0) / nums.length).toFixed(2) : '—';
  };

  const saveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editing) return;
    academicGradeService.save(editing);
    setEditing(null);
    refresh((n) => n + 1);
    setToast('Nilai semester berhasil disimpan.');
    setTimeout(() => setToast(''), 3000);
  };

  return (
    <div className="space-y-6 pb-12">
      {toast && <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 rounded-xl bg-emerald-900 px-4 py-3 text-xs font-bold text-white shadow-xl"><CheckCircle2 className="h-4 w-4" />{toast}</div>}
      <header className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div><h1 className="flex items-center gap-2 text-2xl font-black text-slate-900"><FileSpreadsheet className="h-6 w-6 text-emerald-700" />Buku Nilai Santri</h1><p className="mt-1 text-xs text-slate-500">Nilai tidak dibuat otomatis. Kolom kosong berarti data belum diinput.</p></div>
        <button onClick={() => window.print()} className="flex items-center gap-1.5 rounded-xl border bg-white px-4 py-2 text-xs font-bold"><Printer className="h-4 w-4 text-emerald-700" />Cetak Rekap</button>
      </header>

      <section className="grid gap-3 rounded-2xl border bg-white p-4 md:grid-cols-3">
        <div className="relative"><Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" /><input value={query} onChange={(e)=>setQuery(e.target.value)} placeholder="Cari nama atau NIS..." className="w-full rounded-xl border bg-slate-50 py-2.5 pl-9 pr-3 text-xs" /></div>
        <select value={kelas} onChange={(e)=>setKelas(e.target.value)} className="rounded-xl border bg-slate-50 px-3 py-2.5 text-xs font-bold"><option value="Semua">Semua Kelas</option>{['1A','1B','2A','2B','3A','3B','3C','4A','4B','5A','5B','6'].map((c)=><option key={c}>{c}</option>)}</select>
        <select value={semester} onChange={(e)=>setSemester(e.target.value as 'Ganjil'|'Genap')} className="rounded-xl border bg-slate-50 px-3 py-2.5 text-xs font-bold"><option value="Ganjil">Semester 1 (Ganjil)</option><option value="Genap">Semester 2 (Genap)</option></select>
      </section>

      <div className="space-y-4">
        {visible.map((student) => {
          const record = getRecord(student.nis, student.kelas);
          return <section key={student.nis} className="rounded-2xl border bg-white p-5 shadow-sm">
            <div className="mb-4 flex flex-col gap-2 border-b pb-3 sm:flex-row sm:items-center sm:justify-between"><div><div className="font-black text-slate-900">{student.nama}</div><div className="text-xs text-slate-500">NIS {student.nis} · Kelas {student.kelas} · {tahunAjaran} · {semester}</div></div>{canEdit && <button onClick={()=>setEditing(JSON.parse(JSON.stringify(record)))} className="flex items-center gap-1.5 rounded-xl bg-amber-50 px-3 py-2 text-xs font-bold text-amber-900"><Edit2 className="h-4 w-4" />Input / Edit Nilai</button>}</div>
            <div className="overflow-x-auto"><table className="w-full border-collapse text-xs"><thead><tr className="bg-slate-100"><th className="border p-2">No</th><th className="border p-2 text-left">Mata Pelajaran</th><th className="border p-2 text-left">Kitab</th><th className="border p-2">Nilai</th></tr></thead><tbody>{record.mapelScores.map((m)=><tr key={`${m.no}-${m.mapel}`}><td className="border p-2 text-center">{m.no}</td><td className="border p-2 font-semibold">{m.mapel}</td><td className="border p-2">{m.kitab}</td><td className="border p-2 text-center font-bold">{score(m.nilai)}</td></tr>)}<tr className="font-bold"><td colSpan={3} className="border p-2">Rata-rata Ujian Tulis</td><td className="border p-2 text-center">{avg(record)}</td></tr><tr className="font-bold"><td colSpan={3} className="border p-2">Nilai Muhafadloh</td><td className="border p-2 text-center">{score(muhafMap.get(student.nis))}</td></tr></tbody></table></div>
          </section>;
        })}
        {!visible.length && <div className="rounded-2xl border bg-white p-8 text-center text-xs text-slate-400">Tidak ada data santri sesuai filter.</div>}
      </div>

      {editing && <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4"><form onSubmit={saveEdit} className="max-h-[92vh] w-full max-w-3xl overflow-y-auto rounded-3xl bg-white p-6 shadow-2xl">
        <div className="flex items-start justify-between"><div><h2 className="font-black">Input Nilai Semester</h2><p className="text-xs text-slate-500">Kosongkan dengan nilai 0 bila belum ada data; pada tampilan akan muncul sebagai “—”.</p></div><button type="button" onClick={()=>setEditing(null)}><X className="h-5 w-5" /></button></div>
        <div className="mt-5 space-y-2">{editing.mapelScores.map((m,idx)=><div key={`${m.no}-${m.mapel}`} className="grid grid-cols-[1fr_110px] items-center gap-3"><div className="text-xs"><b>{m.mapel}</b><span className="ml-2 text-slate-500">{m.kitab}</span></div><input type="number" min="0" max="100" value={m.nilai ?? 0} onChange={(e)=>setEditing({...editing,mapelScores:editing.mapelScores.map((x,i)=>i===idx?{...x,nilai:Number(e.target.value)||null}:x)})} className="rounded-lg border px-3 py-2 text-sm" /></div>)}</div>
        <div className="mt-5 grid gap-3 sm:grid-cols-3"><label className="text-xs font-bold">Madrasatul Qur'an - Kelancaran<input type="number" min="0" max="100" value={editing.madrasatulQuran.kelancaran ?? 0} onChange={(e)=>setEditing({...editing,madrasatulQuran:{...editing.madrasatulQuran,kelancaran:Number(e.target.value)||null}})} className="mt-1 w-full rounded-lg border px-3 py-2" /></label><label className="text-xs font-bold">Makhroj<input type="number" min="0" max="100" value={editing.madrasatulQuran.makhroj ?? 0} onChange={(e)=>setEditing({...editing,madrasatulQuran:{...editing.madrasatulQuran,makhroj:Number(e.target.value)||null}})} className="mt-1 w-full rounded-lg border px-3 py-2" /></label><label className="text-xs font-bold">Tajwid<input type="number" min="0" max="100" value={editing.madrasatulQuran.tajwid ?? 0} onChange={(e)=>setEditing({...editing,madrasatulQuran:{...editing.madrasatulQuran,tajwid:Number(e.target.value)||null}})} className="mt-1 w-full rounded-lg border px-3 py-2" /></label><label className="text-xs font-bold">Pengajian Sore<input type="number" min="0" max="100" value={editing.pengajianSore ?? 0} onChange={(e)=>setEditing({...editing,pengajianSore:Number(e.target.value)||null})} className="mt-1 w-full rounded-lg border px-3 py-2" /></label><label className="text-xs font-bold">Akhlak<input value={editing.akhlak} onChange={(e)=>setEditing({...editing,akhlak:e.target.value})} className="mt-1 w-full rounded-lg border px-3 py-2" /></label><label className="text-xs font-bold">Peringkat<input type="number" min="1" value={editing.ranking ?? 0} onChange={(e)=>setEditing({...editing,ranking:Number(e.target.value)||null})} className="mt-1 w-full rounded-lg border px-3 py-2" /></label><label className="text-xs font-bold">Sakit<input type="number" min="0" value={editing.absensi.sakit ?? 0} onChange={(e)=>setEditing({...editing,absensi:{...editing.absensi,sakit:Number(e.target.value)}})} className="mt-1 w-full rounded-lg border px-3 py-2" /></label><label className="text-xs font-bold">Izin<input type="number" min="0" value={editing.absensi.izin ?? 0} onChange={(e)=>setEditing({...editing,absensi:{...editing.absensi,izin:Number(e.target.value)}})} className="mt-1 w-full rounded-lg border px-3 py-2" /></label><label className="text-xs font-bold">Alpha<input type="number" min="0" value={editing.absensi.alpha ?? 0} onChange={(e)=>setEditing({...editing,absensi:{...editing.absensi,alpha:Number(e.target.value)}})} className="mt-1 w-full rounded-lg border px-3 py-2" /></label></div>
        <label className="mt-3 block text-xs font-bold">Musrif / Wali Kelas<input value={editing.musrif} onChange={(e)=>setEditing({...editing,musrif:e.target.value})} className="mt-1 w-full rounded-lg border px-3 py-2" /></label><label className="mt-3 block text-xs font-bold">Catatan<textarea rows={2} value={editing.catatan} onChange={(e)=>setEditing({...editing,catatan:e.target.value})} className="mt-1 w-full rounded-lg border px-3 py-2" /></label><label className="mt-3 block text-xs font-bold">Keputusan<textarea rows={2} value={editing.keputusan} onChange={(e)=>setEditing({...editing,keputusan:e.target.value})} className="mt-1 w-full rounded-lg border px-3 py-2" /></label>
        <div className="mt-5 flex justify-end gap-2"><button type="button" onClick={()=>setEditing(null)} className="rounded-xl border px-4 py-2 text-xs font-bold">Batal</button><button type="submit" className="flex items-center gap-1.5 rounded-xl bg-emerald-800 px-4 py-2 text-xs font-bold text-white"><Save className="h-4 w-4" />Simpan Nilai</button></div>
      </form></div>}
    </div>
  );
};
