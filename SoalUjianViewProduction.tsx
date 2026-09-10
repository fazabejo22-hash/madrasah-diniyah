import React, { useMemo, useState } from 'react';
import { FileQuestion, Plus, Save, Trash2, X } from 'lucide-react';
import { PaketSoal, SoalItem, UserProfile } from './types';

interface SoalUjianViewProps { userRole?: string; currentUser?: UserProfile; }
const KEY = 'annajiyah_v2_exam_packages_prod';
const read = (): PaketSoal[] => { try { const raw = localStorage.getItem(KEY); return raw ? JSON.parse(raw) : []; } catch { return []; } };
const write = (v:PaketSoal[]) => { try { localStorage.setItem(KEY, JSON.stringify(v)); } catch {} };

export const SoalUjianView: React.FC<SoalUjianViewProps> = ({ userRole='Guru', currentUser }) => {
  const isSiswa = userRole.toLowerCase()==='siswa';
  const [items,setItems] = useState<PaketSoal[]>(read);
  const [show,setShow] = useState(false);
  const [judul,setJudul] = useState('');
  const [mapel,setMapel] = useState('');
  const [kelas,setKelas] = useState('');
  const [waktu,setWaktu] = useState(60);
  const [soal,setSoal] = useState<SoalItem[]>([]);
  const visible = useMemo(()=> isSiswa && currentUser?.kelas ? items.filter(p=>p.kelas.replace(/^Kelas\s+/i,'')===currentUser.kelas?.replace(/^Kelas\s+/i,'')) : items,[items,isSiswa,currentUser]);
  const addQuestion = (tipe:'Pilihan Ganda'|'Esai') => setSoal(prev=>[...prev,{id:`q-${Date.now()}`,nomor:prev.length+1,tipe,pertanyaan:'',opsi:tipe==='Pilihan Ganda'?['','','','']:undefined,kunciJawaban:'',bobot:0}]);
  const save = (e:React.FormEvent) => { e.preventDefault(); if(!judul.trim()||!mapel.trim()||!kelas.trim()||soal.length===0) return; const created:PaketSoal={id:`paket-${Date.now()}`,judul:judul.trim(),mataPelajaran:mapel.trim(),kelas:kelas.trim(),alokasiWaktuMenit:waktu,guruPembuat:currentUser?.name||'',tanggalDibuat:new Date().toISOString().slice(0,10),totalSoal:soal.length,totalBobot:soal.reduce((a,b)=>a+(Number(b.bobot)||0),0),status:'Draft',daftarSoal:soal}; const next=[created,...items]; setItems(next); write(next); setShow(false); setJudul(''); setMapel(''); setKelas(''); setSoal([]); };
  const remove=(id:string)=>{const next=items.filter(x=>x.id!==id);setItems(next);write(next)};
  return <div className="space-y-6 pb-12">
    <div className="flex items-center justify-between gap-4"><div><h1 className="text-2xl font-black flex items-center gap-2"><FileQuestion className="w-6 h-6 text-emerald-700"/>Bank Soal & Ujian</h1><p className="text-xs text-slate-500 mt-1">Tidak memuat paket soal contoh. Paket hanya muncul setelah dibuat oleh pengguna yang berwenang.</p></div>{!isSiswa&&<button onClick={()=>setShow(true)} className="px-4 py-2 rounded-xl bg-emerald-800 text-white text-xs font-bold flex items-center gap-2"><Plus className="w-4 h-4"/>Buat Paket</button>}</div>
    {visible.length===0?<div className="rounded-3xl border bg-white p-10 text-center text-sm text-slate-500">Belum ada paket ujian yang tersedia.</div>:<div className="space-y-3">{visible.map(p=><div key={p.id} className="rounded-2xl border bg-white p-4"><div className="flex justify-between gap-4"><div><div className="font-black">{p.judul}</div><div className="text-xs text-slate-500 mt-1">{p.mataPelajaran} · {p.kelas} · {p.totalSoal} soal · {p.alokasiWaktuMenit} menit · {p.status}</div></div>{!isSiswa&&<button onClick={()=>remove(p.id)} className="text-rose-700"><Trash2 className="w-4 h-4"/></button>}</div></div>)}</div>}
    {show&&<div className="fixed inset-0 z-50 bg-slate-950/60 p-4 overflow-y-auto"><form onSubmit={save} className="max-w-2xl mx-auto my-6 bg-white rounded-3xl p-6 space-y-4"><div className="flex justify-between"><h3 className="font-black">Buat Paket Ujian</h3><button type="button" onClick={()=>setShow(false)}><X className="w-5 h-5"/></button></div><div className="grid sm:grid-cols-2 gap-3"><input className="border rounded-xl px-3 py-2 text-sm" placeholder="Judul paket" value={judul} onChange={e=>setJudul(e.target.value)}/><input className="border rounded-xl px-3 py-2 text-sm" placeholder="Mata pelajaran" value={mapel} onChange={e=>setMapel(e.target.value)}/><input className="border rounded-xl px-3 py-2 text-sm" placeholder="Kelas, contoh 3A" value={kelas} onChange={e=>setKelas(e.target.value)}/><input type="number" min={1} className="border rounded-xl px-3 py-2 text-sm" value={waktu} onChange={e=>setWaktu(Number(e.target.value)||60)}/></div><div className="flex gap-2"><button type="button" onClick={()=>addQuestion('Pilihan Ganda')} className="border rounded-xl px-3 py-2 text-xs font-bold">+ Pilihan Ganda</button><button type="button" onClick={()=>addQuestion('Esai')} className="border rounded-xl px-3 py-2 text-xs font-bold">+ Esai</button></div>{soal.map((q,i)=><div key={q.id} className="border rounded-2xl p-3 space-y-2"><div className="text-xs font-bold">Soal {i+1} · {q.tipe}</div><textarea className="w-full border rounded-xl p-2 text-sm" value={q.pertanyaan} onChange={e=>setSoal(prev=>prev.map((x,j)=>j===i?{...x,pertanyaan:e.target.value}:x))}/><input className="w-full border rounded-xl p-2 text-sm" placeholder="Kunci jawaban" value={q.kunciJawaban||''} onChange={e=>setSoal(prev=>prev.map((x,j)=>j===i?{...x,kunciJawaban:e.target.value}:x))}/><input type="number" min={0} className="w-32 border rounded-xl p-2 text-sm" placeholder="Bobot" value={q.bobot||''} onChange={e=>setSoal(prev=>prev.map((x,j)=>j===i?{...x,bobot:Number(e.target.value)||0}:x))}/></div>)}<div className="flex justify-end"><button className="px-5 py-2 rounded-xl bg-emerald-800 text-white text-xs font-bold flex items-center gap-2"><Save className="w-4 h-4"/>Simpan Draft</button></div></form></div>}
  </div>;
};
