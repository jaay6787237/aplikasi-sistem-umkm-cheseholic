import React, { useState } from 'react';
import { Product, Outlet, formatRupiah } from '../utils/orderCalculator';
import { VariantStock, getStockStatusLevel, calculateOutletTotalStock, calculateLowStockAlertCount } from '../utils/inventoryManager';
import { StockDispatchLog } from '../utils/inventoryManager';

interface AdminDashboardProps {
  products: Product[];
  outlets: Outlet[];
  inventoryState: Record<string, Record<string, VariantStock>>;
  onUpdateStock: (outletId: string, productId: string, newStock: number) => void;
  dispatchLogs: StockDispatchLog[];
  onGoToKitchen: () => void;
  onGoToCourier: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  products,
  outlets,
  inventoryState,
  onUpdateStock,
  dispatchLogs,
  onGoToKitchen,
  onGoToCourier,
}) => {
  const [selectedOutletId, setSelectedOutletId] = useState<string>('all');
  const [stockFilter, setStockFilter] = useState<'all' | 'alert'>('all');

  // Compute overall stats
  let totalBoxesInAllOutlets = 0;
  let totalAlertItemsCount = 0;
  let totalOutStockItemsCount = 0;

  outlets.forEach((o) => {
    const stocks = inventoryState[o.id] || {};
    totalBoxesInAllOutlets += calculateOutletTotalStock(stocks);
    totalAlertItemsCount += calculateLowStockAlertCount(stocks);

    Object.values(stocks).forEach((v) => {
      if (v.stock === 0) totalOutStockItemsCount++;
    });
  });

  return (
    <div className="flex flex-col w-full pb-28 max-w-6xl mx-auto px-4 sm:px-6 space-y-6">
      {/* Header Banner */}
      <div className="bg-[#311309] text-white rounded-3xl p-5 sm:p-7 shadow-xl border border-[#FFC700]/30 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FFC700] text-[#311309] font-headline font-bold text-xs mb-2">
            <span className="material-symbols-outlined text-sm">analytics</span>
            <span>Dashboard Realtime Monitoring</span>
          </div>
          <h1 className="font-headline font-extrabold text-2xl sm:text-3xl text-[#FFC700] tracking-tight">
            Dashboard Management Stok Outlet
          </h1>
          <p className="font-body text-xs sm:text-sm text-white/80 mt-1 max-w-xl">
            Pantau ketersediaan varian cheesecake di 5 outlet Bandar Lampung secara real-time, beri penyesuaian stok, dan koordinasikan pengiriman dengan Tim Produksi Dapur &amp; Kurir.
          </p>
        </div>

        {/* Action Shortcuts */}
        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={onGoToKitchen}
            className="px-4 py-2.5 bg-[#8B4F2F] hover:bg-[#6E381A] text-white rounded-xl font-headline font-bold text-xs flex items-center gap-1.5 shadow-md active:scale-95 transition-all cursor-pointer"
          >
            <span className="material-symbols-outlined text-base">cookie</span>
            <span>Input Tim Produksi</span>
          </button>

          <button
            type="button"
            onClick={onGoToCourier}
            className="px-4 py-2.5 bg-[#25D366] hover:bg-[#20BD5A] text-white rounded-xl font-headline font-bold text-xs flex items-center gap-1.5 shadow-md active:scale-95 transition-all cursor-pointer"
          >
            <span className="material-symbols-outlined text-base">two_wheeler</span>
            <span>Portal Kurir &amp; Logistics</span>
          </button>
        </div>
      </div>

      {/* KPI METRICS STRIP */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
        {/* Metric 1 */}
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-[#D2C5AB]/40 flex flex-col justify-between">
          <div className="flex items-center justify-between text-[#4F4632]">
            <span className="font-headline font-bold text-xs uppercase">Total Stok Fisik</span>
            <span className="material-symbols-outlined text-[#8B4F2F]">inventory_2</span>
          </div>
          <div className="mt-2">
            <span className="font-headline font-extrabold text-2xl sm:text-3xl text-[#311309]">
              {totalBoxesInAllOutlets}
            </span>
            <span className="text-xs font-body text-[#4F4632] ml-1">Box Bar</span>
          </div>
          <span className="text-[11px] text-[#25D366] font-semibold mt-1 flex items-center gap-0.5">
            <span className="material-symbols-outlined text-xs">check_circle</span> Tersebar di 5 Outlet
          </span>
        </div>

        {/* Metric 2 */}
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-[#D2C5AB]/40 flex flex-col justify-between">
          <div className="flex items-center justify-between text-[#4F4632]">
            <span className="font-headline font-bold text-xs uppercase">Peringatan Stok Menipis</span>
            <span className="material-symbols-outlined text-[#964900]">warning</span>
          </div>
          <div className="mt-2">
            <span className="font-headline font-extrabold text-2xl sm:text-3xl text-[#964900]">
              {totalAlertItemsCount}
            </span>
            <span className="text-xs font-body text-[#4F4632] ml-1">Item Alert</span>
          </div>
          <span className="text-[11px] text-[#964900] font-semibold mt-1">
            Sisa &lt;= 5 box di outlet
          </span>
        </div>

        {/* Metric 3 */}
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-[#D2C5AB]/40 flex flex-col justify-between">
          <div className="flex items-center justify-between text-[#4F4632]">
            <span className="font-headline font-bold text-xs uppercase">Stok Habis (Kosong)</span>
            <span className="material-symbols-outlined text-[#BA1A1A]">cancel</span>
          </div>
          <div className="mt-2">
            <span className="font-headline font-extrabold text-2xl sm:text-3xl text-[#BA1A1A]">
              {totalOutStockItemsCount}
            </span>
            <span className="text-xs font-body text-[#4F4632] ml-1">Varian 0 Box</span>
          </div>
          <button
            type="button"
            onClick={onGoToKitchen}
            className="text-[11px] text-[#BA1A1A] font-bold hover:underline mt-1 text-left cursor-pointer"
          >
            + Minta Produksi Dapur
          </button>
        </div>

        {/* Metric 4 */}
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-[#D2C5AB]/40 flex flex-col justify-between">
          <div className="flex items-center justify-between text-[#4F4632]">
            <span className="font-headline font-bold text-xs uppercase">Status Pengiriman Kurir</span>
            <span className="material-symbols-outlined text-[#25D366]">local_shipping</span>
          </div>
          <div className="mt-2">
            <span className="font-headline font-extrabold text-2xl sm:text-3xl text-[#311309]">
              {dispatchLogs.filter((l) => l.status !== 'Selesai & Diterima').length}
            </span>
            <span className="text-xs font-body text-[#4F4632] ml-1">Restok Aktif</span>
          </div>
          <button
            type="button"
            onClick={onGoToCourier}
            className="text-[11px] text-[#25D366] font-bold hover:underline mt-1 text-left cursor-pointer"
          >
            Lihat Laporan Kurir &rarr;
          </button>
        </div>
      </div>

      {/* FILTER & SELECTOR STRIP */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-3.5 rounded-2xl border border-[#D2C5AB]/40 shadow-xs">
        <div className="flex items-center gap-2 overflow-x-auto">
          <span className="text-xs font-headline font-bold text-[#311309] shrink-0">
            Pilih Outlet:
          </span>
          <button
            type="button"
            onClick={() => setSelectedOutletId('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-headline font-bold transition-all shrink-0 cursor-pointer ${
              selectedOutletId === 'all'
                ? 'bg-[#FFC700] text-[#311309] shadow-xs'
                : 'bg-[#FFF1ED] text-[#4F4632] hover:bg-[#FFE9E3]'
            }`}
          >
            Semua Outlet (5)
          </button>
          {outlets.map((o) => (
            <button
              key={o.id}
              type="button"
              onClick={() => setSelectedOutletId(o.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-headline font-bold transition-all shrink-0 cursor-pointer ${
                selectedOutletId === o.id
                  ? 'bg-[#FFC700] text-[#311309] shadow-xs'
                  : 'bg-[#FFF1ED] text-[#4F4632] hover:bg-[#FFE9E3]'
              }`}
            >
              {o.name.replace('Outlet ', '')}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2 shrink-0 border-t sm:border-t-0 pt-2 sm:pt-0">
          <button
            type="button"
            onClick={() => setStockFilter(stockFilter === 'all' ? 'alert' : 'all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-headline font-bold transition-all flex items-center gap-1 cursor-pointer ${
              stockFilter === 'alert'
                ? 'bg-[#FFEDE8] text-[#BA1A1A] border border-[#BA1A1A]/40'
                : 'bg-[#FFF1ED] text-[#4F4632] border border-[#D2C5AB]/40'
            }`}
          >
            <span className="material-symbols-outlined text-sm">warning</span>
            <span>
              {stockFilter === 'alert' ? 'Menampilkan: Menipis/Habis' : 'Filter Stok Alert'}
            </span>
          </button>
        </div>
      </div>

      {/* STOCKS MATRIX TABLES / CARDS */}
      <div className="space-y-6">
        {outlets
          .filter((o) => selectedOutletId === 'all' || selectedOutletId === o.id)
          .map((outlet) => {
            const outletStocks = inventoryState[outlet.id] || {};
            const totalStock = calculateOutletTotalStock(outletStocks);
            const alertCount = calculateLowStockAlertCount(outletStocks);

            return (
              <div
                key={outlet.id}
                className="bg-white rounded-3xl p-5 shadow-sm border border-[#D2C5AB]/40 space-y-4"
              >
                {/* Outlet Title Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-[#D2C5AB]/30">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-[#8B4F2F] text-white font-headline font-bold text-sm flex items-center justify-center shrink-0">
                      {outlet.number}
                    </div>
                    <div>
                      <h3 className="font-headline font-bold text-base text-[#311309]">
                        {outlet.name}
                      </h3>
                      <span className="font-body text-xs text-[#4F4632]">
                        {outlet.location} ({outlet.hours})
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="px-3 py-1 rounded-full text-xs font-headline font-bold bg-[#FFF1ED] text-[#8B4F2F]">
                      Total: {totalStock} Box Available
                    </span>
                    {alertCount > 0 ? (
                      <span className="px-3 py-1 rounded-full text-xs font-headline font-bold bg-[#FFEDE8] text-[#BA1A1A] animate-pulse">
                        ⚠️ {alertCount} Varian Butuh Restok
                      </span>
                    ) : (
                      <span className="px-3 py-1 rounded-full text-xs font-headline font-bold bg-[#E7FFDB] text-[#25D366]">
                        ✅ Stok Aman
                      </span>
                    )}
                  </div>
                </div>

                {/* Grid of Variants Stock Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                  {products
                    .filter((product) => {
                      if (stockFilter === 'alert') {
                        const sItem = outletStocks[product.id];
                        if (!sItem) return false;
                        return getStockStatusLevel(sItem.stock, sItem.minAlertThreshold) !== 'Melimpah';
                      }
                      return true;
                    })
                    .map((product) => {
                      const stockItem = outletStocks[product.id] || {
                        productId: product.id,
                        stock: 0,
                        minAlertThreshold: 5,
                        maxCapacity: 30,
                      };

                      const level = getStockStatusLevel(stockItem.stock, stockItem.minAlertThreshold);

                      return (
                        <div
                          key={product.id}
                          className={`p-3 rounded-2xl border flex items-center justify-between gap-2 transition-all ${
                            level === 'Habis'
                              ? 'bg-[#FFEDE8]/90 border-[#BA1A1A]/40'
                              : level === 'Menipis'
                              ? 'bg-[#FFF8F6] border-[#964900]/30'
                              : 'bg-white border-[#D2C5AB]/30'
                          }`}
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <img
                              src={product.image}
                              alt={product.name}
                              className="w-10 h-10 rounded-lg object-cover bg-[#FFF1ED] shrink-0 shadow-xs"
                            />
                            <div className="min-w-0">
                              <span className="font-headline font-bold text-xs sm:text-sm text-[#311309] truncate block">
                                {product.name}
                              </span>
                              <div className="flex items-center gap-1 mt-0.5">
                                {level === 'Habis' ? (
                                  <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-[#BA1A1A] text-white">
                                    STOK KOSONG
                                  </span>
                                ) : level === 'Menipis' ? (
                                  <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-[#964900] text-white">
                                    MENIPIS ({stockItem.stock} Box)
                                  </span>
                                ) : (
                                  <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-[#25D366] text-white">
                                    READY ({stockItem.stock} Box)
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>

                          {/* Incrementor Buttons */}
                          <div className="flex items-center gap-1 shrink-0 bg-white p-1 rounded-full border border-black/10 shadow-xs">
                            <button
                              type="button"
                              onClick={() => onUpdateStock(outlet.id, product.id, Math.max(0, stockItem.stock - 1))}
                              className="w-6 h-6 rounded-full bg-[#FFF1ED] hover:bg-[#FFE9E3] text-[#311309] flex items-center justify-center text-xs font-bold active:scale-90 transition-transform cursor-pointer"
                              title="Kurangi stok"
                            >
                              -
                            </button>
                            <span className="font-headline font-bold text-xs w-5 text-center text-[#311309]">
                              {stockItem.stock}
                            </span>
                            <button
                              type="button"
                              onClick={() => onUpdateStock(outlet.id, product.id, stockItem.stock + 1)}
                              className="w-6 h-6 rounded-full bg-[#8B4F2F] text-white flex items-center justify-center text-xs font-bold active:scale-90 transition-transform cursor-pointer"
                              title="Tambah stok"
                            >
                              +
                            </button>
                          </div>
                        </div>
                      );
                    })}
                </div>
              </div>
            );
          })}
      </div>

      {/* DISPATCH LOGS HISTORY TABLE */}
      <div className="bg-white rounded-3xl p-5 shadow-sm border border-[#D2C5AB]/40 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[#8B4F2F] text-xl">history</span>
            <h3 className="font-headline font-bold text-base sm:text-lg text-[#311309]">
              Riwayat Pengiriman Stok Tim Produksi &amp; Kurir
            </h3>
          </div>
          <button
            type="button"
            onClick={onGoToKitchen}
            className="text-xs font-bold text-[#8B4F2F] hover:underline cursor-pointer"
          >
            + Kirim Stok Baru
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-body">
            <thead>
              <tr className="bg-[#FFF1ED] text-[#311309] font-headline font-bold border-b border-[#D2C5AB]/40">
                <th className="p-3">ID TRX</th>
                <th className="p-3">Waktu</th>
                <th className="p-3">Varian Kue</th>
                <th className="p-3">Jumlah</th>
                <th className="p-3">Tujuan Outlet</th>
                <th className="p-3">Kurir Pengirim</th>
                <th className="p-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#D2C5AB]/20">
              {dispatchLogs.map((log) => (
                <tr key={log.id} className="hover:bg-[#FFF8F6]">
                  <td className="p-3 font-headline font-bold text-[#8B4F2F]">{log.id}</td>
                  <td className="p-3 text-[#4F4632]">{log.timestamp}</td>
                  <td className="p-3 font-bold text-[#311309]">{log.productName}</td>
                  <td className="p-3 font-headline font-extrabold text-[#311309]">
                    {log.quantity} Box
                  </td>
                  <td className="p-3 font-semibold text-[#311309]">{log.targetOutletName}</td>
                  <td className="p-3 text-[#4F4632]">{log.courierName}</td>
                  <td className="p-3">
                    <span
                      className={`px-2.5 py-1 rounded-full text-[10px] font-headline font-bold ${
                        log.status === 'Selesai & Diterima'
                          ? 'bg-[#E7FFDB] text-[#25D366]'
                          : log.status === 'Dalam Perjalanan'
                          ? 'bg-[#FFC700] text-[#311309]'
                          : 'bg-[#FFE9E3] text-[#8B4F2F]'
                      }`}
                    >
                      {log.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
