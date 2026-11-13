/**
 * Login & Authentication Screen for Cheeseholic
 * Features individual credentials for each 5 outlet branches, central production, courier, and admin.
 */

import { useState } from 'react';
import { Outlet } from '../utils/orderCalculator';
import { CHEESEHOLIC_ACCOUNTS, UserAccount } from '../data/userAccounts';

export interface AuthUserSession {
  username: string;
  name: string;
  role: 'outlet' | 'kitchen' | 'courier' | 'admin';
  outletId?: string;
  badgeColor: string;
  loggedInAt: string;
}

interface LoginScreenProps {
  outlets: Outlet[];
  currentSession: AuthUserSession | null;
  onLoginSuccess: (session: AuthUserSession) => void;
  onLogout: () => void;
  onNavigateToTab: (tab: 'order' | 'menu' | 'cabang' | 'outlet-terminal' | 'admin' | 'kitchen' | 'courier') => void;
}

export function LoginScreen({
  currentSession,
  onLoginSuccess,
  onLogout,
  onNavigateToTab,
}: LoginScreenProps) {
  const [username, setUsername] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [activeAccountCategory, setActiveAccountCategory] = useState<'all' | 'outlet' | 'kitchen'>('all');

  const handleFormLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const targetUser = CHEESEHOLIC_ACCOUNTS.find(
      (acc) => acc.username.toLowerCase() === username.trim().toLowerCase()
    );

    if (!targetUser) {
      setErrorMessage(`Username "${username}" tidak ditemukan dalam sistem! Silakan periksa daftar akun di bawah.`);
      return;
    }

    if (targetUser.password !== password) {
      setErrorMessage(`Password untuk akun ${targetUser.name} salah! Coba periksa daftar password.`);
      return;
    }

    // Login successful
    const now = new Date();
    const session: AuthUserSession = {
      username: targetUser.username,
      name: targetUser.name,
      role: targetUser.role,
      outletId: targetUser.outletId,
      badgeColor: targetUser.badgeColor,
      loggedInAt: `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')} WIB`,
    };

    onLoginSuccess(session);

    // Redirect to target workspace based on role
    if (session.role === 'outlet') onNavigateToTab('outlet-terminal');
    else if (session.role === 'kitchen') onNavigateToTab('kitchen');
    else if (session.role === 'courier') onNavigateToTab('courier');
    else onNavigateToTab('admin');
  };

  const handleQuickFillAccount = (acc: UserAccount) => {
    setUsername(acc.username);
    setPassword(acc.password);
    setErrorMessage(null);
  };

  const filteredAccounts = activeAccountCategory === 'all'
    ? CHEESEHOLIC_ACCOUNTS
    : CHEESEHOLIC_ACCOUNTS.filter((a) => a.role === activeAccountCategory);

  return (
    <div className="pb-28 max-w-4xl mx-auto px-4 sm:px-6 pt-4 animate-in fade-in duration-300">
      {/* Active Session Status Banner */}
      {currentSession && (
        <div className="mb-6 p-5 rounded-3xl bg-gradient-to-r from-[#311309] to-[#542111] text-white shadow-xl border border-[#FFC700]/40 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-[#FFC700] text-[#311309] flex items-center justify-center font-black text-xl shadow-md shrink-0">
              <span className="material-symbols-outlined text-2xl">account_circle</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full uppercase bg-emerald-500 text-white">
                  ● Sesi Aktif
                </span>
                <span className="text-xs text-[#FFC700] font-mono">@{currentSession.username}</span>
              </div>
              <h3 className="font-headline font-extrabold text-white text-lg mt-0.5">
                {currentSession.name}
              </h3>
              <p className="text-xs text-gray-300">Terhubung sejak {currentSession.loggedInAt}</p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => {
                if (currentSession.role === 'outlet') onNavigateToTab('outlet-terminal');
                else if (currentSession.role === 'kitchen') onNavigateToTab('kitchen');
                else if (currentSession.role === 'courier') onNavigateToTab('courier');
                else onNavigateToTab('admin');
              }}
              className="py-2.5 px-4 bg-[#FFC700] hover:bg-[#FFA800] text-[#311309] rounded-2xl font-headline font-extrabold text-xs shadow-md transition-transform active:scale-95 cursor-pointer"
            >
              Masuk Terminal →
            </button>
            <button
              onClick={onLogout}
              className="py-2.5 px-4 bg-white/10 hover:bg-white/20 text-rose-300 rounded-2xl font-headline font-bold text-xs transition-colors cursor-pointer"
            >
              Keluar / Logout
            </button>
          </div>
        </div>
      )}

      {/* Main Login Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-xl border border-[#311309]/10">
        <div className="text-center mb-6">
          <span className="inline-flex items-center gap-1.5 px-3.5 py-1 bg-[#311309] text-[#FFC700] rounded-full text-xs font-headline font-bold mb-2 shadow-xs">
            <span className="material-symbols-outlined text-sm">vpn_key</span>
            Portal Otentikasi Resmi Cheeseholic
          </span>
          <h1 className="text-2xl sm:text-3xl font-black font-headline text-[#311309]">
            Login Cabang Outlet &amp; Dapur Utama
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 mt-1 max-w-md mx-auto">
            Setiap cabang outlet dan pusat produksi memiliki akun username &amp; password tersendiri.
          </p>
        </div>

        {/* Credentials Login Form */}
        <form onSubmit={handleFormLogin} className="space-y-4 max-w-md mx-auto">
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">
              Username Akun *
            </label>
            <div className="relative">
              <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-lg">
                person
              </span>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Contoh: outlet.kedaton atau dapur.pusat"
                required
                className="w-full pl-10 pr-3.5 py-3 rounded-2xl border border-gray-200 text-sm focus:outline-none focus:border-[#FFC700] focus:ring-2 focus:ring-[#FFC700]/30 transition-all font-mono"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">
              Password Akun *
            </label>
            <div className="relative">
              <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-lg">
                lock
              </span>
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Masukkan password akun..."
                required
                className="w-full pl-10 pr-10 py-3 rounded-2xl border border-gray-200 text-sm focus:outline-none focus:border-[#FFC700] focus:ring-2 focus:ring-[#FFC700]/30 transition-all font-mono"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700 text-sm font-bold"
              >
                <span className="material-symbols-outlined text-lg">
                  {showPassword ? 'visibility_off' : 'visibility'}
                </span>
              </button>
            </div>
          </div>

          {errorMessage && (
            <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-bold flex items-start gap-2.5 animate-in fade-in">
              <span className="material-symbols-outlined text-lg text-rose-600 shrink-0">error</span>
              <span>{errorMessage}</span>
            </div>
          )}

          <button
            type="submit"
            className="w-full py-3.5 bg-[#311309] hover:bg-[#4a1d0f] text-[#FFC700] font-headline font-extrabold text-base rounded-2xl shadow-lg active:scale-[0.99] transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <span className="material-symbols-outlined text-xl">login</span>
            <span>Masuk ke Akun Sekarang</span>
          </button>
        </form>

        {/* Account Credentials Reference List */}
        <div className="mt-8 pt-6 border-t border-gray-100">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mb-4">
            <div>
              <h2 className="font-headline font-extrabold text-base text-[#311309]">
                Daftar Akun Resmi &amp; Password per Cabang
              </h2>
              <p className="text-xs text-gray-500">Klik tombol di kanan akun untuk login cepat (Simulasi Instan)</p>
            </div>

            {/* Account Category Filter Tabs */}
            <div className="flex items-center gap-1 bg-gray-100 p-1 rounded-xl">
              <button
                type="button"
                onClick={() => setActiveAccountCategory('all')}
                className={`py-1 px-3 rounded-lg text-xs font-bold font-headline transition-all cursor-pointer ${
                  activeAccountCategory === 'all'
                    ? 'bg-[#311309] text-[#FFC700] shadow-xs'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Semua (8)
              </button>
              <button
                type="button"
                onClick={() => setActiveAccountCategory('outlet')}
                className={`py-1 px-3 rounded-lg text-xs font-bold font-headline transition-all cursor-pointer ${
                  activeAccountCategory === 'outlet'
                    ? 'bg-[#311309] text-[#FFC700] shadow-xs'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Outlet (5)
              </button>
              <button
                type="button"
                onClick={() => setActiveAccountCategory('kitchen')}
                className={`py-1 px-3 rounded-lg text-xs font-bold font-headline transition-all cursor-pointer ${
                  activeAccountCategory === 'kitchen'
                    ? 'bg-[#311309] text-[#FFC700] shadow-xs'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Dapur Pusat
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {filteredAccounts.map((acc) => (
              <div
                key={acc.id}
                className="p-3.5 rounded-2xl border border-gray-100 bg-gray-50/50 hover:bg-gray-50 hover:border-gray-200 transition-all flex items-center justify-between gap-3"
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-headline font-bold text-xs text-[#311309] truncate">
                      {acc.name}
                    </span>
                    <span className={`text-[9px] font-extrabold px-1.5 py-0.2 rounded ${acc.badgeColor}`}>
                      {acc.role.toUpperCase()}
                    </span>
                  </div>
                  <div className="text-[11px] text-gray-500 font-mono mt-0.5 space-x-2">
                    <span>User: <b>{acc.username}</b></span>
                    <span>• Pass: <b>{acc.password}</b></span>
                  </div>
                  {acc.locationDesc && (
                    <p className="text-[10px] text-gray-400 line-clamp-1 mt-0.5">{acc.locationDesc}</p>
                  )}
                </div>

                <button
                  type="button"
                  onClick={() => handleQuickFillAccount(acc)}
                  className="py-1.5 px-3 bg-[#FFC700] hover:bg-[#FFA800] text-[#311309] rounded-xl text-xs font-headline font-bold shrink-0 shadow-xs active:scale-95 transition-all cursor-pointer"
                >
                  Isi Form
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
