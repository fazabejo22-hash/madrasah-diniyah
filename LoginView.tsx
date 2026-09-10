import React, { useState } from 'react';
import { UserRole } from '../types';
import { Lock, User, CheckCircle2, KeyRound, ArrowRight } from 'lucide-react';

interface LoginViewProps {
  onLogin: (role: UserRole) => void;
}

export const LoginView: React.FC<LoginViewProps> = ({ onLogin }) => {
  const [selectedRole, setSelectedRole] = useState<UserRole>('guru');
  const [username, setUsername] = useState('ahmad.fauzi');
  const [password, setPassword] = useState('••••••••');
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotSubmitted, setForgotSubmitted] = useState(false);

  const handleRoleChange = (role: UserRole) => {
    setSelectedRole(role);
    if (role === 'admin') {
      setUsername('admin.mahfudz');
    } else if (role === 'guru') {
      setUsername('ahmad.fauzi');
    } else {
      setUsername('202305012'); // NIS Santri
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onLogin(selectedRole);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-900 via-emerald-950 to-slate-950 flex flex-col justify-between text-slate-100 relative overflow-hidden">
      {/* Background Islamic Subtle Geometric Accent */}
      <div className="absolute inset-0 opacity-5 pointer-events-none bg-[radial-gradient(#f59e0b_1px,transparent_1px)] [background-size:24px_24px]"></div>

      {/* Top Brand Bar */}
      <header className="p-4 sm:p-6 flex items-center justify-between relative z-10">
        <div className="flex items-center gap-3">
          <img
            src="/logo.png"
            alt="Logo Madrasah Takmiliyah Annajiyah 2"
            className="w-12 h-12 sm:w-14 sm:h-14 object-contain drop-shadow-md"
          />
          <div>
            <span className="font-extrabold text-white text-base sm:text-lg tracking-tight block leading-tight">
              MADRASAH TAKMILIYAH ANNAJIYAH 2
            </span>
            <span className="text-[11px] text-emerald-200">PP. Bahrul Ulum Tambakberas Jombang</span>
          </div>
        </div>
      </header>

      {/* Main Login Card Container */}
      <main className="flex-1 flex items-center justify-center p-4 relative z-10">
        <div className="w-full max-w-md bg-white rounded-3xl p-6 sm:p-8 text-slate-800 shadow-2xl border border-emerald-100 animate-in fade-in zoom-in-95 duration-200">
          
          {/* Card Title & Logo */}
          <div className="text-center mb-6">
            <img
              src="/logo.png"
              alt="Logo Madrasah Takmiliyah Annajiyah 2"
              className="w-24 h-24 sm:w-28 sm:h-28 object-contain mx-auto mb-3 drop-shadow-md"
            />
            <h1 className="text-xl sm:text-2xl font-black text-emerald-950 tracking-tight">
              Madrasah Takmiliyah Annajiyah 2
            </h1>
          </div>

          {/* Role Switcher Tabs (DANA-style clean buttons) */}
          <div className="bg-slate-100 p-1 rounded-2xl flex gap-1 mb-5">
            <button
              type="button"
              onClick={() => handleRoleChange('guru')}
              id="tab-login-guru"
              className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all ${
                selectedRole === 'guru'
                  ? 'bg-emerald-800 text-white shadow-sm'
                  : 'text-slate-600 hover:text-emerald-900'
              }`}
            >
              Guru (Ustadz)
            </button>
            <button
              type="button"
              onClick={() => handleRoleChange('siswa')}
              id="tab-login-siswa"
              className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all ${
                selectedRole === 'siswa'
                  ? 'bg-emerald-800 text-white shadow-sm'
                  : 'text-slate-600 hover:text-emerald-900'
              }`}
            >
              Siswa (Santri)
            </button>
            <button
              type="button"
              onClick={() => handleRoleChange('admin')}
              id="tab-login-admin"
              className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all ${
                selectedRole === 'admin'
                  ? 'bg-emerald-800 text-white shadow-sm'
                  : 'text-slate-600 hover:text-emerald-900'
              }`}
            >
              Admin
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                {selectedRole === 'siswa' ? 'Nomor Induk Santri (NIS)' : 'Username / NIP Pegawai'}
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <User className="w-4 h-4 text-emerald-700" />
                </div>
                <input
                  type="text"
                  id="input-username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder={selectedRole === 'siswa' ? 'Contoh: 202305012' : 'Nama pengguna atau NIP'}
                  required
                  className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 font-medium focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-emerald-600 focus:border-transparent transition-all"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-bold text-slate-700">
                  Kata Sandi
                </label>
                <button
                  type="button"
                  onClick={() => setShowForgotModal(true)}
                  className="text-[11px] font-semibold text-emerald-700 hover:text-emerald-900 hover:underline"
                >
                  Lupa password?
                </button>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4 text-emerald-700" />
                </div>
                <input
                  type="password"
                  id="input-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Masukkan kata sandi"
                  required
                  className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 font-medium focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-emerald-600 focus:border-transparent transition-all"
                />
              </div>
            </div>

            {/* Login Action Button */}
            <button
              type="submit"
              id="btn-login-submit"
              className="w-full mt-2 py-3 bg-emerald-800 hover:bg-emerald-700 text-white font-bold rounded-xl text-sm shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 group cursor-pointer"
            >
              <span>Masuk Sebagai {selectedRole === 'guru' ? 'Guru' : selectedRole === 'siswa' ? 'Santri' : 'Admin'}</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </button>
          </form>

        </div>
      </main>

      {/* Footer */}
      <footer className="p-4 sm:p-6 text-center relative z-10">
        <p className="text-xs text-emerald-200/70 font-medium">
          © Madrasah Takmiliyah Annajiyah 2 · Pondok Pesantren Bahrul Ulum Tambakberas Jombang
        </p>
      </footer>

      {/* Forgot Password Modal */}
      {showForgotModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 backdrop-blur-xs p-4">
          <div className="bg-white text-slate-800 w-full max-w-md rounded-2xl p-6 shadow-2xl border border-emerald-100">
            <h3 className="text-lg font-bold text-emerald-950 flex items-center gap-2">
              <KeyRound className="w-5 h-5 text-emerald-700" />
              <span>Pemulihan Kata Sandi</span>
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Masukkan NIS atau email terdaftar Anda untuk menerima tautan reset kata sandi dari Sekretariat Pesantren.
            </p>

            {forgotSubmitted ? (
              <div className="my-4 p-4 bg-emerald-50 text-emerald-900 rounded-xl border border-emerald-200 text-xs flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                <span>Instruksi pemulihan telah dikirim ke nomor kontak wali santri dan email terdaftar.</span>
              </div>
            ) : (
              <div className="my-4 space-y-3">
                <input
                  type="text"
                  placeholder="NIS Santri atau Email Pegawai"
                  value={forgotEmail}
                  onChange={(e) => setForgotEmail(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-emerald-600"
                />
              </div>
            )}

            <div className="flex justify-end gap-2 mt-4">
              <button
                type="button"
                onClick={() => { setShowForgotModal(false); setForgotSubmitted(false); }}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
              >
                Tutup
              </button>
              {!forgotSubmitted && (
                <button
                  type="button"
                  onClick={() => setForgotSubmitted(true)}
                  className="px-4 py-2 text-xs font-bold bg-emerald-800 hover:bg-emerald-700 text-white rounded-xl"
                >
                  Kirim Permintaan
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
