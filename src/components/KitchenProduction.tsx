import React, { useState } from 'react';
import { Product, Outlet } from '../utils/orderCalculator';
import { VariantStock, StockDispatchLog, getStockStatusLevel } from '../utils/inventoryManager';
import { COURIER_OPTIONS } from '../data/initialInventory';

interface KitchenProductionProps {
  products: Product[];
  outlets: Outlet[];
  inventoryState: Record<string, Record<string, VariantStock>>;
  onAddDispatchLog: (log: StockDispatchLog) => void;
  onGoToDashboard: () => void;
  onGoToCourier: () => void;
}

export const KitchenProduction: React.FC<KitchenProductionProps> = ({
  products,
  outlets,
  inventoryState,
  onAddDispatchLog,
  onGoToDashboard,
  onGoToCourier,
}) => {
  const [targetOutletId, setTargetOutletId] = useState<string>(outlets[0].id);
  const [selectedProductId, setSelectedProductId] = useState<string>(products[0].id);
  const [batchQuantity, setBatchQuantity] = useState<number>(20);
  const [selectedCourierId, setSelectedCourierId] = useState<string>(COURIER_OPTIONS[0].id);
  const [kitchenNotes, setKitchenNotes] = useState<string>('Batch freshly baked siap kirim thermal box');
  const [formSuccessMessage, setFormSuccessMessage] = useState<string | null>(null);

  // Identify out-of-stock or low-stock items across all outlets for quick selection
  const criticalItemsList: Array<{
    outlet: Outlet;
    product: Product;
    stock: number;
    status: 'Habis' | 'Menipis';
  }> = [];

  outlets.forEach((outlet) => {
    const oStocks = inventoryState[outlet.id] || {};
    products.forEach((product) => {
      const vStock = oStocks[product.id] || { stock: 0, minAlertThreshold: 5 };
      const level = getStockStatusLevel(vStock.stock, vStock.minAlertThreshold);
      if (level !== 'Melimpah') {
        criticalItemsList.push({
          outlet,
          product,
          stock: vStock.stock,
          status: level as 'Habis' | 'Menipis',
        });
      }
    });
  });

  const handleQuickRestokSelect = (outletId: string, productId: string) => {
    setTargetOutletId(outletId);
    setSelectedProductId(productId);
    setBatchQuantity(20);
  };

  const handleSubmitDispatch = (e: React.FormEvent) => {
    e.preventDefault();
    if (batchQuantity <= 0) return;

    const targetOutlet = outlets.find((o) => o.id === targetOutletId) || outlets[0];
    const targetProduct = products.find((p) => p.id === selectedProductId) || products[0];
    const courierObj = COURIER_OPTIONS.find((c) => c.id === selectedCourierId) || COURIER_OPTIONS[0];

    const now = new Date();
    const timestampStr = `${now.toISOString().slice(0, 10)} ${now.toTimeString().slice(0, 5)}`;
    const newId = `TRX-${Math.floor(100 + Math.random() * 900)}`;

    const newLog: StockDispatchLog = {
      id: newId,
      timestamp: timestampStr,
      productName: targetProduct.name,
      quantity: batchQuantity,
      fromOutletOrKitchen: 'Dapur Utama Central Kedaton',
      targetOutletId: targetOutlet.id,
      targetOutletName: targetOutlet.name,
      courierName: courierObj.name,
      courierPhone: courierObj.phone,
      status: 'Disiapkan',
      notes: kitchenNotes,
    };

    onAddDispatchLog(newLog);

    setFormSuccessMessage(
      `Pengiriman ${batchQuantity} box ${targetProduct.name} ke ${targetOutlet.name} berhasil dijadwalkan!`
    );

    setTimeout(() => setFormSuccessMessage(null), 4000);
  };

  return (
    <div className="flex flex-col w-full pb-28 max-w-5xl mx-auto px-4 sm:px-6 space-y-6">
      {/* Top Banner */}
      <div className="bg-[#8B4F2F] text-white rounded-3xl p-5 sm:p-7 shadow-xl border border-[#FFC700]/30 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FFC700] text-[#311309] font-headline font-bold text-xs mb-2">
            <span className="material-symbols-outlined text-sm">cookie</span>
            <span>Halaman Tim Produksi Dapur</span>
          </div>
          <h1 className="font-headline font-extrabold text-2xl sm:text-3xl text-white tracking-tight">
            Input Hasil Produksi &amp; Kirim Stok Outlet
          </h1>
          <p className="font-body text-xs sm:text-sm text-white/90 mt-1 max-w-xl">
            Area kerja tim chef dapur untuk mencatat panggangan kue segar, memilih outlet tujuan yang membutuhkan stok, dan menugaskan kurir armada pengirim.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={onGoToDashboard}
            className="px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white rounded-xl font-headline font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <span className="material-symbols-outlined text-base">dashboard</span>
            <span>Monitoring Dashboard</span>
          </button>
          <button
            type="button"
            onClick={onGoToCourier}
            className="px-4 py-2.5 bg-[#25D366] hover:bg-[#20BD5A] text-white rounded-xl font-headline font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <span className="material-symbols-outlined text-base">two_wheeler</span>
            <span>Portal Kurir</span>
          </button>
        </div>
      </div>

      {/* CRITICAL STOCK ALERTS CAROUSEL / LIST FROM ALL OUTLETS */}
      <div className="bg-white rounded-3xl p-5 shadow-sm border border-[#D2C5AB]/40 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[#BA1A1A] text-xl">warning</span>
            <h2 className="font-headline font-bold text-base sm:text-lg text-[#311309]">
              Daftar Stok Habis / Menipis di Outlet ({criticalItemsList.length} Item)
            </h2>
          </div>
          <span className="text-xs font-body text-[#4F4632]">Klik item untuk isi otomatis</span>
        </div>

        {criticalItemsList.length === 0 ? (
          <div className="p-4 bg-[#E7FFDB] text-[#25D366] rounded-2xl text-xs font-headline font-bold flex items-center gap-2">
            <span className="material-symbols-outlined text-lg">check_circle</span>
            <span>Seluruh varian cheesecake di 5 outlet saat ini dalam kondisi melimpah!</span>
          </div>
        ) : (
          <div className="flex items-center gap-2 overflow-x-auto pb-2">
            {criticalItemsList.map((item, idx) => (
              <button
                key={`${item.outlet.id}-${item.product.id}-${idx}`}
                type="button"
                onClick={() => handleQuickRestokSelect(item.outlet.id, item.product.id)}
                className={`p-3 rounded-2xl border text-left shrink-0 min-w-[200px] transition-all cursor-pointer hover:scale-102 ${
                  item.status === 'Habis'
                    ? 'bg-[#FFEDE8] border-[#BA1A1A]/40 text-[#311309]'
                    : 'bg-[#FFF8F6] border-[#964900]/30 text-[#311309]'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-headline font-bold text-xs text-[#8B4F2F]">
                    {item.outlet.name.replace('Outlet ', '')}
                  </span>
                  <span
                    className={`px-1.5 py-0.2 rounded text-[9px] font-bold text-white ${
                      item.status === 'Habis' ? 'bg-[#BA1A1A]' : 'bg-[#964900]'
                    }`}
                  >
                    {item.status === 'Habis' ? 'KOSONG (0)' : `SISA ${item.stock}`}
                  </span>
                </div>

                <div className="font-headline font-bold text-sm text-[#311309] truncate">
                  {item.product.name}
                </div>

                <span className="text-[10px] text-[#4F4632] block mt-1 hover:underline">
                  + Klik untuk Restok 20 Box &rarr;
                </span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* FORM DISPATCH PROPRIETARY KITCHEN */}
      <div className="bg-white rounded-3xl p-6 shadow-sm border border-[#D2C5AB]/40 space-y-5">
        <div className="border-b border-[#D2C5AB]/30 pb-3">
          <h2 className="font-headline font-bold text-lg text-[#311309]">
            Formulir Pengiriman Batch Kue dari Dapur Utama
          </h2>
          <p className="font-body text-xs text-[#4F4632]">
            Isi rincian varian kue segar yang telah selesai dipanggang dan tentukan armada pengirimannya.
          </p>
        </div>

        {formSuccessMessage && (
          <div className="p-4 bg-[#E7FFDB] text-[#25D366] rounded-2xl text-xs font-headline font-bold flex items-center gap-2 animate-in fade-in duration-200">
            <span className="material-symbols-outlined text-xl">task_alt</span>
            <span>{formSuccessMessage}</span>
          </div>
        )}

        <form onSubmit={handleSubmitDispatch} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Target Outlet */}
            <div>
              <label className="font-body text-xs font-semibold text-[#311309] block mb-1">
                Cabang Outlet Tujuan Pengiriman
              </label>
              <select
                value={targetOutletId}
                onChange={(e) => setTargetOutletId(e.target.value)}
                className="w-full bg-[#FFF1ED] text-[#311309] font-headline font-bold text-xs sm:text-sm p-3 rounded-xl border border-[#D2C5AB]/40 focus:outline-none focus:ring-2 focus:ring-[#8B4F2F]"
              >
                {outlets.map((o) => (
                  <option key={o.id} value={o.id}>
                    {o.number}. {o.name} ({o.address.split(',')[0]})
                  </option>
                ))}
              </select>
            </div>

            {/* Cheesecake Variant */}
            <div>
              <label className="font-body text-xs font-semibold text-[#311309] block mb-1">
                Varian Rasa Cheesecake
              </label>
              <select
                value={selectedProductId}
                onChange={(e) => setSelectedProductId(e.target.value)}
                className="w-full bg-[#FFF1ED] text-[#311309] font-headline font-bold text-xs sm:text-sm p-3 rounded-xl border border-[#D2C5AB]/40 focus:outline-none focus:ring-2 focus:ring-[#8B4F2F]"
              >
                {products.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} (Rp 25.000/box)
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Quantity */}
            <div>
              <label className="font-body text-xs font-semibold text-[#311309] block mb-1">
                Jumlah Box Bar Yang Dikirims
              </label>
              <div className="flex items-center bg-[#FFF1ED] rounded-xl px-3 py-2 border border-[#D2C5AB]/40">
                <span className="material-symbols-outlined text-[#8B4F2F] text-lg mr-2">
                  inventory_2
                </span>
                <input
                  type="number"
                  min="1"
                  max="100"
                  value={batchQuantity}
                  onChange={(e) => setBatchQuantity(parseInt(e.target.value, 10) || 0)}
                  className="bg-transparent w-full text-sm font-headline font-bold outline-none text-[#311309]"
                />
                <span className="text-xs font-headline font-bold text-[#8B4F2F]">Box</span>
              </div>
            </div>

            {/* Courier Selection */}
            <div>
              <label className="font-body text-xs font-semibold text-[#311309] block mb-1">
                Opsi Kurir Pengantar / Logistics
              </label>
              <select
                value={selectedCourierId}
                onChange={(e) => setSelectedCourierId(e.target.value)}
                className="w-full bg-[#FFF1ED] text-[#311309] font-headline font-bold text-xs sm:text-sm p-3 rounded-xl border border-[#D2C5AB]/40 focus:outline-none focus:ring-2 focus:ring-[#8B4F2F]"
              >
                {COURIER_OPTIONS.map((c) => (
                  <option key={c.id} value={c.id}>
                    🛵 {c.name} - {c.vehicle}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="font-body text-xs font-semibold text-[#311309] block mb-1">
              Catatan Instruksi untuk Kurir / Outlet
            </label>
            <div className="flex items-center bg-[#FFF1ED] rounded-xl px-3 py-2 border border-[#D2C5AB]/40">
              <span className="material-symbols-outlined text-[#8B4F2F] text-lg mr-2">notes</span>
              <input
                type="text"
                value={kitchenNotes}
                onChange={(e) => setKitchenNotes(e.target.value)}
                placeholder="Contoh: Bawa thermal box &amp; gunakan es batu pendingin"
                className="bg-transparent w-full text-xs font-body outline-none text-[#311309]"
              />
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              className="w-full py-3.5 px-4 bg-[#8B4F2F] hover:bg-[#6E381A] text-white font-headline font-bold text-sm sm:text-base rounded-2xl shadow-md active:scale-95 transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              <span className="material-symbols-outlined text-xl">send</span>
              <span>Kirim Stok Ke Outlet Sekarang</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
