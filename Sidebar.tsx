import React, { useState, useEffect, useMemo } from 'react';
import {
  LayoutDashboard,
  Users,
  UserCheck,
  GraduationCap,
  Calendar,
  ClipboardCheck,
  FileSpreadsheet,
  BookOpen,
  FileQuestion,
  FileText,
  BookMarked,
  Award,
  Landmark,
  Bell,
  Settings,
  LogOut,
  FolderOpen,
  ShieldCheck,
  Lock,
  Sparkles,
  CalendarOff,
  MessageSquare,
  Sliders,
  ChevronDown,
  ChevronRight
} from 'lucide-react';
import { UserRole, UserProfile, NavMenuItemConfig } from '../types';
import { storageService } from '../services/storageService';

export type NavPage =
  | 'dashboard'
  | 'siswa'
  | 'muhafadzoh'
  | 'guru_kerja'
  | 'jadwal'
  | 'absensi'
  | 'nilai'
  | 'silabus'
  | 'soal'
  | 'buku_guru'
  | 'buku_siswa'
  | 'materi'
  | 'raport'
  | 'ijazah'
  | 'pesantren_info'
  | 'pengumuman'
  | 'pengaturan'
  | 'notifikasi'
  | 'hari_libur'
  | 'kritik_saran'
  | 'peraturan_guru';

interface SidebarProps {
  currentPage: NavPage;
  onNavigate: (page: NavPage) => void;
  userRole: UserRole;
  currentUser?: UserProfile;
  isOpen?: boolean;
  onClose?: () => void;
  onLogout: () => void;
  unreadCount?: number;
  unreadNotificationsCount?: number;
}

// Icon mapping dictionary
const ICON_MAP: Record<string, React.ElementType> = {
  LayoutDashboard,
  Users,
  Sparkles,
  UserCheck,
  Calendar,
  ClipboardCheck,
  FileSpreadsheet,
  BookOpen,
  FileQuestion,
  BookMarked,
  FileText,
  Award,
  GraduationCap,
  MessageSquare,
  CalendarOff,
  Landmark,
  Bell,
  Settings,
  Sliders,
  FolderOpen,
  ShieldCheck,
};

