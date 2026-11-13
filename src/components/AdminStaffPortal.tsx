/**
 * Unified Admin & Staff Portal
 * Strict Role-Based Access Control (RBAC):
 * - Outlet accounts ('outlet') can ONLY view their dedicated Terminal Kasir & Local Stock.
 *   Dapur, Admin Matrix, and Courier controls are hidden & locked out for outlet staff.
 * - Kitchen accounts ('kitchen') focus on Pusat Produksi batch baking & stock dispatch.
 * - Courier accounts ('courier') focus on delivery tracking.
 * - Executive Admin accounts ('admin') have full overview access across all modules.
 */

import { useState, useEffect } from 'react';
import { Product, Outlet } from '../utils/orderCalculator';
import { VariantStock, StockDispatchLog } from '../utils/inventoryManager';
import { DirectOrder, OrderStatus } from '../utils/orderManager';
import { AuthUserSession, LoginScreen } from './LoginScreen';
import { OutletTerminal } from './OutletTerminal';
import { KitchenProduction } from './KitchenProduction';
import { AdminDashboard } from './AdminDashboard';
import { CourierPortal } from './CourierPortal';

interface AdminStaffPortalProps {
  products: Product[];
  outlets: Outlet[];
  currentSession: AuthUserSession | null;
  onLoginSuccess: (session: AuthUserSession) => void;
  onLogout: () => void;
  openLoginModal: () => void;
  orders: DirectOrder[];
  onUpdateOrderStatus: (orderId: string, newStatus: OrderStatus) => void;
  inventoryState: Record<string, Record<string, VariantStock>>;
  onUpdateStock: (outletId: string, productId: string, newStock: number) => void;
  dispatchLogs: StockDispatchLog[];
  onAddDispatchLog: (newLog: StockDispatchLog) => void;
  onUpdateCourierStatus: (logId: string, newStatus: 'Disiapkan' | 'Dalam Perjalanan' | 'Selesai & Diterima') => void;
  onNavigateToTab: (tab: 'order' | 'menu' | 'cabang' | 'staff-portal') => void;
}

export type StaffSubTab = 'terminal' | 'kitchen' | 'matrix' | 'courier' | 'accounts';

