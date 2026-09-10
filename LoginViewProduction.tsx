import React, { useMemo, useState } from 'react';
import { AlertCircle, ArrowRight, Lock, ShieldCheck, User } from 'lucide-react';
import { AppUserAccount, UserRole } from './types';
import { storageService } from './storageServiceProduction';

interface LoginViewProps {
  onLogin: (role: UserRole) => void;
}

export const LoginView: React.FC<LoginViewProps> = ({ onLogin }) => {
  const hasAccounts = useMemo(() => storageService.getUserAccounts().length > 0, []);
  const [setupMode, setSetupMode] = useState(!hasAccounts);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');

  const login = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const account = storageService.verifyLogin(username, password);
    if (!account) {
      setError('Username/NIS atau kata sandi tidak sesuai, atau akun sedang nonaktif.');
      return;
    }
    try { sessionStorage.setItem('annajiyah_active_account', JSON.stringify(account)); } catch {}
    onLogin(account.role);
  };

  const setup = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!name.trim() || !username.trim() || password.length < 8) {
      setError('Nama, username, dan kata sandi minimal 8 karakter wajib diisi.');
      return;
    }
    if (password !== confirm) {
      setError('Konfirmasi kata sandi tidak cocok.');
      return;
    }
    if (storageService.getUserAccounts().length > 0) {
      setSetupMode(false);
      setError('Administrator awal sudah pernah dibuat. Silakan masuk.');
      return;
    }
    const account: AppUserAccount = {
      id: `admin-${Date.now()}`,
      username: username.trim(),
      password,
      name: name.trim(),
      role: 'admin',
      roleTitle: 'Administrator Madrasah',
      nipOrNis: username.trim(),
      status: 'Aktif',
      permissions: ['admin_full'],
    };
    storageService.addUserAccount(account);
    try { sessionStorage.setItem('annajiyah_active_account', JSON.stringify(account)); } catch {}
    onLogin('admin');
  };

  return <div className="relative flex min-h-screen flex-col bg-gradient-to-b from-emerald-900 via-emerald-950 to-slate-950 text-slate-100">
    <header className="relative z-10 p-5 sm:p-7"><div className="flex items-center gap-3"><img src="/logo.png" alt="Logo Madrasah" className="h-14 w-14 object-contain"/><div><div className="font-black">MADRASAH DINIYAH TAKMILIYAH ANNAJIYAH 2</div><div className="text-xs text-emerald-200">PP. Bahrul Ulum Tambakberas Jombang</div></div></div></header>
    <main className="relative z-10 flex flex-1 items-center justify-center p-4"><div className="w-full max-w-md rounded-3xl border border-emerald-100 bg-white p-6 text-slate-800 shadow-2xl sm:p-8">
      <div className="mb-6 text-center"><img src="/logo.png" alt="Logo Madrasah" className="mx-auto mb-3 h-24 w-24 object-contain"/><h1 className="text-xl font-black text-emerald-950">{setupMode ? 'Setup Administrator Pertama' : 'Sistem Administrasi Madrasah'}</h1><p className="mt-1 text-xs text-slate-500">{setupMode ? 'Belum ada akun produksi. Buat administrator pertama pada perangkat ini.' : 'Masuk menggunakan akun yang dibuat administrator.'}</p></div>
      {error && <div className="mb-4 flex gap-2 rounded-2xl border border-rose-200 bg-rose-50 px-3.5 py-3 text-xs font-semibold text-rose-800"><AlertCircle className="h-4 w-4 shrink-0"/>{error}</div>}
      {setupMode ? <form onSubmit={setup} className="space-y-4">
        <label className="block text-xs font-bold">Nama Administrator<input value={name} onChange={(e)=>setName(e.target.value)} className="mt-1.5 w-full rounded-xl border bg-slate-50 px-3.5 py-3 text-sm" placeholder="Nama lengkap"/></label>
        <label className="block text-xs font-bold">Username Administrator<div className="relative mt-1.5"><User className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-emerald-700"/><input value={username} onChange={(e)=>setUsername(e.target.value)} className="w-full rounded-xl border bg-slate-50 py-3 pl-10 pr-3.5 text-sm" placeholder="Buat username"/></div></label>
        <label className="block text-xs font-bold">Kata Sandi<div className="relative mt-1.5"><Lock className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-emerald-700"/><input type="password" value={password} onChange={(e)=>setPassword(e.target.value)} className="w-full rounded-xl border bg-slate-50 py-3 pl-10 pr-3.5 text-sm" placeholder="Minimal 8 karakter"/></div></label>
        <label className="block text-xs font-bold">Konfirmasi Kata Sandi<input type="password" value={confirm} onChange={(e)=>setConfirm(e.target.value)} className="mt-1.5 w-full rounded-xl border bg-slate-50 px-3.5 py-3 text-sm"/></label>
        <button type="submit" className="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-800 py-3 text-sm font-black text-white"><ShieldCheck className="h-4 w-4"/>Buat Administrator</button>
      </form> : <form onSubmit={login} className="space-y-4">
        <label className="block text-xs font-bold">Username / NIS<div className="relative mt-1.5"><User className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-emerald-700"/><input autoComplete="username" value={username} onChange={(e)=>setUsername(e.target.value)} className="w-full rounded-xl border bg-slate-50 py-3 pl-10 pr-3.5 text-sm" placeholder="Username atau NIS"/></div></label>
        <label className="block text-xs font-bold">Kata Sandi<div className="relative mt-1.5"><Lock className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-emerald-700"/><input type="password" autoComplete="current-password" value={password} onChange={(e)=>setPassword(e.target.value)} className="w-full rounded-xl border bg-slate-50 py-3 pl-10 pr-3.5 text-sm" placeholder="Kata sandi"/></div></label>
        <button type="submit" className="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-800 py-3 text-sm font-black text-white">Masuk<ArrowRight className="h-4 w-4"/></button>
      </form>}
      <div className="mt-5 rounded-2xl border bg-slate-50 p-3 text-[11px] leading-relaxed text-slate-500">Tidak ada username atau kata sandi demo yang dibundel ke aplikasi. Akun pengguna dibuat oleh administrator.</div>
    </div></main>
  </div>;
};
