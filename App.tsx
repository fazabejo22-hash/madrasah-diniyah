import React, { useState, useEffect } from 'react';
import { UserRole } from './types';
import { NavPage, Sidebar } from './components/Sidebar';
import { Navbar } from './components/Navbar';
import { MobileNav } from './components/MobileNav';
import { GlobalSearchModal } from './components/GlobalSearchModal';

// Views
import { LoginView } from './views/LoginView';
import { DashboardGuru } from './views/DashboardGuru';
import { DashboardSiswa } from './views/DashboardSiswa';
import { DashboardAdmin } from './views/DashboardAdmin';
import { AbsensiView } from './views/AbsensiView';
import { NilaiView } from './views/NilaiView';
import { JadwalView } from './views/JadwalView';
import { SilabusView } from './views/SilabusView';
import { MateriView } from './views/MateriView';
import { BukuKerjaGuruView } from './views/BukuKerjaGuruView';
import { BukuKerjaSiswaView } from './views/BukuKerjaSiswaView';
import { PesantrenInfoView } from './views/PesantrenInfoView';
import { SoalUjianView } from './views/SoalUjianView';
import { RaportView } from './views/RaportView';
import { IjazahView } from './views/IjazahView';
import { SiswaDatabaseView } from './views/SiswaDatabaseView';
import { MuhafadzohView } from './views/MuhafadzohView';
import { NotifikasiView } from './views/NotifikasiView';
import { PengumumanView } from './views/PengumumanView';
import { PengaturanView } from './views/PengaturanView';
import { HariLiburView } from './views/HariLiburView';
import { KritikSaranView } from './views/KritikSaranView';
import { PeraturanGuruView } from './views/PeraturanGuruView';

