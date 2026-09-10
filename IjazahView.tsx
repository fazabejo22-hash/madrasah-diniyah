import React, { useMemo, useState } from 'react';
import { Award, Printer, Edit2, Save, X, ShieldAlert } from 'lucide-react';
import { storageService } from '../services/storageService';
import { UserProfile } from '../types';

interface IjazahViewProps {
  currentUser?: UserProfile;
  userRole?: string;
}

type NilaiIjazah = { no: number; mapel: string; angka: number; huruf?: string };

const MAPEL_IJAZAH = ['Tasawwuf','Fiqih','Tauhid','Aswaja','Baca Kitab','Baca Al-Qur’an','Muhafadhoh'];

const terbilang = (n: number): string => {
  const dasar = ['','Satu','Dua','Tiga','Empat','Lima','Enam','Tujuh','Delapan','Sembilan','Sepuluh','Sebelas'];
  if (!Number.isFinite(n) || n <= 0) return '—';
  const angka = Math.round(n);
  const baca = (x: number): string => {
    if (x < 12) return dasar[x];
    if (x < 20) return `${baca(x - 10)} Belas`;
    if (x < 100) return `${baca(Math.floor(x / 10))} Puluh${x % 10 ? ` ${baca(x % 10)}` : ''}`;
    return String(x);
  };
  return baca(angka);
};

