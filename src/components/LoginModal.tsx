import React, { useState } from 'react';
import { CHEESEHOLIC_ACCOUNTS, UserAccount } from '../data/userAccounts';
import { AuthUserSession } from './LoginScreen';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentSession: AuthUserSession | null;
  onLoginSuccess: (session: AuthUserSession) => void;
  onLogout: () => void;
  onNavigateToTab: (tab: 'order' | 'menu' | 'cabang' | 'outlet-terminal' | 'admin' | 'kitchen' | 'courier') => void;
}

export const LoginModal: React.FC<LoginModalProps> = ({
  isOpen,
  onClose,
  currentSession,
  onLoginSuccess,
  onLogout,
  onNavigateToTab,
}) => {
  const [username, setUsername] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const targetUser = CHEESEHOLIC_ACCOUNTS.find(
      (acc) => acc.username.toLowerCase() === username.trim().toLowerCase()
    );

    if (!targetUser) {
      setErrorMessage(`Username "${username}" tidak terdaftar! Silakan cek daftar akun di bawah.`);
      return;
    }

    if (targetUser.password !== password) {
      setErrorMessage(`Password untuk akun ${targetUser.name} salah!`);
      return;
    }

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
    onClose();

    if (session.role === 'outlet') onNavigateToTab('outlet-terminal');
    else if (session.role === 'kitchen') onNavigateToTab('kitchen');
    else if (session.role === 'courier') onNavigateToTab('courier');
    else onNavigateToTab('admin');
  };

  const handleQuickLogin = (acc: UserAccount) => {
    const now = new Date();
    const session: AuthUserSession = {
      username: acc.username,
      name: acc.name,
      role: acc.role,
      outletId: acc.outletId,
      badgeColor: acc.badgeColor,
      loggedInAt: `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')} WIB`,
    };

    onLoginSuccess(session);
    onClose();

    if (session.role === 'outlet') onNavigateToTab('outlet-terminal');
    else if (session.role === 'kitchen') onNavigateToTab('kitchen');
    else if (session.role === 'courier') onNavigateToTab('courier');
    else onNavigateToTab('admin');
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden border border-[#FFC700]/40 max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="bg-[#311309] text-white px-5 py-4 flex items-center justify-between border-b border-[#FFC700]/30 shrink-0">
          <div className="flex items-center gap-2.5">
            <span className="material-symbols-outlined text-[#FFC700] text-2xl">
              key
            </span>
            <div>
              <h3 className="font-headline font-extrabold text-base text-white">
                Login Sistem Staf Cheeseholic
              </h3>
              <p className="text-[11px] text-gray-300">Akses Terminal Cabang &amp; Dapur Pusat</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-lg">close</span>
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="p-5 overflow-y-auto space-y-5">
          {/* Active Session Info if already logged in */}
          {currentSession && (
            <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-between text-xs">
              <div>
                <span className="font-bold text-emerald-800 uppercase block">Status Login Aktif:</span>
                <span className="font-headline font-extrabold text-[#311309] text-sm">{currentSession.name}</span>
                <span className="text-gray-500 block">User: @{currentSession.username}</span>
              </div>
              <button
                onClick={onLogout}
                className="py-1.5 px-3 bg-rose-100 hover:bg-rose-200 text-rose-800 font-bold rounded-xl text-xs cursor-pointer"
              >
                Logout
              </button>
            </div>
          )}

          {/* Form Credentials */}
          <form onSubmit={handleFormSubmit} className="space-y-3.5">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Username Akun *</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Contoh: outlet.kedaton atau dapur.pusat"
                required
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-[#FFC700] focus:ring-2 focus:ring-[#FFC700]/30 transition-all font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Password Akun *</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Masukkan password..."
                  required
                  className="w-full px-3.5 py-2.5 pr-10 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-[#FFC700] focus:ring-2 focus:ring-[#FFC700]/30 transition-all font-mono"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700 text-xs font-bold"
                >
                  <span className="material-symbols-outlined text-base">
                    {showPassword ? 'visibility_off' : 'visibility'}
                  </span>
                </button>
              </div>
            </div>

            {errorMessage && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-bold flex items-center gap-2">
                <span className="material-symbols-outlined text-base">error</span>
                <span>{errorMessage}</span>
              </div>
            )}

            <button
              type="submit"
              className="w-full py-3 bg-[#311309] hover:bg-[#4a1d0f] text-[#FFC700] font-headline font-extrabold text-sm rounded-xl shadow-md cursor-pointer transition-all active:scale-95 flex items-center justify-center gap-2"
            >
              <span className="material-symbols-outlined text-lg">login</span>
              <span>Masuk Sekarang</span>
            </button>
          </form>

          {/* Quick 1-Click Login Shortcut Grid */}
          <div className="pt-4 border-t border-gray-100">
            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-2.5">
              ⚡ Simulasi Login Instan (1-Click)
            </span>
            <div className="grid grid-cols-2 gap-2">
              {CHEESEHOLIC_ACCOUNTS.map((acc) => (
                <button
                  key={acc.id}
                  onClick={() => handleQuickLogin(acc)}
                  className="p-2.5 rounded-xl border border-gray-100 bg-gray-50 hover:bg-[#FFFDF0] hover:border-[#FFC700] text-left transition-all cursor-pointer flex flex-col justify-between group"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-headline font-bold text-xs text-[#311309] truncate">{acc.name}</span>
                    <span className={`text-[8px] font-extrabold px-1 rounded ${acc.badgeColor}`}>
                      {acc.role.toUpperCase()}
                    </span>
                  </div>
                  <span className="text-[10px] text-gray-400 font-mono mt-1 group-hover:text-gray-700">
                    user: {acc.username}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
