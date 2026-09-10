import React, { useState } from 'react';
import {
  ShieldAlert,
  UserCheck,
  Users,
  BookOpen,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  FileText,
  Printer,
  ChevronRight,
  Sparkles
} from 'lucide-react';
import { TATA_TERTIB_DATA, TataTertibItem } from '../data/madinData';

export const TataTertibView: React.FC = () => {
  const [activeSubjek, setActiveSubjek] = useState<'Semua' | 'Pengajar' | 'Musrif/Wali Kelas' | 'Santri'>('Santri');
  const [activeKategori, setActiveKategori] = useState<string>('Semua');

  const filteredItems = TATA_TERTIB_DATA.filter((item) => {
    const matchSubjek = activeSubjek === 'Semua' || item.subjek === activeSubjek;
    const matchKategori = activeKategori === 'Semua' || item.kategori === activeKategori;
    return matchSubjek && matchKategori;
  });

  const getSubjekBadge = (subjek: string) => {
    if (subjek === 'Pengajar') return 'bg-blue-100 text-blue-900 border-blue-200';
    if (subjek === 'Musrif/Wali Kelas') return 'bg-purple-100 text-purple-900 border-purple-200';
    return 'bg-emerald-100 text-emerald-900 border-emerald-200';
  };

  const getKategoriBadge = (kat: string) => {
    if (kat === 'Kewajiban') return 'bg-emerald-50 text-emerald-800 border-emerald-200';
    if (kat === 'Larangan') return 'bg-rose-50 text-rose-800 border-rose-200';
    if (kat === 'Sanksi') return 'bg-amber-50 text-amber-800 border-amber-200';
    return 'bg-slate-100 text-slate-800 border-slate-200';
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <ShieldAlert className="w-6 h-6 text-emerald-700" />
            <span>Peraturan & Tata Tertib Madrasah</span>
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Pedoman kedisiplinan resmi Pengajar, Musrif / Wali Kelas, dan Santri Madin Takmiliyah Annajiyah 2
          </p>
        </div>

        <button
          onClick={() => window.print()}
          className="flex items-center gap-1.5 px-4 py-2 bg-emerald-800 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-xs transition-colors"
        >
          <Printer className="w-4 h-4" />
          <span>Cetak Tata Tertib</span>
        </button>
      </div>

      {/* Tabs Subjek */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs font-bold text-slate-600">Pilih Sasaran:</span>
          {(['Santri', 'Pengajar', 'Musrif/Wali Kelas', 'Semua'] as const).map((subjek) => (
            <button
              key={subjek}
              onClick={() => setActiveSubjek(subjek)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-colors ${
                activeSubjek === subjek
                  ? 'bg-emerald-800 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:text-slate-900'
              }`}
            >
              {subjek}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs font-bold text-slate-600">Kategori:</span>
          {['Semua', 'Kewajiban', 'Larangan', 'Sanksi', 'Aturan Tambahan'].map((kat) => (
            <button
              key={kat}
              onClick={() => setActiveKategori(kat)}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors ${
                activeKategori === kat
                  ? 'bg-slate-900 text-white'
                  : 'text-slate-500 hover:text-slate-800 bg-slate-50'
              }`}
            >
              {kat}
            </button>
          ))}
        </div>
      </div>

      {/* Grouped Cards View */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Quick summary stats */}
        <div className="bg-emerald-900 text-white rounded-3xl p-5 shadow-sm space-y-2">
          <div className="flex items-center gap-2 text-amber-300">
            <CheckCircle2 className="w-5 h-5" />
            <h3 className="font-extrabold text-sm uppercase tracking-wider">Kewajiban</h3>
          </div>
          <p className="text-xs text-emerald-100">
            Meliputi tata tertib berpakaian sopan syar’an wa ‘adatan, kehadiran tepat waktu, adab di dalam kelas, dan tanggung jawab belajar.
          </p>
        </div>

        <div className="bg-rose-900 text-white rounded-3xl p-5 shadow-sm space-y-2">
          <div className="flex items-center gap-2 text-rose-300">
            <XCircle className="w-5 h-5" />
            <h3 className="font-extrabold text-sm uppercase tracking-wider">Larangan</h3>
          </div>
          <p className="text-xs text-rose-100">
            Menolak keterlambatan, kegaduhan saat KBM, membawa barang terlarang, membuang sampah sembarangan, serta alpha lebih dari 15 hari.
          </p>
        </div>

        <div className="bg-amber-900 text-white rounded-3xl p-5 shadow-sm space-y-2">
          <div className="flex items-center gap-2 text-amber-300">
            <AlertTriangle className="w-5 h-5" />
            <h3 className="font-extrabold text-sm uppercase tracking-wider">Sanksi & Kedisiplinan</h3>
          </div>
          <p className="text-xs text-amber-100">
            Berjenjang dari peringatan lisan, peringatan tertulis, pemanggilan orang tua, hingga skorsing / tidak naik kelas.
          </p>
        </div>
      </div>

      {/* Detail Rules List */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <h3 className="font-black text-sm text-slate-900 uppercase tracking-wider">
            Rincian Pasal & Butir Ketentuan ({filteredItems.length} Butir)
          </h3>
          <span className="text-xs text-slate-400 font-medium">Peraturan_Tata_Tertib_Pengajar_Musrif_Santri_AI_Studio.csv</span>
        </div>

        <div className="divide-y divide-slate-100">
          {filteredItems.map((item, idx) => (
            <div key={idx} className="py-3.5 flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-slate-100 text-slate-700 font-bold text-xs flex items-center justify-center shrink-0 mt-0.5 font-mono">
                {idx + 1}
              </div>
              <div className="flex-1 space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className={`px-2 py-0.5 rounded-md text-[10px] font-extrabold border ${getSubjekBadge(item.subjek)}`}>
                    {item.subjek}
                  </span>
                  <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold border ${getKategoriBadge(item.kategori)}`}>
                    {item.kategori}
                  </span>
                  {item.pasalBagian && (
                    <span className="text-[11px] font-semibold text-slate-500 bg-slate-50 px-2 py-0.5 rounded-md border border-slate-200">
                      Bagian: {item.pasalBagian}
                    </span>
                  )}
                  {item.nomor && (
                    <span className="text-[10px] font-mono text-slate-400">
                      Butir #{item.nomor}
                    </span>
                  )}
                </div>
                <p className="text-xs font-semibold text-slate-800 leading-relaxed">
                  {item.ketentuan}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