export function AdminStaffPortal({
  products,
  outlets,
  currentSession,
  onLoginSuccess,
  onLogout,
  openLoginModal,
  orders,
  onUpdateOrderStatus,
  inventoryState,
  onUpdateStock,
  dispatchLogs,
  onAddDispatchLog,
  onUpdateCourierStatus,
  onNavigateToTab,
}: AdminStaffPortalProps) {
  // Determine default sub-tab based on logged-in role
  const getDefaultSubTab = (): StaffSubTab => {
    if (!currentSession) return 'accounts';
    if (currentSession.role === 'outlet') return 'terminal';
    if (currentSession.role === 'kitchen') return 'kitchen';
    if (currentSession.role === 'courier') return 'courier';
    return 'matrix';
  };

  const [activeSubTab, setActiveSubTab] = useState<StaffSubTab>(getDefaultSubTab());

  // Force reset active tab when session changes
  useEffect(() => {
    if (!currentSession) {
      setActiveSubTab('accounts');
    } else if (currentSession.role === 'outlet') {
      setActiveSubTab('terminal');
    } else if (currentSession.role === 'kitchen') {
      setActiveSubTab('kitchen');
    } else if (currentSession.role === 'courier') {
      setActiveSubTab('courier');
    }
  }, [currentSession]);

  // Current selected outlet for terminal
  const currentOutlet = outlets.find(
    (o) => o.id === (currentSession?.outletId || 'kedaton')
  ) || outlets[0];

  const unreadCount = orders.filter(
    (o) => o.outletId === currentOutlet.id && o.status === 'Baru'
  ).length;

  // Determine allowed tabs per role
  const isOutletStaff = currentSession?.role === 'outlet';
  const isKitchenStaff = currentSession?.role === 'kitchen';
  const isCourierStaff = currentSession?.role === 'courier';
  const isAdmin = currentSession?.role === 'admin';

  return (
    <div className="pb-28 max-w-7xl mx-auto px-3 sm:px-6 pt-2 animate-in fade-in duration-300">
      {/* Top Staff Header Status Bar */}
      <div className="bg-[#311309] text-white p-4 sm:p-5 rounded-3xl shadow-xl mb-5 border border-[#FFC700]/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-[#FFC700] text-[#311309] flex items-center justify-center font-black text-xl shadow-md shrink-0">
            <span className="material-symbols-outlined text-2xl">
              {isOutletStaff ? 'storefront' : isKitchenStaff ? 'soup_kitchen' : isAdmin ? 'admin_panel_settings' : 'lock'}
            </span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span
                className={`text-[10px] font-headline font-bold px-2 py-0.5 rounded-full uppercase ${
                  currentSession ? 'bg-emerald-500 text-white' : 'bg-rose-500 text-white'
                }`}
              >
                {isOutletStaff
                  ? `🟢 KASIR ${currentOutlet.name.toUpperCase()}`
                  : isKitchenStaff
                  ? '🟢 DAPUR UTAMA'
                  : isAdmin
                  ? '🟢 ADMIN PUSAT'
                  : '🔒 AKSES DIBATASI'}
              </span>
              {currentSession && (
                <span className="text-xs text-[#FFC700] font-mono">@{currentSession.username}</span>
              )}
            </div>
            <h1 className="font-headline font-extrabold text-base sm:text-lg text-white mt-0.5">
              {currentSession ? currentSession.name : 'Anda Belum Login - Silakan Pilih Akun'}
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {currentSession ? (
            <div className="flex items-center gap-2">
              <button
                onClick={openLoginModal}
                className="py-1.5 px-3 bg-white/10 hover:bg-white/20 text-[#FFC700] rounded-xl text-xs font-headline font-bold flex items-center gap-1 transition-colors cursor-pointer"
              >
                <span className="material-symbols-outlined text-sm">swap_horiz</span>
                <span>Ganti Akun</span>
              </button>
              <button
                onClick={onLogout}
                className="py-1.5 px-3 bg-rose-900/60 hover:bg-rose-900 text-rose-200 rounded-xl text-xs font-headline font-bold transition-colors cursor-pointer"
              >
                Logout
              </button>
            </div>
          ) : (
            <button
              onClick={openLoginModal}
              className="py-2 px-4 bg-[#FFC700] hover:bg-[#FFA800] text-[#311309] rounded-xl font-headline font-extrabold text-xs shadow-md cursor-pointer transition-transform active:scale-95"
            >
              🔑 Login Sekarang
            </button>
          )}
        </div>
      </div>

      {/* OUTLET STAFF ROLE FOCUSED VIEW NOTICE */}
      {isOutletStaff && (
        <div className="mb-5 p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-center justify-between gap-3 shadow-xs">
          <div className="flex items-center gap-2.5">
            <span className="material-symbols-outlined text-xl text-amber-700">security</span>
            <div>
              <span className="font-headline font-bold block">Mode Kasir Outlet Terkunci Sesuai Cabang</span>
              <p className="text-gray-600">
                Akun Anda berfokus penuh pada <b>{currentOutlet.name}</b> (Terminal Kasir &amp; Stok Lokal). Akses kontrol dapur dan admin pusat tidak ditampilkan.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Logged Out Access Lock Warning Alert */}
      {!currentSession && (
        <div className="mb-6 p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-900 flex items-start gap-3 shadow-xs">
          <span className="material-symbols-outlined text-2xl text-rose-600 shrink-0">lock</span>
          <div className="text-xs">
            <span className="font-bold text-sm block mb-0.5">Halaman Terkunci (Logged Out)</span>
            <p className="text-gray-600">
              Terminal Kasir Outlet, Pusat Produksi Dapur, dan Dashboard Admin ditutup untuk umum. Silakan pilih akun cabang di bawah untuk membuka halaman kerja.
            </p>
          </div>
        </div>
      )}

      {/* Sub-Navigation Tabs Bar (Only visible for Admin or when logged out/switching) */}
      {(isAdmin || !currentSession) && (
        <div className="bg-white p-2 rounded-2xl shadow-sm border border-gray-100 mb-6 flex items-center gap-1.5 overflow-x-auto no-scrollbar">
          {[
            { id: 'accounts', label: '🔑 Halaman Login', icon: 'key' },
            { id: 'terminal', label: 'Terminal Kasir Outlet', icon: currentSession ? 'storefront' : 'lock', badge: currentSession ? unreadCount : 0 },
            { id: 'kitchen', label: 'Pusat Produksi (Dapur)', icon: currentSession ? 'soup_kitchen' : 'lock' },
            { id: 'matrix', label: 'Matrix Stok & Admin', icon: currentSession ? 'analytics' : 'lock' },
            { id: 'courier', label: 'Armada Kurir', icon: currentSession ? 'local_shipping' : 'lock' },
          ].map((tab) => {
            const isLocked = !currentSession && tab.id !== 'accounts';
            return (
              <button
                key={tab.id}
                onClick={() => {
                  if (isLocked) {
                    alert('Silakan login terlebih dahulu!');
                    return;
                  }
                  setActiveSubTab(tab.id as StaffSubTab);
                }}
                className={`py-2.5 px-3.5 rounded-xl font-headline font-bold text-xs shrink-0 flex items-center gap-2 transition-all cursor-pointer ${
                  activeSubTab === tab.id
                    ? 'bg-[#311309] text-[#FFC700] shadow-md scale-[1.02]'
                    : isLocked
                    ? 'text-gray-400 hover:bg-gray-50 opacity-60'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}
              >
                <span className="material-symbols-outlined text-base">{tab.icon}</span>
                <span>{tab.label}</span>
                {tab.badge && tab.badge > 0 ? (
                  <span className="px-2 py-0.5 rounded-full text-[10px] bg-rose-500 text-white font-extrabold animate-bounce">
                    {tab.badge} BARU
                  </span>
                ) : null}
              </button>
            );
          })}
        </div>
      )}

      {/* Tab Content Display */}
      <div>
        {(!currentSession || activeSubTab === 'accounts') && (
          <LoginScreen
            outlets={outlets}
            currentSession={currentSession}
            onLoginSuccess={(session) => {
              onLoginSuccess(session);
              if (session.role === 'outlet') setActiveSubTab('terminal');
              else if (session.role === 'kitchen') setActiveSubTab('kitchen');
              else if (session.role === 'courier') setActiveSubTab('courier');
              else setActiveSubTab('matrix');
            }}
            onLogout={onLogout}
            onNavigateToTab={(tab) => {
              if (tab === 'outlet-terminal') setActiveSubTab('terminal');
              else if (tab === 'kitchen') setActiveSubTab('kitchen');
              else if (tab === 'courier') setActiveSubTab('courier');
              else if (tab === 'admin') setActiveSubTab('matrix');
              else onNavigateToTab('order');
            }}
          />
        )}

        {/* OUTLET STAFF ACCESS: STRICTLY TERMINAL & LOCAL STOCKS ONLY */}
        {currentSession && (isOutletStaff || (isAdmin && activeSubTab === 'terminal')) && (
          <OutletTerminal
            currentOutlet={currentOutlet}
            orders={orders}
            onUpdateOrderStatus={onUpdateOrderStatus}
            inventoryState={inventoryState}
            dispatchLogs={dispatchLogs}
            onUpdateCourierStatus={onUpdateCourierStatus}
            onGoToKitchen={() => {
              if (isOutletStaff) {
                alert('Akses Dapur Dibatasi untuk Staf Outlet Kasir!');
              } else {
                setActiveSubTab('kitchen');
              }
            }}
            onChangeOutletLogin={openLoginModal}
          />
        )}

        {/* KITCHEN STAFF ACCESS */}
        {currentSession && (isKitchenStaff || (isAdmin && activeSubTab === 'kitchen')) && (
          <KitchenProduction
            products={products}
            outlets={outlets}
            inventoryState={inventoryState}
            onAddDispatchLog={onAddDispatchLog}
            onGoToDashboard={() => setActiveSubTab('matrix')}
            onGoToCourier={() => setActiveSubTab('courier')}
          />
        )}

        {/* ADMIN MATRIX ACCESS */}
        {currentSession && isAdmin && activeSubTab === 'matrix' && (
          <AdminDashboard
            products={products}
            outlets={outlets}
            inventoryState={inventoryState}
            onUpdateStock={onUpdateStock}
            dispatchLogs={dispatchLogs}
            onGoToKitchen={() => setActiveSubTab('kitchen')}
            onGoToCourier={() => setActiveSubTab('courier')}
          />
        )}

        {/* COURIER ACCESS */}
        {currentSession && (isCourierStaff || (isAdmin && activeSubTab === 'courier')) && (
          <CourierPortal
            dispatchLogs={dispatchLogs}
            onUpdateStatus={onUpdateCourierStatus}
            onGoToDashboard={() => setActiveSubTab('matrix')}
            onGoToKitchen={() => setActiveSubTab('kitchen')}
          />
        )}
      </div>
    </div>
  );
}
