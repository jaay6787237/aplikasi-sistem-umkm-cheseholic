/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { Header, NavTab } from './components/Header';
import { BottomNav } from './components/BottomNav';
import { CartModal } from './components/CartModal';
import { DirectOrderScreen } from './components/DirectOrderScreen';
import { MenuStorefrontScreen } from './components/MenuStorefrontScreen';
import { OutletsScreen } from './components/OutletsScreen';
import { AdminStaffPortal } from './components/AdminStaffPortal';
import { LoginModal } from './components/LoginModal';
import { ToastNotification, ToastItem } from './components/ToastNotification';
import { SyncStatusModal } from './components/SyncStatusModal';

import { CHEESEHOLIC_PRODUCTS, CHEESEHOLIC_OUTLETS } from './data/cheeseholicData';
import { calculateOrderTotals } from './utils/orderCalculator';
import { VariantStock, StockDispatchLog, dispatchStockTransfer } from './utils/inventoryManager';
import { DirectOrder, OrderStatus } from './utils/orderManager';
import { AuthUserSession } from './components/LoginScreen';
import { sounds } from './utils/soundEffects';
import {
  fetchRemoteSync,
  createRemoteOrder,
  updateRemoteOrderStatus,
  updateRemoteStock,
  createRemoteDispatch,
  updateRemoteCourierStatus,
  loadLocalCache,
  saveLocalCache,
  SyncStatus,
} from './services/apiSync';
import {
  subscribeToOrders,
  subscribeToInventory,
  subscribeToDispatches,
  saveOrderToFirestore,
  updateOrderStatusInFirestore,
  saveInventoryToFirestore,
  saveDispatchToFirestore,
  seedInitialFirestoreData,
} from './services/firebase';

