/**
 * Outlet Terminal & Live Order Notification Page
 * Dedicated interface for branch outlet staff (Kedaton, Pahoman, UIN Sukarame, Korpri, Navara)
 * Features live audio/visual notification sound alerts when new orders arrive,
 * as well as explicit Stock Transfer Receipt Confirmation buttons when courier arrives with fresh stock.
 */

import { useState, useEffect } from 'react';
import { Outlet, formatRupiah } from '../utils/orderCalculator';
import { VariantStock, StockDispatchLog } from '../utils/inventoryManager';
import { DirectOrder, OrderStatus, playOrderNotificationSound } from '../utils/orderManager';

interface OutletTerminalProps {
  currentOutlet: Outlet;
  orders: DirectOrder[];
  onUpdateOrderStatus: (orderId: string, newStatus: OrderStatus) => void;
  inventoryState: Record<string, Record<string, VariantStock>>;
  dispatchLogs?: StockDispatchLog[];
  onUpdateCourierStatus?: (logId: string, newStatus: 'Disiapkan' | 'Dalam Perjalanan' | 'Selesai & Diterima') => void;
  onGoToKitchen: () => void;
  onChangeOutletLogin: () => void;
}

export function OutletTerminal({
  currentOutlet,
  orders,
  onUpdateOrderStatus,
  inventoryState,
  dispatchLogs = [],
  onUpdateCourierStatus,
  onGoToKitchen,
  onChangeOutletLogin,
}: OutletTerminalProps) {
  const [activeTab, setActiveTab] = useState<'all' | 'Baru' | 'Diproses' | 'Siap' | 'Selesai'>('Baru');
  const [isAudioEnabled, setIsAudioEnabled] = useState<boolean>(true);
  const [activeAlertOrder, setActiveAlertOrder] = useState<DirectOrder | null>(null);
  const [lastOrderCount, setLastOrderCount] = useState<number>(0);
  const [receiptSuccessMsg, setReceiptSuccessMsg] = useState<string | null>(null);

  // Filter orders belonging to this outlet
  const outletOrders = orders.filter((o) => o.outletId === currentOutlet.id);
  const newOrders = outletOrders.filter((o) => o.status === 'Baru');
  const processingOrders = outletOrders.filter((o) => o.status === 'Diproses');
  const readyOrders = outletOrders.filter((o) => o.status === 'Siap');
  const completedOrders = outletOrders.filter((o) => o.status === 'Selesai');

  // Filter incoming dispatches destined for this outlet that are pending delivery or in transit
  const incomingDispatches = dispatchLogs.filter(
    (log) => log.targetOutletId === currentOutlet.id && log.status !== 'Selesai & Diterima'
  );

  const completedDispatches = dispatchLogs.filter(
    (log) => log.targetOutletId === currentOutlet.id && log.status === 'Selesai & Diterima'
  );

  const filteredOrders = activeTab === 'all'
    ? outletOrders
    : outletOrders.filter((o) => o.status === activeTab);

  // Monitor incoming new orders to trigger audio chime & visual popup
  useEffect(() => {
    if (newOrders.length > lastOrderCount && lastOrderCount >= 0) {
      const latestOrder = newOrders[0];
      if (latestOrder) {
        setActiveAlertOrder(latestOrder);
        if (isAudioEnabled) {
          playOrderNotificationSound();
        }
      }
    }
    setLastOrderCount(newOrders.length);
  }, [newOrders.length, isAudioEnabled]);

  const handleTestChime = () => {
    playOrderNotificationSound();
  };

  const handleConfirmStockReceipt = (log: StockDispatchLog) => {
    if (onUpdateCourierStatus) {
      onUpdateCourierStatus(log.id, 'Selesai & Diterima');
      playOrderNotificationSound();
      setReceiptSuccessMsg(
        `Pasokan +${log.quantity} box ${log.productName} dari Kurir (${log.courierName}) BERHASIL DITERIMA! Stok ${currentOutlet.name} telah bertambah.`
      );
      setTimeout(() => setReceiptSuccessMsg(null), 6000);
    }
  };

  const outletStocks = inventoryState[currentOutlet.id] || {};

  return (
    <div className="pb-28 max-w-5xl mx-auto px-4 sm:px-6 pt-4 animate-in fade-in duration-300">
      {/* Outlet Terminal Header Card */}
      <div className="bg-[#311309] text-white p-5 sm:p-7 rounded-3xl shadow-xl mb-6 border border-[#FFC700]/30 relative overflow-hidden">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#FFC700] text-[#311309] rounded-full text-xs font-bold font-headline mb-2 shadow-sm">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-600 animate-ping" />
              <span>Outlet Live Terminal</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold font-headline text-white flex items-center gap-2">
              <span>{currentOutlet.name}</span>
            </h1>
            <p className="text-xs sm:text-sm text-gray-300 mt-1">
              📍 {currentOutlet.address} • Jam Ops: {currentOutlet.hours}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Audio Toggle Button */}
            <button
              onClick={() => setIsAudioEnabled(!isAudioEnabled)}
              className={`py-2 px-3.5 rounded-xl font-headline text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
                isAudioEnabled
                  ? 'bg-emerald-500 text-white shadow-md'
                  : 'bg-white/10 text-gray-300 hover:bg-white/20'
              }`}
            >
              <span className="material-symbols-outlined text-base">
                {isAudioEnabled ? 'notifications_active' : 'notifications_off'}
              </span>
              <span>Bel Notifikasi: {isAudioEnabled ? 'AKTIF' : 'MATI'}</span>
            </button>

            {/* Test Chime Button */}
            <button
              onClick={handleTestChime}
              title="Uji coba suara bel notifikasi"
              className="py-2 px-3 bg-white/10 hover:bg-white/20 text-[#FFC700] rounded-xl font-headline text-xs font-bold flex items-center gap-1 transition-colors cursor-pointer"
            >
              <span className="material-symbols-outlined text-base">volume_up</span>
              <span>Tes Bel</span>
            </button>

            {/* Switch Outlet Button */}
            <button
              onClick={onChangeOutletLogin}
              className="py-2 px-3 bg-white/10 hover:bg-white/20 text-white rounded-xl font-headline text-xs font-bold flex items-center gap-1 transition-colors cursor-pointer"
            >
              <span className="material-symbols-outlined text-base">swap_horiz</span>
              <span>Ganti Cabang</span>
            </button>
          </div>
        </div>
      </div>

      {/* Success Receipt Banner Toast */}
      {receiptSuccessMsg && (
        <div className="mb-6 p-4 rounded-2xl bg-emerald-600 text-white shadow-xl border-2 border-emerald-300 flex items-center gap-3 animate-in slide-in-from-top">
          <span className="w-10 h-10 rounded-xl bg-white text-emerald-700 flex items-center justify-center font-black text-xl shrink-0 shadow-md">
            ✓
          </span>
          <p className="text-xs sm:text-sm font-bold font-headline">{receiptSuccessMsg}</p>
        </div>
      )}

      {/* SECTION: INCOMING STOCK FROM COURIER / KITCHEN */}
      <div className="mb-6 bg-gradient-to-r from-blue-900 via-[#311309] to-blue-900 text-white p-5 rounded-3xl shadow-lg border border-blue-400/40">
        <div className="flex items-center justify-between mb-3 border-b border-white/10 pb-2.5">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[#FFC700] text-2xl">local_shipping</span>
            <div>
              <h2 className="font-headline font-extrabold text-base text-white">
                Pasokan Stok Masuk dari Kurir / Dapur Utama
              </h2>
              <p className="text-xs text-blue-200">
                Konfirmasi ketika kurir telah tiba di outlet {currentOutlet.name} membawa pasokan box
              </p>
            </div>
          </div>
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-[#FFC700] text-[#311309] font-headline">
            {incomingDispatches.length} Pengiriman Dalam Proses
          </span>
        </div>

        {incomingDispatches.length === 0 ? (
          <div className="p-4 bg-white/5 rounded-2xl text-center text-xs text-gray-300 border border-white/5">
            <span>Saat ini tidak ada kiriman stok yang sedang dalam perjalanan ke {currentOutlet.name}.</span>
          </div>
        ) : (
          <div className="space-y-3">
            {incomingDispatches.map((log, index) => (
              <div
                key={`${log.id}-${index}`}
                className="bg-white text-[#311309] p-4 rounded-2xl shadow-md border-2 border-[#FFC700] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-amber-500 text-white font-headline">
                      🚚 {log.status}
                    </span>
                    <span className="text-xs font-mono font-bold text-gray-500">Log #{log.id}</span>
                    <span className="text-xs text-gray-400">• {log.timestamp}</span>
                  </div>

                  <h3 className="font-headline font-black text-lg text-[#311309]">
                    +{log.quantity} Box {log.productName}
                  </h3>

                  <div className="text-xs text-gray-600 flex flex-wrap items-center gap-2">
                    <span>Pengirim: <b>{log.fromOutletOrKitchen}</b></span>
                    <span>• Kurir: <b>{log.courierName} ({log.courierPhone})</b></span>
                  </div>
                  {log.notes && (
                    <p className="text-[11px] text-amber-900 bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-200 inline-block mt-1">
                      📝 Catatan: {log.notes}
                    </p>
                  )}
                </div>

                {/* EXPLICIT RECEIPT BUTTON FOR OUTLET STAFF */}
                <button
                  type="button"
                  onClick={() => handleConfirmStockReceipt(log)}
                  className="w-full sm:w-auto py-3 px-5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl font-headline font-black text-xs sm:text-sm shadow-lg hover:shadow-xl active:scale-95 transition-all cursor-pointer flex items-center justify-center gap-2 shrink-0 border border-emerald-300"
                >
                  <span className="material-symbols-outlined text-xl">verified</span>
                  <span>Konfirmasi Pasokan Stok Sudah Diterima ✓</span>
                </button>
              </div>
            ))}
          </div>
        )}

        {completedDispatches.length > 0 && (
          <div className="mt-3 text-[11px] text-gray-300 flex items-center gap-1.5">
            <span className="material-symbols-outlined text-sm text-emerald-400">check_circle</span>
            <span>Riwayat: {completedDispatches.length} pasokan stok telah sukses diterima &amp; ditambahkan ke stok lokal {currentOutlet.name}.</span>
          </div>
        )}
      </div>

      {/* Prominent Banner Alert for New Incoming Customer Orders */}
      {newOrders.length > 0 && (
        <div className="mb-6 p-4 sm:p-5 rounded-3xl bg-gradient-to-r from-rose-500 via-amber-500 to-rose-600 text-white shadow-xl animate-pulse border-2 border-white flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-white text-rose-600 flex items-center justify-center font-extrabold text-2xl shadow-md shrink-0">
              🔔
            </div>
            <div>
              <span className="text-xs font-bold uppercase tracking-wider bg-white/20 px-2 py-0.5 rounded-full font-headline">
                PESANAN BARU MASUK DAFTAR TUNGGU
              </span>
              <h3 className="text-lg font-extrabold font-headline text-white mt-0.5">
                Ada {newOrders.length} Pesanan Baru Belum Diproses!
              </h3>
            </div>
          </div>
          <button
            onClick={() => {
              setActiveTab('Baru');
              if (newOrders[0]) setActiveAlertOrder(newOrders[0]);
            }}
            className="py-2.5 px-5 bg-white text-rose-700 hover:bg-amber-100 rounded-2xl font-headline font-extrabold text-xs sm:text-sm shadow-md transition-transform active:scale-95 cursor-pointer shrink-0"
          >
            Proses Pesanan Sekarang →
          </button>
        </div>
      )}

      {/* Order Status Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-3 mb-4 no-scrollbar">
        {[
          { id: 'Baru', label: 'Baru Masuk', count: newOrders.length, color: 'bg-rose-500 text-white' },
          { id: 'Diproses', label: 'Diproses', count: processingOrders.length, color: 'bg-amber-500 text-white' },
          { id: 'Siap', label: 'Siap Ambil/Kirim', count: readyOrders.length, color: 'bg-emerald-500 text-white' },
          { id: 'Selesai', label: 'Selesai', count: completedOrders.length, color: 'bg-gray-700 text-white' },
          { id: 'all', label: 'Semua Pesanan', count: outletOrders.length, color: 'bg-[#311309] text-white' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as typeof activeTab)}
            className={`py-2 px-4 rounded-2xl font-headline font-bold text-xs shrink-0 flex items-center gap-2 transition-all cursor-pointer ${
              activeTab === tab.id
                ? `${tab.color} shadow-md scale-[1.02]`
                : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
            }`}
          >
            <span>{tab.label}</span>
            <span className="px-2 py-0.5 rounded-full text-[10px] bg-black/20 font-extrabold">
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {/* Orders Feed */}
      <div className="space-y-4 mb-8">
        {filteredOrders.length === 0 ? (
          <div className="bg-white rounded-3xl p-10 text-center border border-gray-100 shadow-sm">
            <span className="material-symbols-outlined text-4xl text-gray-300 mb-2">inbox</span>
            <h3 className="font-headline font-bold text-[#311309] text-base">Tidak Ada Pesanan di Kategori Ini</h3>
            <p className="text-xs text-gray-500 mt-1">
              Pesanan pelanggan yang memilih cabang {currentOutlet.name} akan muncul secara realtime di sini.
            </p>
          </div>
        ) : (
          filteredOrders.map((order, index) => (
            <div
              key={`${order.id}-${index}`}
              className={`bg-white rounded-3xl p-5 shadow-sm border transition-all ${
                order.status === 'Baru'
                  ? 'border-rose-400 bg-rose-50/20 ring-2 ring-rose-300/40'
                  : order.status === 'Diproses'
                  ? 'border-amber-300 bg-amber-50/20'
                  : 'border-gray-200'
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-gray-100">
                <div className="flex items-center gap-3">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-headline font-extrabold ${
                      order.status === 'Baru'
                        ? 'bg-rose-500 text-white animate-bounce'
                        : order.status === 'Diproses'
                        ? 'bg-amber-500 text-white'
                        : order.status === 'Siap'
                        ? 'bg-emerald-500 text-white'
                        : 'bg-gray-700 text-white'
                    }`}
                  >
                    STATUS: {order.status.toUpperCase()}
                  </span>
                  <span className="font-headline font-extrabold text-[#311309] text-lg">{order.id}</span>
                  <span className="text-xs text-gray-400">• {order.createdAt}</span>
                </div>

                <div className="flex items-center gap-2">
                  <span
                    className={`text-xs font-bold px-2.5 py-1 rounded-lg ${
                      order.deliveryMode === 'delivery'
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-purple-100 text-purple-800'
                    }`}
                  >
                    {order.deliveryMode === 'delivery' ? '🛵 DELIVERY' : '🛍️ TAKEAWAY'}
                  </span>
                  <span className="text-xs font-bold px-2.5 py-1 rounded-lg bg-emerald-100 text-emerald-800">
                    💳 {order.paymentMethod}
                  </span>
                </div>
              </div>

              {/* Customer Details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 py-3 text-xs">
                <div>
                  <span className="text-gray-400 block font-medium">Pemesan:</span>
                  <span className="font-bold text-[#311309] text-sm">
                    {order.customerName} ({order.customerPhone})
                  </span>
                  {order.address && (
                    <p className="text-gray-600 mt-1 bg-gray-50 p-2 rounded-xl border border-gray-100">
                      📍 <b>Alamat:</b> {order.address}
                    </p>
                  )}
                  {order.notes && (
                    <p className="text-amber-800 mt-1 bg-amber-50 p-2 rounded-xl border border-amber-200">
                      📝 <b>Catatan:</b> {order.notes}
                    </p>
                  )}
                </div>

                <div>
                  <span className="text-gray-400 block font-medium">Item Pesanan ({order.totalQty} Box):</span>
                  <div className="space-y-1 mt-1 bg-gray-50 p-2.5 rounded-xl border border-gray-100">
                    {order.items.map((it) => (
                      <div key={it.productId} className="flex justify-between text-gray-700">
                        <span className="font-bold">
                          {it.qty}x {it.productName}
                        </span>
                        <span>{formatRupiah(it.subtotal)}</span>
                      </div>
                    ))}
                    <div className="pt-1.5 border-t border-gray-200 flex justify-between font-headline font-black text-[#311309] text-sm">
                      <span>Total Tagihan:</span>
                      <span className="text-[#311309]">{formatRupiah(order.totalPrice)}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Status Action Buttons for Staff */}
              <div className="pt-3 border-t border-gray-100 flex flex-wrap items-center justify-between gap-2">
                <a
                  href={`https://wa.me/${order.customerPhone.replace(/[^0-9]/g, '')}?text=Halo%20${encodeURIComponent(
                    order.customerName
                  )},%20pesanan%20Anda%20${order.id}%20di%20${encodeURIComponent(currentOutlet.name)}...`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="py-1.5 px-3 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 rounded-xl text-xs font-bold flex items-center gap-1 transition-colors"
                >
                  <span className="material-symbols-outlined text-sm">chat</span>
                  <span>Hubungi Pemesan WA</span>
                </a>

                <div className="flex items-center gap-2">
                  {order.status === 'Baru' && (
                    <button
                      onClick={() => onUpdateOrderStatus(order.id, 'Diproses')}
                      className="py-2 px-4 bg-amber-500 hover:bg-amber-600 text-white rounded-xl font-headline font-bold text-xs shadow-sm cursor-pointer transition-all active:scale-95"
                    >
                      Terima & Proses Pesanan →
                    </button>
                  )}

                  {order.status === 'Diproses' && (
                    <button
                      onClick={() => onUpdateOrderStatus(order.id, 'Siap')}
                      className="py-2 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-headline font-bold text-xs shadow-sm cursor-pointer transition-all active:scale-95"
                    >
                      Tandai Siap Diambil / Kirim →
                    </button>
                  )}

                  {order.status === 'Siap' && (
                    <button
                      onClick={() => onUpdateOrderStatus(order.id, 'Selesai')}
                      className="py-2 px-4 bg-[#311309] hover:bg-[#4a1d0f] text-[#FFC700] rounded-xl font-headline font-bold text-xs shadow-sm cursor-pointer transition-all active:scale-95"
                    >
                      Tandai Pesanan Selesai ✓
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Local Outlet Stock Quick View */}
      <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-gray-100">
          <div>
            <h2 className="text-lg font-bold font-headline text-[#311309]">Stok Real-time {currentOutlet.name}</h2>
            <p className="text-xs text-gray-500">Ketersediaan box cheesecake di kasir outlet ini</p>
          </div>
          <button
            onClick={onGoToKitchen}
            className="py-2 px-3.5 bg-[#FFC700] hover:bg-[#FFA800] text-[#311309] rounded-xl font-headline font-bold text-xs flex items-center gap-1 shadow-sm cursor-pointer transition-colors"
          >
            <span className="material-symbols-outlined text-base">soup_kitchen</span>
            <span>Minta Restok ke Dapur Utama</span>
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {Object.entries(outletStocks).map(([pKey, item]) => (
            <div
              key={pKey}
              className={`p-3 rounded-2xl border text-center ${
                item.stock <= 0
                  ? 'bg-rose-50 border-rose-200'
                  : item.stock <= 5
                  ? 'bg-amber-50 border-amber-200'
                  : 'bg-gray-50 border-gray-100'
              }`}
            >
              <span className="font-headline font-bold text-xs text-[#311309] block truncate">
                {item.productId}
              </span>
              <span className="text-xl font-extrabold font-headline text-[#311309] block my-0.5">
                {item.stock} <span className="text-xs font-normal text-gray-500">box</span>
              </span>
              <span
                className={`text-[10px] font-bold px-2 py-0.5 rounded-full inline-block ${
                  item.stock <= 0
                    ? 'bg-rose-600 text-white'
                    : item.stock <= 5
                    ? 'bg-amber-600 text-white'
                    : 'bg-emerald-600 text-white'
                }`}
              >
                {item.stock <= 0 ? 'HABIS' : item.stock <= 5 ? 'MENIPIS' : 'MELIMPAH'}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Interactive Sound Alert Modal Popup */}
      {activeAlertOrder && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 animate-in zoom-in-95 duration-200">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border-4 border-rose-500 text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto text-3xl font-extrabold animate-bounce">
              🔔
            </div>
            <div>
              <span className="px-3 py-1 bg-rose-600 text-white text-xs font-extrabold rounded-full uppercase tracking-wider font-headline">
                NOTIFIKASI BEL PESANAN BARU!
              </span>
              <h2 className="text-3xl font-black font-headline text-[#311309] mt-2">{activeAlertOrder.id}</h2>
              <p className="text-sm font-bold text-gray-700 mt-1">
                {activeAlertOrder.customerName} • {activeAlertOrder.totalQty} Box ({formatRupiah(activeAlertOrder.totalPrice)})
              </p>
            </div>

            <div className="p-3 bg-rose-50 rounded-2xl border border-rose-200 text-xs text-rose-900 space-y-1 text-left">
              <div className="flex justify-between font-bold">
                <span>Metode:</span>
                <span className="uppercase">{activeAlertOrder.deliveryMode}</span>
              </div>
              <div className="flex justify-between font-bold">
                <span>Pembayaran:</span>
                <span>{activeAlertOrder.paymentMethod}</span>
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                onClick={() => {
                  onUpdateOrderStatus(activeAlertOrder.id, 'Diproses');
                  setActiveAlertOrder(null);
                }}
                className="flex-1 py-3 bg-[#311309] text-[#FFC700] hover:bg-[#4a1d0f] font-headline font-extrabold rounded-2xl text-xs sm:text-sm shadow-md transition-colors cursor-pointer"
              >
                Terima &amp; Proses Pesanan
              </button>
              <button
                onClick={() => setActiveAlertOrder(null)}
                className="py-3 px-4 bg-gray-100 hover:bg-gray-200 text-gray-700 font-headline font-bold rounded-2xl text-xs cursor-pointer"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