export const IjazahView: React.FC<IjazahViewProps> = ({ currentUser, userRole = 'Guru' }) => {
  const isAdmin = userRole.toLowerCase() === 'admin';
  const isSiswa = userRole.toLowerCase() === 'siswa';
  const students = useMemo(() => storageService.getStudents(), []);
  const kelas6 = useMemo(() => students.filter((s) => String(s.kelas).replace(/^Kelas\s+/i,'') === '6'), [students]);

  const ownStudent = useMemo(() => {
    if (!isSiswa || !currentUser) return null;
    const nis = (currentUser.nipOrNis || '').replace(/\D/g,'');
    return students.find((s) => s.nis.replace(/\D/g,'') === nis) || null;
  }, [isSiswa, currentUser, students]);

  if (isSiswa && (!ownStudent || String(ownStudent.kelas).replace(/^Kelas\s+/i,'') !== '6')) {
    return <div className="max-w-lg mx-auto my-12 bg-white rounded-3xl border border-rose-200 p-8 text-center"><ShieldAlert className="w-12 h-12 text-rose-600 mx-auto mb-3"/><h2 className="font-black text-lg">Akses Ijazah Dibatasi</h2><p className="text-xs text-slate-600 mt-2">Ijazah hanya tersedia untuk santri tingkat akhir yang telah ditetapkan lulus.</p></div>;
  }

  const [selectedNis, setSelectedNis] = useState(() => ownStudent?.nis || kelas6[0]?.nis || '');
  const [overrides, setOverrides] = useState(() => storageService.getIjazahOverrides());
  const [signatures, setSignatures] = useState(() => storageService.getSignaturesAndMusrif());
  const [showEdit, setShowEdit] = useState(false);
  const [activePage, setActivePage] = useState<'depan'|'belakang'>('depan');

  const selected = isSiswa ? ownStudent : (kelas6.find((s)=>s.nis===selectedNis) || kelas6[0]);
  const o = selected ? overrides[selected.nis] || {} : {};
  const baseScores: NilaiIjazah[] = MAPEL_IJAZAH.map((mapel, i) => ({ no: i + 1, mapel, angka: 0, huruf: '—' }));
  const scores: NilaiIjazah[] = o.nilaiMapel?.length ? o.nilaiMapel : baseScores;

  const [editNomor, setEditNomor] = useState('');
  const [editStatus, setEditStatus] = useState('L U L U S');
  const [editTempatLahir, setEditTempatLahir] = useState('');
  const [editTanggalLahir, setEditTanggalLahir] = useState('');
  const [editTitimangsa, setEditTitimangsa] = useState('');
  const [editPengasuh, setEditPengasuh] = useState('');
  const [editScores, setEditScores] = useState<NilaiIjazah[]>(baseScores);

  const openEdit = () => {
    if (!selected) return;
    setEditNomor(o.nomorIjazah || signatures.nomorIjazahTemplate?.replace('{NIS}', selected.nis) || '');
    setEditStatus(o.statusKelulusan || 'L U L U S');
    setEditTempatLahir(o.tempatLahir || (selected.tempatLahir && selected.tempatLahir !== 'Jombang' ? selected.tempatLahir : ''));
    setEditTanggalLahir(o.tanggalLahir || (selected.tanggalLahir && !selected.tanggalLahir.includes('Muharram') ? selected.tanggalLahir : ''));
    setEditTitimangsa(signatures.titimangsaIjazah || '');
    setEditPengasuh(signatures.namaPengasuh || '');
    setEditScores(scores.map((s)=>({...s})));
    setShowEdit(true);
  };

  const saveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selected) return;
    storageService.saveIjazahOverride(selected.nis, {
      nomorIjazah: editNomor.trim(),
      statusKelulusan: editStatus.trim(),
      tempatLahir: editTempatLahir.trim(),
      tanggalLahir: editTanggalLahir.trim(),
      nilaiMapel: editScores.map((s)=>({ ...s, angka: Number(s.angka) || 0, huruf: terbilang(Number(s.angka) || 0) })),
    });
    const updatedSig = { ...signatures, titimangsaIjazah: editTitimangsa.trim(), namaPengasuh: editPengasuh.trim() };
    storageService.saveSignaturesAndMusrif(updatedSig);
    setSignatures(updatedSig);
    setOverrides(storageService.getIjazahOverrides());
    setShowEdit(false);
  };

  if (!selected) return <div className="bg-white border rounded-2xl p-8 text-center text-sm text-slate-500">Belum ada data santri kelas 6.</div>;

  const displayNomor = o.nomorIjazah || signatures.nomorIjazahTemplate?.replace('{NIS}', selected.nis) || 'Belum ditetapkan';
  const displayTempat = o.tempatLahir || (selected.tempatLahir && selected.tempatLahir !== 'Jombang' ? selected.tempatLahir : 'Belum diisi');
  const displayTanggal = o.tanggalLahir || (selected.tanggalLahir && !selected.tanggalLahir.includes('Muharram') ? selected.tanggalLahir : 'Belum diisi');
  const numericScores = scores.map(s=>Number(s.angka)||0).filter(n=>n>0);
  const total = numericScores.reduce((a,b)=>a+b,0);
  const rata = numericScores.length === scores.length && scores.length > 0 ? (total / scores.length).toFixed(2) : '—';

  return <div className="space-y-5 pb-10">
    <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4 print:hidden">
      <div><div className="text-[10px] font-black uppercase tracking-widest text-emerald-700">Dokumen Kelulusan Resmi</div><h1 className="text-2xl font-black flex items-center gap-2"><Award className="w-6 h-6 text-emerald-700"/>Ijazah Madrasah Diniyah</h1><p className="text-xs text-slate-500 mt-1">Dua halaman: lembar ijazah dan daftar nilai Ujian Akhir Madrasah Diniyah.</p></div>
      <div className="flex flex-wrap gap-2 items-center">
        {!isSiswa && <select value={selected.nis} onChange={(e)=>setSelectedNis(e.target.value)} className="px-3 py-2 rounded-xl border bg-white text-xs">{kelas6.map(s=><option key={s.nis} value={s.nis}>{s.nama} — {s.nis}</option>)}</select>}
        <button onClick={()=>setActivePage(activePage==='depan'?'belakang':'depan')} className="px-3 py-2 rounded-xl border bg-white text-xs font-bold">{activePage==='depan'?'Lihat Halaman Nilai':'Lihat Halaman Depan'}</button>
        {isAdmin && <button onClick={openEdit} className="px-3 py-2 rounded-xl bg-amber-400 text-emerald-950 text-xs font-black flex items-center gap-1"><Edit2 className="w-4 h-4"/>Edit Data Ijazah</button>}
        <button onClick={()=>window.print()} className="px-3 py-2 rounded-xl bg-emerald-800 text-white text-xs font-bold flex items-center gap-1"><Printer className="w-4 h-4"/>Cetak</button>
      </div>
    </div>

    {activePage === 'depan' ? <IjazahDepan nama={selected.nama} nis={selected.nis} nomor={displayNomor} tempat={displayTempat} tanggal={displayTanggal} status={o.statusKelulusan || 'L U L U S'} titimangsa={signatures.titimangsaIjazah || 'Belum ditetapkan'} pengasuh={signatures.namaPengasuh || 'Belum ditetapkan'} /> : <IjazahBelakang nama={selected.nama} nis={selected.nis} scores={scores} total={total} rata={rata} titimangsa={signatures.titimangsaIjazah || 'Belum ditetapkan'} pengasuh={signatures.namaPengasuh || 'Belum ditetapkan'} />}

    {showEdit && <div className="fixed inset-0 z-50 bg-slate-950/60 p-4 overflow-y-auto print:hidden"><div className="bg-white max-w-3xl mx-auto my-6 rounded-3xl p-6"><div className="flex justify-between border-b pb-3"><div><h3 className="font-black">Edit Ijazah — {selected.nama}</h3><p className="text-xs text-slate-500">Nilai kosong tidak akan diganti dengan nilai contoh.</p></div><button onClick={()=>setShowEdit(false)}><X className="w-5 h-5"/></button></div><form onSubmit={saveEdit} className="mt-4 space-y-4 text-xs">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3"><Input label="Nomor Ijazah" value={editNomor} onChange={setEditNomor}/><Input label="Status Kelulusan" value={editStatus} onChange={setEditStatus}/><Input label="Tempat Lahir" value={editTempatLahir} onChange={setEditTempatLahir}/><Input label="Tanggal Lahir" value={editTanggalLahir} onChange={setEditTanggalLahir}/><Input label="Titimangsa" value={editTitimangsa} onChange={setEditTitimangsa}/><Input label="Nama Pengasuh" value={editPengasuh} onChange={setEditPengasuh}/></div>
      <div className="border rounded-2xl overflow-hidden"><table className="w-full text-xs"><thead className="bg-slate-100"><tr><th className="p-2 text-left">Mata Pelajaran</th><th className="p-2 w-32">Nilai</th></tr></thead><tbody>{editScores.map((s,i)=><tr key={s.mapel} className="border-t"><td className="p-2 font-semibold">{s.mapel}</td><td className="p-2"><input type="number" min="0" max="100" value={s.angka || ''} onChange={(e)=>setEditScores(prev=>prev.map((x,j)=>j===i?{...x,angka:Number(e.target.value)||0}:x))} className="w-full px-2 py-1.5 border rounded-lg text-center" placeholder="—"/></td></tr>)}</tbody></table></div>
      <div className="flex justify-end gap-2 pt-3 border-t"><button type="button" onClick={()=>setShowEdit(false)} className="px-4 py-2 font-bold">Batal</button><button className="px-5 py-2 rounded-xl bg-emerald-800 text-white font-bold flex items-center gap-2"><Save className="w-4 h-4"/>Simpan</button></div>
    </form></div></div>}
  </div>;
};