export default function App() {
  // Navigation tab state: 'order' | 'menu' | 'cabang' | 'cart' | 'staff-portal'
  const [activeTab, setActiveTab] = useState<NavTab>('order');

  // Currently logged-in user account session
  const [currentSession, setCurrentSession] = useState<AuthUserSession | null>({
    username: 'outlet.kedaton',
    name: 'Outlet Kedaton',
    role: 'outlet',
    outletId: 'kedaton',
    badgeColor: 'bg-emerald-600 text-white',
    loggedInAt: '08:00 WIB',
  });

  // Load from local storage cache initially
  const initialCache = loadLocalCache();
  const [orders, setOrders] = useState<DirectOrder[]>(initialCache.orders);
  const [inventoryState, setInventoryState] = useState<Record<string, Record<string, VariantStock>>>(initialCache.inventory);
  const [dispatchLogs, setDispatchLogs] = useState<StockDispatchLog[]>(initialCache.dispatchLogs);

  // Sync state
  const [syncStatus, setSyncStatus] = useState<SyncStatus>('connected');
  const [lastSyncTime, setLastSyncTime] = useState<string>('Baru saja');
  const [isSyncModalOpen, setIsSyncModalOpen] = useState<boolean>(false);
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  // Customer cart state
  const [cart, setCart] = useState<Record<string, number>>({
    'lotus-biscoff': 2,
    'choco-cheese': 1,
  });

  const [selectedOutletId, setSelectedOutletId] = useState<string>('kedaton');
  const [isCartModalOpen, setIsCartModalOpen] = useState<boolean>(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState<boolean>(false);

  const prevOrderCountRef = useRef<number>(initialCache.orders.length);

  // Toast Helper
  const addToast = useCallback((title: string, message: string, type: ToastItem['type'] = 'info') => {
    const id = `${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    const now = new Date();
    const timestamp = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
    const newToast: ToastItem = { id, title, message, type, timestamp };

    setToasts((prev) => [newToast, ...prev.slice(0, 4)]);

    // Auto-dismiss after 4.5s
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4500);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  // Synchronize with backend database API
  const syncWithDatabase = useCallback(async (isManual = false) => {
    try {
      if (isManual) setSyncStatus('syncing');
      const remoteData = await fetchRemoteSync();

      if (remoteData) {
        setSyncStatus('connected');
        const now = new Date();
        setLastSyncTime(`${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')} WIB`);

        // Check if there are new orders that weren't here before
        if (remoteData.orders.length > prevOrderCountRef.current) {
          const newestOrder = remoteData.orders[0];
          if (newestOrder && currentSession?.outletId === newestOrder.outletId) {
            sounds.playOrderChime();
            addToast(
              `🔔 Pesanan Baru Masuk! (${newestOrder.id})`,
              `${newestOrder.customerName} memesan ${newestOrder.totalQty} box cheesecake di ${newestOrder.outletName}`,
              'order'
            );
          }
        }
        prevOrderCountRef.current = remoteData.orders.length;

        setOrders(remoteData.orders);
        setInventoryState(remoteData.inventory);
        setDispatchLogs(remoteData.dispatchLogs);
        saveLocalCache(remoteData);

        if (isManual) {
          addToast('Sinkronisasi Sukses', 'Semua data cabang, dapur, dan kurir telah disinkronkan.', 'success');
        }
      } else {
        setSyncStatus('offline');
      }
    } catch {
      setSyncStatus('offline');
    }
  }, [currentSession?.outletId, addToast]);

  // Firebase Firestore Real-time Subscriptions & Initial Seeding
  useEffect(() => {
    seedInitialFirestoreData();

    // Subscribe to real-time Orders
    const unsubOrders = subscribeToOrders((cloudOrders) => {
      if (cloudOrders && cloudOrders.length > 0) {
        setOrders(cloudOrders);
        setSyncStatus('connected');
      }
    });

    // Subscribe to real-time Inventory Matrix
    const unsubInv = subscribeToInventory((cloudInv) => {
      if (cloudInv && Object.keys(cloudInv).length > 0) {
        setInventoryState(cloudInv);
      }
    });

    // Subscribe to real-time Dispatch Logs
    const unsubDispatches = subscribeToDispatches((cloudDispatches) => {
      if (cloudDispatches && cloudDispatches.length > 0) {
        setDispatchLogs(cloudDispatches);
      }
    });

    return () => {
      unsubOrders();
      unsubInv();
      unsubDispatches();
    };
  }, []);

  // Polling loop: every 3.5s to keep all screens in real-time sync with API
  useEffect(() => {
    syncWithDatabase(false);
    const interval = setInterval(() => {
      syncWithDatabase(false);
    }, 3500);

    return () => clearInterval(interval);
  }, [syncWithDatabase]);

  // Handlers for Direct Orders & Stock Deduction
  const handleOrderCreated = async (newOrder: DirectOrder) => {
    sounds.playSuccess();
    setOrders((prev) => [newOrder, ...prev]);

    // Optimistically deduct local stock
    setInventoryState((prev) => {
      const copy = JSON.parse(JSON.stringify(prev));
      const outletStocks = copy[newOrder.outletId];
      if (outletStocks) {
        newOrder.items.forEach((item) => {
          if (outletStocks[item.productId]) {
            outletStocks[item.productId].stock = Math.max(0, outletStocks[item.productId].stock - item.qty);
          }
        });
      }
      return copy;
    });

    addToast(
      'Pesanan Berhasil Dibuat!',
      `Nomor Pesanan: ${newOrder.id} • Diteruskan ke Kasir ${newOrder.outletName}`,
      'success'
    );

    // Persist to Cloud Firestore Database
    saveOrderToFirestore(newOrder).catch((e) => console.warn('[Firestore] Order save:', e));

    // Persist to Server Database API
    const res = await createRemoteOrder(newOrder);
    if (res.success && res.inventory) {
      setInventoryState(res.inventory);
      if (res.inventory[newOrder.outletId]) {
        saveInventoryToFirestore(newOrder.outletId, res.inventory[newOrder.outletId]).catch((e) =>
          console.warn('[Firestore] Inv sync:', e)
        );
      }
    }
  };

  const handleUpdateOrderStatus = async (orderId: string, newStatus: OrderStatus) => {
    sounds.playPop();
    setOrders((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o))
    );

    addToast('Status Diperbarui', `Pesanan ${orderId} diubah menjadi "${newStatus}"`, 'info');
    // Persist to Cloud Firestore & Server API
    updateOrderStatusInFirestore(orderId, newStatus).catch((e) => console.warn('[Firestore] Order status:', e));
    await updateRemoteOrderStatus(orderId, newStatus);
  };

  // Handlers for Stock Adjustments & Dispatches
  const handleUpdateStock = async (outletId: string, productId: string, newStock: number) => {
    sounds.playPop();
    let updatedOutletStocks: Record<string, VariantStock> | null = null;
    setInventoryState((prev) => {
      const copy = JSON.parse(JSON.stringify(prev));
      if (copy[outletId] && copy[outletId][productId]) {
        copy[outletId][productId].stock = newStock;
        updatedOutletStocks = copy[outletId];
      }
      return copy;
    });

    addToast('Stok Diperbarui', `Stok ${productId} diubah menjadi ${newStock} box`, 'sync');
    if (updatedOutletStocks) {
      saveInventoryToFirestore(outletId, updatedOutletStocks).catch((e) =>
        console.warn('[Firestore] Stock save:', e)
      );
    }
    await updateRemoteStock(outletId, productId, newStock);
  };

  const handleAddDispatchLog = async (newLog: StockDispatchLog) => {
    sounds.playSuccess();
    setDispatchLogs((prev) => [newLog, ...prev]);

    if (newLog.status === 'Selesai & Diterima') {
      const res = dispatchStockTransfer(inventoryState, newLog);
      if (res.success) {
        setInventoryState(res.updatedStocks);
        if (res.updatedStocks[newLog.targetOutletId]) {
          saveInventoryToFirestore(newLog.targetOutletId, res.updatedStocks[newLog.targetOutletId]).catch((e) =>
            console.warn('[Firestore] Stock dispatch:', e)
          );
        }
      }
    }

    addToast(
      'Pengiriman Dapur Dicatat',
      `+${newLog.quantity} Box ${newLog.productName} siap diantar kurir ke ${newLog.targetOutletName}`,
      'order'
    );

    // Persist to Cloud Firestore & Server API
    saveDispatchToFirestore(newLog).catch((e) => console.warn('[Firestore] Dispatch log:', e));
    await createRemoteDispatch(newLog);
  };

  const handleUpdateCourierStatus = async (
    logId: string,
    newStatus: 'Disiapkan' | 'Dalam Perjalanan' | 'Selesai & Diterima'
  ) => {
    sounds.playSuccess();
    let targetUpdatedLog: StockDispatchLog | null = null;
    let targetUpdatedStocks: Record<string, Record<string, VariantStock>> | null = null;

    setDispatchLogs((prev) =>
      prev.map((log) => {
        if (log.id === logId) {
          const updatedLog = { ...log, status: newStatus };
          targetUpdatedLog = updatedLog;
          if (newStatus === 'Selesai & Diterima' && log.status !== 'Selesai & Diterima') {
            const res = dispatchStockTransfer(inventoryState, updatedLog);
            if (res.success) {
              setInventoryState(res.updatedStocks);
              targetUpdatedStocks = res.updatedStocks;
            }
          }
          return updatedLog;
        }
        return log;
      })
    );

    addToast(
      'Status Kurir Terupdate',
      `Pengiriman #${logId} sekarang: "${newStatus}"`,
      newStatus === 'Selesai & Diterima' ? 'success' : 'info'
    );

    if (targetUpdatedLog) {
      saveDispatchToFirestore(targetUpdatedLog).catch((e) => console.warn('[Firestore] Courier update:', e));
    }
    if (targetUpdatedStocks && targetUpdatedLog) {
      const outletId = (targetUpdatedLog as StockDispatchLog).targetOutletId;
      if (targetUpdatedStocks[outletId]) {
        saveInventoryToFirestore(outletId, targetUpdatedStocks[outletId]).catch((e) =>
          console.warn('[Firestore] Stock delivery update:', e)
        );
      }
    }

    await updateRemoteCourierStatus(logId, newStatus);
  };

  // Cart operations
  const updateQty = (productId: string, delta: number) => {
    sounds.playPop();
    setCart((prev) => {
      const current = prev[productId] || 0;
      const next = current + delta;
      const copy = { ...prev };
      if (next <= 0) {
        delete copy[productId];
      } else {
        copy[productId] = next;
      }
      return copy;
    });
  };

  const setCartDirect = (newCart: Record<string, number>) => {
    setCart(newCart);
  };

  const clearCart = () => {
    setCart({});
  };

  const totals = calculateOrderTotals(cart, CHEESEHOLIC_PRODUCTS);

  const handleTabChange = (tab: NavTab) => {
    sounds.playPop();
    if (tab === 'cart') {
      setIsCartModalOpen(true);
    } else {
      setActiveTab(tab);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const currentOutlet = CHEESEHOLIC_OUTLETS.find(
    (o) => o.id === (currentSession?.outletId || selectedOutletId)
  ) || CHEESEHOLIC_OUTLETS[0];

  const unreadOrdersForOutlet = orders.filter(
    (o) => o.outletId === currentOutlet.id && o.status === 'Baru'
  ).length;

  return (
    <div className="min-h-screen bg-[#FFF8F6] font-body text-[#311309] flex flex-col antialiased">
      {/* Floating Micro-interaction Toasts */}
      <ToastNotification toasts={toasts} onDismiss={removeToast} />

      {/* Top Fixed Header */}
      <Header
        cartCount={totals.totalQty}
        activeTab={activeTab}
        setActiveTab={handleTabChange}
        openCartModal={() => setIsCartModalOpen(true)}
        openLoginModal={() => setIsLoginModalOpen(true)}
        openSyncModal={() => setIsSyncModalOpen(true)}
        currentUser={currentSession}
        newOrdersCount={unreadOrdersForOutlet}
        syncStatus={syncStatus}
      />

      {/* Main Content Area */}
      <main className="flex-1 w-full pt-20">
        {activeTab === 'order' && (
          <DirectOrderScreen
            products={CHEESEHOLIC_PRODUCTS}
            outlets={CHEESEHOLIC_OUTLETS}
            cart={cart}
            updateQty={updateQty}
            setCartDirect={setCartDirect}
            clearCart={clearCart}
            selectedOutletId={selectedOutletId}
            setSelectedOutletId={setSelectedOutletId}
            inventoryState={inventoryState}
            onOrderCreated={handleOrderCreated}
          />
        )}

        {activeTab === 'menu' && (
          <MenuStorefrontScreen
            products={CHEESEHOLIC_PRODUCTS}
            outlets={CHEESEHOLIC_OUTLETS}
            cart={cart}
            updateQty={updateQty}
            onGoToDirectOrder={() => setActiveTab('order')}
            onGoToCabang={() => setActiveTab('cabang')}
          />
        )}

        {activeTab === 'cabang' && (
          <OutletsScreen
            outlets={CHEESEHOLIC_OUTLETS}
            onSelectOutletForOrder={(outletId) => {
              sounds.playPop();
              setSelectedOutletId(outletId);
              setActiveTab('order');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          />
        )}

        {activeTab === 'staff-portal' && (
          <AdminStaffPortal
            products={CHEESEHOLIC_PRODUCTS}
            outlets={CHEESEHOLIC_OUTLETS}
            currentSession={currentSession}
            onLoginSuccess={(session) => {
              sounds.playSuccess();
              setCurrentSession(session);
              addToast('Login Berhasil', `Selamat datang di terminal ${session.name}`, 'success');
            }}
            onLogout={() => {
              sounds.playPop();
              setCurrentSession(null);
              addToast('Logout', 'Anda telah keluar dari akun kasir.', 'info');
            }}
            openLoginModal={() => setIsLoginModalOpen(true)}
            orders={orders}
            onUpdateOrderStatus={handleUpdateOrderStatus}
            inventoryState={inventoryState}
            onUpdateStock={handleUpdateStock}
            dispatchLogs={dispatchLogs}
            onAddDispatchLog={handleAddDispatchLog}
            onUpdateCourierStatus={handleUpdateCourierStatus}
            onNavigateToTab={(tab) => handleTabChange(tab as NavTab)}
          />
        )}
      </main>

      {/* Floating Quick-Cart Drawer when on Menu or Cabang screen */}
      {(activeTab === 'menu' || activeTab === 'cabang') && totals.totalQty > 0 && (
        <div className="fixed bottom-20 inset-x-4 max-w-lg mx-auto z-40 bg-[#311309] text-white p-3 rounded-2xl shadow-xl flex items-center justify-between border border-[#FFC700]/30 animate-in slide-in-from-bottom duration-300">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#FFC700] text-[#311309] flex items-center justify-center font-bold">
              <span className="material-symbols-outlined text-xl">shopping_bag</span>
            </div>
            <div className="flex flex-col">
              <span className="font-headline font-bold text-xs sm:text-sm text-[#FFC700]">
                {totals.totalQty} Box Dipilih
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                sounds.playPop();
                setIsCartModalOpen(true);
              }}
              className="py-1.5 px-3 bg-white/10 hover:bg-white/20 text-white rounded-xl font-headline text-xs font-bold transition-colors cursor-pointer"
            >
              Rincian
            </button>
            <button
              onClick={() => {
                sounds.playPop();
                setActiveTab('order');
              }}
              className="py-1.5 px-3.5 bg-[#FFC700] hover:bg-[#FFA800] text-[#311309] rounded-xl font-headline text-xs font-extrabold flex items-center gap-1 shadow-sm active:scale-95 transition-all cursor-pointer"
            >
              <span>Pesan Direct</span>
              <span className="material-symbols-outlined text-sm">arrow_forward</span>
            </button>
          </div>
        </div>
      )}

      {/* Cart Modal Drawer */}
      <CartModal
        isOpen={isCartModalOpen}
        onClose={() => setIsCartModalOpen(false)}
        cart={cart}
        products={CHEESEHOLIC_PRODUCTS}
        outlets={CHEESEHOLIC_OUTLETS}
        selectedOutletId={selectedOutletId}
        setSelectedOutletId={setSelectedOutletId}
        updateQty={updateQty}
        clearCart={clearCart}
        onProceedToDirectOrder={() => setActiveTab('order')}
      />

      {/* Login Modal Drawer */}
      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
        currentSession={currentSession}
        onLoginSuccess={(session) => {
          sounds.playSuccess();
          setCurrentSession(session);
          addToast('Login Berhasil', `Selamat datang ${session.name}`, 'success');
        }}
        onLogout={() => {
          sounds.playPop();
          setCurrentSession(null);
          addToast('Logout', 'Anda telah keluar dari sesi.', 'info');
        }}
        onNavigateToTab={(tab) => handleTabChange(tab as NavTab)}
      />

      {/* Sync Status & API Key Modal */}
      <SyncStatusModal
        isOpen={isSyncModalOpen}
        onClose={() => setIsSyncModalOpen(false)}
        syncStatus={syncStatus}
        lastSyncTime={lastSyncTime}
        totalOrders={orders.length}
        totalDispatches={dispatchLogs.length}
        onManualSync={() => syncWithDatabase(true)}
      />

      {/* Mobile Bottom Navigation */}
      <BottomNav
        activeTab={activeTab}
        setActiveTab={handleTabChange}
        cartCount={totals.totalQty}
        currentUser={currentSession}
        newOrdersCount={unreadOrdersForOutlet}
        openLoginModal={() => setIsLoginModalOpen(true)}
      />
    </div>
  );
}
