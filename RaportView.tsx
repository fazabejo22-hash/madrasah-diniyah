import React, { useMemo, useState } from 'react';
import { Award, CheckCircle2, Edit2, Eye, GraduationCap, Printer, Save, X } from 'lucide-react';
import { MAPEL_RESMI_PER_KELAS } from '../data/madinData';
import { PdfPreviewModal } from '../components/PdfPreviewModal';
import { storageService } from '../services/storageService';
import { UserProfile } from '../types';

interface RaportViewProps {
  currentUser?: UserProfile;
  userRole?: string;
}

type MapelScore = { no: number; mapel: string; kitab: string; nilai: number };

const EMPTY = '—';
const displayScore = (value?: number | null) => (typeof value === 'number' && value > 0 ? value : EMPTY);

export const RaportView: React.FC<RaportViewProps> = ({ currentUser, userRole = 'Guru' }) => {
  const isAdmin = userRole.toLowerCase() === 'admin';
  const isSiswa = userRole.toLowerCase() === 'siswa';
  const students = storageService.getStudents();
  const tahunAjaran = storageService.getTahunAjaran();
  const semester = storageService.getSemester();
  const [overrides, setOverrides] = useState(() => storageService.getRaportOverrides());
  const [selectedNis, setSelectedNis] = useState(() => {
    if (isSiswa && currentUser) {
      const nis = (currentUser.nipOrNis || '').replace(/[^0-9]/g, '');
      const own = students.find((s) => s.nis.replace(/[^0-9]/g, '') === nis || s.nama.toLowerCase() === currentUser.name.toLowerCase());
      return own?.nis || students[0]?.nis || '';
    }
    return students[0]?.nis || '';
  });
  const [showPdfModal, setShowPdfModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const selectedSantri = useMemo(() => {
    if (isSiswa && currentUser) {
      const nis = (currentUser.nipOrNis || '').replace(/[^0-9]/g, '');
      return students.find((s) => s.nis.replace(/[^0-9]/g, '') === nis || s.nama.toLowerCase() === currentUser.name.toLowerCase()) || students[0];
    }
    return students.find((s) => s.nis === selectedNis) || students[0];
  }, [isSiswa, currentUser, students, selectedNis]);

  const override = selectedSantri ? overrides[selectedSantri.nis] || {} : {};
  const tingkat = selectedSantri?.kelas?.replace(/[^0-9]/g, '') || '1';
  const officialMapel = MAPEL_RESMI_PER_KELAS[tingkat] || MAPEL_RESMI_PER_KELAS['1'];
  const semesterKey = semester === 'Ganjil' ? 'ganjil' : 'genap';

  const blankMapelScores: MapelScore[] = useMemo(
    () => (officialMapel?.[semesterKey] || []).map((m, idx) => ({ no: idx + 1, mapel: m.mapel, kitab: m.kitab, nilai: 0 })),
    [officialMapel, semesterKey]
  );
  const mapelScores: MapelScore[] = override.mapelScores?.length ? override.mapelScores : blankMapelScores;
  const validScores = mapelScores.map((m) => Number(m.nilai)).filter((n) => Number.isFinite(n) && n > 0);
  const totalNilai = validScores.length ? validScores.reduce((a, b) => a + b, 0) : null;
  const rataNilai = validScores.length ? (validScores.reduce((a, b) => a + b, 0) / validScores.length).toFixed(2) : null;

  const muhafadzoh = useMemo(() => {
    const found = storageService.getMuhafadzohList().find((m) => m.nis === selectedSantri?.nis);
    if (!found) return null;
    const nilai = override.nilaiMuhafadzoh ?? found.nilaiUjianMuhafadzoh ?? found.nilaiMuhafadzoh ?? null;
    return {
      materi: found.kitabMuhafadzoh || found.materiMuhafadzoh || '',
      nilai,
      target: found.targetTahunan || found.targetBait || null,
    };
  }, [selectedSantri, override.nilaiMuhafadzoh]);

  const signatures = storageService.getSignaturesAndMusrif();
  const musrif = override.musrifName || signatures.musrifPerKelas?.[selectedSantri?.kelas || ''] || '';
  const catatan = override.catatanWaliKelas || '';
  const keputusan = override.keputusanNaik || '';
  const akhlak = override.akhlakPredikat || '';

  const [editScores, setEditScores] = useState<MapelScore[]>([]);
  const [editMuhafadzoh, setEditMuhafadzoh] = useState<number>(0);
  const [editAkhlak, setEditAkhlak] = useState('');
  const [editCatatan, setEditCatatan] = useState('');
  const [editKeputusan, setEditKeputusan] = useState('');
  const [editMusrif, setEditMusrif] = useState('');

  const openEdit = () => {
    setEditScores(mapelScores.map((m) => ({ ...m })));
    setEditMuhafadzoh(typeof muhafadzoh?.nilai === 'number' ? muhafadzoh.nilai : 0);
    setEditAkhlak(akhlak);
    setEditCatatan(catatan);
    setEditKeputusan(keputusan);
    setEditMusrif(musrif);
    setShowEditModal(true);
  };

  const saveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSantri) return;
    storageService.saveRaportOverride(selectedSantri.nis, {
      mapelScores: editScores.map((m) => ({ ...m, nilai: Number(m.nilai) || 0 })),
      nilaiMuhafadzoh: Number(editMuhafadzoh) || 0,
      akhlakPredikat: editAkhlak.trim(),
      catatanWaliKelas: editCatatan.trim(),
      keputusanNaik: editKeputusan.trim(),
      musrifName: editMusrif.trim(),
    });
    setOverrides(storageService.getRaportOverrides());
    setShowEditModal(false);
    setToast('Data raport berhasil disimpan.');
    setTimeout(() => setToast(null), 3000);
  };

  if (!selectedSantri) {
    return <div className="rounded-2xl border bg-white p-8 text-center text-sm text-slate-500">Belum ada data santri.</div>;
  }

  return (
    <div className="space-y-6 pb-12">
      {toast && <div className="fixed bottom-6 right-6 z-50 rounded-xl bg-emerald-900 px-4 py-3 text-xs font-bold text-white shadow-xl"><CheckCircle2 className="mr-2 inline h-4 w-4" />{toast}</div>}

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-black text-slate-900"><GraduationCap className="h-6 w-6 text-emerald-700" />Raport Santri</h1>
          <p className="mt-1 text-xs text-slate-500">Format laporan hasil belajar Madrasah Diniyah Takmiliyah. Nilai yang belum diinput ditampilkan kosong dan tidak dibuat otomatis.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {isAdmin && <button onClick={openEdit} className="flex items-center gap-1.5 rounded-xl bg-amber-400 px-4 py-2 text-xs font-black text-emerald-950"><Edit2 className="h-4 w-4" />Edit Raport</button>}
          <button onClick={() => setShowPdfModal(true)} className="flex items-center gap-1.5 rounded-xl border bg-white px-4 py-2 text-xs font-bold"><Eye className="h-4 w-4" />Preview</button>
          <button onClick={() => window.print()} className="flex items-center gap-1.5 rounded-xl bg-emerald-800 px-4 py-2 text-xs font-bold text-white"><Printer className="h-4 w-4" />Cetak</button>
        </div>
      </div>

      <div className="rounded-2xl border bg-white p-4 shadow-sm">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          {isSiswa ? <div className="text-xs font-bold">{selectedSantri.nama} · Kelas {selectedSantri.kelas} · NIS {selectedSantri.nis}</div> : (
            <select value={selectedNis} onChange={(e) => setSelectedNis(e.target.value)} className="rounded-xl border bg-slate-50 px-3 py-2 text-xs font-bold">
              {students.map((s) => <option key={s.nis} value={s.nis}>{s.nama} — Kelas {s.kelas} — {s.nis}</option>)}
            </select>
          )}
          <div className="text-xs text-slate-600">Tahun Ajaran <b>{tahunAjaran}</b> · Semester <b>{semester === 'Ganjil' ? '1 (Ganjil)' : '2 (Genap)'}</b></div>
        </div>
      </div>

      <section className="relative mx-auto max-w-4xl overflow-hidden border-[10px] border-double border-emerald-900 bg-[#fffef8] p-6 shadow-xl sm:p-10 print:shadow-none">
        <img src="/logo.png" alt="" className="pointer-events-none absolute left-1/2 top-1/2 w-80 -translate-x-1/2 -translate-y-1/2 opacity-[0.035]" />
        <div className="relative z-10 space-y-5">
          <header className="border-b-4 border-double border-slate-900 pb-4 text-center">
            <div className="text-sm font-black tracking-wider">LAPORAN HASIL PENILAIAN PESERTA DIDIK</div>
            <div className="text-lg font-black text-emerald-950">MADRASAH DINIYAH TAKMILIYAH AN-NAJIYAH 2</div>
            <div className="text-xs font-bold">BAHRUL ULUM TAMBAKBERAS JOMBANG</div>
          </header>

          <div className="grid grid-cols-1 gap-2 text-xs sm:grid-cols-2">
            <div>Nama Santri: <b className="uppercase">{selectedSantri.nama}</b></div><div>Semester: <b>{semester === 'Ganjil' ? '1 (Ganjil)' : '2 (Genap)'}</b></div>
            <div>Kelas: <b>{selectedSantri.kelas}</b></div><div>NIS: <b>{selectedSantri.nis}</b></div>
            <div className="sm:col-span-2">Tahun Ajaran: <b>{tahunAjaran}</b></div>
          </div>

          <table className="w-full border-collapse text-xs">
            <thead><tr className="bg-slate-100"><th className="border p-2">No</th><th className="border p-2 text-left">Mata Pelajaran</th><th className="border p-2 text-left">Kitab</th><th className="border p-2">Nilai</th></tr></thead>
            <tbody>
              {mapelScores.map((m) => <tr key={`${m.no}-${m.mapel}`}><td className="border p-2 text-center">{m.no}</td><td className="border p-2 font-semibold">{m.mapel}</td><td className="border p-2">{m.kitab}</td><td className="border p-2 text-center font-bold">{displayScore(m.nilai)}</td></tr>)}
              <tr className="font-bold"><td colSpan={3} className="border p-2">Jumlah Nilai Ujian Tulis</td><td className="border p-2 text-center">{totalNilai ?? EMPTY}</td></tr>
              <tr className="font-bold"><td colSpan={3} className="border p-2">Rata-rata Nilai Ujian Tulis</td><td className="border p-2 text-center">{rataNilai ?? EMPTY}</td></tr>
            </tbody>
          </table>

          <table className="w-full border-collapse text-xs">
            <thead><tr className="bg-emerald-900 text-white"><th colSpan={4} className="border p-2 text-left">UJIAN MUHAFADZOH</th></tr><tr className="bg-slate-100"><th className="border p-2">No</th><th className="border p-2 text-left">Materi / Kitab</th><th className="border p-2">Target Tahunan</th><th className="border p-2">Nilai</th></tr></thead>
            <tbody><tr><td className="border p-2 text-center">1</td><td className="border p-2">{muhafadzoh?.materi || EMPTY}</td><td className="border p-2 text-center">{muhafadzoh?.target || EMPTY}</td><td className="border p-2 text-center font-bold">{displayScore(muhafadzoh?.nilai)}</td></tr></tbody>
          </table>

          <div className="grid gap-4 md:grid-cols-2">
            <table className="w-full border-collapse text-xs"><thead><tr className="bg-slate-800 text-white"><th colSpan={3} className="border p-2">UJIAN MADRASATUL QUR'AN</th></tr></thead><tbody>{['Kelancaran','Makhroj','Tajwid'].map((x,i)=><tr key={x}><td className="border p-2 text-center">{i+1}</td><td className="border p-2">{x}</td><td className="border p-2 text-center">{EMPTY}</td></tr>)}<tr className="font-bold"><td colSpan={2} className="border p-2">Jumlah / Rata-rata</td><td className="border p-2 text-center">{EMPTY}</td></tr></tbody></table>
            <table className="w-full border-collapse text-xs"><thead><tr className="bg-slate-800 text-white"><th colSpan={3} className="border p-2">UJIAN PENGAJIAN SORE</th></tr></thead><tbody>{['Nilai Pengajian Sore'].map((x,i)=><tr key={x}><td className="border p-2 text-center">{i+1}</td><td className="border p-2">{x}</td><td className="border p-2 text-center">{EMPTY}</td></tr>)}<tr className="font-bold"><td colSpan={2} className="border p-2">Rata-rata</td><td className="border p-2 text-center">{EMPTY}</td></tr></tbody></table>
          </div>

          <table className="w-full border-collapse text-xs"><thead><tr className="bg-slate-100"><th colSpan={4} className="border p-2 text-left">LAIN-LAIN</th></tr></thead><tbody><tr><td className="border p-2">Kelakuan / Akhlak</td><td className="border p-2 text-center font-bold">{akhlak || EMPTY}</td><td className="border p-2">Sakit / Izin / Alpha</td><td className="border p-2 text-center">{EMPTY}</td></tr><tr><td className="border p-2">Peringkat Kelas</td><td className="border p-2 text-center">{EMPTY}</td><td className="border p-2">Jumlah Santri</td><td className="border p-2 text-center">{students.filter((s) => s.kelas === selectedSantri.kelas).length || EMPTY}</td></tr></tbody></table>

          <div className="grid gap-3 text-xs sm:grid-cols-2"><div className="rounded border p-3"><b>Catatan Wali Kelas / Musrif</b><p className="mt-2 min-h-12">{catatan || EMPTY}</p></div><div className="rounded border p-3"><b>Keputusan</b><p className="mt-2 min-h-12">{keputusan || EMPTY}</p></div></div>

          <div className="grid grid-cols-2 gap-8 pt-4 text-center text-xs"><div><div>Wali Kelas / Musrif</div><div className="h-16" /><b>{musrif || EMPTY}</b></div><div><div>{signatures.titimangsaRaport || 'Jombang, ....................'}</div><div>Pengasuh / Kepala Madrasah</div><div className="h-12" /><b>{signatures.namaPengasuh || EMPTY}</b></div></div>
        </div>
      </section>

      {isAdmin && showEditModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4">
          <form onSubmit={saveEdit} className="max-h-[92vh] w-full max-w-3xl overflow-y-auto rounded-3xl bg-white p-6 shadow-2xl">
            <div className="mb-4 flex items-center justify-between"><h2 className="font-black">Edit Data Raport</h2><button type="button" onClick={() => setShowEditModal(false)}><X className="h-5 w-5" /></button></div>
            <p className="mb-4 text-xs text-slate-500">Masukkan hanya nilai yang benar-benar sudah tersedia. Nilai 0 akan ditampilkan sebagai kosong pada raport.</p>
            <div className="space-y-2">{editScores.map((m, idx) => <div key={`${m.no}-${m.mapel}`} className="grid grid-cols-[1fr_110px] items-center gap-3"><div className="text-xs"><b>{m.mapel}</b><span className="ml-2 text-slate-500">{m.kitab}</span></div><input type="number" min="0" max="100" value={m.nilai} onChange={(e)=>setEditScores((prev)=>prev.map((x,i)=>i===idx?{...x,nilai:Number(e.target.value)}:x))} className="rounded-lg border px-3 py-2 text-sm" /></div>)}</div>
            <div className="mt-5 grid gap-3 sm:grid-cols-2"><label className="text-xs font-bold">Nilai Muhafadloh<input type="number" min="0" max="100" value={editMuhafadzoh} onChange={(e)=>setEditMuhafadzoh(Number(e.target.value))} className="mt-1 w-full rounded-lg border px-3 py-2" /></label><label className="text-xs font-bold">Akhlak<input value={editAkhlak} onChange={(e)=>setEditAkhlak(e.target.value)} className="mt-1 w-full rounded-lg border px-3 py-2" /></label><label className="text-xs font-bold">Musrif / Wali Kelas<input value={editMusrif} onChange={(e)=>setEditMusrif(e.target.value)} className="mt-1 w-full rounded-lg border px-3 py-2" /></label></div>
            <label className="mt-3 block text-xs font-bold">Catatan<textarea rows={3} value={editCatatan} onChange={(e)=>setEditCatatan(e.target.value)} className="mt-1 w-full rounded-lg border px-3 py-2" /></label><label className="mt-3 block text-xs font-bold">Keputusan<textarea rows={3} value={editKeputusan} onChange={(e)=>setEditKeputusan(e.target.value)} className="mt-1 w-full rounded-lg border px-3 py-2" /></label>
            <div className="mt-5 flex justify-end gap-2"><button type="button" onClick={() => setShowEditModal(false)} className="rounded-xl border px-4 py-2 text-xs font-bold">Batal</button><button type="submit" className="flex items-center gap-1.5 rounded-xl bg-emerald-800 px-4 py-2 text-xs font-bold text-white"><Save className="h-4 w-4" />Simpan</button></div>
          </form>
        </div>
      )}

      {showPdfModal && <PdfPreviewModal isOpen={showPdfModal} onClose={() => setShowPdfModal(false)} title={`Raport ${selectedSantri.nama}`}><div className="p-6 text-center text-sm text-slate-600"><Award className="mx-auto mb-3 h-10 w-10 text-emerald-700" />Gunakan tombol Cetak pada halaman raport untuk menyimpan sebagai PDF dengan format kertas resmi.</div></PdfPreviewModal>}
    </div>
  );
};