export const Sidebar: React.FC<SidebarProps> = ({
  currentPage,
  onNavigate,
  userRole,
  currentUser,
  isOpen = false,
  onClose = () => {},
  onLogout,
  unreadCount = 0,
  unreadNotificationsCount,
}) => {
  const isSiswa = userRole.toLowerCase() === 'siswa';
  const isAdmin = userRole.toLowerCase() === 'admin';
  const isGuru = userRole.toLowerCase() === 'guru';

  const isKelas6 = Boolean(
    currentUser?.kelas?.includes('6') ||
    currentUser?.roleTitle?.includes('Kelas 6')
  );

  const displayUnread = unreadNotificationsCount ?? unreadCount;

  // Nav menus from dynamic storage
  const [navMenus, setNavMenus] = useState<NavMenuItemConfig[]>(() =>
    storageService.getNavMenus()
  );

  // Collapsible categories state
  const [akademikOpen, setAkademikOpen] = useState(true);
  const [dokumenOpen, setDokumenOpen] = useState(true);
  const [evaluasiOpen, setEvaluasiOpen] = useState(true);

  useEffect(() => {
    const handleUpdate = () => {
      setNavMenus(storageService.getNavMenus());
    };
    window.addEventListener('nav_menus_updated', handleUpdate);
    window.addEventListener('storage', handleUpdate);
    return () => {
      window.removeEventListener('nav_menus_updated', handleUpdate);
      window.removeEventListener('storage', handleUpdate);
    };
  }, []);

  const handleNav = (page: NavPage) => {
    onNavigate(page);
    if (onClose) onClose();
  };

  // Filter visible menus based on role
  const roleField = isSiswa
    ? 'visibleForSiswa'
    : isGuru
    ? 'visibleForGuru'
    : 'visibleForAdmin';

  const visibleMenus = useMemo(() => {
    return navMenus.filter((m) => {
      if (!m[roleField]) return false;
      // Santri restricted to Kelas 6 for ijazah
      if (isSiswa && m.page === 'ijazah' && !isKelas6) return false;
      return true;
    });
  }, [navMenus, roleField, isSiswa, isKelas6]);

  // Group menus by category
  const categorizedMenus = useMemo(() => {
    const utama: NavMenuItemConfig[] = [];
    const akademik: NavMenuItemConfig[] = [];
    const dokumen: NavMenuItemConfig[] = [];
    const evaluasi: NavMenuItemConfig[] = [];
    const lainnya: NavMenuItemConfig[] = [];

    visibleMenus.forEach((m) => {
      if (m.category === 'utama') utama.push(m);
      else if (m.category === 'akademik') akademik.push(m);
      else if (m.category === 'dokumen') dokumen.push(m);
      else if (m.category === 'evaluasi') evaluasi.push(m);
      else lainnya.push(m);
    });

    return { utama, akademik, dokumen, evaluasi, lainnya };
  }, [visibleMenus]);

  const renderNavButton = (item: NavMenuItemConfig) => {
    const Icon = ICON_MAP[item.iconName] || LayoutDashboard;
    const isActive = currentPage === item.page;

    let badgeText = item.badge;
    if (item.page === 'notifikasi' && displayUnread > 0) {
      badgeText = String(displayUnread);
    }
    if (item.page === 'ijazah' && isSiswa && isKelas6) {
      badgeText = 'Kelas 6';
    }

    return (
      <button
        key={item.id}
        onClick={() => handleNav(item.page as NavPage)}
        id={`nav-${item.page}`}
        className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl font-medium transition-all ${
          isActive
            ? 'bg-emerald-800 text-white font-semibold shadow-xs shadow-emerald-900/20'
            : 'text-slate-600 hover:bg-emerald-50/70 hover:text-emerald-900'
        }`}
      >
        <div className="flex items-center gap-3 min-w-0">
          <Icon
            className={`w-4 h-4 shrink-0 ${
              isActive ? 'text-amber-300' : 'text-emerald-700'
            }`}
          />
          <span className="truncate text-xs">{item.title}</span>
        </div>

        {badgeText && (
          <span
            className={`text-[9px] font-bold px-1.5 py-0.5 rounded shrink-0 ${
              isActive
                ? 'bg-amber-400 text-emerald-950 font-black'
                : item.page === 'notifikasi'
                ? 'bg-rose-500 text-white'
                : 'bg-emerald-100 text-emerald-800'
            }`}
          >
            {badgeText}
          </span>
        )}
      </button>
    );
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-40 lg:hidden"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-40 w-64 bg-white border-r border-emerald-100 flex flex-col transition-transform duration-200 ease-in-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Sidebar Header Brand */}
        <div className="p-4 border-b border-emerald-100 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <img
              src="/logo.png"
              alt="Logo Madrasah Takmiliyah Annajiyah 2"
              className="w-10 h-10 object-contain drop-shadow-xs"
            />
            <div>
              <h2 className="font-extrabold text-xs text-emerald-950 tracking-tight leading-tight uppercase">
                MT. ANNAJIYAH 2
              </h2>
              <p className="text-[10px] text-emerald-700 font-semibold tracking-wide">
                PP. Bahrul Ulum
              </p>
            </div>
          </div>
          {isAdmin && (
            <span
              onClick={() => handleNav('pengaturan')}
              className="px-2 py-0.5 bg-amber-100 text-amber-900 font-bold rounded-md text-[9px] uppercase border border-amber-300 cursor-pointer hover:bg-amber-200"
              title="Klik untuk kelola menu"
            >
              Architect
            </span>
          )}
        </div>

        {/* Sidebar Nav Items (Dynamic Scrollable) */}
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1.5 text-xs select-none">
          {/* Menu Utama */}
          <div className="space-y-0.5">
            {categorizedMenus.utama.map(renderNavButton)}
          </div>

          {/* Kelompok Akademik (Collapsible jika ada item) */}
          {categorizedMenus.akademik.length > 0 && (
            <div className="pt-2">
              <button
                type="button"
                onClick={() => setAkademikOpen(!akademikOpen)}
                className="w-full flex items-center justify-between px-3 py-1.5 rounded-xl text-slate-500 font-bold hover:bg-slate-100 transition-colors text-[11px]"
              >
                <span className="flex items-center gap-2 text-emerald-900">
                  <GraduationCap className="w-3.5 h-3.5 text-emerald-700" />
                  <span>Akademik & KBM</span>
                </span>
                {akademikOpen ? (
                  <ChevronDown className="w-3 h-3 text-slate-400" />
                ) : (
                  <ChevronRight className="w-3 h-3 text-slate-400" />
                )}
              </button>

              {akademikOpen && (
                <div className="pl-2 space-y-0.5 border-l-2 border-emerald-100 ml-4 my-1">
                  {categorizedMenus.akademik.map(renderNavButton)}
                </div>
              )}
            </div>
          )}

          {/* Kelompok Evaluasi (Raport, Ijazah, Soal) */}
          {categorizedMenus.evaluasi.length > 0 && (
            <div className="pt-2">
              <button
                type="button"
                onClick={() => setEvaluasiOpen(!evaluasiOpen)}
                className="w-full flex items-center justify-between px-3 py-1.5 rounded-xl text-slate-500 font-bold hover:bg-slate-100 transition-colors text-[11px]"
              >
                <span className="flex items-center gap-2 text-emerald-900">
                  <Award className="w-3.5 h-3.5 text-emerald-700" />
                  <span>Evaluasi & Kelulusan</span>
                </span>
                {evaluasiOpen ? (
                  <ChevronDown className="w-3 h-3 text-slate-400" />
                ) : (
                  <ChevronRight className="w-3 h-3 text-slate-400" />
                )}
              </button>

              {evaluasiOpen && (
                <div className="pl-2 space-y-0.5 border-l-2 border-emerald-100 ml-4 my-1">
                  {categorizedMenus.evaluasi.map(renderNavButton)}
                </div>
              )}
            </div>
          )}

          {/* Kelompok Dokumen & Modul */}
          {categorizedMenus.dokumen.length > 0 && (
            <div className="pt-2">
              <button
                type="button"
                onClick={() => setDokumenOpen(!dokumenOpen)}
                className="w-full flex items-center justify-between px-3 py-1.5 rounded-xl text-slate-500 font-bold hover:bg-slate-100 transition-colors text-[11px]"
              >
                <span className="flex items-center gap-2 text-emerald-900">
                  <FolderOpen className="w-3.5 h-3.5 text-emerald-700" />
                  <span>Dokumen & Modul</span>
                </span>
                {dokumenOpen ? (
                  <ChevronDown className="w-3 h-3 text-slate-400" />
                ) : (
                  <ChevronRight className="w-3 h-3 text-slate-400" />
                )}
              </button>

              {dokumenOpen && (
                <div className="pl-2 space-y-0.5 border-l-2 border-emerald-100 ml-4 my-1">
                  {categorizedMenus.dokumen.map(renderNavButton)}
                </div>
              )}
            </div>
          )}

          {/* Menu Lainnya / Pengaturan */}
          {categorizedMenus.lainnya.length > 0 && (
            <div className="pt-2 space-y-0.5 border-t border-slate-100 mt-2">
              {categorizedMenus.lainnya.map(renderNavButton)}
            </div>
          )}

          {/* Quick Admin Builder Helper if Admin */}
          {isAdmin && (
            <div className="pt-4 px-1">
              <div className="p-3 bg-gradient-to-br from-amber-50 to-emerald-50 rounded-2xl border border-amber-200/80 text-[11px] text-slate-800 space-y-2">
                <p className="font-extrabold text-emerald-950 flex items-center gap-1.5">
                  <Sliders className="w-3.5 h-3.5 text-amber-700" />
                  <span>Arsitek Menu Aktif</span>
                </p>
                <p className="text-slate-600 text-[10px] leading-relaxed">
                  Semua menu di atas dapat Anda ubah judulnya, tambahkan menu baru, atau sembunyikan sesuai kebutuhan.
                </p>
                <button
                  type="button"
                  onClick={() => handleNav('pengaturan')}
                  className="w-full py-1.5 bg-emerald-800 hover:bg-emerald-700 text-white rounded-xl text-[10px] font-bold transition-all shadow-xs"
                >
                  Kelola Menu & Akses
                </button>
              </div>
            </div>
          )}

          {/* Santri Role Box Info */}
          {isSiswa && (
            <div className="pt-4 px-1">
              <div className="p-3 bg-emerald-50 rounded-2xl border border-emerald-200 text-[11px] text-emerald-900">
                <p className="font-bold flex items-center gap-1 mb-1">
                  <Lock className="w-3.5 h-3.5 text-emerald-700" />
                  <span>Portal Akademik Santri</span>
                </p>
                <p className="text-slate-600 leading-relaxed text-[10px]">
                  Santri dapat melihat absensi, nilai akademik, muhafadloh, buku santri, serta cetak raport dan{' '}
                  <strong>Ijazah resmi bagi santri Kelas 6</strong>.
                </p>
              </div>
            </div>
          )}
        </nav>

        {/* User Footer Profile & Logout */}
        <div className="p-3 border-t border-emerald-100 bg-slate-50/60">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-full bg-emerald-800 text-amber-300 font-extrabold flex items-center justify-center text-xs shrink-0">
                {userRole.charAt(0).toUpperCase()}
              </div>
              <div className="min-w-0">
                <p className="text-xs font-bold text-slate-900 truncate">
                  {isSiswa
                    ? currentUser?.name || 'Santri Annajiyah 2'
                    : isGuru
                    ? currentUser?.name || 'Ust. Ahmad Fauzi'
                    : 'Administrator Utama'}
                </p>
                <p className="text-[10px] text-emerald-700 font-medium capitalize truncate">
                  Peran: {isSiswa ? 'Santri' : userRole}
                </p>
              </div>
            </div>

            <button
              onClick={onLogout}
              id="btn-sidebar-logout"
              className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
              title="Keluar"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};
