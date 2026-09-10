import React, { useState } from 'react';
import {
  FileQuestion,
  Plus,
  Eye,
  Download,
  Printer,
  CheckCircle2,
  ListOrdered,
  Layers,
  Sparkles,
  X,
  Trash2,
  Clock,
  HelpCircle
} from 'lucide-react';
import { MOCK_PAKET_SOAL } from '../data/mockData';
import { PaketSoal, SoalItem, UserProfile } from '../types';
import { PdfPreviewModal } from '../components/PdfPreviewModal';

interface SoalUjianViewProps {
  userRole?: string;
  currentUser?: UserProfile;
}

export const SoalUjianView: React.FC<SoalUjianViewProps> = ({
  userRole = 'Guru',
  currentUser,
}) => {
  const isSiswa = userRole.toLowerCase() === 'siswa';
  const [paketList, setPaketList] = useState<PaketSoal[]>(MOCK_PAKET_SOAL);
  const [selectedPaket, setSelectedPaket] = useState<PaketSoal>(paketList[0]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showPdfModal, setShowPdfModal] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  // Create Form State
  const [newJudul, setNewJudul] = useState('');
  const [newMapel, setNewMapel] = useState('Bahasa Arab');
  const [newKelas, setNewKelas] = useState('Kelas 5A');
  const [newWaktu, setNewWaktu] = useState(90);
  const [newSoalList, setNewSoalList] = useState<SoalItem[]>([
    {
      id: 'q-1',
      nomor: 1,
      tipe: 'Pilihan Ganda',
      pertanyaan: 'Manakah di bawah ini yang merupakan tanda isim (tanda kata benda) dalam kaidah Jurumiyyah?',
      opsi: ['Kemasukan huruf Qad', 'Kemasukan huruf Sin', 'Kemasukan Tanwin & Alif Lam', 'Kemasukan huruf Saufa'],
      kunciJawaban: 'C',
      bobot: 20,
    },
    {
      id: 'q-2',
      nomor: 2,
      tipe: 'Esai',
      pertanyaan: 'Sebutkan 3 macam pembagian Kalam menurut kaidah Nahwu beserta definisinya masing-masing!',
      kunciJawaban: '1. Isim: kata yang menunjukkan makna pada dirinya sendiri tanpa terikat waktu. 2. Fiil: kata kerja yang terikat waktu. 3. Huruf: kata yang tidak bermakna kecuali bersama kata lain.',
      bobot: 30,
    },
  ]);

  // Handle Adding another Question into Form
  const handleAddQuestion = (type: 'Pilihan Ganda' | 'Esai') => {
    const nextNo = newSoalList.length + 1;
    if (type === 'Pilihan Ganda') {
      setNewSoalList([
        ...newSoalList,
        {
          id: `q-${Date.now()}`,
          nomor: nextNo,
          tipe: 'Pilihan Ganda',
          pertanyaan: '',
          opsi: ['', '', '', ''],
          kunciJawaban: 'A',
          bobot: 20,
        },
      ]);
    } else {
      setNewSoalList([
        ...newSoalList,
        {
          id: `q-${Date.now()}`,
          nomor: nextNo,
          tipe: 'Esai',
          pertanyaan: '',
          kunciJawaban: '',
          bobot: 20,
        },
      ]);
    }
  };

  const handleSaveNewPaket = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newJudul) return;

    const totalBobot = newSoalList.reduce((acc, q) => acc + q.bobot, 0);

    const created: PaketSoal = {
      id: `paket-${Date.now()}`,
      judul: newJudul,
      mataPelajaran: newMapel,
      kelas: newKelas,
      alokasiWaktuMenit: newWaktu,
      guruPembuat: 'Ustadz Ahmad Fauzi, Lc.',
      tanggalDibuat: '06 Sep 2026',
      totalSoal: newSoalList.length,
      totalBobot: totalBobot,
      status: 'Terpublikasi',
      daftarSoal: newSoalList,
    };

    setPaketList([created, ...paketList]);
    setSelectedPaket(created);
    setShowCreateModal(false);
    setToastMessage('Paket soal dan naskah ujian berhasil dibuat!');
    setTimeout(() => setToastMessage(''), 4000);
  };

  return (
    <div className="space-y-6 pb-12">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <FileQuestion className="w-6 h-6 text-emerald-700" />
            <span>Bank Soal & Penilaian Ujian Santri</span>
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Penyusunan naskah ujian tengah semester, lembar soal pilihan ganda, esai, dan kunci jawaban
          </p>
        </div>

        <div className="flex items-center gap-2">
          {!isSiswa && (
            <button
              onClick={() => setShowCreateModal(true)}
              id="btn-buat-soal-baru"
              className="flex items-center gap-2 px-4 py-2 bg-emerald-800 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all shadow-md cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Buat Soal Baru</span>
            </button>
          )}
        </div>
      </div>

      {/* Time Window enforcement indicator for Santri */}
      {isSiswa && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 flex items-center justify-between text-xs text-emerald-950">
          <div className="flex items-center gap-2.5">
            <Clock className="w-5 h-5 text-emerald-700 shrink-0" />
            <div>
              <span className="font-bold">Jendela Waktu Ujian Aktif (WIB): </span>
              <span>07:30 – 09:00 WIB (Asia/Jakarta) • Alokasi Waktu: {selectedPaket.alokasiWaktuMenit} Menit</span>
            </div>
          </div>
          <span className="px-2.5 py-1 bg-emerald-800 text-white font-bold rounded-lg text-[11px] shrink-0">
            Sesi Ujian Terbuka
          </span>
        </div>
      )}

      {toastMessage && (
        <div className="bg-emerald-800 text-white px-4 py-2.5 rounded-xl shadow-lg text-xs font-bold flex items-center gap-2 animate-in fade-in">
          <Sparkles className="w-4 h-4 text-amber-300" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Select Paket Soal Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {paketList.map((item) => {
          const isSelected = selectedPaket.id === item.id;
          return (
            <div
              key={item.id}
              onClick={() => setSelectedPaket(item)}
              className={`p-4 rounded-2xl border cursor-pointer transition-all flex items-start justify-between ${
                isSelected
                  ? 'bg-emerald-900 text-white border-emerald-950 shadow-md'
                  : 'bg-white text-slate-800 border-slate-200 hover:border-emerald-300'
              }`}
            >
              <div>
                <div className="flex items-center gap-2">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                    isSelected ? 'bg-amber-400 text-emerald-950' : 'bg-emerald-100 text-emerald-800'
                  }`}>
                    {item.kelas} • {item.mataPelajaran}
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono">
                    {item.alokasiWaktuMenit} Menit
                  </span>
                </div>
                <h3 className={`text-base font-extrabold mt-1.5 ${isSelected ? 'text-white' : 'text-slate-900'}`}>
                  {item.judul}
                </h3>
                <p className={`text-xs mt-0.5 ${isSelected ? 'text-emerald-200' : 'text-slate-500'}`}>
                  {item.totalSoal} Butir Soal • Bobot Maksimal: {item.totalBobot} Poin
                </p>
              </div>

              <span className={`text-xs font-mono font-bold px-2 py-1 rounded-lg ${
                isSelected ? 'bg-emerald-800 text-amber-300' : 'bg-slate-100 text-slate-700'
              }`}>
                {item.status}
              </span>
            </div>
          );
        })}
      </div>

      {/* Detailed Soal Preview (Selected Paket) */}
      <div className="bg-white rounded-3xl border border-slate-200 p-5 sm:p-6 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 gap-3">
          <div>
            <span className="text-[11px] font-bold text-emerald-700 uppercase tracking-wider">
              NASKAH UJIAN AKTIF
            </span>
            <h2 className="text-lg font-black text-slate-900">
              {selectedPaket.judul}
            </h2>
            <p className="text-xs text-slate-500">
              Pengampu: {selectedPaket.guruPembuat} • Waktu: {selectedPaket.alokasiWaktuMenit} Menit
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowPdfModal(true)}
              id="btn-preview-soal"
              className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-100 hover:bg-emerald-50 text-slate-700 hover:text-emerald-900 rounded-xl text-xs font-bold transition-colors"
            >
              <Eye className="w-4 h-4 text-emerald-700" />
              <span>Preview Soal</span>
            </button>
            <button
              onClick={() => setShowPdfModal(true)}
              id="btn-cetak-soal-ujian"
              className="flex items-center gap-1.5 px-3.5 py-2 bg-emerald-800 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-md transition-all"
            >
              <Printer className="w-4 h-4" />
              <span>Cetak Soal Ujian</span>
            </button>
          </div>
        </div>

        {/* Questions List */}
        <div className="space-y-4">
          {selectedPaket.daftarSoal.map((soal) => (
            <div
              key={soal.id}
              className="p-4 sm:p-5 rounded-2xl border border-slate-200 bg-slate-50/60 space-y-3"
            >
              {/* Question header */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-7 h-7 rounded-lg bg-emerald-800 text-white font-bold text-xs flex items-center justify-center font-mono">
                    {soal.nomor}
                  </span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    soal.tipe === 'Pilihan Ganda' ? 'bg-blue-100 text-blue-800' : 'bg-purple-100 text-purple-800'
                  }`}>
                    {soal.tipe}
                  </span>
                </div>
                <span className="text-xs font-mono font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded-md">
                  Bobot: {soal.bobot} Poin
                </span>
              </div>

              {/* Question Text */}
              <p className="text-xs sm:text-sm font-semibold text-slate-900 leading-relaxed">
                {soal.pertanyaan}
              </p>

              {/* Options for Pilihan Ganda */}
              {soal.tipe === 'Pilihan Ganda' && soal.opsi && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs pt-1">
                  {soal.opsi.map((opt, oIdx) => {
                    const optionChar = String.fromCharCode(65 + oIdx);
                    const isKey = !isSiswa && soal.kunciJawaban === optionChar;
                    return (
                      <div
                        key={oIdx}
                        className={`p-2.5 rounded-xl border flex items-center gap-2 ${
                          isKey
                            ? 'bg-emerald-50 text-emerald-950 border-emerald-300 font-semibold'
                            : 'bg-white text-slate-700 border-slate-200'
                        }`}
                      >
                        <span className={`w-5 h-5 rounded-md text-[10px] font-bold flex items-center justify-center shrink-0 ${
                          isKey ? 'bg-emerald-700 text-white' : 'bg-slate-100 text-slate-600'
                        }`}>
                          {optionChar}
                        </span>
                        <span className="text-xs">{opt}</span>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Kunci Jawaban Box (Strictly hidden for santri) */}
              {!isSiswa && (
                <div className="pt-2 border-t border-slate-200 text-xs flex items-start gap-2 bg-emerald-50/70 p-2.5 rounded-xl text-emerald-950">
                  <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold">Kunci Jawaban Resmi: </span>
                    <span>{soal.kunciJawaban}</span>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Buat Soal Baru Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white w-full max-w-2xl rounded-3xl p-6 shadow-2xl border border-emerald-100 my-8 max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 shrink-0">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Plus className="w-5 h-5 text-emerald-700" />
                <span>Buat Paket Soal Ujian Baru</span>
              </h3>
              <button
                onClick={() => setShowCreateModal(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveNewPaket} className="overflow-y-auto flex-1 py-4 space-y-4 text-xs pr-1">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Judul Paket Ujian</label>
                <input
                  type="text"
                  placeholder="Contoh: Penilaian Akhir Semester (PAS) Nahwu Sharaf"
                  value={newJudul}
                  onChange={(e) => setNewJudul(e.target.value)}
                  required
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Mata Pelajaran</label>
                  <select
                    value={newMapel}
                    onChange={(e) => setNewMapel(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                  >
                    <option value="Bahasa Arab">Bahasa Arab</option>
                    <option value="Fiqih Muamalah">Fiqih</option>
                    <option value="Madrasatul Qur'an">Madrasatul Qur&apos;an</option>
                    <option value="Hadits Arbain">Kajian Hadits</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Kelas Sasaran</label>
                  <select
                    value={newKelas}
                    onChange={(e) => setNewKelas(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                  >
                    <option value="Kelas 5A">Kelas 5A</option>
                    <option value="Kelas 5B">Kelas 5B</option>
                    <option value="Kelas 6">Kelas 6</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Durasi Ujian (Menit)</label>
                  <input
                    type="number"
                    value={newWaktu}
                    onChange={(e) => setNewWaktu(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>
              </div>

              {/* Dynamic Questions Builder */}
              <div className="pt-3 border-t border-slate-100">
                <div className="flex items-center justify-between mb-3">
                  <span className="font-bold text-slate-900 text-sm">Daftar Butir Soal ({newSoalList.length})</span>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => handleAddQuestion('Pilihan Ganda')}
                      className="px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-800 rounded-lg text-xs font-semibold"
                    >
                      + Pilihan Ganda
                    </button>
                    <button
                      type="button"
                      onClick={() => handleAddQuestion('Esai')}
                      className="px-3 py-1.5 bg-purple-50 hover:bg-purple-100 text-purple-800 rounded-lg text-xs font-semibold"
                    >
                      + Esai
                    </button>
                  </div>
                </div>

                <div className="space-y-3">
                  {newSoalList.map((soal, idx) => (
                    <div key={soal.id} className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-800">Soal No. {idx + 1} ({soal.tipe})</span>
                        <div className="flex items-center gap-2">
                          <label className="text-[11px] text-slate-500">Bobot:</label>
                          <input
                            type="number"
                            value={soal.bobot}
                            onChange={(e) => {
                              const b = Number(e.target.value);
                              setNewSoalList(newSoalList.map(s => s.id === soal.id ? { ...s, bobot: b } : s));
                            }}
                            className="w-14 px-2 py-0.5 bg-white border border-slate-300 rounded text-center"
                          />
                          <button
                            type="button"
                            onClick={() => setNewSoalList(newSoalList.filter(s => s.id !== soal.id))}
                            className="text-rose-600 hover:text-rose-800 p-1"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      <textarea
                        rows={2}
                        placeholder="Tuliskan pertanyaan soal..."
                        value={soal.pertanyaan}
                        onChange={(e) => {
                          const val = e.target.value;
                          setNewSoalList(newSoalList.map(s => s.id === soal.id ? { ...s, pertanyaan: val } : s));
                        }}
                        className="w-full p-2 bg-white border border-slate-200 rounded-lg text-xs"
                      />

                      {soal.tipe === 'Pilihan Ganda' && soal.opsi && (
                        <div className="grid grid-cols-2 gap-2 pt-1">
                          {soal.opsi.map((opt, oIdx) => (
                            <div key={oIdx} className="flex items-center gap-1.5">
                              <span className="font-bold text-slate-600">{String.fromCharCode(65 + oIdx)}.</span>
                              <input
                                type="text"
                                placeholder={`Opsi ${String.fromCharCode(65 + oIdx)}`}
                                value={opt}
                                onChange={(e) => {
                                  const text = e.target.value;
                                  const updatedOps = [...soal.opsi!];
                                  updatedOps[oIdx] = text;
                                  setNewSoalList(newSoalList.map(s => s.id === soal.id ? { ...s, opsi: updatedOps } : s));
                                }}
                                className="w-full p-1.5 bg-white border border-slate-200 rounded text-xs"
                              />
                            </div>
                          ))}
                        </div>
                      )}

                      <div className="pt-1">
                        <label className="block text-[11px] font-bold text-slate-600">Kunci Jawaban:</label>
                        <input
                          type="text"
                          placeholder={soal.tipe === 'Pilihan Ganda' ? 'Contoh: A, B, C, atau D' : 'Uraian jawaban model...'}
                          value={soal.kunciJawaban}
                          onChange={(e) => {
                            const val = e.target.value;
                            setNewSoalList(newSoalList.map(s => s.id === soal.id ? { ...s, kunciJawaban: val } : s));
                          }}
                          className="w-full p-1.5 bg-white border border-slate-200 rounded text-xs"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-slate-100 shrink-0">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 font-bold bg-emerald-800 hover:bg-emerald-700 text-white rounded-xl shadow-md"
                >
                  Simpan & Terbitkan Soal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* PDF Modal */}
      <PdfPreviewModal
        isOpen={showPdfModal}
        onClose={() => setShowPdfModal(false)}
        type="soal"
        title={`Naskah Soal: ${selectedPaket.judul}`}
        data={selectedPaket}
      />

    </div>
  );
};