const Frame: React.FC<{children: React.ReactNode}> = ({children}) => <div className="mx-auto bg-[#fffdf5] text-slate-950 shadow-xl print:shadow-none w-full max-w-[900px] min-h-[1120px] p-5 border-[10px] border-double border-emerald-900 relative overflow-hidden print:max-w-none print:w-[210mm] print:min-h-[297mm] print:m-0"><div className="absolute inset-8 border-2 border-amber-500 pointer-events-none"/><img src="/logo.png" alt="" className="absolute w-72 h-72 object-contain opacity-[0.035] left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"/><div className="relative z-10 px-10 py-8">{children}</div></div>;

const Header = () => <div className="text-center border-b-4 border-double border-emerald-900 pb-4"><img src="/logo.png" alt="Logo" className="w-20 h-20 object-contain mx-auto"/><div className="font-black text-xl tracking-wide mt-2">MADRASAH DINIYAH TAKMILIYAH ANNAJIYAH 2</div><div className="font-bold text-sm">PONDOK PESANTREN BAHRUL ULUM TAMBAKBERAS JOMBANG</div></div>;

const IjazahDepan = ({nama,nis,nomor,tempat,tanggal,status,titimangsa,pengasuh}:{nama:string;nis:string;nomor:string;tempat:string;tanggal:string;status:string;titimangsa:string;pengasuh:string}) => <Frame><Header/><div className="text-center mt-8"><div className="font-serif text-4xl font-black tracking-widest">IJAZAH</div><div className="mt-2 text-sm">Nomor: <span className="font-bold">{nomor}</span></div></div><div className="mt-10 text-sm leading-8 text-center">Diberikan kepada santri Madrasah Diniyah Takmiliyah Annajiyah 2:</div><div className="max-w-xl mx-auto mt-4 text-sm space-y-3"><Row label="Nama" value={nama}/><Row label="Nomor Induk Santri" value={nis}/><Row label="Tempat Lahir" value={tempat}/><Row label="Tanggal Lahir" value={tanggal}/></div><div className="mt-10 text-center"><div className="text-sm">Setelah menyelesaikan seluruh program pendidikan dan dinyatakan</div><div className="text-3xl font-black tracking-[0.35em] text-emerald-900 mt-3">{status}</div></div><div className="mt-24 ml-auto w-72 text-center text-sm"><div>{titimangsa}</div><div className="mt-2">Pengasuh / Pimpinan</div><div className="h-20"/><div className="font-black underline">{pengasuh}</div></div></Frame>;

