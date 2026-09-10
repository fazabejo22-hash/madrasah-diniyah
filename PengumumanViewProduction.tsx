import React from 'react';
import { Bell, AlertCircle } from 'lucide-react';

export const PengumumanView: React.FC = () => (
  <div className="space-y-6 pb-12">
    <div>
      <h1 className="flex items-center gap-2 text-2xl font-black text-slate-900"><Bell className="h-6 w-6 text-emerald-700"/>Maklumat & Pengumuman Madrasah</h1>
      <p className="mt-1 text-xs text-slate-500">Informasi resmi untuk santri, guru, dan wali santri.</p>
    </div>
    <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-xs text-amber-900 flex gap-2">
      <AlertCircle className="h-4 w-4 shrink-0"/><span>Pengumuman contoh dari versi lama telah dihapus. Belum ada pengumuman resmi yang didukung oleh berkas sumber yang diberikan.</span>
    </div>
    <div className="rounded-3xl border bg-white p-10 text-center text-sm text-slate-500">Belum ada pengumuman resmi.</div>
  </div>
);
