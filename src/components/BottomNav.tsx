import React from 'react';
import { NavTab } from './Header';
import { AuthUserSession } from './LoginScreen';

interface BottomNavProps {
  activeTab: NavTab;
  setActiveTab: (tab: NavTab) => void;
  cartCount: number;
  currentUser: AuthUserSession | null;
  newOrdersCount: number;
  openLoginModal: () => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  activeTab,
  setActiveTab,
  currentUser,
  newOrdersCount,
  openLoginModal,
}) => {
  return (
    <nav className="lg:hidden fixed bottom-0 w-full z-50 pb-safe bg-[#FFF8F6]/95 backdrop-blur-xl border-t border-[#D2C5AB]/40 shadow-[0_-2px_12px_rgba(0,0,0,0.06)]">
      <div className="grid grid-cols-5 items-center h-16 px-2 text-center">
        {/* Direct Order Tab */}
        <button
          onClick={() => setActiveTab('order')}
          className={`flex flex-col items-center justify-center min-h-[44px] gap-0.5 transition-colors cursor-pointer ${
            activeTab === 'order'
              ? 'text-[#311309] font-bold'
              : 'text-[#4F4632] hover:text-[#311309]'
          }`}
          aria-label="Pesan Direct Website"
        >
          <span className="material-symbols-outlined text-xl">shopping_cart_checkout</span>
          <span className="text-[10px] font-body">Pesan</span>
        </button>

        {/* Menu Tab */}
        <button
          onClick={() => setActiveTab('menu')}
          className={`flex flex-col items-center justify-center min-h-[44px] gap-0.5 transition-colors cursor-pointer ${
            activeTab === 'menu'
              ? 'text-[#964900] font-bold'
              : 'text-[#4F4632] hover:text-[#311309]'
          }`}
          aria-label="Katalog Menu"
        >
          <span className="material-symbols-outlined text-xl">bakery_dining</span>
          <span className="text-[10px] font-body">Menu</span>
        </button>

        {/* Cabang Tab */}
        <button
          onClick={() => setActiveTab('cabang')}
          className={`flex flex-col items-center justify-center min-h-[44px] gap-0.5 transition-colors cursor-pointer ${
            activeTab === 'cabang'
              ? 'text-[#964900] font-bold'
              : 'text-[#4F4632] hover:text-[#311309]'
          }`}
          aria-label="Cabang Outlet"
        >
          <span className="material-symbols-outlined text-xl">storefront</span>
          <span className="text-[10px] font-body">Cabang</span>
        </button>

        {/* Admin & Staf Unified Tab */}
        <button
          onClick={() => setActiveTab('staff-portal')}
          className={`flex flex-col items-center justify-center min-h-[44px] gap-0.5 transition-colors cursor-pointer relative ${
            activeTab === 'staff-portal'
              ? 'text-[#311309] font-extrabold'
              : 'text-[#4F4632] hover:text-[#311309]'
          }`}
          aria-label="Portal Admin & Staf"
        >
          <div className="relative">
            <span className="material-symbols-outlined text-xl">admin_panel_settings</span>
            {newOrdersCount > 0 && (
              <span className="absolute -top-1 -right-1.5 bg-rose-600 text-white font-extrabold text-[9px] w-4 h-4 rounded-full flex items-center justify-center">
                {newOrdersCount}
              </span>
            )}
          </div>
          <span className="text-[10px] font-body truncate max-w-full font-bold">
            Admin/Staf
          </span>
        </button>

        {/* Quick Login Button */}
        <button
          onClick={openLoginModal}
          className="flex flex-col items-center justify-center min-h-[44px] gap-0.5 text-rose-700 hover:text-rose-900 transition-colors cursor-pointer"
          aria-label="Menu Login"
        >
          <span className="material-symbols-outlined text-xl">key</span>
          <span className="text-[10px] font-body font-bold">
            {currentUser ? 'Akun' : 'Login'}
          </span>
        </button>
      </div>
    </nav>
  );
};
