import React, { useState } from 'react';
import { AuthUserSession } from './LoginScreen';
import { sounds } from '../utils/soundEffects';

export type NavTab =
  | 'menu'
  | 'cabang'
  | 'order'
  | 'cart'
  | 'staff-portal';

interface HeaderProps {
  cartCount: number;
  activeTab: NavTab;
  setActiveTab: (tab: NavTab) => void;
  openCartModal: () => void;
  openLoginModal: () => void;
  openSyncModal: () => void;
  currentUser: AuthUserSession | null;
  newOrdersCount: number;
  syncStatus: 'connected' | 'syncing' | 'offline' | 'error';
}

export const Header: React.FC<HeaderProps> = ({
  cartCount,
  activeTab,
  setActiveTab,
  openCartModal,
  openLoginModal,
  openSyncModal,
  currentUser,
  newOrdersCount,
  syncStatus,
}) => {
  const [audioActive, setAudioActive] = useState(sounds.isEnabled());

  const toggleSound = () => {
    const next = !audioActive;
    sounds.setSoundEnabled(next);
    setAudioActive(next);
    if (next) sounds.playPop();
  };

  const handleNavClick = (tab: NavTab) => {
    sounds.playPop();
    setActiveTab(tab);
  };

  return (
    <header className="fixed top-0 w-full z-50 pt-safe bg-[#FFC700] shadow-[0_1px_8px_rgba(0,0,0,0.06)] border-b border-[#E5A800]">
      <div className="max-w-7xl mx-auto h-16 px-3 sm:px-6 flex items-center justify-between gap-2">
        {/* Brand / Logo */}
        <button
          onClick={() => handleNavClick('order')}
          className="flex items-center gap-2 text-left focus:outline-none group cursor-pointer shrink-0"
        >
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-[#311309] flex items-center justify-center text-[#FFC700] shadow-[0_4px_12px_-2px_rgba(91,43,12,0.12)] group-hover:scale-105 transition-transform">
            <span className="material-symbols-outlined text-xl sm:text-2xl">cake</span>
          </div>
          <div className="flex flex-col">
            <span className="font-headline font-bold text-base sm:text-xl uppercase tracking-tight text-[#311309] leading-none">
              CHEESEHOLIC
            </span>
            <span className="font-headline text-[9px] sm:text-[10px] tracking-wider uppercase text-[#311309]/80 font-semibold">
              DIRECT ONLINE STORE
            </span>
          </div>
        </button>

        {/* Streamlined Desktop Nav Links */}
        <nav className="hidden lg:flex items-center gap-1.5 bg-[#E5A800]/40 p-1 rounded-full text-xs">
          <button
            onClick={() => handleNavClick('order')}
            className={`px-4 py-1.5 rounded-full font-bold font-headline transition-all cursor-pointer flex items-center gap-1.5 active:scale-95 ${
              activeTab === 'order'
                ? 'bg-[#311309] text-[#FFC700] shadow-xs'
                : 'text-[#311309] hover:bg-black/5'
            }`}
          >
            <span className="material-symbols-outlined text-base">shopping_cart_checkout</span>
            <span>Pesan Online</span>
          </button>

          <button
            onClick={() => handleNavClick('menu')}
            className={`px-4 py-1.5 rounded-full font-bold font-headline transition-all cursor-pointer active:scale-95 ${
              activeTab === 'menu'
                ? 'bg-[#8B4F2F] text-white shadow-xs'
                : 'text-[#311309] hover:bg-black/5'
            }`}
          >
            Katalog Menu (25K)
          </button>

          <button
            onClick={() => handleNavClick('cabang')}
            className={`px-4 py-1.5 rounded-full font-bold font-headline transition-all cursor-pointer active:scale-95 ${
              activeTab === 'cabang'
                ? 'bg-[#8B4F2F] text-white shadow-xs'
                : 'text-[#311309] hover:bg-black/5'
            }`}
          >
            5 Cabang Outlet
          </button>

          {/* Unified Admin & Staf Portal Button */}
          <button
            onClick={() => handleNavClick('staff-portal')}
            className={`px-4 py-1.5 rounded-full font-bold font-headline transition-all cursor-pointer flex items-center gap-1.5 relative active:scale-95 ${
              activeTab === 'staff-portal'
                ? 'bg-[#311309] text-[#FFC700] shadow-xs'
                : 'bg-white/90 hover:bg-white text-[#311309]'
            }`}
          >
            <span className="material-symbols-outlined text-base">admin_panel_settings</span>
            <span>{currentUser ? `Portal Admin/Staf (${currentUser.name})` : '🔑 Portal Admin & Staf'}</span>
            {newOrdersCount > 0 && (
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping" />
            )}
          </button>
        </nav>

        {/* Sound Toggle & Cart CTA */}
        <div className="flex items-center gap-2 sm:gap-2.5">

          {/* Sound Effect Toggle */}
          <button
            onClick={toggleSound}
            title={audioActive ? 'Efek suara aktif' : 'Efek suara dimatikan'}
            className={`w-8 h-8 rounded-full flex items-center justify-center transition-all cursor-pointer ${
              audioActive ? 'bg-white/90 text-[#311309]' : 'bg-white/40 text-gray-400'
            }`}
          >
            <span className="material-symbols-outlined text-base">
              {audioActive ? 'volume_up' : 'volume_off'}
            </span>
          </button>

          {/* Quick Login Button for Mobile */}
          <button
            onClick={() => {
              sounds.playPop();
              openLoginModal();
            }}
            className="lg:hidden py-1.5 px-3 bg-[#311309] text-[#FFC700] rounded-full text-xs font-headline font-extrabold flex items-center gap-1 shadow-xs cursor-pointer active:scale-95 transition-transform"
          >
            <span className="material-symbols-outlined text-sm">key</span>
            <span>Login Staf</span>
          </button>

          <button
            onClick={() => {
              sounds.playPop();
              openCartModal();
            }}
            className="relative w-11 h-11 rounded-full bg-white/95 flex items-center justify-center text-[#311309] shadow-[0_4px_12px_-2px_rgba(91,43,12,0.1)] hover:bg-white active:scale-95 transition-all cursor-pointer"
            aria-label={`Keranjang Belanja (${cartCount} item)`}
          >
            <span className="material-symbols-outlined text-xl text-[#8B4F2F]">shopping_bag</span>
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-[#964900] text-white font-headline text-xs px-1.5 py-0.5 rounded-full min-w-[20px] h-5 flex items-center justify-center text-center leading-none font-bold shadow-sm animate-bounce">
                {cartCount}
              </span>
            )}
          </button>
        </div>
      </div>
    </header>
  );
};
