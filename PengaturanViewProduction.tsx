import React, { useState } from 'react';
import { CheckCircle2, KeyRound, Save, Settings, Trash2, UserPlus, Users, X } from 'lucide-react';
import { AppUserAccount, UserProfile, UserRole } from './types';
import { storageService } from './storageServiceProduction';

interface PengaturanViewProps {
  onSwitchRole: (role: UserRole) => void;
  currentRole: UserRole;
  currentUser?: UserProfile;
}

export const PengaturanView: React.FC<PengaturanViewProps> = ({ currentRole, currentUser }) => {
  const isAdmin = String(currentRole).toLowerCase() === 'admin';
  const [accounts, setAccounts] = useState<AppUserAccount[]>(() => storageService.getUserAccounts());
  const [showAdd, setShowAdd] = useState(false);
  const [toast, setToast] = useState('');
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'admin'|'guru'|'siswa'>('guru');
  const [kelas, setKelas] = useState('');
  const [nipNis, setNipNis] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const notify = (text:string) => { setToast(text); setTimeout(()=>setToast(''),3000); };

  const addAccount = (e:React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !username.trim() || password.length < 8) {
      notify('Nama, username, dan kata sandi minimal 8 karakter wajib diisi.');
      return;
    }
    if (accounts.some((a)=>a.username.toLowerCase()===username.trim().toLowerCase())) {
      notify('Username sudah digunakan.');
      return;
    }
    if (role==='siswa') {
      const nis = (nipNis || username).replace(/\D/g,'');
      if (!storageService.getStudents().some((s)=>s.nis.replace(/\D/g,'')===nis)) {
        notify('Akun santri harus terhubung ke NIS yang ada pada master resmi.');
        return;
      }
    }
    const acc:AppUserAccount = {
      id:`usr-${Date.now()}`,
      name:name.trim(),
      username:username.trim(),
      password,
      role,
      roleTitle: role==='admin'?'Administrator Madrasah':role==='guru'?'Guru / Pengajar':'Santri',
      nipOrNis:(nipNis || username).trim(),
      kelas:kelas.trim() || undefined,
      status:'Aktif',
      permissions:role==='admin'?['admin_full']:role==='guru'?['kbm','absensi','nilai','muhafadzoh']:['santri_portal'],
    };
    storageService.addUserAccount(acc);
    setAccounts(storageService.getUserAccounts());
    setShowAdd(false); setName(''); setUsername(''); setPassword(''); setKelas(''); setNipNis('');
    notify('Akun berhasil dibuat.');
  };

  const toggleStatus = (acc:AppUserAccount) => {
    storageService.updateUserAccount(acc.id,{status:acc.status==='Aktif'?'Nonaktif':'Aktif'});
    setAccounts(storageService.getUserAccounts());
  };

  const remove = (acc:AppUserAccount) => {
    if (currentUser?.id === acc.id) { notify('Akun yang sedang digunakan tidak dapat dihapus.'); return; }
    if (!window.confirm(`Hapus akun ${acc.name}?`)) return;
    storageService.deleteUserAccount(acc.id);
    setAccounts(storageService.getUserAccounts());
    notify('Akun dihapus.');
  };

  const changeOwnPassword = (e:React.FormEvent) => {
    e.preventDefault();
    if (!currentUser || newPassword.length < 8) { notify('Kata sandi minimal 8 karakter.'); return; }
    if (newPassword !== confirmPassword) { notify('Konfirmasi kata sandi tidak cocok.'); return; }
    if (!storageService.changeUserPassword(currentUser.id,newPassword)) { notify('Akun aktif tidak ditemukan.'); return; }
    setNewPassword(''); setConfirmPassword(''); notify('Kata sandi berhasil diubah.');
  };

  return <div className="space-y-6 pb-12">
    {toast&&<div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 rounded-xl bg-emerald-900 px-4 py-3 text-xs font-bold text-white shadow-xl"><CheckCircle2 className="h-4 w-4"/>{toast}</div>}
    <header><h1 className="flex items-center gap-2 text-2xl font-black text-slate-900"><Settings className="h-6 w-6 text-emerald-700"/>Pengaturan Sistem</h1><p className="mt-1 text-xs text-slate-500">Pengaturan akun produksi. Sistem tidak menampilkan kata sandi pengguna.</p></header>

    <section className="rounded-2xl border bg-white p-5 shadow-sm"><div className="mb-4 flex items-center gap-2"><KeyRound className="h-5 w-5 text-emerald-700"/><h2 className="font-black">Ubah Kata Sandi Saya</h2></div><form onSubmit={changeOwnPassword} className="grid gap-3 sm:grid-cols-[1fr_1fr_auto]"><input type="password" value={newPassword} onChange={(e)=>setNewPassword(e.target.value)} placeholder="Kata sandi baru (min. 8)" className="rounded-xl border px-3 py-2.5 text-sm"/><input type="password" value={confirmPassword} onChange={(e)=>setConfirmPassword(e.target.value)} placeholder="Konfirmasi kata sandi" className="rounded-xl border px-3 py-2.5 text-sm"/><button className="rounded-xl bg-emerald-800 px-4 py-2.5 text-xs font-bold text-white"><Save className="mr-1 inline h-4 w-4"/>Simpan</button></form></section>

    {isAdmin&&<section className="rounded-2xl border bg-white p-5 shadow-sm"><div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"><div><div className="flex items-center gap-2"><Users className="h-5 w-5 text-emerald-700"/><h2 className="font-black">Akun Pengguna</h2></div><p className="mt-1 text-xs text-slate-500">Buat akun guru/santri/admin sesuai kebutuhan. Kata sandi tidak pernah ditampilkan kembali di halaman ini.</p></div><button onClick={()=>setShowAdd(true)} className="rounded-xl bg-emerald-800 px-4 py-2 text-xs font-bold text-white"><UserPlus className="mr-1 inline h-4 w-4"/>Tambah Akun</button></div><div className="overflow-x-auto"><table className="w-full border-collapse text-xs"><thead><tr className="bg-slate-100"><th className="border p-2 text-left">Nama</th><th className="border p-2 text-left">Username</th><th className="border p-2">Role</th><th className="border p-2">NIP/NIS</th><th className="border p-2">Kelas</th><th className="border p-2">Status</th><th className="border p-2">Aksi</th></tr></thead><tbody>{accounts.map((a)=><tr key={a.id}><td className="border p-2 font-bold">{a.name}</td><td className="border p-2 font-mono">{a.username}</td><td className="border p-2 text-center uppercase">{a.role}</td><td className="border p-2 text-center">{a.nipOrNis}</td><td className="border p-2 text-center">{a.kelas||'—'}</td><td className="border p-2 text-center"><button onClick={()=>toggleStatus(a)} className={`rounded-full px-2 py-1 font-bold ${a.status==='Aktif'?'bg-emerald-100 text-emerald-800':'bg-slate-100 text-slate-600'}`}>{a.status}</button></td><td className="border p-2 text-center"><button onClick={()=>remove(a)} className="rounded-lg bg-rose-50 p-2 text-rose-700" title="Hapus akun"><Trash2 className="h-4 w-4"/></button></td></tr>)}</tbody></table></div></section>}

    {!isAdmin&&<section className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-xs text-emerald-900">Pengelolaan akun pengguna hanya tersedia untuk administrator.</section>}

    {isAdmin&&showAdd&&<div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4"><form onSubmit={addAccount} className="w-full max-w-xl rounded-3xl bg-white p-6 shadow-2xl"><div className="flex items-center justify-between"><h2 className="font-black">Tambah Akun Pengguna</h2><button type="button" onClick={()=>setShowAdd(false)}><X className="h-5 w-5"/></button></div><div className="mt-4 grid gap-3 sm:grid-cols-2"><label className="text-xs font-bold sm:col-span-2">Nama<input value={name} onChange={(e)=>setName(e.target.value)} className="mt-1 w-full rounded-xl border px-3 py-2"/></label><label className="text-xs font-bold">Username<input value={username} onChange={(e)=>setUsername(e.target.value)} className="mt-1 w-full rounded-xl border px-3 py-2"/></label><label className="text-xs font-bold">Kata Sandi<input type="password" value={password} onChange={(e)=>setPassword(e.target.value)} className="mt-1 w-full rounded-xl border px-3 py-2" placeholder="Minimal 8 karakter"/></label><label className="text-xs font-bold">Role<select value={role} onChange={(e)=>setRole(e.target.value as any)} className="mt-1 w-full rounded-xl border px-3 py-2"><option value="guru">Guru</option><option value="siswa">Santri</option><option value="admin">Admin</option></select></label><label className="text-xs font-bold">NIP / NIS<input value={nipNis} onChange={(e)=>setNipNis(e.target.value)} className="mt-1 w-full rounded-xl border px-3 py-2" placeholder={role==='siswa'?'Wajib cocok dengan NIS master':'NIP / identitas'}/></label><label className="text-xs font-bold sm:col-span-2">Kelas (opsional)<input value={kelas} onChange={(e)=>setKelas(e.target.value)} className="mt-1 w-full rounded-xl border px-3 py-2" placeholder="Contoh: 1A"/></label></div><div className="mt-5 flex justify-end gap-2"><button type="button" onClick={()=>setShowAdd(false)} className="rounded-xl border px-4 py-2 text-xs font-bold">Batal</button><button className="rounded-xl bg-emerald-800 px-4 py-2 text-xs font-bold text-white">Buat Akun</button></div></form></div>}
  </div>;
};
