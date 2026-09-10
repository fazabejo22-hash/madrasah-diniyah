import React, { useMemo, useState } from 'react';
import { CheckCircle2, Edit2, Eye, GraduationCap, Printer, Save, X } from 'lucide-react';
import { MAPEL_RESMI_PER_KELAS } from '../data/madinData';
import { PdfPreviewModal } from '../components/PdfPreviewModal';
import { storageService } from '../services/storageService';
import { academicGradeService, AcademicGradeRecord, AcademicMapelScore } from './academicGradeService';
import { UserProfile } from '../types';

interface RaportViewProps {
  currentUser?: UserProfile;
  userRole?: string;
}

const EMPTY = '—';
const showScore = (value?: number | null) => (typeof value === 'number' && value > 0 ? value : EMPTY);
const numeric = (value?: number | null) => (typeof value === 'number' && value > 0 ? value : null);

export const RaportView: React.FC<RaportViewProps> = ({ currentUser, userRole = 'Guru' }) => {
  const isAdmin = userRole.toLowerCase() === 'admin';
  const isSiswa = userRole.toLowerCase() === 'siswa';
  const students = storageService.getStudents();
  const tahunAjaran = storageService.getTahunAjaran();
  const semester = storageService.getSemester();
  const signatures = storageService.getSignaturesAndMusrif();

  const [selectedNis, setSelectedNis] = useState(() => {
    if (isSiswa && currentUser) {
      const nis = (currentUser.nipOrNis || '').replace(/\D/g, '');
      const own = students.find((s) => s.nis.replace(/\D/g, '') === nis || s.nama.toLowerCase() === currentUser.name.toLowerCase());
      return own?.nis || students[0]?.nis || '';
    }
    return students[0]?.nis || '';
  });
  const [showPdfModal, setShowPdfModal] = useState(false);
  const [editing, setEditing] = useState<AcademicGradeRecord | null>(null);
  const [toast, setToast] = useState('');
  const [, refresh] = useState(0);

  const selectedSantri = useMemo(() => {
    if (isSiswa && currentUser) {
      const nis = (currentUser.nipOrNis || '').replace(/\D/g, '');
      return students.find((s) => s.nis.replace(/\D/g, '') === nis || s.nama.toLowerCase() === currentUser.name.toLowerCase()) || students[0];
    }
    return students.find((s) => s.nis === selectedNis) || students[0];
  }, [isSiswa, currentUser, students, selectedNis]);

  const defaultMapels = useMemo<AcademicMapelScore[]>(() => {
    const tingkat = selectedSantri?.kelas?.replace(/\D/g, '') || '1';
    const cfg = MAPEL_RESMI_PER_KELAS[tingkat] || MAPEL_RESMI_PER_KELAS['1'];
    const list = semester === 'Ganjil' ? cfg.ganjil : cfg.genap;
    return list.map((m, i) => ({ no: i + 1, mapel: m.mapel, kitab: m.kitab, nilai: null }));
  }, [selectedSantri, semester]);

  const record = selectedSantri
    ? academicGradeService.get(selectedSantri.nis, tahunAjaran, semester, defaultMapels)
    : null;

  const muhafadzoh = useMemo(() => {
    const found = storageService.getMuhafadzohList().find((m) => m.nis === selectedSantri?.nis);
    if (!found) return null;
    return {
      materi: found.kitabMuhafadzoh || found.materiMuhafadzoh || '',
      target: found.targetTahunan || found.targetBait || null,
      nilai: numeric(found.nilaiUjianMuhafadzoh ?? found.nilaiMuhafadzoh ?? null),
    };
  }, [selectedSantri]);

  const validMapelScores = (record?.mapelScores || []).map((m) => numeric(m.nilai)).filter((n): n is number => n !== null);
  const totalMapel = validMapelScores.length ? validMapelScores.reduce((a, b) => a + b, 0) : null;
  const rataMapel = validMapelScores.length ? (validMapelScores.reduce((a, b) => a + b, 0) / validMapelScores.length).toFixed(2) : null;

  const mqValues = record ? [numeric(record.madrasatulQuran.kelancaran), numeric(record.madrasatulQuran.makhroj), numeric(record.madrasatulQuran.tajwid)] : [];
  const mqComplete = mqValues.length === 3 && mqValues.every((n) => n !== null);
  const mqTotal = mqComplete ? (mqValues as number[]).reduce((a, b) => a + b, 0) : null;

  const classCount = selectedSantri ? students.filter((s) => s.kelas === selectedSantri.kelas).length : 0;
  const musrif = record?.musrif || signatures.musrifPerKelas?.[selectedSantri?.kelas || ''] || '';

  const saveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editing) return;
    academicGradeService.save(editing);
    setEditing(null);
    refresh((n) => n + 1);
    setToast('Data raport berhasil disimpan.');
    setTimeout(() => setToast(''), 3000);
  };

  if (!selectedSantri || !record) {
    return <div className="rounded-2xl border bg-white p-8 text-center text-sm text-slate-500">Belum ada data santri.</div>;
  }

  return (
    <div className="space-y-6 pb-12">
      {toast && <div className="fixed bottom-6 right-6 z-50 rounded-xl bg-emerald-900 px-4 py-3 text-xs font-bold text-white shadow-xl"><CheckCircle2 className="mr-2 inline h-4 w-4" />{toast}</div>}

      <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-black text-slate-900"><GraduationCap className="h-6 w-6 text-emerald-700" />Raport Santri</h1>
          <p className="mt-1 text-xs text-slate-500">Laporan hasil belajar berbasis data yang diinput. Sistem tidak membuat nilai, peringkat, absensi, atau catatan secara otomatis.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {isAdmin && <button onClick={() => setEditing(JSON.parse(JSON.stringify(record)))} className="flex items-center gap-1.5 rounded-xl bg-amber-400 px-4 py-2 text-xs font-black text-emerald-950"><Edit2 className="h-4 w-4" />Edit Raport</button>}
          <button onClick={() => setShowPdfModal(true)} className="flex items-center gap-1.5 rounded-xl border bg-white px-4 py-2 text-xs font-bold"><Eye className="h-4 w-4" />Preview</button>
          <button onClick={() => window.print()} className="flex items-center gap-1.5 rounded-xl bg-emerald-800 px-4 py-2 text-xs font-bold text-white"><Printer className="h-4 w-4" />Cetak</button>
        </div>
      </header>

      <div className="rounded-2xl border bg-white p-4 shadow-sm">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          {isSiswa ? <div className="text-xs font-bold">{selectedSantri.nama} · Kelas {selectedSantri.kelas} · NIS {selectedSantri.nis}</div> : (
            <select value={selectedNis} onChange={(e) => setSelectedNis(e.target.value)} className="max-w-full rounded-xl border bg-slate-50 px-3 py-2 text-xs font-bold sm:w-96">
              {students.map((s) => <option key={s.nis} value={s.nis}>{s.nama} — Kelas {s.kelas} — NIS {s.nis}</option>)}
            </select>
          )}
          <div className="text-xs text-slate-600">Tahun Ajaran <b>{tahunAjaran}</b> · Semester <b>{semester === 'Ganjil' ? '1 (Ganjil)' : '2 (Genap)'}</b></div>
        </div>
      </div>

      <section className="relative mx-auto max-w-4xl overflow-hidden border-[10px] border-double border-emerald-900 bg-[#fffef8] p-6 shadow-xl sm:p-10 print:border-black print:shadow-none">
        <img src="/logo.png" alt="" className="pointer-events-none absolute left-1/2 top-1/2 w-80 -translate-x-1/2 -translate-y-1/2 opacity-[0.035]" />
        <div className="relative z-10 space-y-5">
          <header className="border-b-4 border-double border-slate-900 pb-4 text-center">
            <div className="text-sm font-black tracking-wider">LAPORAN HASIL PENILAIAN PESERTA DIDIK</div>
            <div className="text-lg font-black text-emerald-950">MADRASAH DINIYAH TAKMILIYAH ANNAJIYAH 2</div>
            <div className="text-xs font-bold">BAHRUL ULUM TAMBAKBERAS JOMBANG</div>
          </header>

          <div className="grid grid-cols-1 gap-2 text-xs sm:grid-cols-2">
            <div>Nama Santri: <b className="uppercase">{selectedSantri.nama}</b></div><div>Semester: <b>{semester === 'Ganjil' ? '1 (Ganjil)' : '2 (Genap)'}</b></div>
            <div>Kelas: <b>{selectedSantri.kelas}</b></div><div>Nomor Induk Santri: <b>{selectedSantri.nis}</b></div>
            <div className="sm:col-span-2">Tahun Ajaran: <b>{tahunAjaran}</b></div>
          </div>

          <table className="w-full border-collapse text-xs">
            <thead><tr className="bg-slate-100"><th className="border border-slate-500 p-2">No</th><th className="border border-slate-500 p-2 text-left">Mata Pelajaran</th><th className="border border-slate-500 p-2 text-left">Kitab</th><th className="border border-slate-500 p-2">Nilai</th></tr></thead>
            <tbody>
              {record.mapelScores.map((m) => <tr key={`${m.no}-${m.mapel}`}><td className="border border-slate-500 p-2 text-center">{m.no}</td><td className="border border-slate-500 p-2 font-semibold">{m.mapel}</td><td className="border border-slate-500 p-2">{m.kitab}</td><td className="border border-slate-500 p-2 text-center font-bold">{showScore(m.nilai)}</td></tr>)}
              <tr className="font-bold"><td colSpan={3} className="border border-slate-500 p-2">Jumlah Nilai Ujian Tulis</td><td className="border border-slate-500 p-2 text-center">{totalMapel ?? EMPTY}</td></tr>
              <tr className="font-bold"><td colSpan={3} className="border border-slate-500 p-2">Rata-rata Nilai Ujian Tulis</td><td className="border border-slate-500 p-2 text-center">{rataMapel ?? EMPTY}</td></tr>
            </tbody>
          </table>

          <table className="w-full border-collapse text-xs">
            <thead><tr className="bg-emerald-900 text-white print:bg-white print:text-black"><th colSpan={4} className="border border-slate-500 p-2 text-left">UJIAN MUHAFADZOH</th></tr><tr className="bg-slate-100"><th className="border border-slate-500 p-2">No</th><th className="border border-slate-500 p-2 text-left">Materi / Kitab</th><th className="border border-slate-500 p-2">Target Tahunan</th><th className="border border-slate-500 p-2">Nilai</th></tr></thead>
            <tbody><tr><td className="border border-slate-500 p-2 text-center">1</td><td className="border border-slate-500 p-2">{muhafadzoh?.materi || EMPTY}</td><td className="border border-slate-500 p-2 text-center">{muhafadzoh?.target || EMPTY}</td><td className="border border-slate-500 p-2 text-center font-bold">{showScore(muhafadzoh?.nilai)}</td></tr></tbody>
          </table>

          <div className="grid gap-4 md:grid-cols-2">
            <table className="w-full border-collapse text-xs"><thead><tr className="bg-slate-800 text-white print:bg-white print:text-black"><th colSpan={3} className="border border-slate-500 p-2">UJIAN MADRASATUL QUR&apos;AN</th></tr></thead><tbody><tr><td className="border border-slate-500 p-2 text-center">1</td><td className="border border-slate-500 p-2">Kelancaran</td><td className="border border-slate-500 p-2 text-center">{showScore(record.madrasatulQuran.kelancaran)} / 25</td></tr><tr><td className="border border-slate-500 p-2 text-center">2</td><td className="border border-slate-500 p-2">Makhroj</td><td className="border border-slate-500 p-2 text-center">{showScore(record.madrasatulQuran.makhroj)} / 25</td></tr><tr><td className="border border-slate-500 p-2 text-center">3</td><td className="border border-slate-500 p-2">Tajwid</td><td className="border border-slate-500 p-2 text-center">{showScore(record.madrasatulQuran.tajwid)} / 50</td></tr><tr className="font-bold"><td colSpan={2} className="border border-slate-500 p-2">Jumlah Nilai</td><td className="border border-slate-500 p-2 text-center">{mqTotal ?? EMPTY}</td></tr></tbody></table>
            <table className="w-full border-collapse text-xs"><thead><tr className="bg-slate-800 text-white print:bg-white print:text-black"><th colSpan={3} className="border border-slate-500 p-2">UJIAN PENGAJIAN SORE</th></tr></thead><tbody><tr><td className="border border-slate-500 p-2 text-center">1</td><td className="border border-slate-500 p-2">Nilai Pengajian Sore</td><td className="border border-slate-500 p-2 text-center font-bold">{showScore(record.pengajianSore)}</td></tr><tr className="font-bold"><td colSpan={2} className="border border-slate-500 p-2">Rata-rata</td><td className="border border-slate-500 p-2 text-center">{showScore(record.pengajianSore)}</td></tr></tbody></table>
          </div>

          <table className="w-full border-collapse text-xs"><thead><tr className="bg-slate-100"><th colSpan={4} className="border border-slate-500 p-2 text-left">LAIN-LAIN</th></tr></thead><tbody><tr><td className="border border-slate-500 p-2">Kelakuan / Akhlak</td><td className="border border-slate-500 p-2 text-center font-bold">{record.akhlak || EMPTY}</td><td className="border border-slate-500 p-2">Sakit / Izin / Alpha</td><td className="border border-slate-500 p-2 text-center">{record.absensi.sakit ?? EMPTY} / {record.absensi.izin ?? EMPTY} / {record.absensi.alpha ?? EMPTY}</td></tr><tr><td className="border border-slate-500 p-2">Peringkat Kelas</td><td className="border border-slate-500 p-2 text-center">{record.ranking ?? EMPTY}</td><td className="border border-slate-500 p-2">Jumlah Santri</td><td className="border border-slate-500 p-2 text-center">{classCount || EMPTY}</td></tr></tbody></table>

          <div className="grid gap-3 text-xs sm:grid-cols-2"><div className="border border-slate-500 p-3"><b>Catatan Wali Kelas / Musrif</b><p className="mt-2 min-h-12 whitespace-pre-wrap">{record.catatan || EMPTY}</p></div><div className="border border-slate-500 p-3"><b>Keputusan</b><p className="mt-2 min-h-12 whitespace-pre-wrap">{record.keputusan || EMPTY}</p></div></div>

          <div className="grid grid-cols-2 gap-8 pt-4 text-center text-xs"><div><div>Wali Kelas / Musrif</div><div className="h-16" /><b>{musrif || EMPTY}</b></div><div><div>{signatures.titimangsaRaport || 'Jombang, ....................'}</div><div>{signatures.jabatanPengasuh || 'Pengasuh / Kepala Madrasah'}</div><div className="h-12" /><b>{signatures.namaPengasuh || EMPTY}</b></div></div>
        </div>
      </section>

      {isAdmin && editing && <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4"><form onSubmit={saveEdit} className="max-h-[92vh] w-full max-w-3xl overflow-y-auto rounded-3xl bg-white p-6 shadow-2xl">
        <div className="flex items-start justify-between"><div><h2 className="font-black">Edit Data Raport</h2><p className="text-xs text-slate-500">Kolom kosong tidak diisi otomatis. Nilai Muhafadloh dikelola pada modul Muhafadloh M1–M8.</p></div><button type="button" onClick={() => setEditing(null)}><X className="h-5 w-5" /></button></div>
        <div className="mt-5 space-y-2">{editing.mapelScores.map((m, idx) => <div key={`${m.no}-${m.mapel}`} className="grid grid-cols-[1fr_110px] items-center gap-3"><div className="text-xs"><b>{m.mapel}</b><span className="ml-2 text-slate-500">{m.kitab}</span></div><input type="number" min="0" max="100" value={m.nilai ?? 0} onChange={(e) => setEditing({ ...editing, mapelScores: editing.mapelScores.map((x, i) => i === idx ? { ...x, nilai: Number(e.target.value) || null } : x) })} className="rounded-lg border px-3 py-2 text-sm" /></div>)}</div>
        <div className="mt-5 grid gap-3 sm:grid-cols-3"><label className="text-xs font-bold">MQ Kelancaran (maks. 25)<input type="number" min="0" max="25" value={editing.madrasatulQuran.kelancaran ?? 0} onChange={(e) => setEditing({ ...editing, madrasatulQuran: { ...editing.madrasatulQuran, kelancaran: Number(e.target.value) || null } })} className="mt-1 w-full rounded-lg border px-3 py-2" /></label><label className="text-xs font-bold">MQ Makhroj (maks. 25)<input type="number" min="0" max="25" value={editing.madrasatulQuran.makhroj ?? 0} onChange={(e) => setEditing({ ...editing, madrasatulQuran: { ...editing.madrasatulQuran, makhroj: Number(e.target.value) || null } })} className="mt-1 w-full rounded-lg border px-3 py-2" /></label><label className="text-xs font-bold">MQ Tajwid (maks. 50)<input type="number" min="0" max="50" value={editing.madrasatulQuran.tajwid ?? 0} onChange={(e) => setEditing({ ...editing, madrasatulQuran: { ...editing.madrasatulQuran, tajwid: Number(e.target.value) || null } })} className="mt-1 w-full rounded-lg border px-3 py-2" /></label><label className="text-xs font-bold">Pengajian Sore<input type="number" min="0" max="100" value={editing.pengajianSore ?? 0} onChange={(e) => setEditing({ ...editing, pengajianSore: Number(e.target.value) || null })} className="mt-1 w-full rounded-lg border px-3 py-2" /></label><label className="text-xs font-bold">Akhlak<input value={editing.akhlak} onChange={(e) => setEditing({ ...editing, akhlak: e.target.value })} className="mt-1 w-full rounded-lg border px-3 py-2" /></label><label className="text-xs font-bold">Peringkat<input type="number" min="1" value={editing.ranking ?? 0} onChange={(e) => setEditing({ ...editing, ranking: Number(e.target.value) || null })} className="mt-1 w-full rounded-lg border px-3 py-2" /></label><label className="text-xs font-bold">Sakit<input type="number" min="0" value={editing.absensi.sakit ?? 0} onChange={(e) => setEditing({ ...editing, absensi: { ...editing.absensi, sakit: Number(e.target.value) } })} className="mt-1 w-full rounded-lg border px-3 py-2" /></label><label className="text-xs font-bold">Izin<input type="number" min="0" value={editing.absensi.izin ?? 0} onChange={(e) => setEditing({ ...editing, absensi: { ...editing.absensi, izin: Number(e.target.value) } })} className="mt-1 w-full rounded-lg border px-3 py-2" /></label><label className="text-xs font-bold">Alpha<input type="number" min="0" value={editing.absensi.alpha ?? 0} onChange={(e) => setEditing({ ...editing, absensi: { ...editing.absensi, alpha: Number(e.target.value) } })} className="mt-1 w-full rounded-lg border px-3 py-2" /></label></div>
        <label className="mt-3 block text-xs font-bold">Musrif / Wali Kelas<input value={editing.musrif} onChange={(e) => setEditing({ ...editing, musrif: e.target.value })} className="mt-1 w-full rounded-lg border px-3 py-2" /></label><label className="mt-3 block text-xs font-bold">Catatan<textarea rows={3} value={editing.catatan} onChange={(e) => setEditing({ ...editing, catatan: e.target.value })} className="mt-1 w-full rounded-lg border px-3 py-2" /></label><label className="mt-3 block text-xs font-bold">Keputusan<textarea rows={3} value={editing.keputusan} onChange={(e) => setEditing({ ...editing, keputusan: e.target.value })} className="mt-1 w-full rounded-lg border px-3 py-2" /></label>
        <div className="mt-5 flex justify-end gap-2"><button type="button" onClick={() => setEditing(null)} className="rounded-xl border px-4 py-2 text-xs font-bold">Batal</button><button type="submit" className="flex items-center gap-1.5 rounded-xl bg-emerald-800 px-4 py-2 text-xs font-bold text-white"><Save className="h-4 w-4" />Simpan</button></div>
      </form></div>}

      {showPdfModal && <PdfPreviewModal isOpen={showPdfModal} onClose={() => setShowPdfModal(false)} title={`Raport ${selectedSantri.nama}`}><div className="p-8 text-center text-sm text-slate-600">Gunakan tombol Cetak pada halaman raport untuk menyimpan ke PDF. Data kosong tetap ditandai “—” dan tidak diisi nilai contoh.</div></PdfPreviewModal>}
    </div>
  );
};