const IjazahBelakang = ({nama,nis,scores,total,rata,titimangsa,pengasuh}:{nama:string;nis:string;scores:NilaiIjazah[];total:number;rata:string;titimangsa:string;pengasuh:string}) => <Frame><Header/><div className="text-center mt-7"><div className="text-2xl font-black">DAFTAR NILAI UJIAN AKHIR</div><div className="text-sm font-bold mt-1">MADRASAH DINIYAH</div></div><div className="mt-6 text-sm"><div><b>Nama:</b> {nama}</div><div><b>NIS:</b> {nis}</div></div><table className="w-full mt-5 border-collapse text-sm"><thead><tr className="bg-emerald-50"><th className="border border-slate-800 p-2 w-12">No.</th><th className="border border-slate-800 p-2 text-left">Mata Pelajaran</th><th className="border border-slate-800 p-2 w-24">Angka</th><th className="border border-slate-800 p-2 text-left">Huruf</th></tr></thead><tbody>{scores.map(s=><tr key={s.no}><td className="border border-slate-800 p-2 text-center">{s.no}</td><td className="border border-slate-800 p-2 font-semibold">{s.mapel}</td><td className="border border-slate-800 p-2 text-center font-bold">{s.angka>0?s.angka:'—'}</td><td className="border border-slate-800 p-2">{s.angka>0?terbilang(s.angka):'—'}</td></tr>)}<tr className="font-black"><td colSpan={2} className="border border-slate-800 p-2 text-center">JUMLAH</td><td className="border border-slate-800 p-2 text-center">{scores.every(s=>s.angka>0)?total:'—'}</td><td className="border border-slate-800 p-2"/></tr><tr className="font-black"><td colSpan={2} className="border border-slate-800 p-2 text-center">RATA-RATA</td><td className="border border-slate-800 p-2 text-center">{rata}</td><td className="border border-slate-800 p-2"/></tr></tbody></table><div className="mt-20 ml-auto w-72 text-center text-sm"><div>{titimangsa}</div><div className="mt-2">Pengasuh / Pimpinan</div><div className="h-20"/><div className="font-black underline">{pengasuh}</div></div></Frame>;

const Row = ({label,value}:{label:string;value:string}) => <div className="grid grid-cols-[160px_20px_1fr] border-b border-dotted border-slate-400 pb-1"><span>{label}</span><span>:</span><span className="font-bold">{value}</span></div>;
const Input = ({label,value,onChange}:{label:string;value:string;onChange:(v:string)=>void}) => <label className="font-bold text-slate-700">{label}<input value={value} onChange={(e)=>onChange(e.target.value)} className="mt-1 w-full px-3 py-2 rounded-xl border bg-slate-50 font-normal"/></label>;