import { MOCK_NOTIFIKASI, MOCK_USERS, MOCK_SESI_ABSENSI } from './data/mockData';
import { storageService } from './services/storageService';
import { SesiAbsensi } from './types';

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [userRole, setUserRole] = useState<UserRole>('Guru');
  const [currentPage, setCurrentPage] = useState<NavPage>('dashboard');
  const [notifications, setNotifications] = useState(MOCK_NOTIFIKASI);
  const [isSearchModalOpen, setIsSearchModalOpen] = useState<boolean>(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(false);
  const [absensiSession, setAbsensiSession] = useState<SesiAbsensi>(() => storageService.getAbsensiSession());

  const handleSaveAbsensiSession = (updatedSession: SesiAbsensi) => {
    setAbsensiSession(updatedSession);
    storageService.saveAbsensiSession(updatedSession);
  };

  // Keyboard shortcut (Cmd+K / Ctrl+K) for global search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsSearchModalOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Filter notifications based on role (pemberitahuan belum isi absensi strictly for admin & guru)
  const roleNotifications = (notifications || []).filter((n) => {
    if (userRole.toLowerCase() === 'siswa') {
      const isAbsensiWarning =
        n.judul.toLowerCase().includes('absensi') ||
        n.pesan.toLowerCase().includes('absensi') ||
        n.tautan === 'absensi';
      if (isAbsensiWarning) return false;
    }
    return true;
  });

  const unreadCount = roleNotifications.filter((n) => !n.dibaca).length;

  const handleMarkNotificationRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, dibaca: true } : n))
    );
  };

  const handleLogin = (role: UserRole) => {
    setUserRole(role);
    setIsLoggedIn(true);
    setCurrentPage('dashboard');
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
  };

  // Determine active user profile based on role
  const roleKey = userRole.toLowerCase();
  const currentUser = MOCK_USERS[roleKey] || MOCK_USERS.guru;

  // If not authenticated, render Login Page
  if (!isLoggedIn) {
    return <LoginView onLogin={handleLogin} />;
  }

  // Render current view
  const renderCurrentView = () => {
    switch (currentPage) {
      case 'dashboard':
        if (userRole === 'Admin') {
          return <DashboardAdmin user={currentUser} onNavigate={setCurrentPage} onSwitchRole={setUserRole} absensiSession={absensiSession} />;
        } else if (userRole === 'Siswa') {
          return <DashboardSiswa user={currentUser} onNavigate={setCurrentPage} />;
        } else {
          return <DashboardGuru user={currentUser} onNavigate={setCurrentPage} absensiSession={absensiSession} />;
        }

      case 'absensi':
        return <AbsensiView session={absensiSession} onSaveSession={handleSaveAbsensiSession} userRole={userRole} currentUser={currentUser} />;

      case 'nilai':
        return <NilaiView userRole={userRole} currentUser={currentUser} />;

      case 'jadwal':
        return <JadwalView userRole={userRole} />;

      case 'silabus':
        return <SilabusView />;

      case 'materi':
        return <MateriView />;

      case 'buku_guru':
      case 'guru_kerja':
        return <BukuKerjaGuruView />;

      case 'buku_siswa':
        return <BukuKerjaSiswaView />;

      case 'pesantren_info':
        return <PesantrenInfoView />;

      case 'soal':
        return <SoalUjianView userRole={userRole} currentUser={currentUser} />;

      case 'raport':
        return <RaportView userRole={userRole} currentUser={currentUser} />;

      case 'ijazah':
        return <IjazahView userRole={userRole} currentUser={currentUser} />;

      case 'hari_libur':
        return <HariLiburView userRole={userRole} />;

      case 'kritik_saran':
        return <KritikSaranView userRole={userRole} currentUser={currentUser} />;

      case 'peraturan_guru':
        return <PeraturanGuruView userRole={userRole} currentUser={currentUser} />;

      case 'siswa':
        return <SiswaDatabaseView userRole={userRole} />;

      case 'muhafadzoh':
        return <MuhafadzohView userRole={userRole} currentUser={currentUser} />;

      case 'pengumuman':
        return <PengumumanView />;

      case 'pengaturan':
        return (
          <PengaturanView
            currentRole={userRole}
            onSwitchRole={setUserRole}
          />
        );

      case 'notifikasi':
        return (
          <NotifikasiView
            notifications={notifications}
            onMarkRead={handleMarkNotificationRead}
            onNavigate={setCurrentPage}
          />
        );

      default:
        return <DashboardGuru user={currentUser} onNavigate={setCurrentPage} absensiSession={absensiSession} />;
    }
  };

  return (
    <div className="min-h-screen bg-[#f8faf8] flex flex-col antialiased">
      {/* Quick Role Switcher Bar at very top to easily test Admin, Guru, Siswa views */}
      <div className="bg-emerald-950 text-white text-[11px] py-1.5 px-4 flex flex-wrap items-center justify-between border-b border-emerald-900 shrink-0">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          <span className="font-mono text-slate-300">Mode Sistem:</span>
          <span className="font-bold text-amber-300">
            {userRole === 'Admin'
              ? 'Administrator Pesantren (RBAC Aktif)'
              : userRole === 'Guru'
              ? 'Ustadz Ahmad Fauzi, Lc. (Guru Nahwu & Fiqih)'
              : 'Muhammad Rayhan (Santri Kelas 5A - NIS 20240501)'}
          </span>
        </div>

        <div className="flex items-center gap-1.5 mt-1 sm:mt-0">
          <span className="text-slate-400 hidden sm:inline mr-1">Simulasi Peran:</span>
          {(['Admin', 'Guru', 'Siswa'] as const).map((role) => (
            <button
              key={role}
              onClick={() => {
                setUserRole(role);
                setCurrentPage('dashboard');
              }}
              className={`px-2.5 py-0.5 rounded-full font-bold transition-all text-[10px] ${
                userRole === role
                  ? 'bg-amber-400 text-emerald-950 shadow-xs'
                  : 'bg-emerald-900/80 text-emerald-200 hover:bg-emerald-800'
              }`}
            >
              {role}
            </button>
          ))}
          <button
            onClick={handleLogout}
            className="text-slate-400 hover:text-rose-300 ml-2 text-[10px] font-semibold underline underline-offset-2"
          >
            Keluar (Logout)
          </button>
        </div>
      </div>

      {/* Main App Layout */}
      <div className="flex-1 flex overflow-hidden">
        {/* Desktop Left Sidebar */}
        <Sidebar
          currentPage={currentPage}
          onNavigate={setCurrentPage}
          userRole={userRole}
          currentUser={currentUser}
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
          onLogout={handleLogout}
          unreadNotificationsCount={unreadCount}
        />

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
          {/* Top Navbar */}
          <Navbar
            user={currentUser}
            userRole={userRole}
            onNavigate={setCurrentPage}
            onOpenSearch={() => setIsSearchModalOpen(true)}
            onToggleSidebar={() => setIsSidebarOpen((prev) => !prev)}
            onSwitchRole={(role) => {
              const capRole = (role.charAt(0).toUpperCase() + role.slice(1).toLowerCase()) as UserRole;
              setUserRole(capRole);
            }}
            notifications={roleNotifications}
            onMarkNotificationRead={handleMarkNotificationRead}
            onSelectNotification={(notif) => {
              if (notif.tautan) {
                setCurrentPage(notif.tautan as NavPage);
              } else {
                setCurrentPage('notifikasi');
              }
            }}
            unreadNotificationsCount={unreadCount}
            onLogout={handleLogout}
          />

          {/* Page Content View */}
          <main className="flex-1 px-4 sm:px-6 lg:px-8 py-6 max-w-7xl w-full mx-auto">
            {renderCurrentView()}
          </main>
        </div>
      </div>

      {/* Mobile Bottom Navigation */}
      <MobileNav
        currentPage={currentPage}
        onNavigate={setCurrentPage}
        unreadCount={unreadCount}
        userRole={userRole}
      />

      {/* Global Search Dialog Modal (Cmd/Ctrl+K) */}
      <GlobalSearchModal
        isOpen={isSearchModalOpen}
        onClose={() => setIsSearchModalOpen(false)}
        onNavigate={(page) => {
          setCurrentPage(page);
          setIsSearchModalOpen(false);
        }}
      />
    </div>
  );
}
